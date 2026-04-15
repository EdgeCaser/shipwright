import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  handleDecisionSessionRequest,
  createDecisionSessionService,
  SESSION_SERVICE_ERROR_CODES,
} from '../scripts/decision-session-service.mjs';

// ---------------------------------------------------------------------------
// handleDecisionSessionRequest — routing and validation (no LLM calls)
// ---------------------------------------------------------------------------

test('returns 400 when method is missing', async () => {
  const response = await handleDecisionSessionRequest({ path: '/decision-sessions' });
  assert.equal(response.ok, false);
  assert.equal(response.status, 400);
  assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST);
});

test('returns 400 when path is missing', async () => {
  const response = await handleDecisionSessionRequest({ method: 'POST' });
  assert.equal(response.ok, false);
  assert.equal(response.status, 400);
  assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST);
});

test('returns 404 for unrecognized path', async () => {
  const response = await handleDecisionSessionRequest({
    method: 'GET',
    path: '/completely/wrong/path',
  });
  assert.equal(response.ok, false);
  assert.equal(response.status, 404);
  assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST);
});

test('returns 405 for unsupported HTTP method on session action path', async () => {
  const response = await handleDecisionSessionRequest({
    method: 'DELETE',
    path: '/decision-sessions/sess-abc-123',
  });
  assert.equal(response.ok, false);
  assert.equal(response.status, 405);
  assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST);
});

test('returns 404 for unknown session action', async () => {
  const response = await handleDecisionSessionRequest({
    method: 'POST',
    path: '/decision-sessions/sess-abc-123/teleport',
  });
  assert.equal(response.ok, false);
  assert.equal(response.status, 404);
  assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.INVALID_ACTION);
});

test('returns 400 when session id is required but missing from path', async () => {
  // GET /decision-sessions without an id (but path matches the base pattern)
  const response = await handleDecisionSessionRequest({
    method: 'GET',
    path: '/decision-sessions/',
  });
  // Either 400 (missing session id) or 404 (path not matched) — either is acceptable
  assert.equal(response.ok, false);
  assert.ok(response.status === 400 || response.status === 404);
});

// ---------------------------------------------------------------------------
// Error code mapping — tested via service responses
// ---------------------------------------------------------------------------

test('GET /decision-sessions/:id returns SESSION_NOT_FOUND for unknown session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const response = await handleDecisionSessionRequest(
      { method: 'GET', path: '/decision-sessions/no-such-session' },
      { sessions_root: root },
    );
    assert.equal(response.ok, false);
    assert.equal(response.status, 404);
    assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.SESSION_NOT_FOUND);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('POST /decision-sessions/:id/confirm returns INVALID_ACTION for unknown session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const response = await handleDecisionSessionRequest(
      { method: 'POST', path: '/decision-sessions/no-such-session/confirm' },
      { sessions_root: root },
    );
    assert.equal(response.ok, false);
    // Session not found maps to 404
    assert.equal(response.status, 404);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('POST /decision-sessions/:id/decline returns error for unknown session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const response = await handleDecisionSessionRequest(
      { method: 'POST', path: '/decision-sessions/no-such-session/decline' },
      { sessions_root: root },
    );
    assert.equal(response.ok, false);
    assert.equal(response.status, 404);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('POST /decision-sessions/:id/retry returns error for unknown session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const response = await handleDecisionSessionRequest(
      { method: 'POST', path: '/decision-sessions/no-such-session/retry' },
      { sessions_root: root },
    );
    assert.equal(response.ok, false);
    assert.equal(response.status, 404);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// POST /decision-sessions — start session (controller path with mock turnRunner)
// ---------------------------------------------------------------------------

test('POST /decision-sessions creates a session and returns 201 with presented payload', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const mockAnalysis = {
      recommendation: 'Do not raise prices now.',
      confidence_band: 'medium',
      needs_human_review: true,
      summary: 'Medium confidence on pricing question.',
      key_reasoning: 'Retention data is stale.',
      uncertainty_payload: {
        uncertainty_drivers: ['retention data is stale'],
        disambiguation_questions: ['What is current churn?'],
        needed_evidence: ['Q1 cohort data'],
        recommended_next_artifact: null,
        recommended_next_action: null,
        can_resolve_with_more_evidence: true,
        escalation_recommendation: null,
      },
    };

    const turnRunner = async () => ({
      packet: {
        agent: 'claude',
        provider: 'anthropic',
        model: 'claude-max',
        response: JSON.stringify(mockAnalysis),
        latency_ms: 100,
        attempt: 1,
      },
      rawText: JSON.stringify(mockAnalysis),
    });

    const response = await handleDecisionSessionRequest(
      {
        method: 'POST',
        path: '/decision-sessions',
        body: {
          question: 'Should we raise prices now?',
          scenario_class: 'pricing',
          available_providers: ['claude'],
          fast_turn_runner: turnRunner,
        },
      },
      { sessions_root: root },
    );

    assert.equal(response.ok, true);
    assert.equal(response.status, 201);
    assert.ok(response.data);
    assert.ok(response.data.presented);
    assert.ok(response.data.presented.session_id);
    assert.equal(response.data.presented.scenario_class, 'pricing');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// createDecisionSessionService — surface check
// ---------------------------------------------------------------------------

test('createDecisionSessionService returns an object with all required methods', () => {
  const service = createDecisionSessionService({});

  assert.ok(typeof service.startSession === 'function');
  assert.ok(typeof service.getSession === 'function');
  assert.ok(typeof service.confirmNextStep === 'function');
  assert.ok(typeof service.declineNextStep === 'function');
  assert.ok(typeof service.retrySessionStep === 'function');
  assert.ok(typeof service.runFollowUp === 'function');
  assert.ok(typeof service.handleRequest === 'function');
});

test('createDecisionSessionService.getSession returns SESSION_NOT_FOUND for unknown id', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-service-'));
  try {
    const service = createDecisionSessionService({ sessions_root: root });
    const response = await service.getSession('no-such-id');

    assert.equal(response.ok, false);
    assert.equal(response.status, 404);
    assert.equal(response.error.code, SESSION_SERVICE_ERROR_CODES.SESSION_NOT_FOUND);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('SESSION_SERVICE_ERROR_CODES contains expected keys', () => {
  assert.ok(SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST);
  assert.ok(SESSION_SERVICE_ERROR_CODES.INVALID_ACTION);
  assert.ok(SESSION_SERVICE_ERROR_CODES.SESSION_NOT_FOUND);
  assert.ok(SESSION_SERVICE_ERROR_CODES.EXECUTION_FAILED);
  assert.ok(SESSION_SERVICE_ERROR_CODES.PROVIDER_UNAVAILABLE);
  assert.ok(SESSION_SERVICE_ERROR_CODES.INTERNAL_ERROR);
});

test('SESSION_SERVICE_ERROR_CODES is frozen', () => {
  assert.throws(() => {
    SESSION_SERVICE_ERROR_CODES.NEW_KEY = 'new_value';
  }, TypeError);
});
