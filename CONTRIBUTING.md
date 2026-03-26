# Contributing to Shipwright

Thanks for considering a contribution. Whether it's a new skill, a bug fix, or a workflow improvement, here's how to get started.

## Adding a new skill

Skills live in `skills/<category>/<skill-name>/SKILL.md`. Each skill is a single markdown file that teaches the AI agent a PM framework.

### File structure

```
skills/
└── strategy/                    # Pick the right category
    └── your-new-skill/
        └── SKILL.md
```

### SKILL.md format

Every skill follows the same structure:

```markdown
---
name: skill-name
description: "What this skill does and when it's useful. One paragraph."
category: category-name
---

# Skill Name

## Description
What this skill does and when it's useful. One paragraph.

## When to Use
- Bullet list of scenarios where this skill applies
- Be specific: "Evaluating a new market entry" not "Strategy stuff"

## Framework
The core teaching material. This is where the real value lives.
Include steps, templates, and markdown code blocks showing
the expected output format.

## Output Format
What the skill should produce:
1. Artifact 1 (e.g., "SWOT grid with evidence")
2. Artifact 2 (e.g., "Top 3 strategic actions")

## Common Mistakes to Avoid
- Anti-patterns the agent should watch for
- Be specific about what's wrong and what's better
```

### What makes a good skill

- **Grounded in a real framework.** "Write a strategy doc" is not a skill. "Run a SWOT analysis with cross-referenced strategic options" is.
- **Specific outputs.** The skill should produce something you can hand to your team or stakeholders, not vague advice.
- **Evidence over assertion.** Templates should have columns for "evidence" or "source," not just opinions.
- **Actionable.** Every item in the output should point toward a decision or next step.

### Naming conventions

- Skill directories use kebab-case: `swot-analysis`, `business-model-canvas`
- Category names match the existing ones: `discovery`, `strategy`, `execution`, `gtm`, `measurement`, `customer-intelligence`, `technical`, `planning`, `pricing`, `communication`
- If a skill doesn't fit an existing category, make a case for a new one in your PR description

## Adding a new workflow

Workflows live in `commands/<name>.md`. They chain skills together into multi-step processes.

### Workflow format

```markdown
---
name: workflow-name
description: "One-line description of what this workflow does."
---

# /workflow-name - Workflow Title

Brief intro (1-2 sentences) explaining the purpose.

## Workflow Steps

### Step 1: Step Name
Read and apply the framework from `/skills/category/skill-name/SKILL.md`.

Ask the PM:
- Question 1
- Question 2

Produce [artifact].

### Step 2: Step Name
[Next step, referencing the next skill...]

## Output

Produce a **[Document Name]** containing:
1. Artifact from step 1
2. Artifact from step 2
3. Recommended next steps
```

### Workflow guidelines

- Keep it to 3-5 steps. More than that and it should probably be two workflows.
- Each step should reference a specific SKILL.md file.
- Include "Ask the PM" prompts so the agent knows when to pause for input.
- End with a clear output specification.

## Updating the README and skills map

If you add a skill or workflow, your PR should also update:

1. **README.md** - Add the skill to the right table, update counts, add to the tree view
2. **skills-map.md** - Add routing entries (skill table, keyword routing, and workflow table if applicable)

## Testing your contribution

Before submitting a PR, test your skill or workflow by running it in a Claude Code session:

1. Copy your new files into a project's `.claude/` directory
2. Set up a CLAUDE.md with product context (use one of the examples in `examples/`)
3. Run the skill or workflow and check the output
4. Verify the output matches the format specified in your SKILL.md
5. Try it with different product contexts to make sure it's not too narrow

## Adding an evaluation rubric

Evaluation rubrics live in `evals/<artifact-type>.md`. They help PMs assess whether Shipwright outputs are actually good.

### Rubric format

Every rubric includes:

1. **The 4 universal dimensions** (from `evals/rubric.md`): Clarity, Completeness, Actionability, Correctness
2. **2-3 artifact-specific dimensions** with anchor descriptions at scores 3, 6, and 9
3. **A scored example** showing the concrete difference between a 6/10 and 9/10 artifact
4. **Dimension weights** for computing an overall score

### What makes a good rubric

- **Anchors are concrete, not abstract.** "Uses specific data" is better than "is evidence-based."
- **Scored examples use real-ish content.** Show actual excerpt pairs, not descriptions of what good/bad looks like.
- **Common failure modes are named.** Each dimension should describe how artifacts typically fail on that dimension.

If you add a rubric, also update `manifest.json` to register it in the `evals` array.

## Submitting a PR

1. Fork the repo
2. Create a branch (`git checkout -b add-skill-name`)
3. Add your files and update README.md + skills-map.md
4. Test your changes
5. Open a PR with a brief description of what the skill does and what framework it's based on

That's it. Keep it focused, keep it grounded in real PM practice, and it'll get merged.
