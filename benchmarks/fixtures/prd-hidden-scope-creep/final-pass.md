# PRD: Team Inbox Workflow Handoff

## Decision Frame

Recommendation: ship the workflow handoff improvement with a limited rollout.

## Unknowns & Evidence Gaps

- Manager routing is explicitly deferred from v1.
- Escalation ownership still needs a follow-up decision log.

## Pass/Fail Readiness

PASS because the hidden scope is now contained.

## Recommended Next Artifact

- Technical handoff for workflow audit trail delivery.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Team Inbox Workflow Handoff",
    "status": "approved",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship a limited workflow handoff release for support teams.",
    "tradeoff": "Keeps v1 shippable now by explicitly excluding manager routing.",
    "confidence": "high",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Manager routing remains a separate follow-up initiative."
  ],
  "pass_fail_readiness": {
    "status": "PASS",
    "reason": "Critical scope finding has been resolved and v1 boundaries are explicit."
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
  "challenge_resolution": [
    {
      "finding_id": "finding-scope-creep",
      "state": "resolved",
      "note": "Manager routing is explicitly marked out of scope for v1."
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
        "Manager routing controls",
        "Manager escalation exceptions"
      ]
    },
    "open_questions": [
      "What owner should pick up manager routing in the follow-up cycle?"
    ],
    "target_segment": "mid-market support teams"
  }
}
-->
