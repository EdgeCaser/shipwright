# Design Review Evaluation Rubric

Evaluates design reviews produced by the `design-review` skill.

## Universal dimensions

Apply the 4 dimensions from the [universal rubric](rubric.md): Clarity, Completeness, Actionability, Correctness.

## Design review-specific dimensions

### 5. Perspective Coverage

**What it measures:** Are all 7 perspectives genuinely distinct, or do they collapse into a single voice?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Fewer than 5 perspectives addressed. Or all perspectives raise the same concerns in different words — the "Engineering" perspective and "Devil's Advocate" perspective say the same thing. No distinct voice per perspective. |
| **6 (Adequate)** | All 7 perspectives are present and surface different concerns, but some are thin. Legal has one line. Customer Voice restates the PRD's persona section. The evaluator mindset isn't consistently applied. |
| **9 (Strong)** | Each perspective brings unique insights that no other perspective raised. Legal catches a contract gap. Customer Voice identifies a setup ownership problem. Devil's Advocate questions the core assumption. You can remove any single perspective and lose information. |

**Common failure mode:** The Devil's Advocate perspective is weak. This is the most valuable perspective in the review — it should challenge the proposal's fundamental assumptions, not just list minor risks. If the Devil's Advocate agrees with the proposal, the review isn't rigorous enough.

### 6. Tension Surfacing

**What it measures:** Does the synthesis identify genuine disagreements between perspectives, or does it smooth everything into consensus?

| Score | Anchor |
|---|---|
| **3 (Weak)** | No tensions identified. All perspectives broadly agree. The synthesis reads as "everyone likes the proposal with minor tweaks." This almost always indicates insufficient rigor. |
| **6 (Adequate)** | Tensions exist but are described vaguely. "Engineering and UX have different views on timeline" — what specifically do they disagree about? Resolution owners are missing. |
| **9 (Strong)** | Tensions are described with both sides quoted. "Engineering says 10+2 weeks; Legal says contracts must be updated first (unknown timeline). Resolution: PM + Legal scope contract changes and parallelize." Each tension has an owner and a path to resolution. |

**Common failure mode:** Conflating "recommendation" with "blocker." A design review that lists 10 recommendations and 0 blockers is either reviewing a perfect proposal or not being honest about severity. Expect at least 1 blocker or 1 high-severity tension in any meaningful review.

## Scored example: 9/10 vs. 6/10

The full golden output is in [examples/golden-outputs/design-review.md](../examples/golden-outputs/design-review.md).

### Synthesis — scored 9/10

> **Tensions:**
>
> | Tension | Perspective A Says | Perspective B Says | Resolution Needed |
> |---|---|---|---|
> | Launch timeline | Engineering says 10+2 weeks | Legal says contracts must be updated first (unknown timeline) | PM + Legal: scope contract changes and parallelize with engineering |
> | Setup ownership | UX says "no engineering involvement" | Customer Voice says Carmen can't set up AWS credentials alone | PM: Add "delegate to IT" flow; revise messaging |
> | Evidence coverage | Strategy says "60% of controls" | Devil's Advocate says realistic number is 40-50% for SOC 2 Type II | PM + Compliance: audit actual control coverage before marketing |
>
> **Blockers:**
>
> | Blocker | Raised By | Severity | Proposed Resolution |
> |---|---|---|---|
> | Customer contracts don't cover infrastructure access | Legal | Critical | Draft DPA addendum; parallelize with engineering |
> | Credential security architecture not specified | Engineering + Devil's Advocate | Critical | Security review before credential storage is built |

**Why 9/10:** Tensions name the specific disagreement with both sides quoted. Blockers are distinguished from recommendations with severity. Every tension and blocker has a resolution owner. The review clearly distinguishes "must fix" from "should fix."

### Synthesis — scored 6/10

> **Key Concerns:**
> - The wizard may be too long for setting up all providers at once
> - Error handling needs improvement
> - Loading time for initial collection could be long
> - Need a progress indicator
>
> **Verdict:** Looks good with minor improvements. Proceed.

**Why 6/10:** All concerns are presented at the same severity. A contract/legal gap (critical blocker) is not mentioned. A UX polish item (progress indicator) is listed alongside a security architecture gap as if they're equivalently important. No tensions between perspectives because the review was done in a single voice.

### Perspective (Legal) — scored 9/10

> **Data & Privacy:**
> - Read-only access to customer infrastructure still means we're accessing their cloud metadata. What data do we store?
> - If we store AWS IAM policies, these may contain role names that reveal organizational structure — is this PII?
> - Data residency: where is collected evidence stored? Customers in regulated industries may require US-only storage.
>
> **Contractual:**
> - Current customer contracts don't cover infrastructure access. Legal needs to draft an addendum.
> - SLA implications: if auto-collected evidence is wrong and a customer fails an audit, what's our liability?
>
> **Verdict:** Red — Cannot proceed without contract/DPA updates and data residency decisions.

**Why 9/10:** Asks specific legal questions (not generic "check with legal"). Identifies a hard blocker with a clear Red verdict. The concern about storing IAM policies revealing organizational structure is a non-obvious insight that only the Legal perspective would surface.

### Perspective (Legal) — scored 6/10

> **Legal:**
> - Make sure we comply with data privacy regulations
> - Check if we need to update our terms of service
>
> **Verdict:** Yellow

**Why 6/10:** Generic advice that applies to any feature ("comply with data privacy regulations"). Doesn't ask specific questions about *this* proposal. The Yellow verdict has no justification — is it Yellow because of a real risk or because the reviewer didn't investigate deeply enough?

## Weights

| Dimension | Weight | Rationale |
|---|---|---|
| Clarity | 10% | Reviews are internal documents; clarity matters but less than substance |
| Completeness | 15% | Missing perspectives create blind spots |
| Actionability | 20% | Reviews must produce clear decisions: proceed, revise, or block |
| Correctness | 10% | Less about framework correctness, more about analytical rigor |
| Perspective Coverage | 25% | The defining value of the design review skill |
| Tension Surfacing | 20% | Consensus without tension usually means insufficient rigor |
