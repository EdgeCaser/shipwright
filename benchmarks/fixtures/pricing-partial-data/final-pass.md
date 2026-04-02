# Strategy: Pricing Reset with Partial Data

## Decision Frame

Recommendation: hold the packaging change until evidence improves.

## Unknowns & Evidence Gaps

- We still need more pricing interviews before approving a rollout decision.

## Pass/Fail Readiness

FAIL because the data is still incomplete for approval.

## Recommended Next Artifact

- Pricing research brief with a fixed interview and survey plan.

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "strategy",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "Strategy: Pricing Reset with Partial Data",
    "status": "approved",
    "authors": ["Shipwright"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Hold the packaging change until willingness-to-pay evidence improves.",
    "tradeoff": "Protects credibility with sales and finance at the cost of slower monetization work.",
    "confidence": "high",
    "owner": "PM",
    "decision_date": "2026-04-02"
  },
  "unknowns": [
    "We still need more interview coverage before revisiting approval."
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "The recommendation is usable and explicit, but not yet approval-ready."
  },
  "evidence": [
    {
      "evidence_id": "ev-pricing-1",
      "kind": "research",
      "source_ref": "pricing-interview-sample",
      "confidence": "medium",
      "supports": [
        "decision_frame.recommendation",
        "bet-delay-pricing-change"
      ]
    }
  ],
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
        "kill_criteria": "If additional interviews still support waiting, keep the hold decision in place.",
        "evidence_ids": ["ev-pricing-1"]
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
