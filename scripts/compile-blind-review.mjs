#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  buildBenchmarkSuiteSummary,
  loadBenchmarkSuiteSummary,
  validateBenchmarkSuiteSummary,
} from './run-benchmarks.mjs';
import {
  SCORE_DIMENSIONS,
  computeBlindRatingFromRaters,
  validateReviewResponseScoreBlock,
} from './blind-review-utils.mjs';

const REVIEW_SCHEMA_VERSION = '1.0.0';

export async function compileBlindReviewFromFiles(options = {}) {
  const currentSummary = await loadBenchmarkSuiteSummary(options.currentPath, {
    label: 'Current benchmark summary',
  });
  const baselineSummary = await loadBenchmarkSuiteSummary(options.baselinePath, {
    label: 'Baseline benchmark summary',
  });
  const adminManifest = await loadAdminManifest(options.adminManifestPath);
  const reviewerResponses = await loadReviewerResponses(
    options.reviewsDir,
    adminManifest.review_run_id,
  );

  const compiled = compileBlindReview({
    currentSummary,
    baselineSummary,
    adminManifest,
    reviewerResponses,
  });

  if (options.currentOutPath) {
    await writeJsonFile(options.currentOutPath, compiled.currentSummary);
  }
  if (options.baselineOutPath) {
    await writeJsonFile(options.baselineOutPath, compiled.baselineSummary);
  }
  if (options.aggregateOutPath) {
    await writeJsonFile(options.aggregateOutPath, compiled.reviewAggregate);
  }

  return compiled;
}

export function compileBlindReview(options = {}) {
  const currentSummary = validateBenchmarkSuiteSummary(options.currentSummary, {
    label: 'Current benchmark summary',
  });
  const baselineSummary = validateBenchmarkSuiteSummary(options.baselineSummary, {
    label: 'Baseline benchmark summary',
  });
  const adminManifest = validateAdminManifest(options.adminManifest);
  const reviewerResponses = validateReviewerResponses(
    options.reviewerResponses,
    adminManifest.review_run_id,
  );

  const currentScenarioIds = new Set(currentSummary.results.map((result) => result.scenario_id));
  const baselineScenarioIds = new Set(baselineSummary.results.map((result) => result.scenario_id));
  const assignmentScenarioIds = new Set(
    adminManifest.assignments.map((assignment) => assignment.scenario_id),
  );
  assertMatchingScenarioIds(currentScenarioIds, baselineScenarioIds);
  assertMatchingScenarioIds(currentScenarioIds, assignmentScenarioIds);

  const groupedRaters = groupReviewerResponses(adminManifest.assignments, reviewerResponses);
  const currentResults = applyBlindRatings(currentSummary.results, groupedRaters.current);
  const baselineResults = applyBlindRatings(baselineSummary.results, groupedRaters.baseline);

  const currentCompiled = buildBenchmarkSuiteSummary({
    results: currentResults,
    scoringSpecRef: currentSummary.scoring_spec_ref,
    thresholdPolicy: currentSummary.threshold_policy,
    provenance: mergeProvenance(
      currentSummary.provenance,
      adminManifest.provenance.current,
    ),
  });
  const baselineCompiled = buildBenchmarkSuiteSummary({
    results: baselineResults,
    scoringSpecRef: baselineSummary.scoring_spec_ref,
    thresholdPolicy: baselineSummary.threshold_policy,
    provenance: mergeProvenance(
      baselineSummary.provenance,
      adminManifest.provenance.baseline,
    ),
  });

  const reviewAggregate = {
    schema_version: REVIEW_SCHEMA_VERSION,
    review_run_id: adminManifest.review_run_id,
    reviewer_count: reviewerResponses.length,
    scenario_count: new Set(
      adminManifest.assignments.map((assignment) => assignment.scenario_id),
    ).size,
    current_mean_first_pass_blind_rating: currentCompiled.mean_first_pass_blind_rating,
    current_mean_final_pass_blind_rating: currentCompiled.mean_final_pass_blind_rating,
    baseline_mean_first_pass_blind_rating: baselineCompiled.mean_first_pass_blind_rating,
    baseline_mean_final_pass_blind_rating: baselineCompiled.mean_final_pass_blind_rating,
  };

  return {
    currentSummary: currentCompiled,
    baselineSummary: baselineCompiled,
    reviewAggregate,
  };
}

async function loadAdminManifest(filePath) {
  const resolved = path.resolve(filePath);
  const raw = JSON.parse(await readFile(resolved, 'utf8'));
  return validateAdminManifest(raw);
}

function validateAdminManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Admin manifest must be a JSON object.');
  }

  if (manifest.schema_version !== REVIEW_SCHEMA_VERSION) {
    throw new Error('Admin manifest has an unsupported schema_version.');
  }

  if (typeof manifest.review_run_id !== 'string' || manifest.review_run_id.trim().length === 0) {
    throw new Error('Admin manifest is missing review_run_id.');
  }

  if (!Array.isArray(manifest.assignments) || manifest.assignments.length === 0) {
    throw new Error('Admin manifest must include assignments.');
  }

  validateProvenanceOverlay(manifest.provenance?.current, 'Current');
  validateProvenanceOverlay(manifest.provenance?.baseline, 'Baseline');

  const artifactIds = new Set();
  for (const assignment of manifest.assignments) {
    if (typeof assignment.scenario_id !== 'string' || assignment.scenario_id.trim().length === 0) {
      throw new Error('Admin manifest assignment is missing scenario_id.');
    }
    if (assignment.phase !== 'first_pass' && assignment.phase !== 'final_pass') {
      throw new Error(`Admin manifest assignment has invalid phase for scenario "${assignment.scenario_id}".`);
    }
    if (assignment.origin !== 'current' && assignment.origin !== 'baseline') {
      throw new Error(`Admin manifest assignment has invalid origin for scenario "${assignment.scenario_id}".`);
    }
    if (typeof assignment.artifact_id !== 'string' || assignment.artifact_id.trim().length === 0) {
      throw new Error(`Admin manifest assignment is missing artifact_id for scenario "${assignment.scenario_id}".`);
    }
    if (artifactIds.has(assignment.artifact_id)) {
      throw new Error(`Admin manifest contains duplicate artifact_id "${assignment.artifact_id}".`);
    }
    artifactIds.add(assignment.artifact_id);
  }

  return manifest;
}

function validateProvenanceOverlay(provenance, label) {
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    throw new Error(`${label} provenance overlay must be an object.`);
  }

  if (typeof provenance.artifact_generation?.independent !== 'boolean') {
    throw new Error(`${label} provenance overlay is missing artifact_generation.independent.`);
  }
  if (typeof provenance.blind_review?.independent !== 'boolean') {
    throw new Error(`${label} provenance overlay is missing blind_review.independent.`);
  }
  if (typeof provenance.blind_review?.blinded !== 'boolean') {
    throw new Error(`${label} provenance overlay is missing blind_review.blinded.`);
  }
}

async function loadReviewerResponses(reviewsDir, reviewRunId) {
  const resolvedDir = path.resolve(reviewsDir);
  const entries = await readdir(resolvedDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(resolvedDir, entry.name))
    .sort();

  const responses = [];
  for (const filePath of files) {
    const raw = JSON.parse(await readFile(filePath, 'utf8'));
    responses.push(validateReviewerResponse(raw, reviewRunId, filePath));
  }

  return responses;
}

function validateReviewerResponses(reviewerResponses, reviewRunId) {
  const normalized = Array.isArray(reviewerResponses) ? reviewerResponses : [];
  if (normalized.length < 3) {
    throw new Error('Blind review compilation requires at least 3 reviewer scorecards.');
  }

  const seenReviewers = new Set();
  for (const response of normalized) {
    validateReviewerResponse(response, reviewRunId);
    if (seenReviewers.has(response.reviewer_id)) {
      throw new Error(`Duplicate reviewer_id "${response.reviewer_id}" in reviewer responses.`);
    }
    seenReviewers.add(response.reviewer_id);
  }

  return normalized;
}

function validateReviewerResponse(response, expectedReviewRunId, filePath = null) {
  const location = filePath ? `Reviewer scorecard (${filePath})` : 'Reviewer scorecard';

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error(`${location} must be a JSON object.`);
  }
  if (response.schema_version !== REVIEW_SCHEMA_VERSION) {
    throw new Error(`${location} has an unsupported schema_version.`);
  }
  if (response.review_run_id !== expectedReviewRunId) {
    throw new Error(`${location} review_run_id does not match the admin manifest.`);
  }
  if (typeof response.reviewer_id !== 'string' || response.reviewer_id.trim().length === 0) {
    throw new Error(`${location} is missing reviewer_id.`);
  }
  if (!Array.isArray(response.responses) || response.responses.length === 0) {
    throw new Error(`${location} must include responses.`);
  }

  const seenArtifacts = new Set();
  for (const artifactResponse of response.responses) {
    if (
      typeof artifactResponse?.artifact_id !== 'string' ||
      artifactResponse.artifact_id.trim().length === 0
    ) {
      throw new Error(`${location} has a response without artifact_id.`);
    }
    if (seenArtifacts.has(artifactResponse.artifact_id)) {
      throw new Error(`${location} contains duplicate artifact_id "${artifactResponse.artifact_id}".`);
    }
    seenArtifacts.add(artifactResponse.artifact_id);
    validateReviewResponseScoreBlock(
      artifactResponse,
      `${location} artifact "${artifactResponse.artifact_id}"`,
    );
  }

  return response;
}

function groupReviewerResponses(assignments, reviewerResponses) {
  const assignmentsByArtifactId = new Map(
    assignments.map((assignment) => [assignment.artifact_id, assignment]),
  );
  const grouped = {
    current: new Map(),
    baseline: new Map(),
  };

  for (const reviewerResponse of reviewerResponses) {
    const responsesByArtifactId = new Map(
      reviewerResponse.responses.map((response) => [response.artifact_id, response]),
    );

    for (const assignment of assignments) {
      const response = responsesByArtifactId.get(assignment.artifact_id);
      if (!response) {
        throw new Error(
          `Reviewer "${reviewerResponse.reviewer_id}" is missing a score for artifact "${assignment.artifact_id}".`,
        );
      }

      const scenarioMap = grouped[assignment.origin];
      if (!scenarioMap.has(assignment.scenario_id)) {
        scenarioMap.set(assignment.scenario_id, new Map());
      }
      const reviewerMap = scenarioMap.get(assignment.scenario_id);
      if (!reviewerMap.has(reviewerResponse.reviewer_id)) {
        reviewerMap.set(reviewerResponse.reviewer_id, {
          rater_id: reviewerResponse.reviewer_id,
        });
      }
      reviewerMap.get(reviewerResponse.reviewer_id)[assignment.phase] = copyScoreBlock(response);
    }
  }

  return finalizeGroupedRaters(grouped);
}

function finalizeGroupedRaters(grouped) {
  return {
    current: finalizeOriginGroup(grouped.current, 'current'),
    baseline: finalizeOriginGroup(grouped.baseline, 'baseline'),
  };
}

function finalizeOriginGroup(originGroup, origin) {
  const finalized = new Map();

  for (const [scenarioId, reviewerMap] of originGroup.entries()) {
    const raters = [...reviewerMap.values()];
    for (const rater of raters) {
      if (!rater.first_pass || !rater.final_pass) {
        throw new Error(
          `Compiled blind review is missing a ${!rater.first_pass ? 'first_pass' : 'final_pass'} score block for scenario "${scenarioId}" on ${origin}.`,
        );
      }
    }
    finalized.set(scenarioId, raters);
  }

  return finalized;
}

function copyScoreBlock(response) {
  const scoreBlock = {};
  for (const dimension of SCORE_DIMENSIONS) {
    scoreBlock[dimension] = response[dimension];
  }
  return scoreBlock;
}

function applyBlindRatings(results, ratersByScenarioId) {
  return results.map((result) => {
    const raters = ratersByScenarioId.get(result.scenario_id);
    if (!raters) {
      throw new Error(`Compiled blind review is missing scenario "${result.scenario_id}".`);
    }

    return {
      ...result,
      first_pass: {
        ...result.first_pass,
        blind_rating: computeBlindRatingFromRaters(raters, 'first_pass'),
      },
      final_pass: {
        ...result.final_pass,
        blind_rating: computeBlindRatingFromRaters(raters, 'final_pass'),
      },
    };
  });
}

function mergeProvenance(existing, overlay) {
  return {
    method_ref: existing.method_ref,
    artifact_generation: {
      independent: overlay.artifact_generation.independent,
      notes: overlay.artifact_generation.notes,
    },
    blind_review: {
      independent: overlay.blind_review.independent,
      blinded: overlay.blind_review.blinded,
      notes: overlay.blind_review.notes,
    },
  };
}

function assertMatchingScenarioIds(leftSet, rightSet) {
  const left = [...leftSet].sort();
  const right = [...rightSet].sort();
  if (left.length !== right.length) {
    throw new Error('Current, baseline, and review assignments must cover the same scenario ids.');
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      throw new Error('Current, baseline, and review assignments must cover the same scenario ids.');
    }
  }
}

async function writeJsonFile(filePath, payload) {
  const resolved = path.resolve(filePath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function readFlagValue(argv, flagName, fallback) {
  const index = argv.findIndex((arg) => arg === flagName);
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return fallback;
}

async function main(argv = process.argv.slice(2)) {
  const currentPath = readFlagValue(argv, '--current-summary', null);
  const baselinePath = readFlagValue(argv, '--baseline-summary', null);
  const adminManifestPath = readFlagValue(argv, '--admin-manifest', null);
  const reviewsDir = readFlagValue(argv, '--reviews-dir', null);
  const currentOutPath = readFlagValue(argv, '--current-out', null);
  const baselineOutPath = readFlagValue(argv, '--baseline-out', null);
  const aggregateOutPath = readFlagValue(argv, '--aggregate-out', null);

  if (!currentPath || !baselinePath || !adminManifestPath || !reviewsDir) {
    console.error(
      'Usage: node scripts/compile-blind-review.mjs --current-summary path/to/current-summary.json --baseline-summary path/to/baseline-summary.json --admin-manifest path/to/admin-manifest.json --reviews-dir path/to/reviewer-scorecards [--current-out path/to/current-compiled.json] [--baseline-out path/to/baseline-compiled.json] [--aggregate-out path/to/review-aggregate.json]',
    );
    process.exitCode = 1;
    return;
  }

  await compileBlindReviewFromFiles({
    currentPath,
    baselinePath,
    adminManifestPath,
    reviewsDir,
    currentOutPath,
    baselineOutPath,
    aggregateOutPath,
  });
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
