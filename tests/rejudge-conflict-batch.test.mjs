import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildBatchSummary,
  discoverRunDirs,
  parseCliArgs,
  runRejudgeBatch,
} from '../scripts/rejudge-conflict-batch.mjs';

test('parseCliArgs handles batch rejudge options', () => {
  const args = parseCliArgs([
    '--root-dir', '/tmp/results',
    '--scenario', 'board-update-ambiguity',
    '--run-dir', '/tmp/results/foo/conflict-1',
    '--judge-agent', 'gemini',
    '--label', 'gemini-pilot',
    '--out', '/tmp/summary.md',
    '--format', 'json',
  ]);

  assert.equal(args.rootDir, '/tmp/results');
  assert.deepEqual(args.scenarios, ['board-update-ambiguity']);
  assert.deepEqual(args.runDirs, ['/tmp/results/foo/conflict-1']);
  assert.equal(args.judgeAgent, 'gemini');
  assert.equal(args.label, 'gemini-pilot');
  assert.equal(args.outPath, '/tmp/summary.md');
  assert.equal(args.format, 'json');
});

test('discoverRunDirs finds completed run directories and filters scenarios', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-batch-'));
  const scenarioA = path.join(rootDir, 'board-update-ambiguity');
  const scenarioB = path.join(rootDir, 'handoff-contradiction');
  const runA = path.join(scenarioA, 'conflict-a');
  const runB = path.join(scenarioB, 'conflict-b');
  await mkdir(runA, { recursive: true });
  await mkdir(runB, { recursive: true });
  await mkdir(path.join(scenarioA, 'not-a-run'), { recursive: true });

  const all = await discoverRunDirs(rootDir);
  const filtered = await discoverRunDirs(rootDir, ['handoff-contradiction']);

  assert.deepEqual(all, [runA, runB]);
  assert.deepEqual(filtered, [runB]);
});

test('runRejudgeBatch reuses single-run replay across multiple completed runs', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-batch-'));
  const runDir = path.join(rootDir, 'board-update-ambiguity', 'conflict-a');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), JSON.stringify({ run_id: 'conflict-a', scenario_id: 'board-update-ambiguity' })),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'prompt'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), JSON.stringify({ case_packet: {}, first_pass_artifacts: {}, critique_packets: {}, final_artifacts: {}, min_margin_for_verdict: 0.1 })),
  ]);

  const results = await runRejudgeBatch({
    runDirs: [runDir],
    judgeAgent: 'gemini',
    turnRunner: async () => ({
      stdout: JSON.stringify({
        winner: 'side_b',
        margin: 0.7,
        rubric_scores: {
          side_a: {
            claim_quality: 3,
            evidence_discipline: 3,
            responsiveness_to_critique: 3,
            internal_consistency: 3,
            decision_usefulness: 3,
            weighted_total: 3,
          },
          side_b: {
            claim_quality: 4,
            evidence_discipline: 4,
            responsiveness_to_critique: 4,
            internal_consistency: 4,
            decision_usefulness: 4,
            weighted_total: 4,
          },
        },
        dimension_rationales: {
          claim_quality: 'Side B stronger.',
          evidence_discipline: 'Side B cleaner.',
          responsiveness_to_critique: 'Side B better.',
          internal_consistency: 'Side B tighter.',
          decision_usefulness: 'Side B more useful.',
        },
        side_summaries: {
          side_a: { strengths: ['Clear framing.'], weaknesses: ['Weaker conclusion.'] },
          side_b: { strengths: ['Stronger recommendation.'], weaknesses: ['Slightly dense.'] },
        },
        decisive_findings: ['Side B is more decision-useful.'],
        judge_confidence: 'medium',
        needs_human_review: false,
        rationale: 'Side B wins.',
      }),
      stderr: '',
      exitCode: 0,
    }),
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].status, 'completed');
  assert.equal(results[0].winner, 'side_b');
  assert.equal(results[0].scenario, 'board-update-ambiguity');
});

test('buildBatchSummary renders compact replay results', () => {
  const summary = buildBatchSummary([
    {
      scenario: 'board-update-ambiguity',
      runId: 'conflict-a',
      status: 'completed',
      winner: 'side_b',
      margin: 0.7,
      judgeConfidence: 'medium',
      needsHumanReview: false,
    },
    {
      scenario: 'handoff-contradiction',
      runId: 'conflict-b',
      status: 'error',
      winner: null,
      margin: null,
      judgeConfidence: null,
      needsHumanReview: null,
    },
  ], 'gemini-judge');

  assert.ok(summary.includes('# Rejudge Batch Summary'));
  assert.ok(summary.includes('Judge: gemini-judge'));
  assert.ok(summary.includes('Errors: 1'));
  assert.ok(summary.includes('board-update-ambiguity'));
  assert.ok(summary.includes('conflict-a'));
});
