import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildBenchmarkSuiteSummary,
  compareBenchmarkSuites,
  createDefaultProvenance,
  createDefaultThresholdPolicy,
  loadBenchmarkScenario,
  loadBenchmarkSuiteSummary,
  runBenchmarkScenario,
  runBenchmarkSuite,
} from '../scripts/run-benchmarks.mjs';

test('runBenchmarkSuite evaluates the default benchmark fixture suite', { concurrency: false }, async () => {
  const summary = await runBenchmarkSuite({
    scenarioDir: path.resolve('benchmarks/scenarios'),
  });

  assert.equal(summary.scenario_count, 6);
  assert.deepEqual(summary.status_counts, {
    PASS: 4,
    FAIL: 1,
    DNF: 1,
  });

  const pricingScenario = summary.results.find((result) => result.scenario_id === 'pricing-partial-data');
  assert.equal(pricingScenario.status, 'FAIL');
  assert.equal(pricingScenario.final_pass.usable, true);

  const boardScenario = summary.results.find((result) => result.scenario_id === 'board-update-ambiguity');
  assert.ok(boardScenario.diagnostics.first_pass_issue_types.includes('unsupported-numeric'));
  assert.equal(boardScenario.diagnostics.final_pass_issue_types.length, 0);

  const dnfScenario = summary.results.find((result) => result.scenario_id === 'feature-weak-evidence');
  assert.equal(dnfScenario.status, 'DNF');
  assert.equal(dnfScenario.final_pass.usable, false);
  assert.equal(dnfScenario.final_pass.time_to_first_usable_artifact_seconds, null);
});

test('runBenchmarkSuite always emits provenance and threshold policy metadata', { concurrency: false }, async () => {
  const summary = await runBenchmarkSuite({
    scenarioDir: path.resolve('benchmarks/scenarios'),
    scenarioIds: ['board-update-ambiguity'],
  });

  assert.equal(summary.provenance.method_ref, 'docs/shipwright-v2-proof-method.md');
  assert.equal(summary.provenance.artifact_generation.independent, false);
  assert.equal(summary.provenance.blind_review.independent, false);
  assert.equal(summary.provenance.blind_review.blinded, false);
  assert.equal(summary.threshold_policy.status, 'provisional');
  assert.equal(summary.publishable_proof_ready, false);
});

test('runBenchmarkSuite preserves supplied provenance and threshold policy metadata', { concurrency: false }, async () => {
  const summary = await runBenchmarkSuite({
    scenarioDir: path.resolve('benchmarks/scenarios'),
    scenarioIds: ['board-update-ambiguity'],
    provenance: makeIndependentProvenance(),
    thresholdPolicy: makeFinalThresholdPolicy(),
  });

  assert.equal(summary.provenance.artifact_generation.independent, true);
  assert.equal(summary.provenance.blind_review.independent, true);
  assert.equal(summary.provenance.blind_review.blinded, true);
  assert.equal(summary.threshold_policy.status, 'final');
});

test('runBenchmarkSuite filters to requested scenario ids', { concurrency: false }, async () => {
  const summary = await runBenchmarkSuite({
    scenarioDir: path.resolve('benchmarks/scenarios'),
    scenarioIds: ['board-update-ambiguity', 'pricing-partial-data'],
  });

  assert.equal(summary.scenario_count, 2);
  assert.deepEqual(summary.status_counts, {
    PASS: 1,
    FAIL: 1,
    DNF: 0,
  });
  assert.deepEqual(
    summary.results.map((result) => result.scenario_id),
    ['board-update-ambiguity', 'pricing-partial-data'],
  );
});

test('runBenchmarkSuite publish mode fails when blind ratings are missing', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  await writeScenarioFixture(rootDir, {
    id: 'publish-missing-ratings',
    artifactType: 'prd',
    runMetadata: {
      time_to_first_usable_artifact_seconds: 300,
      revision_count: 1,
    },
    firstArtifact: basePrdArtifact(),
    finalArtifact: basePrdArtifact(),
    blindReview: null,
  });

  await assert.rejects(
    runBenchmarkSuite({
      scenarioDir: path.join(rootDir, 'scenarios'),
      publish: true,
    }),
    /missing a numeric first_pass\.blind_rating/,
  );
});

test('runBenchmarkSuite supports single-arm publish mode without a baseline', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  await writeScenarioFixture(rootDir, {
    id: 'single-arm-publish',
    artifactType: 'prd',
    runMetadata: {
      time_to_first_usable_artifact_seconds: 300,
      revision_count: 1,
    },
    firstArtifact: (() => {
      const artifact = basePrdArtifact();
      artifact.evidence = [];
      artifact.payload.customer_evidence_ids = [];
      artifact.payload.success_metrics[0].evidence_ids = [];
      artifact.pass_fail_readiness.reason = 'Missing evidence.';
      return artifact;
    })(),
    finalArtifact: basePrdArtifact(),
    blindReview: {
      raters: [
        makeRater('r1', 2, 4),
        makeRater('r2', 2, 4),
        makeRater('r3', 2, 4),
      ],
    },
  });

  const summary = await runBenchmarkSuite({
    scenarioDir: path.join(rootDir, 'scenarios'),
    publish: true,
  });

  assert.equal(summary.publishable_proof_ready, false);
  assert.equal('comparison' in summary, false);
  assert.equal('comparison_interpretation' in summary, false);
});

test('runBenchmarkScenario normalizes blind ratings and computes deltas', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const scenarioFile = await writeScenarioFixture(rootDir, {
    id: 'blind-rating-normalization',
    artifactType: 'prd',
    runMetadata: {
      time_to_first_usable_artifact_seconds: 300,
      revision_count: 1,
    },
    firstArtifact: (() => {
      const artifact = basePrdArtifact();
      artifact.evidence = [];
      artifact.payload.customer_evidence_ids = [];
      artifact.payload.success_metrics[0].evidence_ids = [];
      artifact.pass_fail_readiness.reason = 'Missing evidence.';
      return artifact;
    })(),
    finalArtifact: basePrdArtifact(),
    blindReview: {
      raters: [
        makeRater('r1', 2, 4),
        makeRater('r2', 2, 4),
        makeRater('r3', 2, 4),
      ],
    },
  });

  const result = await runBenchmarkScenario(scenarioFile);
  assert.equal(result.status, 'PASS');
  assert.equal(result.first_pass.usable, false);
  assert.equal(result.final_pass.usable, true);
  assert.equal(result.first_pass.blind_rating, 40);
  assert.equal(result.final_pass.blind_rating, 80);
  assert.equal(result.delta.blind_rating_change, 40);
  assert.equal(result.final_pass.time_to_first_usable_artifact_seconds, 300);
});

test('runBenchmarkScenario preserves diagnostic blind ratings for DNF scenarios', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const firstArtifact = basePrdArtifact();
  firstArtifact.evidence = [];
  firstArtifact.payload.customer_evidence_ids = [];
  firstArtifact.payload.success_metrics[0].evidence_ids = [];
  firstArtifact.pass_fail_readiness.status = 'FAIL';
  firstArtifact.pass_fail_readiness.reason = 'Still under-evidenced.';
  firstArtifact.decision_frame.owner = '';

  const finalArtifact = basePrdArtifact();
  finalArtifact.evidence = [];
  finalArtifact.payload.customer_evidence_ids = [];
  finalArtifact.payload.success_metrics[0].evidence_ids = [];
  finalArtifact.pass_fail_readiness.status = 'FAIL';
  finalArtifact.pass_fail_readiness.reason = 'Still under-evidenced after one revision.';

  const scenarioFile = await writeScenarioFixture(rootDir, {
    id: 'dnf-diagnostic-rating',
    artifactType: 'prd',
    runMetadata: {
      time_to_first_usable_artifact_seconds: null,
      revision_count: 2,
    },
    firstArtifact,
    finalArtifact,
    blindReview: {
      raters: [
        makeRater('r1', 1, 3),
        makeRater('r2', 1, 3),
        makeRater('r3', 1, 3),
      ],
    },
  });

  const result = await runBenchmarkScenario(scenarioFile);
  assert.equal(result.status, 'DNF');
  assert.equal(result.final_pass.usable, false);
  assert.equal(result.final_pass.time_to_first_usable_artifact_seconds, null);
  assert.equal(result.first_pass.validator_error_count, 2);
  assert.equal(result.final_pass.validator_error_count, 1);
  assert.equal(result.delta.validator_error_count_change, -1);
  assert.equal(result.final_pass.blind_rating, 60);
  assert.equal(result.delta.blind_rating_change, 40);
});

test('compareBenchmarkSuites flags materially worse first pass at the blind-rating threshold', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    firstPassBlindRating: 80,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
  });
  const current = buildSyntheticSuiteSummary({
    firstPassBlindRating: 70,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
  });

  const comparison = compareBenchmarkSuites(current, baseline);
  assert.equal(comparison.metrics.first_pass_blind_rating.delta, -10);
  assert.equal(comparison.materially_worse_first_pass, true);
});

test('compareBenchmarkSuites flags materially worse first pass at the usable-rate threshold', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 80,
    firstPassErrorCount: 0,
  });
  const current = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 60,
    firstPassErrorCount: 0,
  });

  const comparison = compareBenchmarkSuites(current, baseline);
  assert.equal(comparison.metrics.first_pass_usable_rate.delta, -20);
  assert.equal(comparison.materially_worse_first_pass, true);
});

test('compareBenchmarkSuites flags materially worse first pass at the validator-error threshold', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 100,
    firstPassErrorCount: 10,
  });
  const current = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 100,
    firstPassErrorCount: 30,
  });

  const comparison = compareBenchmarkSuites(current, baseline);
  assert.equal(comparison.metrics.first_pass_validator_error_rate.delta, 20);
  assert.equal(comparison.materially_worse_first_pass, true);
});

test('compareBenchmarkSuites does not flag materially worse first pass just inside the thresholds', { concurrency: false }, () => {
  const blindBaseline = buildSyntheticSuiteSummary({
    firstPassBlindRating: 80,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
  });
  const blindCurrent = buildSyntheticSuiteSummary({
    firstPassBlindRating: 70.1,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
  });
  assert.equal(compareBenchmarkSuites(blindCurrent, blindBaseline).materially_worse_first_pass, false);

  const usableBaseline = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 80,
    firstPassErrorCount: 0,
  });
  const usableCurrent = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 61,
    firstPassErrorCount: 0,
  });
  assert.equal(compareBenchmarkSuites(usableCurrent, usableBaseline).materially_worse_first_pass, false);

  const errorBaseline = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 100,
    firstPassErrorCount: 10,
  });
  const errorCurrent = buildSyntheticSuiteSummary({
    scenarioCount: 100,
    firstPassUsableCount: 100,
    firstPassErrorCount: 29,
  });
  assert.equal(compareBenchmarkSuites(errorCurrent, errorBaseline).materially_worse_first_pass, false);
});

test('compareBenchmarkSuites treats time and revision deltas as informational only', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    firstPassBlindRating: 80,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
    timeToFirstUsableSeconds: 200,
    revisionCount: 1,
  });
  const current = buildSyntheticSuiteSummary({
    firstPassBlindRating: 80,
    firstPassUsableCount: 10,
    firstPassErrorCount: 0,
    timeToFirstUsableSeconds: 900,
    revisionCount: 4,
  });

  const comparison = compareBenchmarkSuites(current, baseline);
  assert.equal(comparison.metrics.mean_time_to_first_usable_seconds.delta, 700);
  assert.equal(comparison.metrics.mean_revision_count.delta, 3);
  assert.equal(comparison.materially_worse_first_pass, false);
});

test('compareBenchmarkSuites records scenario status changes and comparison interpretation', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    statuses: ['PASS', 'FAIL', 'DNF'],
    thresholdPolicy: makeFinalThresholdPolicy(),
    provenance: makeIndependentProvenance(),
  });
  const current = buildSyntheticSuiteSummary({
    statuses: ['FAIL', 'FAIL', 'DNF'],
    thresholdPolicy: makeFinalThresholdPolicy(),
    provenance: makeIndependentProvenance(),
  });

  const comparison = compareBenchmarkSuites(current, baseline);
  assert.equal(comparison.publishable_proof_ready, true);
  assert.equal(comparison.comparison_interpretation, 'final');
  assert.deepEqual(comparison.scenario_status_changes, [
    {
      scenario_id: 'scenario-1',
      current_status: 'FAIL',
      baseline_status: 'PASS',
    },
  ]);
});

test('compareBenchmarkSuites rejects mismatched scenario ids with a useful error', { concurrency: false }, () => {
  const baseline = buildSyntheticSuiteSummary({
    scenarioIds: ['scenario-1', 'scenario-3'],
    thresholdPolicy: makeFinalThresholdPolicy(),
    provenance: makeIndependentProvenance(),
  });
  const current = buildSyntheticSuiteSummary({
    scenarioIds: ['scenario-1', 'scenario-2'],
    thresholdPolicy: makeFinalThresholdPolicy(),
    provenance: makeIndependentProvenance(),
  });

  assert.throws(
    () => compareBenchmarkSuites(current, baseline),
    /must cover the same scenario ids before comparison/,
  );
});

test('loadBenchmarkScenario rejects scenarios missing id', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const scenarioPath = path.join(rootDir, 'missing-id.json');
  await writeFile(
    scenarioPath,
    `${JSON.stringify({
      title: 'missing id',
      inputs: { expected_artifact_type: 'prd' },
      fixtures: {
        first_pass_artifact: '../fixtures/example/first-pass.md',
        final_pass_artifact: '../fixtures/example/final-pass.md',
      },
    }, null, 2)}\n`,
    'utf8',
  );

  await assert.rejects(
    loadBenchmarkScenario(scenarioPath),
    /missing id/,
  );
});

test('loadBenchmarkScenario rejects scenarios missing first-pass fixture path', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const scenarioPath = path.join(rootDir, 'missing-first-pass.json');
  await writeFile(
    scenarioPath,
    `${JSON.stringify({
      id: 'missing-first-pass',
      title: 'missing first pass fixture',
      inputs: { expected_artifact_type: 'prd' },
      fixtures: {
        final_pass_artifact: '../fixtures/example/final-pass.md',
      },
    }, null, 2)}\n`,
    'utf8',
  );

  await assert.rejects(
    loadBenchmarkScenario(scenarioPath),
    /missing fixtures\.first_pass_artifact/,
  );
});

test('loadBenchmarkSuiteSummary rejects pre-schema baseline summaries without provenance metadata', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const summaryPath = path.join(rootDir, 'baseline-summary.json');
  await writeFile(
    summaryPath,
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
    loadBenchmarkSuiteSummary(summaryPath, {
      label: 'Baseline benchmark summary',
    }),
    /regenerated or upgraded before use/,
  );
});

test('loadBenchmarkSuiteSummary rejects pre-schema baseline summaries without threshold policy metadata', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-benchmarks-'));
  const summaryPath = path.join(rootDir, 'baseline-summary.json');
  await writeFile(
    summaryPath,
    `${JSON.stringify({
      generated_at: '2026-04-02T00:00:00.000Z',
      scoring_spec_ref: 'docs/shipwright-v2-benchmark-scoring-spec.md',
      scenario_count: 1,
      status_counts: { PASS: 1, FAIL: 0, DNF: 0 },
      mean_first_pass_blind_rating: 80,
      mean_final_pass_blind_rating: 85,
      provenance: createDefaultProvenance(),
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
    loadBenchmarkSuiteSummary(summaryPath, {
      label: 'Baseline benchmark summary',
    }),
    /regenerated or upgraded before use/,
  );
});

function buildSyntheticSuiteSummary(options = {}) {
  const scenarioIds =
    options.scenarioIds ||
    Array.from({ length: options.scenarioCount ?? options.statuses?.length ?? 10 }, (_, index) => `scenario-${index + 1}`);
  const scenarioCount = scenarioIds.length;
  const firstPassUsableCount = options.firstPassUsableCount ?? scenarioCount;
  const firstPassErrorCount = options.firstPassErrorCount ?? 0;
  const firstPassBlindRating = options.firstPassBlindRating ?? 80;
  const finalPassBlindRating = options.finalPassBlindRating ?? 85;
  const timeToFirstUsableSeconds = options.timeToFirstUsableSeconds ?? 200;
  const revisionCount = options.revisionCount ?? 1;
  const statuses = options.statuses || Array.from({ length: scenarioCount }, () => 'PASS');

  const results = Array.from({ length: scenarioCount }, (_, index) => {
    const status = statuses[index] || 'PASS';
    const finalUsable = status !== 'DNF';
    return {
      scenario_id: scenarioIds[index],
      status,
      first_pass: {
        usable: index < firstPassUsableCount,
        validator_error_count: index < firstPassErrorCount ? 1 : 0,
        contradiction_count: 0,
        blind_rating: firstPassBlindRating,
      },
      final_pass: {
        usable: finalUsable,
        time_to_first_usable_artifact_seconds: finalUsable ? timeToFirstUsableSeconds : null,
        revision_count: revisionCount,
        validator_error_count: finalUsable ? 0 : 1,
        contradiction_count: 0,
        blind_rating: finalPassBlindRating,
      },
    };
  });

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

function makeRater(raterId, firstScore, finalScore) {
  return {
    rater_id: raterId,
    first_pass: {
      decision_usefulness: firstScore,
      evidence_discipline: firstScore,
      internal_consistency: firstScore,
      actionability: firstScore,
    },
    final_pass: {
      decision_usefulness: finalScore,
      evidence_discipline: finalScore,
      internal_consistency: finalScore,
      actionability: finalScore,
    },
  };
}

function basePrdArtifact() {
  return {
    schema_version: '2.0.0',
    artifact_type: 'prd',
    mode: 'rigorous',
    depth: 'standard',
    metadata: {
      title: 'PRD: Test Artifact',
      status: 'approved',
      authors: ['Shipwright'],
      updated_at: '2026-04-02',
    },
    decision_frame: {
      recommendation: 'Ship the bounded pilot.',
      tradeoff: 'Moves quickly with known follow-up work.',
      confidence: 'medium',
      owner: 'PM',
      decision_date: '2026-04-02',
    },
    unknowns: ['Which edge case shows up first.'],
    pass_fail_readiness: {
      status: 'PASS',
      reason: 'The artifact is structured and evidence-linked.',
    },
    evidence: [
      {
        evidence_id: 'ev-test-1',
        kind: 'document',
        source_ref: 'test-source',
        confidence: 'high',
        supports: [
          'decision_frame.recommendation',
          'problem-test',
          'metric-test',
        ],
      },
    ],
    payload: {
      problem_statement: {
        problem_id: 'problem-test',
        text: 'Teams need a more reliable handoff flow.',
      },
      customer_evidence_ids: ['ev-test-1'],
      success_metrics: [
        {
          metric_id: 'metric-test',
          name: 'handoff success rate',
          segment: 'operations teams',
          unit: 'percent',
          timeframe: '30 days',
          baseline: 55,
          target: 75,
          evidence_ids: ['ev-test-1'],
        },
      ],
      scope: {
        in: ['Retry flow'],
        out: ['Migration tooling'],
      },
      open_questions: ['Which notification should ship first?'],
      target_segment: 'operations teams',
    },
  };
}

function renderArtifactMarkdown(artifact) {
  return `# ${artifact.metadata.title}

## Decision Frame

Recommendation: ${artifact.decision_frame.recommendation}

## Unknowns & Evidence Gaps

- ${artifact.unknowns[0]}

## Pass/Fail Readiness

${artifact.pass_fail_readiness.status} because ${artifact.pass_fail_readiness.reason}

## Recommended Next Artifact

- Sprint plan.

<!-- shipwright:artifact
${JSON.stringify(artifact, null, 2)}
-->
`;
}

async function writeScenarioFixture(rootDir, options) {
  const scenarioDir = path.join(rootDir, 'scenarios');
  const fixtureDir = path.join(rootDir, 'fixtures', options.id);
  await mkdir(scenarioDir, { recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  await writeFile(
    path.join(fixtureDir, 'first-pass.md'),
    renderArtifactMarkdown(options.firstArtifact),
    'utf8',
  );
  await writeFile(
    path.join(fixtureDir, 'final-pass.md'),
    renderArtifactMarkdown(options.finalArtifact),
    'utf8',
  );

  let blindReviewPath = null;
  if (options.blindReview) {
    blindReviewPath = path.join(fixtureDir, 'blind-review.json');
    await writeFile(
      blindReviewPath,
      `${JSON.stringify(options.blindReview, null, 2)}\n`,
      'utf8',
    );
  }

  const scenario = {
    id: options.id,
    title: options.id,
    inputs: {
      prompt: 'Test benchmark scenario',
      context_files: [],
      expected_artifact_type: options.artifactType,
      scoring_spec_ref: 'docs/shipwright-v2-benchmark-scoring-spec.md',
    },
    validator: {
      expect_sections: [
        'Decision Frame',
        'Unknowns & Evidence Gaps',
        'Pass/Fail Readiness',
        'Recommended Next Artifact',
      ],
      expect_structured: true,
    },
    fixtures: {
      first_pass_artifact: `../fixtures/${options.id}/first-pass.md`,
      final_pass_artifact: `../fixtures/${options.id}/final-pass.md`,
      related_artifacts: [],
      blind_review: blindReviewPath ? `../fixtures/${options.id}/blind-review.json` : null,
    },
    run_metadata: options.runMetadata,
    measures: [
      'time_to_first_usable_artifact',
      'revision_count',
      'contradiction_count',
      'blind_human_rating',
    ],
  };

  const scenarioFile = path.join(scenarioDir, `${options.id}.json`);
  await writeFile(scenarioFile, `${JSON.stringify(scenario, null, 2)}\n`, 'utf8');
  return scenarioFile;
}
