#!/usr/bin/env node

/**
 * Session presentation adapter for Shipwright.
 *
 * Converts internal session records into a product-facing view model that a UI
 * or app surface can render without understanding run directories, schemas, or
 * routing internals.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const STATE_HEADLINES = {
  provisional: 'Current best recommendation',
  more_rigor_recommended: 'More rigor recommended',
  not_ready: 'Decision not ready',
};

const SUBSTATE_REASONS = {
  single_run_acceptable: 'A single analysis completed without triggering escalation.',
  panel_converged: 'Multiple model families converged on the same directional answer.',
  user_declined_escalation: 'A stronger validation step was recommended but not run.',
  double_panel_recommended: 'The current result is usable as a lean, but a second model should check it before acting.',
  judge_recommended: 'The panel result still needs an independent adjudication step.',
  cross_family_required: 'This class is not single-judge safe, so Shipwright recommends a cross-family check before acting.',
  needs_more_evidence: 'The current evidence is insufficient to support a stable decision.',
  limited_provider_availability: 'Shipwright could not complete the stronger path with the providers currently available.',
  directionally_incoherent: 'The models did not settle on a stable direction, so Shipwright cannot responsibly force a winner.',
};

const SUBSTATE_ACTIONS = {
  cross_family_required: 'Run a stronger cross-family check before acting.',
  double_panel_recommended: 'Run a second-model panel before acting on this result.',
  judge_recommended: 'Escalate to an independent judge before acting.',
  needs_more_evidence: 'Use the uncertainty guidance below to gather resolving evidence.',
  limited_provider_availability: 'Either add provider coverage or continue with a provisional result knowingly.',
  directionally_incoherent: 'Reframe the question or gather clarifying evidence before trying again.',
  user_declined_escalation: 'Keep the current result as provisional unless you later choose to escalate.',
};

/**
 * Present a session bundle as an app-facing view model.
 *
 * @param {object} input
 * @param {object} input.session
 * @param {object[]} [input.events]
 * @returns {Promise<object>}
 */
export async function presentSession({ session, events = [] } = {}) {
  if (!session || typeof session !== 'object' || Array.isArray(session)) {
    throw new Error('session is required');
  }

  const artifactData = await loadArtifactData(session.artifacts || {});
  const uncertaintyPayload = extractUncertaintyPayload(artifactData);
  const availableActions = buildAvailableActions(session);

  return {
    session_id: session.session_id,
    question: session.question,
    scenario_id: session.scenario_id,
    scenario_class: session.scenario_class,
    scenario_class_provisional: Boolean(session.scenario_class_provisional),
    status: session.status,
    stage: session.stage,
    headline: buildHeadline(session),
    state: session.ux_state || null,
    substate: session.ux_substate || null,
    current_recommendation: buildCurrentRecommendation(session, artifactData),
    why_this_state: buildWhyThisState(session),
    recommended_next_action: buildRecommendedNextAction(session, uncertaintyPayload),
    explanation: session.explanation || '',
    available_actions: availableActions,
    confirmation_required: Boolean(session.requires_user_confirmation),
    next_mode: session.recommended_next_mode || null,
    provider_roles: session.recommended_provider_roles || null,
    follow_up_action: session.follow_up_action || null,
    follow_up_artifact: session.follow_up_artifact || null,
    uncertainty_payload: uncertaintyPayload,
    artifacts: summarizeArtifacts(session.artifacts || {}, artifactData),
    event_count: events.length,
    latest_event: events.length > 0 ? events[events.length - 1] : null,
  };
}

/**
 * Build the user-visible action list for a session.
 *
 * @param {object} session
 * @returns {string[]}
 */
export function buildAvailableActions(session) {
  if (!session || typeof session !== 'object') {
    return [];
  }

  if (session.status === 'failed') {
    return ['retry_session_step'];
  }

  if (session.status === 'awaiting_user_action' && session.requires_user_confirmation) {
    return ['confirm_next_step', 'decline_next_step'];
  }

  if (session.ux_state === 'not_ready') {
    const actions = [];
    if (session.follow_up_action) {
      actions.push('run_follow_up_action');
    }
    actions.push('open_human_review');
    return actions;
  }

  if (session.ux_state === 'provisional' && session.recommended_next_mode) {
    return ['confirm_next_step'];
  }

  return [];
}

/**
 * Build the user-visible headline for a session.
 *
 * @param {object} session
 * @returns {string}
 */
export function buildHeadline(session) {
  if (!session || typeof session !== 'object') {
    return 'Decision session';
  }

  if (session.status === 'failed') {
    return 'Session needs retry';
  }

  if (session.status === 'running') {
    return 'Analysis in progress';
  }

  return STATE_HEADLINES[session.ux_state] || 'Decision session';
}

function buildCurrentRecommendation(session, artifactData) {
  if (session.current_recommendation) {
    return session.current_recommendation;
  }

  if (artifactData.analysis?.recommendation) {
    return artifactData.analysis.recommendation;
  }

  if (artifactData.verdict?.winner) {
    return `Current adjudicated winner: ${artifactData.verdict.winner}.`;
  }

  if (session.ux_state === 'not_ready') {
    return 'Do not force a winner yet.';
  }

  return null;
}

function buildWhyThisState(session) {
  if (session.explanation && session.explanation.trim().length > 0) {
    return session.explanation.trim();
  }

  if (session.status === 'failed') {
    return session.error || 'The last execution step failed and needs retry.';
  }

  return SUBSTATE_REASONS[session.ux_substate] || 'Shipwright is surfacing the current best decision state.';
}

function buildRecommendedNextAction(session, uncertaintyPayload) {
  if (session.ux_state === 'not_ready' && uncertaintyPayload?.recommended_next_action) {
    return uncertaintyPayload.recommended_next_action;
  }

  if (session.follow_up_action) {
    return session.follow_up_action;
  }

  return SUBSTATE_ACTIONS[session.ux_substate] || null;
}

async function loadArtifactData(artifacts) {
  const analysis = await loadJsonArtifact(artifacts.analysis_json);
  const verdict = await loadJsonArtifact(artifacts.verdict_json);
  return { analysis, verdict };
}

async function loadJsonArtifact(ref) {
  if (typeof ref !== 'string' || ref.trim().length === 0) {
    return null;
  }

  const filePath = path.resolve(ref);
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function extractUncertaintyPayload(artifactData) {
  const source = artifactData.verdict || artifactData.analysis || null;
  if (!source) {
    return null;
  }

  const payload = {
    uncertainty_drivers: normalizeList(source.uncertainty_drivers),
    disambiguation_questions: normalizeList(source.disambiguation_questions),
    needed_evidence: normalizeList(source.needed_evidence),
    recommended_next_artifact: source.recommended_next_artifact || null,
    recommended_next_action: source.recommended_next_action || null,
    can_resolve_with_more_evidence: source.can_resolve_with_more_evidence ?? null,
    escalation_recommendation: source.escalation_recommendation || null,
  };

  const hasContent = Object.values(payload).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '';
  });

  return hasContent ? payload : null;
}

function summarizeArtifacts(artifacts, artifactData) {
  return {
    analysis_json: artifacts.analysis_json || null,
    verdict_json: artifacts.verdict_json || null,
    run_json: artifacts.run_json || null,
    scenario_json: artifacts.scenario_json || null,
    case_packet_json: artifacts.case_packet_json || null,
    analysis_loaded: Boolean(artifactData.analysis),
    verdict_loaded: Boolean(artifactData.verdict),
  };
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
}
