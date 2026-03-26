# Using Workflows

## What workflows are

A workflow is a command (like `/discover` or `/sprint`) that chains multiple skills together in sequence. Instead of running skills one at a time, a workflow walks you through a complete process from start to finish, with each step feeding into the next.

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

## When to use what

There are three ways to get work done in Shipwright, and they're suited to different situations:

**Use the orchestrator (`/start`)** when you're not sure which skill or workflow fits, or when your task spans multiple areas. Describe what you need and it routes to the right place. Good for: "I need to prepare for a board meeting," "Help me think through this new feature idea," "What should I do before our quarterly planning?"

**Use a workflow** when you know what process you want to run end-to-end. Workflows are best for recurring PM tasks that follow a predictable structure. Good for: sprint planning every two weeks, writing a PRD for a new feature, running a retro after a launch.

**Use a skill directly** when you need one specific framework and don't need the full workflow around it. You can point the agent at any SKILL.md file and ask it to apply that framework. Good for: "Run a SWOT on our mobile strategy," "Score these features with RICE," "Map this customer's journey."

To use a skill directly, just tell the agent:
```
Read skills/strategy/swot-analysis/SKILL.md and run a SWOT analysis on [topic].
```

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

If none of these fit, type `/start` and describe what you're working on. The orchestrator will either route you to the right workflow or combine individual skills into a custom plan.

## What to expect during a workflow

Workflows are conversational, not automated. They don't just dump a finished document on you. Here's what a typical session looks like:

1. **Setup questions.** The workflow asks 2-4 questions to understand your context: what product, what feature, who's the audience, what's the timeline. Answer in as much detail as you can. The more context you give, the better the output.

2. **Step-by-step progression.** Each step produces an artifact (a tree, a draft, a matrix, a list). The workflow shows you the output and moves to the next step. You can interrupt at any point to adjust, ask questions, or redirect.

3. **Final output.** At the end, you get a complete document or package. Depending on the workflow, this might be a PRD, a sprint plan, a competitive analysis, or a metrics framework.

4. **Iteration.** The output is a strong first draft, not a final version. Review it, push back on anything that doesn't feel right, and ask the agent to revise. The frameworks give the output structure; your judgment gives it accuracy.

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
