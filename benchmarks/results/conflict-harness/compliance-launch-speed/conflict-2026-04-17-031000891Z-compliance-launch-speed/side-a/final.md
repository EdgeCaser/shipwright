# PRD: Payment Disbursement Feature
**Status:** Blocked — Launch Condition Unmet
**Prepared for:** Executive Decision
**Horizon:** Q2 (10 weeks remaining)

---

## Decision Frame

This PRD documents a payment disbursement feature publicly committed to enterprise customers for Q2 delivery. A hard constraint has emerged: Legal has confirmed the feature requires a minimum 14-week regulatory compliance review under current process. Q2 ends in 10 weeks. This is a 4-week shortfall with no approved remediation path.

**The decision this PRD is designed to support is not "how do we ship by Q2" — it is "what is the right response to a commitment made without full compliance information."**

Three structurally distinct paths exist:

1. **Renegotiate the commitment.** Engage enterprise customers now with a revised timeline (Q3 at earliest, pending review start date). Preserves legal standing. Damages short-term relationship capital.

2. **Pursue expedited review.** Determine whether the 14-week floor is a process constraint or a regulatory floor. If process-driven, assess whether a parallel-track or scoped review can compress the timeline without waiving material review steps. This requires immediate Legal engagement — it is not assumed feasible.

3. **Launch a scoped version exempt from the review.** Evaluate whether a reduced feature scope (e.g., disbursement to existing verified accounts only, below a regulatory threshold) is genuinely exempt from the review requirement. Legal must confirm scope, not product. This is not a workaround — it is a different feature with different compliance status.

**What is not a path:** Skipping or shortcutting the review. Legal has confirmed this creates material legal exposure. This PRD does not treat that as a lever.

---

## Unknowns & Evidence Gaps

The following unknowns block confident path selection. Each must be resolved before a launch plan can be committed.

| Unknown | Why It Matters | Owner |
|---|---|---|
| Is the 14-week minimum a regulatory floor or an internal process artifact? | If process-driven, expedited review may be possible. If regulatory, no compression is available. | Legal |
| What is the exact scope of the committed feature? | A scope reduction may yield a genuinely exempt variant. Without the commitment language, this cannot be assessed. | Product + Legal |
| What are the contractual consequences of a Q2 miss? | Customer relationship damage is not equivalent to contractual breach. The severity of renegotiation depends on contract terms. | Legal + Sales |
| Have enterprise customers been informed of the compliance dependency? | If not, early disclosure changes the renegotiation dynamic. Delay in disclosure increases reputational risk. | Sales + Exec |
| When does the compliance review clock start, and has it been initiated? | A review started now finishes in 14 weeks. Every week of delay extends the actual ship date. | Legal + Engineering |

**No quantitative estimates (cost of delay, probability of expedited approval, customer churn risk) are available in evidence. Decisions should not be made on invented figures.**

---

## Pass/Fail Readiness

This section scores the feature against the minimum conditions required to proceed toward any launch path.

| Condition | Status | Blocker? |
|---|---|---|
| Compliance review initiated | Unknown — not confirmed | Yes |
| Regulatory scope confirmed by Legal | Not confirmed | Yes |
| Customer commitment language reviewed | Not completed | Yes |
| Contractual miss consequences assessed | Not completed | Yes |
| Executive decision on path (renegotiate / expedite / scope-reduce) | Not made | Yes |
| Engineering readiness for feature build | Not assessed in this PRD | No (premature) |

**Current readiness verdict: NOT READY TO PROCEED.** No launch path is available until the five blocking conditions above are resolved. Engineering work may proceed in parallel only if the feature scope is stable — which it is not until Legal confirms the compliance boundary.

---

## Recommended Next Artifact

This PRD serves as the decision-framing document. It blocks launch, names the open questions, and identifies the three candidate paths. It does not require a separately-typed artifact to accomplish that function.

The sequencing of next artifacts depends on which actions the executive team takes after reading this document:

**If Legal engagement happens immediately (recommended):** The next formal artifact is an **Executive Decision Memo** — presenting the three paths above with Legal's updated constraints, contractual exposure from Sales/Legal review, and a recommended path with rationale. That memo resolves the Q2 question. It is the decision artifact; this PRD is the blocking artifact.

**If path selected is renegotiation or scope-reduce:** A **Customer Communication Plan** — drafted by Sales with Legal review before any outbound contact with enterprise customers.

**If expedited review is confirmed feasible:** A revised PRD with a compliant launch gating plan, updated timeline, and pass/fail criteria tied to review completion.

**What this PRD is not:** A launch specification. A standard feature PRD (requirements, acceptance criteria, rollout plan) is appropriate only after a compliant launch path has been confirmed by Legal. Producing that artifact now would be premature and would misrepresent the feature's readiness state.

