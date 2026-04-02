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

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_SCORING_SPEC_REF = 'docs/shipwright-v2-benchmark-scoring-spec.md';

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

export async function runBenchmarkScenario(scenario, options = {}) {
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

  const status = deriveScenarioStatus(finalPass);
  const result = {
    scenario_id: scenarioRecord.id,
    status,
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

  return result;
}

export async function runBenchmarkSuite(options = {}) {
  const scenarioDir = path.resolve(options.scenarioDir || DEFAULT_SCENARIO_DIR);
  const scenarioIds = new Set(options.scenarioIds || []);
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

  const statusCounts = { PASS: 0, FAIL: 0, DNF: 0 };
  for (const result of results) {
    statusCounts[result.status] += 1;
  }

  const summary = {
    generated_at: new Date().toISOString(),
    scoring_spec_ref: DEFAULT_SCORING_SPEC_REF,
    scenario_count: results.length,
    status_counts: statusCounts,
    mean_first_pass_blind_rating: computeMean(
      results.map((result) => result.first_pass.blind_rating),
    ),
    mean_final_pass_blind_rating: computeMean(
      results.map((result) => result.final_pass.blind_rating),
    ),
    results,
  };

  if (options.outPath) {
    const outPath = path.resolve(options.outPath);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(`${outPath}`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  }

  return summary;
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

function computeNumericDelta(finalValue, firstValue) {
  if (!Number.isFinite(finalValue) || !Number.isFinite(firstValue)) {
    return null;
  }

  return roundToOneDecimal(finalValue - firstValue);
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
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === flagName && argv[i + 1]) {
      values.push(argv[i + 1]);
      i += 1;
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
  ];

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

  const summary = await runBenchmarkSuite({
    scenarioDir,
    scenarioIds,
    outPath,
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
