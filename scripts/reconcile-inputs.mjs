// Check a declared input record before using its numbers or scoped claims.
// This checks the record's internal consistency. The caller must still compare
// its quotes with the actual source and final artifact.

const INPUT_KINDS = new Set(['supplied', 'assumption', 'proposal', 'unknown']);
const CALCULATION_KINDS = new Set(['ratio', 'conditional_revenue', 'scoped_claim', 'unresolved']);
const PERIOD_KINDS = new Set(['window', 'point', 'unknown']);
const RATIO_METRICS = new Set(['generic', 'conversion_rate', 'renewal_rate']);

export const inputHelp = `Input record: {inputs:[{id,kind:"supplied|assumption|proposal|unknown",quote,value,unit,population,period:{kind:"window|point|unknown",value},role,studyDesign,presentedAs}],calculations:[{id,kind:"ratio|conditional_revenue|scoped_claim|unresolved",refs:{...inputIds},metric,result,targetPopulation,targetPeriod,presentedAs,artifactQuotes:["exact final excerpt"]}]}.
Example: {"inputs":[{"id":"purchases","kind":"supplied","quote":"40 bought","value":40,"unit":"count","population":"new prospects","period":{"kind":"window","value":"pilot month"},"role":"purchasers","studyDesign":"descriptive"},{"id":"exposed","kind":"supplied","quote":"200 saw the offer","value":200,"unit":"count","population":"new prospects","period":{"kind":"window","value":"pilot month"},"role":"eligible_exposures","studyDesign":"descriptive"}],"calculations":[{"id":"conversion","kind":"ratio","metric":"conversion_rate","refs":{"numerator":"purchases","denominator":"exposed"},"result":0.2,"artifactQuotes":["40 of 200 exposed prospects bought (20%)."]}]}. Unknowns remain unknown; cite canonical input IDs in refs. Exact artifact quote presence and source truth require separate review.`;

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const inputValue = value => finite(value) || nonempty(value) || typeof value === 'boolean';
const samePeriod = (a, b) => a?.kind === b?.kind && a?.value === b?.value;

export function reconcileInputs(record) {
  const issues = [];
  const add = (code, id, severity, message) => issues.push({ code, id, severity, message });
  if (!object(record)) {
    add('invalid-record', 'record', 'error', 'Expected an input record object.');
    return issues;
  }
  if (!Array.isArray(record.inputs)) add('invalid-inputs', 'inputs', 'error', 'inputs must be an array.');
  if (!Array.isArray(record.calculations)) add('invalid-calculations', 'calculations', 'error', 'calculations must be an array.');
  if (!Array.isArray(record.inputs) || !Array.isArray(record.calculations)) return issues;

  const inputs = new Map();
  for (const [index, input] of record.inputs.entries()) {
    const id = nonempty(input?.id) ? input.id : `inputs[${index}]`;
    if (!object(input) || !nonempty(input.id)) {
      add('invalid-input', id, 'error', 'Each input needs a nonempty id and object body.');
      continue;
    }
    if (inputs.has(id)) add('duplicate-input-id', id, 'error', 'Input IDs must be unique.');
    else inputs.set(id, input);
    if (!INPUT_KINDS.has(input.kind)) add('invalid-input-kind', id, 'error', 'Input kind must be supplied, assumption, proposal or unknown.');
    if (!nonempty(input.quote)) add('missing-input-quote', id, 'error', 'Preserve the original wording or an explicit missing-input description in quote.');
    if (input.kind === 'unknown') {
      if (input.value !== undefined && input.value !== null) add('unknown-has-value', id, 'error', 'An unknown input cannot also carry a value.');
    } else if (input.value !== undefined && !inputValue(input.value)) {
      add('invalid-input-value', id, 'error', 'An input value must be a finite number, nonblank text or boolean.');
    }
    if (finite(input.value) && !nonempty(input.unit)) {
      add('missing-unit', id, 'error', 'A numeric input needs a unit.');
    }
    if (input.unit === 'count' && input.value !== undefined && input.value !== null && !finite(input.value)) {
      add('invalid-count-value', id, 'error', 'A count value must be a finite number.');
    }
    if (input.unit === 'count' && !nonempty(input.population)) {
      add('missing-population', id, 'error', 'A count needs its observed population.');
    }
    if (input.unit === 'count' && input.period === undefined) {
      add('missing-period', id, 'warning', 'Record the observation period, or mark it explicitly unknown.');
    }
    if (input.period !== undefined && input.period !== null && (!object(input.period)
      || !PERIOD_KINDS.has(input.period.kind) || !nonempty(input.period.value))) {
      add('invalid-period', id, 'error', 'period must preserve a window, point or explicit unknown and its wording.');
    }
    if (input.presentedAs !== undefined && !INPUT_KINDS.has(input.presentedAs)) {
      add('invalid-presentation', id, 'error', 'presentedAs must use an input kind.');
    } else if (input.kind !== 'supplied' && input.presentedAs === 'supplied') {
      add('false-supplied-status', id, 'error', 'An assumption, proposal or unknown cannot be presented as supplied.');
    } else if (['assumption', 'proposal'].includes(input.kind) && input.presentedAs === undefined) {
      add('unlabeled-input', id, 'warning', 'Record how this assumption or proposal is labeled in the final artifact.');
    }
  }

  const calculationIds = new Set();
  for (const [index, calculation] of record.calculations.entries()) {
    const id = nonempty(calculation?.id) ? calculation.id : `calculations[${index}]`;
    if (!object(calculation) || !nonempty(calculation.id)) {
      add('invalid-calculation', id, 'error', 'Each calculation needs a nonempty id and object body.');
      continue;
    }
    if (calculationIds.has(id)) add('duplicate-calculation-id', id, 'error', 'Calculation IDs must be unique.');
    calculationIds.add(id);
    if (!CALCULATION_KINDS.has(calculation.kind)) {
      add('unknown-calculation-kind', id, 'error', 'Only declared calculation kinds can be checked.');
      continue;
    }
    if (!Array.isArray(calculation.artifactQuotes) || calculation.artifactQuotes.length === 0
      || calculation.artifactQuotes.some(quote => !nonempty(quote))) {
      add('missing-artifact-quotes', id, 'error', 'List exact excerpts from the final artifact for this calculation or claim.');
    }
    if (!object(calculation.refs)) {
      add('invalid-refs', id, 'error', 'refs must map roles to canonical input IDs.');
      continue;
    }
    const refs = {};
    for (const [role, inputId] of Object.entries(calculation.refs)) {
      if (!nonempty(inputId) || !inputs.has(inputId)) {
        add('dangling-input-ref', id, 'error', `${role} must reference an existing input ID.`);
      } else {
        refs[role] = inputs.get(inputId);
        if (refs[role].kind === 'unknown') add('unresolved-input', id, 'warning', `${role} is unknown; do not report a numeric result.`);
        if (refs[role].kind === 'proposal') add('proposed-input', id, 'warning', `${role} is a proposal, not an observed result.`);
      }
    }
    if (calculation.result !== undefined && Object.values(refs).some(input => input.kind === 'unknown')) {
      add('result-with-unknown-input', id, 'error', 'Do not report a numeric result while a referenced input is unknown.');
    }
    if (calculation.targetPeriod !== undefined && (!object(calculation.targetPeriod)
      || !PERIOD_KINDS.has(calculation.targetPeriod.kind) || !nonempty(calculation.targetPeriod.value))) {
      add('invalid-target-period', id, 'error', 'targetPeriod needs a window, point or explicit unknown and its wording.');
    }
    if (calculation.targetPopulation !== undefined && !nonempty(calculation.targetPopulation)) {
      add('invalid-target-population', id, 'error', 'targetPopulation must name the affected population.');
    }
    if (calculation.result !== undefined && !finite(calculation.result)) {
      add('invalid-result', id, 'error', 'result must be a finite number.');
    }
    if (calculation.kind === 'unresolved') {
      add('unresolved-calculation', id, 'warning', 'Keep this calculation or claim unresolved until its missing inputs are supplied.');
      if (calculation.result !== undefined) add('unresolved-has-result', id, 'error', 'An unresolved calculation cannot report a result.');
      continue;
    }
    if (calculation.kind === 'ratio') {
      if (!RATIO_METRICS.has(calculation.metric)) add('invalid-ratio-metric', id, 'error', 'ratio metric must be generic, conversion_rate or renewal_rate.');
      for (const role of ['numerator', 'denominator']) if (!Object.hasOwn(calculation.refs, role)) {
        add('missing-ref', id, 'error', `ratio needs a ${role} input ID.`);
      }
      if (calculation.presentedAs === 'forecast' || calculation.presentedAs === 'causal') {
        add('unsupported-inference', id, 'error', 'A descriptive ratio alone cannot establish a forecast or causal effect.');
      }
      if (refs.numerator && refs.denominator) checkRatio(calculation, refs, id, add);
    } else if (calculation.kind === 'conditional_revenue') {
      for (const role of ['baselineRevenue', 'priceMultiplier', 'retentionMultiplier']) if (!Object.hasOwn(calculation.refs, role)) {
        add('missing-ref', id, 'error', `conditional_revenue needs a ${role} input ID.`);
      }
      if (calculation.presentedAs !== 'conditional') {
        add('conditional-only', id, 'error', 'Revenue arithmetic is conditional on its inputs, not an observed forecast or causal effect.');
      }
      if (refs.baselineRevenue && refs.priceMultiplier && refs.retentionMultiplier) {
        checkConditionalRevenue(calculation, refs, id, add);
      }
    } else if (calculation.kind === 'scoped_claim' && !Object.hasOwn(calculation.refs, 'evidence')) {
      add('missing-ref', id, 'error', 'scoped_claim needs an evidence input ID.');
    }
    if (calculation.kind === 'scoped_claim' && calculation.result !== undefined) {
      add('unsupported-result', id, 'error', 'A scoped claim does not define arithmetic; use a supported calculation kind or keep the numeric result unresolved.');
    }
    if (calculation.kind === 'scoped_claim' && ['forecast', 'causal'].includes(calculation.presentedAs)) {
      add('unsupported-inference', id, 'error', 'Scope matching alone cannot establish a forecast or causal effect.');
    }
    if (calculation.kind === 'scoped_claim' && !nonempty(calculation.targetPopulation)
      && calculation.targetPeriod === undefined) {
      add('unresolved-scope', id, 'warning', 'State the target population or period before treating this as a scoped claim.');
    }
    // A baseline for conditional arithmetic may precede a hypothetical target
    // period. Ratios and evidence claims must retain the observed period.
    if (calculation.kind === 'ratio' || calculation.kind === 'scoped_claim') {
      for (const [role, input] of Object.entries(refs)) {
        if (nonempty(calculation.targetPopulation) && nonempty(input.population)
          && calculation.targetPopulation !== input.population) {
          add('population-mismatch', id, 'error', `${role} covers ${input.population}, not ${calculation.targetPopulation}.`);
        }
        if (object(calculation.targetPeriod) && object(input.period)
          && !samePeriod(calculation.targetPeriod, input.period)) {
          add('period-mismatch', id, 'error', `${role} covers ${input.period.value} (${input.period.kind}), not ${calculation.targetPeriod.value} (${calculation.targetPeriod.kind}).`);
        }
      }
    }
  }
  return issues;
}

function checkRatio(calculation, refs, id, add) {
  const { numerator, denominator } = refs;
  const roles = {
    conversion_rate: ['purchasers', 'eligible_exposures'],
    renewal_rate: ['renewed', 'eligible_renewals'],
  };
  const expected = roles[calculation.metric];
  if (expected && (numerator.role !== expected[0] || denominator.role !== expected[1])) {
    add('ratio-role-mismatch', id, 'error', `${calculation.metric} needs ${expected[0]} over ${expected[1]}.`);
  }
  if (numerator.unit !== denominator.unit || !nonempty(numerator.unit)) {
    add('ratio-unit-mismatch', id, 'error', 'Ratio numerator and denominator must have the same known unit.');
  }
  if (expected && numerator.unit !== 'count') add('ratio-unit-mismatch', id, 'error', `${calculation.metric} needs counts.`);
  if (nonempty(numerator.population) && nonempty(denominator.population)
    && numerator.population !== denominator.population) {
    add('population-mismatch', id, 'error', 'Ratio numerator and denominator cover different populations.');
  }
  if (object(numerator.period) && object(denominator.period) && !samePeriod(numerator.period, denominator.period)) {
    add('period-mismatch', id, 'error', 'Ratio numerator and denominator cover different observation periods.');
  }
  if (expected && (!nonempty(numerator.studyDesign) || !nonempty(denominator.studyDesign))) {
    add('study-design-unresolved', id, 'warning', 'Record the observed study design; the ratio alone does not establish an effect.');
  }
  if (numerator.kind === 'unknown' || denominator.kind === 'unknown') return;
  if (!finite(numerator.value) || !finite(denominator.value)) {
    add(calculation.result === undefined ? 'unresolved-calculation' : 'result-with-uncomputable-input',
      id, calculation.result === undefined ? 'warning' : 'error',
      'A ratio needs both finite numeric values before reporting a result.');
    return;
  }
  if (numerator.value < 0 || denominator.value <= 0 || (expected && numerator.value > denominator.value)) {
    add('invalid-ratio-values', id, 'error', 'A rate needs a nonnegative numerator no greater than its positive denominator.');
    return;
  }
  checkResult(calculation, numerator.value / denominator.value, id, add);
}

function checkConditionalRevenue(calculation, refs, id, add) {
  const { baselineRevenue, priceMultiplier, retentionMultiplier } = refs;
  if (!/^[A-Z]{3}$/.test(baselineRevenue.unit || '')) {
    add('revenue-unit-mismatch', id, 'error', 'baselineRevenue needs a three-letter currency unit.');
  }
  for (const [name, input] of [['priceMultiplier', priceMultiplier], ['retentionMultiplier', retentionMultiplier]]) {
    if (input.unit !== 'multiplier') add('revenue-unit-mismatch', id, 'error', `${name} must use unit multiplier.`);
  }
  for (const [name, input] of [['baselineRevenue', baselineRevenue], ['retentionMultiplier', retentionMultiplier]]) {
    if (!nonempty(input.population)) {
      add('missing-population', id, 'error', `${name} needs a population.`);
    } else if (nonempty(calculation.targetPopulation) && calculation.targetPopulation !== input.population) {
      add('population-mismatch', id, 'error', `${name} covers ${input.population}, not ${calculation.targetPopulation}.`);
    }
  }
  if (nonempty(baselineRevenue.population) && nonempty(retentionMultiplier.population)
    && baselineRevenue.population !== retentionMultiplier.population) {
    add('population-mismatch', id, 'error', 'Baseline revenue and retention multiplier cover different populations.');
  }
  if (object(calculation.targetPeriod) && object(retentionMultiplier.period)
    && !samePeriod(calculation.targetPeriod, retentionMultiplier.period)) {
    add('period-mismatch', id, 'error', 'Retention multiplier covers a different period from the target.');
  }
  if ([baselineRevenue, priceMultiplier, retentionMultiplier].some(input => input.kind === 'unknown')) return;
  if (![baselineRevenue.value, priceMultiplier.value, retentionMultiplier.value].every(finite)) {
    add(calculation.result === undefined ? 'unresolved-calculation' : 'result-with-uncomputable-input',
      id, calculation.result === undefined ? 'warning' : 'error',
      'Conditional revenue needs three finite numeric inputs before reporting a result.');
    return;
  }
  if ([baselineRevenue.value, priceMultiplier.value, retentionMultiplier.value].some(value => value < 0)) {
    add('invalid-revenue-values', id, 'error', 'Revenue and multipliers cannot be negative.');
    return;
  }
  checkResult(calculation, baselineRevenue.value * priceMultiplier.value * retentionMultiplier.value, id, add);
}

function checkResult(calculation, expected, id, add) {
  if (calculation.result === undefined) {
    add('unresolved-calculation', id, 'warning', 'State the result or keep this calculation explicitly unresolved.');
  } else if (finite(calculation.result) && Math.abs(calculation.result - expected) > 1e-9 * Math.max(1, Math.abs(expected))) {
    add('arithmetic-mismatch', id, 'error', `Declared result ${calculation.result} does not equal recomputed result ${expected}.`);
  }
}
