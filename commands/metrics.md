---
name: metrics
description: "Design a metrics framework: North Star, input metrics, guardrails, and a dashboard spec."
---

# /metrics - Metrics Framework Workflow

Run this command to build a complete metrics architecture from North Star down to operational dashboards.

## Workflow Steps

### Step 1: Define the North Star
Read and apply the framework from `/skills/measurement/metrics-dashboard/SKILL.md`.

Ask the PM:
- What is the single metric that best captures the value your product delivers to customers?
- What is its current value and target?
- How frequently can you measure it?

### Step 2: Map Input Metrics
Identify the 3-5 input metrics that drive the North Star. For each:
- What behavior or outcome does it measure?
- Who on the team can influence it?
- What's the current value and target?

### Step 3: Set Guardrails and Counter-Metrics
For each input metric, define:
- A guardrail metric that prevents gaming (e.g., if input is "signups," guardrail is "activation rate")
- Acceptable ranges and alert thresholds

### Step 4: Dashboard Spec
Produce a dashboard specification:
- Which metrics appear on the top-level view vs. drill-down
- Update frequency (real-time, daily, weekly)
- Segments to break down by (plan tier, geography, cohort, platform)
- Who the primary audience is for each view

## Output

Produce a **Metrics Framework Document** containing:
1. North Star metric with rationale
2. Input metrics tree (what drives the North Star)
3. Guardrails and counter-metrics
4. Dashboard specification ready for an analyst or engineer to build
