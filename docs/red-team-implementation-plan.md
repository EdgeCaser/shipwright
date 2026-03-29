# Red-Team Implementation Plan

> Please read this plan critically and try to break it. Look for false assumptions, hidden coupling, calibration risks, workflow friction, and places where this adds process without adding signal.

## Intent

Add a dedicated adversarial layer to Shipwright without weakening the current quality system or turning every workflow into a slow approval loop.

This plan assumes:

- the value is structural tension between producer and reviewer
- v1 should be explicit and on-demand before it becomes automatic
- adversarial review is complementary to pass/fail gates, not a replacement for them
- strong artifacts must be allowed to genuinely clear review

## Known Limitation

Red-team is not a human reviewer with different incentives, context, or lived experience. It is the same underlying model operating under a different role and rubric. That still creates useful pressure because the objective changes, but it does **not** eliminate shared-model blind spots. V1 should document this explicitly so users treat red-team as a constrained second pass, not as an oracle.

## Recommendation

Ship a narrow v1 first:

1. Add a new technical skill: `adversarial-review`
2. Add a new review-only agent: `red-team`
3. Add a new explicit command: `/challenge`
4. Teach the orchestrator to recommend red-team for high-risk artifacts
5. Do not yet add automatic invocation to every Standard or Deep workflow
6. Do not yet merge adversarial review into `evals/pass-fail.md`
7. Add an evaluation rubric for Challenge Reports themselves

## Non-Goals For V1

- no mandatory challenge step for every workflow
- no requirement that red-team always find at least one issue
- no direct rewriting by the red-team agent
- no new binary global gate in `evals/pass-fail.md`
- no multi-round defend/revise loop baked into every command

## Why This Shape Fits Shipwright

This repo already has:

- role-separated agents with explicit refusal boundaries
- self-critique embedded in several agents and skills
- a binary gate system in `evals/pass-fail.md`
- deterministic recovery playbooks in `docs/recovery-playbooks.md`

The missing layer is independent pressure-testing. The safest way to add that is as a review artifact, not as a new universal blocker.

## Artifact Model

The red-team output should be a first-class Shipwright artifact called a **Challenge Report**.

In v1, "first-class artifact" means a defined output type with a stable structure that prompts and agents can reference. It does **not** yet mean "persisted to disk automatically." Unless the PM asks to save it, the Challenge Report is conversation-native and ephemeral.

It should follow the standard top-level structure:

1. `## Context`
2. `## Analysis`
3. `## Decision Frame`
4. `## Risks and Open Questions`
5. `## Action Plan`

Inside `## Analysis`, each finding should include:

- claim challenged
- attack vector
- severity: `Critical`, `Moderate`, or `Minor`
- evidence or reasoning
- question the producing agent must answer
- what would resolve the challenge

Verdicts:

- `CLEAR`: no material issues found
- `DEFEND`: PM should decide whether to send findings back to the producing agent before treating the artifact as settled
- `ESCALATE`: the artifact's core recommendation may be wrong, not just undersupported, and PM attention is needed

## Attack Vectors

V1 should use five attack vectors derived from existing repo failure modes:

1. `Evidence Integrity`
   Probe unsourced claims, fabricated evidence, and anecdotes presented as facts.
2. `Decision Courage`
   Probe hedging, non-commitment, and recommendations that avoid falsifiability.
3. `Scope Discipline`
   Probe scope creep, unnecessary framework weight, and bloated outputs.
4. `Specificity`
   Probe boilerplate, symmetry, and template-driven analysis.
5. `Structural Honesty`
   Probe positivity smoothing, buried bad news, and comfortable conclusions.

## Calibration Rules

The red-team agent should follow these rules:

- it must review all relevant vectors for the chosen depth
- it may return `CLEAR` if no material issues are found
- every `Critical` finding must cite concrete evidence from the artifact
- every finding must include a resolution condition
- it may not rewrite the artifact itself
- it should prefer fewer strong findings over many weak nitpicks

Known failure modes to document for red-team:

- nitpicking when the artifact is already strong
- anchoring too hard on the first flaw found
- confusing disagreement with invalidity
- escalating style preferences as integrity problems
- reproducing the producing agent's own blind spots because both share the same underlying model

## Depth Model

Use the same Light / Standard / Deep pattern as the rest of Shipwright.

### Light

- top 3 highest-signal challenges only
- use when speed matters more than completeness

### Standard

- full 5-vector sweep
- default mode

### Deep

- full sweep
- require explicit falsification criteria for each major challenged claim
- require explicit "what evidence would change my mind"

Deep should not produce a full rewritten artifact or a replacement recommendation set. It should remain adversarial review, not authorship.

## File-By-File Implementation Spec

### 1. `skills/technical/adversarial-review/SKILL.md`

Purpose:

- define the adversarial-review framework
- teach the model how to generate a Challenge Report
- make the review portable outside the agent system

Required sections:

- frontmatter
- `## Description`
- `## When to Use`
- `## Depth`
- `## Framework`
- `## Minimum Evidence Bar`
- `## Output Format`
- `## Common Mistakes to Avoid`
- `## Weak vs. Strong Output`

Draft frontmatter:

```yaml
---
name: adversarial-review
description: "Stress-tests a Shipwright artifact using five attack vectors: evidence integrity, decision courage, scope discipline, specificity, and structural honesty. Produces a Challenge Report with verdict, findings, and resolution conditions."
category: technical
default_depth: standard
---
```

Draft `## When to Use`:

- after a PRD, strategy doc, design review, or technical handoff passes structural gates
- before circulating a high-stakes artifact to leadership or engineering
- when the PM wants a separate agent to challenge assumptions
- when an artifact feels polished but suspiciously comfortable

Draft `## Minimum Evidence Bar`:

- input must include the artifact under review
- if source evidence is referenced, it should also be supplied when available
- if the artifact lacks enough context to challenge responsibly, return a partial report with:
  - `Insufficient evidence to assess`
  - exact missing inputs needed
- do not invent counter-evidence
- distinguish between:
  - unsupported claim
  - weakly supported claim
  - strong claim with contestable interpretation

Draft `## Output Format`:

1. Challenge Report with:
   - review scope
   - verdict
   - findings table
2. Shipwright Signature closing:
   - Decision Frame
   - Unknowns & Evidence Gaps
   - Pass/Fail Readiness
   - Recommended Next Artifact

Draft `## Common Mistakes to Avoid`:

- treating preference disagreement as a flaw
- flagging every omission as scope failure
- demanding evidence that the producing artifact was never meant to include
- over-rotating on tone instead of decision quality
- finding one flaw and ignoring the rest of the artifact

Draft `## Weak vs. Strong Output`:

- weak: "This feels generic and maybe too vague."
- strong: "The recommendation says enterprise expansion is the priority, but no account-level evidence supports enterprise demand. Attack vector: Evidence Integrity. Severity: Moderate. Resolve by citing enterprise-specific signals or downgrading this to a hypothesis."

### 2. `agents/red-team.md`

Purpose:

- define a dedicated constructive adversary
- keep review behavior distinct from artifact production

Draft frontmatter:

```yaml
---
name: red-team
description: "Constructive adversary for Shipwright artifacts. Reviews completed outputs for structural weaknesses, unsupported claims, hedging, scope drift, generic reasoning, and buried critical issues."
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Agent
---
```

Core identity:

- pressure-tests artifacts without becoming a blocker by default
- strengthens decisions by making weak reasoning expensive
- distinguishes real flaws from stylistic preference
- acknowledges that shared-model blind spots remain possible even under a different role

Skills available:

- `/skills/technical/adversarial-review/SKILL.md`

Reference material:

- `/evals/pass-fail.md`
- `/evals/rubric.md`
- artifact-specific evals as relevant
- `/docs/failure-modes.md`
- `/docs/output-standard.md`

What the agent does not do:

- produce net-new PM artifacts
- rewrite the authoring agent's work
- replace pass/fail gates
- escalate without naming the exact issue and resolution condition
- pretend its critique is independent in the human sense; it is a constrained second pass, not a separate mind

Agent output contract:

- always produce a Challenge Report
- use `CLEAR`, `DEFEND`, or `ESCALATE`
- include only evidence-backed findings
- allow strong artifacts to pass cleanly

### 3. `commands/challenge.md`

Purpose:

- provide a simple, explicit entry point for on-demand adversarial review

Command behavior:

1. ask what artifact is being challenged
2. ask for the artifact content or file path if not already provided
3. ask preferred depth if the PM has not specified it
4. run red-team with adversarial-review
5. return the Challenge Report
6. if verdict is `DEFEND` or `ESCALATE`, ask whether the PM wants to send findings back to the producing agent

Important design choice:

Do not implement this as "read the most recent artifact in the working directory." That is too implicit and will be unreliable.

Important v1 semantic:

- `DEFEND` is advisory and PM-mediated
- the system does not automatically reopen or route to the original producing agent unless the PM chooses to do that

Draft description:

```yaml
---
name: challenge
description: "Run a red-team review against a Shipwright artifact and return a Challenge Report with verdict, findings, and resolution conditions."
---
```

### 4. `manifest.json`

Changes:

- add `adversarial-review` to `skills.technical`
- add `red-team` to `agents`
- add `challenge` to `commands`
- add `adversarial-review` to `evals`
- add routing entry:

```json
"challenge": {
  "agent": "red-team",
  "skills": ["adversarial-review"]
}
```

Expected counts after update:

- 44 skills
- 7 agents
- 16 commands

### 5. `skills-map.md`

Changes:

- add `Adversarial Review` to the Technical and Cross-Functional table
- add `red-team` to the agent capability matrix
- add `/challenge` to the workflow table
- add keyword routing for:
  - "red team"
  - "challenge this"
  - "pressure test"
  - "poke holes"
  - "stress test this artifact"

Disambiguation rule to document in the orchestrator:

- if the artifact already exists, route challenge language to red-team
- if the user is still developing the artifact and wants assumptions challenged during creation, keep the work with the producing agent

Recommended agent matrix row:

- `red-team` | pressure-tests finished artifacts for integrity, specificity, scope drift, hedging, and buried risk | `technical/adversarial-review`, evals, failure-modes | produce original artifacts or rewrite author work

### 6. `agents/orchestrator.md`

Changes:

- keep approval-first behavior unchanged
- add red-team as a recommended step for high-stakes artifacts
- do not state that red-team always runs automatically

Suggested additions:

- when the user asks for higher rigor, suggest a final red-team pass
- recommend red-team for:
  - strategy docs before leadership review
  - PRDs before engineering handoff
  - tech handoff packages before commitment
  - artifacts being shared outside the product team
  - artifacts that commit budget, headcount, or roadmap direction

Avoid this wording:

- "always run red-team after every Standard or Deep workflow"

Prefer this wording:

- "for higher-stakes artifacts, I recommend a final red-team pass before delivery"

### 7. `docs/failure-modes.md`

Add a new section:

`### Red-Team`

Suggested rows:

- `Nitpick bias`
- `False-positive escalation`
- `Anchoring on first flaw`
- `Preference masquerading as rigor`

Each row should follow the existing table pattern:

- failure mode
- what it looks like
- how to detect
- how to fix

### 8. `README.md`

Changes:

- update counts from `43 / 6 / 15` to `44 / 7 / 16`
- mention red-team lightly in the "Why this beats raw AI" section or proof section
- mention `/challenge` in the direct workflow list if desired

Suggested wording:

- "Shipwright now includes an optional adversarial review layer for pressure-testing important artifacts before delivery."

### 9. `evals/adversarial-review.md`

Purpose:

- evaluate the quality of Challenge Reports themselves
- prevent red-team from becoming the only eval-free reviewer in the system

Suggested dimensions:

1. `Finding Specificity`
2. `Severity Calibration`
3. `Evidence Grounding`
4. `Resolution Actionability`
5. `Coverage Discipline`
6. `Non-Theatrical Rigor`

This rubric should sit on top of the universal rubric in `evals/rubric.md`, the same way artifact-specific evals do.

### 10. `docs/composition-model.md`

V1 change should be minimal.

Recommended change:

- mention adversarial review as an optional post-pass review artifact

Do not yet rewrite the entire quality gate lifecycle as if red-team is universally enforced.

Good wording:

- "For high-stakes artifacts, teams may run an optional adversarial review after pass/fail gates and before final delivery."

### 11. `docs/recovery-playbooks.md`

V1 change not required.

Recovery playbooks are for gate failures, and red-team is not a gate in v1. If a later version introduces a formal defend/revise loop, add it then rather than stretching the current playbook system.

## Open Questions To Resolve Before Implementation

1. Should red-team be limited to certain artifact types in v1?
2. Should `CLEAR` be allowed with zero findings? This plan says yes.
3. Should `/challenge` support pasted text, file paths, and prior agent outputs equally?
4. At what point, if any, should red-team become automatic?
5. Should v1 allow optional saving of Challenge Reports to disk, or keep them conversation-native?

## Suggested Rollout

### Step 1

Implement the skill, agent, command, manifest, and routing docs.

### Step 2

Test manually against:

- a strong golden output
- a deliberately weak PRD
- a hedged strategy artifact
- a bloated tech handoff artifact

### Step 3

Tune calibration:

- if it over-blocks, tighten severity rules
- if it rubber-stamps, strengthen evidence and discomfort checks

### Step 4

Only after calibration, consider making it a default recommendation in more workflows.

## Verification Checklist

- `bash scripts/validate.sh` passes
- skill count is 44
- agent count is 7
- command count is 16
- `skills-map.md` references the new skill
- `manifest.json` routing includes `challenge`
- `evals/adversarial-review.md` exists and is referenced
- red-team can return `CLEAR` on a strong artifact
- red-team produces concrete findings on a weak artifact
- no docs claim adversarial review is mandatory unless the implementation truly enforces it

## Final Recommendation

Treat red-team as an optional but first-class review capability in v1.

If it proves well-calibrated, Phase 2 can promote it from "recommended challenge step" to "default high-stakes review layer." Until then, Shipwright should preserve its current contract:

- pass/fail gates block structurally weak artifacts
- rubrics improve strong artifacts
- red-team pressure-tests reasoning after the artifact is already basically sound
