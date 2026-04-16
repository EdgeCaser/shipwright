import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { parseCliArgs, rejudgeConflictRun } from '../scripts/rejudge-conflict-run.mjs';
import { validateConflictDocument } from '../scripts/build-case-packet.mjs';

test('parseCliArgs handles rejudge options', () => {
  const args = parseCliArgs([
    '--run-dir', '/tmp/example-run',
    '--judge-agent', 'gemini',
    '--label', 'gemini-pilot',
    '--judge-reasoning-effort', 'medium',
    '--timeout-ms', '90000',
    '--format', 'json',
  ]);

  assert.equal(args.runDir, '/tmp/example-run');
  assert.equal(args.judgeAgent, 'gemini');
  assert.equal(args.label, 'gemini-pilot');
  assert.equal(args.judgeReasoningEffort, 'medium');
  assert.equal(args.timeoutMs, 90000);
  assert.equal(args.format, 'json');
});

test('rejudgeConflictRun reuses saved judge prompt and writes a sidecar verdict', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  const run = {
    run_id: 'conflict-test-run',
  };
  const judgePacket = {
    case_packet: { scenario_id: 'board-update-ambiguity' },
    first_pass_artifacts: { side_a: {}, side_b: {} },
    critique_packets: { side_a: {}, side_b: {} },
    final_artifacts: { side_a: {}, side_b: {} },
    min_margin_for_verdict: 0.1,
  };
  const prompt = 'Return ONLY a JSON object.';
  const verdict = {
    winner: 'side_b',
    margin: 0.8,
    rubric_scores: {
      side_a: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 3.0,
      },
      side_b: {
        claim_quality: 4,
        evidence_discipline: 4,
        responsiveness_to_critique: 4,
        internal_consistency: 4,
        decision_usefulness: 4,
        weighted_total: 4.0,
      },
    },
    dimension_rationales: {
      claim_quality: 'Side B states the stronger core case.',
      evidence_discipline: 'Side B uses the available evidence more carefully.',
      responsiveness_to_critique: 'Side B better incorporates the critique.',
      internal_consistency: 'Side B is more internally consistent.',
      decision_usefulness: 'Side B is more helpful to an actual decision maker.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Clear framing.'],
        weaknesses: ['Less complete final recommendation.'],
      },
      side_b: {
        strengths: ['More actionable recommendation.'],
        weaknesses: ['Slightly denser prose.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
    decisive_findings: ['Side B is more decision-useful.'],
    judge_confidence: 'medium',
    needs_human_review: false,
    rationale: 'Side B better addressed the board decision.',
  };

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), `${JSON.stringify(run, null, 2)}\n`),
    writeFile(path.join(judgeDir, 'verdict.input.json'), `${JSON.stringify(judgePacket, null, 2)}\n`),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), prompt),
  ]);

  const seen = [];
  const result = await rejudgeConflictRun({
    runDir,
    judgeAgent: 'gemini',
    label: 'gemini-pilot',
    turnRunner: async (turnOptions) => {
      seen.push(turnOptions);
      return {
        stdout: `${JSON.stringify(verdict, null, 2)}\n`,
        stderr: '',
        exitCode: 0,
      };
    },
  });

  assert.equal(seen.length, 1);
  assert.equal(seen[0].phase, 'judge');
  assert.equal(seen[0].runId, 'conflict-test-run');
  assert.equal(seen[0].reasoningEffort, 'medium');
  assert.equal(result.verdict.winner, 'side_b');

  const metadata = JSON.parse(await readFile(path.join(result.outputDir, 'metadata.json'), 'utf8'));
  assert.equal(metadata.judge.agent, 'gemini');
  assert.equal(metadata.judge.label, 'gemini-pilot');
  assert.equal(metadata.replay.repair_attempted, false);
  assert.equal(metadata.replay.repair_attempts, 0);

  const savedVerdict = JSON.parse(await readFile(path.join(result.outputDir, 'verdict.json'), 'utf8'));
  assert.equal(savedVerdict.margin, 0.8);
  assert.equal(savedVerdict.decisive_dimension, 'decision_usefulness');
});

test('rejudgeConflictRun rejects unknown judge agents', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), '{ "run_id": "x" }\n'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), '{}\n'),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'prompt'),
  ]);

  await assert.rejects(
    () => rejudgeConflictRun({ runDir, judgeAgent: 'unknown-bot' }),
    (error) => {
      assert.ok(error.message.includes('Unknown judge agent'));
      return true;
    },
  );
});

test('rejudgeConflictRun repairs Gemini verdicts that only miss structured fields', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), '{ "run_id": "repair-run" }\n'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), '{}\n'),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'prompt'),
  ]);

  const incompleteVerdict = {
    winner: 'side_a',
    margin: 0.1,
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
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 3,
      },
    },
    decisive_findings: ['Side A is more actionable.'],
    judge_confidence: 'medium',
    needs_human_review: false,
    rationale: 'Side A wins.',
  };

  const repairedVerdict = {
    ...incompleteVerdict,
    dimension_rationales: {
      claim_quality: 'Side A is stronger.',
      evidence_discipline: 'Side A is tighter.',
      responsiveness_to_critique: 'Side A addressed critique better.',
      internal_consistency: 'Side A is more coherent.',
      decision_usefulness: 'Side A is more useful.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Actionable recommendation.'],
        weaknesses: ['Could be shorter.'],
      },
      side_b: {
        strengths: ['Good framing.'],
        weaknesses: ['Less decisive.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
  };

  let callCount = 0;
  const result = await rejudgeConflictRun({
    runDir,
    judgeAgent: 'gemini',
    label: 'gemini-repair',
    turnRunner: async () => {
      callCount += 1;
      return {
        stdout: `${JSON.stringify(callCount === 1 ? incompleteVerdict : repairedVerdict, null, 2)}\n`,
        stderr: '',
        exitCode: 0,
      };
    },
  });

  assert.equal(callCount, 2);
  assert.equal(result.verdict.decisive_dimension, 'decision_usefulness');

  const metadata = JSON.parse(await readFile(path.join(result.outputDir, 'metadata.json'), 'utf8'));
  assert.equal(metadata.replay.repair_attempted, true);
  assert.equal(metadata.replay.repair_attempts, 1);
});

test('rejudgeConflictRun repairs Gemini verdicts that miss structured fields and weighted totals', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), '{ "run_id": "repair-run-2" }\n'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), '{}\n'),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'prompt'),
  ]);

  const incompleteVerdict = {
    winner: 'side_b',
    margin: 0.4,
    rubric_scores: {
      side_a: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
      },
      side_b: {
        claim_quality: 4,
        evidence_discipline: 4,
        responsiveness_to_critique: 4,
        internal_consistency: 4,
        decision_usefulness: 4,
      },
    },
    decisive_findings: ['Side B is stronger overall.'],
    judge_confidence: 'medium',
    needs_human_review: true,
    rationale: 'Side B wins with a clearer recommendation.',
  };

  const repairedVerdict = {
    ...incompleteVerdict,
    rubric_scores: {
      side_a: {
        ...incompleteVerdict.rubric_scores.side_a,
        weighted_total: 3,
      },
      side_b: {
        ...incompleteVerdict.rubric_scores.side_b,
        weighted_total: 4,
      },
    },
    dimension_rationales: {
      claim_quality: 'Side B has the stronger claims.',
      evidence_discipline: 'Side B uses evidence more carefully.',
      responsiveness_to_critique: 'Side B absorbs critique better.',
      internal_consistency: 'Side B is more coherent.',
      decision_usefulness: 'Side B is more useful to the decision maker.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Good framing.'],
        weaknesses: ['Less complete recommendation.'],
      },
      side_b: {
        strengths: ['More decisive recommendation.'],
        weaknesses: ['Slightly more rigid stance.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
    uncertainty_drivers: ['Close margins across most dimensions.'],
    disambiguation_questions: ['Which dimension drove the most disagreement?'],
    needed_evidence: ['Final revision artifacts with tracked changes.'],
    recommended_next_artifact: 'Revised final artifact from Side B.',
    recommended_next_action: 'Request a triple-panel review.',
    can_resolve_with_more_evidence: true,
    escalation_recommendation: 'Escalate to triple-panel review.',
  };

  let callCount = 0;
  const result = await rejudgeConflictRun({
    runDir,
    judgeAgent: 'gemini',
    label: 'gemini-repair-2',
    turnRunner: async () => {
      callCount += 1;
      return {
        stdout: `${JSON.stringify(callCount === 1 ? incompleteVerdict : repairedVerdict, null, 2)}\n`,
        stderr: '',
        exitCode: 0,
      };
    },
  });

  assert.equal(callCount, 2);
  assert.equal(result.verdict.rubric_scores.side_a.weighted_total, 3);
  assert.equal(result.verdict.rubric_scores.side_b.weighted_total, 4);
});

test('rejudgeConflictRun repairs GPT verdicts that miss structured fields and weighted totals', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), '{ "run_id": "repair-run-gpt" }\n'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), '{}\n'),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'prompt'),
  ]);

  const incompleteVerdict = {
    winner: 'side_b',
    margin: 0.3,
    rubric_scores: {
      side_a: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
      },
      side_b: {
        claim_quality: 4,
        evidence_discipline: 4,
        responsiveness_to_critique: 4,
        internal_consistency: 4,
        decision_usefulness: 4,
      },
    },
    decisive_findings: ['Side B is stronger overall.'],
    judge_confidence: 'medium',
    needs_human_review: false,
    rationale: 'Side B wins.',
  };

  const repairedVerdict = {
    ...incompleteVerdict,
    rubric_scores: {
      side_a: {
        ...incompleteVerdict.rubric_scores.side_a,
        weighted_total: 3,
      },
      side_b: {
        ...incompleteVerdict.rubric_scores.side_b,
        weighted_total: 4,
      },
    },
    dimension_rationales: {
      claim_quality: 'Side B has the stronger claims.',
      evidence_discipline: 'Side B uses evidence more carefully.',
      responsiveness_to_critique: 'Side B absorbs critique better.',
      internal_consistency: 'Side B is more coherent.',
      decision_usefulness: 'Side B is more useful to the decision maker.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Good framing.'],
        weaknesses: ['Less complete recommendation.'],
      },
      side_b: {
        strengths: ['More decisive recommendation.'],
        weaknesses: ['Slightly more rigid stance.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
  };

  let callCount = 0;
  const result = await rejudgeConflictRun({
    runDir,
    judgeAgent: 'gpt',
    label: 'gpt-repair',
    turnRunner: async () => {
      callCount += 1;
      return {
        stdout: `${JSON.stringify(callCount === 1 ? incompleteVerdict : repairedVerdict, null, 2)}\n`,
        stderr: '',
        exitCode: 0,
      };
    },
  });

  assert.equal(callCount, 2);
  assert.equal(result.verdict.decisive_dimension, 'decision_usefulness');
  assert.equal(result.verdict.rubric_scores.side_b.weighted_total, 4);
});

test('rejudgeConflictRun repairs verdicts that produce invalid JSON output', async () => {
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-rejudge-'));
  const runDir = path.join(tmpRoot, 'conflict-run');
  const judgeDir = path.join(runDir, 'judge');
  await mkdir(judgeDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(runDir, 'run.json'), '{ "run_id": "jsonrepair-run" }\n'),
    writeFile(path.join(judgeDir, 'verdict.input.json'), '{}\n'),
    writeFile(path.join(judgeDir, 'verdict.prompt.txt'), 'Return ONLY a JSON object.'),
  ]);

  const validVerdict = {
    winner: 'side_a',
    margin: 0.4,
    rubric_scores: {
      side_a: {
        claim_quality: 4,
        evidence_discipline: 4,
        responsiveness_to_critique: 4,
        internal_consistency: 4,
        decision_usefulness: 4,
        weighted_total: 4.0,
      },
      side_b: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 3.0,
      },
    },
    dimension_rationales: {
      claim_quality: 'Side A makes the stronger claims.',
      evidence_discipline: 'Side A uses evidence more carefully.',
      responsiveness_to_critique: 'Side A absorbed the critique better.',
      internal_consistency: 'Side A is more coherent.',
      decision_usefulness: 'Side A is more useful to the decision maker.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Actionable recommendation.'],
        weaknesses: ['Could be shorter.'],
      },
      side_b: {
        strengths: ['Good framing.'],
        weaknesses: ['Less decisive.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
    decisive_findings: ['Side A is more decision-useful.'],
    judge_confidence: 'medium',
    needs_human_review: false,
    rationale: 'Side A is stronger overall.',
  };

  let callCount = 0;
  const result = await rejudgeConflictRun({
    runDir,
    judgeAgent: 'gpt',
    label: 'gpt-jsonrepair',
    turnRunner: async () => {
      callCount += 1;
      if (callCount === 1) {
        // First attempt: model wraps JSON in prose — not valid JSON
        return { stdout: 'Here is my verdict:\n\n```json\n{ winner: "side_a" }\n```', stderr: '', exitCode: 0 };
      }
      // Second attempt (JSON repair): valid verdict
      return { stdout: `${JSON.stringify(validVerdict, null, 2)}\n`, stderr: '', exitCode: 0 };
    },
  });

  assert.equal(callCount, 2);
  assert.equal(result.verdict.winner, 'side_a');
  assert.equal(result.verdict.decisive_dimension, 'decision_usefulness');

  const metadata = JSON.parse(await readFile(path.join(result.outputDir, 'metadata.json'), 'utf8'));
  assert.equal(metadata.replay.repair_attempted, true);
  assert.equal(metadata.replay.repair_attempts, 1);
});

test('verdict schema rejects weighted totals outside the 1-5 scale', () => {
  const verdict = {
    winner: 'side_a',
    margin: 1,
    rubric_scores: {
      side_a: {
        claim_quality: 4,
        evidence_discipline: 4,
        responsiveness_to_critique: 4,
        internal_consistency: 4,
        decision_usefulness: 4,
        weighted_total: 20,
      },
      side_b: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 19,
      },
    },
    dimension_rationales: {
      claim_quality: 'Side A is stronger.',
      evidence_discipline: 'Side A is tighter.',
      responsiveness_to_critique: 'Side A is more responsive.',
      internal_consistency: 'Side A is more coherent.',
      decision_usefulness: 'Side A is more useful.',
    },
    side_summaries: {
      side_a: {
        strengths: ['Good strategy.'],
        weaknesses: ['Could be shorter.'],
      },
      side_b: {
        strengths: ['Good framing.'],
        weaknesses: ['Less useful.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
    decisive_findings: ['Side A is stronger.'],
    judge_confidence: 'medium',
    needs_human_review: true,
    rationale: 'Side A wins.',
  };

  const validation = validateConflictDocument(verdict, 'verdict');
  assert.ok(validation.errors.some((error) => error.path === '$.rubric_scores.side_a.weighted_total'));
  assert.ok(validation.errors.some((error) => error.path === '$.rubric_scores.side_b.weighted_total'));
});
