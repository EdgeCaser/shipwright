const BOUNDARIES = new Set(['online', 'offline', 'both', 'unknown']);
const GUARANTEE_STATUSES = new Set(['proposed', 'implemented', 'unknown']);
const PROVENANCE_ORIGINS = new Set(['supplied', 'proposed-requirement', 'implementation-evidence', 'unknown']);
const STAGES = new Set(['receipt', 'application', 'unknown']);
const LATENCY_KINDS = new Set(['maximum', 'percentile', 'unknown']);
const POPULATION_SCOPES = new Set(['all', 'subset', 'unknown']);
const UNIT_TO_MILLISECONDS = {
  ms: 1,
  seconds: 1000,
  minutes: 60_000,
  hours: 3_600_000,
};

export const behaviorHelp = `Behavior record:\n{
  behaviors: [{ id, artifactQuotes, trigger, stage: 'receipt|application|unknown', populations: { scope: 'all|subset|unknown', members? }, boundary: 'online|offline|both|unknown', latency: { kind: 'maximum|percentile|unknown', percentile?, value?, unit? }, prerequisites?: { required?, optional? }, exceptions?, guaranteeStatus: 'proposed|implemented|unknown', provenance? }],
  promises: [{ id, behaviorId, artifactQuotes, trigger, stage, populations, boundary, latency, prerequisites?, exceptions?, guaranteeStatus, provenance? }]
}\nWith reconcileBehavior(record, { snapshot }), final rows use provenance { origin: 'supplied|proposed-requirement|implementation-evidence|unknown', sourceBehaviorId?, evidenceRefs?: [{ sourceId, excerpt }] }. Supplied and implementation-supported final behaviors link to a frozen snapshot behavior. An implemented behavior needs implementation-evidence refs to snapshot inputs whose kind is supplied and origin is implementation-evidence. The snapshot captures sourceQuote and typed behavior before drafting; it has no artifactQuotes or recursive sourceBehaviorId. These author-classified links preserve lineage only: they do not certify text entailment, source truth, or implementation.`;

export function reconcileBehavior(record, { snapshot } = {}) {
  const issues = [];
  const add = (code, id, severity, message) => issues.push({ code, id, severity, message });
  if (!isObject(record)) {
    add('invalid-record', 'record', 'error', 'Record must be an object.');
    return issues;
  }
  const frozen = snapshot === undefined ? null : validateSnapshot(snapshot, add);
  const behaviors = validateRows(record.behaviors, 'behaviors', add, false, frozen);
  const promises = validateRows(record.promises, 'promises', add, true, frozen);
  const byId = new Map();
  for (const behavior of behaviors) {
    if (behavior.validId && !byId.has(behavior.row.id)) byId.set(behavior.row.id, behavior);
  }
  for (const promise of promises) {
    const id = promise.row.id || 'promise';
    if (!promise.validReference) continue;
    const behavior = byId.get(promise.row.behaviorId);
    if (!behavior) {
      add('unknown-behavior', id, 'error', `Promise references unknown behavior "${promise.row.behaviorId}".`);
      continue;
    }
    if (!behavior.comparable || !promise.comparable) continue;
    compare(behavior.row, promise.row, add);
    compareProvenance(behavior.row, promise.row, id, add);
  }
  if (frozen) compareSnapshotBehaviors(behaviors, frozen, add);
  return issues;
}

function validateRows(rows, field, add, isPromise, snapshot) {
  if (!Array.isArray(rows)) {
    add('invalid-shape', field, 'error', `${field} must be an array.`);
    return [];
  }
  const seen = new Set();
  return rows.map((row, index) => {
    const fallbackId = `${field}[${index}]`;
    if (!isObject(row)) {
      add('invalid-shape', fallbackId, 'error', 'Row must be an object.');
      return { row: {}, validId: false, validReference: false, comparable: false };
    }
    const id = row.id;
    const validId = nonemptyString(id);
    if (!validId) add('missing-id', fallbackId, 'error', 'Row needs a non-empty id.');
    else if (seen.has(id)) add('duplicate-id', id, 'error', 'IDs must be unique within their row type.');
    else seen.add(id);
    const label = validId ? id : fallbackId;
    let validReference = true;
    if (isPromise) {
      validReference = nonemptyString(row.behaviorId);
      if (!validReference) add('missing-behavior-reference', label, 'error', 'Promise needs a behaviorId.');
    }
    const comparable = validateRow(row, label, add, { snapshot, isPromise });
    return { row, validId, validReference, comparable };
  });
}

function validateRow(row, id, add, { snapshot, isPromise }) {
  let valid = true;
  if (!nonemptyStringArray(row.artifactQuotes)) {
    add('missing-artifact-quotes', id, 'error', 'Row needs at least one exact artifact quote.');
    valid = false;
  }
  if (!nonemptyString(row.trigger)) {
    add('missing-trigger', id, 'error', 'Row needs a trigger.');
    valid = false;
  } else if (normal(row.trigger) === 'unknown') add('unknown-trigger', id, 'warning', 'Trigger is explicitly unresolved.');
  if (row.stage !== undefined && !STAGES.has(row.stage)) {
    add('invalid-stage', id, 'error', 'stage must be receipt, application, or unknown.');
    valid = false;
  } else if (row.stage === 'unknown') add('unknown-stage', id, 'warning', 'Receipt versus application stage is explicitly unresolved.');
  else if (snapshot && row.stage === undefined) {
    add('missing-stage', id, 'error', 'Snapshot reconciliation needs an explicit receipt or application stage.');
    valid = false;
  }
  if (!isObject(row.populations) || !POPULATION_SCOPES.has(row.populations.scope)) {
    add('invalid-population', id, 'error', 'populations.scope must be all, subset, or unknown.');
    valid = false;
  } else if (row.populations.scope === 'subset' && !nonemptyStringArray(row.populations.members)) {
    add('invalid-population', id, 'error', 'A subset population needs members.');
    valid = false;
  } else if (row.populations.scope === 'unknown') add('unknown-population', id, 'warning', 'Population is explicitly unresolved.');
  if (!BOUNDARIES.has(row.boundary)) {
    add('invalid-boundary', id, 'error', 'boundary must be online, offline, both, or unknown.');
    valid = false;
  } else if (row.boundary === 'unknown') add('unknown-boundary', id, 'warning', 'Online/offline boundary is explicitly unresolved.');
  if (!isObject(row.latency) || !LATENCY_KINDS.has(row.latency.kind)) {
    add('invalid-latency', id, 'error', 'latency.kind must be maximum, percentile, or unknown.');
    valid = false;
  } else if (row.latency.kind === 'unknown') add('unknown-latency', id, 'warning', 'Latency bound is explicitly unresolved.');
  else if (milliseconds(row.latency) === null) {
    add('invalid-latency', id, 'error', 'Latency needs a non-negative value and supported unit.');
    valid = false;
  } else if (row.latency.kind === 'percentile' && (!Number.isFinite(row.latency.percentile) || row.latency.percentile <= 0 || row.latency.percentile > 100)) {
    add('invalid-percentile', id, 'error', 'Percentile latency needs a percentile between 0 and 100.');
    valid = false;
  }
  if (row.prerequisites !== undefined && !validPrerequisites(row.prerequisites)) {
    add('invalid-prerequisites', id, 'error', 'Prerequisites must contain string required and optional arrays.');
    valid = false;
  }
  if (row.exceptions !== undefined && !nonemptyStringArray(row.exceptions, true)) {
    add('invalid-exceptions', id, 'error', 'exceptions must be a string array.');
    valid = false;
  }
  if (!GUARANTEE_STATUSES.has(row.guaranteeStatus)) {
    add('invalid-guarantee-status', id, 'error', 'guaranteeStatus must be proposed, implemented, or unknown.');
    valid = false;
  } else if (row.guaranteeStatus === 'unknown') add('unknown-guarantee-status', id, 'warning', 'Guarantee status is explicitly unresolved.');
  if (snapshot) valid = validateProvenance(row, id, add, snapshot, isPromise) && valid;
  return valid;
}

function compare(behavior, promise, add) {
  const id = promise.id;
  if (normal(behavior.trigger) === 'unknown' || normal(promise.trigger) === 'unknown') add('unresolved-trigger-coverage', id, 'warning', 'Unknown trigger cannot establish promise coverage.');
  else if (normal(behavior.trigger) !== normal(promise.trigger)) add('trigger-mismatch', id, 'error', 'Promise trigger differs from its behavior.');
  if (behavior.stage === undefined || promise.stage === undefined) {
    // Stage was introduced with snapshot reconciliation; legacy records remain comparable.
  } else if (behavior.stage === 'unknown' || promise.stage === 'unknown') add('unresolved-stage-coverage', id, 'warning', 'Unknown receipt/application stage cannot establish promise coverage.');
  else if (!stageSupports(behavior.stage, promise.stage)) add('stage-mismatch', id, 'error', 'A receipt behavior cannot establish an application promise.');
  if (behavior.populations.scope === 'unknown' || promise.populations.scope === 'unknown') add('unresolved-population-coverage', id, 'warning', 'Unknown population cannot establish promise coverage.');
  else if (!populationSupports(behavior.populations, promise.populations)) add('population-mismatch', id, 'error', 'Promise population exceeds its behavior.');
  if (behavior.boundary === 'unknown' || promise.boundary === 'unknown') add('unresolved-boundary-coverage', id, 'warning', 'Unknown boundary cannot establish promise coverage.');
  else if (!boundarySupports(behavior.boundary, promise.boundary)) add('boundary-mismatch', id, 'error', 'Promise boundary exceeds its behavior.');
  if (behavior.latency.kind === 'unknown' || promise.latency.kind === 'unknown') {
    add('unresolved-latency-coverage', id, promise.latency.kind === 'unknown' ? 'warning' : 'error', 'Unknown latency cannot establish a finite promise bound.');
  } else if (!latencySupports(behavior.latency, promise.latency)) add('latency-mismatch', id, 'error', 'Promise latency is stronger than its behavior establishes.');
  if (![...requiredPrerequisites(behavior)].every(item => requiredPrerequisites(promise).has(item))) {
    add('optional-prerequisite', id, 'error', 'Promise makes a required behavior prerequisite optional or absent.');
  }
  if (![...exceptions(behavior)].every(item => exceptions(promise).has(item))) {
    add('exception-mismatch', id, 'error', 'Promise omits a behavior exception.');
  }
  if (behavior.guaranteeStatus === 'unknown' || promise.guaranteeStatus === 'unknown') add('unresolved-guarantee-coverage', id, 'warning', 'Unknown guarantee status cannot establish promise coverage.');
  else if (behavior.guaranteeStatus === 'proposed' && promise.guaranteeStatus === 'implemented') {
    add('guarantee-status-mismatch', id, 'error', 'Promise calls a proposed behavior implemented.');
  }
}

function validateSnapshot(snapshot, add) {
  if (!isObject(snapshot) || snapshot.version !== 1 || !nonemptyString(snapshot.requestText)
    || !Array.isArray(snapshot.inputs) || !Array.isArray(snapshot.behaviors)) {
    add('invalid-snapshot', 'snapshot', 'error', 'Snapshot needs version 1, requestText, inputs, and behaviors.');
    return null;
  }
  const inputs = new Map();
  for (const input of snapshot.inputs) {
    if (!isObject(input) || !nonemptyString(input.id)) {
      add('invalid-snapshot-input', 'snapshot', 'error', 'Each snapshot input needs an id.');
      continue;
    }
    inputs.set(input.id, input);
  }
  const behaviors = new Map();
  for (const behavior of snapshot.behaviors) {
    if (!isObject(behavior) || !nonemptyString(behavior.id)) {
      add('invalid-snapshot-behavior', 'snapshot', 'error', 'Each snapshot behavior needs an id.');
      continue;
    }
    if (!validateSnapshotBehavior(behavior, snapshot.requestText, add)) continue;
    behaviors.set(behavior.id, behavior);
  }
  return { inputs, behaviors };
}

function validateSnapshotBehavior(row, requestText, add) {
  const id = row.id;
  if (!isObject(row.provenance) || !PROVENANCE_ORIGINS.has(row.provenance.origin)) {
    add('invalid-snapshot-provenance', id, 'error', 'Snapshot behavior provenance needs a recognized origin.');
    return false;
  }
  if (row.provenance.origin === 'supplied' && (!nonemptyString(row.sourceQuote) || !requestText.includes(row.sourceQuote))) {
    add('invalid-source-quote', id, 'error', 'A supplied snapshot behavior needs an exact sourceQuote from requestText.');
    return false;
  }
  return validateTypedBehavior(row, id, add);
}

function validateTypedBehavior(row, id, add) {
  // Snapshot rows precede the draft, so sourceQuote replaces final artifactQuotes.
  return validateRow({ ...row, artifactQuotes: ['snapshot source'] }, id, add, { snapshot: null, isPromise: false });
}

function validateProvenance(row, id, add, snapshot, isPromise) {
  const provenance = row.provenance;
  if (!isObject(provenance) || !PROVENANCE_ORIGINS.has(provenance.origin)) {
    add('invalid-provenance', id, 'error', 'Final row provenance needs a recognized origin when a snapshot is used.');
    return false;
  }
  let valid = true;
  const needsSource = provenance.origin === 'supplied' || provenance.origin === 'implementation-evidence';
  if (needsSource && !nonemptyString(provenance.sourceBehaviorId)) {
    add('missing-source-behavior', id, 'error', 'Supplied or implementation-supported final behavior needs a snapshot sourceBehaviorId.');
    valid = false;
  } else if (nonemptyString(provenance.sourceBehaviorId) && !snapshot.behaviors.has(provenance.sourceBehaviorId)) {
    add('unknown-source-behavior', id, 'error', 'sourceBehaviorId is not present in the frozen snapshot.');
    valid = false;
  }
  if (provenance.origin === 'unknown') add('unknown-provenance', id, 'warning', 'Behavior provenance is explicitly unresolved.');
  if (!isPromise && row.guaranteeStatus === 'implemented' && provenance.origin !== 'implementation-evidence') {
    add('unproven-implementation-status', id, 'error', 'Implemented status needs implementation-evidence provenance.');
    valid = false;
  }
  if (!isPromise && provenance.origin === 'implementation-evidence') valid = validateEvidenceRefs(provenance.evidenceRefs, id, add, snapshot) && valid;
  return valid;
}

function validateEvidenceRefs(refs, id, add, snapshot) {
  if (!Array.isArray(refs) || refs.length === 0) {
    add('missing-implementation-evidence', id, 'error', 'Implementation evidence needs at least one snapshot input reference.');
    return false;
  }
  let valid = true;
  for (const ref of refs) {
    const input = isObject(ref) && nonemptyString(ref.sourceId) ? snapshot.inputs.get(ref.sourceId) : null;
    if (!input || input.kind !== 'supplied' || input.origin !== 'implementation-evidence'
      || !nonemptyString(ref.excerpt) || !nonemptyString(input.quote) || !input.quote.includes(ref.excerpt)) {
      add('invalid-implementation-evidence', id, 'error', 'Evidence refs must quote a supplied implementation-evidence snapshot input.');
      valid = false;
    }
  }
  return valid;
}

function compareSnapshotBehaviors(behaviors, snapshot, add) {
  for (const behavior of behaviors) {
    if (!behavior.comparable || !isObject(behavior.row.provenance)) continue;
    const sourceId = behavior.row.provenance.sourceBehaviorId;
    const source = nonemptyString(sourceId) ? snapshot.behaviors.get(sourceId) : null;
    if (!source) continue;
    compare(source, behavior.row, (code, id, severity, message) => add(`source-${code}`, id, severity, message));
    const origin = behavior.row.provenance.origin;
    if ((origin === 'supplied' || origin === 'implementation-evidence') && source.provenance.origin !== origin) {
      add('source-provenance-origin-mismatch', behavior.row.id, 'error', 'A supplied or implementation-supported final behavior must retain its frozen source origin.');
    }
  }
}

function compareProvenance(behavior, promise, id, add) {
  if (promise.guaranteeStatus === 'implemented' && behavior.guaranteeStatus !== 'implemented') {
    add('implementation-status-mismatch', id, 'error', 'An implemented promise needs an implemented canonical behavior.');
  }
  if (isObject(promise.provenance) && promise.provenance.origin === 'implementation-evidence'
    && (!isObject(behavior.provenance) || behavior.provenance.origin !== 'implementation-evidence')) {
    add('implementation-provenance-mismatch', id, 'error', 'An implementation-supported promise needs an implementation-supported behavior.');
  }
  if (isObject(promise.provenance) && (promise.provenance.origin === 'supplied' || promise.provenance.origin === 'implementation-evidence')) {
    if (!isObject(behavior.provenance) || behavior.provenance.origin !== promise.provenance.origin
      || behavior.provenance.sourceBehaviorId !== promise.provenance.sourceBehaviorId) {
      add('promise-provenance-mismatch', id, 'error', 'A supplied or implementation-supported promise must retain its canonical behavior provenance.');
    }
  }
}

function populationSupports(behavior, promise) {
  if (behavior.scope === 'all') return true;
  if (promise.scope === 'all') return false;
  return [...normalizedSet(promise.members)].every(member => normalizedSet(behavior.members).has(member));
}

function boundarySupports(behavior, promise) {
  return behavior === 'both' || behavior === promise;
}

function stageSupports(behavior, promise) {
  return behavior === promise;
}

function latencySupports(behavior, promise) {
  const behaviorMs = milliseconds(behavior);
  const promiseMs = milliseconds(promise);
  if (behavior.kind === 'maximum') return promiseMs >= behaviorMs;
  if (promise.kind === 'maximum') return false;
  return promise.percentile <= behavior.percentile && promiseMs >= behaviorMs;
}

function milliseconds(latency) {
  if (!Number.isFinite(latency?.value) || latency.value < 0 || !UNIT_TO_MILLISECONDS[latency.unit]) return null;
  return latency.value * UNIT_TO_MILLISECONDS[latency.unit];
}

function requiredPrerequisites(row) {
  return normalizedSet(row.prerequisites?.required);
}

function exceptions(row) {
  return normalizedSet(row.exceptions);
}

function validPrerequisites(value) {
  return isObject(value) && (value.required === undefined || nonemptyStringArray(value.required, true))
    && (value.optional === undefined || nonemptyStringArray(value.optional, true));
}

function normalizedSet(values) {
  return new Set((Array.isArray(values) ? values : []).filter(nonemptyString).map(normal));
}

function normal(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function nonemptyStringArray(value, allowEmpty = false) {
  return Array.isArray(value) && (allowEmpty || value.length > 0) && value.every(nonemptyString);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
