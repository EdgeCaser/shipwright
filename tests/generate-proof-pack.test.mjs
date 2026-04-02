import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildBenchmarkSuiteSummary,
  createDefaultProvenance,
  createDefaultThresholdPolicy,
} from '../scripts/run-benchmarks.mjs';
import {
  generateProofPack,
  generateProofPackFromFiles,
} from '../scripts/generate-proof-pack.mjs';

test('generateProofPack handles single-arm proof status reports', { concurrency: false }, () => {
  const currentSummary = buildSyntheticSuiteSummary();
  const { report, markdown } = generateProofPack({ currentSummary });

  assert.equal(report.report_mode, 'single-arm');
  assert.equal(report.publishable_proof_ready, false);
  assert.equal(report.comparison, null);
  assert.ok(
    report.blockers.includes(
      'No baseline benchmark summary was supplied, so publishable comparison claims are unavailable.',
    ),
  );
  assert.match(markdown, /Mode: single-arm/);
  assert.match(markdown, /Blocking notes:/);
});

test('generateProofPack surfaces provenance blockers and provisional warnings in comparison mode', { concurrency: false }, () => {
  const currentSummary = buildSyntheticSuiteSummary();
  const baselineSummary = buildSyntheticSuiteSummary();

  const { report, markdown } = generateProofPack({
    currentSummary,
    baselineSummary,
  });

  assert.equal(report.report_mode, 'comparison');
  assert.equal(report.publishable_proof_ready, false);
  assert.equal(report.comparison.comparison_interpretation, 'provisional');
  assert.ok(report.blockers.some((blocker) => blocker.includes('Current artifact generation')));
  assert.ok(report.blockers.some((blocker) => blocker.includes('Baseline blind review')));
  assert.ok(report.warnings.some((warning) => warning.includes('provisional')));
  assert.match(markdown, /Comparison interpretation: provisional/);
});

test('generateProofPack lists every missing blind rating blocker', { concurrency: false }, () => {
  const currentSummary = buildSyntheticSuiteSummary({
    results: [
      buildResult('scenario-1', { firstBlindRating: null, finalBlindRating: null }),
      buildResult('scenario-2', { firstBlindRating: null, finalBlindRating: 88 }),
      buildResult('scenario-3', { firstBlindRating: 80, finalBlindRating: null }),
    ],
  });

  const { report } = generateProofPack({ currentSummary });

  assert.ok(
    report.blockers.includes(
      'Current scenario "scenario-1" is missing a numeric first-pass blind rating.',
    ),
  );
  assert.ok(
    report.blockers.includes(
      'Current scenario "scenario-2" is missing a numeric first-pass blind rating.',
    ),
  );
  assert.ok(
    report.blockers.includes(
      'Current scenario "scenario-1" is missing a numeric final-pass blind rating.',
    ),
  );
  assert.ok(
    report.blockers.includes(
      'Current scenario "scenario-3" is missing a numeric final-pass blind rating.',
    ),
  );
});

test('generateProofPack allows publishable final comparisons when provenance and threshold policy are final', { concurrency: false }, () => {
  const currentSummary = buildSyntheticSuiteSummary({
    provenance: makeIndependentProvenance(),
    thresholdPolicy: makeFinalThresholdPolicy(),
  });
  const baselineSummary = buildSyntheticSuiteSummary({
    provenance: makeIndependentProvenance(),
    thresholdPolicy: makeFinalThresholdPolicy(),
  });

  const { report, markdown } = generateProofPack({
    currentSummary,
    baselineSummary,
  });

  assert.equal(report.publishable_proof_ready, true);
  assert.equal(report.blockers.length, 0);
  assert.equal(report.warnings.length, 0);
  assert.equal(report.comparison.comparison_interpretation, 'final');
  assert.match(markdown, /Status: READY/);
  assert.match(markdown, /No publishability blockers detected/);
});

test('generateProofPackFromFiles supports single-arm reports', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-pack-'));
  const currentPath = path.join(rootDir, 'current-summary.json');
  await writeFile(
    currentPath,
    `${JSON.stringify(buildSyntheticSuiteSummary(), null, 2)}\n`,
    'utf8',
  );

  const { report } = await generateProofPackFromFiles({ currentPath });
  assert.equal(report.report_mode, 'single-arm');
  assert.equal(report.comparison, null);
});

test('generateProofPackFromFiles rejects pre-schema baseline summaries with actionable errors', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-pack-'));
  const currentPath = path.join(rootDir, 'current-summary.json');
  const baselinePath = path.join(rootDir, 'baseline-summary.json');

  await writeFile(
    currentPath,
    `${JSON.stringify(buildSyntheticSuiteSummary(), null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    baselinePath,
    `${JSON.stringify({
      generated_at: '2026-04-02T00:00:00.000Z',
      scoring_spec_ref: 'docs/shipwright-v2-benchmark-scoring-spec.md',
      scenario_count: 1,
      status_counts: { PASS: 1, FAIL: 0, DNF: 0 },
      mean_first_pass_blind_rating: 80,
      mean_final_pass_blind_rating: 85,
      results: [
        {
          scenario_id: 'scenario-1',
          status: 'PASS',
          first_pass: {
            usable: true,
            validator_error_count: 0,
            contradiction_count: 0,
            blind_rating: 80,
          },
          final_pass: {
            usable: true,
            time_to_first_usable_artifact_seconds: 100,
            revision_count: 0,
            validator_error_count: 0,
            contradiction_count: 0,
            blind_rating: 85,
          },
        },
      ],
    }, null, 2)}\n`,
    'utf8',
  );

  await assert.rejects(
    generateProofPackFromFiles({ currentPath, baselinePath }),
    /regenerated or upgraded before use/,
  );
});

function buildSyntheticSuiteSummary(options = {}) {
  const results =
    options.results ||
    Array.from({ length: 3 }, (_, index) => buildResult(`scenario-${index + 1}`));

  return buildBenchmarkSuiteSummary({
    results,
    provenance: options.provenance || createDefaultProvenance(),
    thresholdPolicy: options.thresholdPolicy || createDefaultThresholdPolicy(),
  });
}

function makeIndependentProvenance() {
  return {
    method_ref: 'docs/shipwright-v2-proof-method.md',
    artifact_generation: {
      independent: true,
      notes: 'Independent baseline process established.',
    },
    blind_review: {
      independent: true,
      blinded: true,
      notes: 'Independent blinded review panel established.',
    },
  };
}

function makeFinalThresholdPolicy() {
  return {
    status: 'final',
    spec_ref: 'docs/shipwright-v2-benchmark-scoring-spec.md',
    notes: 'Thresholds finalized after an independent blind run.',
  };
}

function buildResult(scenarioId, overrides = {}) {
  const has = (key) => Object.prototype.hasOwnProperty.call(overrides, key);
  return {
    scenario_id: scenarioId,
    status: overrides.status || 'PASS',
    first_pass: {
      usable: overrides.firstUsable ?? true,
      validator_error_count: overrides.firstValidatorErrorCount ?? 0,
      contradiction_count: overrides.firstContradictionCount ?? 0,
      blind_rating: has('firstBlindRating') ? overrides.firstBlindRating : 80,
    },
    final_pass: {
      usable: overrides.finalUsable ?? true,
      time_to_first_usable_artifact_seconds:
        overrides.timeToFirstUsableSeconds ?? 120,
      revision_count: overrides.revisionCount ?? 1,
      validator_error_count: overrides.finalValidatorErrorCount ?? 0,
      contradiction_count: overrides.finalContradictionCount ?? 0,
      blind_rating: has('finalBlindRating') ? overrides.finalBlindRating : 88,
    },
  };
}
