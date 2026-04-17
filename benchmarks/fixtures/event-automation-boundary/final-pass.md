# PRD: Event Automation Platform Phase 1

## Decision Frame

Recommendation: ship a bounded Phase 1 focused on WhatsApp intake, deterministic quote drafting, consistent artifact storage, tentative calendar holds, and human approval before any pricing commitment or send.

## Unknowns & Evidence Gaps

- Approval override policy still needs a follow-up decision log.
- Confidence thresholds for extraction handoff need operational tuning after launch.

## Pass/Fail Readiness

PASS because the first release now contains its automation boundary and keeps operational planning out of scope.

## Recommended Next Artifact

- Technical spec for WhatsApp intake, quote-run orchestration, and approval queue transitions.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Event Automation Platform Phase 1",
    "status": "approved",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship a bounded Phase 1 for intake, deterministic quote drafting, calendar holds, and human approval before any commitment.",
    "tradeoff": "Delivers faster operator value now by deferring production planning and negotiation automation to later phases.",
    "confidence": "high",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Approval override policy still needs a dedicated follow-up decision record.",
    "Low-confidence extraction thresholds should be tuned with live operator feedback."
  ],
  "pass_fail_readiness": {
    "status": "PASS",
    "reason": "Critical human-approval and scope-boundary findings are now resolved for Phase 1."
  },
  "evidence": [
    {
      "evidence_id": "ev-event-automation-1",
      "kind": "document",
      "source_ref": "event-automation-phase-1-spec",
      "confidence": "high",
      "supports": [
        "decision_frame.recommendation",
        "problem-event-ops-fragmentation",
        "metric-quote-turnaround"
      ]
    }
  ],
  "challenge_resolution": [
    {
      "finding_id": "finding-human-approval-boundary",
      "state": "resolved",
      "note": "Phase 1 now requires recorded human approval for pricing commitments, overrides, and final sends."
    },
    {
      "finding_id": "finding-phase1-scope-creep",
      "state": "resolved",
      "note": "Production planning and purchasing automation are explicitly deferred beyond Phase 1."
    }
  ],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-event-ops-fragmentation",
      "text": "Event teams rely on fragmented tools and manual follow-up for intake, quoting, and execution coordination."
    },
    "customer_evidence_ids": ["ev-event-automation-1"],
    "success_metrics": [
      {
        "metric_id": "metric-quote-turnaround",
        "name": "draft quote turnaround time",
        "segment": "event sales leads",
        "unit": "hours",
        "timeframe": "7 days",
        "baseline": 6,
        "target": 1,
        "evidence_ids": ["ev-event-automation-1"]
      }
    ],
    "scope": {
      "in": [
        "WhatsApp intake assistant",
        "Deterministic quote draft generation",
        "Consistent Drive artifact storage",
        "Tentative calendar holds",
        "Approval queue with explicit human action"
      ],
      "out": [
        "Production planning automation",
        "Purchasing automation",
        "Automated pricing commitments",
        "Final quote sending without recorded human approval"
      ]
    },
    "open_questions": [
      "Which user role owns approval overrides in the first release?",
      "What confidence threshold should force human handoff on ambiguous extraction?"
    ],
    "target_segment": "catering and event operations teams"
  }
}
-->
