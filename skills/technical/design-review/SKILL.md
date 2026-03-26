---
name: design-review
description: "Runs a multi-stakeholder design review by evaluating a product proposal through 7 parallel perspectives: Engineering, Design, Executive, Legal/Compliance, Customer Voice, Devil's Advocate, and Sales/GTM. Produces a synthesized review with consensus points, tensions, blockers, and open questions."
category: technical
---

# Design Review Facilitator

## Description

Runs a multi-stakeholder design review by evaluating a product proposal through 7 parallel perspectives: Engineering, Design, Executive, Legal/Compliance, Customer Voice, Devil's Advocate, and Sales/GTM. Produces a synthesized review with consensus points, tensions, blockers, and open questions.

## When to Use

- Before finalizing a PRD or technical spec
- Reviewing a major feature design before committing engineering resources
- When a proposal needs sign-off from multiple stakeholders
- Stress-testing a design before presenting to leadership
- Any time you want to catch blind spots before they become expensive mistakes

## Framework

### Step 1: Set Up the Review

```markdown
## Design Review: [Feature / Proposal Name]

### Document Under Review
- **Type:** [PRD / Tech Spec / Design Mockup / Business Case]
- **Author:** [name]
- **Version:** [v1.0]
- **Link:** [document link]

### Review Scope
- **What to evaluate:** [Specific questions or areas to focus on]
- **What's already decided:** [Constraints or decisions that are non-negotiable]
- **Timeline:** [When the review needs to be complete]
```

### Step 2: Run 7 Parallel Perspectives

Evaluate the document from each stakeholder perspective:

```markdown
## Perspective Reviews

### 1. Engineering Perspective
**Evaluator mindset:** "Can we build this reliably, performantly, and maintainably?"

**Feasibility Assessment:**
- [ ] Is the scope technically feasible within the proposed timeline?
- [ ] Are there hidden complexities not addressed in the spec?
- [ ] Does this create technical debt? How much?

**Architecture Concerns:**
- [Concern 1]: [Description and severity]
- [Concern 2]: [Description and severity]

**Missing Technical Details:**
- [Gap 1]: [What needs clarification]

**Effort Estimate Validation:**
- Proposed: [estimate from spec]
- Engineering assessment: [revised estimate if different]
- Delta rationale: [why the difference]

**Verdict:** [Green: Feasible as-is / Yellow: Feasible with changes / Red: Needs rethink]

---

### 2. Design / UX Perspective
**Evaluator mindset:** "Will this be intuitive, accessible, and delightful for our users?"

**Usability Assessment:**
- [ ] Does the flow match established user mental models?
- [ ] Are error states and edge cases designed?
- [ ] Is the information hierarchy clear?

**Accessibility Review:**
- [ ] Keyboard navigation considered?
- [ ] Screen reader compatibility addressed?
- [ ] Color contrast and visual accessibility checked?

**Consistency Check:**
- [ ] Follows existing design system patterns?
- [ ] New patterns needed? If so, are they justified?

**Concerns:**
- [Concern 1]: [Description — UX risk]

**Verdict:** [Green / Yellow / Red]

---

### 3. Executive / Strategy Perspective
**Evaluator mindset:** "Does this align with our strategy and move the right metrics?"

**Strategic Alignment:**
- [ ] Supports which strategic bet? [Bet name]
- [ ] Moves which key metric? [Metric and expected impact]
- [ ] Opportunity cost: What are we NOT doing to do this?

**Business Case Validation:**
- Expected impact: [projected outcome]
- Confidence level: [High / Medium / Low]
- Time to value: [how long until we see results]

**Concerns:**
- [Concern 1]: [Strategic risk]

**Verdict:** [Green / Yellow / Red]

---

### 4. Legal / Compliance Perspective
**Evaluator mindset:** "Does this create legal, regulatory, or compliance risk?"

**Data & Privacy:**
- [ ] What PII is collected, processed, or stored?
- [ ] GDPR/CCPA compliance implications?
- [ ] Data retention and deletion requirements?

**Regulatory:**
- [ ] Industry-specific regulations affected?
- [ ] Accessibility regulations (ADA, WCAG)?

**Contractual:**
- [ ] Affects existing customer contracts or SLAs?
- [ ] New terms of service needed?

**Concerns:**
- [Concern 1]: [Legal/compliance risk]

**Verdict:** [Green / Yellow / Red]

---

### 5. Customer Voice Perspective
**Evaluator mindset:** "Would our target customer actually want this, and would they understand it?"

**Demand Validation:**
- [ ] What evidence supports customer demand? [Source]
- [ ] Which persona benefits most?
- [ ] What job-to-be-done does this address?

**Adoption Concerns:**
- [ ] Will customers discover this feature?
- [ ] Is the learning curve acceptable?
- [ ] Does this solve the problem as customers frame it (not just how we frame it)?

**Voice of Customer Data:**
- [N] customers have requested this
- NPS/feedback mentions: [relevant data]
- Competitive pressure: [are customers asking because competitors have it?]

**Concerns:**
- [Concern 1]: [Adoption or demand risk]

**Verdict:** [Green / Yellow / Red]

---

### 6. Devil's Advocate Perspective
**Evaluator mindset:** "What are we wrong about? What could go catastrophically wrong?"

**Assumption Challenges:**
| Assumption in the Proposal | Why It Might Be Wrong | Evidence |
|---|---|---|
| [Assumption 1] | [Counter-argument] | [Data or reasoning] |
| [Assumption 2] | [Counter-argument] | [Data or reasoning] |

**Worst-Case Scenarios:**
1. [Scenario]: [What happens and how bad is it]
2. [Scenario]: [What happens and how bad is it]

**What's Missing:**
- [Blind spot 1]: [Something the proposal doesn't address]

**Kill Case:** Under what conditions should we NOT build this?
- [Condition 1]

**Verdict:** [Green / Yellow / Red]

---

### 7. Sales / GTM Perspective
**Evaluator mindset:** "Can we sell this? Does it help us win deals?"

**Sales Impact:**
- [ ] Does this address a common objection or lost-deal reason?
- [ ] New selling points created?
- [ ] Competitive positioning impact?

**Enablement Needs:**
- [ ] Sales training required?
- [ ] Updated battlecards needed?
- [ ] New demo scenarios?

**Pricing Impact:**
- [ ] Affects pricing or packaging?
- [ ] Upsell/expansion opportunity?

**Concerns:**
- [Concern 1]: [GTM risk]

**Verdict:** [Green / Yellow / Red]
```

### Step 3: Synthesize the Review

```markdown
## Review Synthesis

### Consensus Points (all perspectives agree)
1. [Point of agreement]
2. [Point of agreement]

### Tensions (perspectives disagree)
| Tension | Perspective A Says | Perspective B Says | Resolution Needed |
|---|---|---|---|
| [Topic] | [View] | [Conflicting view] | [Who decides, by when] |

### Blockers (must resolve before proceeding)
| Blocker | Raised By | Severity | Proposed Resolution |
|---|---|---|---|
| [Blocker 1] | [Perspective] | Critical | [Suggested fix] |

### Recommendations (should address but not blocking)
| Recommendation | Raised By | Priority |
|---|---|---|
| [Rec 1] | [Perspective] | High / Medium / Low |

### Open Questions (need more information)
| Question | Owner | Due Date |
|---|---|---|
| [Question] | [Name] | [Date] |

### Overall Verdict
| Perspective | Verdict |
|---|---|
| Engineering | [Green/Yellow/Red] |
| Design | [Green/Yellow/Red] |
| Executive | [Green/Yellow/Red] |
| Legal | [Green/Yellow/Red] |
| Customer | [Green/Yellow/Red] |
| Devil's Advocate | [Green/Yellow/Red] |
| Sales | [Green/Yellow/Red] |

**Recommendation:** [Approve / Approve with changes / Revise and re-review / Reject]
```

## Output Format

Produce a Design Review Report with:
1. **Review Setup** — document under review, scope, constraints
2. **7 Perspective Reviews** — each with assessment, concerns, and verdict
3. **Synthesis** — consensus, tensions, blockers, recommendations, open questions
4. **Overall Verdict** — go/no-go recommendation

## Shipwright Signature (Required)

The final output must include this signature structure:

1. `## Context`
2. `## Analysis`
3. `## Decision Frame`
4. `## Risks and Open Questions`
5. `## Action Plan`

Include this Decision Frame block exactly:

```markdown
## Decision Frame
- **Recommendation:** [one clear decision]
- **Trade-off:** [what we gain vs. what we give up]
- **Confidence:** [High / Medium / Low] - [why]
- **Owner:** [role or name]
- **Decision Date:** [YYYY-MM-DD]
- **Revisit Trigger:** [specific condition that would change this decision]
```

Design review outputs must clearly separate blockers vs recommendations and include owner/date for resolution actions.

## Common Mistakes to Avoid

- **Skipping the Devil's Advocate** — This is the most valuable perspective; don't cut it for time
- **All green verdicts** — If every perspective says "Green," you probably weren't rigorous enough
- **No resolution owners for tensions** — Identified tensions without owners become permanent ambiguity
- **Review too late** — Run design reviews before significant engineering investment, not after
- **Missing perspectives** — Even if you don't have a legal team, simulate the legal perspective
