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

test('verified case claim carries incorporated definition and its case prerequisites', () => {
  const current = record({
    inputs: [
      { id: 'amount', kind: 'supplied', value: '100' },
      { id: 'location', kind: 'supplied', value: 'North' },
      { id: 'entity-size', kind: 'unknown' },
    ],
    evidenceSources: [
      { ...source, prerequisites: {
        requiredInputIds: ['amount', 'location'], definitionSourceIds: ['incorporated-definition'],
      } },
      { ...source, id: 'incorporated-definition',
        passage: 'Covered entities depend on entity size.',
        context: 'Covered entities depend on entity size.',
        prerequisites: { requiredInputIds: ['entity-size'], definitionSourceIds: [] } },
    ],
  });
  let codes = reconcileEvidence(current).map((issue) => issue.code);
  assert.ok(codes.includes('source-definition-unlinked'));
  assert.ok(codes.includes('source-prerequisite-omitted'));

  current.evidenceClaims[0].sourceIds.push('incorporated-definition');
  current.evidenceClaims[0].applicability.requiredInputIds.push('entity-size');
  current.evidenceClaims[0].applicability.conditional = true;
  current.evidenceClaims[0].artifactQuotes = ['If entity size satisfies the incorporated definition, review eligibility.'];
  codes = reconcileEvidence(current).map((issue) => issue.code);
  assert.ok(codes.includes('applicability-conditional'));
  assert.ok(!codes.includes('source-definition-unlinked'));
  assert.ok(!codes.includes('source-prerequisite-omitted'));
  assert.ok(codes.every((code) => code !== 'applicability-unconditional'));
});

test('frozen case inputs cannot be changed in the evidence record', () => {
  const issues = reconcileEvidence(record(), { snapshot: {
    version: 1, requestText: 'Amount is 100; location is North.',
    inputs: [{ id: 'amount', kind: 'supplied', value: '200' },
      { id: 'location', kind: 'supplied', value: 'North' }],
    behaviors: [],
  } });
  assert.ok(issues.some((issue) => issue.code === 'snapshot-input-mismatch' && issue.id === 'amount'));
  const addedAssumption = record({ inputs: [
    { id: 'amount', kind: 'supplied', value: '100' },
    { id: 'location', kind: 'supplied', value: 'North' },
    { id: 'future-demand', kind: 'assumption' },
  ] });
  const good = reconcileEvidence(addedAssumption, { snapshot: {
    version: 1, inputs: [
      { id: 'amount', kind: 'supplied', value: '100' },
      { id: 'location', kind: 'supplied', value: 'North' },
    ],
  } });
  assert.ok(!good.some((issue) => issue.code === 'snapshot-input-mismatch'));
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

test('comparison conclusion retains each source row and calls out unknown billing cadence', () => {
  const rowA = { id: 'a', provider: 'Acme', plan: 'Standard', feature: 'guest access',
    price: 10, currency: 'USD', unit: 'seat/month', billingCadence: 'monthly',
    completeness: 'complete', qualifier: 'signed-in guests only' };
  const rowB = { id: 'b', provider: 'Beryl', plan: 'Team', feature: 'guest access',
    price: 8, currency: 'USD', unit: 'seat/month', billingCadence: null,
    completeness: 'partial' };
  const acmeRow = 'Acme Standard guest access: $10 USD per seat each month, billed monthly; signed-in guests only.';
  const berylRow = 'Beryl Team guest access: $8 USD per seat each month; billing period is not published.';
  const finalQuote = 'The listed Acme and Beryl rows cannot support a direct price ranking until Beryl’s billing period is confirmed.';
  const current = record({
    evidenceSources: [{ ...source,
      passage: 'signed-in guests only', context: 'signed-in guests only',
      competitorTuples: [rowA, rowB] }],
    evidenceClaims: [{ id: 'comparison', sourceIds: ['policy'], support: 'verified',
      artifactQuotes: [acmeRow, berylRow, finalQuote],
      comparisonTuples: [
        { sourceTupleId: 'a', provider: 'Acme', plan: 'Standard', feature: 'guest access',
          price: 10, currency: 'USD', unit: 'seat/month', billingCadence: 'monthly',
          qualifier: 'signed-in guests only' },
        { sourceTupleId: 'b', provider: 'Beryl', plan: 'Team', feature: 'guest access',
          price: 8, currency: 'USD', unit: 'seat/month', billingCadence: null },
      ],
      comparison: { status: 'unknown', finalQuote, unknownFields: ['billingCadence'],
        renderedTuples: [
          { sourceTupleId: 'a', fieldQuotes: { provider: 'Acme', plan: 'Standard',
            feature: 'guest access', price: '$10', currency: 'USD',
            unit: 'per seat each month', billingCadence: 'billed monthly' },
          qualifierQuote: 'signed-in guests only' },
          { sourceTupleId: 'b', fieldQuotes: { provider: 'Beryl', plan: 'Team',
            feature: 'guest access', price: '$8', currency: 'USD',
            unit: 'per seat each month', billingCadence: 'billing period is not published' } },
        ] },
    }],
  });
  const valid = reconcileEvidence(current);
  assert.ok(valid.every((issue) => issue.severity !== 'error'), JSON.stringify(valid));
  current.evidenceClaims[0].comparison = {
    status: 'established', unknownFields: [],
    finalQuote, renderedTuples: current.evidenceClaims[0].comparison.renderedTuples,
  };
  const codes = reconcileEvidence(current).map((issue) => issue.code);
  assert.ok(codes.includes('comparison-status-overstated'));
  assert.ok(codes.includes('comparison-unknown-omitted'));
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
