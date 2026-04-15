#!/usr/bin/env node

/**
 * Orchestrator routing module for Shipwright's Rigor Mode adjudication flow.
 *
 * Pure logic module — no I/O, no shell execution, no side effects.
 * Takes a routing input and returns a routing result describing what
 * Shipwright should recommend next and how to present the current state.
 *
 * Implements the staged adjudication policy from orchestrator-decision-spec-2026-04-15.md:
 *   single_analysis → double_panel → judge → uncertainty_first
 *
 * Three top-level UX states:
 *   provisional           — result is reliable enough to act on (provisionally)
 *   more_rigor_recommended — result warrants a stronger check before acting
 *   not_ready             — result cannot support a decision yet; surface uncertainty payload
 *
 * Substates are preserved as inspectable diagnostic metadata within each top-level state.
 *
 * Usage (as a module):
 *   import { route, assessProviderAvailability, SCENARIO_CLASSES } from './orchestrate.mjs';
 *
 *   const result = route({
 *     scenario_class: 'governance',
 *     stage: 'post_single',
 *     confidence_band: 'medium',
 *     needs_human_review: false,
 *     uncertainty_payload_present: false,
 *     panel_agreement: null,
 *     user_declined_escalation: false,
 *     provider_availability: assessProviderAvailability(['claude', 'gpt']),
 *   });
 */

// ---------------------------------------------------------------------------
// Scenario class config
// ---------------------------------------------------------------------------

/**
 * V1 scenario class definitions.
 *
 * Only `governance` is policy-backed in V1. All other classes carry
 * `provisional: true` and their defaults should not be treated as calibrated.
 *
 * `customer_evidence` is left unclassified in V1 — collapse into
 * `product_strategy` or add explicit routing criteria before shipping.
 */
export const SCENARIO_CLASSES = Object.freeze({
  governance: {
    id: 'governance',
    label: 'Governance / Board / Restructuring',
    provisional: false,
    single_judge_allowed: false,
    cross_family_required: true,
    default_mode: 'double_panel',
    winner_vs_uncertainty_priority: 'uncertainty',
  },
  pricing: {
    id: 'pricing',
    label: 'Pricing / Packaging',
    provisional: true,
    single_judge_allowed: true,
    cross_family_required: false,
    default_mode: 'single_analysis',
    winner_vs_uncertainty_priority: 'winner',
  },
  product_strategy: {
    id: 'product_strategy',
    label: 'Product Strategy / Prioritization',
    provisional: true,
    single_judge_allowed: true,
    cross_family_required: false,
    default_mode: 'single_analysis',
    winner_vs_uncertainty_priority: 'winner',
  },
  publication: {
    id: 'publication',
    label: 'Publication-Claim Work',
    provisional: false,
    single_judge_allowed: false,
    cross_family_required: true,
    default_mode: 'double_panel',
    winner_vs_uncertainty_priority: 'uncertainty',
  },
  unclassified: {
    id: 'unclassified',
    label: 'Unclassified',
    provisional: true,
    single_judge_allowed: true,
    cross_family_required: false,
    default_mode: 'single_analysis',
    winner_vs_uncertainty_priority: 'winner',
  },
});

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

/**
 * Valid adjudication stages.
 *
 * pre_run         — nothing has run yet; compute initial mode recommendation
 * post_single     — a single analysis has completed
 * post_double     — a double panel has completed
 * post_judge      — a third-model judge has completed
 */
export const STAGES = Object.freeze([
  'pre_run',
  'post_single',
  'post_double',
  'post_judge',
]);

// ---------------------------------------------------------------------------
// UX states and substates
// ---------------------------------------------------------------------------

export const UX_STATES = Object.freeze({
  PROVISIONAL: 'provisional',
  MORE_RIGOR_RECOMMENDED: 'more_rigor_recommended',
  NOT_READY: 'not_ready',
});

export const UX_SUBSTATES = Object.freeze({
  // Provisional substates
  SINGLE_RUN_ACCEPTABLE: 'single_run_acceptable',
  PANEL_CONVERGED: 'panel_converged',
  USER_DECLINED_ESCALATION: 'user_declined_escalation',
  // More rigor recommended substates
  DOUBLE_PANEL_RECOMMENDED: 'double_panel_recommended',
  JUDGE_RECOMMENDED: 'judge_recommended',
  CROSS_FAMILY_REQUIRED: 'cross_family_required',
  // Not ready substates
  NEEDS_MORE_EVIDENCE: 'needs_more_evidence',
  LIMITED_PROVIDER_AVAILABILITY: 'limited_provider_availability',
  DIRECTIONALLY_INCOHERENT: 'directionally_incoherent',
  // Shared
  USER_DECLINED_ESCALATION_NOT_READY: 'user_declined_escalation',
});

// ---------------------------------------------------------------------------
// Confidence normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a model-native confidence label to an internal routing band.
 *
 * The 80% threshold is an internal routing heuristic — not a calibrated
 * statistical probability. Do not surface numeric percentages to users.
 *
 * Returns:
 *   { band, above_threshold, below_threshold }
 */
export function normalizeConfidence(band) {
  if (band === 'high') {
    return { band: 'high', above_threshold: true, below_threshold: false };
  }
  if (band === 'medium') {
    return { band: 'medium', above_threshold: false, below_threshold: true };
  }
  if (band === 'low') {
    return { band: 'low', above_threshold: false, below_threshold: true };
  }
  // null / undefined — treat as unknown, behave as below threshold
  return { band: null, above_threshold: false, below_threshold: true };
}

// ---------------------------------------------------------------------------
// Provider availability
// ---------------------------------------------------------------------------

/**
 * Assess provider availability from a list of available provider IDs.
 *
 * @param {string[]} available        - Providers that are configured and healthy
 * @param {string[]} [unavailable]    - Providers that are temporarily unavailable (not a plan limit)
 * @returns {ProviderAvailability}
 */
export function assessProviderAvailability(available = [], unavailable = []) {
  const availableSet = new Set(available.map((p) => String(p).toLowerCase()));
  const unavailableSet = new Set(unavailable.map((p) => String(p).toLowerCase()));

  const providerCount = availableSet.size;
  const can_run_double_panel = providerCount >= 2;
  const can_run_third_family_judge = providerCount >= 3;

  return {
    available_providers: [...availableSet],
    temporarily_unavailable_providers: [...unavailableSet],
    provider_count: providerCount,
    can_run_double_panel,
    can_run_third_family_judge,
  };
}

// ---------------------------------------------------------------------------
// Class resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a scenario class config by ID.
 * Falls back to 'unclassified' if the ID is unknown.
 */
export function resolveScenarioClass(classId) {
  return SCENARIO_CLASSES[classId] || SCENARIO_CLASSES.unclassified;
}

// ---------------------------------------------------------------------------
// Main routing engine
// ---------------------------------------------------------------------------

/**
 * Compute the orchestrator routing result for the current state.
 *
 * @param {object} input
 * @param {string} input.scenario_class              - Scenario class ID (see SCENARIO_CLASSES)
 * @param {string} input.stage                       - Current stage (see STAGES)
 * @param {string|null} input.confidence_band        - 'high' | 'medium' | 'low' | null
 * @param {boolean|null} input.needs_human_review    - From verdict; null at pre_run
 * @param {boolean} [input.uncertainty_payload_present] - Whether uncertainty payload was emitted
 * @param {string|null} [input.panel_agreement]      - 'converged' | 'disagree' | 'directionally_incoherent' | null
 * @param {boolean} [input.user_declined_escalation] - Whether user said no to the last recommendation
 * @param {object} input.provider_availability       - From assessProviderAvailability()
 * @param {string} [input.intended_use]              - 'exploratory' | 'publication' | null
 *
 * @returns {RoutingResult}
 */
export function route(input) {
  const scenarioClass = resolveScenarioClass(input.scenario_class);
  const confidence = normalizeConfidence(input.confidence_band);
  const pa = input.provider_availability || assessProviderAvailability([]);
  const userDeclined = Boolean(input.user_declined_escalation);
  const hasUncertaintyPayload = Boolean(input.uncertainty_payload_present);
  const needsReview = input.needs_human_review === true;
  const panelAgreement = input.panel_agreement || null;
  const stage = input.stage || 'pre_run';

  switch (stage) {
    case 'pre_run':
      return routePreRun({ scenarioClass, pa, input });

    case 'post_single':
      return routePostSingle({
        scenarioClass, confidence, pa, needsReview,
        hasUncertaintyPayload, userDeclined, input,
      });

    case 'post_double':
      return routePostDouble({
        scenarioClass, confidence, pa, needsReview,
        panelAgreement, userDeclined, input,
      });

    case 'post_judge':
      return routePostJudge({
        scenarioClass, confidence, pa, needsReview,
        panelAgreement, hasUncertaintyPayload, input,
      });

    default:
      return makeResult({
        ux_state: UX_STATES.NOT_READY,
        ux_substate: UX_SUBSTATES.NEEDS_MORE_EVIDENCE,
        recommended_next_mode: null,
        requires_user_confirmation: false,
        explanation: `Unknown stage "${stage}". Cannot route.`,
      });
  }
}

// ---------------------------------------------------------------------------
// Stage routing handlers
// ---------------------------------------------------------------------------

function routePreRun({ scenarioClass, pa, input }) {
  // Cross-family required class but no second provider
  if (scenarioClass.cross_family_required && !pa.can_run_double_panel) {
    return makeResult({
      ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
      ux_substate: UX_SUBSTATES.CROSS_FAMILY_REQUIRED,
      recommended_next_mode: 'single_analysis',
      requires_user_confirmation: false,
      recommended_provider_roles: suggestProviderRoles(pa, 'single'),
      explanation: `${scenarioClass.label} requires cross-family adjudication, but only one provider is available. The result will be provisional by policy. Do not use as a publication-grade conclusion.`,
      follow_up_action: 'Run single analysis (limited availability)',
    });
  }

  // Governance / publication defaults to double panel
  if (!scenarioClass.single_judge_allowed && pa.can_run_double_panel) {
    return makeResult({
      ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
      ux_substate: UX_SUBSTATES.CROSS_FAMILY_REQUIRED,
      recommended_next_mode: 'double_panel',
      requires_user_confirmation: true,
      recommended_provider_roles: suggestProviderRoles(pa, 'double'),
      explanation: `${scenarioClass.label} is not single-judge safe. Starting with a double panel is the recommended path.`,
      follow_up_action: 'Run double panel',
    });
  }

  // Single analysis is the default for everything else
  return makeResult({
    ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
    ux_substate: UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED,
    recommended_next_mode: 'single_analysis',
    requires_user_confirmation: false,
    recommended_provider_roles: suggestProviderRoles(pa, 'single'),
    explanation: scenarioClass.provisional
      ? `Starting with a single analysis. Note: ${scenarioClass.label} policy is provisional — defaults have not been calibrated beyond governance.`
      : 'Starting with a single analysis.',
    follow_up_action: 'Run single analysis',
  });
}

function routePostSingle({ scenarioClass, confidence, pa, needsReview, hasUncertaintyPayload, userDeclined, input }) {
  const isWeak = confidence.below_threshold || needsReview || hasUncertaintyPayload;

  // Strong single result — provisional
  if (!isWeak && !userDeclined) {
    // Cross-family required class: mark provisional even if result looks strong
    if (scenarioClass.cross_family_required) {
      return makeResult({
        ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
        ux_substate: UX_SUBSTATES.CROSS_FAMILY_REQUIRED,
        recommended_next_mode: pa.can_run_double_panel ? 'double_panel' : null,
        requires_user_confirmation: true,
        recommended_provider_roles: suggestProviderRoles(pa, 'double'),
        explanation: `Result looks strong, but ${scenarioClass.label} requires cross-family confirmation before this can be treated as reliable. A single-family result is not sufficient for this class.`,
        follow_up_action: pa.can_run_double_panel ? 'Run double panel' : null,
      });
    }

    return makeResult({
      ux_state: UX_STATES.PROVISIONAL,
      ux_substate: UX_SUBSTATES.SINGLE_RUN_ACCEPTABLE,
      recommended_next_mode: pa.can_run_double_panel ? 'double_panel' : null,
      requires_user_confirmation: false,
      recommended_provider_roles: suggestProviderRoles(pa, 'double'),
      explanation: 'Single analysis returned high confidence with no review flags. This is the best current adjudication.',
      follow_up_action: pa.can_run_double_panel ? 'Run double panel for extra rigor (optional)' : null,
    });
  }

  // User declined escalation — preserve state with substate
  if (userDeclined) {
    const baseState = isWeak ? UX_STATES.NOT_READY : UX_STATES.PROVISIONAL;
    return makeResult({
      ux_state: baseState,
      ux_substate: UX_SUBSTATES.USER_DECLINED_ESCALATION,
      recommended_next_mode: pa.can_run_double_panel ? 'double_panel' : null,
      requires_user_confirmation: true,
      explanation: isWeak
        ? 'Escalation was declined. This result is below the confidence threshold. The stronger-path recommendation remains available.'
        : 'Escalation was declined. The result is provisionally usable.',
      follow_up_action: pa.can_run_double_panel ? 'Run double panel (previously declined)' : null,
    });
  }

  // Weak single result, second provider available → recommend double panel
  if (pa.can_run_double_panel) {
    const reason = buildWeaknessReason(confidence, needsReview, hasUncertaintyPayload);
    return makeResult({
      ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
      ux_substate: UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED,
      recommended_next_mode: 'double_panel',
      requires_user_confirmation: true,
      recommended_provider_roles: suggestProviderRoles(pa, 'double'),
      explanation: `This result is directionally useful but not reliable enough to stand alone. ${reason} A second model can test whether the recommendation converges across families.`,
      follow_up_action: 'Run double panel',
    });
  }

  // Weak single result, no second provider → not ready
  return makeResult({
    ux_state: UX_STATES.NOT_READY,
    ux_substate: UX_SUBSTATES.LIMITED_PROVIDER_AVAILABILITY,
    recommended_next_mode: null,
    requires_user_confirmation: false,
    explanation: 'This result is below the confidence threshold and cross-family confirmation is recommended, but only one provider is currently available. Treat as provisional and do not use as a publication-grade conclusion.',
    follow_up_action: 'Gather more evidence or add a second provider',
  });
}

function routePostDouble({ scenarioClass, confidence, pa, needsReview, panelAgreement, userDeclined, input }) {
  // Panel converged — strong result
  if (panelAgreement === 'converged' && !needsReview && confidence.above_threshold) {
    return makeResult({
      ux_state: UX_STATES.PROVISIONAL,
      ux_substate: UX_SUBSTATES.PANEL_CONVERGED,
      recommended_next_mode: pa.can_run_third_family_judge ? 'judge' : null,
      requires_user_confirmation: false,
      recommended_provider_roles: suggestProviderRoles(pa, 'judge'),
      explanation: 'Both model families converged on the same recommendation. This is the best available adjudication without a third-family judge.',
      follow_up_action: pa.can_run_third_family_judge
        ? 'Escalate to a judge for publication-grade rigor (optional)'
        : null,
    });
  }

  // Panel converged but review flag — provisional but flagged
  if (panelAgreement === 'converged' && (needsReview || confidence.below_threshold)) {
    return makeResult({
      ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
      ux_substate: UX_SUBSTATES.JUDGE_RECOMMENDED,
      recommended_next_mode: pa.can_run_third_family_judge ? 'judge' : null,
      requires_user_confirmation: true,
      recommended_provider_roles: suggestProviderRoles(pa, 'judge'),
      explanation: 'The panel converged on direction but at least one model flagged uncertainty or low confidence. A judge can evaluate whether the agreement is substantive.',
      follow_up_action: pa.can_run_third_family_judge ? 'Escalate to a judge' : null,
    });
  }

  // Panel disagreed, third provider available → recommend judge
  if (panelAgreement === 'disagree' && pa.can_run_third_family_judge) {
    if (userDeclined) {
      return makeResult({
        ux_state: UX_STATES.NOT_READY,
        ux_substate: UX_SUBSTATES.USER_DECLINED_ESCALATION,
        recommended_next_mode: 'judge',
        requires_user_confirmation: true,
        explanation: 'Judge escalation was declined. The panel disagreement is unresolved. The stronger-path recommendation remains available.',
        follow_up_action: 'Escalate to a judge (previously declined)',
      });
    }

    return makeResult({
      ux_state: UX_STATES.MORE_RIGOR_RECOMMENDED,
      ux_substate: UX_SUBSTATES.JUDGE_RECOMMENDED,
      recommended_next_mode: 'judge',
      requires_user_confirmation: true,
      recommended_provider_roles: suggestProviderRoles(pa, 'judge'),
      explanation: 'The panel did not converge. A third-model judge can evaluate the competing artifacts directly.',
      follow_up_action: 'Escalate to a judge',
    });
  }

  // Panel disagreed, no third provider → not ready, unresolved disagreement
  if (panelAgreement === 'disagree' && !pa.can_run_third_family_judge) {
    return makeResult({
      ux_state: UX_STATES.NOT_READY,
      ux_substate: UX_SUBSTATES.LIMITED_PROVIDER_AVAILABILITY,
      recommended_next_mode: null,
      requires_user_confirmation: false,
      explanation: 'The panel disagreed and no third judge family is available. This is not just low confidence — the system found no stable direction with the providers currently available. Treat as unresolved and route to evidence gathering or human review.',
      follow_up_action: 'Gather more evidence or add a third provider',
    });
  }

  // Directionally incoherent panel
  if (panelAgreement === 'directionally_incoherent') {
    return makeResult({
      ux_state: UX_STATES.NOT_READY,
      ux_substate: UX_SUBSTATES.DIRECTIONALLY_INCOHERENT,
      recommended_next_mode: null,
      requires_user_confirmation: false,
      explanation: 'The models did not converge on a stable direction. This is not a close call between two options — it is a sign that the current evidence and framing do not support a reliable adjudication.',
      follow_up_action: 'Reframe the question or gather clarifying evidence',
    });
  }

  // Fallback for unknown panel_agreement value
  return makeResult({
    ux_state: UX_STATES.NOT_READY,
    ux_substate: UX_SUBSTATES.NEEDS_MORE_EVIDENCE,
    recommended_next_mode: pa.can_run_third_family_judge ? 'judge' : null,
    requires_user_confirmation: true,
    explanation: 'Double panel completed. Panel agreement status is unclear — escalating to judge is recommended if a third provider is available.',
    follow_up_action: pa.can_run_third_family_judge ? 'Escalate to a judge' : 'Gather more evidence',
  });
}

function routePostJudge({ scenarioClass, confidence, pa, needsReview, panelAgreement, hasUncertaintyPayload }) {
  // Judge disagrees with both panel models — directionally incoherent
  if (panelAgreement === 'directionally_incoherent') {
    return makeResult({
      ux_state: UX_STATES.NOT_READY,
      ux_substate: UX_SUBSTATES.DIRECTIONALLY_INCOHERENT,
      recommended_next_mode: null,
      requires_user_confirmation: false,
      explanation: 'The judge landed in a third direction relative to the panel. The models did not converge on a stable direction across three families. This indicates that the current evidence and framing do not support a reliable adjudication. Do not force a winner.',
      follow_up_artifact: 'Disambiguation evidence brief',
      follow_up_action: 'Reframe the question or gather clarifying evidence before re-adjudicating',
    });
  }

  // Judge returned low confidence, review flag, or uncertainty payload
  const isUnresolved = confidence.below_threshold || needsReview || hasUncertaintyPayload;
  if (isUnresolved) {
    return makeResult({
      ux_state: UX_STATES.NOT_READY,
      ux_substate: UX_SUBSTATES.NEEDS_MORE_EVIDENCE,
      recommended_next_mode: null,
      requires_user_confirmation: false,
      explanation: 'The judge returned an uncertain verdict. The system is not ready to force a winner. The uncertainty payload identifies what is needed to resolve this.',
      follow_up_artifact: 'Evidence collection brief',
      follow_up_action: 'Gather the evidence identified in the uncertainty payload',
    });
  }

  // Clean judge verdict — provisional
  return makeResult({
    ux_state: UX_STATES.PROVISIONAL,
    ux_substate: null,
    recommended_next_mode: null,
    requires_user_confirmation: false,
    explanation: 'The judge returned a clear verdict after cross-family adjudication. This is the highest-confidence adjudication available with the current provider set.',
    follow_up_action: null,
  });
}

// ---------------------------------------------------------------------------
// Provider role suggestions
// ---------------------------------------------------------------------------

function suggestProviderRoles(pa, mode) {
  const providers = [...pa.available_providers];
  if (providers.length === 0) return null;

  if (mode === 'single') {
    return { analyst: providers[0] };
  }

  if (mode === 'double') {
    return {
      analyst: providers[0],
      second_opinion: providers[1] || null,
    };
  }

  if (mode === 'judge') {
    // Prefer a provider not used in the panel
    return {
      analyst: providers[0],
      second_opinion: providers[1] || null,
      judge: providers[2] || providers[0],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildWeaknessReason(confidence, needsReview, hasUncertaintyPayload) {
  const reasons = [];
  if (confidence.band === 'low') reasons.push('Confidence is low.');
  else if (confidence.band === 'medium') reasons.push('Confidence is below the routing threshold.');
  if (needsReview) reasons.push('The model flagged this for human review.');
  if (hasUncertaintyPayload) reasons.push('An uncertainty payload was emitted.');
  return reasons.join(' ');
}

function makeResult({
  ux_state,
  ux_substate = null,
  recommended_next_mode = null,
  requires_user_confirmation = false,
  recommended_provider_roles = null,
  explanation = '',
  follow_up_artifact = null,
  follow_up_action = null,
}) {
  return {
    ux_state,
    ux_substate,
    recommended_next_mode,
    requires_user_confirmation,
    recommended_provider_roles,
    explanation,
    follow_up_artifact,
    follow_up_action,
  };
}

// ---------------------------------------------------------------------------
// CLI (diagnostic / inspection mode)
// ---------------------------------------------------------------------------

/**
 * Format a routing result for human-readable output.
 */
export function formatRoutingResult(result) {
  const lines = [];
  lines.push(`UX State:    ${result.ux_state}`);
  if (result.ux_substate) {
    lines.push(`Substate:    ${result.ux_substate}`);
  }
  if (result.recommended_next_mode) {
    lines.push(`Next Mode:   ${result.recommended_next_mode}`);
    lines.push(`Confirm:     ${result.requires_user_confirmation}`);
  }
  if (result.recommended_provider_roles) {
    lines.push(`Roles:       ${JSON.stringify(result.recommended_provider_roles)}`);
  }
  lines.push('');
  lines.push(result.explanation);
  if (result.follow_up_action) {
    lines.push('');
    lines.push(`Action:      ${result.follow_up_action}`);
  }
  if (result.follow_up_artifact) {
    lines.push(`Artifact:    ${result.follow_up_artifact}`);
  }
  return lines.join('\n');
}

const isMain = process.argv[1]
  && (process.argv[1].endsWith('orchestrate.mjs') || process.argv[1].endsWith('orchestrate'));

if (isMain) {
  // Quick smoke test / inspection: print routing for a handful of representative states
  const examples = [
    {
      label: 'governance pre_run (2 providers)',
      input: { scenario_class: 'governance', stage: 'pre_run', confidence_band: null, needs_human_review: null, provider_availability: assessProviderAvailability(['claude', 'gpt']) },
    },
    {
      label: 'pricing post_single high confidence',
      input: { scenario_class: 'pricing', stage: 'post_single', confidence_band: 'high', needs_human_review: false, provider_availability: assessProviderAvailability(['claude', 'gpt']) },
    },
    {
      label: 'pricing post_single medium confidence',
      input: { scenario_class: 'pricing', stage: 'post_single', confidence_band: 'medium', needs_human_review: false, provider_availability: assessProviderAvailability(['claude', 'gpt']) },
    },
    {
      label: 'unclassified post_single medium confidence, 1 provider',
      input: { scenario_class: 'unclassified', stage: 'post_single', confidence_band: 'medium', needs_human_review: false, provider_availability: assessProviderAvailability(['claude']) },
    },
    {
      label: 'post_double panel disagree, 3 providers',
      input: { scenario_class: 'governance', stage: 'post_double', confidence_band: 'medium', needs_human_review: false, panel_agreement: 'disagree', provider_availability: assessProviderAvailability(['claude', 'gpt', 'gemini']) },
    },
    {
      label: 'post_double panel disagree, 2 providers (no judge)',
      input: { scenario_class: 'governance', stage: 'post_double', confidence_band: 'medium', needs_human_review: false, panel_agreement: 'disagree', provider_availability: assessProviderAvailability(['claude', 'gpt']) },
    },
    {
      label: 'post_judge directionally incoherent',
      input: { scenario_class: 'governance', stage: 'post_judge', confidence_band: 'low', needs_human_review: true, panel_agreement: 'directionally_incoherent', provider_availability: assessProviderAvailability(['claude', 'gpt', 'gemini']) },
    },
    {
      label: 'post_judge clean verdict',
      input: { scenario_class: 'governance', stage: 'post_judge', confidence_band: 'high', needs_human_review: false, panel_agreement: 'converged', provider_availability: assessProviderAvailability(['claude', 'gpt', 'gemini']) },
    },
  ];

  for (const { label, input } of examples) {
    const result = route(input);
    process.stdout.write(`\n=== ${label} ===\n`);
    process.stdout.write(formatRoutingResult(result) + '\n');
  }
}
