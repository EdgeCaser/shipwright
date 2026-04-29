# Shipwright Output Standard

This document defines what makes an artifact recognizably Shipwright. Quality is necessary, but signature consistency is what makes outputs distinctive and trustworthy at scale.

## Signature principles

Every Shipwright artifact should be:

1. **Structured** - predictable sections in a fixed order
2. **Decisive** - explicit recommendation and trade-off, not just analysis
3. **Grounded** - claims tied to specific evidence or marked as unknown
4. **Actionable** - every next step has owner + date
5. **Auditable** - clear pass/fail criteria via `evals/pass-fail.md`

## Required output pattern

For core artifacts (PRD, Strategy, Design Review, A/B Analysis), follow this section order:

1. `## Context`
2. `## Analysis`
3. `## Decision Frame`
4. `## Risks and Open Questions`
5. `## Action Plan`

Each section can contain artifact-specific sub-sections, but this top-level structure should remain stable.

## Required skill sections

Every skill (`skills/**/SKILL.md`) must include these sections in order:

1. **Frontmatter**, name, description, category, `default_depth: standard`
2. **Description**, what the skill does
3. **When to Use**, specific trigger scenarios
4. **Depth**, Light / Standard / Deep scope table with omit rules
5. **Framework**, core teaching material with steps and templates
6. **Minimum Evidence Bar**, required inputs, acceptable evidence, insufficient-evidence declaration with fallback behavior, hypothesis vs. finding distinctions
7. **Output Format**, numbered artifact list + Shipwright Signature closing
8. **Common Mistakes to Avoid**, anti-patterns
9. **Weak vs. Strong Output**, one micro-example showing bad vs. good output

The **Depth** section governs proportionality: not every problem needs every section. The **Minimum Evidence Bar** governs rigor: outputs must declare what counts as evidence and when evidence is insufficient, and must specify a deterministic fallback: either produce a partial artifact with unanswered fields marked `[TBD, requires: specific evidence]`, or stop and recommend a prerequisite skill. The **Weak vs. Strong Output** section reduces ambiguity by showing concrete examples.

## Decision Frame (required)

Every core artifact must include this block verbatim:

```markdown
## Decision Frame
- **Recommendation:** [one clear decision]
- **Trade-off:** [what we gain vs. what we give up]
- **Confidence:** [High / Medium / Low] - [why]
- **Owner:** [role or name]
- **Decision Date:** [YYYY-MM-DD]
- **Revisit Trigger:** [specific condition that would change this decision]
```

If any line is missing, the artifact is not ship-ready.

## Shipwright Signature (required closing)

Every skill output must close with four signature elements, numbered as a continuation of the skill's Output Format list:

- **Decision Frame**, Recommendation (or primary finding for discovery skills), trade-off, confidence with evidence quality, owner, decision date, revisit trigger
- **Unknowns & Evidence Gaps**, What we don't know and what evidence would resolve it
- **Pass/Fail Readiness**, Binary conditions for artifact completeness (skill-specific)
- **Recommended Next Artifact**, Which Shipwright skill to run next and why

The four elements are structurally invariant, every output includes all four. But the wording must not feel copy-pasted across skills. Vary phrasing, specificity, and emphasis to match the skill's domain. The structure is the signature; formulaic language undermines it.

### Pass/Fail gates must be depth-aware

Pass/Fail Readiness conditions must account for the Depth setting. If a skill's Light depth explicitly permits fewer sections or lighter criteria (e.g., 2 acceptance criteria instead of 3), the Pass/Fail gate must not fail a Light-mode output for meeting Light-mode rules. Write gates as: "PASS if [standard criteria]; at Light depth, PASS if [lighter criteria]."

### Recommendation boundary by category

Skills in **discovery** and **customer-intelligence** categories frame implications and options but do not prescribe product actions. Their Decision Frame states a primary finding or framed options, not a directive. Downstream recommendation belongs to strategy, execution, planning, and gtm skills.

Skills in all other categories may recommend specific actions.

This boundary is repo-wide. Individual skills should not override it.

## Tone and style

- Use direct language: prefer "We will" over "We should consider"
- Use asymmetric conclusions: avoid false balance
- Use numeric specificity where possible: baselines, targets, dates
- Mark unknowns explicitly: "No data available" is better than invented certainty
- Keep sections concise: avoid long narrative without decisions

## Evidence rules

- Every material claim must be either:
  - **Evidenced** (data source, metric, transcript, ticket volume), or
  - **Assumption** (explicitly marked as such)
- Do not blend assumptions and facts in the same sentence.
- Avoid template filler that could apply to any product.

## What breaks the signature

The following patterns indicate non-signature output:

- Generic section names with no decision framing
- Perfectly symmetrical frameworks (e.g., 4 SWOT items per quadrant by default)
- Recommendations without owner/date
- Metrics without baseline/target/timeframe
- "Balanced" conclusions that avoid commitment

## Enforcement

Use `evals/pass-fail.md` for binary gating and `evals/*.md` for scoring depth.

- **Pass/fail first** to block weak artifacts
- **Rubric score second** to improve strong artifacts

A high-scoring artifact without signature structure is still non-compliant.
