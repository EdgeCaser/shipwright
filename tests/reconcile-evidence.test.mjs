import assert from 'node:assert/strict';
import test from 'node:test';
import { evidenceHelp, reconcileEvidence } from '../scripts/reconcile-evidence.mjs';

const source = {
  id: 'policy', kind: 'primary-passage', url: 'https://example.org/policy',
  retrievedAt: '2026-01-01T00:00:00Z',
  passage: 'Eligibility depends on amount and location.',
  context: 'Eligibility depends on amount and location. Additional details follow.',
};

function record(overrides = {}) {
  return {
    inputs: [
      { id: 'amount', kind: 'supplied', value: '100' },
      { id: 'location', kind: 'supplied', value: 'North' },
    ],
    evidenceSources: [source],
    evidenceClaims: [{
      id: 'decision', artifactQuotes: ['The supplied case meets the stated inputs.'],
      sourceIds: ['policy'], support: 'verified',
      applicability: { requiredInputIds: ['amount', 'location'], conditional: false },
    }],
    ...overrides,
  };
}

test('complete primary passage and supplied applicability inputs reconcile', () => {
  assert.deepEqual(reconcileEvidence(record()), []);
});

test('finite numeric and boolean supplied inputs satisfy applicability', () => {
  const current = record({
    inputs: [{ id: 'amount', kind: 'supplied', value: 0 },
      { id: 'location', kind: 'supplied', value: false }],
  });
  assert.deepEqual(reconcileEvidence(current), []);
});

test('generated summary alone cannot verify a claim', () => {
  const result = reconcileEvidence(record({
    evidenceSources: [{ id: 'summary', kind: 'generated-summary', summary: 'Looks eligible.' }],
    evidenceClaims: [{
      id: 'decision', artifactQuotes: ['It qualifies.'], sourceIds: ['summary'], support: 'verified',
    }],
  }));
  assert.ok(result.some((issue) => issue.code === 'verified-without-primary' && issue.severity === 'error'));
});

test('incomplete applicability blocks an unconditional conclusion', () => {
  const result = reconcileEvidence(record({
    inputs: [{ id: 'amount', kind: 'supplied', value: '100' }, { id: 'location', kind: 'unknown' }],
  }));
  assert.ok(result.some((issue) => issue.code === 'applicability-unconditional' && issue.severity === 'error'));
});

test('unknown input retains an explicitly conditional recommendation', () => {
  const current = record({
    inputs: [{ id: 'amount', kind: 'supplied', value: '100' }, { id: 'location', kind: 'unknown' }],
  });
  current.evidenceClaims[0] = {
    ...current.evidenceClaims[0],
    artifactQuotes: ['If the location is North, the case may qualify.'],
    applicability: { requiredInputIds: ['amount', 'location'], conditional: true },
  };
  const result = reconcileEvidence(current);
  assert.ok(result.some((issue) => issue.code === 'applicability-conditional' && issue.severity === 'warning'));
  assert.ok(result.every((issue) => issue.severity !== 'error'));
});

test('complete sourced competitor tuple reconciles and detects structured drift', () => {
  const tuple = {
    id: 'plan-row', provider: 'Acme', plan: 'Starter', feature: 'guest access',
    price: 8, currency: 'USD', unit: 'member/month', billingCadence: 'billed annually',
    completeness: 'complete', qualifier: 'signed-in guests only',
  };
  const comparison = record({
    evidenceSources: [{ ...source,
      passage: 'Starter guest access is for signed-in guests only.',
      context: 'Starter guest access is for signed-in guests only. Price is $8 per member/month, billed annually.',
      competitorTuples: [tuple] }],
    evidenceClaims: [{
      id: 'comparison', artifactQuotes: ['Acme Starter has access for signed-in guests only at $8 per member monthly, billed annually.'],
      sourceIds: ['policy'], support: 'verified',
      competitorTuple: {
        sourceTupleId: 'plan-row', provider: 'Acme', plan: 'Starter', feature: 'guest access',
        price: 8, currency: 'USD', unit: 'member/month', billingCadence: 'billed annually',
        qualifier: 'signed-in guests only',
      },
    }],
  });
  assert.deepEqual(reconcileEvidence(comparison), []);
  comparison.evidenceClaims[0].competitorTuple.plan = 'Business';
  comparison.evidenceClaims[0].competitorTuple.billingCadence = 'billed monthly';
  delete comparison.evidenceClaims[0].competitorTuple.qualifier;
  const codes = reconcileEvidence(comparison).map((issue) => issue.code);
  assert.ok(codes.includes('tuple-conflict'));
  assert.ok(codes.includes('tuple-qualifier-lost'));
});

test('source qualifier must reach the final artifact excerpt', () => {
  const comparison = record({
    evidenceSources: [{ ...source,
      passage: 'Starter allows guests for signed-in guests only.',
      context: 'Starter allows guests for signed-in guests only.',
      competitorTuples: [{ id: 'row', provider: 'Acme', plan: 'Starter', feature: 'guests',
        price: 0, currency: 'USD', unit: 'member/month', billingCadence: 'monthly',
        completeness: 'complete', qualifier: 'signed-in guests only' }] }],
    evidenceClaims: [{ id: 'comparison', artifactQuotes: ['Acme Starter allows guests.'],
      sourceIds: ['policy'], support: 'verified', competitorTuple: {
        sourceTupleId: 'row', provider: 'Acme', plan: 'Starter', feature: 'guests',
        price: 0, currency: 'USD', unit: 'member/month', billingCadence: 'monthly',
        qualifier: 'signed-in guests only',
      } }],
  });
  assert.ok(reconcileEvidence(comparison).some((issue) => issue.code === 'tuple-qualifier-quote-missing'));
});

test('object, array, and blank tuple fields are malformed', () => {
  const current = record({
    evidenceSources: [{ ...source, competitorTuples: [{ id: 'row',
      provider: {}, plan: [], feature: '', price: Number.POSITIVE_INFINITY,
      currency: 'USD', unit: 'seat/month', billingCadence: 'annual', completeness: 'complete',
    }] }],
    evidenceClaims: [{ id: 'comparison', artifactQuotes: ['A comparison.'],
      sourceIds: ['policy'], support: 'verified', competitorTuple: {
        sourceTupleId: 'row', provider: {}, plan: [], feature: '', price: Number.NaN,
        currency: 'USD', unit: 'seat/month', billingCadence: 'annual',
      } }],
  });
  const codes = reconcileEvidence(current).map((issue) => issue.code);
  assert.ok(codes.includes('tuple-field-invalid'));
  assert.ok(codes.includes('claim-tuple-field-invalid'));
});

test('malformed records return issues without throwing', () => {
  assert.equal(reconcileEvidence(null)[0].code, 'record-invalid');
  const issues = reconcileEvidence({
    inputs: [{ id: 'x', kind: 'supplied' }],
    evidenceSources: [{ id: 's', kind: 'primary-passage', passage: '' }],
    evidenceClaims: [{ id: 'c', artifactQuotes: [], sourceIds: ['absent'], support: 'verified',
      applicability: { requiredInputIds: ['missing'], conditional: false } }],
  });
  assert.ok(issues.some((issue) => issue.code === 'input-value-missing'));
  assert.ok(issues.some((issue) => issue.code === 'primary-passage-incomplete'));
  assert.ok(issues.some((issue) => issue.code === 'input-reference-missing'));
  assert.ok(issues.some((issue) => issue.code === 'source-reference-missing'));
});

test('help documents record shape and machine limits', () => {
  assert.match(evidenceHelp, /artifactQuotes/);
  assert.match(evidenceHelp, /semantic\s+entailment/);
  assert.match(evidenceHelp, /primary-passage/);
});
