const BOUNDARIES = new Set(['online', 'offline', 'both', 'unknown']);
const GUARANTEE_STATUSES = new Set(['proposed', 'implemented', 'unknown']);
const LATENCY_KINDS = new Set(['maximum', 'percentile', 'unknown']);
const POPULATION_SCOPES = new Set(['all', 'subset', 'unknown']);
const UNIT_TO_MILLISECONDS = {
  ms: 1,
  seconds: 1000,
  minutes: 60_000,
  hours: 3_600_000,
};

export const behaviorHelp = `Behavior record:\n{
  behaviors: [{ id, artifactQuotes, trigger, populations: { scope: 'all|subset|unknown', members? }, boundary: 'online|offline|both|unknown', latency: { kind: 'maximum|percentile|unknown', percentile?, value?, unit? }, prerequisites?: { required?, optional? }, exceptions?, guaranteeStatus: 'proposed|implemented|unknown' }],
  promises: [{ id, behaviorId, artifactQuotes, trigger, populations, boundary, latency, prerequisites?, exceptions?, guaranteeStatus }]
}\nUse structured fields only. Promises link to canonical behaviors; quotes are exact final-artifact excerpts.`;

export function reconcileBehavior(record) {
  const issues = [];
  const add = (code, id, severity, message) => issues.push({ code, id, severity, message });
  if (!isObject(record)) {
    add('invalid-record', 'record', 'error', 'Record must be an object.');
    return issues;
  }
  const behaviors = validateRows(record.behaviors, 'behaviors', add, false);
  const promises = validateRows(record.promises, 'promises', add, true);
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
  }
  return issues;
}

function validateRows(rows, field, add, isPromise) {
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
    const comparable = validateRow(row, label, add);
    return { row, validId, validReference, comparable };
  });
}

function validateRow(row, id, add) {
  let valid = true;
  if (!nonemptyStringArray(row.artifactQuotes)) {
    add('missing-artifact-quotes', id, 'error', 'Row needs at least one exact artifact quote.');
    valid = false;
  }
  if (!nonemptyString(row.trigger)) {
    add('missing-trigger', id, 'error', 'Row needs a trigger.');
    valid = false;
  } else if (normal(row.trigger) === 'unknown') add('unknown-trigger', id, 'warning', 'Trigger is explicitly unresolved.');
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
  return valid;
}

function compare(behavior, promise, add) {
  const id = promise.id;
  if (normal(behavior.trigger) === 'unknown' || normal(promise.trigger) === 'unknown') add('unresolved-trigger-coverage', id, 'warning', 'Unknown trigger cannot establish promise coverage.');
  else if (normal(behavior.trigger) !== normal(promise.trigger)) add('trigger-mismatch', id, 'error', 'Promise trigger differs from its behavior.');
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

function populationSupports(behavior, promise) {
  if (behavior.scope === 'all') return true;
  if (promise.scope === 'all') return false;
  return [...normalizedSet(promise.members)].every(member => normalizedSet(behavior.members).has(member));
}

function boundarySupports(behavior, promise) {
  return behavior === 'both' || behavior === promise;
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
