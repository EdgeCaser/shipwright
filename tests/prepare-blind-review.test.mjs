import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  prepareBlindReviewBundle,
  stripStructuredPayload,
} from '../scripts/prepare-blind-review.mjs';

test('stripStructuredPayload removes embedded structured artifact comments', () => {
  const input = `# Title

Body.

<!-- shipwright:artifact
{"artifact_type":"prd"}
-->
`;

  assert.equal(stripStructuredPayload(input), '# Title\n\nBody.');
});

test('prepareBlindReviewBundle creates blinded packet, manifest, and template', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-content-'));
  const currentScenarioDir = path.join(rootDir, 'current', 'scenarios');
  const baselineScenarioDir = path.join(rootDir, 'baseline', 'scenarios');
  await writeScenario(rootDir, currentScenarioDir, {
    id: 'scenario-1',
    title: 'Scenario One',
    firstPassText: '# Current first\n\nCurrent first body.\n\n<!-- shipwright:artifact\n{"source":"current-first"}\n-->\n',
    finalPassText: '# Current final\n\nCurrent final body.\n\n<!-- shipwright:artifact\n{"source":"current-final"}\n-->\n',
  });
  await writeScenario(rootDir, baselineScenarioDir, {
    id: 'scenario-1',
    title: 'Scenario One',
    firstPassText: '# Baseline first\n\nBaseline first body.\n\n<!-- shipwright:artifact\n{"source":"baseline-first"}\n-->\n',
    finalPassText: '# Baseline final\n\nBaseline final body.\n\n<!-- shipwright:artifact\n{"source":"baseline-final"}\n-->\n',
  });

  const { packet, adminManifest, reviewTemplate } = await prepareBlindReviewBundle({
    currentScenarioDir,
    baselineScenarioDir,
    reviewRunId: 'proof-run-1',
    seed: 'fixed-seed',
  });
  const secondRun = await prepareBlindReviewBundle({
    currentScenarioDir,
    baselineScenarioDir,
    reviewRunId: 'proof-run-1-repeat',
    seed: 'fixed-seed',
  });

  assert.equal(packet.review_run_id, 'proof-run-1');
  assert.equal(packet.scenarios.length, 1);
  assert.equal(packet.scenarios[0].first_pass.length, 2);
  assert.ok(
    packet.scenarios[0].first_pass.every((artifact) => !artifact.artifact_text.includes('shipwright:artifact')),
  );
  assert.equal(adminManifest.provenance.current.artifact_generation.independent, false);
  assert.equal(adminManifest.provenance.baseline.blind_review.blinded, false);
  assert.equal(reviewTemplate.responses.length, 4);
  assert.deepEqual(
    reviewTemplate.responses.map((response) => response.artifact_id).sort(),
    adminManifest.assignments.map((assignment) => assignment.artifact_id).sort(),
  );
  assert.equal(
    assignmentOrigin(adminManifest, 'first_pass', 'A'),
    'baseline',
  );
  assert.equal(
    assignmentOrigin(adminManifest, 'final_pass', 'A'),
    assignmentOrigin(secondRun.adminManifest, 'final_pass', 'A'),
  );
});

test('prepareBlindReviewBundle rejects mismatched scenario ids', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-content-'));
  const currentScenarioDir = path.join(rootDir, 'current', 'scenarios');
  const baselineScenarioDir = path.join(rootDir, 'baseline', 'scenarios');
  await writeScenario(rootDir, currentScenarioDir, {
    id: 'scenario-1',
    title: 'Scenario One',
    firstPassText: '# Current first',
    finalPassText: '# Current final',
  });
  await writeScenario(rootDir, baselineScenarioDir, {
    id: 'scenario-2',
    title: 'Scenario Two',
    firstPassText: '# Baseline first',
    finalPassText: '# Baseline final',
  });

  await assert.rejects(
    prepareBlindReviewBundle({
      currentScenarioDir,
      baselineScenarioDir,
      reviewRunId: 'proof-run-2',
    }),
    /must contain the same scenario ids/,
  );
});

test('prepareBlindReviewBundle gives a clear error when the default baseline scenario directory is missing', { concurrency: false }, async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-proof-content-'));
  const currentScenarioDir = path.join(rootDir, 'current', 'scenarios');
  await writeScenario(rootDir, currentScenarioDir, {
    id: 'scenario-1',
    title: 'Scenario One',
    firstPassText: '# Current first',
    finalPassText: '# Current final',
  });

  await assert.rejects(
    prepareBlindReviewBundle({
      currentScenarioDir,
      reviewRunId: 'proof-run-3',
    }),
    /Baseline scenario directory not found: .*pass --baseline-scenarios explicitly/,
  );
});

async function writeScenario(rootDir, scenarioDir, options) {
  const fixtureDir = path.join(path.dirname(scenarioDir), 'fixtures', options.id);
  await mkdir(scenarioDir, { recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  await writeFile(path.join(fixtureDir, 'first-pass.md'), options.firstPassText, 'utf8');
  await writeFile(path.join(fixtureDir, 'final-pass.md'), options.finalPassText, 'utf8');

  await writeFile(
    path.join(scenarioDir, `${options.id}.json`),
    `${JSON.stringify({
      id: options.id,
      title: options.title,
      inputs: {
        prompt: 'Write the artifact.',
        context_files: [],
        expected_artifact_type: 'prd',
        scoring_spec_ref: 'docs/shipwright-v2-benchmark-scoring-spec.md',
      },
      validator: {
        expect_sections: [],
        expect_structured: false,
      },
      fixtures: {
        first_pass_artifact: `../fixtures/${options.id}/first-pass.md`,
        final_pass_artifact: `../fixtures/${options.id}/final-pass.md`,
        blind_review: null,
      },
      run_metadata: {
        time_to_first_usable_artifact_seconds: 120,
        revision_count: 1,
      },
      measures: ['blind_human_rating'],
    }, null, 2)}\n`,
    'utf8',
  );
}

function assignmentOrigin(adminManifest, phase, blindedLabel) {
  return adminManifest.assignments.find(
    (assignment) =>
      assignment.phase === phase && assignment.blinded_label === blindedLabel,
  ).origin;
}
