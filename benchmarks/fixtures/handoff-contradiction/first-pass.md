# PRD: Platform Handoff Alignment

## Decision Frame

Recommendation: ship the first platform handoff artifact for self-serve SMB teams.

## Unknowns & Evidence Gaps

- Observability coverage is still narrower than ideal.

## Pass/Fail Readiness

PASS because the handoff can proceed while follow-up risk remains explicit.

## Recommended Next Artifact

- Technical spec for the platform event stream.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Platform Handoff Alignment",
    "status": "approved",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship the first platform handoff artifact for self-serve SMB teams.",
    "tradeoff": "Moves faster on a smaller segment, but risks drifting from platform strategy and challenge findings.",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Observability is not yet complete for every handoff branch."
  ],
  "pass_fail_readiness": {
    "status": "PASS",
    "reason": "The handoff is usable even though a few non-blocking contradictions remain."
  },
  "evidence": [
    {
      "evidence_id": "ev-handoff-1",
      "kind": "document",
      "source_ref": "platform-handoff-design",
      "confidence": "medium",
      "supports": [
        "decision_frame.recommendation",
        "problem-platform-handoff",
        "metric-platform-success"
      ]
    }
  ],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-platform-handoff",
      "text": "Platform teams lack a shared handoff contract for workflow events."
    },
    "customer_evidence_ids": ["ev-handoff-1"],
    "success_metrics": [
      {
        "metric_id": "metric-platform-success",
        "name": "handoff success rate",
        "segment": "smb self-serve",
        "unit": "percent",
        "timeframe": "30 days",
        "baseline": 71,
        "target": 85,
        "evidence_ids": ["ev-handoff-1"]
      }
    ],
    "scope": {
      "in": [
        "Shared event contract",
        "Fallback retry policy"
      ],
      "out": [
        "Admin migration tooling"
      ]
    },
    "open_questions": [
      "Which fallback path should get the first operational dashboard?"
    ],
    "target_segment": "smb self-serve"
  }
}
-->
