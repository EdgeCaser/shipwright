# PRD: Event Automation Platform Phase 1

## Decision Frame

Recommendation: ship a broad Phase 1 that covers intake, quote drafting, calendar holds, and downstream operational planning from the same assistant flow.

## Unknowns & Evidence Gaps

- Ownership of approval overrides is still vague.
- The first release does not yet prove where deterministic rules should stop and where LLM behavior should stop.

## Pass/Fail Readiness

FAIL until the approval and scope boundaries are contained.

## Recommended Next Artifact

- Technical spec for the WhatsApp workflow and queue service.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Event Automation Platform Phase 1",
    "status": "in-review",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship a broad Phase 1 that covers intake, quote drafting, calendar holds, and operational planning in one assistant-led release.",
    "tradeoff": "Creates a more impressive first release, but blurs human approval boundaries and expands scope beyond a safe first phase.",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Approval override ownership is not yet explicit.",
    "The deterministic versus LLM boundary is still too broad."
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "Critical challenge findings are still unresolved."
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
        "Quote draft generation",
        "Tentative calendar holds",
        "Production planning packet generation"
      ],
      "out": [
        "Fully automated client approval"
      ]
    },
    "open_questions": [
      "Which role can override pricing logic in the first release?",
      "Should operational planning be part of the first delivery or a later phase?"
    ],
    "target_segment": "catering and event operations teams"
  }
}
-->
