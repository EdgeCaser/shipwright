import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSummary, parseCliArgs, runBatch } from '../scripts/run-conflict-batch.mjs';

test('parseCliArgs handles scenario filters and flags', () => {
  const args = parseCliArgs([
    '--scenario', 'prd-hidden-scope-creep',
    '--scenario', 'handoff-contradiction',
    '--out', '/tmp/summary.md',
    '--dry-run',
  ]);

  assert.deepEqual(args.scenarios, ['prd-hidden-scope-creep', 'handoff-contradiction']);
  assert.equal(args.outPath, '/tmp/summary.md');
  assert.equal(args.dryRun, true);
});

test('buildSummary produces judge agreement analysis from completed runs', () => {
  const results = [
    {
      scenario: 'prd-hidden-scope-creep',
      judgeLabel: 'claude-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 1.2,
      judgeConfidence: 'high',
      needsHumanReview: false,
      disagreementRate: 0.67,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 1,
      runId: 'run-1',
      error: null,
    },
    {
      scenario: 'prd-hidden-scope-creep',
      judgeLabel: 'gpt-judge',
      status: 'completed',
      winner: 'side_b',
      margin: 0.8,
      judgeConfidence: 'high',
      needsHumanReview: true,
      disagreementRate: 0.75,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 4,
      runId: 'run-2',
      error: null,
    },
    {
      scenario: 'handoff-contradiction',
      judgeLabel: 'claude-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 0.6,
      judgeConfidence: 'medium',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 0.5,
      unsupportedClaimCount: 2,
      runId: 'run-3',
      error: null,
    },
    {
      scenario: 'handoff-contradiction',
      judgeLabel: 'gpt-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 0.4,
      judgeConfidence: 'medium',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 0.5,
      unsupportedClaimCount: 2,
      runId: 'run-4',
      error: null,
    },
  ];

  const summary = buildSummary(results);

  assert.ok(summary.includes('Judge Agreement Analysis'));
  assert.ok(summary.includes('**NO**'));  // prd-hidden-scope-creep disagrees
  assert.ok(summary.includes('YES'));     // handoff-contradiction agrees
  assert.ok(summary.includes('1/2 (50%)'));
  assert.ok(summary.includes('Average margin delta'));
});

test('buildSummary suppresses publishability interpretation when coverage is partial', () => {
  const results = [
    {
      scenario: 'prd-hidden-scope-creep',
      judgeLabel: 'claude-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 1.0,
      judgeConfidence: 'high',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 0,
      runId: 'run-1',
      error: null,
    },
    {
      scenario: 'prd-hidden-scope-creep',
      judgeLabel: 'gpt-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 0.8,
      judgeConfidence: 'high',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 0,
      runId: 'run-2',
      error: null,
    },
    {
      scenario: 'handoff-contradiction',
      judgeLabel: 'claude-judge',
      status: 'error',
      winner: null,
      margin: null,
      judgeConfidence: null,
      needsHumanReview: null,
      disagreementRate: null,
      adoptedCritiqueRate: null,
      unsupportedClaimCount: null,
      runId: null,
      error: 'Model timeout',
    },
    {
      scenario: 'handoff-contradiction',
      judgeLabel: 'gpt-judge',
      status: 'completed',
      winner: 'side_b',
      margin: 0.5,
      judgeConfidence: 'medium',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 0,
      runId: 'run-4',
      error: null,
    },
  ];

  const summary = buildSummary(results);

  // 1/2 completed comparisons — should warn about partial coverage
  assert.ok(summary.includes('1/2'));
  assert.ok(summary.includes('WARNING'));
  assert.ok(summary.includes('partial coverage'));
  // Should NOT include any "usable" / "publishable" interpretation
  assert.ok(!summary.includes('Single-judge runs are usable'));
});

test('runBatch rejects unknown scenario IDs', async () => {
  await assert.rejects(
    () => runBatch({ scenarios: ['prd-hidden-scope-creep', 'nonexistent-typo'], dryRun: true }),
    (error) => {
      assert.ok(error.message.includes('Unknown scenario(s): nonexistent-typo'));
      return true;
    },
  );
});

test('buildSummary handles errors gracefully', () => {
  const results = [
    {
      scenario: 'broken-scenario',
      judgeLabel: 'claude-judge',
      status: 'error',
      winner: null,
      margin: null,
      judgeConfidence: null,
      needsHumanReview: null,
      disagreementRate: null,
      adoptedCritiqueRate: null,
      unsupportedClaimCount: null,
      runId: null,
      error: 'Model output is not valid JSON',
    },
    {
      scenario: 'broken-scenario',
      judgeLabel: 'gpt-judge',
      status: 'completed',
      winner: 'side_a',
      margin: 0.5,
      judgeConfidence: 'medium',
      needsHumanReview: false,
      disagreementRate: 0.5,
      adoptedCritiqueRate: 1.0,
      unsupportedClaimCount: 0,
      runId: 'run-5',
      error: null,
    },
  ];

  const summary = buildSummary(results);

  assert.ok(summary.includes('Errors: 1'));
  assert.ok(summary.includes('Model output is not valid JSON'));
  assert.ok(summary.includes('ERROR'));
});
