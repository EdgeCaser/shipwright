# Review Exchange Guidance

Use these instructions when working under `docs/review/`.

## Purpose

This directory holds the written exchange between agents reviewing the conflict harness, its implementation, its results, and its methodology.

These files are not generic notes. They are part of the project’s evidentiary record.

Optimize for:

- clear claims
- direct responses
- visible uncertainty
- faithful representation of what the code or results actually show

## File Conventions

- Keep filenames stable and descriptive, matching the review round or analysis stage.
- Update `README.md` when adding a new review memo or response so the exchange remains navigable.
- Preserve the alternating dialogue pattern when it exists: Claude memo, Codex response, next Claude memo, and so on.

## Writing Rules

- Lead with the main finding or conclusion.
- Separate:
  - confirmed observations
  - interpretations
  - open questions
  - recommendations
- If you are inferring beyond the data, say so explicitly.
- Quote or paraphrase run results accurately; do not smooth over incomplete matrices or contradictory evidence.
- Do not overclaim from partial coverage, small samples, or single-run results.

## Review Style

- Be candid, specific, and respectful.
- Prefer “this evidence supports X” over “this proves X” unless the claim is genuinely locked down.
- When something is promising but not yet solid, say that clearly.
- When criticizing methodology, propose the next control or experiment that would resolve the concern.

## Methodology Guardrails

- Distinguish protocol failures from substantive findings.
- Distinguish judge disagreement from side-generation disagreement.
- Distinguish scenario-count bookkeeping issues from actual experimental effects.
- Treat replication and variance as first-class methodological issues, not footnotes.
- If a claim depends on unpublished or incomplete reruns, label it provisional.

## Good Response Shape

For most review replies, a strong structure is:

1. what holds up
2. what does not yet hold up
3. what should be done next

Do not add filler, throat-clearing, or exaggerated certainty.
