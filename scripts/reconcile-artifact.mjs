#!/usr/bin/env node
import { readFile, writeFile, realpath } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reconcileEvidence, evidenceHelp } from './reconcile-evidence.mjs';
import { reconcileInputs, inputHelp } from './reconcile-inputs.mjs';
import { reconcileBehavior, behaviorHelp } from './reconcile-behavior.mjs';
import { visibleMarkdown } from './markdown-scan.mjs';

const domains = { evidence: reconcileEvidence, inputs: reconcileInputs, behavior: reconcileBehavior };
const help = { evidence: evidenceHelp, inputs: inputHelp, behavior: behaviorHelp };
const groups = ['inputs', 'calculations', 'evidenceClaims', 'evidenceSources', 'behaviors', 'promises'];
const quotedGroups = ['calculations', 'evidenceClaims', 'behaviors', 'promises'];
const hash = text => createHash('sha256').update(text).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

/** Check declared records against each other and the final text. This does not infer
 * missing claims, establish entailment, authenticate evidence, or grant readiness. */
export function reconcileArtifact(artifact, record) {
  const issues = [];
  const visible = typeof artifact === 'string' ? visibleMarkdown(artifact) : '';
  const add = (code, id, message, severity = 'error') => issues.push({ code, id, severity, message });
  if (typeof artifact !== 'string' || !artifact.trim()) add('empty-artifact', 'artifact', 'A nonempty final artifact is required.');
  if (!object(record)) {
    add('invalid-record', 'record', 'The reconciliation record must be an object.');
    return result();
  }
  if (record.version !== 1) add('invalid-version', 'record', 'Expected reconciliation version 1.');
  if (!Array.isArray(record.domains) || !record.domains.length || record.domains.some(d => !Object.hasOwn(domains, d)) || new Set(record.domains).size !== record.domains.length) {
    add('invalid-domains', 'record', 'List the relevant domains once: evidence, inputs, behavior.');
  }
  for (const group of groups) {
    if (record[group] !== undefined && !Array.isArray(record[group])) add('invalid-array', group, `${group} must be an array.`);
  }
  const selected = Array.isArray(record.domains) ? record.domains.filter(d => Object.hasOwn(domains, d)) : [];
  const counts = name => Array.isArray(record[name]) ? record[name].length : 0;
  for (const domain of selected) {
    if (domain === 'evidence' && !counts('evidenceClaims')) add('empty-domain', domain, 'Evidence reconciliation requires material claim records, including unresolved claims.');
    if (domain === 'inputs' && (!counts('inputs') || !counts('calculations'))) add('empty-domain', domain, 'Input reconciliation requires canonical inputs and calculations or scoped/unresolved claims.');
    if (domain === 'behavior' && (!counts('behaviors') || !counts('promises'))) add('empty-domain', domain, 'Behavior reconciliation requires operative behaviors and linked promises.');
  }
  // Record-bearing domains cannot silently be excluded from checks.
  for (const [domain, names] of Object.entries({ evidence: ['evidenceSources', 'evidenceClaims'], inputs: ['calculations'], behavior: ['behaviors', 'promises'] })) {
    if (names.some(n => counts(n)) && !selected.includes(domain)) add('unchecked-domain', domain, `Records for ${domain} exist but that domain is not selected.`);
  }
  for (const group of quotedGroups) {
    if (!Array.isArray(record[group])) continue;
    for (const row of record[group]) {
      if (!object(row)) { add('invalid-row', group, `${group} contains a non-object.`); continue; }
      if (!Array.isArray(row.artifactQuotes) || !row.artifactQuotes.length || row.artifactQuotes.some(q => !nonempty(q))) {
        add('missing-artifact-quotes', row.id || group, 'Map this record to exact final artifact excerpts.');
        continue;
      }
      for (const quote of row.artifactQuotes) if (!visible.includes(quote)) add('artifact-quote-mismatch', row.id || group, `Visible final artifact does not contain recorded excerpt: ${quote.slice(0, 100)}`);
    }
  }
  if (!nonempty(record.requestText)) add('missing-request-text', 'record', 'Preserve the supplied request or relevant input passage in requestText.');
  if (Array.isArray(record.inputs)) for (const input of record.inputs) {
    if (object(input) && input.kind === 'supplied' && (!nonempty(input.quote) || typeof record.requestText !== 'string' || !record.requestText.includes(input.quote))) add('input-quote-mismatch', input.id || 'inputs', 'A supplied input quote must occur verbatim in requestText.');
  }
  for (const domain of new Set(selected)) {
    // Module checks are intentionally pure and never execute embedded instructions.
    issues.push(...domains[domain](record));
  }
  if (!object(record.review) || ['sourceSupport', 'userFacts', 'consistency', 'approval'].some(k => !nonempty(record.review[k])) || !Array.isArray(record.review.unresolved) || record.review.unresolved.some(x => !nonempty(x))) {
    add('missing-semantic-review', 'review', 'Record separate final observations for sourceSupport, userFacts, consistency, approval and unresolved (array). These are author judgments, not machine certification.');
  } else if (record.review.unresolved.length) {
    add('declared-unresolved', 'review', record.review.unresolved.join('; '), 'warning');
  }
  return result();

  function result() {
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    return {
      version: 1,
      artifactSha256: typeof artifact === 'string' ? hash(artifact) : null,
      recordSha256: record === undefined ? null : hash(JSON.stringify(record)),
      recordConsistency: errors ? 'inconsistent' : warnings ? 'unresolved' : 'consistent',
      errors, warnings, issues,
      checkedRecords: Object.fromEntries(groups.map(g => [g, Array.isArray(record?.[g]) ? record[g].length : 0])),
      semanticStatus: 'requires-review',
      readiness: 'not-assessed',
      limitations: 'Checks cover declared records and exact excerpt presence, not completeness, source truth, entailment, authentic user input or human approval. Author review is not independent review. Run artifact validation separately; unresolved facts can support conditional recommendations.',
    };
  }
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help')) {
    const domain = argv[argv.indexOf('--help') + 1];
    console.log(`Shipwright final artifact reconciliation
Usage: node scripts/reconcile-artifact.mjs --artifact final.md --record reconciliation.json [--out receipt.json]
       node scripts/reconcile-artifact.mjs --help [evidence|inputs|behavior]
Top-level record: {version:1, domains:[relevant domain names], requestText:original supplied text,
  review:{sourceSupport:observation,userFacts:observation,consistency:observation,approval:observation,unresolved:[]}, ...domain arrays}
Every calculation, evidence claim, behavior and promise needs id and artifactQuotes (exact final excerpts).
Only add relevant records. Include material claims in summaries and recommendations, not just tables.
Exit 0: no record errors (may include unresolved warnings); exit 1: inconsistent/malformed records or I/O error.
No result certifies semantic correctness or grants readiness. Receipts hash the exact saved artifact.
${domain && help[domain] ? help[domain] : Object.values(help).join('\n\n')}`);
    return 0;
  }
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--artifact', '--record', '--out'].includes(argv[i]) || !argv[i + 1] || argv[i + 1].startsWith('--') || options[argv[i]]) throw new Error('Use --artifact FILE --record FILE [--out FILE], or --help.');
    options[argv[i]] = path.resolve(argv[i + 1]);
  }
  if (!options['--artifact'] || !options['--record']) throw new Error('Both --artifact and --record are required.');
  if (options['--out']) {
    const canonical = async p => (await realpath(p).catch(async error => {
      if (error.code !== 'ENOENT') throw error;
      return path.join(await realpath(path.dirname(p)), path.basename(p));
    })).toLowerCase();
    const out = await canonical(options['--out']);
    if (out === await canonical(options['--artifact']) || out === await canonical(options['--record'])) throw new Error('Receipt output must not overwrite the artifact or record.');
  }
  const artifact = await readFile(options['--artifact'], 'utf8');
  const record = JSON.parse(await readFile(options['--record'], 'utf8'));
  const report = { ...reconcileArtifact(artifact, record), checkedAt: new Date().toISOString() };
  const text = JSON.stringify(report, null, 2) + '\n';
  if (options['--out']) await writeFile(options['--out'], text);
  console.log(text.trimEnd());
  return report.errors ? 1 : 0;
}

function isDirectRun() {
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
}
if (isDirectRun()) main().then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 1; });
