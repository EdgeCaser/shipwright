---
name: quality-check
description: "Score recent Shipwright artifacts against core rubric dimensions to detect quality drift over time."
---

# /quality-check — Artifact Quality Audit

Run this command to review recent Shipwright artifacts and track whether output quality is trending up, down, or holding steady.

## Workflow Steps

### Step 1: Identify Artifacts

Ask the PM:

- Which recent artifacts should be reviewed?
- Are they pasted here, available as file paths, or available from prior session context?

If the PM is unsure, offer to review the last 3-5 artifacts from the current session or project. List each candidate with:

- Artifact name and type (PRD, strategy doc, research brief, etc.)
- Date produced
- Producing workflow or agent (if known)

Confirm the final list before scoring.

### Step 2: Score Each Artifact

Read and apply `/evals/rubric.md` (the universal 4 dimensions: Clarity, Completeness, Actionability, Correctness). Use the anchored scale:

- **3** = weak — significant gaps or confusion
- **6** = adequate — meets the bar, no major issues
- **9** = strong — notably sharp, thorough, and ready to act on

If an artifact-specific eval exists (e.g., a PRD eval, a strategy eval), layer those criteria on top and note any additional dimension scores separately.

For each artifact, record:

1. Scores on each of the 4 universal dimensions (1-9)
2. A one-line rationale per dimension citing specific evidence from the artifact
3. An overall quality band: **Below Bar** (<18 total), **At Bar** (18-27), **Above Bar** (28+)

### Step 3: Trend Analysis

Produce a comparison table with artifacts as rows and dimensions as columns. Include the overall band for each.

Then analyze:

- Any dimension where scores are declining across artifacts
- Any dimension that is consistently weak regardless of artifact type
- Patterns tied to specific workflows or agents (e.g., "strategy artifacts score low on Actionability")
- Dimensions that are improving or consistently strong

Flag the single most concerning trend and the single strongest pattern.

### Step 4: Recommendations

Based on findings, provide:

1. **Failure modes to watch** — reference specific modes from `docs/failure-modes.md` that match the observed weaknesses
2. **Recovery playbooks** — suggest which playbooks or skills to apply for artifacts scoring Below Bar
3. **Agent instruction tightening** — if a specific agent or workflow is consistently producing lower-quality output, recommend targeted instruction changes

Keep recommendations to 3-5 items. Each must be specific and actionable.

## Output

Produce a **Quality Audit Report** containing:

1. Artifact scores table (artifact x dimension matrix with totals and bands)
2. Trend observations (declining, stable, or improving per dimension)
3. Top concern and top strength
4. Recommended actions with references to failure modes and recovery playbooks
