# PRD: Insight Feed

## Decision Frame

Recommendation: build an insight feed for account managers.

## Unknowns & Evidence Gaps

- User demand is still mostly anecdotal.
- We still lack workflow evidence from live interviews.

## Pass/Fail Readiness

FAIL because the evidence base is still weak.

## Recommended Next Artifact

- Discovery interview prep for account managers.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "fast",
  "depth": "light",
  "metadata": {
    "title": "PRD: Insight Feed",
    "status": "draft",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Build an insight feed for account managers.",
    "tradeoff": "Potentially helpful workflow support, but evidence is still weak.",
    "confidence": "low",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Which workflow problem matters most to account managers."
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "The artifact is still not evidence-backed."
  },
  "evidence": [],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-insight-feed",
      "text": "Account managers do not have a single place to review customer signals."
    },
    "customer_evidence_ids": [],
    "success_metrics": [
      {
        "metric_id": "metric-dau",
        "name": "weekly active account managers",
        "segment": "account managers",
        "unit": "percent",
        "timeframe": "30 days",
        "baseline": 0,
        "target": 35,
        "evidence_ids": []
      }
    ],
    "scope": {
      "in": [
        "Signal feed prototype"
      ],
      "out": [
        "Full account planning workflow"
      ]
    },
    "open_questions": [
      "Which signals should appear in the first prototype?"
    ],
    "target_segment": "account managers"
  }
}
-->
