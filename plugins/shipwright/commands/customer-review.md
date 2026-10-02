---
name: customer-review
description: "Run a comprehensive customer intelligence review: feedback triage, journey mapping, churn analysis, and executive briefing."
---

Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file's path instead.

# /customer-review, Customer Intelligence Workflow

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Run this command to produce a comprehensive customer intelligence review that synthesizes feedback, maps the journey, analyzes retention, and produces an executive-ready briefing.

## Workflow Steps

### Step 1: Feedback Triage
Read and apply `skills/feedback-triage/SKILL.md`.

Ask the PM:
- What time period should we cover?
- Which feedback channels are available? (Support tickets, NPS, app reviews, feature requests, sales notes)
- Any specific themes or concerns to investigate?

Ingest, normalize, deduplicate, and cluster all available feedback into a prioritized taxonomy.

### Step 2: Customer Journey Mapping
Read and apply `skills/customer-journey-mapping/SKILL.md`.

Using the feedback clusters, map where pain concentrates across the customer journey:
- Which stages have the most friction?
- Where are the critical drop-off points?
- What are the moments of truth?

### Step 3: Churn Analysis
Read and apply `skills/churn-analysis/SKILL.md`.

Analyze retention patterns:
- What are the leading indicators of churn?
- What are the root causes by category?
- Where should retention interventions be focused?

### Step 4: Insight Synthesis
Cross-reference findings from feedback, journey, and churn analysis:
- What themes appear across all three lenses?
- What's the single biggest opportunity to improve customer outcomes?
- What's getting worse? What's getting better?

### Step 5: Executive Briefing
Pass the evidence and its limitations to cross-functional-liaison using the handoff envelope. Preserve research findings as findings; frame product actions as options requiring PM judgment.
Read and apply `skills/executive-briefing/SKILL.md`.

Produce a one-page executive summary using the SCR framework:
- Situation: Customer intelligence overview
- Complication: Top risks and emerging patterns
- Resolution: Evidence-backed findings and next investigation or decision needed

## Output

Produce a **Customer Intelligence Report** containing:
1. Feedback Triage (clusters, themes, priorities)
2. Journey Friction Map (pain points by stage)
3. Churn & Retention Analysis (root causes, risk signals)
4. Cross-Analysis Synthesis (integrated findings)
5. Executive Briefing (one-page SCR summary with recommended actions)
