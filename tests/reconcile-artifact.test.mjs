import './helpers/isolate-outputs.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { reconcileArtifact } from '../scripts/reconcile-artifact.mjs';
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
