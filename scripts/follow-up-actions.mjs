#!/usr/bin/env node

/**
 * Follow-up action adapter for Shipwright.
 *
 * Handles execution of follow-up actions on not_ready sessions. Each action
 * takes a session and options and returns an action result that the controller
 * can apply to the session state.
 *
 * Supported actions:
 *   gather_more_evidence  — refines the question from the uncertainty payload
 *                           and runs a new Fast Mode analysis pass
 *   create_follow_up_brief — writes a structured markdown brief from the
 *                            uncertainty payload for human review
 *   open_human_review     — flags the session for manual human review and
 *                           returns a structured review request payload
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { executeFastAnalysisForSession } from './decision-execution.mjs';
import { getSessionDirectory } from './session-store.mjs';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const SUPPORTED_FOLLOW_UP_ACTIONS = Object.freeze([
  'gather_more_evidence',
  'create_follow_up_brief',
  'open_human_review',
]);

/**
 * Execute a follow-up action on a not_ready session.
 *
 * Returns an action result object. The controller is responsible for applying
 * state transitions and emitting telemetry based on the result.
 *
 * @param {object} session
 * @param {string} action
 * @param {object} [options]
 * @param {string}   [options.sessions_root]
 * @param {string}   [options.fast_out_dir]
 * @param {number}   [options.timeout_ms]
 * @param {function} [options.fast_turn_runner]
 */
export async function executeFollowUpAction(session, action, options = {}) {
  if (!SUPPORTED_FOLLOW_UP_ACTIONS.includes(action)) {
    throw new Error(
      `Unknown follow-up action: "${action}". Supported: ${SUPPORTED_FOLLOW_UP_ACTIONS.join(', ')}`,
    );
  }

  switch (action) {
    case 'gather_more_evidence':
      return gatherMoreEvidence(session, options);
    case 'create_follow_up_brief':
      return createFollowUpBrief(session, options);
    case 'open_human_review':
      return openHumanReview(session, options);
  }
}

/**
 * Build a refined question by appending uncertainty context to the original.
 *
 * The refinement guides the re-analysis toward resolving the specific gaps
 * identified in the prior uncertainty payload. Returns the original question
 * unchanged when no payload is present.
 *
 * @param {string} originalQuestion
 * @param {object|null} uncertaintyPayload
 * @returns {string}
 */
export function buildRefinedQuestion(originalQuestion, uncertaintyPayload) {
  if (!uncertaintyPayload) {
    return originalQuestion;
  }

  const parts = [originalQuestion.trim(), ''];

  if (uncertaintyPayload.uncertainty_drivers?.length > 0) {
    parts.push('Prior analysis was uncertain because:');
    for (const driver of uncertaintyPayload.uncertainty_drivers) {
      parts.push(`- ${driver}`);
    }
    parts.push('');
  }

  if (uncertaintyPayload.disambiguation_questions?.length > 0) {
    parts.push('Key questions to resolve:');
    for (const q of uncertaintyPayload.disambiguation_questions) {
      parts.push(`- ${q}`);
    }
    parts.push('');
  }

  if (uncertaintyPayload.needed_evidence?.length > 0) {
    parts.push('Evidence to seek before deciding:');
    for (const e of uncertaintyPayload.needed_evidence) {
      parts.push(`- ${e}`);
    }
    parts.push('');
  }

  parts.push(
    'Re-analyze with a focus on resolving the above uncertainties. ' +
    'If evidence is still insufficient, state that explicitly rather than forcing a confident recommendation.',
  );

  return parts.join('\n').trim();
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

/**
 * Run a new Fast Mode analysis with a question refined from the uncertainty
 * payload. The controller re-routes through applyFastResult so the session
 * ux_state reflects the new confidence band.
 */
async function gatherMoreEvidence(session, options) {
  const uncertaintyPayload = await loadUncertaintyPayload(session);
  const refinedQuestion = buildRefinedQuestion(session.question, uncertaintyPayload);

  // Run fast analysis with refined question. Pass a modified session so the
  // scenario prompt reflects the refinement without mutating the original.
  const effectiveSession = { ...session, question: refinedQuestion };
  const fastResult = await executeFastAnalysisForSession(effectiveSession, {
    outDir: options.fast_out_dir,
    timeoutMs: options.timeout_ms,
    turnRunner: options.fast_turn_runner,
  });

  return {
    mode: 'fast_reanalysis',
    fast_result: fastResult,
    refined_question: refinedQuestion,
    event_fields: {
      run_id: fastResult.run_id,
      confidence_band: fastResult.routing_input.confidence_band,
      refined_question: refinedQuestion,
    },
    telemetry_fields: {
      run_id: fastResult.run_id,
      confidence_band: fastResult.routing_input.confidence_band,
    },
    session_patch: null,
  };
}

/**
 * Write a structured follow-up brief from the uncertainty payload. The brief
 * gives a human reviewer the context they need to resolve the gaps themselves.
 */
async function createFollowUpBrief(session, options) {
  const uncertaintyPayload = await loadUncertaintyPayload(session);
  const briefContent = buildBriefMarkdown(session, uncertaintyPayload);

  const sessionDir = getSessionDirectory(session.session_id, options.sessions_root);
  const briefPath = path.join(sessionDir, 'follow-up-brief.md');
  await writeFile(briefPath, briefContent, 'utf8');

  return {
    mode: 'brief_generated',
    brief_path: briefPath,
    brief_content: briefContent,
    event_fields: { brief_path: briefPath },
    telemetry_fields: {},
    session_patch: {
      artifacts: { follow_up_brief_md: briefPath },
    },
  };
}

/**
 * Return a structured review request payload. The session is flagged for
 * manual human review with all uncertainty context attached.
 */
async function openHumanReview(session, options) {
  const uncertaintyPayload = await loadUncertaintyPayload(session);

  return {
    mode: 'review_requested',
    review_payload: {
      session_id: session.session_id,
      question: session.question,
      scenario_class: session.scenario_class,
      uncertainty_drivers: uncertaintyPayload?.uncertainty_drivers || [],
      disambiguation_questions: uncertaintyPayload?.disambiguation_questions || [],
      needed_evidence: uncertaintyPayload?.needed_evidence || [],
      recommended_next_action: uncertaintyPayload?.recommended_next_action || null,
    },
    event_fields: {},
    telemetry_fields: {},
    session_patch: {
      human_review_requested: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadUncertaintyPayload(session) {
  const analysisPath = session.artifacts?.analysis_json;
  if (!analysisPath) {
    return null;
  }

  const resolved = path.resolve(analysisPath);
  if (!existsSync(resolved)) {
    return null;
  }

  try {
    const analysis = JSON.parse(await readFile(resolved, 'utf8'));
    return analysis.uncertainty_payload || null;
  } catch {
    return null;
  }
}

function buildBriefMarkdown(session, uncertaintyPayload) {
  const lines = [
    '# Follow-Up Brief',
    '',
    `**Original question:** ${session.question}`,
    `**Scenario class:** ${session.scenario_class}`,
    `**Session:** ${session.session_id}`,
    '',
  ];

  if (uncertaintyPayload?.uncertainty_drivers?.length > 0) {
    lines.push('## Why More Evidence Is Needed', '');
    for (const d of uncertaintyPayload.uncertainty_drivers) {
      lines.push(`- ${d}`);
    }
    lines.push('');
  }

  if (uncertaintyPayload?.disambiguation_questions?.length > 0) {
    lines.push('## Questions to Resolve', '');
    for (const q of uncertaintyPayload.disambiguation_questions) {
      lines.push(`- ${q}`);
    }
    lines.push('');
  }

  if (uncertaintyPayload?.needed_evidence?.length > 0) {
    lines.push('## Evidence to Gather', '');
    for (const e of uncertaintyPayload.needed_evidence) {
      lines.push(`- ${e}`);
    }
    lines.push('');
  }

  if (uncertaintyPayload?.recommended_next_action) {
    lines.push('## Recommended Next Action', '');
    lines.push(uncertaintyPayload.recommended_next_action);
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generated by Shipwright at ${new Date().toISOString()}*`);

  return lines.join('\n');
}
