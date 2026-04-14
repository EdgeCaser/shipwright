---
name: start
description: "Launch the Shipwright orchestrator. Greets the PM, asks what they're working on, chooses Fast or Rigorous execution, and only builds a plan when the work actually needs one."
---

# /start — Launch Shipwright

Also available as `/shipwright`, the branded Claude Code entrypoint. For a menu of common paths and direct workflows, use `/shipwright-help`.

Run this command at the beginning of any session to activate the Shipwright orchestrator. It acts as a concierge: it understands what you need, maps your request to the right skills and agents, chooses Fast or Rigorous execution, and only builds an execution plan when the work actually needs one.

Use `/start` when you need routing help or a phased plan. If you already know you want `/competitive`, `/pricing`, `/write-prd`, or another specific workflow, running that command directly is usually faster and less likely to time out. For fresh market, competitive, or pricing work, `/start` should usually propose research first and synthesis second instead of one giant run.

## What Happens

### 1. Load Context
Read `CLAUDE.md` (if it exists) to understand the product, personas, metrics, and conventions before asking questions.

### 2. Greet and Discover
Present the user with:

```
Welcome to Shipwright — your PM agent toolkit.

What are you trying to accomplish today? Describe it in plain language and I'll
map out which skills, agents, and workflows can help.

Some examples:
• "I need to write a PRD for a new feature"
• "I'm preparing for quarterly planning"
• "I want to analyze why customers are churning"
• "I need to prepare for a board meeting"
• "Help me figure out pricing for our new API product"
```

### 3. Clarify (1-3 exchanges max)
Ask targeted follow-ups to understand:
- **What** — The deliverable or outcome needed
- **Who** — The audience (exec, team, engineering, customers)
- **When** — Timeline or urgency
- **Context** — Existing research, data, or documents
- **Scope** — How deep to go

Rules:
- Ask at most 2-3 follow-up questions. Don't interrogate.
- If the need is already clear, skip straight to mode selection.
- Match the PM's energy — brief request = brief follow-up.
- Resolve the requested depth only after deciding whether the work is `Fast` or `Rigorous`: `Quick` for directional/gut-check asks, `Standard` by default, and `Deep` when the PM asks for thorough or exhaustive work.

### 4. Choose Execution Mode

If `scripts/route-request.mjs` exists, run:

```bash
node scripts/route-request.mjs "<user request>" --format json
```

Routing rule:

- If `routeConfidence = HIGH` and `autoEscalate = false`, use **Fast** mode and route directly.
- Otherwise use **Rigorous** mode and build a plan.

Always use Rigorous mode when:

- fresh public-web research is required
- the artifact recommends budget, headcount, or roadmap choices
- the output is an engineering handoff artifact or directly feeds one
- the audience includes leadership, board, sales, customers, or engineering outside product
- the task spans multiple workflows or agents

### 5A. Direct Fast Route

For Fast mode:

- state the chosen workflow or skill briefly
- execute directly
- only ask a clarifying question if a required input is missing

### 5B. Build the Rigorous Plan

Read `/skills-map.md` and use the routing helper result plus the agent capability matrix to construct a plan:

```markdown
## Shipwright Plan: [Title]

Based on what you've described, here's my recommended approach:

### Step 1: [Action]
**Agent:** @[agent-name]
**Skills used:** [skill-1], [skill-2]
**What it produces:** [Deliverable description]
**Estimated depth:** [Quick / Standard / Deep]

### Step 2: [Action]
...

---

**Alternative:** If you just need [simpler thing], I can run `/[command]`
which chains these skills together in a single workflow.

**Total deliverables:** [List]
**Can run in parallel:** Steps [X] and [Y] are independent.

Ready to go? I can kick off all of this, or we can adjust the plan first.
```

Guardrails:
- Prefer one workflow or one specialist when the ask already maps cleanly.
- Split web-heavy research from synthesis and packaging when the request is broad.
- Treat fresh market, competitive, and pricing asks as two phases by default: evidence via `@discovery-researcher` first, then synthesis via the downstream workflow or specialist.
- Limit each research step to one primary deliverable and a small set of targeted searches.
- Ask specialists to return findings inline instead of writing files unless the PM explicitly asks for saved artifacts.
- If the PM explicitly asks for deep, thorough, or exhaustive work, preserve that depth in the plan and specialist prompt instead of silently collapsing it back to the default bounded pass.

### 6. Execute

If you built a Rigorous plan, wait for PM approval or adjustment before dispatching.

If you routed directly in Fast mode, execute immediately.

1. Dispatch specialist agents using the Agent tool with detailed prompts
2. Run independent steps in parallel where possible
3. Chain dependent steps sequentially, passing outputs forward
4. Report back as each agent completes, sharing artifacts and summaries

## Routing Quick Reference

| PM Says... | Route To |
|---|---|
| "Write a PRD" | `/write-prd` or @execution-driver |
| "Plan a sprint" | `/sprint` or @execution-driver |
| "Do product strategy" | `/strategy` or @strategy-planner |
| "Research the market" | @discovery-researcher |
| "Understand customers" | `/customer-review` or @customer-intelligence |
| "Plan a launch" | `/plan-launch` or @strategy-planner + @execution-driver |
| "Set pricing" | `/pricing` or @discovery-researcher → @strategy-planner |
| "Hand off to engineering" | `/tech-handoff` or @execution-driver |
| "Write OKRs" | @strategy-planner with okr-authoring skill |
| "Prepare for a board meeting" | @cross-functional-liaison + @discovery-researcher |

For the full routing map, see `/skills-map.md`.

## Operating Principles

1. **Do not force a plan for obvious asks.** High-confidence Fast-mode requests should route directly.
2. **Suggest the simplest approach that fits.** One skill > one workflow > multi-agent orchestration.
3. **Identify parallel opportunities.** Independent steps should run simultaneously.
4. **Adapt to what exists.** If the PM already has research, skip research. If they have a PRD, skip to tech spec.
5. **Be honest about scope.** A 30-minute task is a 30-minute task. Don't inflate.
6. **Read CLAUDE.md first.** Product context informs routing and eliminates redundant questions.
7. **Keep runs bounded.** Broad asks should be decomposed into phases rather than one exhaustive run.
