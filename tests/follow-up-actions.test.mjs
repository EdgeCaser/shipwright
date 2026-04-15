import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  executeFollowUpAction,
  buildRefinedQuestion,
  SUPPORTED_FOLLOW_UP_ACTIONS,
} from '../scripts/follow-up-actions.mjs';
import { createSession, getSessionDirectory } from '../scripts/session-store.mjs';
import {
  startDecisionSession,
  runFollowUpAction,
} from '../scripts/decision-session-controller.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fast turn runner that reads run_id/scenario_id from options (same
 * approach as decision-session-controller.test.mjs).
 */
function makeFastTurnRunner(overrides = {}) {
  return async (options) => {
    const runId = options.runId || 'fast-unknown';
    const scenarioId = runId.replace(/^fast-\d{4}-\d{2}-\d{2}-\d+Z-/, '') || 'unknown';
    const analysis = {
      run_id: runId,
      scenario_id: scenarioId,
      recommendation: overrides.recommendation ?? 'Gather more evidence before deciding.',
      confidence_band: overrides.confidence_band ?? 'high',
      needs_human_review: overrides.needs_human_review ?? false,
      summary: 'Re-analysis complete.',
      key_reasoning: ['Revised context resolved prior ambiguity.'],
      ...overrides,
    };
    analysis.run_id = runId;
    analysis.scenario_id = scenarioId;

    if ((analysis.confidence_band !== 'high' || analysis.needs_human_review) && !analysis.uncertainty_payload) {
      analysis.uncertainty_payload = {
        uncertainty_drivers: ['key data still missing'],
        disambiguation_questions: ['What are Q1 churn numbers?'],
        needed_evidence: ['Q1 retention cohort'],
        recommended_next_action: 'Pull Q1 data before deciding.',
      };
    }
    return { stdout: JSON.stringify(analysis) };
  };
}

/**
 * Create a session in not_ready state with an analysis artifact that has an
 * uncertainty payload. Used for testing action execution.
 */
async function createNotReadySessionWithArtifact(root) {
  // Build a fast analysis first so we have a real artifact
  const started = await startDecisionSession({
    question: 'Should we raise prices by 10%?',
    scenario_class: 'pricing',
    available_providers: ['claude'],
    sessions_root: root,
    fast_turn_runner: makeFastTurnRunner({
      confidence_band: 'medium',
      needs_human_review: true,
    }),
  });

  return started;
}

// ---------------------------------------------------------------------------
// SUPPORTED_FOLLOW_UP_ACTIONS
// ---------------------------------------------------------------------------

test('SUPPORTED_FOLLOW_UP_ACTIONS contains the three expected actions', () => {
  assert.ok(SUPPORTED_FOLLOW_UP_ACTIONS.includes('gather_more_evidence'));
  assert.ok(SUPPORTED_FOLLOW_UP_ACTIONS.includes('create_follow_up_brief'));
  assert.ok(SUPPORTED_FOLLOW_UP_ACTIONS.includes('open_human_review'));
  assert.equal(SUPPORTED_FOLLOW_UP_ACTIONS.length, 3);
});

test('SUPPORTED_FOLLOW_UP_ACTIONS is frozen', () => {
  assert.throws(() => { SUPPORTED_FOLLOW_UP_ACTIONS.push('new_action'); }, TypeError);
});

// ---------------------------------------------------------------------------
// buildRefinedQuestion
// ---------------------------------------------------------------------------

test('buildRefinedQuestion returns original question when payload is null', () => {
  const q = 'Should we raise prices?';
  assert.equal(buildRefinedQuestion(q, null), q);
});

test('buildRefinedQuestion returns original question when payload is undefined', () => {
  const q = 'Should we raise prices?';
  assert.equal(buildRefinedQuestion(q, undefined), q);
});

test('buildRefinedQuestion appends uncertainty drivers', () => {
  const refined = buildRefinedQuestion('Should we raise prices?', {
    uncertainty_drivers: ['retention data is stale', 'competitor pricing unknown'],
    disambiguation_questions: [],
    needed_evidence: [],
  });
  assert.ok(refined.includes('retention data is stale'));
  assert.ok(refined.includes('competitor pricing unknown'));
  assert.ok(refined.includes('Prior analysis was uncertain because:'));
});

test('buildRefinedQuestion appends disambiguation questions', () => {
  const refined = buildRefinedQuestion('Should we raise prices?', {
    uncertainty_drivers: [],
    disambiguation_questions: ['What is current churn?', 'What is NPS?'],
    needed_evidence: [],
  });
  assert.ok(refined.includes('What is current churn?'));
  assert.ok(refined.includes('What is NPS?'));
  assert.ok(refined.includes('Key questions to resolve:'));
});

test('buildRefinedQuestion appends needed evidence', () => {
  const refined = buildRefinedQuestion('Should we raise prices?', {
    uncertainty_drivers: [],
    disambiguation_questions: [],
    needed_evidence: ['Q1 retention cohort'],
  });
  assert.ok(refined.includes('Q1 retention cohort'));
  assert.ok(refined.includes('Evidence to seek before deciding:'));
});

test('buildRefinedQuestion always ends with a re-analysis instruction', () => {
  const refined = buildRefinedQuestion('Should we raise prices?', {
    uncertainty_drivers: ['old data'],
    disambiguation_questions: [],
    needed_evidence: [],
  });
  assert.ok(refined.includes('Re-analyze with a focus on resolving'));
});

test('buildRefinedQuestion still starts with the original question', () => {
  const original = 'Should we raise prices?';
  const refined = buildRefinedQuestion(original, {
    uncertainty_drivers: ['something'],
    disambiguation_questions: [],
    needed_evidence: [],
  });
  assert.ok(refined.startsWith(original));
});

// ---------------------------------------------------------------------------
// executeFollowUpAction — routing
// ---------------------------------------------------------------------------

test('executeFollowUpAction throws for unknown action', async () => {
  const session = {
    session_id: 'test',
    question: 'Q?',
    scenario_id: 'test',
    scenario_class: 'pricing',
    artifacts: {},
  };
  await assert.rejects(
    () => executeFollowUpAction(session, 'do_magic', {}),
    /Unknown follow-up action/,
  );
});

// ---------------------------------------------------------------------------
// open_human_review
// ---------------------------------------------------------------------------

test('executeFollowUpAction open_human_review returns review_requested mode with session context', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const session = await createSession({
      question: 'Should we pivot the product?',
      scenario_id: 'test-pivot',
      scenario_class: 'product_strategy',
      status: 'completed',
      ux_state: 'not_ready',
      sessions_root: root,
      artifacts: {},
    });

    const result = await executeFollowUpAction(session, 'open_human_review', {
      sessions_root: root,
    });

    assert.equal(result.mode, 'review_requested');
    assert.ok(result.review_payload);
    assert.equal(result.review_payload.session_id, session.session_id);
    assert.equal(result.review_payload.question, 'Should we pivot the product?');
    assert.equal(result.review_payload.scenario_class, 'product_strategy');
    assert.ok(Array.isArray(result.review_payload.uncertainty_drivers));
    assert.ok(Array.isArray(result.review_payload.disambiguation_questions));
    assert.ok(Array.isArray(result.review_payload.needed_evidence));
    assert.deepEqual(result.session_patch, { human_review_requested: true });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('executeFollowUpAction open_human_review loads uncertainty payload from analysis artifact', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const analysisPath = path.join(root, 'analysis.json');
    await writeFile(analysisPath, JSON.stringify({
      uncertainty_payload: {
        uncertainty_drivers: ['retention data is stale'],
        disambiguation_questions: ['What is Q1 churn?'],
        needed_evidence: ['Q1 cohort data'],
        recommended_next_action: 'Pull Q1 before deciding.',
      },
    }), 'utf8');

    const session = await createSession({
      question: 'Should we pivot?',
      scenario_id: 'test-pivot',
      scenario_class: 'product_strategy',
      sessions_root: root,
      artifacts: { analysis_json: analysisPath },
    });

    const result = await executeFollowUpAction(session, 'open_human_review', {
      sessions_root: root,
    });

    assert.deepEqual(result.review_payload.uncertainty_drivers, ['retention data is stale']);
    assert.deepEqual(result.review_payload.disambiguation_questions, ['What is Q1 churn?']);
    assert.equal(result.review_payload.recommended_next_action, 'Pull Q1 before deciding.');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// create_follow_up_brief
// ---------------------------------------------------------------------------

test('executeFollowUpAction create_follow_up_brief writes a markdown file', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const analysisPath = path.join(root, 'analysis.json');
    await writeFile(analysisPath, JSON.stringify({
      uncertainty_payload: {
        uncertainty_drivers: ['data is old'],
        disambiguation_questions: ['What is current trend?'],
        needed_evidence: ['Latest report'],
        recommended_next_action: 'Get the latest report.',
      },
    }), 'utf8');

    const session = await createSession({
      question: 'Should we enter the EU market?',
      scenario_id: 'test-eu',
      scenario_class: 'product_strategy',
      sessions_root: root,
      artifacts: { analysis_json: analysisPath },
    });

    const result = await executeFollowUpAction(session, 'create_follow_up_brief', {
      sessions_root: root,
    });

    assert.equal(result.mode, 'brief_generated');
    assert.ok(result.brief_path);
    assert.ok(result.brief_content);

    // File was actually written
    const written = await readFile(result.brief_path, 'utf8');
    assert.equal(written, result.brief_content);
    assert.ok(written.includes('# Follow-Up Brief'));
    assert.ok(written.includes('Should we enter the EU market?'));
    assert.ok(written.includes('data is old'));
    assert.ok(written.includes('What is current trend?'));
    assert.ok(written.includes('Latest report'));
    assert.ok(written.includes('Get the latest report.'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('executeFollowUpAction create_follow_up_brief includes session_patch with artifact ref', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const session = await createSession({
      question: 'Should we enter the EU market?',
      scenario_id: 'test-eu-2',
      scenario_class: 'product_strategy',
      sessions_root: root,
      artifacts: {},
    });

    const result = await executeFollowUpAction(session, 'create_follow_up_brief', {
      sessions_root: root,
    });

    assert.ok(result.session_patch?.artifacts?.follow_up_brief_md);
    assert.ok(result.session_patch.artifacts.follow_up_brief_md.endsWith('follow-up-brief.md'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// gather_more_evidence
// ---------------------------------------------------------------------------

test('executeFollowUpAction gather_more_evidence returns fast_reanalysis mode', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const analysisPath = path.join(root, 'analysis.json');
    await writeFile(analysisPath, JSON.stringify({
      uncertainty_payload: {
        uncertainty_drivers: ['retention data missing'],
        disambiguation_questions: ['What is Q1 churn?'],
        needed_evidence: ['Q1 cohort'],
        recommended_next_action: 'Pull Q1 data.',
      },
    }), 'utf8');

    const session = await createSession({
      question: 'Should we raise prices by 10%?',
      scenario_id: 'test-pricing',
      scenario_class: 'pricing',
      provider_availability: { available_providers: ['claude'] },
      sessions_root: root,
      artifacts: { analysis_json: analysisPath },
    });

    const result = await executeFollowUpAction(session, 'gather_more_evidence', {
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    assert.equal(result.mode, 'fast_reanalysis');
    assert.ok(result.fast_result);
    assert.ok(result.refined_question);
    assert.ok(result.refined_question.includes('Should we raise prices by 10%?'));
    assert.ok(result.refined_question.includes('retention data missing'));
    assert.ok(result.refined_question.includes('What is Q1 churn?'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('gather_more_evidence uses original question when no uncertainty payload', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const session = await createSession({
      question: 'Should we raise prices?',
      scenario_id: 'test-pricing',
      scenario_class: 'pricing',
      provider_availability: { available_providers: ['claude'] },
      sessions_root: root,
      artifacts: {},
    });

    const result = await executeFollowUpAction(session, 'gather_more_evidence', {
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner(),
    });

    assert.equal(result.refined_question, 'Should we raise prices?');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Controller integration — runFollowUpAction
// ---------------------------------------------------------------------------

test('runFollowUpAction throws for unknown action', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const session = await createSession({
      question: 'Test',
      scenario_id: 'test',
      scenario_class: 'pricing',
      status: 'completed',
      ux_state: 'not_ready',
      sessions_root: root,
    });

    await assert.rejects(
      () => runFollowUpAction(session.session_id, 'do_magic', { sessions_root: root }),
      /Unknown follow-up action/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction open_human_review flags session and returns bundle', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const notReadyResult = await createNotReadySessionWithArtifact(root);
    const sessionId = notReadyResult.session.session_id;

    const result = await runFollowUpAction(sessionId, 'open_human_review', {
      sessions_root: root,
    });

    assert.equal(result.session.last_follow_up_action, 'open_human_review');
    assert.equal(result.session.human_review_requested, true);
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('follow_up_action_executed'));
    assert.ok(result.presented);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction create_follow_up_brief links artifact and returns bundle', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const notReadyResult = await createNotReadySessionWithArtifact(root);
    const sessionId = notReadyResult.session.session_id;

    const result = await runFollowUpAction(sessionId, 'create_follow_up_brief', {
      sessions_root: root,
    });

    assert.equal(result.session.last_follow_up_action, 'create_follow_up_brief');
    assert.ok(result.session.artifacts.follow_up_brief_md);
    assert.ok(result.presented);
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('follow_up_action_executed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction gather_more_evidence re-routes session via fast pipeline', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const notReadyResult = await createNotReadySessionWithArtifact(root);
    const sessionId = notReadyResult.session.session_id;

    // Re-analysis comes back high confidence — should leave not_ready
    const result = await runFollowUpAction(sessionId, 'gather_more_evidence', {
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    assert.equal(result.session.last_follow_up_action, 'gather_more_evidence');
    assert.equal(result.session.latest_execution_mode, 'fast');
    // New fast run should have updated ux_state out of not_ready
    assert.notEqual(result.session.ux_state, 'not_ready');
    assert.ok(result.presented);
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('follow_up_action_executed'));
    assert.ok(types.includes('fast_completed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction marks session failed when action execution throws', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-followup-'));
  try {
    const notReadyResult = await createNotReadySessionWithArtifact(root);
    const sessionId = notReadyResult.session.session_id;

    // Turnrunner throws to simulate execution failure
    const result = await runFollowUpAction(sessionId, 'gather_more_evidence', {
      sessions_root: root,
      fast_turn_runner: async () => { throw new Error('Simulated gather failure.'); },
    });

    assert.equal(result.session.status, 'failed');
    assert.equal(result.session.failed_mode, 'follow_up');
    assert.ok(result.session.error.includes('Simulated gather failure'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
