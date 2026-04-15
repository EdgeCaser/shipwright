# PRD: [Feature Name TBD] — Decision-Stage Document

## Decision Frame

**Status:** Not ready for build. This PRD exists to structure what we know, surface what we don't, and define the cheapest path to a go/no-go decision.

**Trigger:** A proposed new feature has been raised for consideration. No strong quantitative or qualitative evidence currently supports the hypothesis that this feature will deliver measurable user or business value.

**Decision being made:** Should we invest further effort to gather evidence, and if so, what is the minimum viable investigation? Or should we shelve this proposal now?

**Stakeholders:** Product (owner), Engineering (feasibility), Design (desirability), Data/Analytics (evidence gathering)

**Key hypothesis:** The feature will [solve a specific user problem / drive a specific business metric]. This hypothesis is currently **unvalidated**.

### What we think we know

| Claim | Source | Strength | Notes |
|-------|--------|----------|-------|
| Users have expressed interest in this capability | Anecdotal (support tickets, sales calls) | Weak — no systematic count or segmentation | Could reflect vocal minority |
| Competitors offer something similar | Surface-level competitive scan | Weak — no analysis of adoption, satisfaction, or whether it drives switching | Feature existence ≠ feature success |
| Implementation is technically feasible | Eng gut check | Medium — no spike, no cost estimate | Feasibility ≠ desirability |

### What would make this a strong PRD

A strong PRD would include: validated user research (interviews, surveys with statistical significance), usage data from adjacent features, a quantified opportunity size, and at least one measurable success metric with a baseline. **None of these exist today.**

---

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before any build commitment)

1. **User demand signal:** Do users actually want this, or are we pattern-matching on noise? No systematic demand analysis has been performed.
   - *Evidence needed:* Structured interviews (n≥10 target segment), or survey data with >100 responses from active users.
   - *Cost to resolve:* 1-2 week discovery sprint (if pursued beyond triage — see Recommended Next Artifact).

2. **Problem severity:** Even if users mention the problem, is it painful enough to change behavior?
   - *Evidence needed:* Job-to-be-done analysis showing this ranks in top 3 unmet needs for a defined segment.
   - *Cost to resolve:* Can be combined with demand signal research.

3. **Opportunity size:** What is the addressable population, and what metric moves if we succeed?
   - *Evidence needed:* Segmentation data cross-referenced with activation/retention funnels.
   - *Cost to resolve:* 2-3 days of analytics work.

4. **Competitive differentiation:** If competitors already offer this, what is our right to win?
   - *Evidence needed:* Competitive teardown with user reaction testing.
   - *Cost to resolve:* 1 week.

### Secondary unknowns (resolve during design phase if we proceed)

5. **Technical cost:** No engineering spike has been performed. Estimated effort is a guess.
6. **Cannibalization risk:** Could this feature undermine existing workflows or metrics?
7. **Maintenance burden:** What is the ongoing cost to support this feature post-launch?

### Evidence inventory

| Evidence type | Available? | Quality |
|--------------|-----------|--------|
| User interviews | No | N/A |
| Survey data | No | N/A |
| Usage analytics for adjacent features | Unknown — not yet pulled | Unknown |
| Competitive analysis (deep) | No — only surface scan | Weak |
| Engineering spike / cost estimate | No | N/A |
| Business case / ROI model | No | N/A |

---

## Pass/Fail Readiness

### Readiness verdict: FAIL — Do not proceed to build

**Rationale:** This proposal fails the minimum evidence bar for a build commitment. Specifically:

- **No validated demand signal.** Anecdotal mentions do not meet the threshold for committing engineering resources. The risk of building something nobody uses is high.
- **No quantified opportunity.** Without knowing the addressable segment size or the metric we expect to move, we cannot prioritize this against other backlog items.
- **No cost estimate.** Without an engineering spike, we cannot assess ROI even if demand were validated.
- **No success criteria defined.** We have no baseline, no target, and no way to measure whether the feature succeeded post-launch.

### What would flip this to PASS

| Gate | Criteria | Current status |
|------|----------|---------------|
| Demand validation | ≥10 user interviews confirming problem resonance in target segment, OR survey with >30% of respondents ranking this in top 3 needs | ❌ Not started |
| Opportunity sizing | Addressable segment identified with estimated impact on a named metric (e.g., activation rate +X%, retention +Y%) | ❌ Not started |
| Feasibility spike | Engineering spike completed with t-shirt size estimate (S/M/L/XL) and identified risks | ❌ Not started |
| Success metric | Primary metric defined with baseline measurement and target threshold | ❌ Not started |

All four gates must pass before this PRD should be revisited for build approval.

---

## Recommended Next Artifact

### Staged approach: Triage before committing to a full discovery sprint

The critique correctly identified that recommending a 1-2 week discovery sprint as the immediate next step skips lighter-weight alternatives that could resolve the question faster and cheaper. Without segment definition, resource constraints, or even a confirmed telemetry baseline, prescribing a sprint is premature. The revised recommendation uses a staged approach:

#### Stage 0: Triage (1-3 days, minimal cost)

Before committing to any structured research, exhaust what is already available:

1. **Telemetry pull for adjacent features** — Query existing usage data for the 2-3 features closest to this proposal. Look for drop-off patterns, search queries, and segment-level behavior. If adjacent feature usage is negligible, this is a strong signal to shelve without further investment.
2. **Support/sales ticket audit** — Count and categorize existing mentions. If the anecdotal signal is <5 tickets in the last quarter with no segment pattern, shelve.
3. **Desk research on competitors** — Spend 2-4 hours documenting what competitors actually built, public reception (reviews, changelogs, community feedback), and any adoption signals. This costs nothing beyond researcher time.

**Decision point after triage:** If all three signals are weak or absent, **shelve the proposal immediately** and document the triage findings. No further investment warranted. If any signal shows promise (e.g., a clear segment pattern in support tickets, or meaningful usage of adjacent features), proceed to Stage 1.

#### Stage 1: Focused discovery sprint (1-2 weeks, if triage warrants)

Only if Stage 0 produces at least one promising signal:

1. **User research plan** — 10 structured interviews with the target segment identified during triage, focused on jobs-to-be-done. Interview guide should test problem severity, current workarounds, and willingness to adopt.
2. **Engineering spike** — Time-boxed to 2 days. Goal: t-shirt size estimate and identification of architectural blockers.
3. **Lightweight competitive teardown** — Expand desk research into a structured comparison if Stage 0 surfaced meaningful competitor adoption.

**Decision point after sprint:** Reconvene with evidence. If demand is validated and opportunity is sized, produce a full PRD v2 with success metrics, design requirements, and prioritization recommendation. If evidence is weak or contradictory, shelve the proposal and document learnings.

#### Why this staged approach

The original recommendation assumed a discovery sprint was the cheapest path, but that assumption was unsupported. A telemetry pull or ticket audit could take hours, not weeks, and may conclusively kill the proposal without any primary research. The sprint remains the right tool if triage is inconclusive or promising — but it should not be the default first move when zero-cost signals have not been checked.

### What this document is NOT

This is not a feature specification. It is not a commitment to build. It is a structured acknowledgment that we have an idea without evidence, and a concrete plan to either find that evidence or kill the idea cheaply. The most valuable outcome of this document may be the decision *not* to build.
