# Strategy: Pricing Reset with Partial Data

## Decision Frame

Recommendation: hold the packaging change until evidence improves.

## Unknowns & Evidence Gaps

- We only have partial willingness-to-pay interviews.
- Competitor packaging was sampled, not exhaustively mapped.

## Pass/Fail Readiness

FAIL because the current recommendation is still under-evidenced.

## Recommended Next Artifact

- Pricing research brief with a tighter interview plan.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "strategy",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "Strategy: Pricing Reset with Partial Data",
    "status": "in-review",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Hold the packaging change until willingness-to-pay evidence improves.",
    "tradeoff": "Slower monetization work now, lower reversal risk later.",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "How sensitive mid-market buyers are to seat minimums."
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "Evidence is still too thin for approval."
  },
  "evidence": [],
  "payload": {
    "vision": "Reach a packaging decision we can defend externally.",
    "context": {
      "current_state": {
        "product_stage": "growth"
      }
    },
    "primary_segment": "mid-market finance teams",
    "bets": [
      {
        "bet_id": "bet-delay-pricing-change",
        "name": "Delay packaging change",
        "thesis": "Waiting for better evidence reduces the odds of a pricing reversal.",
        "assumptions": [
          "The current sample is too small to defend a packaging move."
        ],
        "investment_level": "moderate",
        "success_metric": {
          "metric_id": "metric-win-rate",
          "name": "pilot close rate",
          "segment": "mid-market finance teams",
          "unit": "percent",
          "timeframe": "quarterly",
          "baseline": 18,
          "target": 22
        },
        "kill_criteria": "If additional interviews do not change the conclusion, revisit the hold decision.",
        "evidence_ids": []
      }
    ],
    "boundaries": {
      "not_doing": [
        "Immediate pricing rollout"
      ]
    },
    "review_cadence": {
      "weekly": "Review new interview signal.",
      "monthly": "Revisit packaging options.",
      "quarterly": "Reassess go-to-market pricing posture."
    }
  }
}
-->
