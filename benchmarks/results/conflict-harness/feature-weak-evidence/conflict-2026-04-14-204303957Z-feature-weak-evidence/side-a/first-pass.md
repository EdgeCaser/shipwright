# PRD: [Proposed Feature — Insufficient Evidence to Name]

## Decision Frame

**What decision does this PRD support?** Whether to invest discovery resources into defining and validating a new feature, given that no supporting evidence currently exists.

**Current state:** No user research, usage data, competitive analysis, or stakeholder input has been provided to justify this feature. The PRD is being drafted against an empty evidence base.

**Decision options:**
1. **Do not proceed** — Return to discovery. No feature should advance past ideation without at least one validated signal.
2. **Proceed to evidence-gathering sprint** — Time-box 2 weeks to collect minimum viable evidence before re-evaluating.
3. **Proceed to build (not recommended)** — Ship without evidence. High risk of waste.

**Recommendation:** Option 2 — run a structured evidence-gathering sprint before any further PRD refinement.

---

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Required Evidence | Current Status | Severity |
|--------|---------|-------------------|----------------|----------|
| G-1 | Who is the target user? | User segment definition, persona interviews (n≥5) | **Missing entirely** | Critical |
| G-2 | What problem does this solve? | Problem statements validated by user research or support data | **Missing entirely** | Critical |
| G-3 | How large is the affected population? | Usage analytics, TAM/SAM sizing, or support ticket volume | **Missing entirely** | Critical |
| G-4 | What is the expected business impact? | Revenue model, retention impact estimate, or cost-avoidance projection | **Missing entirely** | High |
| G-5 | Are there existing workarounds? | Competitive audit, user behavior analysis | **Missing entirely** | High |
| G-6 | What is the technical feasibility? | Engineering spike or architecture review | **Missing entirely** | Medium |
| G-7 | What are the risks of building this? | Risk register, dependency map | **Missing entirely** | Medium |

**Evidence quality assessment:** Zero of seven critical-to-high gaps have any evidence. This PRD cannot responsibly recommend proceeding to design or engineering.

---

## Pass/Fail Readiness

### Readiness Gate Checklist

| Gate | Criterion | Status | Verdict |
|------|-----------|--------|---------|
| 1 | At least one validated user need | No evidence | **FAIL** |
| 2 | Quantified addressable population | No evidence | **FAIL** |
| 3 | Business case with stated assumptions | No evidence | **FAIL** |
| 4 | Technical feasibility assessed | No evidence | **FAIL** |
| 5 | Risk/downside bounded | No evidence | **FAIL** |

**Overall Readiness: FAIL — 0/5 gates passed.**

This feature is not ready for prioritization, design, or engineering investment. Advancing it in this state would violate basic product discipline and risk building something nobody needs.

---

## Recommended Next Artifact

**Next artifact:** Discovery Brief (not a fuller PRD)

**Why not a PRD?** A PRD presupposes enough evidence to define requirements. We have none. The correct next step is upstream of the PRD.

**Discovery Brief scope:**
1. **Hypothesis statement** — Articulate the falsifiable hypothesis this feature rests on ("We believe [user segment] struggles with [problem] and would [behavior change] if we built [solution]")
2. **Evidence collection plan** — 5 user interviews, 1 competitive scan, 1 data pull from existing analytics
3. **Kill criteria** — Pre-commit to what evidence would cause us to abandon this feature (e.g., fewer than 2/5 interviewees report the problem unprompted)
4. **Time box** — 2-week sprint with go/no-go checkpoint

**If discovery succeeds:** Return to PRD with validated inputs for gaps G-1 through G-5 at minimum.

**If discovery fails:** Archive this PRD as a record of the investigation. No further investment.

---

*This PRD is intentionally sparse because honesty about evidence gaps is more valuable than fabricating justifications. A PRD built on weak evidence is worse than no PRD — it creates false confidence and wastes downstream effort.*
