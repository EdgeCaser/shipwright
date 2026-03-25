# Shipwright

**40 battle-tested PM skills, 6 dedicated agents, 9 chained workflows, and an orchestrator concierge for Claude Code, Cowork, and AI coding agents.**

Shipwright turns your AI assistant into a product management operating system. Each skill encodes a proven PM framework — not as a prompt template, but as deep domain knowledge the agent draws on during conversation.

---

## What's Inside

```
shipwright/
├── agents/                              # 6 dedicated PM agents
│   ├── orchestrator.md                  #   ★ Concierge — routes work to specialists
│   ├── discovery-researcher.md          #   Autonomous research & synthesis
│   ├── strategy-planner.md              #   Strategic artifacts & trade-off analysis
│   ├── execution-driver.md              #   Work decomposition & delivery ops
│   ├── customer-intelligence.md         #   Continuous customer signal synthesis
│   └── cross-functional-liaison.md      #   Communication, alignment & coordination
│
├── skills/                              # 40 PM skills organized by lifecycle phase
│   ├── discovery/                       #   Research & customer understanding
│   │   ├── opportunity-solution-tree/
│   │   ├── discovery-interview-prep/
│   │   ├── user-research-synthesis/
│   │   ├── jobs-to-be-done/
│   │   ├── competitive-landscape/
│   │   └── market-sizing/
│   │
│   ├── strategy/                        #   Vision, positioning & planning
│   │   ├── product-strategy-session/
│   │   ├── positioning-statement/
│   │   ├── pestel-analysis/
│   │   ├── lean-canvas/
│   │   ├── roadmap-planning/
│   │   └── prioritization-advisor/
│   │
│   ├── execution/                       #   PRDs, stories & sprint ops
│   │   ├── prd-development/
│   │   ├── user-story-writing/
│   │   ├── epic-breakdown/
│   │   ├── sprint-planning/
│   │   ├── pre-mortem/
│   │   └── release-notes/
│   │
│   ├── gtm/                             #   Go-to-market & growth
│   │   ├── go-to-market-strategy/
│   │   ├── competitive-battlecard/
│   │   └── growth-loops/
│   │
│   ├── measurement/                     #   Metrics, experiments & retros
│   │   ├── metrics-dashboard/
│   │   ├── ab-test-analysis/
│   │   ├── retrospective-facilitator/
│   │   └── stakeholder-communication/
│   │
│   ├── customer-intelligence/           #   ★ NEW — Customer signals & health
│   │   ├── feedback-triage/
│   │   ├── customer-journey-mapping/
│   │   ├── churn-analysis/
│   │   └── customer-advisory-board/
│   │
│   ├── technical/                       #   ★ NEW — Technical PM skills
│   │   ├── technical-spec/
│   │   ├── design-review/
│   │   └── api-product-design/
│   │
│   ├── planning/                        #   ★ NEW — Alignment & decision-making
│   │   ├── okr-authoring/
│   │   ├── stakeholder-mapping/
│   │   └── decision-log/
│   │
│   ├── pricing/                         #   ★ NEW — Pricing & monetization
│   │   ├── pricing-strategy/
│   │   └── monetization-experiments/
│   │
│   └── communication/                   #   ★ NEW — Influence & documentation
│       ├── meeting-notes/
│       ├── executive-briefing/
│       └── product-narrative/
│
├── commands/                            # 9 chained workflows
│   ├── start.md                         #   ★ /start — launch the orchestrator
│   ├── discover.md                      #   /discover — full discovery cycle
│   ├── write-prd.md                     #   /write-prd — Working Backwards PRD
│   ├── plan-launch.md                   #   /plan-launch — GTM launch plan
│   ├── sprint.md                        #   /sprint — sprint planning
│   ├── strategy.md                      #   /strategy — strategy workshop
│   ├── pricing.md                       #   ★ /pricing — pricing strategy
│   ├── customer-review.md               #   ★ /customer-review — VoC intelligence
│   └── tech-handoff.md                  #   ★ /tech-handoff — PM → engineering
│
├── skills-map.md                        # ★ Orchestrator routing reference
│
├── examples/
│   └── CLAUDE.md.example                # Product context template (with auto-start)
│
├── LICENSE                              # MIT
└── README.md                            # You are here
```

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/shipwright.git
```

### 2. Copy skills into your project

```bash
# Copy everything
cp -r shipwright/skills/ your-project/.claude/skills/
cp -r shipwright/agents/ your-project/.claude/agents/
cp -r shipwright/commands/ your-project/.claude/commands/

# Or just the skills you need
cp -r shipwright/skills/execution/prd-development/ your-project/.claude/skills/prd-development/
```

### 3. Set up your product context

```bash
cp shipwright/examples/CLAUDE.md.example your-project/CLAUDE.md
# Edit CLAUDE.md with your product details
```

### 4. Start using

Type `/start` to launch the orchestrator. It greets you, asks what you're working on, builds an execution plan, and dispatches the right agents — no need to memorize skill names.

```
/start             — Launch the orchestrator concierge  ★ NEW
/discover          — Run a full discovery cycle
/write-prd         — Generate a Working Backwards PRD
/plan-launch       — Build a GTM launch plan
/sprint            — Prepare a sprint plan
/strategy          — Facilitate a strategy session
/pricing           — Build a pricing strategy
/customer-review   — Customer intelligence review
/tech-handoff      — PM → engineering handoff package
```

### 5. (Optional) Auto-start on session launch

Add this to your `.claude/settings.json` so the orchestrator runs automatically when you open a session:

```json
{
  "hooks": {
    "session_start": [
      { "command": "/start" }
    ]
  }
}
```

Agents are invoked for parallel, autonomous work (or let the orchestrator dispatch them for you):

```
@orchestrator            — Concierge: routes work to the right agent     ★ NEW
@discovery-researcher    — Research, competitive analysis, market sizing
@strategy-planner        — Roadmaps, positioning, PRDs, prioritization
@execution-driver        — Epics, stories, sprint plans, release notes
@customer-intelligence   — Feedback triage, churn signals, VoC reports
@cross-functional-liaison — Meeting notes, exec updates, decision logs
```

---

## The 40 Skills

### Discovery & Research (6)

| Skill | What It Does | Framework |
|---|---|---|
| **Opportunity Solution Tree** | Maps outcomes → opportunities → solutions → experiments | Teresa Torres |
| **Discovery Interview Prep** | Interview guides, screeners, and debrief templates | The Mom Test / JTBD |
| **User Research Synthesis** | Raw notes → themed insight cards with evidence trails | Affinity Mapping |
| **Jobs-to-Be-Done** | Job statements, outcome mapping, and opportunity scoring | Christensen / Ulwick |
| **Competitive Landscape** | Feature matrices, positioning maps, strategic posture | Porter's Five Forces |
| **Market Sizing** | TAM/SAM/SOM with top-down, bottom-up, and triangulation | Standard VC methodology |

### Strategy & Planning (6)

| Skill | What It Does | Framework |
|---|---|---|
| **Product Strategy Session** | Vision, bets, boundaries, and success criteria | Marty Cagan / Inspired |
| **Positioning Statement** | Competitive alternatives → unique attributes → value → positioning | April Dunford / Geoffrey Moore |
| **PESTEL Analysis** | Macro environment scan across 6 dimensions | PESTEL |
| **Lean Canvas** | One-page business model with 9 validated boxes | Ash Maurya / Lean Startup |
| **Roadmap Planning** | Outcome-based Now/Next/Later with RICE scoring | RICE + Now/Next/Later |
| **Prioritization Advisor** | RICE, ICE, Kano, MoSCoW, and weighted scoring | Multiple frameworks |

### Execution & Delivery (6)

| Skill | What It Does | Framework |
|---|---|---|
| **PRD Development** | Working Backwards: press release → FAQ → full requirements | Amazon Working Backwards |
| **User Story Writing** | INVEST stories with Given/When/Then acceptance criteria | Mike Cohn |
| **Epic Breakdown** | Initiative → shippable epics with hypotheses and metrics | Lean UX |
| **Sprint Planning** | Goals, capacity, scope selection, risk assessment | Scrum |
| **Pre-Mortem** | Structured failure imagination to surface risks early | Gary Klein |
| **Release Notes** | Tickets → polished notes segmented by audience | Multi-audience comms |

### Go-to-Market & Growth (3)

| Skill | What It Does | Framework |
|---|---|---|
| **Go-to-Market Strategy** | Beachhead → ICP → messaging → channels → launch timeline | Geoffrey Moore |
| **Competitive Battlecard** | Sales-ready cards with objection handling and landmines | Sales Enablement |
| **Growth Loops** | Map acquisition, engagement, and monetization loops | Reforge |

### Measurement & Iteration (4)

| Skill | What It Does | Framework |
|---|---|---|
| **Metrics Dashboard** | North Star → input metrics → guardrails → counter-metrics | Amplitude / Sean Ellis |
| **A/B Test Analysis** | Statistical rigor, segment analysis, ship/no-ship decisions | Frequentist / Bayesian |
| **Retrospective Facilitator** | Start/Stop/Continue, 4Ls, Sailboat, Mad/Sad/Glad | Agile Retrospectives |
| **Stakeholder Communication** | Exec updates, steering committee decks, risk escalations | Pyramid Principle |

### Customer Intelligence (4) ★ NEW

| Skill | What It Does | Framework |
|---|---|---|
| **Feedback Triage** | Multi-channel feedback → categorized, deduplicated, prioritized themes | Affinity Mapping |
| **Customer Journey Mapping** | End-to-end journey maps with touchpoints, emotions, and drop-offs | Service Design |
| **Churn Analysis** | Diagnose why users leave, design staged retention interventions | Retention Playbook |
| **Customer Advisory Board** | CAB agenda design, discussion guides, and synthesis templates | Strategic Advisory |

### Technical & Cross-Functional (3) ★ NEW

| Skill | What It Does | Framework |
|---|---|---|
| **Technical Spec** | PRD → engineering-ready spec with API contracts, data models, ADRs | ADR / RFC |
| **Design Review** | 7-perspective parallel review: Eng, Design, Exec, Legal, Customer, Devil's Advocate, Sales | Multi-stakeholder review |
| **API Product Design** | API endpoint design, DX, versioning, documentation, developer onboarding | REST / DX best practices |

### Planning & Alignment (3) ★ NEW

| Skill | What It Does | Framework |
|---|---|---|
| **OKR Authoring** | Draft, cascade, and audit OKRs with anti-pattern detection | Measure What Matters |
| **Stakeholder Mapping** | Power × Interest grids with engagement strategies and tracking | Mendelow's Matrix |
| **Decision Log** | Structured PDRs with context, options, rationale, and revisit triggers | ADR (adapted for product) |

### Pricing & Monetization (2) ★ NEW

| Skill | What It Does | Framework |
|---|---|---|
| **Pricing Strategy** | Value metric, model comparison, WTP research, competitive pricing, packaging | Van Westendorp / Gabor-Granger |
| **Monetization Experiments** | Design pricing/packaging experiments with guardrails and kill criteria | Experimentation rigor |

### Communication & Influence (3) ★ NEW

| Skill | What It Does | Framework |
|---|---|---|
| **Meeting Notes** | Raw notes → structured summaries with decisions, actions, questions | Meeting intelligence |
| **Executive Briefing** | One-page SCR (Situation-Complication-Resolution) for leadership asks | SCR / Pyramid Principle |
| **Product Narrative** | Amazon-style 6-pager memos for complex product decisions | Amazon 6-pager |

---

## The 6 Agents

| Agent | Purpose | When to Use |
|---|---|---|
| **Orchestrator** ★ | Concierge agent. Understands what you need, maps it to the right skills/agents/workflows, builds a plan, dispatches work on approval. | Every session — type `/start` or configure auto-start |
| **Discovery Researcher** | Gathers evidence. Competitive analysis, market sizing, interview synthesis. Never recommends — surfaces evidence only. | Before discovery sprints, strategy sessions, new market evaluation |
| **Strategy Planner** | Translates research into strategic artifacts. Challenges assumptions, makes trade-offs explicit. | Quarterly planning, PRD authoring, roadmap reviews |
| **Execution Driver** | Turns strategy into shippable work. Epics, stories, sprint plans, release notes. | Sprint planning, backlog grooming, release prep |
| **Customer Intelligence** | Continuous customer signal synthesis. Feedback triage, churn detection, journey friction, VoC reports. | Monthly/quarterly reviews, churn spikes, product launches |
| **Cross-Functional Liaison** | Handles coordination work. Meeting notes, stakeholder updates, decision logging, alignment tracking. | Daily PM operations, exec communication, decision capture |

### How the Orchestrator Works

The orchestrator is the front door to Shipwright. Instead of memorizing 40 skill names, you describe what you need in plain language and the orchestrator:

1. **Understands** — Asks 1-3 clarifying questions to nail down the deliverable, audience, timeline, and scope
2. **Plans** — Maps your need to the right combination of skills, agents, and workflows using the skills map
3. **Executes** — Dispatches specialist agents (in parallel where possible) and reports back with artifacts

The orchestrator never does the work itself — it routes to specialists. This keeps each agent focused and prevents a single agent from trying to do everything.

### Agent Separation of Concerns

```
Orchestrator routes work.    →  orchestrator
Research doesn't recommend.  →  discovery-researcher
Strategy doesn't execute.    →  strategy-planner
Execution doesn't strategize.→  execution-driver
Intelligence doesn't decide. →  customer-intelligence
Communication doesn't opine. →  cross-functional-liaison
```

This separation prevents confirmation bias, keeps the PM in the decision seat, and ensures each agent stays focused on what it does best.

---

## The 9 Workflows

| Command | Skills Chained | What It Produces |
|---|---|---|
| `/start` ★ | Orchestrator → Skills Map → Agent Dispatch | Execution plan + dispatched agents |
| `/discover` | OST → Assumptions → Prioritization → Experiments | Discovery Report with experiment backlog |
| `/write-prd` | Press Release → FAQ → User Stories → Full PRD | Complete Working Backwards PRD |
| `/plan-launch` | GTM Strategy → ICP → Positioning → Battlecard → Timeline | GTM Launch Plan |
| `/sprint` | Sprint Goal → Capacity → Story Selection → Risk Check | Sprint Plan with agreement |
| `/strategy` | Vision → Bets → Boundaries → Pre-Mortem → Success Criteria | Product Strategy Document |
| `/pricing` | Value Metric → Model → Competitive → WTP → Packaging → Experiment | Pricing Strategy with validation plan |
| `/customer-review` | Feedback Triage → Journey Map → Churn Analysis → Exec Briefing | Customer Intelligence Report |
| `/tech-handoff` | PRD → Tech Spec → Design Review → Epics → Stories | Complete engineering handoff package |

---

## Best Ways to Use Shipwright

### Start here (Day 1)

The fastest way to get value is three steps: fill in `CLAUDE.md` with your product context, type `/start`, and describe what you're working on in plain language. The orchestrator handles the rest — it figures out which skills and agents to use so you don't have to memorize anything.

### Pick one painful workflow and automate it first

Don't try to adopt all 40 skills at once. Think about the thing you do every week that feels repetitive — writing sprint plans, triaging feedback, drafting stakeholder updates — and start there. Run the relevant command a few times, tweak the output to match your team's style, and build trust before expanding.

### Let research and strategy run in parallel

One of the biggest time-savers is dispatching independent agents simultaneously. While the discovery researcher is pulling competitive intelligence, the strategy planner can be drafting your positioning. The orchestrator does this automatically when it detects steps that don't depend on each other, but you can also invoke agents directly:

```
@discovery-researcher  "Research the competitive landscape for [feature area]"
@strategy-planner      "Draft positioning for [product] against [competitor]"
```

### Use CLAUDE.md as your product's single source of truth

Every agent and skill reads `CLAUDE.md` before doing anything. The more complete it is — personas, metrics, strategic priorities, glossary, conventions — the less you have to repeat yourself. Update it when your strategy shifts and every future session inherits the new context automatically.

### Chain skills for end-to-end workflows

Individual skills produce focused artifacts. Commands chain them into complete workflows. For example, `/tech-handoff` runs PRD → Technical Spec → Design Review → Epic Breakdown → User Stories in sequence, each step feeding the next. If the built-in commands don't match your flow, create your own by copying an existing command and swapping out the skills.

### Connect your tools via MCP

Shipwright gets dramatically more useful when agents can read from and write to your actual tools. With MCP integrations for Jira, Slack, Notion, Amplitude, or Linear, agents can pull real tickets, real metrics, and real customer feedback instead of working from descriptions you paste in.

### Keep the PM in the decision seat

The agents are designed with strict separation of concerns — research doesn't recommend, strategy doesn't execute, intelligence doesn't decide. This is intentional. The agents give you structured artifacts and evidence; you make the calls. If an agent ever tries to make a decision for you, that's a signal to review the output more carefully.

### Version your skills alongside your product

Check your `.claude/skills/` directory into git. As your product evolves, your frameworks should too. A Series A startup's prioritization skill looks different from a growth-stage company's. Treat skills like living documentation.

## Tips & Best Practices

1. **Start with CLAUDE.md** — Give the agent persistent context about your product, users, and conventions
2. **Start small** — Pick 3-5 skills that match your most painful weekly tasks, build confidence, then expand
3. **Chain skills into workflows** — Individual skills are useful; chained commands are powerful
4. **Separate research from decisions** — The discovery agent surfaces evidence; the PM decides
5. **Version your skills** — Check `.claude/skills/` into git; your templates should evolve with your product
6. **Connect your tools** — MCP integrations (Jira, Slack, Notion, Amplitude) make agents dramatically more useful
7. **Use agents for parallel work** — Kick off research while simultaneously drafting strategy
8. **Document decisions** — Use the decision-log skill religiously; future-you will be grateful

---

## Frameworks Referenced

This toolkit stands on the shoulders of established PM methodology:

- Teresa Torres — *Continuous Discovery Habits*
- Marty Cagan — *Inspired* and *Empowered*
- April Dunford — *Obviously Awesome*
- Geoffrey Moore — *Crossing the Chasm*
- Rob Fitzpatrick — *The Mom Test*
- Ash Maurya — *Running Lean*
- John Doerr — *Measure What Matters*
- Clayton Christensen / Tony Ulwick — Jobs-to-Be-Done
- Gary Klein — Pre-Mortem / Prospective Hindsight
- Barbara Minto — The Pyramid Principle
- Sean Ellis — North Star Framework
- Reforge — Growth Loops
- Amazon — Working Backwards / 6-Pager Memos

---

## Contributing

PRs welcome. If you've built a PM skill that's battle-tested in your workflow, open a PR with:

1. A new skill directory under the appropriate category
2. A `SKILL.md` following the existing format (Description, When to Use, Framework, Output Format, Common Mistakes)
3. An update to this README's skill table

---

## Acknowledgments

Shipwright was informed by the growing community of PM-meets-AI practitioners, including:

- [Pawel Huryn's PM Skills Marketplace](https://github.com/phuryn/pm-skills) (65 skills, 8 plugins)
- [Dean Peters' Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) (46 skills)
- [Sachin Rekhi's Claude Code for PMs](https://www.sachinrekhi.com/p/claude-code-for-product-managers)
- [prodmgmt.world](https://www.prodmgmt.world/claude-code) plugin directory
- [ccforpms.com](https://ccforpms.com/) free PM course
- [VoltAgent's awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

---

## License

MIT — use it, fork it, ship it.
