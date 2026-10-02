# Golden Output: Adversarial Review

**Skill:** `adversarial-review`
**Framework:** 5-vector sweep (Evidence Integrity, Decision Courage, Scope Discipline, Specificity, Structural Honesty) with Challenge Report verdict
**Product context:** ComplianceOS --- B2B SaaS compliance automation (see `examples/CLAUDE.md.b2b-saas`)

---

## Scenario

The PM has a completed PRD for the Evidence Auto-Collection feature (integrating with AWS, GCP, and GitHub to pull compliance evidence automatically). The PRD went through the `/write-prd` workflow and passed structural checks. Before sharing it with engineering leadership, the PM wants it pressure-tested to surface weaknesses.

## Input prompt

```
Run an adversarial review on the Evidence Auto-Collection PRD before I share it with
the engineering leads. I want to know where the claims are soft, the scope is leaking,
or the risks are understated. Standard depth.
```

---

## Baseline output (without Shipwright)

> A typical AI adversarial review. Notice how everything is critical, the complaints are vague, and there are no resolution paths.

### Adversarial Review: Evidence Auto-Collection PRD

**Overall Risk Level: HIGH**

**Critical Issues:**

1. **Vague success metrics.** The success metrics could be more specific. "90% of evidence collected automatically" is ambitious but lacks detail on how this will be measured. Consider adding more granularity.

2. **Timeline is aggressive.** 10 weeks for three provider integrations is very tight. This could easily slip. You should consider adding buffer time and being more realistic about the timeline.

3. **Security risks are understated.** Storing customer cloud credentials is a major security concern. This section needs significantly more detail and should probably be reviewed by your security team.

4. **Missing stakeholder alignment.** The PRD doesn't adequately address how you'll get buy-in from engineering leadership. Consider adding a stakeholder communication plan.

5. **Competitive response not addressed.** What happens if Vanta ships this first? The PRD should include a competitive contingency plan.

6. **Integration complexity underestimated.** Each cloud provider has different APIs, authentication models, and rate limits. The PRD glosses over this complexity. More technical detail is needed.

7. **Customer adoption risk.** Will customers actually grant read-only access to their infrastructure? This is a big assumption that could undermine the entire feature.

8. **Scalability concerns.** The PRD doesn't address what happens at scale --- hundreds of customers, thousands of evidence collection jobs running simultaneously.

**Recommendations:**
- Add more detail to all sections
- Get security team review before proceeding
- Consider a phased approach
- Add competitive analysis
- Revisit timeline with engineering

**Verdict:** HIGH RISK --- Significant rework recommended before sharing with engineering.

---

## Shipwright output (with `adversarial-review` skill)

> The skill runs a structured 5-vector sweep, produces calibrated findings with resolution conditions, and closes with a verdict that tells the PM exactly what to do next.

## Challenge Report: Evidence Auto-Collection PRD

### Context

- **Artifact under review:** PRD --- Evidence Auto-Collection (v1, post-`/write-prd` workflow)
- **Depth:** Standard
- **Intended audience:** Engineering leadership
- **Review goal:** Surface soft claims, scope leakage, and understated risks before leadership review

---

### Analysis

**Verdict: DEFEND**

The PRD is structurally sound and well-grounded in customer evidence. However, three claims are either unsupported or overstated, and one scope boundary needs tightening. The PM should resolve the Critical and Moderate findings below before treating the artifact as leadership-ready.

| # | Claim Challenged | Attack Vector | Severity | Why This Is Vulnerable | Question To Answer | What Would Resolve It |
|---|---|---|---|---|---|---|
| 1 | "90% of evidence collected automatically" (success metrics) | Evidence Integrity | Critical | This number appears in the baseline success metrics but has no derivation. The PRD's own FAQ states that process-based evidence (training records, policy acknowledgments) still requires manual upload. If 30-40% of SOC 2 Type II controls are process-based, 90% auto-collection is arithmetically impossible without narrowing the denominator. | What is the denominator --- all controls, or only infrastructure controls? | Either (a) audit the SOC 2 control list and show that 90% maps to infrastructure evidence, or (b) restate the metric with a qualified denominator: "90% of infrastructure-related evidence" or revise downward to 60% (which the FAQ section already uses). |
| 2 | "Setup completes in under 15 minutes with no engineering assistance" (user story acceptance criteria) | Specificity | Moderate | The Customer Voice perspective in the design review already flagged that Carmen (Compliance Officer) likely cannot create an AWS cross-account IAM role without engineering help. The PRD's own edge case mentions a CloudFormation template as an alternative, which implies the happy path requires IAM console access Carmen probably doesn't have. The "no engineering assistance" claim contradicts the artifact's own evidence. | Has setup been tested with a non-technical compliance persona? | User-test the setup wizard with a compliance officer (not an engineer). If they cannot complete it solo, revise the acceptance criterion to "under 15 minutes with IT admin delegation step" and add the delegate-setup flow. |
| 3 | "Evidence mapping accuracy must stay above 95%" (guardrail metric) | Decision Courage | Moderate | The PRD sets 95% as the guardrail but the FAQ section separately states that manual review is required below 85% confidence. There is a 10-point gap between these two thresholds with no explanation of what happens in between. More importantly, neither threshold is grounded in auditor tolerance --- the PRD never states what mapping accuracy auditors actually require. The 95% number may be too aggressive (killing a viable feature) or too lenient (auditors reject anything below 98%). | What evidence mapping error rate do auditors actually tolerate? | Interview 2-3 audit firms during beta and set the guardrail based on their stated tolerance. Document the source. If auditor data is unavailable pre-launch, state that 95% is a placeholder pending auditor validation, not a confirmed requirement. |
| 4 | "GCP integration (2 weeks)" in the rollout plan | Scope Discipline | Minor | The rollout plan allocates 3 weeks for AWS and 2 weeks for GCP, implying GCP is simpler. The in-scope section lists GCP Cloud Audit Logs, IAM bindings, Security Command Center findings, and VPC firewall rules --- four distinct services with different APIs and permission models. The asymmetry between AWS (3 weeks, 5 services) and GCP (2 weeks, 4 services) is not explained. This may be correct if the GCP SDK is simpler, but the estimate is presented without rationale and engineering will question it. | Is the GCP estimate validated with the engineer who will build it? | Add a one-line rationale for the AWS/GCP time difference (e.g., "GCP SDK provides a unified asset inventory API, reducing per-service integration work") or equalize the estimates if the rationale doesn't hold. |
| 5 | Open Questions table lists 3 items with "TBD" resolution and no escalation path | Structural Honesty | Minor | All three open questions (evidence freshness SLA, customer-configurable confidence threshold, cross-provider controls) are marked TBD with due dates in Weeks 2-3. But the rollout plan shows engineering starting AWS integration in Week 1. If these questions affect the AWS integration design (cross-provider controls certainly does), starting engineering before resolution creates rework risk. The PRD presents these as low-urgency open items when at least one is a potential design dependency. | Which open questions are blocking for Week 1 engineering work? | Triage the open questions into "must resolve before engineering starts" vs. "can resolve in parallel." Move any blocking questions into the Dependencies table with a status of "Unresolved --- blocks Week 1 start." |

---

### Decision Frame

**Recommendation:** Resolve findings #1 and #2 before the leadership review. Findings #3-5 can be addressed during the review or in a follow-up revision.

**Trade-off of acting now vs. revising:** Sharing the PRD with the "90% auto-collection" claim (#1) risks an engineering lead immediately challenging the number and undermining confidence in the entire document. The setup ownership gap (#2) will surface during sprint planning regardless --- better to address it proactively than reactively. The remaining findings are refinements, not credibility risks.

**Confidence:** High that findings #1 and #2 are real vulnerabilities. The 90% claim contradicts the PRD's own content. The setup ownership gap was already flagged in a prior design review.

**Owner:** PM
**Decision date:** Before the scheduled engineering leadership review
**Revisit trigger:** If auditor tolerance data becomes available (finding #3), revisit the guardrail metric

---

### Risks and Open Questions

**Unresolved vulnerabilities:**
- The PRD's two different accuracy thresholds (95% guardrail vs. 85% confidence floor) create ambiguity about what "good enough" means for evidence mapping. Engineering will build to one number --- which one?
- The rollout plan assumes sequential provider integration with no parallel workstreams, but the 10-week timeline leaves zero buffer. Any single provider slipping 1 week compresses beta from 2 weeks to 1.

**Open questions for the PM:**
- Has any audit firm confirmed they would accept auto-collected evidence in the proposed format?
- What is the fallback if the 60% control coverage target (FAQ section) turns out to be 40-50% due to process-based controls?

**Risks if used without revision:**
- Engineering leadership may fixate on the 90% claim and derail the review into a metrics debate instead of discussing architecture and sequencing.

---

### Action Plan

1. **Before leadership review:** Revise the 90% success metric. Either qualify the denominator or align with the 60% figure already used in the FAQ section.
2. **Before leadership review:** Add a "delegate to IT admin" step in the setup wizard user story. Revise the acceptance criterion from "no engineering assistance" to "minimal engineering involvement (one-time credential setup delegation)."
3. **During or after review:** Reconcile the 95% guardrail with the 85% confidence floor. State which number governs the ship/no-ship decision.
4. **During or after review:** Add rationale for the GCP time estimate or adjust it.
5. **During or after review:** Triage open questions by engineering dependency.

---

### Unknowns & Evidence Gaps

- This review did not have access to auditor feedback on auto-collected evidence acceptance. Finding #3 (accuracy guardrail) would benefit from external auditor validation that was not available.
- The reviewer shares the producing model's blind spots. If the PRD's customer evidence (CAB feedback, win/loss data) was fabricated or selectively cited upstream, this review cannot detect that.
- GCP integration complexity assessment (finding #4) would benefit from engineering input that is outside this review's scope.

### Pass/Fail Readiness

**PASS.** Each finding challenges a specific claim from the artifact, assigns calibrated severity (1 Critical, 2 Moderate, 2 Minor), and includes a concrete resolution condition. No findings are generic complaints or theatrical skepticism.

### Recommended Next Artifact

Route findings #1 and #2 back to the PRD author for revision, then proceed to `technical-spec` for the evidence mapping engine --- the accuracy threshold question (finding #3) will need a concrete answer before the spec can define the mapping pipeline's acceptance criteria.

---

## Why the Shipwright output is better

1. **Calibrated severity replaces uniform alarm.** The baseline marks everything as critical or high risk --- 8 issues all at the same urgency. The Shipwright output distinguishes 1 Critical (the 90% claim is arithmetically unsupported), 2 Moderate (setup ownership and accuracy threshold ambiguity), and 2 Minor (estimate rationale and open question triage). This tells the PM where to spend their time.

2. **Specific claims challenged, not vibes.** The baseline says "vague success metrics" and "more detail needed." The Shipwright output identifies the exact claim ("90% of evidence collected automatically"), explains why it is vulnerable (contradicted by the PRD's own FAQ about process-based evidence), and states what would resolve it (audit the control list or restate the denominator). The PM can act on the second; they cannot act on the first.

3. **Resolution conditions make findings actionable.** Every Shipwright finding ends with "What Would Resolve It" --- a specific action, not a suggestion to "add more detail." The baseline's recommendations ("add more detail to all sections," "consider a phased approach") are indistinguishable from generic feedback on any document.

4. **The artifact's own contradictions are surfaced.** The Shipwright output catches that the PRD uses 90% in one section and 60% in another, and that the "no engineering assistance" claim contradicts the CloudFormation template edge case. The baseline treats the PRD as a black box and critiques it from the outside. The Shipwright review reads the document closely enough to find internal inconsistencies.

5. **Verdict framework prevents overcorrection.** The baseline says "significant rework recommended" --- a conclusion that could delay the project by weeks. The Shipwright verdict is DEFEND with a scoped action plan: fix two specific things before the leadership review, address three more during or after. The PM knows exactly what "done" looks like.
