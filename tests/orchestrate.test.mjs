import assert from 'node:assert/strict';
import test from 'node:test';

import {
  route,
  assessProviderAvailability,
  normalizeConfidence,
  resolveScenarioClass,
  SCENARIO_CLASSES,
  STAGES,
  UX_STATES,
  UX_SUBSTATES,
} from '../scripts/orchestrate.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pa(available = [], unavailable = []) {
  return assessProviderAvailability(available, unavailable);
}

function baseInput(overrides = {}) {
  return {
    scenario_class: 'unclassified',
    stage: 'pre_run',
    confidence_band: null,
    needs_human_review: null,
    uncertainty_payload_present: false,
    panel_agreement: null,
    user_declined_escalation: false,
    provider_availability: pa(['claude', 'gpt']),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalizeConfidence
// ---------------------------------------------------------------------------

test('normalizeConfidence returns above_threshold for high', () => {
  const r = normalizeConfidence('high');
  assert.equal(r.band, 'high');
  assert.equal(r.above_threshold, true);
  assert.equal(r.below_threshold, false);
});

test('normalizeConfidence returns below_threshold for medium', () => {
  const r = normalizeConfidence('medium');
  assert.equal(r.band, 'medium');
  assert.equal(r.above_threshold, false);
  assert.equal(r.below_threshold, true);
});

test('normalizeConfidence returns below_threshold for low', () => {
  const r = normalizeConfidence('low');
  assert.equal(r.band, 'low');
  assert.equal(r.above_threshold, false);
  assert.equal(r.below_threshold, true);
});

test('normalizeConfidence returns below_threshold for null', () => {
  const r = normalizeConfidence(null);
  assert.equal(r.band, null);
  assert.equal(r.above_threshold, false);
  assert.equal(r.below_threshold, true);
});

test('normalizeConfidence returns below_threshold for undefined', () => {
  const r = normalizeConfidence(undefined);
  assert.equal(r.above_threshold, false);
  assert.equal(r.below_threshold, true);
});

// ---------------------------------------------------------------------------
// assessProviderAvailability
// ---------------------------------------------------------------------------

test('assessProviderAvailability with 0 providers cannot run any panels', () => {
  const r = pa([]);
  assert.equal(r.provider_count, 0);
  assert.equal(r.can_run_double_panel, false);
  assert.equal(r.can_run_third_family_judge, false);
});

test('assessProviderAvailability with 1 provider cannot run double panel', () => {
  const r = pa(['claude']);
  assert.equal(r.provider_count, 1);
  assert.equal(r.can_run_double_panel, false);
  assert.equal(r.can_run_third_family_judge, false);
});

test('assessProviderAvailability with 2 providers can run double panel but not third judge', () => {
  const r = pa(['claude', 'gpt']);
  assert.equal(r.provider_count, 2);
  assert.equal(r.can_run_double_panel, true);
  assert.equal(r.can_run_third_family_judge, false);
});

test('assessProviderAvailability with 3 providers can run third judge', () => {
  const r = pa(['claude', 'gpt', 'gemini']);
  assert.equal(r.provider_count, 3);
  assert.equal(r.can_run_double_panel, true);
  assert.equal(r.can_run_third_family_judge, true);
});

test('assessProviderAvailability normalizes provider IDs to lowercase', () => {
  const r = pa(['Claude', 'GPT']);
  assert.ok(r.available_providers.includes('claude'));
  assert.ok(r.available_providers.includes('gpt'));
});

test('assessProviderAvailability deduplicates providers', () => {
  const r = pa(['claude', 'claude', 'gpt']);
  assert.equal(r.provider_count, 2);
});

test('assessProviderAvailability records temporarily unavailable providers', () => {
  const r = pa(['claude'], ['gemini']);
  assert.ok(r.temporarily_unavailable_providers.includes('gemini'));
});

// ---------------------------------------------------------------------------
// resolveScenarioClass
// ---------------------------------------------------------------------------

test('resolveScenarioClass returns known class for governance', () => {
  const cls = resolveScenarioClass('governance');
  assert.equal(cls.id, 'governance');
  assert.equal(cls.cross_family_required, true);
  assert.equal(cls.single_judge_allowed, false);
});

test('resolveScenarioClass falls back to unclassified for unknown class', () => {
  const cls = resolveScenarioClass('totally_unknown');
  assert.equal(cls.id, 'unclassified');
});

test('resolveScenarioClass falls back to unclassified for null', () => {
  const cls = resolveScenarioClass(null);
  assert.equal(cls.id, 'unclassified');
});

// ---------------------------------------------------------------------------
// route — unknown stage
// ---------------------------------------------------------------------------

test('route returns not_ready for unknown stage', () => {
  const r = route(baseInput({ stage: 'bogus_stage' }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
  assert.ok(r.explanation.includes('Unknown stage'));
});

// ---------------------------------------------------------------------------
// route — pre_run
// ---------------------------------------------------------------------------

test('pre_run: governance with 1 provider → more_rigor_recommended / cross_family_required', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'pre_run',
    provider_availability: pa(['claude']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.CROSS_FAMILY_REQUIRED);
  assert.equal(r.recommended_next_mode, 'single_analysis');
});

test('pre_run: governance with 2 providers → more_rigor_recommended / cross_family_required (single_judge_not_allowed path)', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'pre_run',
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.CROSS_FAMILY_REQUIRED);
  assert.equal(r.recommended_next_mode, 'single_analysis');
});

test('pre_run: pricing → more_rigor_recommended / double_panel_recommended (default)', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'pre_run',
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
  assert.equal(r.recommended_next_mode, 'single_analysis');
});

test('pre_run: unclassified → more_rigor_recommended / double_panel_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'unclassified',
    stage: 'pre_run',
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
});

// ---------------------------------------------------------------------------
// route — post_single
// ---------------------------------------------------------------------------

test('post_single: high confidence, no flags, non-cross-family → provisional / single_run_acceptable', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, UX_SUBSTATES.SINGLE_RUN_ACCEPTABLE);
});

test('post_single: high confidence + 3 providers → provisional with optional follow-up', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, UX_SUBSTATES.SINGLE_RUN_ACCEPTABLE);
  assert.ok(r.follow_up_action !== null);
});

test('post_single: high confidence but cross_family_required + 3 providers → more_rigor_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.CROSS_FAMILY_REQUIRED);
  assert.equal(r.recommended_next_mode, 'double_panel');
});

test('post_single: high confidence but cross_family_required, no third provider → more_rigor_recommended, no next mode', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.CROSS_FAMILY_REQUIRED);
  assert.equal(r.recommended_next_mode, null);
});

test('post_single: medium confidence + 3 providers → more_rigor_recommended / double_panel_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'medium',
    needs_human_review: false,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
  assert.equal(r.recommended_next_mode, 'double_panel');
  assert.equal(r.requires_user_confirmation, true);
});

test('post_single: medium confidence, only 1 provider → not_ready / limited_provider_availability', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'medium',
    needs_human_review: false,
    provider_availability: pa(['claude']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.LIMITED_PROVIDER_AVAILABILITY);
  assert.equal(r.recommended_next_mode, null);
});

test('post_single: needs_human_review true + 3 providers → more_rigor_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
});

test('post_single: uncertainty_payload_present + 3 providers → more_rigor_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    uncertainty_payload_present: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
});

test('post_single: user_declined_escalation with weak result → not_ready / user_declined_escalation', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'medium',
    needs_human_review: false,
    user_declined_escalation: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.USER_DECLINED_ESCALATION);
});

test('post_single: user_declined_escalation with strong result → provisional / user_declined_escalation', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: false,
    user_declined_escalation: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, UX_SUBSTATES.USER_DECLINED_ESCALATION);
});

// ---------------------------------------------------------------------------
// route — post_double
// ---------------------------------------------------------------------------

test('post_double: converged + high confidence + no review → provisional / panel_converged', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'high',
    needs_human_review: false,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, UX_SUBSTATES.PANEL_CONVERGED);
  assert.equal(r.recommended_next_mode, 'judge');
});

test('post_double: converged + high confidence, no third provider → provisional with no next mode', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'high',
    needs_human_review: false,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, UX_SUBSTATES.PANEL_CONVERGED);
  assert.equal(r.recommended_next_mode, null);
});

test('post_double: converged but review flag → more_rigor_recommended / judge_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'high',
    needs_human_review: true,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.JUDGE_RECOMMENDED);
});

test('post_double: converged but low confidence → more_rigor_recommended / judge_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'low',
    needs_human_review: false,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.JUDGE_RECOMMENDED);
});

test('post_double: disagree + 3 providers → more_rigor_recommended / judge_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'medium',
    needs_human_review: false,
    panel_agreement: 'disagree',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.JUDGE_RECOMMENDED);
  assert.equal(r.recommended_next_mode, 'judge');
  assert.equal(r.requires_user_confirmation, true);
});

test('post_double: disagree + user declined + 3 providers → not_ready / user_declined_escalation', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'medium',
    needs_human_review: false,
    panel_agreement: 'disagree',
    user_declined_escalation: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.USER_DECLINED_ESCALATION);
  assert.equal(r.recommended_next_mode, 'judge');
});

test('post_double: disagree + only 2 providers → not_ready / limited_provider_availability', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'medium',
    needs_human_review: false,
    panel_agreement: 'disagree',
    provider_availability: pa(['claude', 'gpt']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.LIMITED_PROVIDER_AVAILABILITY);
  assert.equal(r.recommended_next_mode, null);
});

test('post_double: directionally_incoherent → not_ready / directionally_incoherent', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'low',
    needs_human_review: false,
    panel_agreement: 'directionally_incoherent',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.DIRECTIONALLY_INCOHERENT);
  assert.equal(r.recommended_next_mode, null);
});

test('post_double: unknown panel_agreement → not_ready / needs_more_evidence (fallback)', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'medium',
    needs_human_review: false,
    panel_agreement: 'totally_unknown',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
});

// ---------------------------------------------------------------------------
// route — post_judge
// ---------------------------------------------------------------------------

test('post_judge: directionally_incoherent → not_ready / directionally_incoherent', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'low',
    needs_human_review: true,
    panel_agreement: 'directionally_incoherent',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.DIRECTIONALLY_INCOHERENT);
  assert.equal(r.recommended_next_mode, null);
  assert.ok(r.follow_up_artifact !== null);
});

test('post_judge: low confidence → not_ready / needs_more_evidence', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'low',
    needs_human_review: false,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
});

test('post_judge: needs_human_review → not_ready / needs_more_evidence', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'high',
    needs_human_review: true,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
});

test('post_judge: uncertainty_payload_present → not_ready / needs_more_evidence', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'high',
    needs_human_review: false,
    uncertainty_payload_present: true,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
});

test('post_judge: clean verdict → provisional, no next mode', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'high',
    needs_human_review: false,
    uncertainty_payload_present: false,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.PROVISIONAL);
  assert.equal(r.ux_substate, null);
  assert.equal(r.recommended_next_mode, null);
  assert.equal(r.requires_user_confirmation, false);
});

// ---------------------------------------------------------------------------
// result shape
// ---------------------------------------------------------------------------

test('route always returns required fields', () => {
  const r = route(baseInput());
  assert.ok('ux_state' in r);
  assert.ok('ux_substate' in r);
  assert.ok('recommended_next_mode' in r);
  assert.ok('requires_user_confirmation' in r);
  assert.ok('explanation' in r);
  assert.ok('follow_up_action' in r);
  assert.ok('follow_up_artifact' in r);
});

test('route does not throw for missing optional fields', () => {
  assert.doesNotThrow(() => {
    route({
      scenario_class: 'pricing',
      stage: 'post_single',
      confidence_band: 'high',
      provider_availability: pa(['claude', 'gpt']),
    });
  });
});

// ---------------------------------------------------------------------------
// review_flag_family_count — cross-family confirmation policy
// ---------------------------------------------------------------------------

test('post_single: needs_human_review without review_flag_family_count infers count=1 (unconfirmed)', () => {
  const r = route(baseInput({
    scenario_class: 'pricing',
    stage: 'post_single',
    confidence_band: 'high',
    needs_human_review: true,
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  // Unconfirmed single-family flag → escalate to second judge, not human
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.DOUBLE_PANEL_RECOMMENDED);
  assert.ok(r.explanation.includes('second judge family'));
});

test('post_double: converged + review_flag_family_count=2 → not_ready / human_review_required', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'high',
    needs_human_review: true,
    review_flag_family_count: 2,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.HUMAN_REVIEW_REQUIRED);
  assert.equal(r.recommended_next_mode, null);
  assert.ok(r.explanation.includes('cross-family confirmed'));
});

test('post_double: converged + review flag + review_flag_family_count=1 (unconfirmed) → more_rigor / judge_recommended', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_double',
    confidence_band: 'high',
    needs_human_review: true,
    review_flag_family_count: 1,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.MORE_RIGOR_RECOMMENDED);
  assert.equal(r.ux_substate, UX_SUBSTATES.JUDGE_RECOMMENDED);
  assert.ok(r.explanation.includes('single-family'));
});

test('post_judge: needs_human_review + review_flag_family_count=2 → not_ready / human_review_required', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'high',
    needs_human_review: true,
    review_flag_family_count: 2,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.HUMAN_REVIEW_REQUIRED);
  assert.ok(r.explanation.includes('cross-family confirmed'));
});

test('post_judge: needs_human_review without review_flag_family_count → not_ready / needs_more_evidence (unconfirmed)', () => {
  const r = route(baseInput({
    scenario_class: 'governance',
    stage: 'post_judge',
    confidence_band: 'high',
    needs_human_review: true,
    panel_agreement: 'converged',
    provider_availability: pa(['claude', 'gpt', 'gemini']),
  }));
  // Default count=1 — not yet cross-family confirmed
  assert.equal(r.ux_state, UX_STATES.NOT_READY);
  assert.equal(r.ux_substate, UX_SUBSTATES.NEEDS_MORE_EVIDENCE);
  assert.ok(r.explanation.includes('single-family'));
});
