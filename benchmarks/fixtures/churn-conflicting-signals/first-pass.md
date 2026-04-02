# PRD: Churn Rescue Pilot

## Decision Frame

Recommendation: run a churn rescue pilot for high-risk accounts.

## Unknowns & Evidence Gaps

- We still need to isolate the highest-signal intervention.

## Pass/Fail Readiness

PASS because the pilot can be run without a broader strategy rewrite.

## Recommended Next Artifact

- Sprint plan for the rescue pilot instrumentation.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Churn Rescue Pilot",
    "status": "approved",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Run a churn rescue pilot for high-risk accounts.",
    "tradeoff": "Focused intervention now, but metric targets may diverge from top-level strategy.",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "Which intervention has the highest near-term retention effect."
  ],
  "pass_fail_readiness": {
    "status": "PASS",
    "reason": "The pilot is scoped well enough to execute."
  },
  "evidence": [
    {
      "evidence_id": "ev-churn-1",
      "kind": "metric",
      "source_ref": "retention-cohort-analysis",
      "confidence": "high",
      "supports": [
        "decision_frame.recommendation",
        "problem-churn",
        "metric-retention"
      ]
    }
  ],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-churn",
      "text": "High-risk accounts churn before the success team can intervene."
    },
    "customer_evidence_ids": ["ev-churn-1"],
    "success_metrics": [
      {
        "metric_id": "metric-retention",
        "name": "gross retention improvement",
        "segment": "high-risk accounts",
        "unit": "percent",
        "timeframe": "90 days",
        "baseline": 1,
        "target": 12,
        "evidence_ids": ["ev-churn-1"]
      }
    ],
    "scope": {
      "in": [
        "Risk scoring refresh",
        "Success-team intervention workflow"
      ],
      "out": [
        "Company-wide pricing changes"
      ]
    },
    "open_questions": [
      "Which intervention mix should the pilot test first?"
    ],
    "target_segment": "high-risk accounts"
  }
}
-->
