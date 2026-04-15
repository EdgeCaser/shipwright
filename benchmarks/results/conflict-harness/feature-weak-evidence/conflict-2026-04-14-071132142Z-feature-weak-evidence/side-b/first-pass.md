# PRD: [Proposed Feature] — Weak-Evidence Assessment

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources in building [Proposed Feature] given the current state of supporting evidence.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base is insufficient to justify a build decision. This PRD exists to make that insufficiency explicit and actionable, not to advocate for the feature.

**Stakeholder context:**
- Product leadership needs to decide whether this feature enters the roadmap or the research backlog.
- Engineering needs clarity on whether to begin scoping or stand down.
- The honest answer right now is: we do not have the evidence to commit resources.

**What this PRD is NOT:**
This is not a feature spec. It is a structured assessment of readiness. A feature spec would be premature given current evidence levels.

---

## Unknowns & Evidence Gaps

### Evidence Inventory

| Signal Category | What We Have | Strength | What We Need |
|---|---|---|---|
| **User demand** | No direct user requests; no support tickets referencing this gap | ❌ None | Discovery interviews (n≥8) with target segment confirming the problem exists |
| **Quantitative signal** | No usage data, no funnel analysis, no A/B test results | ❌ None | Instrumented prototype or painted-door test measuring intent |
| **Competitive pressure** | Anecdotal awareness that competitors may offer something similar; no structured analysis | ⚠️ Weak | Competitive audit with feature-level comparison across top 5 competitors |
| **Strategic alignment** | Feature loosely maps to a company OKR theme, but no explicit sponsorship | ⚠️ Weak | Executive sponsor who commits this to a specific OKR with success criteria |
| **Technical feasibility** | No spike, no architecture review, no cost estimate | ❌ None | Engineering spike (≤3 days) producing effort estimate and risk assessment |
| **Business case** | No revenue model, no retention impact estimate, no cost-benefit analysis | ❌ None | Back-of-envelope model showing unit economics or retention lift required to justify investment |

### Critical Unknowns (must resolve before any build decision)

1. **Does the problem actually exist for our users?** We have zero first-party evidence that users experience the pain this feature would address. The feature idea originated internally without customer validation.

2. **If the problem exists, is it severe enough to change behavior?** Even confirmed problems may not be worth solving if users have adequate workarounds or if the pain is low-frequency.

3. **What is the opportunity cost?** Every sprint spent on this feature is a sprint not spent on validated priorities. Without evidence, we cannot compare this feature's expected value against the current backlog.

4. **What are the technical costs and risks?** No engineering assessment has been performed. The feature may require infrastructure changes, introduce new failure modes, or create maintenance burden that outlasts any benefit.

---

## Pass/Fail Readiness

### Readiness Gate Assessment

| Gate | Status | Verdict |
|---|---|---|
| Problem validated with target users | Not started | ❌ FAIL |
| Quantitative signal (usage data, survey, or experiment) | Not started | ❌ FAIL |
| Executive sponsor identified | Not confirmed | ❌ FAIL |
| Engineering feasibility assessed | Not started | ❌ FAIL |
| Business case modeled | Not started | ❌ FAIL |
| Competitive necessity confirmed | Anecdotal only | ❌ FAIL |

**Overall Readiness: FAIL — 0 of 6 gates passed.**

This feature fails every readiness gate. Proceeding to build would be investing based on assumption alone. The responsible action is to move this to a structured investigation track.

### What "passing" would look like

Minimum evidence threshold to reconsider a build decision:
- ≥6 of 8 discovery interviews confirm the problem exists AND is top-3 priority for the user
- A painted-door test or instrumented prototype shows ≥15% click-through intent
- Engineering spike confirms feasibility within 1 sprint of build effort
- A business case shows plausible path to [specific metric] improvement of ≥X%

If investigation produces this evidence, a new PRD should be drafted — not this one amended.

---

## Recommended Next Artifact

**Recommended artifact:** Discovery Research Brief

**Scope:** A 2-week, low-cost investigation to determine whether this feature idea has any evidentiary basis worth pursuing.

**Deliverables:**
1. **User discovery interviews** (n=8-10) with target segment, focused on problem validation (not solution validation). Interview guide should avoid leading questions about the proposed feature.
2. **Competitive audit** — structured comparison of top 5 competitors on this capability. Document what exists, adoption signals, and whether competitive pressure is real or perceived.
3. **Painted-door test design** — if interviews suggest the problem is real, design a low-cost experiment (fake feature entry point, survey intercept, or concierge MVP) to measure quantitative intent.
4. **Go/No-Go recommendation** — synthesize findings into a clear recommendation with evidence citations.

**What this investigation should NOT do:**
- Design the solution (premature without problem validation)
- Estimate engineering effort (premature without confirming we should build anything)
- Commit to a timeline (there is nothing to timeline yet)

**Estimated cost:** ~2 weeks of 1 PM/researcher's time. No engineering resources required at this stage.

**Decision point:** After the Discovery Research Brief is complete, reconvene to assess whether evidence clears the readiness gates above. If yes, draft a proper PRD with solution design. If no, archive the idea with documented reasoning.

---

## Appendix: Why This PRD Looks Different

A conventional PRD assumes the decision to build has been made and focuses on what to build. This PRD cannot do that honestly because the evidence does not support a build decision. Rather than fabricate confidence or pad weak signals into a false narrative of demand, this document makes the evidence gaps explicit and recommends the cheapest path to resolving them.

This is the correct artifact for this stage of the decision process. Skipping investigation and jumping to a build PRD would be the most expensive way to learn what a 2-week discovery sprint can tell us for nearly free.
