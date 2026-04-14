# PRD: [Proposed Feature] — Weak Evidence Gate Review

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering resources in building [Proposed Feature] given the current state of supporting evidence.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base is insufficient to justify a build decision. This PRD exists to make that insufficiency explicit and actionable, not to rationalize premature commitment.

**Stakeholders:** Product, Engineering, Design, Business Leadership

**Time horizon:** The investigation phase should produce a go/no-go recommendation within 4-6 weeks. A build decision made today would be premature.

### Why this feature is being considered
- An internal hypothesis exists that [Proposed Feature] would improve [target metric]
- Anecdotal signals (support tickets, sales call mentions, competitor launches) suggest possible demand
- No rigorous validation has been performed

### What would need to be true for this to succeed
1. Users actually experience the problem this feature solves (unvalidated)
2. This feature is the right solution shape for that problem (unvalidated)
3. The addressable segment is large enough to justify build cost (unquantified)
4. Users would adopt this feature over existing workarounds (unknown)
5. Building this does not create unacceptable technical debt or opportunity cost (unassessed)

---

## Unknowns & Evidence Gaps

| # | Unknown | Current Evidence | Evidence Strength | Required Evidence to Proceed | Investigation Method |
|---|---------|-----------------|-------------------|-----------------------------|-----------------------|
| U1 | Does the target user segment actually experience this pain point? | Anecdotal: ~3-5 support tickets mentioning adjacent frustration | **Very Weak** — small sample, no structured inquiry, mentions are adjacent not direct | Structured interviews with 10+ users from target segment confirming problem existence and frequency | User interviews with screening criteria |
| U2 | What is the frequency and severity of the problem? | None | **None** | Quantified frequency data (daily/weekly/monthly) and severity rating from affected users | Survey instrument after interview findings |
| U3 | What workarounds do users currently employ? | None | **None** | Catalog of current workarounds with effort/satisfaction ratings | Interview + workflow observation |
| U4 | Is this the right solution shape? | Internal brainstorm only | **Very Weak** — no user input on solution | Concept testing with 5+ users showing preference over status quo and workarounds | Prototype or concept test |
| U5 | What is the addressable segment size? | Rough estimate based on total user count | **Weak** — no segmentation analysis performed | Segment sizing from product analytics: users who exhibit proxy behaviors | Analytics query + cohort definition |
| U6 | What is the expected build cost? | None | **None** | Engineering estimate scoped to defined solution | Technical spike after solution shape validated |
| U7 | What is the opportunity cost? | None | **None** | Comparison against current roadmap priorities using consistent scoring | Prioritization framework evaluation |

### Evidence quality assessment
- **Hard evidence (quantitative, replicable):** None available
- **Soft evidence (qualitative, structured):** None available
- **Anecdotal evidence (unstructured, opportunistic):** Minimal — a handful of support tickets and internal intuition
- **Counter-evidence:** Not investigated — no disconfirming signals have been sought

### Risks of proceeding without evidence
1. **Build-measure-regret cycle:** Investing 4-8 engineering weeks in a feature that addresses a phantom problem
2. **Opportunity cost blindness:** Displacing higher-confidence roadmap items without comparative analysis
3. **Solution-first trap:** Anchoring on a specific implementation before understanding the problem space
4. **Confirmation bias:** Post-launch metrics may be interpreted to justify the investment regardless of actual impact

---

## Pass/Fail Readiness

### Readiness verdict: **FAIL — Not ready for build commitment**

| Readiness Criterion | Status | Rationale |
|---------------------|--------|-----------|
| Problem validated with target users | ❌ FAIL | No structured user research conducted |
| Problem frequency/severity quantified | ❌ FAIL | No data exists |
| Solution shape validated with users | ❌ FAIL | Internal ideation only |
| Addressable segment sized | ❌ FAIL | No segmentation analysis |
| Build cost estimated | ❌ FAIL | No engineering scoping performed |
| Opportunity cost assessed | ❌ FAIL | No comparative prioritization |
| Success metrics defined | ❌ FAIL | Cannot define meaningful metrics without validated problem |
| Counter-evidence sought | ❌ FAIL | No disconfirmation attempted |

**Summary:** 0 of 8 readiness criteria pass. This feature concept is at the hypothesis stage and requires structured investigation before any resource commitment is appropriate.

### What "ready" looks like
A go decision would require:
- At minimum: U1, U2, U3 resolved (problem exists, is frequent/severe enough, workarounds are insufficient)
- Ideally: U4, U5 also resolved (solution shape validated, segment sized)
- U6 and U7 can follow if the above gates pass

---

## Recommended Next Artifact

**Next artifact:** Discovery Research Plan

**Purpose:** Define and execute a structured investigation to resolve unknowns U1-U5 before revisiting the build decision.

### Proposed investigation sequence

1. **Week 1-2: Problem discovery interviews** (resolves U1, U2, U3)
   - Recruit 10-15 users from hypothesized target segment
   - Semi-structured interviews focused on workflow, pain points, current workarounds
   - Output: Problem validation report with frequency/severity data

2. **Week 2-3: Segment analysis** (resolves U5)
   - Define behavioral proxies for the target segment in product analytics
   - Size the segment and characterize engagement patterns
   - Output: Segment sizing memo

3. **Week 3-4: Solution concept testing** (resolves U4, contingent on U1 passing)
   - Only proceed if problem is validated
   - Low-fidelity concept test with 5-8 users from validated segment
   - Output: Solution validation summary

4. **Week 4-5: Revised PRD** (resolves U6, U7)
   - If problem and solution validated: engineering spike + opportunity cost assessment
   - Produce updated PRD with evidence-backed recommendations
   - Output: Go/No-Go PRD v2

### Kill criteria

The thresholds below are **provisional defaults** that must be calibrated before the investigation begins. They are not evidence-derived — no baselines, ROI models, or comparable prior decisions exist to anchor them. The first task of the investigation phase is to establish calibrated thresholds by:

1. **Pulling baseline incidence rates** from product analytics (e.g., what % of users exhibit proxy behaviors for this pain point today) so that interview hit-rates can be compared against a meaningful denominator
2. **Estimating minimum viable segment size** from unit economics: given expected build cost (U6) and target payback period, what adoption floor makes the feature ROI-positive?
3. **Reviewing comparable prior decisions** — what kill/proceed thresholds were used for the last 2-3 features that went through structured discovery, and what were their outcomes?

Until calibrated, the following serve as starting placeholders to prevent indefinite investigation. Stakeholders must ratify or revise these before Week 1 interviews begin:

- Fewer than 3 of 10 interviewed users confirm experiencing the problem → **abandon** *(placeholder — calibrate against base rate of problem mention in support data)*
- Problem frequency is less than weekly for affected users → **abandon** *(placeholder — calibrate against severity; infrequent but high-severity problems may still warrant investment)*
- Existing workarounds are rated satisfactory by >60% of affected users → **abandon** *(placeholder — calibrate against switching cost and workaround fragility)*
- Addressable segment is below the ROI-positive adoption floor → **abandon** *(replaces prior arbitrary <5% threshold; derived from unit economics once U6 is estimated)*

### Decision timeline
- **Pre-Week 1:** Stakeholder alignment on calibrated kill criteria
- **Week 5-6:** Present findings to stakeholders with go/no-go/pivot recommendation
- **No build work should begin before this gate**
