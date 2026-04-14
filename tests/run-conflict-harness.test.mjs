import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { injectReasoningEffort, runConflictHarness } from '../scripts/run-conflict-harness.mjs';

function createCasePacket() {
  return {
    scenario_id: 'conflict-smoke',
    title: 'Conflict Smoke Test',
    prompt: 'Write the strongest possible recommendation.',
    artifact_type: 'strategy',
    rubric: {
      dimensions: [
        'claim quality',
        'evidence discipline',
        'responsiveness to critique',
        'internal consistency',
        'decision usefulness',
      ],
      scoring_scale: '1-5',
      expected_sections: ['Decision Frame'],
      scoring_spec_ref: null,
    },
    constraints: {
      expected_sections: ['Decision Frame'],
      expect_structured: false,
      context_files: [],
      scoring_spec_ref: null,
    },
    evidence: [],
    max_rounds: 3,
    tool_policy: 'none',
    sharing_policy: {
      share_case_packet: true,
      share_committed_artifacts_after_first_pass: true,
      share_critiques_after_open: true,
      share_hidden_reasoning: false,
      share_provider_identity: false,
      share_internal_coalition_drafts: false,
    },
    success_condition: {
      type: 'validator_contract',
      description: 'Return a valid artifact packet.',
      validator: {
        artifact_type: 'strategy',
        expect_sections: ['Decision Frame'],
        expect_structured: false,
      },
    },
  };
}

test('runConflictHarness completes a head-to-head run and writes state', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-conflict-run-'));
  const calls = [];

  try {
    const { run, outDir } = await runConflictHarness({
      casePacket: createCasePacket(),
      outDir: rootDir,
      runId: 'conflict-smoke-run',
      sideAReasoningEffort: 'high',
      sideBReasoningEffort: 'low',
      judgeReasoningEffort: 'medium',
      turnRunner: async (options) => {
        calls.push({
          phase: options.phase,
          sideId: options.sideId,
          prompt: options.prompt,
          packet: options.packet,
          attempt: options.attempt,
          reasoningEffort: options.reasoningEffort,
        });

        if (options.phase === 'first_pass') {
          return {
            packet: {
              run_id: 'conflict-smoke-run',
              side_id: options.sideId,
              round: 'first_pass',
              artifact_markdown: `# ${options.sideId} first pass`,
              claims: [
                {
                  claim_id: `${options.sideId}-claim-1`,
                  summary: `${options.sideId} major claim`,
                  evidence_refs: ['ctx-1'],
                  is_major: true,
                },
              ],
              citations: ['ctx-1'],
              conclusion_confidence: 'medium',
              open_questions: [],
              critique_responses: [],
            },
            usage: { estimatedCostUsd: 0 },
          };
        }

        if (options.phase === 'rebuttal') {
          return {
            packet: {
              target_side: options.sideId === 'side_a' ? 'side_b' : 'side_a',
              finding_id: 'ignored-by-runner',
              target_claim_ids: [options.sideId === 'side_a' ? 'side_b-claim-1' : 'side_a-claim-1'],
              claim_under_attack: 'The opposing claim is weak.',
              attack_type: 'evidence_gap',
              evidence_or_reason: 'The visible claim needs stronger support.',
              severity: 'medium',
            },
            usage: { estimatedCostUsd: 0 },
          };
        }

        if (options.phase === 'final') {
          return {
            packet: {
              run_id: 'conflict-smoke-run',
              side_id: options.sideId,
              round: 'final',
              artifact_markdown: `# ${options.sideId} final`,
              claims: [
                {
                  claim_id: `${options.sideId}-claim-1`,
                  summary: `${options.sideId} revised claim`,
                  evidence_refs: ['ctx-1'],
                  is_major: true,
                },
              ],
              citations: ['ctx-1'],
              conclusion_confidence: 'high',
              open_questions: [],
              critique_responses: [
                {
                  finding_id: options.sideId === 'side_a' ? 'finding-2' : 'finding-1',
                  disposition: 'adopted',
                  rationale: 'The critique improved the final answer.',
                },
              ],
            },
            usage: { estimatedCostUsd: 0 },
          };
        }

        if (options.phase === 'judge') {
          return {
            packet: {
              winner: 'side_a',
              margin: 0.2,
              rubric_scores: {
                side_a: {
                  claim_quality: 5,
                  evidence_discipline: 4,
                  responsiveness_to_critique: 4,
                  internal_consistency: 5,
                  decision_usefulness: 4,
                  weighted_total: 4.4,
                },
                side_b: {
                  claim_quality: 4,
                  evidence_discipline: 3,
                  responsiveness_to_critique: 3,
                  internal_consistency: 4,
                  decision_usefulness: 3,
                  weighted_total: 3.4,
                },
              },
              dimension_rationales: {
                claim_quality: 'Side A made the crisper top-level claim.',
                evidence_discipline: 'Side A stayed closer to the visible evidence.',
                responsiveness_to_critique: 'Side A addressed the rebuttal more concretely.',
                internal_consistency: 'Side A had fewer internal gaps.',
                decision_usefulness: 'Side A gave the board a more actionable posture.',
              },
              side_summaries: {
                side_a: {
                  strengths: ['Concrete response to critique.'],
                  weaknesses: ['Less ambitious framing.'],
                },
                side_b: {
                  strengths: ['Broader framing of the problem.'],
                  weaknesses: ['More diffuse final recommendation.'],
                },
              },
              decisive_findings: ['Side A responded more concretely to the rebuttal.'],
              judge_confidence: 'medium',
              needs_human_review: false,
              rationale: 'Side A is clearer and more responsive.',
            },
            usage: { estimatedCostUsd: 0 },
          };
        }

        throw new Error(`Unexpected phase: ${options.phase}`);
      },
    });

    const state = JSON.parse(await readFile(path.join(outDir, 'state.json'), 'utf8'));
    const config = JSON.parse(await readFile(path.join(outDir, 'config.json'), 'utf8'));
    const judgeCall = calls.find((entry) => entry.phase === 'judge');
    const sideACall = calls.find((entry) => entry.phase === 'first_pass' && entry.sideId === 'side_a');
    const sideBCall = calls.find((entry) => entry.phase === 'first_pass' && entry.sideId === 'side_b');

    assert.equal(run.status, 'completed');
    assert.equal(run.results.winner, 'side_a');
    assert.equal(run.metrics.declared_adoption_rate, 1);
    assert.equal(run.metrics.substantive_revision_rate, 1);
    assert.equal(run.sides.side_a.reasoning_effort, 'high');
    assert.equal(run.sides.side_b.reasoning_effort, 'low');
    assert.equal(run.judge.reasoning_effort, 'medium');
    assert.equal(state.last_completed_phase, 'adjudication');
    assert.equal(state.status, 'completed');
    assert.deepEqual(config.reasoning_efforts, {
      side_a: 'high',
      side_b: 'low',
      judge: 'medium',
    });
    assert.equal(sideACall.reasoningEffort, 'high');
    assert.equal(sideBCall.reasoningEffort, 'low');
    assert.equal(judgeCall.reasoningEffort, 'medium');
    assert.ok(judgeCall.prompt.includes('judge_confidence rubric'));
    assert.ok(judgeCall.prompt.includes('min_margin_for_verdict = 0.1'));
    assert.ok(judgeCall.prompt.includes('conclusion_confidence'));
    assert.ok(!('provider' in judgeCall.packet));
    assert.ok(!('provider' in judgeCall.packet.first_pass_artifacts.side_a));
    assert.ok(!('provider' in judgeCall.packet.first_pass_artifacts.side_b));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('injectReasoningEffort pins Gemini to project-local aliases', () => {
  const low = injectReasoningEffort('cat {{prompt_file}} | gemini --approval-mode plan --output-format text -p ""', 'low');
  const medium = injectReasoningEffort('cat {{prompt_file}} | gemini --approval-mode plan --output-format text -p ""', 'medium');
  const high = injectReasoningEffort('cat {{prompt_file}} | gemini --approval-mode plan --output-format text -p ""', 'high');

  assert.ok(low.includes("gemini -m 'shipwright-gemini-low'"));
  assert.ok(medium.includes("gemini -m 'shipwright-gemini-medium'"));
  assert.ok(high.includes("gemini -m 'shipwright-gemini-high'"));
});

test('runConflictHarness enforces budget at phase boundaries', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-conflict-budget-'));
  const calls = [];

  try {
    const { run } = await runConflictHarness({
      casePacket: createCasePacket(),
      outDir: rootDir,
      runId: 'conflict-budget-run',
      maxCostUsd: 10,
      turnRunner: async (options) => {
        calls.push(`${options.phase}:${options.sideId || 'judge'}`);
        if (options.phase === 'first_pass') {
          return {
            packet: {
              run_id: 'conflict-budget-run',
              side_id: options.sideId,
              round: 'first_pass',
              artifact_markdown: `# ${options.sideId} first pass`,
              claims: [
                {
                  claim_id: `${options.sideId}-claim-1`,
                  summary: `${options.sideId} major claim`,
                  evidence_refs: ['ctx-1'],
                  is_major: true,
                },
              ],
              citations: ['ctx-1'],
              conclusion_confidence: 'medium',
              open_questions: [],
              critique_responses: [],
            },
            usage: { estimatedCostUsd: 7 },
          };
        }

        throw new Error('No phase after first_pass should execute.');
      },
    });

    assert.equal(run.status, 'budget_exhausted');
    assert.ok(run.sides.side_a.first_pass);
    assert.ok(run.sides.side_b.first_pass);
    assert.deepEqual(calls, ['first_pass:side_a', 'first_pass:side_b']);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('runConflictHarness retries first-pass identity leakage once before continuing', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-conflict-leak-'));
  let firstPassAttempts = 0;
  const prompts = [];

  try {
    await runConflictHarness({
      casePacket: createCasePacket(),
      outDir: rootDir,
      runId: 'conflict-leak-run',
      turnRunner: async (options) => {
        if (options.phase === 'first_pass' && options.sideId === 'side_a') {
          prompts.push(options.prompt);
        }
        if (options.phase === 'first_pass' && options.sideId === 'side_a') {
          firstPassAttempts += 1;
          if (firstPassAttempts === 1) {
            return {
              packet: {
                run_id: 'conflict-leak-run',
                side_id: 'side_a',
                round: 'first_pass',
                artifact_markdown: '# As ChatGPT I recommend shipping now',
                claims: [
                  {
                    claim_id: 'side_a-claim-1',
                    summary: 'Leaky claim',
                    evidence_refs: ['ctx-1'],
                    is_major: true,
                  },
                ],
                citations: ['ctx-1'],
                conclusion_confidence: 'medium',
                open_questions: [],
                critique_responses: [],
              },
              usage: { estimatedCostUsd: 0 },
            };
          }
        }

        if (options.phase === 'first_pass') {
          return {
            packet: {
              run_id: 'conflict-leak-run',
              side_id: options.sideId,
              round: 'first_pass',
              artifact_markdown: `# ${options.sideId} clean first pass`,
              claims: [
                {
                  claim_id: `${options.sideId}-claim-1`,
                  summary: `${options.sideId} claim`,
                  evidence_refs: ['ctx-1'],
                  is_major: true,
                },
              ],
              citations: ['ctx-1'],
              conclusion_confidence: 'medium',
              open_questions: [],
              critique_responses: [],
            },
            usage: { estimatedCostUsd: 0 },
          };
        }

        if (options.phase === 'rebuttal') {
          return {
            packet: {
              target_side: options.sideId === 'side_a' ? 'side_b' : 'side_a',
              finding_id: 'ignored',
              target_claim_ids: [options.sideId === 'side_a' ? 'side_b-claim-1' : 'side_a-claim-1'],
              claim_under_attack: 'Weak claim',
              attack_type: 'evidence_gap',
              evidence_or_reason: 'Needs more proof.',
              severity: 'medium',
            },
          };
        }

        if (options.phase === 'final') {
          return {
            packet: {
              run_id: 'conflict-leak-run',
              side_id: options.sideId,
              round: 'final',
              artifact_markdown: `# ${options.sideId} final`,
              claims: [
                {
                  claim_id: `${options.sideId}-claim-1`,
                  summary: `${options.sideId} final claim`,
                  evidence_refs: ['ctx-1'],
                  is_major: true,
                },
              ],
              citations: ['ctx-1'],
              conclusion_confidence: 'high',
              open_questions: [],
              critique_responses: [
                {
                  finding_id: options.sideId === 'side_a' ? 'finding-2' : 'finding-1',
                  disposition: 'adopted',
                  rationale: 'Updated cleanly.',
                },
              ],
            },
          };
        }

        if (options.phase === 'judge') {
          return {
            packet: {
              winner: 'side_b',
              margin: 0.15,
              rubric_scores: {
                side_a: {
                  claim_quality: 4,
                  evidence_discipline: 4,
                  responsiveness_to_critique: 4,
                  internal_consistency: 4,
                  decision_usefulness: 4,
                  weighted_total: 4,
                },
                side_b: {
                  claim_quality: 5,
                  evidence_discipline: 4,
                  responsiveness_to_critique: 5,
                  internal_consistency: 5,
                  decision_usefulness: 4,
                  weighted_total: 4.6,
                },
              },
              dimension_rationales: {
                claim_quality: 'Side B made the stronger core recommendation.',
                evidence_discipline: 'Both sides were similar on evidence use.',
                responsiveness_to_critique: 'Side B responded more directly to the critique.',
                internal_consistency: 'Side B was more internally coherent.',
                decision_usefulness: 'Side B was more actionable overall.',
              },
              side_summaries: {
                side_a: {
                  strengths: ['Clear initial structure.'],
                  weaknesses: ['Did not fully resolve the critique.'],
                },
                side_b: {
                  strengths: ['More complete final answer.'],
                  weaknesses: ['Still had minor ambiguity.'],
                },
              },
              decisive_findings: ['Side B was stronger.'],
              judge_confidence: 'medium',
              needs_human_review: false,
              rationale: 'Side B wins.',
            },
          };
        }

        throw new Error(`Unexpected phase: ${options.phase}`);
      },
    });

    assert.equal(firstPassAttempts, 2);
    assert.ok(prompts[1].includes('Repair instruction: remove any provider self-identification'));
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('runConflictHarness terminates with protocol_violation after repeated unseen-opponent references', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-conflict-protocol-'));
  const prompts = [];
  const runId = 'conflict-protocol-run';
  const transcriptDir = path.join(rootDir, 'conflict-smoke', runId);

  try {
    await assert.rejects(
      runConflictHarness({
        casePacket: createCasePacket(),
        outDir: rootDir,
        runId,
        turnRunner: async (options) => {
          if (options.phase === 'first_pass' && options.sideId === 'side_a') {
            prompts.push(options.prompt);
            return {
              packet: {
                run_id: runId,
                side_id: 'side_a',
                round: 'first_pass',
                artifact_markdown: '# As Side B argued, the recommendation should narrow the scope',
                claims: [
                  {
                    claim_id: 'side_a-claim-1',
                    summary: 'Protocol violation claim',
                    evidence_refs: ['ctx-1'],
                    is_major: true,
                  },
                ],
                citations: ['ctx-1'],
                conclusion_confidence: 'medium',
                open_questions: [],
                critique_responses: [],
              },
              usage: { estimatedCostUsd: 0 },
            };
          }

          if (options.phase === 'first_pass') {
            return {
              packet: {
                run_id: runId,
                side_id: options.sideId,
                round: 'first_pass',
                artifact_markdown: `# ${options.sideId} first pass`,
                claims: [
                  {
                    claim_id: `${options.sideId}-claim-1`,
                    summary: `${options.sideId} claim`,
                    evidence_refs: ['ctx-1'],
                    is_major: true,
                  },
                ],
                citations: ['ctx-1'],
                conclusion_confidence: 'medium',
                open_questions: [],
                critique_responses: [],
              },
              usage: { estimatedCostUsd: 0 },
            };
          }

          throw new Error(`Unexpected phase: ${options.phase}`);
        },
      }),
      /Protocol violation/,
    );

    const persistedRun = JSON.parse(await readFile(path.join(transcriptDir, 'run.json'), 'utf8'));
    const persistedState = JSON.parse(await readFile(path.join(transcriptDir, 'state.json'), 'utf8'));

    assert.equal(prompts.length, 2);
    assert.ok(prompts[1].includes('Repair instruction: remove any mention of unseen opponent content'));
    assert.equal(persistedRun.status, 'protocol_violation');
    assert.equal(persistedState.status, 'protocol_violation');
    assert.ok(persistedRun.audit.protocol_violations.length > 0);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
