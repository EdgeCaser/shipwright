import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildBenchmarkSuiteSummary,
  createDefaultProvenance,
  createDefaultThresholdPolicy,
} from '../scripts/run-benchmarks.mjs';
import {
  compileBlindReview,
  compileBlindReviewFromFiles,
} from '../scripts/compile-blind-review.mjs';

test('compileBlindReview applies reviewer scores and provenance overlays to both summaries', () => {
  const currentSummary = buildSyntheticSummary();
  const baselineSummary = buildSyntheticSummary();
  const adminManifest = buildAdminManifest();
  const reviewerResponses = [
    buildReviewerResponse('r1', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    buildReviewerResponse('r2', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    buildReviewerResponse('r3', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
  ];

  const compiled = compileBlindReview({
    currentSummary,
    baselineSummary,
    adminManifest,
    reviewerResponses,
  });

  assert.equal(compiled.currentSummary.results[0].first_pass.blind_rating, 80);
  assert.equal(compiled.currentSummary.results[0].final_pass.blind_rating, 100);
  assert.equal(compiled.baselineSummary.results[0].first_pass.blind_rating, 60);
  assert.equal(compiled.baselineSummary.results[0].final_pass.blind_rating, 80);
  assert.equal(compiled.currentSummary.provenance.artifact_generation.independent, true);
  assert.equal(compiled.currentSummary.provenance.blind_review.blinded, true);
  assert.equal(compiled.baselineSummary.provenance.artifact_generation.independent, true);
  assert.equal(compiled.reviewAggregate.reviewer_count, 3);
});

test('compileBlindReview rejects missing reviewer responses', () => {
  const currentSummary = buildSyntheticSummary();
  const baselineSummary = buildSyntheticSummary();
  const adminManifest = buildAdminManifest();
  const reviewerResponses = [
    buildReviewerResponse('r1', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    buildReviewerResponse('r2', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    {
      schema_version: '1.0.0',
      review_run_id: 'proof-run-1',
      reviewer_id: 'r3',
      responses: buildArtifactResponses({ currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }).slice(0, 3),
    },
  ];

  assert.throws(
    () =>
      compileBlindReview({
        currentSummary,
        baselineSummary,
        adminManifest,
        reviewerResponses,
      }),
    /missing a score for artifact/,
  );
});

test('compileBlindReview validates summary inputs at the API boundary', () => {
  const baselineSummary = buildSyntheticSummary();
  const adminManifest = buildAdminManifest();
  const reviewerResponses = [
    buildReviewerResponse('r1', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    buildReviewerResponse('r2', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
    buildReviewerResponse('r3', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }),
  ];

  assert.throws(
    () =>
      compileBlindReview({
        currentSummary: { results: [] },
        baselineSummary,
        adminManifest,
        reviewerResponses,
      }),
    /missing provenance metadata|missing threshold_policy metadata/,
  );
});

test('compileBlindReviewFromFiles writes compiled summaries and aggregate output', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-content-'));
  const currentPath = path.join(rootDir, 'current-summary.json');
  const baselinePath = path.join(rootDir, 'baseline-summary.json');
  const adminManifestPath = path.join(rootDir, 'admin-manifest.json');
  const reviewsDir = path.join(rootDir, 'responses');
  const currentOutPath = path.join(rootDir, 'current-reviewed.json');
  const baselineOutPath = path.join(rootDir, 'baseline-reviewed.json');
  const aggregateOutPath = path.join(rootDir, 'review-aggregate.json');

  await writeFile(currentPath, `${JSON.stringify(buildSyntheticSummary(), null, 2)}\n`, 'utf8');
  await writeFile(baselinePath, `${JSON.stringify(buildSyntheticSummary(), null, 2)}\n`, 'utf8');
  await writeFile(adminManifestPath, `${JSON.stringify(buildAdminManifest(), null, 2)}\n`, 'utf8');
  await writeReviewerResponses(reviewsDir);

  await compileBlindReviewFromFiles({
    currentPath,
    baselinePath,
    adminManifestPath,
    reviewsDir,
    currentOutPath,
    baselineOutPath,
    aggregateOutPath,
  });

  const currentReviewed = JSON.parse(await readFile(currentOutPath, 'utf8'));
  const baselineReviewed = JSON.parse(await readFile(baselineOutPath, 'utf8'));
  const aggregate = JSON.parse(await readFile(aggregateOutPath, 'utf8'));

  assert.equal(currentReviewed.results[0].first_pass.blind_rating, 80);
  assert.equal(baselineReviewed.results[0].final_pass.blind_rating, 80);
  assert.equal(aggregate.reviewer_count, 3);
  assert.equal(aggregate.scenario_count, 1);
});

function buildSyntheticSummary() {
  return buildBenchmarkSuiteSummary({
    results: [
      {
        scenario_id: 'scenario-1',
        status: 'PASS',
        first_pass: {
          usable: true,
          validator_error_count: 0,
          contradiction_count: 0,
          blind_rating: null,
        },
        final_pass: {
          usable: true,
          time_to_first_usable_artifact_seconds: 180,
          revision_count: 1,
          validator_error_count: 0,
          contradiction_count: 0,
          blind_rating: null,
        },
      },
    ],
    provenance: createDefaultProvenance(),
    thresholdPolicy: createDefaultThresholdPolicy(),
  });
}

function buildAdminManifest() {
  return {
    schema_version: '1.0.0',
    review_run_id: 'proof-run-1',
    generated_at: '2026-04-02T00:00:00.000Z',
    seed: 'seed',
    current_scenario_dir: 'benchmarks/scenarios',
    baseline_scenario_dir: 'benchmarks/baselines/strong-prompt-v1/scenarios',
    provenance: {
      current: {
        artifact_generation: {
          independent: true,
          notes: 'Current benchmark run is frozen and attributable.',
        },
        blind_review: {
          independent: true,
          blinded: true,
          notes: 'Independent reviewers did not know artifact origin.',
        },
      },
      baseline: {
        artifact_generation: {
          independent: true,
          notes: 'Baseline artifacts were produced outside Shipwright.',
        },
        blind_review: {
          independent: true,
          blinded: true,
          notes: 'Independent reviewers did not know artifact origin.',
        },
      },
    },
    assignments: [
      {
        scenario_id: 'scenario-1',
        title: 'Scenario One',
        phase: 'first_pass',
        artifact_id: 'scenario-1:first_pass:A',
        blinded_label: 'A',
        origin: 'current',
        source_artifact_path: 'current/first.md',
      },
      {
        scenario_id: 'scenario-1',
        title: 'Scenario One',
        phase: 'first_pass',
        artifact_id: 'scenario-1:first_pass:B',
        blinded_label: 'B',
        origin: 'baseline',
        source_artifact_path: 'baseline/first.md',
      },
      {
        scenario_id: 'scenario-1',
        title: 'Scenario One',
        phase: 'final_pass',
        artifact_id: 'scenario-1:final_pass:A',
        blinded_label: 'A',
        origin: 'current',
        source_artifact_path: 'current/final.md',
      },
      {
        scenario_id: 'scenario-1',
        title: 'Scenario One',
        phase: 'final_pass',
        artifact_id: 'scenario-1:final_pass:B',
        blinded_label: 'B',
        origin: 'baseline',
        source_artifact_path: 'baseline/final.md',
      },
    ],
  };
}

function buildReviewerResponse(reviewerId, scores) {
  return {
    schema_version: '1.0.0',
    review_run_id: 'proof-run-1',
    reviewer_id: reviewerId,
    responses: buildArtifactResponses(scores),
  };
}

function buildArtifactResponses(scores) {
  return [
    buildArtifactResponse('scenario-1:first_pass:A', scores.currentFirst),
    buildArtifactResponse('scenario-1:first_pass:B', scores.baselineFirst),
    buildArtifactResponse('scenario-1:final_pass:A', scores.currentFinal),
    buildArtifactResponse('scenario-1:final_pass:B', scores.baselineFinal),
  ];
}

function buildArtifactResponse(artifactId, score) {
  return {
    artifact_id: artifactId,
    decision_usefulness: score,
    evidence_discipline: score,
    internal_consistency: score,
    actionability: score,
  };
}

async function writeReviewerResponses(reviewsDir) {
  await mkdir(reviewsDir, { recursive: true });
  await writeFile(
    path.join(reviewsDir, 'r1.json'),
    `${JSON.stringify(buildReviewerResponse('r1', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }), null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(reviewsDir, 'r2.json'),
    `${JSON.stringify(buildReviewerResponse('r2', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }), null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(reviewsDir, 'r3.json'),
    `${JSON.stringify(buildReviewerResponse('r3', { currentFirst: 4, currentFinal: 5, baselineFirst: 3, baselineFinal: 4 }), null, 2)}\n`,
    'utf8',
  );
}
