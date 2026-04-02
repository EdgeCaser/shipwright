#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { extractStructuredArtifact } from './extract-structured-artifact.mjs';
import {
  IssueType,
  Severity,
  validateArtifact,
} from './validate-artifact.mjs';

export const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
export const DEFAULT_SCORING_SPEC_REF = 'docs/shipwright-v2-benchmark-scoring-spec.md';
export const DEFAULT_PROOF_METHOD_REF = 'docs/shipwright-v2-proof-method.md';

const SCORE_DIMENSIONS = Object.freeze([
  'decision_usefulness',
  'evidence_discipline',
  'internal_consistency',
  'actionability',
]);

const CONTRADICTION_TYPES = new Set([
  IssueType.METRIC_CONTRADICTION,
  IssueType.SEGMENT_CONTRADICTION,
  IssueType.CHALLENGE_FINDING_UNRESOLVED,
]);

const USABILITY_BLOCKING_WARNING_TYPES = new Set([
  IssueType.MISSING_SECTION,
  IssueType.MISSING_STRUCTURED_ARTIFACT,
]);

const VALID_STATUSES = new Set(['PASS', 'FAIL', 'DNF']);
const VALID_THRESHOLD_STATUSES = new Set(['provisional', 'final']);

export function createDefaultProvenance() {
  return {
    method_ref: DEFAULT_PROOF_METHOD_REF,
    artifact_generation: {
      independent: false,
      notes: 'Default local benchmark run; not an independent baseline.',
    },
    blind_review: {
      independent: false,
      blinded: false,
      notes: 'No independent blinded review process established.',
    },
  };
}

export function createDefaultThresholdPolicy() {
  return {
    status: 'provisional',
    spec_ref: DEFAULT_SCORING_SPEC_REF,
    notes:
      'First live comparison uses unchanged thresholds but they remain provisional until one real blind run is completed.',
  };
}

export async function loadBenchmarkScenario(filePath) {
  const resolved = path.resolve(filePath);
  const raw = JSON.parse(await readFile(resolved, 'utf8'));

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Benchmark scenario must be a JSON object: ${filePath}`);
  }

  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) {
    throw new Error(`Benchmark scenario is missing id: ${filePath}`);
  }

  if (typeof raw.inputs?.expected_artifact_type !== 'string') {
    throw new Error(`Benchmark scenario is missing inputs.expected_artifact_type: ${filePath}`);
  }

  if (typeof raw.fixtures?.first_pass_artifact !== 'string') {
    throw new Error(`Benchmark scenario is missing fixtures.first_pass_artifact: ${filePath}`);
  }

  if (typeof raw.fixtures?.final_pass_artifact !== 'string') {
    throw new Error(`Benchmark scenario is missing fixtures.final_pass_artifact: ${filePath}`);
  }

  return {
    ...raw,
    source_path: resolved,
  };
}

export async function loadBenchmarkSuiteSummary(filePath, options = {}) {
  const resolved = path.resolve(filePath);
  let raw;

  try {
    raw = JSON.parse(await readFile(resolved, 'utf8'));
  } catch (error) {
    throw new Error(
      `${options.label || 'Benchmark suite summary'} could not be read: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return validateBenchmarkSuiteSummary(raw, {
    label: options.label || `Benchmark suite summary (${resolved})`,
  });
}

export function buildBenchmarkSuiteSummary(options = {}) {
  const {
    results = [],
    generatedAt = new Date().toISOString(),
    scoringSpecRef = DEFAULT_SCORING_SPEC_REF,
    provenance = createDefaultProvenance(),
    thresholdPolicy = createDefaultThresholdPolicy(),
  } = options;

  const statusCounts = { PASS: 0, FAIL: 0, DNF: 0 };
  for (const result of results) {
    if (result?.status && statusCounts[result.status] !== undefined) {
      statusCounts[result.status] += 1;
    }
  }

  return {
    generated_at: generatedAt,
    scoring_spec_ref: scoringSpecRef,
    scenario_count: results.length,
    status_counts: statusCounts,
    mean_first_pass_blind_rating: computeMean(
      results.map((result) => result?.first_pass?.blind_rating),
    ),
    mean_final_pass_blind_rating: computeMean(
      results.map((result) => result?.final_pass?.blind_rating),
    ),
    provenance: normalizeProvenance(provenance),
    threshold_policy: normalizeThresholdPolicy(thresholdPolicy),
    publishable_proof_ready: false,
    results,
  };
}

export function validateBenchmarkSuiteSummary(summary, options = {}) {
  const label = options.label || 'Benchmark suite summary';

  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  if (!Array.isArray(summary.results)) {
    throw new Error(`${label} is missing a results array.`);
  }

  if (!summary.provenance) {
    throw new Error(
      `${label} is missing provenance metadata. Pre-schema summaries must be regenerated or upgraded before use.`,
    );
  }

  if (!summary.threshold_policy) {
    throw new Error(
      `${label} is missing threshold_policy metadata. Pre-schema summaries must be regenerated or upgraded before use.`,
    );
  }

  validateProvenance(summary.provenance, label);
  validateThresholdPolicy(summary.threshold_policy, label);

  if (!Number.isInteger(summary.scenario_count) || summary.scenario_count < 0) {
    throw new Error(`${label} has an invalid scenario_count.`);
  }

  if (summary.scenario_count !== summary.results.length) {
    throw new Error(`${label} scenario_count does not match results length.`);
  }

  for (const result of summary.results) {
    validateScenarioResult(result, label);
  }

  return summary;
}

export function compareBenchmarkSuites(currentSummary, baselineSummary) {
  const current = validateBenchmarkSuiteSummary(currentSummary, {
    label: 'Current benchmark summary',
  });
  const baseline = validateBenchmarkSuiteSummary(baselineSummary, {
    label: 'Baseline benchmark summary',
  });

  const currentResultsById = mapResultsByScenarioId(current.results, 'Current benchmark summary');
  const baselineResultsById = mapResultsByScenarioId(
    baseline.results,
    'Baseline benchmark summary',
  );
  assertMatchingScenarioSets(currentResultsById, baselineResultsById);

  const firstPassBlindRatingDelta = computeNumericDelta(
    current.mean_first_pass_blind_rating,
    baseline.mean_first_pass_blind_rating,
  );
  const firstPassUsableRateDelta = computeNumericDelta(
    computeFirstPassUsableRate(current.results),
    computeFirstPassUsableRate(baseline.results),
  );
  const firstPassValidatorErrorRateDelta = computeNumericDelta(
    computeFirstPassValidatorErrorRate(current.results),
    computeFirstPassValidatorErrorRate(baseline.results),
  );

  const comparison = {
    metrics: {
      first_pass_blind_rating: buildMetricComparison(
        current.mean_first_pass_blind_rating,
        baseline.mean_first_pass_blind_rating,
        'points',
      ),
      first_pass_usable_rate: buildMetricComparison(
        computeFirstPassUsableRate(current.results),
        computeFirstPassUsableRate(baseline.results),
        'percentage_points',
      ),
      first_pass_validator_error_rate: buildMetricComparison(
        computeFirstPassValidatorErrorRate(current.results),
        computeFirstPassValidatorErrorRate(baseline.results),
        'percentage_points',
      ),
      mean_time_to_first_usable_seconds: buildMetricComparison(
        computeMean(current.results.map((result) => result.final_pass.time_to_first_usable_artifact_seconds)),
        computeMean(baseline.results.map((result) => result.final_pass.time_to_first_usable_artifact_seconds)),
        'seconds',
      ),
      mean_revision_count: buildMetricComparison(
        computeMean(current.results.map((result) => result.final_pass.revision_count)),
        computeMean(baseline.results.map((result) => result.final_pass.revision_count)),
        'count',
      ),
    },
    materially_worse_first_pass:
      (Number.isFinite(firstPassBlindRatingDelta) && firstPassBlindRatingDelta <= -10) ||
      (Number.isFinite(firstPassUsableRateDelta) && firstPassUsableRateDelta <= -20) ||
      (Number.isFinite(firstPassValidatorErrorRateDelta) && firstPassValidatorErrorRateDelta >= 20),
    scenario_status_changes: collectScenarioStatusChanges(
      currentResultsById,
      baselineResultsById,
    ),
    publishable_proof_ready:
      summaryHasIndependentProvenance(current) && summaryHasIndependentProvenance(baseline),
    comparison_interpretation:
      current.threshold_policy.status === 'final' && baseline.threshold_policy.status === 'final'
        ? 'final'
        : 'provisional',
  };

  return comparison;
}

export async function runBenchmarkScenario(scenario) {
  const scenarioRecord = scenario?.source_path
    ? scenario
    : await loadBenchmarkScenario(scenario);

  const relatedArtifacts = await loadRelatedArtifacts(scenarioRecord);
  const blindReview = await loadBlindReview(scenarioRecord);
  const firstPass = await evaluateScenarioPass(
    scenarioRecord,
    'first_pass',
    relatedArtifacts,
    blindReview,
  );
  const finalPass = await evaluateScenarioPass(
    scenarioRecord,
    'final_pass',
    relatedArtifacts,
    blindReview,
  );

  return {
    scenario_id: scenarioRecord.id,
    status: deriveScenarioStatus(finalPass),
    first_pass: {
      usable: firstPass.usable,
      validator_error_count: firstPass.validator_error_count,
      contradiction_count: firstPass.contradiction_count,
      blind_rating: firstPass.blind_rating,
    },
    final_pass: {
      usable: finalPass.usable,
      time_to_first_usable_artifact_seconds: finalPass.usable
        ? normalizeTimeToFirstUsable(
            scenarioRecord.run_metadata?.time_to_first_usable_artifact_seconds,
            scenarioRecord.id,
          )
        : null,
      revision_count: normalizeRevisionCount(
        scenarioRecord.run_metadata?.revision_count,
        scenarioRecord.id,
      ),
      validator_error_count: finalPass.validator_error_count,
      contradiction_count: finalPass.contradiction_count,
      blind_rating: finalPass.blind_rating,
    },
    delta: {
      usable_changed: finalPass.usable !== firstPass.usable,
      blind_rating_change: computeNumericDelta(
        finalPass.blind_rating,
        firstPass.blind_rating,
      ),
      contradiction_count_change:
        finalPass.contradiction_count - firstPass.contradiction_count,
      validator_error_count_change:
        finalPass.validator_error_count - firstPass.validator_error_count,
    },
    diagnostics: {
      title: scenarioRecord.title,
      expected_artifact_type: scenarioRecord.inputs.expected_artifact_type,
      scoring_spec_ref:
        scenarioRecord.inputs.scoring_spec_ref || DEFAULT_SCORING_SPEC_REF,
      first_pass_issue_types: firstPass.issues.map((issue) => issue.type),
      final_pass_issue_types: finalPass.issues.map((issue) => issue.type),
    },
  };
}

export async function runBenchmarkSuite(options = {}) {
  const scenarioDir = path.resolve(options.scenarioDir || DEFAULT_SCENARIO_DIR);
  const scenarioIds = new Set(options.scenarioIds || []);
  const publish = Boolean(options.publish);
  const baselineSummary = options.baselineSummary || null;

  const scenarioFiles = await discoverScenarioFiles(scenarioDir);
  const selectedScenarioFiles = scenarioFiles.filter((filePath) => {
    if (scenarioIds.size === 0) return true;
    return scenarioIds.has(path.basename(filePath, '.json'));
  });

  if (selectedScenarioFiles.length === 0) {
    throw new Error(`No benchmark scenarios found in ${scenarioDir}`);
  }

  const results = [];
  for (const scenarioFile of selectedScenarioFiles) {
    const scenario = await loadBenchmarkScenario(scenarioFile);
    results.push(await runBenchmarkScenario(scenario));
  }

  const summary = buildBenchmarkSuiteSummary({
    results,
    provenance: options.provenance,
    thresholdPolicy: options.thresholdPolicy,
  });

  if (publish) {
    ensureNumericBlindRatings(summary, 'Current benchmark summary');
  }

  if (baselineSummary) {
    const comparison = compareBenchmarkSuites(summary, baselineSummary);
    summary.comparison = comparison;
    summary.publishable_proof_ready = comparison.publishable_proof_ready;
    summary.comparison_interpretation = comparison.comparison_interpretation;
  } else {
    summary.publishable_proof_ready = false;
  }

  if (options.outPath) {
    const outPath = path.resolve(options.outPath);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  }

  return summary;
}

function normalizeProvenance(provenance) {
  const defaults = createDefaultProvenance();
  return {
    method_ref:
      typeof provenance?.method_ref === 'string' && provenance.method_ref.trim().length > 0
        ? provenance.method_ref
        : defaults.method_ref,
    artifact_generation: {
      independent:
        typeof provenance?.artifact_generation?.independent === 'boolean'
          ? provenance.artifact_generation.independent
          : defaults.artifact_generation.independent,
      notes:
        typeof provenance?.artifact_generation?.notes === 'string'
          ? provenance.artifact_generation.notes
          : defaults.artifact_generation.notes,
    },
    blind_review: {
      independent:
        typeof provenance?.blind_review?.independent === 'boolean'
          ? provenance.blind_review.independent
          : defaults.blind_review.independent,
      blinded:
        typeof provenance?.blind_review?.blinded === 'boolean'
          ? provenance.blind_review.blinded
          : defaults.blind_review.blinded,
      notes:
        typeof provenance?.blind_review?.notes === 'string'
          ? provenance.blind_review.notes
          : defaults.blind_review.notes,
    },
  };
}

function normalizeThresholdPolicy(thresholdPolicy) {
  const defaults = createDefaultThresholdPolicy();
  return {
    status:
      typeof thresholdPolicy?.status === 'string' &&
      VALID_THRESHOLD_STATUSES.has(thresholdPolicy.status)
        ? thresholdPolicy.status
        : defaults.status,
    spec_ref:
      typeof thresholdPolicy?.spec_ref === 'string' && thresholdPolicy.spec_ref.trim().length > 0
        ? thresholdPolicy.spec_ref
        : defaults.spec_ref,
    notes:
      typeof thresholdPolicy?.notes === 'string'
        ? thresholdPolicy.notes
        : defaults.notes,
  };
}

function validateProvenance(provenance, label) {
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    throw new Error(`${label} has invalid provenance metadata.`);
  }

  if (typeof provenance.method_ref !== 'string' || provenance.method_ref.trim().length === 0) {
    throw new Error(`${label} has invalid provenance.method_ref.`);
  }

  if (typeof provenance.artifact_generation?.independent !== 'boolean') {
    throw new Error(`${label} has invalid provenance.artifact_generation.independent.`);
  }

  if (typeof provenance.blind_review?.independent !== 'boolean') {
    throw new Error(`${label} has invalid provenance.blind_review.independent.`);
  }

  if (typeof provenance.blind_review?.blinded !== 'boolean') {
    throw new Error(`${label} has invalid provenance.blind_review.blinded.`);
  }
}

function validateThresholdPolicy(thresholdPolicy, label) {
  if (!thresholdPolicy || typeof thresholdPolicy !== 'object' || Array.isArray(thresholdPolicy)) {
    throw new Error(`${label} has invalid threshold_policy metadata.`);
  }

  if (!VALID_THRESHOLD_STATUSES.has(thresholdPolicy.status)) {
    throw new Error(`${label} has invalid threshold_policy.status.`);
  }

  if (
    typeof thresholdPolicy.spec_ref !== 'string' ||
    thresholdPolicy.spec_ref.trim().length === 0
  ) {
    throw new Error(`${label} has invalid threshold_policy.spec_ref.`);
  }
}

function validateScenarioResult(result, label) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(`${label} contains an invalid scenario result.`);
  }

  if (typeof result.scenario_id !== 'string' || result.scenario_id.trim().length === 0) {
    throw new Error(`${label} contains a scenario result without scenario_id.`);
  }

  if (!VALID_STATUSES.has(result.status)) {
    throw new Error(`${label} contains invalid status for scenario "${result.scenario_id}".`);
  }

  validatePassShape(result.first_pass, result.scenario_id, 'first_pass', label);
  validatePassShape(result.final_pass, result.scenario_id, 'final_pass', label);
}

function validatePassShape(pass, scenarioId, passKey, label) {
  if (!pass || typeof pass !== 'object' || Array.isArray(pass)) {
    throw new Error(`${label} is missing ${passKey} for scenario "${scenarioId}".`);
  }

  if (typeof pass.usable !== 'boolean') {
    throw new Error(`${label} has invalid ${passKey}.usable for scenario "${scenarioId}".`);
  }

  for (const field of ['validator_error_count', 'contradiction_count']) {
    if (!Number.isInteger(pass[field]) || pass[field] < 0) {
      throw new Error(`${label} has invalid ${passKey}.${field} for scenario "${scenarioId}".`);
    }
  }

  if (
    pass.blind_rating !== null &&
    pass.blind_rating !== undefined &&
    (!Number.isFinite(pass.blind_rating) || pass.blind_rating < 0)
  ) {
    throw new Error(`${label} has invalid ${passKey}.blind_rating for scenario "${scenarioId}".`);
  }

  if (passKey === 'final_pass') {
    if (
      pass.time_to_first_usable_artifact_seconds !== null &&
      pass.time_to_first_usable_artifact_seconds !== undefined &&
      (!Number.isFinite(pass.time_to_first_usable_artifact_seconds) ||
        pass.time_to_first_usable_artifact_seconds < 0)
    ) {
      throw new Error(
        `${label} has invalid final_pass.time_to_first_usable_artifact_seconds for scenario "${scenarioId}".`,
      );
    }

    if (!Number.isInteger(pass.revision_count) || pass.revision_count < 0) {
      throw new Error(`${label} has invalid final_pass.revision_count for scenario "${scenarioId}".`);
    }
  }
}

function summaryHasIndependentProvenance(summary) {
  return Boolean(
    summary?.provenance?.artifact_generation?.independent &&
      summary?.provenance?.blind_review?.independent &&
      summary?.provenance?.blind_review?.blinded,
  );
}

function ensureNumericBlindRatings(summary, label) {
  for (const result of summary.results) {
    if (!Number.isFinite(result.first_pass.blind_rating)) {
      throw new Error(
        `${label} cannot be published because scenario "${result.scenario_id}" is missing a numeric first_pass.blind_rating.`,
      );
    }
    if (!Number.isFinite(result.final_pass.blind_rating)) {
      throw new Error(
        `${label} cannot be published because scenario "${result.scenario_id}" is missing a numeric final_pass.blind_rating.`,
      );
    }
  }
}

function buildMetricComparison(current, baseline, unit) {
  return {
    current: current ?? null,
    baseline: baseline ?? null,
    delta: computeNumericDelta(current, baseline),
    unit,
  };
}

function computeFirstPassUsableRate(results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  return roundToOneDecimal(
    (results.filter((result) => result.first_pass.usable).length / results.length) * 100,
  );
}

function computeFirstPassValidatorErrorRate(results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  return roundToOneDecimal(
    (results.filter((result) => result.first_pass.validator_error_count > 0).length /
      results.length) *
      100,
  );
}

function mapResultsByScenarioId(results, label) {
  const byId = new Map();
  for (const result of results) {
    if (byId.has(result.scenario_id)) {
      throw new Error(`${label} contains duplicate scenario_id "${result.scenario_id}".`);
    }
    byId.set(result.scenario_id, result);
  }
  return byId;
}

function assertMatchingScenarioSets(currentResultsById, baselineResultsById) {
  const currentIds = [...currentResultsById.keys()].sort();
  const baselineIds = [...baselineResultsById.keys()].sort();

  if (currentIds.length !== baselineIds.length) {
    throw new Error(
      'Current and baseline summaries must cover the same scenario ids before comparison.',
    );
  }

  for (let index = 0; index < currentIds.length; index += 1) {
    if (currentIds[index] !== baselineIds[index]) {
      throw new Error(
        'Current and baseline summaries must cover the same scenario ids before comparison.',
      );
    }
  }
}

function collectScenarioStatusChanges(currentResultsById, baselineResultsById) {
  const changes = [];
  for (const scenarioId of [...currentResultsById.keys()].sort()) {
    const current = currentResultsById.get(scenarioId);
    const baseline = baselineResultsById.get(scenarioId);
    if (current.status === baseline.status) continue;

    changes.push({
      scenario_id: scenarioId,
      current_status: current.status,
      baseline_status: baseline.status,
    });
  }

  return changes;
}

function normalizeTimeToFirstUsable(value, scenarioId) {
  if (value === null || value === undefined) {
    throw new Error(`Scenario "${scenarioId}" is missing run_metadata.time_to_first_usable_artifact_seconds.`);
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `Scenario "${scenarioId}" has invalid time_to_first_usable_artifact_seconds.`,
    );
  }

  return value;
}

function normalizeRevisionCount(value, scenarioId) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Scenario "${scenarioId}" has invalid run_metadata.revision_count.`);
  }
  return value;
}

async function evaluateScenarioPass(scenario, passKey, relatedArtifacts, blindReview) {
  const fixturePath = resolveScenarioPath(
    scenario,
    scenario.fixtures[`${passKey}_artifact`],
  );
  const text = await readFile(fixturePath, 'utf8');
  const validation = validateArtifact(text, buildValidationOptions(scenario, relatedArtifacts));

  return {
    issues: validation.issues,
    artifact: validation.artifact,
    usable: isArtifactUsable(validation.issues),
    validator_error_count: validation.issues.filter(
      (issue) => issue.severity === Severity.ERROR,
    ).length,
    contradiction_count: countContradictions(validation.issues),
    blind_rating: computeBlindRating(blindReview, passKey),
  };
}

function buildValidationOptions(scenario, relatedArtifacts) {
  return {
    expectSections: Array.isArray(scenario.validator?.expect_sections)
      ? scenario.validator.expect_sections
      : [],
    expectStructured:
      scenario.validator?.expect_structured ??
      Boolean(scenario.inputs?.expected_artifact_type),
    artifactType: scenario.inputs?.expected_artifact_type,
    relatedArtifacts,
  };
}

function isArtifactUsable(issues) {
  for (const issue of issues) {
    if (issue.severity === Severity.ERROR) return false;
    if (USABILITY_BLOCKING_WARNING_TYPES.has(issue.type)) return false;
  }
  return true;
}

function countContradictions(issues) {
  const signatures = new Set();

  for (const issue of issues) {
    if (!CONTRADICTION_TYPES.has(issue.type)) continue;
    signatures.add(`${issue.type}|${issue.lineNumber}|${issue.message}`);
  }

  return signatures.size;
}

function computeBlindRating(blindReview, passKey) {
  if (!blindReview) return null;

  const raters = Array.isArray(blindReview.raters) ? blindReview.raters : [];
  if (raters.length < 3) {
    throw new Error('Blind review requires at least 3 raters.');
  }

  let total = 0;
  for (const rater of raters) {
    const passScores = rater?.[passKey];
    if (!passScores || typeof passScores !== 'object') {
      throw new Error(`Blind review is missing ${passKey} scores for rater "${rater?.rater_id || 'unknown'}".`);
    }

    let raterTotal = 0;
    for (const dimension of SCORE_DIMENSIONS) {
      const score = passScores[dimension];
      if (!Number.isFinite(score) || score < 1 || score > 5) {
        throw new Error(
          `Blind review score must be between 1 and 5 for ${dimension}.`,
        );
      }
      raterTotal += score;
    }

    total += raterTotal / SCORE_DIMENSIONS.length;
  }

  return roundToOneDecimal((total / raters.length / 5) * 100);
}

function deriveScenarioStatus(finalPass) {
  if (!finalPass.usable) return 'DNF';

  const readinessStatus = finalPass.artifact?.pass_fail_readiness?.status;
  return readinessStatus === 'FAIL' ? 'FAIL' : 'PASS';
}

function computeNumericDelta(currentValue, baselineValue) {
  if (!Number.isFinite(currentValue) || !Number.isFinite(baselineValue)) {
    return null;
  }

  return roundToOneDecimal(currentValue - baselineValue);
}

function computeMean(values) {
  const numericValues = values.filter((value) => Number.isFinite(value));
  if (numericValues.length === 0) return null;

  const sum = numericValues.reduce((total, value) => total + value, 0);
  return roundToOneDecimal(sum / numericValues.length);
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

async function discoverScenarioFiles(scenarioDir) {
  const entries = await readdir(scenarioDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(scenarioDir, entry.name))
    .sort();
}

async function loadRelatedArtifacts(scenario) {
  const relatedPaths = Array.isArray(scenario.fixtures?.related_artifacts)
    ? scenario.fixtures.related_artifacts
    : [];

  const relatedArtifacts = [];
  for (const relatedPath of relatedPaths) {
    const raw = await readFile(resolveScenarioPath(scenario, relatedPath), 'utf8');
    const ext = path.extname(relatedPath).toLowerCase();
    if (ext === '.json') {
      relatedArtifacts.push(JSON.parse(raw));
      continue;
    }

    const extracted = extractStructuredArtifact(raw);
    if (extracted.error) {
      throw new Error(
        `Related artifact contains invalid structured JSON: ${relatedPath}: ${extracted.error}`,
      );
    }
    if (!extracted.artifact) {
      throw new Error(`Related artifact is missing structured payload: ${relatedPath}`);
    }
    relatedArtifacts.push(extracted.artifact);
  }

  return relatedArtifacts;
}

async function loadBlindReview(scenario) {
  const reviewPath = scenario.fixtures?.blind_review;
  if (!reviewPath) return null;

  return JSON.parse(
    await readFile(resolveScenarioPath(scenario, reviewPath), 'utf8'),
  );
}

function resolveScenarioPath(scenario, relativePath) {
  return path.resolve(path.dirname(scenario.source_path), relativePath);
}

function collectFlagValues(argv, flagName) {
  const values = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === flagName && argv[index + 1]) {
      values.push(argv[index + 1]);
      index += 1;
    }
  }
  return values;
}

function readFlagValue(argv, flagName, fallback) {
  const index = argv.findIndex((arg) => arg === flagName);
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return fallback;
}

function formatSuiteSummary(summary) {
  const lines = [
    `Benchmark suite: ${summary.scenario_count} scenario(s)`,
    `Status counts: PASS ${summary.status_counts.PASS} | FAIL ${summary.status_counts.FAIL} | DNF ${summary.status_counts.DNF}`,
    `Publishable proof ready: ${summary.publishable_proof_ready ? 'yes' : 'no'}`,
    `Threshold policy: ${summary.threshold_policy.status}`,
  ];

  if (summary.comparison) {
    lines.push(
      `Comparison interpretation: ${summary.comparison_interpretation}`,
    );
    lines.push(
      `Materially worse first pass: ${summary.comparison.materially_worse_first_pass ? 'yes' : 'no'}`,
    );
  }

  for (const result of summary.results) {
    lines.push(
      `- ${result.status} ${result.scenario_id} | revisions ${result.final_pass.revision_count} | first-pass errors ${result.first_pass.validator_error_count} | final errors ${result.final_pass.validator_error_count}`,
    );
  }

  return lines.join('\n');
}

async function main(argv = process.argv.slice(2)) {
  const scenarioDir = readFlagValue(argv, '--scenario-dir', DEFAULT_SCENARIO_DIR);
  const outPath = readFlagValue(argv, '--out', null);
  const format = readFlagValue(argv, '--format', 'text');
  const scenarioIds = collectFlagValues(argv, '--scenario');
  const publish = argv.includes('--publish');
  const baselinePath = readFlagValue(argv, '--baseline', null);

  let baselineSummary = null;
  if (baselinePath) {
    baselineSummary = await loadBenchmarkSuiteSummary(baselinePath, {
      label: 'Baseline benchmark summary',
    });
  }

  const summary = await runBenchmarkSuite({
    scenarioDir,
    scenarioIds,
    outPath,
    publish,
    baselineSummary,
  });

  if (format === 'json') {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(formatSuiteSummary(summary));
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
