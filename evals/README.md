# Evaluation System

Shipwright skills produce structured artifacts. This directory provides rubrics for evaluating whether those artifacts are actually good — not just well-formatted, but decision-ready.

## Why evaluate

A PRD can follow the Working Backwards template perfectly and still be useless if it's full of vague language, missing evidence, and placeholder metrics. Structure is necessary but not sufficient. Rubrics close the gap between "correctly formatted" and "actually good."

## How to use the rubrics

### During a session
After a skill or workflow produces an artifact, ask the agent to score it:

```
Score this PRD against the evaluation rubric in evals/prd.md. Be honest.
```

The agent will rate each dimension, identify the weakest areas, and suggest specific improvements. This works best as a second pass — generate the artifact first, then evaluate and revise.

### For team calibration
Use the rubrics to align your team on what "good" looks like. The scored examples in each rubric show the concrete difference between a 6/10 and a 9/10 artifact. Review these in a team setting to build shared quality standards.

### For continuous improvement
Track scores across sessions. If your PRDs consistently score low on "evidence grounding," that's a signal to invest more in discovery before writing requirements — not a prompt engineering problem.

## The rubrics

| Rubric | Evaluates | Artifact-specific dimensions |
|---|---|---|
| [Universal rubric](rubric.md) | Any Shipwright artifact | Clarity, Completeness, Actionability, Correctness |
| [PRD](prd.md) | PRDs from `/write-prd` | + Scope Discipline, Evidence Grounding |
| [Strategy](strategy.md) | Strategy docs from `/strategy` | + Decision Courage, Falsifiability |
| [Design Review](design-review.md) | Design reviews from `design-review` skill | + Perspective Coverage, Tension Surfacing |

## Scoring

All dimensions use a 1-10 scale. The universal rubric defines anchor points at 3 (weak), 6 (adequate), and 9 (strong) for each dimension. Artifact-specific rubrics add their own anchors.

A practical quality bar:
- **7+ on all dimensions:** Ship-ready. Suitable for sharing with stakeholders.
- **5-6 on any dimension:** Needs revision. Identify the weak dimension and iterate.
- **Below 5 on any dimension:** Rework. The artifact has a structural gap, not just polish issues.

## Adding rubrics

To add a rubric for a new artifact type:

1. Create `evals/<artifact>.md`
2. Include the 4 universal dimensions (copy from `rubric.md`)
3. Add 2-3 artifact-specific dimensions with anchor descriptions
4. Include a scored example showing the difference between 6/10 and 9/10
5. Update `manifest.json` to register the new eval
