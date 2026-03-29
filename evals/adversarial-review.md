# Adversarial Review Evaluation Rubric

Evaluates Challenge Reports produced by the `adversarial-review` skill or `red-team` agent.

## Universal dimensions

Apply the 4 dimensions from the [universal rubric](rubric.md): Clarity, Completeness, Actionability, Correctness.

## Adversarial review-specific dimensions

### 5. Finding Specificity

**What it measures:** Do findings challenge precise claims, or do they gesture vaguely at weakness?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Findings are generic: "this feels vague" or "needs more evidence." They do not identify the exact claim being challenged. |
| **6 (Adequate)** | Most findings name the section or general issue, but some still operate at the paragraph level rather than the claim level. |
| **9 (Strong)** | Every finding names the exact vulnerable claim, explains why it is vulnerable, and asks a precise question the author can answer. |

**Common failure mode:** The review sounds sharp but gives the author no clear response path because it never says exactly what claim is under attack.

### 6. Severity Calibration

**What it measures:** Are Critical, Moderate, and Minor issues distinguished with judgment?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Everything is Critical, or everything is Minor. Severity feels performative rather than reasoned. |
| **6 (Adequate)** | Severity is usually sensible, but 1-2 findings are overstated or understated. |
| **9 (Strong)** | Critical findings clearly put the core recommendation in doubt, Moderate findings materially weaken confidence, and Minor findings stay minor. |

**Common failure mode:** Treating stylistic weaknesses as integrity failures.

### 7. Evidence Grounding

**What it measures:** Are findings grounded in the artifact and provided context, rather than invented objections?

| Score | Anchor |
|---|---|
| **3 (Weak)** | The reviewer invents missing context, assumes facts not in evidence, or implies the artifact claimed things it never claimed. |
| **6 (Adequate)** | Most findings are grounded, but a few rely on inference that should have been labeled as hypothesis. |
| **9 (Strong)** | Findings are tightly grounded in the artifact's own claims, omissions, and structure. Missing context is disclosed instead of filled in. |

**Common failure mode:** Inventing counter-evidence instead of pointing out unsupported claims.

### 8. Resolution Actionability

**What it measures:** Does every finding say what would resolve it?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Findings are accusatory but not constructive. No resolution conditions are given. |
| **6 (Adequate)** | Most findings include a next step, but some are still vague: "add more detail" or "support this better." |
| **9 (Strong)** | Every finding states the exact evidence, revision, boundary, or clarification that would resolve the concern. |

**Common failure mode:** The review creates friction but not progress.

### 9. Coverage Discipline

**What it measures:** Does the review cover the chosen depth without turning into a kitchen-sink teardown?

| Score | Anchor |
|---|---|
| **3 (Weak)** | The review fixates on one vector and ignores the rest, or lists every possible nitpick with no prioritization. |
| **6 (Adequate)** | The chosen depth is mostly respected, but the review is uneven or mildly repetitive. |
| **9 (Strong)** | Light reviews surface only the highest-signal issues. Standard reviews cover all vectors with discipline. Deep reviews increase rigor without drifting into authorship. |

**Common failure mode:** Confusing thoroughness with volume.

### 10. Non-Theatrical Rigor

**What it measures:** Does the review add real pressure, or does it perform skepticism for its own sake?

| Score | Anchor |
|---|---|
| **3 (Weak)** | The review feels theatrical. It insists on finding flaws, overuses harsh language, or blocks strong artifacts that should clear. |
| **6 (Adequate)** | The review is serious and useful, but slightly over-rotates on adversarial tone or produces a few low-value objections. |
| **9 (Strong)** | The review is tough, fair, and proportionate. Strong artifacts can clear cleanly, and weak artifacts receive high-signal pressure. |

**Common failure mode:** Requiring friction even when the artifact is already sound.

## Weights

| Dimension | Weight | Rationale |
|---|---|---|
| Clarity | 10% | Review output must be easy to act on |
| Completeness | 10% | Missing context or omitted next steps weaken the report |
| Actionability | 15% | The report must tell the PM what to do next |
| Correctness | 10% | Critique must be fair and grounded |
| Finding Specificity | 20% | Specificity is the difference between signal and noise |
| Severity Calibration | 10% | Overstated severity destroys trust |
| Evidence Grounding | 10% | The review cannot invent objections |
| Resolution Actionability | 10% | Every finding needs a path to resolution |
| Coverage Discipline | 5% | The review should respect Light/Standard/Deep without turning into a teardown |
| Non-Theatrical Rigor | 10% | Strong artifacts must be allowed to clear cleanly |
