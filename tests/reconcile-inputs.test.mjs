import assert from 'node:assert/strict';
import test from 'node:test';
import { inputHelp, reconcileInputs } from '../scripts/reconcile-inputs.mjs';

const window = value => ({ kind: 'window', value });
const input = (id, value, role, overrides = {}) => ({
  id, kind: 'supplied', quote: `${id}: ${value}`, value, unit: 'count',
  population: 'new prospects', period: window('pilot month'), role,
  studyDesign: 'descriptive, no causal comparison', ...overrides,
});
const ratio = (overrides = {}) => ({
  id: 'conversion', kind: 'ratio', metric: 'conversion_rate',
  refs: { numerator: 'purchases', denominator: 'exposed' }, result: 0.2,
  targetPopulation: 'new prospects', targetPeriod: window('pilot month'),
  artifactQuotes: ['40 of 200 exposed prospects bought (20%).'], ...overrides,
});
const conversion = (overrides = {}) => ({
  inputs: [input('purchases', 40, 'purchasers'), input('exposed', 200, 'eligible_exposures')],
  calculations: [ratio()], ...overrides,
});
const codes = record => reconcileInputs(record).map(issue => issue.code);

test('documented supplied conversion ratio passes and help names the contract', () => {
  assert.deepEqual(reconcileInputs(conversion()), []);
  assert.match(inputHelp, /artifactQuotes/);
  assert.match(inputHelp, /canonical input IDs/);
});

test('rejects malformed records, duplicate IDs, missing quotes and dangling references', () => {
  assert.deepEqual(codes(null), ['invalid-record']);
  assert.deepEqual(codes({ inputs: {}, calculations: [] }), ['invalid-inputs']);
  const record = conversion();
  record.inputs.push({ ...record.inputs[0], quote: '' });
  record.calculations[0].refs.denominator = 'missing';
  record.calculations[0].artifactQuotes = [];
  const found = codes(record);
  for (const code of ['duplicate-input-id', 'missing-input-quote', 'dangling-input-ref', 'missing-artifact-quotes']) {
    assert.ok(found.includes(code), `${code}: ${found}`);
  }
});

test('buyer count is not a conversion denominator even when the arithmetic matches', () => {
  const record = conversion();
  record.inputs[1].role = 'purchasers';
  assert.ok(codes(record).includes('ratio-role-mismatch'));
});

test('ratio checks units, population, period and recomputed result', () => {
  const record = conversion();
  record.inputs[1].unit = 'schools';
  record.inputs[1].population = 'existing customers';
  record.inputs[1].period = window('next month');
  record.calculations[0].result = 0.4;
  const found = codes(record);
  for (const code of ['ratio-unit-mismatch', 'population-mismatch', 'period-mismatch', 'arithmetic-mismatch']) {
    assert.ok(found.includes(code), `${code}: ${found}`);
  }
});

test('acquisition evidence cannot be scoped to renewal effects', () => {
  const record = conversion({ calculations: [{
    id: 'renewal-effect', kind: 'scoped_claim', refs: { evidence: 'purchases' },
    targetPopulation: 'renewing schools', targetPeriod: window('renewal year'),
    artifactQuotes: ['The pilot predicts renewals.'],
  }] });
  const found = codes(record);
  assert.ok(found.includes('population-mismatch'));
  assert.ok(found.includes('period-mismatch'));
});

test('a point date cannot silently replace a supplied window', () => {
  const record = conversion({ calculations: [{
    id: 'launch-date', kind: 'scoped_claim', refs: { evidence: 'exposed' },
    targetPeriod: { kind: 'point', value: 'July 1' },
    artifactQuotes: ['The change starts July 1.'],
  }] });
  assert.ok(codes(record).includes('period-mismatch'));
});

test('a scoped claim cannot smuggle an unchecked numeric or causal result', () => {
  const record = conversion({ calculations: [{
    id: 'effect', kind: 'scoped_claim', refs: { evidence: 'purchases' },
    targetPopulation: 'new prospects', presentedAs: 'causal', result: 0.2,
    artifactQuotes: ['The offer caused a 20% conversion rate.'],
  }] });
  assert.ok(codes(record).includes('unsupported-result'));
  assert.ok(codes(record).includes('unsupported-inference'));
});

test('scoped facts accept nonblank text and boolean values without numeric units', () => {
  const record = { inputs: [
    { id: 'policy', kind: 'supplied', quote: 'The policy covers annual renewals',
      value: 'annual renewals', population: 'existing customers', period: window('next year') },
    { id: 'notice', kind: 'supplied', quote: 'Advance notice is required',
      value: true, population: 'existing customers', period: window('next year') },
  ], calculations: [
    { id: 'policy-scope', kind: 'scoped_claim', refs: { evidence: 'policy' },
      targetPopulation: 'existing customers', targetPeriod: window('next year'),
      artifactQuotes: ['The policy covers annual renewals.'] },
    { id: 'notice-scope', kind: 'scoped_claim', refs: { evidence: 'notice' },
      targetPopulation: 'existing customers', targetPeriod: window('next year'),
      artifactQuotes: ['Advance notice is required.'] },
  ] };
  assert.deepEqual(reconcileInputs(record), []);
  record.inputs[0].value = '  ';
  assert.ok(codes(record).includes('invalid-input-value'));
  record.inputs[0].value = 'annual renewals';
  record.inputs[0].unit = 'count';
  assert.ok(codes(record).includes('invalid-count-value'));
});

test('conditional revenue arithmetic passes under explicit assumptions', () => {
  const record = {
    inputs: [
      input('baseline', 1000, 'revenue', { unit: 'USD', population: 'renewing schools',
        period: window('one year') }),
      input('price', 1.1, 'price_multiplier', { kind: 'assumption', quote: 'Assume a 10% price increase',
        unit: 'multiplier', population: undefined, period: undefined, presentedAs: 'assumption' }),
      input('retention', 0.9, 'retention_multiplier', { kind: 'assumption',
        quote: 'Assume 90% retained revenue', unit: 'multiplier', population: 'renewing schools',
        period: window('one year'), presentedAs: 'assumption' }),
    ],
    calculations: [{ id: 'revenue', kind: 'conditional_revenue',
      refs: { baselineRevenue: 'baseline', priceMultiplier: 'price', retentionMultiplier: 'retention' },
      targetPopulation: 'renewing schools', presentedAs: 'conditional', result: 990,
      artifactQuotes: ['Under these assumptions, revenue would be $990.'] }],
  };
  assert.deepEqual(reconcileInputs(record), []);
  record.calculations[0].presentedAs = 'forecast';
  assert.ok(codes(record).includes('conditional-only'));
  record.inputs[1].presentedAs = 'supplied';
  assert.ok(codes(record).includes('false-supplied-status'));
  record.inputs[2].population = 'new buyers';
  assert.ok(codes(record).includes('population-mismatch'));
});

test('conditional revenue rejects mixed cohorts even without a target population', () => {
  const record = { inputs: [
    { id: 'base', kind: 'supplied', quote: 'Revenue from existing customers',
      value: 100, unit: 'USD', population: 'existing customers' },
    { id: 'price', kind: 'assumption', presentedAs: 'assumption', quote: 'Assume 1.1 price multiplier',
      value: 1.1, unit: 'multiplier' },
    { id: 'retained', kind: 'assumption', presentedAs: 'assumption', quote: 'Assume new buyers retain at 0.9',
      value: 0.9, unit: 'multiplier', population: 'new buyers' },
  ], calculations: [{ id: 'conditional', kind: 'conditional_revenue',
    refs: { baselineRevenue: 'base', priceMultiplier: 'price', retentionMultiplier: 'retained' },
    presentedAs: 'conditional', result: 99, artifactQuotes: ['Conditional revenue is $99.'] }] };
  assert.ok(codes(record).includes('population-mismatch'));
  record.inputs[2].population = 'existing customers';
  assert.deepEqual(reconcileInputs(record), []);
  record.inputs[2].value = undefined;
  assert.ok(codes(record).includes('result-with-uncomputable-input'));
  record.calculations[0].result = undefined;
  assert.ok(codes(record).includes('unresolved-calculation'));
  assert.equal(reconcileInputs(record).some(issue => issue.severity === 'error'), false);
});

test('a ratio cannot assert a result with a missing numeric input', () => {
  const record = conversion();
  record.inputs[0].value = undefined;
  assert.ok(codes(record).includes('result-with-uncomputable-input'));
  record.calculations[0].result = undefined;
  assert.ok(codes(record).includes('unresolved-calculation'));
  assert.equal(reconcileInputs(record).some(issue => issue.severity === 'error'), false);
});

test('unknowns and proposals stay unresolved with warnings, not blanket errors', () => {
  const record = conversion();
  record.inputs[1] = { id: 'exposed', kind: 'unknown', quote: 'Exposure count not supplied',
    unit: 'count', population: 'new prospects', period: window('pilot month'),
    role: 'eligible_exposures', studyDesign: 'unknown' };
  record.calculations[0].result = undefined;
  assert.ok(codes(record).includes('unresolved-input'));
  assert.equal(reconcileInputs(record).some(issue => issue.severity === 'error'), false);
  record.calculations[0].result = 0.2;
  assert.ok(codes(record).includes('result-with-unknown-input'));
  record.calculations[0].result = undefined;
  record.inputs[1] = input('exposed', 200, 'eligible_exposures', {
    kind: 'proposal', presentedAs: 'proposal', quote: 'Proposed exposure count for planning',
  });
  assert.ok(codes(record).includes('proposed-input'));
  assert.equal(reconcileInputs(record).some(issue => issue.severity === 'error'), false);
});

test('renewal rate requires renewed over eligible renewals', () => {
  const record = { inputs: [
    input('renewed', 80, 'renewed', { population: 'renewing schools' }),
    input('eligible', 100, 'eligible_renewals', { population: 'renewing schools' }),
  ], calculations: [ratio({ id: 'renewal', metric: 'renewal_rate',
    refs: { numerator: 'renewed', denominator: 'eligible' }, result: 0.8,
    targetPopulation: 'renewing schools' })] };
  assert.deepEqual(reconcileInputs(record), []);
});

test('revenue retention uses retained and eligible revenue, not customer or seat counts', () => {
  const record = { inputs: [
    input('retained', 80, 'retained_revenue', { unit: 'USD', measure: 'revenue',
      lifecycle: 'renewal', population: 'renewing customers' }),
    input('eligible', 100, 'eligible_revenue', { unit: 'USD', measure: 'revenue',
      lifecycle: 'renewal', population: 'renewing customers' }),
  ], calculations: [ratio({ id: 'revenue-retention', metric: 'revenue_retention_rate',
    refs: { numerator: 'retained', denominator: 'eligible' }, result: 0.8,
    targetPopulation: 'renewing customers' })] };
  assert.deepEqual(reconcileInputs(record), []);
  record.inputs[0].unit = 'count';
  record.inputs[0].measure = 'seats';
  assert.ok(codes(record).includes('ratio-unit-mismatch'));
  record.inputs[0].unit = 'USD';
  record.inputs[0].measure = 'revenue';
  record.inputs[0].lifecycle = 'acquisition';
  assert.ok(codes(record).includes('renewal-evidence-mismatch'));
});

test('a pre-draft snapshot prevents supplied inputs from changing cohort, wording or status', () => {
  const record = conversion();
  const snapshot = { version: 1, requestText: 'Pilot evidence',
    inputs: structuredClone(record.inputs), behaviors: [] };
  assert.deepEqual(reconcileInputs(record, { snapshot }), []);
  record.inputs[1].population = 'renewing partners';
  record.inputs[1].quote = '640 partners renew';
  assert.ok(codesFromSnapshot(record, snapshot).includes('snapshot-input-mismatch'));
  record.inputs[1].kind = 'assumption';
  assert.ok(codesFromSnapshot(record, snapshot).includes('supplied-status-changed'));
  record.inputs[1].id = 'invented';
  record.inputs[1].kind = 'supplied';
  assert.ok(codesFromSnapshot(record, snapshot).includes('unsnapshotted-supplied-input'));
});

test('a customer break-even percentage is arithmetic, but not revenue retention without equal value', () => {
  const record = {
    inputs: [
      { id: 'price', kind: 'assumption', quote: 'Assume the new price is 1.176470588 times the old price',
        value: 1 / 0.85, unit: 'multiplier', role: 'price_multiplier', presentedAs: 'assumption' },
      { id: 'all', kind: 'supplied', quote: '640 partners in total', value: 640, unit: 'count',
        measure: 'customers', lifecycle: 'renewal', role: 'all_customers', population: 'all partners',
        period: window('next year') },
    ],
    calculations: [{ id: 'threshold', kind: 'break_even_retention',
      refs: { priceMultiplier: 'price' }, retentionBasis: 'customers',
      decisionUse: 'illustration', presentedAs: 'conditional', result: 0.85,
      artifactQuotes: ['85% would be the arithmetic break-even under equal values.'] }],
  };
  const found = codes(record);
  assert.ok(found.includes('unsupported-weighting'));
  assert.ok(found.includes('unresolved-counterfactual'));
  assert.equal(found.includes('arithmetic-mismatch'), false);
  record.calculations[0].decisionUse = 'operating_threshold';
  assert.ok(reconcileInputs(record).some(issue => issue.code === 'unsupported-weighting' && issue.severity === 'error'));
  assert.ok(codes(record).includes('unresolved-counterfactual'));
});

test('an explicit equal-value assumption supports a conditional customer illustration', () => {
  const record = { inputs: [
    { id: 'price', kind: 'assumption', quote: 'Assume price multiplier 1.25',
      value: 1.25, unit: 'multiplier', presentedAs: 'assumption' },
    { id: 'equal', kind: 'assumption', quote: 'Assume each customer contributes equal revenue',
      value: true, role: 'equal_value_assumption', presentedAs: 'assumption' },
  ], calculations: [{ id: 'threshold', kind: 'break_even_retention',
    refs: { priceMultiplier: 'price', equalValueAssumption: 'equal' },
    retentionBasis: 'customers', decisionUse: 'illustration', presentedAs: 'conditional',
    result: 0.8, artifactQuotes: ['With equal customer revenue, 80% is the arithmetic break-even.'] }] };
  assert.equal(codes(record).includes('unsupported-weighting'), false);
  assert.ok(codes(record).includes('unresolved-counterfactual'));
});

test('seat retention cannot silently stand in for retained revenue', () => {
  const record = { inputs: [
    input('baseline', 1000, 'revenue', { unit: 'USD', measure: 'revenue', population: 'renewing customers' }),
    input('price', 1.1, 'price_multiplier', { kind: 'assumption', unit: 'multiplier',
      presentedAs: 'assumption', population: undefined }),
    input('retention', 0.9, 'retention_multiplier', { kind: 'assumption', unit: 'multiplier',
      measure: 'seats', population: 'renewing customers', presentedAs: 'assumption' }),
  ], calculations: [{ id: 'revenue', kind: 'conditional_revenue',
    refs: { baselineRevenue: 'baseline', priceMultiplier: 'price', retentionMultiplier: 'retention' },
    targetPopulation: 'renewing customers', presentedAs: 'conditional', result: 990,
    artifactQuotes: ['At 90% seat retention, revenue would be $990.'] }] };
  assert.ok(codes(record).includes('unsupported-weighting'));
  record.inputs.push({ id: 'equal', kind: 'assumption', quote: 'Assume equal revenue per seat',
    value: true, role: 'equal_value_assumption', presentedAs: 'assumption' });
  record.calculations[0].refs.equalValueAssumption = 'equal';
  assert.equal(codes(record).includes('unsupported-weighting'), false);
  record.calculations[0].decisionUse = 'operating_threshold';
  assert.ok(codes(record).includes('unsupported-operating-weighting'));
});

test('an operating break-even needs renewal revenue for the same population and future window', () => {
  const record = { inputs: [
    { id: 'price', kind: 'assumption', quote: 'Assume price multiplier 1.25',
      value: 1.25, unit: 'multiplier', presentedAs: 'assumption' },
    { id: 'baseline', kind: 'supplied', quote: 'No-change renewal revenue is $1000 next year',
      value: 1000, unit: 'USD', measure: 'revenue', lifecycle: 'renewal',
      role: 'baseline_counterfactual', population: 'eligible renewals', period: window('next year') },
  ], calculations: [{ id: 'threshold', kind: 'break_even_retention',
    refs: { priceMultiplier: 'price', baselineCounterfactual: 'baseline' },
    retentionBasis: 'revenue', decisionUse: 'operating_threshold', presentedAs: 'conditional',
    targetPopulation: 'eligible renewals', targetPeriod: window('next year'),
    comparison: { counterfactual: 'no_change', horizon: 'one year' }, result: 0.8,
    artifactQuotes: ['On this no-change revenue baseline, 80% retained revenue breaks even.'] }] };
  assert.deepEqual(reconcileInputs(record), []);
  record.inputs[1].period = window('previous year');
  assert.ok(codes(record).includes('period-mismatch'));
  record.inputs[1].period = window('next year');
  record.inputs[1].lifecycle = 'acquisition';
  assert.ok(codes(record).includes('renewal-evidence-mismatch'));
  record.inputs[1].lifecycle = 'renewal';
  record.inputs[1].population = 'all customers';
  assert.ok(codes(record).includes('population-mismatch'));
  record.inputs[1].population = 'eligible renewals';
  record.calculations[0].retentionBasis = 'customers';
  record.inputs.push({ id: 'equal', kind: 'assumption', quote: 'Assume equal customer value',
    value: true, role: 'equal_value_assumption', presentedAs: 'assumption' });
  record.calculations[0].refs.equalValueAssumption = 'equal';
  assert.ok(codes(record).includes('unsupported-operating-weighting'));
});

test('a version 2 input record reports a missing snapshot without rejecting useful arithmetic', () => {
  const record = conversion({ version: 2 });
  const found = reconcileInputs(record);
  assert.ok(found.some(issue => issue.code === 'missing-input-snapshot' && issue.severity === 'warning'));
  assert.equal(found.some(issue => issue.severity === 'error'), false);
});

test('version 2 conditional revenue warns when measure and decision use are undeclared', () => {
  const record = { version: 2, inputs: [
    input('baseline', 1000, 'revenue', { unit: 'USD', population: 'renewing customers' }),
    input('price', 1.1, 'price_multiplier', { kind: 'assumption', unit: 'multiplier',
      presentedAs: 'assumption', population: undefined }),
    input('retention', 0.9, 'retention_multiplier', { kind: 'assumption', unit: 'multiplier',
      population: 'renewing customers', presentedAs: 'assumption' }),
  ], calculations: [{ id: 'revenue', kind: 'conditional_revenue',
    refs: { baselineRevenue: 'baseline', priceMultiplier: 'price', retentionMultiplier: 'retention' },
    targetPopulation: 'renewing customers', presentedAs: 'conditional', result: 990,
    artifactQuotes: ['Under these assumptions, revenue would be $990.'] }] };
  const found = codes(record);
  assert.ok(found.includes('unresolved-retention-basis'));
  assert.ok(found.includes('unresolved-decision-use'));
  assert.equal(reconcileInputs(record).some(issue => issue.severity === 'error'), false);
});

function codesFromSnapshot(record, snapshot) {
  return reconcileInputs(record, { snapshot }).map(issue => issue.code);
}
