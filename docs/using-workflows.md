# Using Workflows

## What workflows are

A workflow is a command (like `/discover` or `/sprint`) that chains multiple skills together in sequence. Instead of running skills one at a time, a workflow walks you through a complete process from start to finish, with each step feeding into the next.

If you want the technical model behind this, see [composition-model.md](composition-model.md): `Workflow = graph(Skills)`, `Agent = constrained executor`, `Orchestrator = planner over graph`.

For example, the `/write-prd` workflow runs five steps in order:
1. Write a press release (forces you to articulate the customer value)
2. Draft an FAQ (surfaces hard questions early)
3. Write user stories (turns the vision into concrete behaviors)
4. Assemble the full PRD (combines everything into a structured requirements doc)
5. Review and sharpen (checks for gaps and inconsistencies)

You don't need to know which skills are involved or in what order. The workflow handles the sequencing. You just answer the questions it asks at each step.

## How to run a workflow

Type the command at any point in a Claude Code session:

```
/write-prd
```

That's it. The workflow will:
1. Ask you a few questions to set context (what feature, who's it for, what problem does it solve)
2. Work through each step, producing artifacts along the way
3. Pause at decision points to check in with you
4. Deliver the final output at the end

You can also type `/start` and describe what you need in plain language. The orchestrator will figure out which workflow to run and kick it off for you.

If you already have a finished artifact and want a separate adversarial pass before sharing it, run `/challenge`.

## When to use what

There are three ways to get work done in Shipwright, and they're suited to different situations:

**Use the orchestrator (`/start`)** when you're not sure which skill or workflow fits, or when your task spans multiple areas. Describe what you need and it routes to the right place. Good for: "I need to prepare for a board meeting," "Help me think through this new feature idea," "What should I do before our quarterly planning?"

**Use a workflow** when you know what process you want to run end-to-end. Workflows are best for recurring PM tasks that follow a predictable structure. Good for: sprint planning every two weeks, writing a PRD for a new feature, running a retro after a launch.

**Use a skill directly** when you need one specific framework and don't need the full workflow around it. You can point the agent at any SKILL.md file and ask it to apply that framework. Good for: "Run a SWOT on our mobile strategy," "Score these features with RICE," "Map this customer's journey."

To use a skill directly, just tell the agent:
```
Read skills/strategy/swot-analysis/SKILL.md and run a SWOT analysis on [topic].
```

## The 3 most common paths

Most PM work follows one of three patterns. Each path chains 3 workflows, where the output of one feeds the next.

### Path 1: New Feature — from evidence to engineering handoff

```
/discover  →  /write-prd  →  /tech-handoff
```

**When to use it:** You have a feature idea or customer problem and need to take it from "we should build something" to "engineering can start working."

**What to prepare:** Customer evidence (interview notes, support tickets, usage data), the problem hypothesis, and who the feature is for.

**What happens at each stage:**

1. **`/discover`** (30-60 min) — Maps the opportunity space using an Opportunity Solution Tree, identifies assumptions, prioritizes by risk, and designs experiments. You'll push back on assumptions and decide which to validate.
2. **`/write-prd`** (45-90 min) — Starts with a press release (forces customer-first thinking), drafts an FAQ (surfaces hard questions), writes user stories, then assembles the full PRD. You'll review each phase before moving on.
3. **`/tech-handoff`** (90-180 min) — Takes the PRD and produces a technical spec, runs a 7-perspective design review, breaks the spec into epics, and writes stories with acceptance criteria.

**What you'll have at the end:** A discovery report, a Working Backwards PRD, a tech spec, a design review with verdicts, epics, and developer-ready stories.

### Path 2: Quarterly Planning — from customer signals to OKRs

```
/customer-review  →  /strategy  →  /okrs
```

**When to use it:** It's the start of a quarter (or half) and you need to set product direction grounded in what customers are actually saying.

**What to prepare:** Customer feedback from the past quarter (NPS comments, support themes, churn data, CAB notes), current metrics, and strategic priorities from leadership.

**What happens at each stage:**

1. **`/customer-review`** (45-90 min) — Triages feedback, maps the customer journey, analyzes churn patterns, and produces an executive briefing. You'll validate whether the synthesis matches your intuition.
2. **`/strategy`** (60-120 min) — Builds a product vision, defines 2-4 strategic bets with falsifiable theses and kill criteria, sets explicit boundaries ("what we're NOT doing"), and runs a pre-mortem.
3. **`/okrs`** (30-60 min) — Drafts OKRs aligned to strategic bets, audits them against common anti-patterns (KRs as tasks, vague objectives, sandbagging), and checks alignment across teams.

**What you'll have at the end:** A customer intelligence report, a product strategy document with bets and boundaries, and audited OKRs with scoring criteria.

### Path 3: Launch — from strategy to shipped sprint

```
/strategy  →  /plan-launch  →  /sprint
```

**When to use it:** You have something ready to ship and need the go-to-market plan and execution sprint to get it out the door.

**What to prepare:** The feature or product to launch, target audience, competitive context, and available engineering capacity for the sprint.

**What happens at each stage:**

1. **`/strategy`** (60-120 min) — Locks in positioning, competitive differentiation, and strategic bets for the launch. You'll decide what success looks like.
2. **`/plan-launch`** (60-90 min) — Builds the GTM strategy (beachhead, ICP, messaging), creates competitive battlecards, drafts positioning, and produces a launch timeline.
3. **`/sprint`** (20-40 min) — Plans the execution sprint: goal, capacity, story selection, dependency mapping, and risk check.

**What you'll have at the end:** A strategy doc, a GTM launch plan with positioning and battlecards, and a sprint plan with stories and capacity allocation.

---

## Picking the right workflow

| I need to... | Run this |
|---|---|
| Figure out what to build next | `/discover` |
| Write requirements for a feature | `/write-prd` |
| Prepare for a product launch | `/plan-launch` |
| Plan the next sprint | `/sprint` |
| Set product direction for the quarter | `/strategy` |
| Figure out how to price something | `/pricing` |
| Understand what customers are telling us | `/customer-review` |
| Hand a feature off to engineering | `/tech-handoff` |
| Build user personas | `/personas` |
| Understand the competitive landscape | `/competitive` |
| Design a metrics framework | `/metrics` |
| Write or review OKRs | `/okrs` |
| Run a team retrospective | `/retro` |
| Write a memo or executive briefing | `/narrative` |
| Pressure-test a finished artifact | `/challenge` |

If none of these fit, type `/start` and describe what you're working on. The orchestrator will either route you to the right workflow or combine individual skills into a custom plan.

## What to expect during a workflow

Workflows are conversational, not automated. They don't just dump a finished document on you. Here's what a typical session looks like:

1. **Setup questions.** The workflow asks 2-4 questions to understand your context: what product, what feature, who's the audience, what's the timeline. Answer in as much detail as you can. The more context you give, the better the output.

2. **Step-by-step progression.** Each step produces an artifact (a tree, a draft, a matrix, a list). The workflow shows you the output and moves to the next step. You can interrupt at any point to adjust, ask questions, or redirect.

3. **Final output.** At the end, you get a complete document or package. Depending on the workflow, this might be a PRD, a sprint plan, a competitive analysis, or a metrics framework.

4. **Iteration.** The output is a strong first draft, not a final version. Review it, push back on anything that doesn't feel right, and ask the agent to revise. The frameworks give the output structure; your judgment gives it accuracy.

Before sharing externally, run [evals/pass-fail.md](../evals/pass-fail.md). If a gate fails, apply the matching fix from [recovery-playbooks.md](recovery-playbooks.md).

## How long workflows take

It depends on how much context you have ready and how much back-and-forth you want. Rough estimates:

| Workflow | Typical time |
|---|---|
| `/sprint`, `/retro` | 15-30 min |
| `/discover`, `/personas`, `/metrics`, `/okrs` | 30-60 min |
| `/write-prd`, `/competitive`, `/customer-review`, `/narrative` | 45-90 min |
| `/plan-launch`, `/strategy`, `/pricing` | 60-90 min |
| `/tech-handoff` | 90-180 min |

These times assume you're actively participating. The agent needs your input at each step, so leaving and coming back will add time.

## Building your own workflows

The built-in workflows are just markdown files in `commands/`. Each one lists the steps, references the skills to use, and describes the expected output.

To build your own:
1. Copy an existing workflow file (e.g., `commands/discover.md`)
2. Rename it to match your process (e.g., `commands/quarterly-review.md`)
3. Swap out the steps and skill references to match your team's process
4. Use it by typing the command name (e.g., `/quarterly-review`)

Look at a few existing workflows to get a feel for the format. They're short (40-70 lines) and straightforward.
