# PRD: Team Inbox Workflow Handoff

## Decision Frame

Recommendation: ship the workflow handoff improvement with a limited rollout.

## Unknowns & Evidence Gaps

- Manager routing rules are still ambiguous.
- Engineering ownership of escalation handling is not explicit.

## Pass/Fail Readiness

FAIL until the scope challenge is resolved.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Team Inbox Workflow Handoff",
    "status": "in-review",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship a limited workflow handoff release for support teams.",
    "tradeoff": "Faster operator value now, but unresolved routing scope can spill into engineering work.",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Manager routing behavior is still unclear.",
    "Escalation ownership is not explicit."
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "Challenge findings are still unresolved."
  },
  "evidence": [
    {
      "evidence_id": "ev-prd-1",
      "kind": "document",
      "source_ref": "support-workflow-audit",
      "confidence": "high",
      "supports": [
        "decision_frame.recommendation",
        "problem-handoff",
        "metric-handoff-rate"
      ]
    }
  ],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-handoff",
      "text": "Support teams cannot complete inbox workflow handoff without manual follow-up."
    },
    "customer_evidence_ids": ["ev-prd-1"],
    "success_metrics": [
      {
        "metric_id": "metric-handoff-rate",
        "name": "workflow handoff completion rate",
        "segment": "mid-market support teams",
        "unit": "percent",
        "timeframe": "30 days",
        "baseline": 42,
        "target": 65,
        "evidence_ids": ["ev-prd-1"]
      }
    ],
    "scope": {
      "in": [
        "Agent handoff trigger",
        "Shared workflow audit trail"
      ],
      "out": [
        "Manager routing controls"
      ]
    },
    "open_questions": [
      "How should manager escalation exceptions be handled?"
    ],
    "target_segment": "mid-market support teams"
  }
}
-->
