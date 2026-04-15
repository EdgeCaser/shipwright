#!/usr/bin/env node

/**
 * Decision session controller for Shipwright.
 *
 * Owns session lifecycle and action routing for the non-terminal orchestrator
 * surface. This module sits above:
 * - session-store.mjs
 * - decision-execution.mjs
 * - orchestrate.mjs
 * - telemetry.mjs
 *
 * CLI entrypoints and future app surfaces should call this module instead of
 * reproducing flow logic.
 */

import {
  createSession,
  getSession,
  updateSession,
  appendSessionEvent,
  getSessionEvents,
} from './session-store.mjs';
import {
  executeFastAnalysisForSession,
  executeRigorAnalysisForSession,
} from './decision-execution.mjs';
import {
  route,
  assessProviderAvailability,
  resolveScenarioClass,
} from './orchestrate.mjs';
import { presentSession } from './session-presenter.mjs';
import { emit } from './telemetry.mjs';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function startDecisionSession(input = {}) {
  validateRequiredString(input.question, 'question');

  const scenarioClassId = input.scenario_class || 'unclassified';
  const scenarioClass = resolveScenarioClass(scenarioClassId);
  const providerAvailability = assessProviderAvailability(
    input.available_providers || ['claude'],
    input.temporarily_unavailable_providers || [],
  );
  const scenarioId = input.scenario_id || slugify(input.question);

  const preRunResult = route({
    scenario_class: scenarioClass.id,
    stage: 'pre_run',
    confidence_band: null,
    needs_human_review: null,
    uncertainty_payload_present: false,
    provider_availability: providerAvailability,
  });

  let session = await createSession({
    question: input.question,
    scenario_id: scenarioId,
    scenario_class: scenarioClass.id,
    scenario_class_provisional: scenarioClass.provisional,
    provider_availability: providerAvailability,
    stage: 'pre_run',
    ux_state: preRunResult.ux_state,
    ux_substate: preRunResult.ux_substate,
    recommended_next_mode: preRunResult.recommended_next_mode,
    requires_user_confirmation: preRunResult.requires_user_confirmation,
    recommended_provider_roles: preRunResult.recommended_provider_roles,
    explanation: preRunResult.explanation,
    follow_up_artifact: preRunResult.follow_up_artifact,
    follow_up_action: preRunResult.follow_up_action,
    status: 'running',
    sessions_root: input.sessions_root,
  });

  session = await updateSession(session.session_id, {
    scenario_path: input.scenario_path || null,
    latest_routing_input: null,
    latest_execution_mode: null,
  }, input.sessions_root);

  await appendSessionEvent(session.session_id, {
    type: 'session_started',
    scenario_class: scenarioClass.id,
  }, input.sessions_root);

  await emit('session_started', {
    session_id: session.session_id,
    scenario_id: session.scenario_id,
    scenario_class: scenarioClass.id,
  });

  try {
    const fastResult = await executeFastAnalysisForSession(session, {
      agentId: input.agent_id,
      outDir: input.fast_out_dir,
      timeoutMs: input.timeout_ms,
      turnRunner: input.fast_turn_runner,
    });

    session = await applyFastResult(session, fastResult, input.sessions_root);

    if (input.auto_confirm && session.requires_user_confirmation) {
      return confirmNextStep(session.session_id, {
        sessions_root: input.sessions_root,
        timeout_ms: input.timeout_ms,
        rigor_out_dir: input.rigor_out_dir,
        rigor_turn_runner: input.rigor_turn_runner,
      });
    }

    return getDecisionSession(session.session_id, input.sessions_root);
  } catch (error) {
    return markSessionFailed(session, error, 'fast', input.sessions_root);
  }
}

export async function getDecisionSession(sessionId, sessionsRoot) {
  const session = await getSession(sessionId, sessionsRoot);
  const events = await getSessionEvents(sessionId, sessionsRoot);
  const presented = await presentSession({ session, events });

  await emit('session_presented', {
    session_id: session.session_id,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
    status: session.status,
    ux_state: session.ux_state,
    ux_substate: session.ux_substate,
  });

  return { session, events, presented };
}

export async function confirmNextStep(sessionId, options = {}) {
  let session = await getSession(sessionId, options.sessions_root);
  assertAwaitingUserAction(session);

  await appendSessionEvent(session.session_id, {
    type: 'next_step_confirmed',
    recommended_next_mode: session.recommended_next_mode,
  }, options.sessions_root);

  await emit('next_step_confirmed', {
    session_id: session.session_id,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
    recommended_next_mode: session.recommended_next_mode,
  });

  try {
    if (session.recommended_next_mode === 'double_panel' || session.recommended_next_mode === 'judge') {
      const rigorResult = await executeRigorAnalysisForSession(session, {
        availableProviders: session.provider_availability?.available_providers,
        outDir: options.rigor_out_dir,
        timeoutMs: options.timeout_ms,
        turnRunner: options.rigor_turn_runner,
      });

      session = await applyRigorResult(session, rigorResult, options.sessions_root);
      return getDecisionSession(session.session_id, options.sessions_root);
    }

    throw new Error(`Unsupported confirmation target: ${session.recommended_next_mode || 'none'}`);
  } catch (error) {
    return markSessionFailed(session, error, 'rigor', options.sessions_root);
  }
}

export async function declineNextStep(sessionId, options = {}) {
  let session = await getSession(sessionId, options.sessions_root);
  assertAwaitingUserAction(session);

  const routingInput = session.latest_routing_input || {};
  const declinedResult = route({
    scenario_class: session.scenario_class,
    stage: session.stage,
    ...routingInput,
    user_declined_escalation: true,
    provider_availability: session.provider_availability,
  });

  session = await updateSession(session.session_id, {
    ux_state: declinedResult.ux_state,
    ux_substate: declinedResult.ux_substate,
    recommended_next_mode: declinedResult.recommended_next_mode,
    requires_user_confirmation: declinedResult.requires_user_confirmation,
    recommended_provider_roles: declinedResult.recommended_provider_roles,
    explanation: declinedResult.explanation,
    follow_up_artifact: declinedResult.follow_up_artifact,
    follow_up_action: declinedResult.follow_up_action,
    status: 'completed',
  }, options.sessions_root);

  await appendSessionEvent(session.session_id, {
    type: 'next_step_declined',
    previous_recommended_next_mode: session.recommended_next_mode,
  }, options.sessions_root);

  await emit('next_step_declined', {
    session_id: session.session_id,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
  });

  await emit('session_completed', {
    session_id: session.session_id,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
    ux_state: session.ux_state,
    ux_substate: session.ux_substate,
  });

  return getDecisionSession(session.session_id, options.sessions_root);
}

export async function retrySessionStep(sessionId, options = {}) {
  const session = await getSession(sessionId, options.sessions_root);

  if (session.status !== 'failed') {
    throw new Error('Session is not in failed state.');
  }

  if (session.latest_execution_mode === 'rigor') {
    // Re-open the awaiting gate so confirmNextStep can run rigor again.
    await updateSession(sessionId, {
      status: 'awaiting_user_action',
    }, options.sessions_root);
    return confirmNextStep(sessionId, options);
  }

  return startDecisionSession({
    question: session.question,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
    available_providers: session.provider_availability?.available_providers || ['claude'],
    temporarily_unavailable_providers: session.provider_availability?.temporarily_unavailable_providers || [],
    scenario_path: session.scenario_path || null,
    sessions_root: options.sessions_root,
    timeout_ms: options.timeout_ms,
    agent_id: options.agent_id,
    fast_out_dir: options.fast_out_dir,
    fast_turn_runner: options.fast_turn_runner,
    auto_confirm: false,
  });
}

export async function runFollowUpAction(sessionId, action, options = {}) {
  validateRequiredString(action, 'action');
  const session = await getSession(sessionId, options.sessions_root);

  if (session.ux_state !== 'not_ready') {
    throw new Error('Follow-up actions are only valid for not_ready sessions.');
  }

  const updated = await updateSession(session.session_id, {
    last_follow_up_action: action,
    follow_up_action: action,
    status: 'completed',
  }, options.sessions_root);

  await appendSessionEvent(updated.session_id, {
    type: 'follow_up_action_requested',
    action,
  }, options.sessions_root);

  return getDecisionSession(updated.session_id, options.sessions_root);
}

// ---------------------------------------------------------------------------
// Stage application helpers
// ---------------------------------------------------------------------------

async function applyFastResult(session, fastResult, sessionsRoot) {
  const routingResult = route({
    scenario_class: session.scenario_class,
    stage: fastResult.stage,
    ...fastResult.routing_input,
    provider_availability: session.provider_availability,
  });

  const status = routingResult.requires_user_confirmation
    ? 'awaiting_user_action'
    : 'completed';

  const updated = await updateSession(session.session_id, {
    stage: fastResult.stage,
    ux_state: routingResult.ux_state,
    ux_substate: routingResult.ux_substate,
    recommended_next_mode: routingResult.recommended_next_mode,
    requires_user_confirmation: routingResult.requires_user_confirmation,
    recommended_provider_roles: routingResult.recommended_provider_roles,
    explanation: routingResult.explanation,
    follow_up_artifact: routingResult.follow_up_artifact,
    follow_up_action: routingResult.follow_up_action,
    status,
    fast_run_id: fastResult.run_id,
    fast_run_path: fastResult.out_dir,
    latest_execution_mode: 'fast',
    latest_routing_input: fastResult.routing_input,
    artifacts: fastResult.artifact_refs,
    current_recommendation: fastResult.summary?.recommendation || null,
  }, sessionsRoot);

  await appendSessionEvent(updated.session_id, {
    type: 'fast_completed',
    run_id: fastResult.run_id,
    confidence_band: fastResult.routing_input.confidence_band,
    needs_human_review: fastResult.routing_input.needs_human_review,
    uncertainty_payload_present: fastResult.routing_input.uncertainty_payload_present,
  }, sessionsRoot);

  await emit('fast_completed', {
    session_id: updated.session_id,
    run_id: fastResult.run_id,
    scenario_id: updated.scenario_id,
    scenario_class: updated.scenario_class,
    confidence_band: fastResult.routing_input.confidence_band,
    ux_state: updated.ux_state,
    needs_human_review: fastResult.routing_input.needs_human_review,
    has_uncertainty_payload: fastResult.routing_input.uncertainty_payload_present,
  });

  if (updated.requires_user_confirmation) {
    await appendSessionEvent(updated.session_id, {
      type: 'escalation_offered',
      recommended_next_mode: updated.recommended_next_mode,
    }, sessionsRoot);

    await emit('escalation_offered', {
      session_id: updated.session_id,
      scenario_id: updated.scenario_id,
      scenario_class: updated.scenario_class,
      recommended_next_mode: updated.recommended_next_mode,
    });
  }

  if (updated.status === 'completed') {
    await emit('session_completed', {
      session_id: updated.session_id,
      scenario_id: updated.scenario_id,
      scenario_class: updated.scenario_class,
      ux_state: updated.ux_state,
      ux_substate: updated.ux_substate,
    });
  }

  return updated;
}

async function applyRigorResult(session, rigorResult, sessionsRoot) {
  const routingResult = route({
    scenario_class: session.scenario_class,
    stage: rigorResult.stage,
    ...rigorResult.routing_input,
    provider_availability: session.provider_availability,
  });

  const status = routingResult.requires_user_confirmation
    ? 'awaiting_user_action'
    : 'completed';

  const updated = await updateSession(session.session_id, {
    stage: rigorResult.stage,
    ux_state: routingResult.ux_state,
    ux_substate: routingResult.ux_substate,
    recommended_next_mode: routingResult.recommended_next_mode,
    requires_user_confirmation: routingResult.requires_user_confirmation,
    recommended_provider_roles: routingResult.recommended_provider_roles,
    explanation: routingResult.explanation,
    follow_up_artifact: routingResult.follow_up_artifact,
    follow_up_action: routingResult.follow_up_action,
    status,
    rigor_run_id: rigorResult.run_id,
    rigor_run_path: rigorResult.out_dir,
    latest_execution_mode: 'rigor',
    latest_routing_input: rigorResult.routing_input,
    artifacts: rigorResult.artifact_refs,
    current_recommendation: rigorResult.summary?.winner || session.current_recommendation || null,
  }, sessionsRoot);

  await appendSessionEvent(updated.session_id, {
    type: 'rigor_completed',
    run_id: rigorResult.run_id,
    winner: rigorResult.summary?.winner || null,
    judge_confidence: rigorResult.routing_input.confidence_band,
    needs_human_review: rigorResult.routing_input.needs_human_review,
  }, sessionsRoot);

  await emit('rigor_completed', {
    session_id: updated.session_id,
    run_id: rigorResult.run_id,
    scenario_id: updated.scenario_id,
    scenario_class: updated.scenario_class,
    winner: rigorResult.summary?.winner || null,
    judge_confidence: rigorResult.routing_input.confidence_band,
    needs_human_review: rigorResult.routing_input.needs_human_review,
    has_uncertainty_payload: rigorResult.routing_input.uncertainty_payload_present,
  });

  if (updated.status === 'completed') {
    await emit('session_completed', {
      session_id: updated.session_id,
      scenario_id: updated.scenario_id,
      scenario_class: updated.scenario_class,
      ux_state: updated.ux_state,
      ux_substate: updated.ux_substate,
    });
  }

  return updated;
}

async function markSessionFailed(session, error, failedMode, sessionsRoot) {
  const updated = await updateSession(session.session_id, {
    status: 'failed',
    error: error.message,
    failed_mode: failedMode,
    latest_execution_mode: failedMode,
  }, sessionsRoot);

  await appendSessionEvent(updated.session_id, {
    type: 'session_failed',
    mode: failedMode,
    message: error.message,
  }, sessionsRoot);

  await emit('session_failed', {
    session_id: updated.session_id,
    scenario_id: updated.scenario_id,
    scenario_class: updated.scenario_class,
    mode: failedMode,
    message: error.message,
  });

  return getDecisionSession(updated.session_id, sessionsRoot);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertAwaitingUserAction(session) {
  if (session.status !== 'awaiting_user_action') {
    throw new Error('Session is not awaiting user action.');
  }
  if (!session.requires_user_confirmation) {
    throw new Error('Session does not require confirmation.');
  }
}

function validateRequiredString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'question';
}
