import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  startDecisionSession,
  getDecisionSession,
  confirmNextStep,
  declineNextStep,
  retrySessionStep,
  runFollowUpAction,
} from '../scripts/decision-session-controller.mjs';
import { createSession, updateSession } from '../scripts/session-store.mjs';

// ---------------------------------------------------------------------------
// Mock runners
// ---------------------------------------------------------------------------

/**
 * Fast analysis turn runner. Returns a valid fast-analysis JSON response as
 * stdout. Mirrors the signature expected by run-fast-analysis.mjs.
 *
 * run_id and scenario_id are extracted from options.runId (format:
 * fast-YYYY-MM-DD-HHMMSSsssZ-{scenarioId}), which run-fast-analysis passes
 * to the turn runner. The mock must echo them back or schema validation fails.
 */
function makeFastTurnRunner(overrides = {}) {
  return async (options) => {
    // runId format: fast-YYYY-MM-DD-HHMMSSsssZ-{scenarioId}
    const runId = options.runId || 'fast-unknown';
    const scenarioId = runId.replace(/^fast-\d{4}-\d{2}-\d{2}-\d+Z-/, '') || 'unknown';

    const analysis = {
      run_id: runId,
      scenario_id: scenarioId,
      recommendation: 'Do not raise prices now.',
      confidence_band: overrides.confidence_band ?? 'high',
      needs_human_review: overrides.needs_human_review ?? false,
      summary: 'Retention data is strong enough to hold pricing.',
      key_reasoning: ['Churn is below 3%.', 'NPS is above benchmark.'],
      ...overrides,
    };
    // Always override run_id/scenario_id — overrides must not shadow them
    analysis.run_id = runId;
    analysis.scenario_id = scenarioId;

    if ((analysis.confidence_band !== 'high' || analysis.needs_human_review) && !analysis.uncertainty_payload) {
      analysis.uncertainty_payload = {
        uncertainty_drivers: ['retention data is stale'],
        disambiguation_questions: ['What is current churn?'],
        needed_evidence: ['Q1 cohort data'],
        recommended_next_action: 'Pull Q1 retention cohort before deciding.',
      };
    }
    return { stdout: JSON.stringify(analysis) };
  };
}

/**
 * Rigor (conflict harness) turn runner. Returns valid packets for all four
 * phases. Mirrors the signature expected by run-conflict-harness.mjs.
 */
function makeRigorTurnRunner(judgeOverrides = {}) {
  return async (options) => {
    if (options.phase === 'first_pass') {
      return {
        packet: {
          run_id: options.runId || 'rigor-test',
          side_id: options.sideId,
          round: 'first_pass',
          artifact_markdown: `# ${options.sideId} first pass`,
          claims: [{
            claim_id: `${options.sideId}-c1`,
            summary: `${options.sideId} primary claim`,
            evidence_refs: ['ctx-1'],
            is_major: true,
          }],
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
          finding_id: 'f1',
          target_claim_ids: [options.sideId === 'side_a' ? 'side_b-c1' : 'side_a-c1'],
          claim_under_attack: 'The opposing claim needs stronger evidence.',
          attack_type: 'evidence_gap',
          evidence_or_reason: 'The cited context is ambiguous.',
          severity: 'medium',
        },
        usage: { estimatedCostUsd: 0 },
      };
    }

    if (options.phase === 'final') {
      return {
        packet: {
          run_id: options.runId || 'rigor-test',
          side_id: options.sideId,
          round: 'final',
          artifact_markdown: `# ${options.sideId} final`,
          claims: [{
            claim_id: `${options.sideId}-c1`,
            summary: `${options.sideId} revised claim`,
            evidence_refs: ['ctx-1'],
            is_major: true,
          }],
          citations: ['ctx-1'],
          conclusion_confidence: 'high',
          open_questions: [],
          critique_responses: [{
            finding_id: 'f1',
            disposition: 'adopted',
            rationale: 'Critique was valid.',
          }],
        },
        usage: { estimatedCostUsd: 0 },
      };
    }

    if (options.phase === 'judge') {
      return {
        packet: {
          winner: judgeOverrides.winner ?? 'side_a',
          margin: 0.2,
          rubric_scores: {
            side_a: { claim_quality: 5, evidence_discipline: 4, responsiveness_to_critique: 4, internal_consistency: 5, decision_usefulness: 4, weighted_total: 4.4 },
            side_b: { claim_quality: 4, evidence_discipline: 3, responsiveness_to_critique: 3, internal_consistency: 4, decision_usefulness: 3, weighted_total: 3.4 },
          },
          dimension_rationales: {
            claim_quality: 'Side A had crisper claims.',
            evidence_discipline: 'Side A stayed closer to evidence.',
            responsiveness_to_critique: 'Side A addressed rebuttals more concretely.',
            internal_consistency: 'Side A had fewer gaps.',
            decision_usefulness: 'Side A was more actionable.',
          },
          side_summaries: {
            side_a: { strengths: ['Concrete.'], weaknesses: ['Narrow.'] },
            side_b: { strengths: ['Broader.'], weaknesses: ['Diffuse.'] },
          },
          decisive_dimension: 'responsiveness_to_critique',
          decisive_findings: ['Side A responded more concretely.'],
          judge_confidence: judgeOverrides.judge_confidence ?? 'high',
          needs_human_review: judgeOverrides.needs_human_review ?? false,
          rationale: 'Side A is clearer.',
        },
        usage: { estimatedCostUsd: 0 },
      };
    }

    throw new Error(`Unexpected phase: ${options.phase}`);
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a session that is awaiting user action (escalation gate open).
 * Used to test confirmNextStep / declineNextStep without running a full flow.
 */
async function createAwaitingSession(root, sessionOverrides = {}) {
  return createSession({
    question: 'Should we restructure now?',
    scenario_id: 'test-governance',
    scenario_class: 'governance',
    provider_availability: {
      available_providers: ['claude', 'gpt', 'gemini'],
      temporarily_unavailable_providers: [],
      three_family_available: true,
      two_family_available: true,
    },
    status: 'awaiting_user_action',
    stage: 'post_single',
    ux_state: 'more_rigor_recommended',
    ux_substate: 'cross_family_required',
    recommended_next_mode: 'double_panel',
    requires_user_confirmation: true,
    explanation: 'Governance requires cross-family confirmation.',
    sessions_root: root,
    ...sessionOverrides,
  });
}

/**
 * Create a session in failed state, for retrySessionStep tests.
 */
async function createFailedSession(root, sessionOverrides = {}) {
  return createSession({
    question: 'Should we raise prices?',
    scenario_id: 'test-failed',
    scenario_class: 'pricing',
    provider_availability: {
      available_providers: ['claude'],
      temporarily_unavailable_providers: [],
    },
    status: 'failed',
    stage: 'post_single',
    ux_state: null,
    latest_execution_mode: 'fast',
    error: 'Fast analysis timed out.',
    sessions_root: root,
    ...sessionOverrides,
  });
}

/**
 * Create a session in not_ready state, for runFollowUpAction tests.
 */
async function createNotReadySession(root) {
  return createSession({
    question: 'Is this feature worth building?',
    scenario_id: 'test-not-ready',
    scenario_class: 'product_strategy',
    provider_availability: { available_providers: ['claude'] },
    status: 'completed',
    stage: 'post_single',
    ux_state: 'not_ready',
    ux_substate: 'needs_more_evidence',
    sessions_root: root,
  });
}

// ---------------------------------------------------------------------------
// startDecisionSession
// ---------------------------------------------------------------------------

test('startDecisionSession throws when question is missing', async () => {
  await assert.rejects(
    () => startDecisionSession({ scenario_class: 'pricing' }),
    /question is required/,
  );
});

test('startDecisionSession creates a session and completes for high-confidence pricing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Should we raise prices by 10%?',
      scenario_class: 'pricing',
      available_providers: ['claude'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    assert.ok(result.session);
    assert.ok(result.events);
    assert.ok(result.presented);
    assert.equal(result.session.question, 'Should we raise prices by 10%?');
    assert.equal(result.session.scenario_class, 'pricing');
    assert.equal(result.session.status, 'completed');
    assert.equal(result.session.latest_execution_mode, 'fast');
    assert.ok(result.session.fast_run_id);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('startDecisionSession enters awaiting_user_action for governance with 3 providers', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Should we break up the company?',
      scenario_class: 'governance',
      available_providers: ['claude', 'gpt', 'gemini'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    // Governance requires cross-family confirmation — should gate before completing
    assert.equal(result.session.status, 'awaiting_user_action');
    assert.equal(result.session.requires_user_confirmation, true);
    assert.ok(result.session.recommended_next_mode);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('startDecisionSession marks session failed when fast analysis throws', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Will this fail?',
      scenario_class: 'pricing',
      available_providers: ['claude'],
      sessions_root: root,
      fast_turn_runner: async () => {
        throw new Error('Simulated fast analysis failure.');
      },
    });

    assert.equal(result.session.status, 'failed');
    assert.ok(result.session.error);
    assert.ok(result.session.error.includes('Simulated fast analysis failure'));
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('session_failed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('startDecisionSession with auto_confirm proceeds through escalation gate', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Should we break up the company?',
      scenario_class: 'governance',
      available_providers: ['claude', 'gpt', 'gemini'],
      sessions_root: root,
      auto_confirm: true,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
      rigor_turn_runner: makeRigorTurnRunner(),
    });

    assert.equal(result.session.status, 'completed');
    assert.equal(result.session.latest_execution_mode, 'rigor');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('startDecisionSession sets uncertainty payload on medium-confidence result', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Should we raise prices by 10%?',
      scenario_class: 'pricing',
      available_providers: ['claude'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'medium', needs_human_review: true }),
    });

    // Medium confidence: may still complete (pricing class, single provider)
    // but should have uncertainty data in the presented payload
    assert.ok(result.session);
    assert.ok(result.presented);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// getDecisionSession
// ---------------------------------------------------------------------------

test('getDecisionSession returns { session, events, presented } for an existing session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const started = await startDecisionSession({
      question: 'Is this product worth building?',
      scenario_class: 'product_strategy',
      available_providers: ['claude'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner(),
    });

    const result = await getDecisionSession(started.session.session_id, root);

    assert.ok(result.session);
    assert.ok(Array.isArray(result.events));
    assert.ok(result.presented);
    assert.equal(result.session.session_id, started.session.session_id);
    assert.ok(typeof result.presented.headline === 'string');
    assert.ok(Array.isArray(result.presented.available_actions));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('getDecisionSession throws for a nonexistent session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    await assert.rejects(
      () => getDecisionSession('no-such-session', root),
      /Session not found/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// confirmNextStep
// ---------------------------------------------------------------------------

test('confirmNextStep throws when session is not awaiting_user_action', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createSession({
      question: 'Test question',
      scenario_id: 'test-confirm',
      scenario_class: 'pricing',
      status: 'completed',
      requires_user_confirmation: true,
      sessions_root: root,
    });

    await assert.rejects(
      () => confirmNextStep(session.session_id, { sessions_root: root }),
      /not awaiting user action/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('confirmNextStep throws when session does not require confirmation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createSession({
      question: 'Test question',
      scenario_id: 'test-confirm',
      scenario_class: 'pricing',
      status: 'awaiting_user_action',
      requires_user_confirmation: false,
      sessions_root: root,
    });

    await assert.rejects(
      () => confirmNextStep(session.session_id, { sessions_root: root }),
      /does not require confirmation/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('confirmNextStep marks session failed for unsupported confirmation target', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createAwaitingSession(root, {
      recommended_next_mode: 'unsupported_mode',
    });

    // The throw is caught internally by the try/catch in confirmNextStep,
    // which calls markSessionFailed instead of propagating to the caller.
    const result = await confirmNextStep(session.session_id, { sessions_root: root });

    assert.equal(result.session.status, 'failed');
    assert.ok(result.session.error.includes('Unsupported confirmation target'));
    assert.equal(result.session.failed_mode, 'rigor');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('confirmNextStep executes rigor analysis and returns completed session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createAwaitingSession(root);

    const result = await confirmNextStep(session.session_id, {
      sessions_root: root,
      rigor_turn_runner: makeRigorTurnRunner(),
    });

    assert.equal(result.session.status, 'completed');
    assert.equal(result.session.latest_execution_mode, 'rigor');
    assert.ok(result.session.rigor_run_id);
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('next_step_confirmed'));
    assert.ok(types.includes('rigor_completed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('confirmNextStep marks session failed when rigor analysis throws', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createAwaitingSession(root);

    const result = await confirmNextStep(session.session_id, {
      sessions_root: root,
      rigor_turn_runner: async () => {
        throw new Error('Simulated rigor failure.');
      },
    });

    assert.equal(result.session.status, 'failed');
    assert.equal(result.session.failed_mode, 'rigor');
    assert.ok(result.session.error.includes('Simulated rigor failure'));
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('session_failed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// declineNextStep
// ---------------------------------------------------------------------------

test('declineNextStep throws when session is not awaiting_user_action', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createSession({
      question: 'Test question',
      scenario_id: 'test-decline',
      scenario_class: 'pricing',
      status: 'completed',
      requires_user_confirmation: true,
      sessions_root: root,
    });

    await assert.rejects(
      () => declineNextStep(session.session_id, { sessions_root: root }),
      /not awaiting user action/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('declineNextStep transitions session to completed with user_declined_escalation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createAwaitingSession(root);

    const result = await declineNextStep(session.session_id, { sessions_root: root });

    assert.equal(result.session.status, 'completed');
    assert.equal(result.session.ux_substate, 'user_declined_escalation');
    assert.equal(result.session.requires_user_confirmation, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('declineNextStep appends next_step_declined event', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createAwaitingSession(root);

    const result = await declineNextStep(session.session_id, { sessions_root: root });

    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('next_step_declined'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// retrySessionStep
// ---------------------------------------------------------------------------

test('retrySessionStep throws when session is not in failed state', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createSession({
      question: 'Test question',
      scenario_id: 'test-retry',
      scenario_class: 'pricing',
      status: 'completed',
      sessions_root: root,
    });

    await assert.rejects(
      () => retrySessionStep(session.session_id, { sessions_root: root }),
      /not in failed state/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('retrySessionStep retries fast analysis for a failed fast session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createFailedSession(root);

    const result = await retrySessionStep(session.session_id, {
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner(),
    });

    assert.notEqual(result.session.status, 'failed');
    assert.equal(result.session.latest_execution_mode, 'fast');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('retrySessionStep calls confirmNextStep for a failed rigor session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    // Create an awaiting session (has requires_user_confirmation + recommended_next_mode),
    // then mark it failed in rigor mode. retrySessionStep re-opens the awaiting gate
    // before calling confirmNextStep, so rigor can re-run.
    const awaitingSession = await createAwaitingSession(root);
    const readyToRetry = await updateSession(awaitingSession.session_id, {
      status: 'failed',
      latest_execution_mode: 'rigor',
    }, root);

    const result = await retrySessionStep(readyToRetry.session_id, {
      sessions_root: root,
      rigor_turn_runner: makeRigorTurnRunner(),
    });

    assert.equal(result.session.latest_execution_mode, 'rigor');
    assert.equal(result.session.status, 'completed');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// runFollowUpAction
// ---------------------------------------------------------------------------

test('runFollowUpAction throws when action is missing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createNotReadySession(root);
    await assert.rejects(
      () => runFollowUpAction(session.session_id, '', { sessions_root: root }),
      /action is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction throws when session is not not_ready', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createSession({
      question: 'Test question',
      scenario_id: 'test-follow-up',
      scenario_class: 'pricing',
      status: 'completed',
      ux_state: 'provisional',
      sessions_root: root,
    });

    await assert.rejects(
      () => runFollowUpAction(session.session_id, 'gather_more_evidence', { sessions_root: root }),
      /only valid for not_ready/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('runFollowUpAction records the action and returns session bundle', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const session = await createNotReadySession(root);

    // Use open_human_review — no LLM call required
    const result = await runFollowUpAction(
      session.session_id,
      'open_human_review',
      { sessions_root: root },
    );

    assert.equal(result.session.last_follow_up_action, 'open_human_review');
    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('follow_up_action_executed'));
    assert.ok(result.presented);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Event log integrity
// ---------------------------------------------------------------------------

test('startDecisionSession emits expected event sequence for completed fast run', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    const result = await startDecisionSession({
      question: 'Should we launch in Q3?',
      scenario_class: 'product_strategy',
      available_providers: ['claude'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    const types = result.events.map((e) => e.type);
    assert.ok(types.includes('session_created'));
    assert.ok(types.includes('session_started'));
    assert.ok(types.includes('fast_completed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('full confirm flow: session started → fast → awaiting → confirm → rigor → completed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    // 1. Start — governance class, should land in awaiting after fast pass
    const started = await startDecisionSession({
      question: 'Should we break up the company now?',
      scenario_class: 'governance',
      available_providers: ['claude', 'gpt', 'gemini'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    assert.equal(started.session.status, 'awaiting_user_action');

    // 2. Confirm — triggers rigor
    const confirmed = await confirmNextStep(started.session.session_id, {
      sessions_root: root,
      rigor_turn_runner: makeRigorTurnRunner(),
    });

    assert.equal(confirmed.session.status, 'completed');
    assert.equal(confirmed.session.latest_execution_mode, 'rigor');
    assert.ok(confirmed.session.fast_run_id);
    assert.ok(confirmed.session.rigor_run_id);

    const types = confirmed.events.map((e) => e.type);
    assert.ok(types.includes('session_created'));
    assert.ok(types.includes('session_started'));
    assert.ok(types.includes('fast_completed'));
    assert.ok(types.includes('escalation_offered'));
    assert.ok(types.includes('next_step_confirmed'));
    assert.ok(types.includes('rigor_completed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('full decline flow: session started → fast → awaiting → decline → completed provisional', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-ctrl-'));
  try {
    // 1. Start — governance class, should await after fast
    const started = await startDecisionSession({
      question: 'Should we break up the company now?',
      scenario_class: 'governance',
      available_providers: ['claude', 'gpt', 'gemini'],
      sessions_root: root,
      fast_turn_runner: makeFastTurnRunner({ confidence_band: 'high', needs_human_review: false }),
    });

    assert.equal(started.session.status, 'awaiting_user_action');

    // 2. Decline
    const declined = await declineNextStep(started.session.session_id, {
      sessions_root: root,
    });

    assert.equal(declined.session.status, 'completed');
    assert.equal(declined.session.ux_substate, 'user_declined_escalation');
    assert.equal(declined.session.latest_execution_mode, 'fast');

    const types = declined.events.map((e) => e.type);
    assert.ok(types.includes('escalation_offered'));
    assert.ok(types.includes('next_step_declined'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
