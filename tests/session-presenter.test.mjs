import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  presentSession,
  buildAvailableActions,
  buildHeadline,
} from '../scripts/session-presenter.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseSession(overrides = {}) {
  return {
    session_id: 'sess-test-001',
    question: 'Should we raise prices?',
    scenario_id: 'test-pricing',
    scenario_class: 'pricing',
    scenario_class_provisional: false,
    status: 'completed',
    stage: 'post_single',
    ux_state: 'provisional',
    ux_substate: 'single_run_acceptable',
    recommended_next_mode: null,
    requires_user_confirmation: false,
    explanation: 'A single analysis completed.',
    follow_up_action: null,
    follow_up_artifact: null,
    artifacts: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildHeadline
// ---------------------------------------------------------------------------

test('buildHeadline returns "Session needs retry" for failed sessions', () => {
  const session = baseSession({ status: 'failed' });
  assert.equal(buildHeadline(session), 'Session needs retry');
});

test('buildHeadline returns "Analysis in progress" for running sessions', () => {
  const session = baseSession({ status: 'running' });
  assert.equal(buildHeadline(session), 'Analysis in progress');
});

test('buildHeadline returns "Current best recommendation" for provisional state', () => {
  const session = baseSession({ status: 'completed', ux_state: 'provisional' });
  assert.equal(buildHeadline(session), 'Current best recommendation');
});

test('buildHeadline returns "More rigor recommended" for more_rigor_recommended state', () => {
  const session = baseSession({ status: 'completed', ux_state: 'more_rigor_recommended' });
  assert.equal(buildHeadline(session), 'More rigor recommended');
});

test('buildHeadline returns "Decision not ready" for not_ready state', () => {
  const session = baseSession({ status: 'completed', ux_state: 'not_ready' });
  assert.equal(buildHeadline(session), 'Decision not ready');
});

test('buildHeadline returns fallback for unknown state', () => {
  const session = baseSession({ status: 'completed', ux_state: 'totally_unknown_state' });
  assert.equal(buildHeadline(session), 'Decision session');
});

test('buildHeadline returns fallback for null session', () => {
  assert.equal(buildHeadline(null), 'Decision session');
});

// ---------------------------------------------------------------------------
// buildAvailableActions
// ---------------------------------------------------------------------------

test('buildAvailableActions returns retry for failed sessions', () => {
  const session = baseSession({ status: 'failed' });
  assert.deepEqual(buildAvailableActions(session), ['retry_session_step']);
});

test('buildAvailableActions returns confirm and decline when awaiting confirmation', () => {
  const session = baseSession({
    status: 'awaiting_user_action',
    requires_user_confirmation: true,
  });
  assert.deepEqual(buildAvailableActions(session), ['confirm_next_step', 'decline_next_step']);
});

test('buildAvailableActions returns follow-up action and open_human_review for not_ready sessions', () => {
  const session = baseSession({
    status: 'completed',
    ux_state: 'not_ready',
    follow_up_action: 'gather_more_evidence',
  });
  const actions = buildAvailableActions(session);
  assert.ok(actions.includes('run_follow_up_action'));
  assert.ok(actions.includes('open_human_review'));
});

test('buildAvailableActions returns only open_human_review for not_ready with no follow_up_action', () => {
  const session = baseSession({
    status: 'completed',
    ux_state: 'not_ready',
    follow_up_action: null,
  });
  assert.deepEqual(buildAvailableActions(session), ['open_human_review']);
});

test('buildAvailableActions returns confirm_next_step for provisional with pending escalation', () => {
  const session = baseSession({
    status: 'completed',
    ux_state: 'provisional',
    recommended_next_mode: 'rigor',
  });
  assert.deepEqual(buildAvailableActions(session), ['confirm_next_step']);
});

test('buildAvailableActions returns empty array for completed provisional with no next step', () => {
  const session = baseSession({
    status: 'completed',
    ux_state: 'provisional',
    recommended_next_mode: null,
  });
  assert.deepEqual(buildAvailableActions(session), []);
});

test('buildAvailableActions returns empty array for null session', () => {
  assert.deepEqual(buildAvailableActions(null), []);
});

// ---------------------------------------------------------------------------
// presentSession
// ---------------------------------------------------------------------------

test('presentSession returns a complete view model from a session record', async () => {
  const session = baseSession();
  const presented = await presentSession({ session, events: [] });

  assert.equal(presented.session_id, session.session_id);
  assert.equal(presented.question, session.question);
  assert.equal(presented.scenario_id, session.scenario_id);
  assert.equal(presented.scenario_class, session.scenario_class);
  assert.equal(presented.status, session.status);
  assert.equal(presented.stage, session.stage);
  assert.equal(presented.state, session.ux_state);
  assert.equal(presented.substate, session.ux_substate);
  assert.equal(presented.headline, 'Current best recommendation');
  assert.ok(Array.isArray(presented.available_actions));
  assert.equal(presented.event_count, 0);
  assert.equal(presented.latest_event, null);
});

test('presentSession includes event metadata when events are provided', async () => {
  const session = baseSession();
  const events = [
    { type: 'session_created', timestamp: '2026-04-15T00:00:00.000Z' },
    { type: 'fast_completed', timestamp: '2026-04-15T00:01:00.000Z' },
  ];
  const presented = await presentSession({ session, events });

  assert.equal(presented.event_count, 2);
  assert.equal(presented.latest_event.type, 'fast_completed');
});

test('presentSession throws when session is missing', async () => {
  await assert.rejects(
    () => presentSession({ session: null }),
    /session is required/,
  );
});

test('presentSession throws when called with no argument', async () => {
  await assert.rejects(
    () => presentSession({}),
    /session is required/,
  );
});

test('presentSession loads recommendation from analysis artifact when available', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-presenter-'));
  try {
    const analysisPath = path.join(root, 'analysis.json');
    await writeFile(analysisPath, JSON.stringify({
      recommendation: 'Do not raise prices yet.',
      confidence_band: 'medium',
    }), 'utf8');

    const session = baseSession({
      artifacts: { analysis_json: analysisPath },
    });
    const presented = await presentSession({ session, events: [] });

    assert.equal(presented.current_recommendation, 'Do not raise prices yet.');
    assert.ok(presented.artifacts.analysis_loaded);
    assert.equal(presented.artifacts.analysis_json, analysisPath);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('presentSession handles missing artifact files gracefully', async () => {
  const session = baseSession({
    artifacts: {
      analysis_json: '/nonexistent/path/analysis.json',
      verdict_json: '/nonexistent/path/verdict.json',
    },
  });
  const presented = await presentSession({ session, events: [] });

  assert.equal(presented.artifacts.analysis_loaded, false);
  assert.equal(presented.artifacts.verdict_loaded, false);
  // No throw — presenter degrades gracefully
  assert.ok(presented.session_id);
});

test('presentSession sets confirmation_required from session field', async () => {
  const session = baseSession({
    status: 'awaiting_user_action',
    requires_user_confirmation: true,
    ux_state: 'more_rigor_recommended',
  });
  const presented = await presentSession({ session, events: [] });

  assert.equal(presented.confirmation_required, true);
});

test('presentSession extracts uncertainty_payload from analysis artifact', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-presenter-'));
  try {
    const analysisPath = path.join(root, 'analysis.json');
    await writeFile(analysisPath, JSON.stringify({
      recommendation: 'Hold off.',
      uncertainty_drivers: ['retention data is stale', 'competitor pricing unknown'],
      disambiguation_questions: ['What is current churn rate?'],
      needed_evidence: ['Q1 retention cohort'],
    }), 'utf8');

    const session = baseSession({
      artifacts: { analysis_json: analysisPath },
      ux_state: 'not_ready',
    });
    const presented = await presentSession({ session, events: [] });

    assert.ok(presented.uncertainty_payload);
    assert.ok(presented.uncertainty_payload.uncertainty_drivers.includes('retention data is stale'));
    assert.ok(presented.uncertainty_payload.disambiguation_questions.includes('What is current churn rate?'));
    assert.ok(presented.uncertainty_payload.needed_evidence.includes('Q1 retention cohort'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
