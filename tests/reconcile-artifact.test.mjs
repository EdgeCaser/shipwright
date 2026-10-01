import './helpers/isolate-outputs.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { reconcileArtifact, inventoryUnmappedText } from '../scripts/reconcile-artifact.mjs';
import { captureInputs, loadSnapshot } from '../scripts/capture-inputs.mjs';
import { buildPlugin, SOURCE_ROOT } from '../scripts/build-plugin.mjs';
import { installShipwright } from '../scripts/install.mjs';

const artifact = '# Decision\n40 of 200 eligible prospects purchased (20%).\n';
const record = () => ({
  version: 1, domains: ['inputs'], requestText: '40 bought. 200 saw the offer.',
  inputs: [
    { id: 'buyers', kind: 'supplied', quote: '40 bought', value: 40, unit: 'count', population: 'eligible prospects', period: { kind: 'window', value: 'pilot' }, role: 'purchasers', studyDesign: 'descriptive' },
    { id: 'exposed', kind: 'supplied', quote: '200 saw the offer', value: 200, unit: 'count', population: 'eligible prospects', period: { kind: 'window', value: 'pilot' }, role: 'eligible_exposures', studyDesign: 'descriptive' },
  ],
  calculations: [{ id: 'conversion', kind: 'ratio', metric: 'conversion_rate', refs: { numerator: 'buyers', denominator: 'exposed' }, result: 0.2, artifactQuotes: ['40 of 200 eligible prospects purchased (20%).'] }],
  review: { sourceSupport: 'Supplied counts only.', userFacts: 'Buyer and exposure roles retained.', consistency: 'Opening and calculation agree.', approval: 'No approval supplied.', unresolved: [] },
});
const has = (r, code) => r.issues.some(i => i.code === code);

test('positive calculation produces a consistency receipt without granting readiness or source truth', () => {
  const r = reconcileArtifact(artifact, record());
  assert.equal(r.errors, 0);
  assert.equal(r.recordConsistency, 'consistent');
  assert.equal(r.artifactSha256, createHash('sha256').update(artifact).digest('hex'));
  assert.equal(r.readiness, 'not-assessed');
  assert.equal(r.semanticStatus, 'requires-review');
});

test('final rewrite invalidates excerpt mapping and changes artifact hash', () => {
  const before = reconcileArtifact(artifact, record());
  const after = reconcileArtifact(artifact.replace('20%', '30%'), record());
  assert.ok(has(after, 'artifact-quote-mismatch'));
  assert.notEqual(before.artifactSha256, after.artifactSha256);
});

test('hidden comments and code blocks cannot stand in for visible final claims', () => {
  for (const text of [`# Decision\n<!-- ${artifact} -->`, `# Decision\n\x60\x60\x60\n${artifact}\x60\x60\x60`]) {
    assert.ok(has(reconcileArtifact(text, record()), 'artifact-quote-mismatch'));
  }
});

test('buyer counts cannot be relabeled as observed exposure without errors', () => {
  const r = record();
  r.inputs[1].role = 'purchasers';
  assert.ok(has(reconcileArtifact(artifact, r), 'ratio-role-mismatch'));
  r.inputs[0].quote = '50 bought';
  assert.ok(has(reconcileArtifact(artifact, r), 'input-quote-mismatch'));
});

test('explicit missing denominator retains useful conditional analysis and unresolved status', () => {
  const r = record();
  r.inputs[1] = { id: 'exposed', kind: 'unknown', quote: 'Eligible exposure count is missing.' };
  r.calculations = [{ id: 'gap', kind: 'unresolved', refs: { denominator: 'exposed' }, artifactQuotes: ['Collect exposure counts before estimating conversion.'] }];
  r.review.unresolved = ['Eligible exposure denominator is missing.'];
  const result = reconcileArtifact('Collect exposure counts before estimating conversion.', r);
  assert.equal(result.errors, 0);
  assert.equal(result.recordConsistency, 'unresolved');
});

test('empty domain, excluded records, malformed input and absent final review do not pass', () => {
  assert.ok(has(reconcileArtifact(artifact, { ...record(), calculations: [] }), 'empty-domain'));
  assert.ok(has(reconcileArtifact(artifact, { ...record(), domains: ['evidence'] }), 'unchecked-domain'));
  for (const r of [null, [], { ...record(), requestText: 5 }, { ...record(), calculations: [null] }, { ...record(), review: {} }]) {
    assert.ok(reconcileArtifact(artifact, r).errors > 0);
  }
});

test('version2 anchors final input records to pre-draft history and flags shared drift', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-history-bind-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const r = record(), request = path.join(dir, 'request.txt'), inputs = path.join(dir, 'inputs.json');
  await writeFile(request, r.requestText); await writeFile(inputs, JSON.stringify({ inputs: r.inputs, behaviors: [] }));
  const capture = await captureInputs({ requestPath: request, recordPath: inputs, directory: path.join(dir, 'history'), artifactPath: path.join(dir, 'final.md') });
  const context = await loadSnapshot(capture.directory);
  r.version = 2; r.inputSnapshot = { snapshotSha256: capture.snapshotSha256, rootSha256: capture.rootSha256 };
  delete r.requestText;
  assert.equal(reconcileArtifact(artifact, r, context).errors, 0);
  r.inputs[0].value = 80; r.calculations[0].result = 0.4; r.calculations[0].artifactQuotes = ['80 of 200 eligible prospects purchased (40%).'];
  assert.ok(has(reconcileArtifact('80 of 200 eligible prospects purchased (40%).', r, context), 'captured-input-drift'));
  r.requestText = '80 bought. 200 saw the offer.';
  assert.ok(has(reconcileArtifact(artifact, r, context), 'request-snapshot-mismatch'));
  r.inputSnapshot.rootSha256 = '0'.repeat(64);
  assert.ok(has(reconcileArtifact(artifact, r, context), 'snapshot-anchor-mismatch'));
  assert.ok(has(reconcileArtifact(artifact, r), 'missing-input-snapshot'));
});

test('coverage inventory surfaces unrecorded prose including opening claims without certifying mapped text', () => {
  const visible = '# Guaranteed immediate access\nEveryone is guaranteed immediate access.\n\n😀 Count is conditional. Extra unsupported guarantee.\nCount is conditional.\n';
  const r = { calculations: [{ artifactQuotes: ['Count is conditional.'] }] };
  const coverage = inventoryUnmappedText(visible, r);
  assert.equal(coverage.unmappedLineCount, 3);
  assert.match(coverage.unmappedLines[0].text, /Guaranteed immediate/);
  assert.match(coverage.unmappedLines[1].text, /Everyone/);
  assert.match(coverage.unmappedLines[2].text, /Extra unsupported/);
  assert.doesNotMatch(coverage.unmappedLines[2].text, /Count is conditional/);
  assert.match(coverage.meaning, /Mapped text may still/);
});

test('installed capture runs before drafting and final reconciliation binds its receipt', async t => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-installed-capture-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await installShipwright(dir, { apply: true });
  const r = record(), req = path.join(dir, 'request.txt'), extraction = path.join(dir, 'inputs.json'), draft = path.join(dir, 'final.md'), ledger = path.join(dir, 'record.json'), history = path.join(dir, 'history');
  await writeFile(req, r.requestText); await writeFile(extraction, JSON.stringify({ inputs: r.inputs, behaviors: [] }));
  const capture = JSON.parse(execFileSync(process.execPath, [path.join(dir, '.codex/scripts/capture-inputs.mjs'), '--request', req, '--record', extraction, '--out', history, '--artifact', draft], { encoding: 'utf8' }));
  await writeFile(draft, artifact);
  r.version = 2; r.inputSnapshot = { snapshotSha256: capture.snapshotSha256, rootSha256: capture.rootSha256 };
  await writeFile(ledger, JSON.stringify(r));
  const script = path.join(dir, '.codex/scripts/reconcile-artifact.mjs');
  const result = JSON.parse(execFileSync(process.execPath, [script, '--artifact', draft, '--record', ledger, '--snapshot', history], { encoding: 'utf8' }));
  assert.equal(result.errors, 0);
  assert.equal(result.inputSnapshot.snapshotSha256, capture.snapshotSha256);
  const destructive = spawnSync(process.execPath, [script, '--artifact', draft, '--record', ledger, '--snapshot', history, '--out', path.join(history, 'snapshot-0001.json')], { encoding: 'utf8' });
  assert.equal(destructive.status, 1);
  assert.match(destructive.stderr, /must not overwrite input history/);
  const other = path.join(dir, 'other.md'); await writeFile(other, artifact);
  const switched = spawnSync(process.execPath, [script, '--artifact', other, '--record', ledger, '--snapshot', history], { encoding: 'utf8' });
  assert.equal(switched.status, 1);
  assert.match(switched.stderr, /differs from the path designated/);
});

test('fresh bundle imports and installed reconciliation execute on a real draft', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shipwright-reconcile-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bundle = path.join(root, 'bundle');
  await buildPlugin(bundle);
  const project = path.join(root, 'project');
  await mkdir(project);
  await installShipwright(project, { apply: true });
  const file = path.join(project, 'final.md'), ledger = path.join(project, 'record.json'), receipt = path.join(project, 'receipt.json');
  await writeFile(file, artifact); await writeFile(ledger, JSON.stringify(record()));
  for (const host of ['.claude', '.codex']) {
    const script = path.join(project, host, 'scripts/reconcile-artifact.mjs');
    assert.deepEqual(await readFile(script), await readFile(path.join(SOURCE_ROOT, 'scripts/reconcile-artifact.mjs')));
    const output = execFileSync(process.execPath, [script, '--artifact', file, '--record', ledger, '--out', receipt], { encoding: 'utf8' });
    assert.equal(JSON.parse(output).recordConsistency, 'consistent');
    assert.equal(JSON.parse(await readFile(receipt, 'utf8')).artifactSha256, createHash('sha256').update(artifact).digest('hex'));
    const bad = spawnSync(process.execPath, [script, '--artifact', file, '--record', ledger, '--out', file], { encoding: 'utf8' });
    assert.equal(bad.status, 1);
    assert.equal(await readFile(file, 'utf8'), artifact);
  }
  const r = record(); r.calculations[0].result = 0.3; await writeFile(ledger, JSON.stringify(r));
  const bad = spawnSync(process.execPath, [path.join(bundle, 'scripts/reconcile-artifact.mjs'), '--artifact', file, '--record', ledger], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.ok(has(JSON.parse(bad.stdout), 'arithmetic-mismatch'));
});
