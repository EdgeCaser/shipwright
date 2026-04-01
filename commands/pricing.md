---
name: pricing
description: "Build a complete pricing strategy in two phases: evidence first, then value metric, model, packaging, and validation decisions."
---

# /pricing — Pricing Strategy Workflow

Run this command to develop or evaluate a pricing strategy end-to-end.

When fresh external pricing evidence is needed, do not jump straight into recommendations. Start with a bounded evidence pass, then synthesize the strategy from that evidence.

## Workflow Steps

### Phase 1: Evidence Basis

### Step 1: Define the Pricing Decision
Read and apply `/skills/pricing/pricing-strategy/SKILL.md`.

Ask the PM:
- Is this pricing for a new product or a revision of existing pricing?
- What are you optimizing for? (Revenue, adoption, competitive positioning, expansion)
- What's the current pricing situation? (Model, price points, ARPU, conversion rates)

Produce a short decision brief covering:
- the pricing question to answer
- the buyer and segment in scope
- whether fresh external pricing evidence is required or existing evidence is sufficient

### Step 2: Collect Pricing Evidence
If fresh public-web evidence is required, use the local research collector first and only use interactive browsing for unresolved gaps.

Read and apply `/skills/discovery/competitive-landscape/SKILL.md` with a pricing focus.

Produce an evidence basis containing:
- competitor pricing models and price points
- free tier or trial structure
- packaging patterns and upgrade triggers
- major evidence gaps
- a short retrieval trace noting whether the collector was used, whether it reported a cache hit/miss/refresh, and whether any interactive follow-up was needed

If the PM already has current pricing evidence, skip the public-web pass and cite the supplied inputs instead.

### Phase 2: Strategy Synthesis

### Step 3: Identify the Value Metric
Analyze candidate value metrics (what you charge for) against four criteria: scales with value, easy to understand, predictable for buyer, grows with usage.

Recommend the best value metric with rationale.

### Step 4: Compare Pricing Models
Evaluate per-seat, usage-based, flat-rate, tiered, freemium, and hybrid models against the product's characteristics and objectives.

### Step 5: Synthesize Competitive Pricing Constraints
Translate the evidence basis into pricing implications:
- where the market clusters today
- whether premium, parity, or penetration pricing is plausible
- what evidence-backed constraints should shape the recommendation

### Step 6: Design WTP Research
Design a Van Westendorp or Gabor-Granger study to validate price points with target customers.

### Step 7: Build the Packaging
Design tier structure with feature gating, upgrade triggers, and a free tier (if applicable).

### Step 8: Design Validation Experiment
Read and apply `/skills/pricing/monetization-experiments/SKILL.md`.

Design a controlled experiment to test the pricing in-market: hypothesis, variants, metrics, guardrails, rollout plan.

## Output

Produce a **Pricing Strategy Document** containing:
1. Pricing Objectives & Current State
2. Evidence Basis & Retrieval Trace
3. Value Metric Recommendation
4. Model Comparison & Recommendation
5. Competitive Pricing Constraints & Positioning Implications
6. WTP Research Plan
7. Packaging Design (tiers, features, upgrade triggers)
8. Validation Experiment Plan
