import assert from 'node:assert/strict';
import test from 'node:test';
import { behaviorHelp, reconcileBehavior } from '../scripts/reconcile-behavior.mjs';

const behavior = (overrides = {}) => ({
  id: 'access-cutoff',
  artifactQuotes: ['Access ends within 30 seconds.'],
  trigger: 'confirmation',
  stage: 'application',
  populations: { scope: 'all' },
  boundary: 'both',
  latency: { kind: 'maximum', value: 30, unit: 'seconds' },
  prerequisites: { required: ['confirmed request'] },
  exceptions: ['legal hold'],
  guaranteeStatus: 'proposed',
  ...overrides,
});

const promise = (overrides = {}) => ({
  id: 'announcement-cutoff',
  behaviorId: 'access-cutoff',
  artifactQuotes: ['After confirmation, access ends within one minute.'],
  trigger: 'confirmation',
  stage: 'application',
  populations: { scope: 'all' },
  boundary: 'both',
  latency: { kind: 'maximum', value: 1, unit: 'minutes' },
  prerequisites: { required: ['confirmed request'] },
  exceptions: ['legal hold'],
  guaranteeStatus: 'proposed',
  ...overrides,
});

const record = (behaviorOverrides, promiseOverrides) => ({
  behaviors: [behavior(behaviorOverrides)],
  promises: [promise(promiseOverrides)],
});

const frozenSnapshot = (overrides = {}) => ({
  version: 1,
  requestText: 'After confirmation, access must end within 30 seconds, except for a legal hold. The deployed endpoint returns a completed cutoff.',
  inputs: [{ id: 'deployment-proof', kind: 'supplied', origin: 'implementation-evidence', quote: 'The deployed endpoint returns a completed cutoff.' }],
  behaviors: [{
    ...behavior(),
    artifactQuotes: undefined,
    sourceQuote: 'After confirmation, access must end within 30 seconds, except for a legal hold.',
    provenance: { origin: 'supplied' },
  }],
  ...overrides,
});

const snapshotRecord = (behaviorOverrides = {}, promiseOverrides = {}) => record({
  provenance: { origin: 'supplied', sourceBehaviorId: 'access-cutoff' },
  ...behaviorOverrides,
}, {
  provenance: { origin: 'supplied', sourceBehaviorId: 'access-cutoff' },
  ...promiseOverrides,
});

test('returns a direct issue array and documents the compact record shape', () => {
  const issues = reconcileBehavior(record());
  assert.ok(Array.isArray(issues));
  assert.equal(issues.length, 0);
  assert.match(behaviorHelp, /behaviorId/);
  assert.match(behaviorHelp, /artifactQuotes/);
});

test('preserves legacy behavior records that omit stage and provenance', () => {
  const legacy = record();
  for (const row of [...legacy.behaviors, ...legacy.promises]) delete row.stage;
  assert.deepEqual(reconcileBehavior(legacy), []);
});

test('accepts a weaker maximum promise with compatible unit conversion', () => {
  assert.deepEqual(reconcileBehavior(record({ latency: { kind: 'maximum', value: 30, unit: 'seconds' } }, {
    latency: { kind: 'maximum', value: 60_000, unit: 'ms' },
  })), []);
});

test('allows zero as a non-negative latency bound', () => {
  assert.deepEqual(reconcileBehavior(record({ latency: { kind: 'maximum', value: 0, unit: 'seconds' } }, {
    latency: { kind: 'maximum', value: 0, unit: 'ms' },
  })), []);
});

test('rejects a stronger maximum promise and a percentile as proof of a maximum', () => {
  const stronger = reconcileBehavior(record({}, { latency: { kind: 'maximum', value: 10, unit: 'seconds' } }));
  assert.ok(stronger.some(issue => issue.code === 'latency-mismatch'));
  const p95 = reconcileBehavior(record({ latency: { kind: 'percentile', percentile: 95, value: 30, unit: 'seconds' } }, {
    latency: { kind: 'maximum', value: 1, unit: 'minutes' },
  }));
  assert.ok(p95.some(issue => issue.code === 'latency-mismatch'));
});

test('a maximum behavior supports a weaker percentile promise', () => {
  assert.deepEqual(reconcileBehavior(record({}, {
    latency: { kind: 'percentile', percentile: 95, value: 1, unit: 'minutes' },
  })), []);
});

test('flags malformed rows, missing quote evidence, and unknown behavior links', () => {
  const issues = reconcileBehavior({
    behaviors: [behavior({ artifactQuotes: [] })],
    promises: [promise({ behaviorId: 'missing', artifactQuotes: [] })],
  });
  for (const code of ['missing-artifact-quotes', 'unknown-behavior']) {
    assert.ok(issues.some(issue => issue.code === code), code);
  }
});

test('flags population, boundary, trigger, prerequisite, exception, and status drift', () => {
  const issues = reconcileBehavior(record({
    populations: { scope: 'subset', members: ['desktop'] },
    boundary: 'online',
    trigger: 'verified request',
    prerequisites: { required: ['verified request'] },
    exceptions: ['legal hold', 'contract lock'],
  }, {
    populations: { scope: 'all' },
    boundary: 'both',
    trigger: 'confirmation',
    prerequisites: { optional: ['verified request'] },
    exceptions: ['legal hold'],
    guaranteeStatus: 'implemented',
  }));
  for (const code of ['population-mismatch', 'boundary-mismatch', 'trigger-mismatch', 'optional-prerequisite', 'exception-mismatch', 'guarantee-status-mismatch']) {
    assert.ok(issues.some(issue => issue.code === code), code);
  }
});

test('supports a bounded subset and rejects a broader subset', () => {
  const supported = reconcileBehavior(record({ populations: { scope: 'subset', members: ['desktop', 'mobile'] } }, {
    populations: { scope: 'subset', members: ['mobile'] },
  }));
  assert.ok(!supported.some(issue => issue.code === 'population-mismatch'));
  const broader = reconcileBehavior(record({ populations: { scope: 'subset', members: ['desktop'] } }, {
    populations: { scope: 'subset', members: ['desktop', 'mobile'] },
  }));
  assert.ok(broader.some(issue => issue.code === 'population-mismatch'));
});

test('keeps unknown fields unresolved and allows bounded conditional proposals', () => {
  const unknown = reconcileBehavior(record({ latency: { kind: 'unknown' } }, { latency: { kind: 'unknown' } }));
  assert.ok(unknown.some(issue => issue.code === 'unresolved-latency-coverage' && issue.severity === 'warning'));
  assert.deepEqual(reconcileBehavior(record({ prerequisites: { optional: ['reconnection'] } }, {
    prerequisites: { required: ['reconnection', 'confirmed request'] },
  })), []);
});

test('unknown latency does not hide known contradictions', () => {
  const issues = reconcileBehavior(record({
    boundary: 'online',
    latency: { kind: 'unknown' },
    prerequisites: { required: ['confirmed request'] },
  }, {
    boundary: 'both',
    latency: { kind: 'maximum', value: 1, unit: 'minutes' },
    prerequisites: { optional: ['confirmed request'] },
  }));
  for (const code of ['boundary-mismatch', 'optional-prerequisite', 'unresolved-latency-coverage']) {
    assert.ok(issues.some(issue => issue.code === code), code);
  }
  assert.equal(issues.find(issue => issue.code === 'unresolved-latency-coverage').severity, 'error');
});

test('requires every artifact quote to be a non-empty exact excerpt', () => {
  const issues = reconcileBehavior(record({ artifactQuotes: ['Requirement excerpt', ''] }));
  assert.ok(issues.some(issue => issue.code === 'missing-artifact-quotes'));
});

test('uses a frozen snapshot to retain supplied behavior provenance and source limits', () => {
  assert.deepEqual(reconcileBehavior(snapshotRecord(), { snapshot: frozenSnapshot() }), []);
  const missing = reconcileBehavior(snapshotRecord({ provenance: { origin: 'supplied' } }), { snapshot: frozenSnapshot() });
  assert.ok(missing.some(issue => issue.code === 'missing-source-behavior'));
  const stronger = reconcileBehavior(snapshotRecord({ boundary: 'both' }), {
    snapshot: frozenSnapshot({ behaviors: [{
      ...behavior({ artifactQuotes: undefined, boundary: 'online' }),
      sourceQuote: 'After confirmation, access must end within 30 seconds, except for a legal hold.',
      provenance: { origin: 'supplied' },
    }] }),
  });
  assert.ok(stronger.some(issue => issue.code === 'source-boundary-mismatch'));
});

test('does not turn a receipt, a proposal, or an unknown source into an application guarantee', () => {
  const receipt = reconcileBehavior(record({ stage: 'receipt' }, { stage: 'application' }));
  assert.ok(receipt.some(issue => issue.code === 'stage-mismatch'));
  const proposal = reconcileBehavior(snapshotRecord({
    guaranteeStatus: 'implemented',
    provenance: { origin: 'proposed-requirement', sourceBehaviorId: 'access-cutoff' },
  }), { snapshot: frozenSnapshot() });
  assert.ok(proposal.some(issue => issue.code === 'unproven-implementation-status'));
  const unresolved = reconcileBehavior(snapshotRecord({
    trigger: 'unknown',
    boundary: 'both',
    provenance: { origin: 'unknown', sourceBehaviorId: 'access-cutoff' },
  }), { snapshot: frozenSnapshot({ behaviors: [{
    ...behavior({ artifactQuotes: undefined, boundary: 'online' }),
    sourceQuote: 'After confirmation, access must end within 30 seconds, except for a legal hold.',
    provenance: { origin: 'supplied' },
  }] }) });
  assert.ok(unresolved.some(issue => issue.code === 'unknown-provenance'));
  assert.ok(unresolved.some(issue => issue.code === 'source-boundary-mismatch'));
});

test('requires supplied implementation evidence before an implemented behavior supports a promise', () => {
  const implementedSnapshot = frozenSnapshot({ behaviors: [{
    ...behavior({ artifactQuotes: undefined, guaranteeStatus: 'implemented' }),
    sourceQuote: 'Deployment evidence establishes the cutoff.',
    provenance: { origin: 'implementation-evidence' },
  }] });
  const valid = snapshotRecord({
    guaranteeStatus: 'implemented',
    provenance: {
      origin: 'implementation-evidence', sourceBehaviorId: 'access-cutoff',
      evidenceRefs: [{ sourceId: 'deployment-proof', excerpt: 'endpoint returns a completed cutoff' }],
    },
  }, { guaranteeStatus: 'implemented', provenance: { origin: 'implementation-evidence', sourceBehaviorId: 'access-cutoff' } });
  assert.deepEqual(reconcileBehavior(valid, { snapshot: implementedSnapshot }), []);
  const missing = reconcileBehavior(snapshotRecord({
    guaranteeStatus: 'implemented',
    provenance: { origin: 'implementation-evidence', sourceBehaviorId: 'access-cutoff' },
  }, { guaranteeStatus: 'implemented', provenance: { origin: 'implementation-evidence', sourceBehaviorId: 'access-cutoff' } }), { snapshot: implementedSnapshot });
  assert.ok(missing.some(issue => issue.code === 'missing-implementation-evidence'));
  const unsupported = reconcileBehavior(snapshotRecord({}, { guaranteeStatus: 'implemented' }), { snapshot: frozenSnapshot() });
  assert.ok(unsupported.some(issue => issue.code === 'implementation-status-mismatch'));
});

test('does not relabel a frozen source or canonical behavior as supplied evidence', () => {
  const sourceOrigin = reconcileBehavior(snapshotRecord(), { snapshot: frozenSnapshot({ behaviors: [{
    ...behavior({ artifactQuotes: undefined }),
    sourceQuote: 'After confirmation, access must end within 30 seconds, except for a legal hold.',
    provenance: { origin: 'proposed-requirement' },
  }] }) });
  assert.ok(sourceOrigin.some(issue => issue.code === 'source-provenance-origin-mismatch'));
  const promiseOrigin = reconcileBehavior(snapshotRecord({
    provenance: { origin: 'proposed-requirement' },
  }), { snapshot: frozenSnapshot() });
  assert.ok(promiseOrigin.some(issue => issue.code === 'promise-provenance-mismatch'));
});
