# Golden Output: Design Review

**Skill:** `design-review`
**Framework:** 7-perspective parallel review with synthesized verdict
**Product context:** ComplianceOS — B2B SaaS compliance automation (see `examples/CLAUDE.md.b2b-saas`)

---

## Scenario

The PM has drafted a proposal for the Evidence Auto-Collection integration setup flow. Before committing engineering resources, they want a structured review to catch blind spots.

## Input prompt

```
Run a design review on our proposed Evidence Auto-Collection setup flow.
The user connects AWS/GCP/GitHub via a wizard, grants read-only credentials,
and ComplianceOS maps collected evidence to their active compliance controls.
```

---

## Baseline output (without Shipwright)

> The AI gives a reasonable single-perspective review. Notice that it stays in one voice and misses entire categories of concern.

### Design Review: Evidence Auto-Collection Setup Flow

**Overall Assessment:** The proposed setup wizard is well-structured, but there are several areas to consider:

**Strengths:**
- Read-only permissions minimize security risk
- Guided wizard reduces need for engineering involvement
- Automatic control mapping reduces manual effort

**Concerns:**
- The wizard may be too long if all three providers are set up at once — consider allowing one at a time
- Error handling needs to be clear when credentials are incorrect or permissions are insufficient
- Users may not understand what "read-only access" means in practical terms — consider showing exactly what ComplianceOS can and cannot see
- Loading time for initial evidence collection could be long — need a progress indicator

**Recommendations:**
- Add a "test connection" step before saving credentials
- Show a preview of what evidence will be collected before the user commits
- Allow skip and return later for providers the user isn't ready to connect
- Include documentation links for credential setup per provider

**Verdict:** Looks good with minor improvements. Proceed with the suggested changes.

---

## Shipwright output (with `design-review` skill)

> The skill runs 7 parallel perspectives, each with a specific evaluator mindset and forced verdict. The synthesis identifies tensions between perspectives.

## Design Review: Evidence Auto-Collection Setup Flow

### Document Under Review
- **Type:** Feature design proposal
- **Author:** PM (ComplianceOS)
- **Version:** v0.3
- **Scope:** Integration setup wizard for AWS, GCP, and GitHub evidence collection

---

## Perspective Reviews

### 1. Engineering Perspective
**Evaluator mindset:** "Can we build this reliably, performantly, and maintainably?"

**Feasibility Assessment:**
- [x] Scope is technically feasible within the proposed 10-week timeline
- [ ] Hidden complexity: credential validation is provider-specific and error modes vary significantly across AWS (IAM role assumption), GCP (service account key validation), and GitHub (App installation OAuth flow)
- [ ] Technical debt: three separate credential storage patterns unless we abstract provider auth into a unified adapter layer upfront

**Architecture Concerns:**
- **Credential lifecycle management** (High): Credentials expire, get rotated, and get revoked. The proposal covers initial setup but not ongoing credential health. This will generate support tickets within the first month.
- **Initial backfill duration** (Medium): First evidence pull for a large AWS account (1000+ resources) could take 15-30 minutes. The wizard implies instant results.

**Missing Technical Details:**
- Retry strategy when provider APIs are temporarily unavailable
- Data model for evidence artifacts (blob storage vs. structured metadata vs. both)
- Multi-region AWS support — customers may have resources across 5+ regions

**Effort Estimate Validation:**
- Proposed: 10 weeks (2 engineers)
- Engineering assessment: 10 weeks is achievable for core flow; add 2 weeks buffer for credential edge cases and provider API inconsistencies
- Delta rationale: Provider-specific error handling always takes longer than expected

**Verdict:** Yellow — Feasible with changes. Need credential lifecycle design and backfill UX before starting.

---

### 2. Design / UX Perspective
**Evaluator mindset:** "Will this be intuitive, accessible, and delightful for our users?"

**Usability Assessment:**
- [x] Step-by-step wizard matches the established mental model for integration setup
- [ ] Error states are under-designed — "invalid credentials" means different things for each provider and Carmen needs actionable guidance, not a generic error
- [ ] Information hierarchy unclear: the wizard mixes "connect provider" with "configure evidence mapping" in a single flow — these are cognitively different tasks

**Accessibility Review:**
- [ ] Wizard must support keyboard navigation (Tab through steps, Enter to confirm)
- [ ] Credential input fields need proper ARIA labels — screen readers must distinguish between "AWS Role ARN" and "GCP Service Account Key"
- [x] No color-only status indicators — current proposal uses icons alongside colors

**Consistency Check:**
- [ ] ComplianceOS has no existing wizard pattern — this creates a new UI component. It should be designed as a reusable wizard component, not a one-off.
- [ ] Provider setup varies significantly (IAM role vs. service account key vs. OAuth App install) — the wizard must feel unified despite different underlying flows

**Concerns:**
- **Cognitive overload** (Medium): Asking Carmen to set up 3 providers in one session is daunting. She may not have all credentials ready. The flow should optimize for "connect one provider and see value fast" rather than "set up everything at once."

**Verdict:** Yellow — Feasible with changes. Split "connect provider" from "configure mapping." Optimize for single-provider first-run.

---

### 3. Executive / Strategy Perspective
**Evaluator mindset:** "Does this align with our strategy and move the right metrics?"

**Strategic Alignment:**
- [x] Supports Bet 1 (Evidence Auto-Collection) — the highest-priority strategic bet
- [x] Moves primary metric: % of controls with auto-collected evidence
- Opportunity cost: Engineering time comes from deferring Custom Report Builder (RICE 34 vs. 67 for this)

**Business Case Validation:**
- Expected impact: 60% of controls auto-covered → 40% reduction in time-to-audit-ready
- Confidence level: High (validated with 8/12 CAB members, supported by win/loss analysis)
- Time to value: Customers see evidence within 1 hour of connecting first provider

**Concerns:**
- **Time-to-value definition** (Low): "1 hour to first evidence" is compelling but only if evidence is correctly mapped to controls. Incorrect mapping that requires manual cleanup could make time-to-value worse, not better.

**Verdict:** Green — Strong strategic alignment. Proceed.

---

### 4. Legal / Compliance Perspective
**Evaluator mindset:** "Does this create legal, regulatory, or compliance risk?"

**Data & Privacy:**
- [ ] Read-only access to customer infrastructure still means we're accessing their cloud metadata. What data do we store? Metadata only, or raw configurations?
- [ ] If we store AWS IAM policies, these may contain role names that reveal organizational structure — is this PII or sensitive business data under customer contracts?
- [ ] Data residency: where is collected evidence stored? Customers in regulated industries may require US-only storage.

**Contractual:**
- [ ] Current customer contracts don't cover infrastructure access. Legal needs to draft an addendum or update the DPA covering what we access, store, and how long we retain it.
- [ ] SLA implications: if auto-collected evidence is wrong and a customer fails an audit, what's our liability?

**Concerns:**
- **Contract gap** (High): We cannot launch this without updating customer contracts. This is a potential timeline blocker that isn't reflected in the engineering estimate.

**Verdict:** Red — Cannot proceed without contract/DPA updates and data residency decisions.

---

### 5. Customer Voice Perspective
**Evaluator mindset:** "Would our target customer actually want this, and would they understand it?"

**Demand Validation:**
- [x] 8/12 CAB members identified manual evidence collection as top pain point
- [x] Primary persona (Carmen) benefits most — this directly addresses her "chasing engineers" problem
- [x] Addresses core JTBD: "prove controls are working without a quarter-long project"

**Adoption Concerns:**
- [ ] Will Carmen be the one with AWS credentials? In most orgs, Carmen is Compliance — she'll need to ask an engineer or IT admin to complete the setup wizard. The "no engineering involvement" promise is partially false.
- [ ] Learning curve: Carmen needs to understand what "read-only IAM role" means to evaluate whether granting access is safe. She may need to get security team approval.

**Voice of Customer Data:**
- 8/12 CAB members requested this
- "Evidence upload" support tickets up 34% QoQ
- 60% of pipeline deals cite integration depth during evaluation

**Concerns:**
- **Setup ownership gap** (Medium): The person who wants this feature (Carmen) likely can't complete setup alone. The wizard needs a "delegate setup" flow — send a link to an engineer or IT admin with specific instructions.

**Verdict:** Yellow — Strong demand, but setup flow doesn't match the real-world permission chain. Add delegation.

---

### 6. Devil's Advocate Perspective
**Evaluator mindset:** "What are we wrong about? What could go catastrophically wrong?"

**Assumption Challenges:**

| Assumption in the Proposal | Why It Might Be Wrong | Evidence |
|---|---|---|
| 60% of controls can be auto-covered | This assumes cloud infrastructure evidence covers most controls. Many SOC 2 controls are process-based (e.g., employee training, background checks) and can't be automated | Review the SOC 2 control list — estimate is likely 40-50% for Type II |
| Read-only access is sufficient for all evidence types | Some evidence requires point-in-time snapshots that may not be available via read APIs (e.g., "state of IAM policy on audit date") | AWS Config provides history, but GCP audit log retention is 400 days max |
| Auditors will accept auto-collected evidence | Some auditors prefer human-attested evidence and may distrust automated collection | Need to pilot with 2-3 audit firms before GA |

**Worst-Case Scenarios:**
1. **Incorrect evidence mapping causes audit failure**: ComplianceOS maps an AWS Config rule to the wrong SOC 2 control. Carmen trusts it. The auditor catches the mismatch. Carmen loses trust in the platform and churns. Cascading reputation damage if shared in compliance communities.
2. **Credential compromise**: Even read-only, if our credential store is breached, attackers get a map of every customer's cloud security posture. This is a catastrophic security event.

**Kill Case:** Do not ship if:
- Evidence mapping accuracy cannot exceed 90% in beta testing with real customer accounts
- Fewer than 2 audit firms confirm they'd accept auto-collected evidence format

**Verdict:** Yellow — Assumptions need validation before GA. Pilot with auditor acceptance testing is critical.

---

### 7. Sales / GTM Perspective
**Evaluator mindset:** "Can we sell this? Does it help us win deals?"

**Sales Impact:**
- [x] Directly addresses the #1 lost-deal reason against Vanta (integration depth)
- [x] New selling point: "Connect your cloud, see evidence in 1 hour" — demo-able and compelling
- [ ] Competitive positioning shift: we go from "better frameworks" to "better frameworks + better automation"

**Enablement Needs:**
- [ ] Sales team needs a demo environment with pre-connected AWS/GCP/GitHub
- [ ] Updated battlecard: Vanta comparison now shifts from "they have more integrations" to "we have deeper, more accurate integrations"
- [ ] ROI calculator: "hours saved per quarter on evidence collection" per number of controls

**Concerns:**
- **Demo dependency** (Medium): This feature is only compelling in a live demo. Static screenshots won't convey the value. Sales needs a reliable demo environment before launch.

**Verdict:** Green — Strong sales impact. Need demo environment and updated battlecards.

---

## Review Synthesis

### Consensus Points (all perspectives agree)
1. Evidence Auto-Collection is strategically valuable and addresses validated customer demand
2. The setup wizard should optimize for single-provider first, not all-three-at-once
3. Evidence mapping accuracy is a critical risk that needs validation before GA

### Tensions

| Tension | Perspective A Says | Perspective B Says | Resolution Needed |
|---|---|---|---|
| Launch timeline | Engineering says 10+2 weeks | Legal says contracts must be updated first (unknown timeline) | PM + Legal: scope contract changes and parallelize with engineering |
| Setup ownership | UX says "no engineering involvement" | Customer Voice says Carmen can't set up AWS credentials alone | PM: Add "delegate to IT" flow; revise messaging from "no engineering" to "minimal engineering" |
| Evidence coverage claim | Strategy says "60% of controls" | Devil's Advocate says realistic number is 40-50% for SOC 2 Type II | PM + Compliance Content: audit actual control coverage before committing to a number in marketing |

### Blockers (must resolve before proceeding)

| Blocker | Raised By | Severity | Proposed Resolution |
|---|---|---|---|
| Customer contracts don't cover infrastructure access | Legal | Critical | Draft DPA addendum immediately; parallelize with engineering |
| Credential security architecture not specified | Engineering + Devil's Advocate | Critical | Security architecture review before credential storage is built |

### Recommendations (should address but not blocking)

| Recommendation | Raised By | Priority |
|---|---|---|
| Add "delegate setup" flow for non-technical users | Customer Voice + UX | High |
| Build reusable wizard component, not one-off | UX | Medium |
| Pilot with 2-3 audit firms before GA | Devil's Advocate | High |
| Create demo environment for sales | Sales/GTM | Medium |

### Overall Verdict

| Perspective | Verdict |
|---|---|
| Engineering | Yellow |
| Design / UX | Yellow |
| Executive / Strategy | Green |
| Legal / Compliance | Red |
| Customer Voice | Yellow |
| Devil's Advocate | Yellow |
| Sales / GTM | Green |

**Recommendation:** Approve with changes. Resolve the Legal blocker (DPA/contract update) and Security architecture review before development begins. Incorporate the "delegate setup" flow and single-provider-first UX into the spec.

---

## Why the Shipwright output is better

1. **Seven perspectives vs. one.** The baseline gives a single-voice review that catches UX issues but misses legal, security, sales, and customer adoption concerns entirely. The Shipwright output's Legal perspective identified a hard blocker (contract gap) that would have surfaced weeks into development.

2. **Forced verdicts prevent hand-waving.** Each perspective must commit to Green/Yellow/Red. The baseline says "looks good with minor improvements" — the Shipwright output shows 1 Red, 4 Yellow, 2 Green, which is a fundamentally different risk picture.

3. **Tensions are surfaced explicitly.** The synthesis identifies where perspectives disagree (timeline vs. legal, setup ownership messaging) and assigns resolution owners. The baseline treats all feedback as a single undifferentiated list.

4. **Blockers are distinguished from recommendations.** The baseline mixes "add a test connection step" (nice-to-have) with security concerns (critical) at the same priority level. The Shipwright output separates blockers from recommendations with severity ratings.

5. **Devil's Advocate challenges assumptions.** The 60% evidence coverage claim is questioned with a specific counter-argument ("many SOC 2 controls are process-based"). The baseline doesn't question any of the proposal's assumptions.

6. **Customer Voice catches the setup ownership gap.** The person who wants the feature (Carmen, Compliance) isn't the person who can complete setup (IT/Engineering). This insight doesn't appear in the baseline because it requires thinking from the customer's operational reality, not just the product's UX.
