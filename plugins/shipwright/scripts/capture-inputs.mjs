#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir, lstat, realpath } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const snapshotDigest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const textDigest = value => createHash('sha256').update(value).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const kinds = new Set(['supplied', 'assumption', 'proposal', 'unknown']);
const origins = new Set(['supplied', 'proposed-requirement', 'implementation-evidence', 'unknown']);

export function validateSnapshot(snapshot) {
  const errors = [];
  if (!object(snapshot) || snapshot.version !== 1 || !text(snapshot.requestText)) return ['Snapshot needs version 1 and original requestText.'];
  if (!Array.isArray(snapshot.inputs) || !Array.isArray(snapshot.behaviors)) return ['Snapshot needs inputs and behaviors arrays.'];
  for (const group of ['inputs', 'behaviors']) {
    const seen = new Set();
    for (const row of snapshot[group]) {
      if (!object(row) || !text(row.id) || seen.has(row.id)) { errors.push(`${group} needs unique nonempty IDs.`); continue; }
      seen.add(row.id);
      if (group === 'inputs') {
        if (!kinds.has(row.kind) || !text(row.quote)) errors.push(`${row.id}: input needs kind and exact quote or missing-input description.`);
        if (row.kind === 'supplied' && (!text(row.quote) || !snapshot.requestText.includes(row.quote))) errors.push(`${row.id}: supplied quote is absent from original passages.`);
        if (row.kind === 'unknown' && row.value !== undefined && row.value !== null) errors.push(`${row.id}: unknown cannot carry a value.`);
        if (typeof row.value === 'number' && (!Number.isFinite(row.value) || !text(row.unit))) errors.push(`${row.id}: numeric value needs a finite number and unit.`);
      } else {
        const origin = row.provenance?.origin;
        if (!origins.has(origin)) errors.push(`${row.id}: behavior needs provenance.origin.`);
        if (origin === 'supplied' && (!text(row.sourceQuote) || !snapshot.requestText.includes(row.sourceQuote))) errors.push(`${row.id}: supplied behavior sourceQuote is absent from original passages.`);
        if (origin === 'proposed-requirement' && row.guaranteeStatus === 'implemented') errors.push(`${row.id}: a proposal cannot be implemented evidence.`);
      }
    }
  }
  return errors;
}

/** Read every revision, checking links rather than trusting a mutable latest pointer.
 * A writer who can replace the whole directory can replace this history. */
export async function loadSnapshot(directory) {
  const dir = path.resolve(directory);
  if ((await lstat(dir)).isSymbolicLink() || path.relative(await realpath(dir), dir) !== '') throw new Error('Snapshot directory must not traverse a symbolic link.');
  const entries = (await readdir(dir)).filter(name => /^snapshot-\d+\.json$/.test(name)).sort();
  if (!entries.length) throw new Error('No input snapshot found. Capture before drafting.');
  let previousSha256 = null, firstSha256 = null, latest;
  const revisions = [];
  for (const [index, name] of entries.entries()) {
    if (name !== `snapshot-${String(index + 1).padStart(4, '0')}.json`) throw new Error('Snapshot history has a missing or unexpected revision.');
    const file = path.join(dir, name);
    if (!(await lstat(file)).isFile() || (await lstat(file)).isSymbolicLink()) throw new Error('Snapshot revision must be a regular file.');
    latest = JSON.parse(await readFile(file, 'utf8'));
    const errors = validateSnapshot(latest);
    if (errors.length) throw new Error(errors.join('\n'));
    if (latest.revision !== index + 1 || latest.previousSha256 !== previousSha256 || latest.requestSha256 !== textDigest(latest.requestText)
      || !text(latest.reason) || !Number.isFinite(Date.parse(latest.createdAt))) throw new Error('Snapshot history or content identity changed.');
    previousSha256 = snapshotDigest(latest);
    firstSha256 ??= previousSha256;
    revisions.push({ revision: latest.revision, sha256: previousSha256, reason: latest.reason, createdAt: latest.createdAt });
  }
  return { snapshot: latest, snapshotSha256: previousSha256, rootSha256: firstSha256, revisions };
}

export async function captureInputs({ requestPath, recordPath, directory, artifactPath, reason, method = 'author-copy' }) {
  if (!['author-copy', 'supplied-file'].includes(method)) throw new Error('Capture method must be author-copy or supplied-file; neither authenticates the user message.');
  const dir = path.resolve(directory), artifact = path.resolve(artifactPath);
  let prior = null;
  try { await lstat(dir); prior = await loadSnapshot(dir); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!prior) {
    try { await lstat(artifact); throw new Error('Initial input capture must precede the designated draft. Do not delete a draft to claim ordering.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  } else {
    if (!text(reason)) throw new Error('A revision needs --reason; preserve the earlier capture.');
    if (path.relative(prior.snapshot.capture.designatedArtifact, artifact) !== '') throw new Error('A revision cannot change the designated artifact.');
  }
  const requestText = await readFile(requestPath, 'utf8');
  const extraction = JSON.parse(await readFile(recordPath, 'utf8'));
  if (extraction.requestText !== undefined && extraction.requestText !== requestText) throw new Error('Extraction requestText differs from the preserved request file.');
  const snapshot = {
    version: 1, revision: (prior?.snapshot.revision || 0) + 1, previousSha256: prior?.snapshotSha256 || null,
    createdAt: new Date().toISOString(), reason: reason || 'Initial capture before designated draft',
    requestText, requestSha256: textDigest(requestText),
    capture: { method, sourcePath: path.resolve(requestPath), designatedArtifact: artifact,
      initialArtifactAbsent: prior?.snapshot.capture?.initialArtifactAbsent ?? true,
      authenticity: 'unverified', limitations: 'Copied passages and author extraction are not native message authentication, completeness, truth or authorization. Other draft paths are not monitored.' },
    inputs: extraction.inputs, behaviors: extraction.behaviors ?? [],
  };
  const errors = validateSnapshot(snapshot);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!prior) await mkdir(dir, { recursive: true });
  if ((await lstat(dir)).isSymbolicLink() || path.relative(await realpath(dir), dir) !== '') throw new Error('Snapshot directory must not traverse a symbolic link.');
  const file = path.join(dir, `snapshot-${String(snapshot.revision).padStart(4, '0')}.json`);
  await writeFile(file, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
  const result = await loadSnapshot(dir);
  return { directory: dir, revision: snapshot.revision, snapshotSha256: result.snapshotSha256, rootSha256: result.rootSha256,
    capture: snapshot.capture, limitations: 'Revision hashes detect recorded history changes; they do not authenticate the original input or prevent replacement of the entire history by its owner.' };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help')) {
    console.log(`Preserve inputs before substantive drafting. No model or network calls.
Usage: node scripts/capture-inputs.mjs --request request.txt --record inputs.json --out input-history --artifact final.md [--method author-copy|supplied-file] [--reason "revision reason"]
inputs.json: {inputs:[{id,kind:"supplied|assumption|proposal|unknown",quote,value?,unit?,population?,period?,role?,studyDesign?}],behaviors:[]}
Supplied quotes must occur exactly in request.txt. Unknown inputs have no value. Keep assumptions and proposals distinct.
Canonical behaviors use typed behavior fields, provenance:{origin:"supplied|proposed-requirement|implementation-evidence|unknown"}, and sourceQuote for supplied behavior. They have no artifactQuotes before drafting.
Use the existing supplied request file when available; otherwise label a verbatim author-written copy as author-copy. Neither method authenticates the original user channel.
Initial capture refuses an existing designated draft. Revisions require a reason and retain linked earlier revisions. Do not overwrite or delete history to make an answer pass.
Use returned snapshotSha256 and rootSha256 as record.inputSnapshot. Reconcile with --snapshot input-history after drafting. Hashes establish recorded identity, not truthful extraction or approval.`);
    return 0;
  }
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--request', '--record', '--out', '--artifact', '--method', '--reason'].includes(argv[i]) || !argv[i + 1] || options[argv[i]]) throw new Error('Use --help for input capture arguments.');
    options[argv[i]] = argv[i + 1];
  }
  if (['--request', '--record', '--out', '--artifact'].some(k => !options[k])) throw new Error('Request, extraction record, output directory and designated artifact are required.');
  console.log(JSON.stringify(await captureInputs({ requestPath: options['--request'], recordPath: options['--record'], directory: options['--out'], artifactPath: options['--artifact'], reason: options['--reason'], method: options['--method'] }), null, 2));
  return 0;
}
function isDirectRun() { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } }
if (isDirectRun()) main().then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 1; });
