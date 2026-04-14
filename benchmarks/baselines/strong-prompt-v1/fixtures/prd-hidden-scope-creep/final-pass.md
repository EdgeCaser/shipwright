# PRD: Team Inbox Workflow Handoff Improvement

Use this file as the revision shell for the `strong-prompt-v1` final pass.

Instructions for the baseline model:
- Start from the saved first pass.
- Strengthen clarity, internal consistency, and scope discipline.
- Remove vague or inflated claims.
- Keep weak evidence explicit instead of smoothing it over.
- The final saved artifact must not include this instruction block.

## Problem Statement

REPLACE_WITH_REVISED_PROBLEM_STATEMENT

## Goals

- REPLACE_WITH_REVISED_GOAL
- REPLACE_WITH_REVISED_GOAL

## Non-Goals

- REPLACE_WITH_REVISED_NON_GOAL
- REPLACE_WITH_REVISED_NON_GOAL

## Proposed Solution

REPLACE_WITH_REVISED_SOLUTION

## Scope

### In Scope

- REPLACE_WITH_REVISED_SCOPE_ITEM
- REPLACE_WITH_REVISED_SCOPE_ITEM

### Out of Scope

- REPLACE_WITH_REVISED_OUT_OF_SCOPE_ITEM
- REPLACE_WITH_REVISED_OUT_OF_SCOPE_ITEM

## Success Metrics

| Metric | Baseline | Target | Timeframe | Evidence Note |
|---|---:|---:|---|---|
| REPLACE_WITH_REVISED_METRIC | REPLACE_ME | REPLACE_ME | REPLACE_ME | REPLACE_ME |

## Risks And Dependencies

- REPLACE_WITH_REVISED_RISK
- REPLACE_WITH_REVISED_DEPENDENCY

## Decision Frame

Recommendation: REPLACE_WITH_REVISED_RECOMMENDATION

Trade-off: REPLACE_WITH_REVISED_TRADEOFF

Confidence: REPLACE_ME

Owner: PM

Decision date: 2026-04-02

## Unknowns & Evidence Gaps

- REPLACE_WITH_REVISED_UNKNOWN
- REPLACE_WITH_REVISED_UNKNOWN

## Pass/Fail Readiness

REPLACE_ME because REPLACE_WITH_REVISED_REASON

## Recommended Next Artifact

- REPLACE_WITH_REVISED_NEXT_ARTIFACT

<!-- shipwright:artifact
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "rigorous",
  "depth": "standard",
  "metadata": {
    "title": "PRD: Team Inbox Workflow Handoff Improvement",
    "status": "draft",
    "authors": ["strong-prompt-v1"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "REPLACE_WITH_REVISED_RECOMMENDATION",
    "tradeoff": "REPLACE_WITH_REVISED_TRADEOFF",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02",
    "assumption": true
  },
  "unknowns": [
    "REPLACE_WITH_REVISED_UNKNOWN",
    "REPLACE_WITH_REVISED_UNKNOWN"
  ],
  "pass_fail_readiness": {
    "status": "FAIL",
    "reason": "REPLACE_WITH_REVISED_REASON"
  },
  "evidence": [
    {
      "evidence_id": "ev-1",
      "kind": "assumption",
      "source_ref": "scenario-prompt",
      "confidence": "low",
      "supports": [
        "decision_frame.recommendation",
        "problem-team-inbox-handoff",
        "metric-handoff-completion"
      ]
    }
  ],
  "payload": {
    "problem_statement": {
      "problem_id": "problem-team-inbox-handoff",
      "text": "REPLACE_WITH_REVISED_PROBLEM_STATEMENT",
      "assumption": true
    },
    "customer_evidence_ids": [
      "ev-1"
    ],
    "success_metrics": [
      {
        "metric_id": "metric-handoff-completion",
        "name": "handoff completion rate",
        "segment": "teams using shared inbox handoffs",
        "unit": "percent",
        "timeframe": "30 days",
        "baseline": "unknown",
        "target": "REPLACE_ME",
        "evidence_ids": [
          "ev-1"
        ],
        "assumption": true,
        "explanation": "Scenario does not provide hard baseline evidence."
      }
    ],
    "scope": {
      "in": [
        "REPLACE_WITH_REVISED_SCOPE_ITEM",
        "REPLACE_WITH_REVISED_SCOPE_ITEM"
      ],
      "out": [
        "REPLACE_WITH_REVISED_OUT_OF_SCOPE_ITEM",
        "REPLACE_WITH_REVISED_OUT_OF_SCOPE_ITEM"
      ]
    },
    "open_questions": [
      "REPLACE_WITH_REVISED_UNKNOWN",
      "REPLACE_WITH_REVISED_UNKNOWN"
    ],
    "target_segment": "teams using shared inbox handoffs"
  }
}
-->
