# Shipwright

[![GitHub stars](https://img.shields.io/github/stars/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**42 PM skills, 6 agents, 15 workflows, and an orchestrator for Claude Code.**

I got tired of re-explaining product context to AI assistants every session, and I got tired of writing the same PRDs and sprint plans from scratch. Shipwright is what came out of that frustration: a collection of PM frameworks encoded as Claude Code skills, plus agents that know how to use them together.

It's not a prompt library. Each skill carries real framework knowledge (Teresa Torres, Marty Cagan, April Dunford, etc.) and produces structured artifacts you can actually hand to your team.

The skills are plain markdown, so they work with Claude Code, Cursor, Codex, and any other AI coding agent that reads skill files. See the [cross-tool install guide](docs/installing-in-other-tools.md) for setup instructions.

---

## What's Inside

```
shipwright/
├── agents/                              # 6 PM agents
│   ├── orchestrator.md                  #   Routes work to the right specialist
│   ├── discovery-researcher.md          #   Research & synthesis
│   ├── strategy-planner.md              #   Strategic artifacts & trade-offs
│   ├── execution-driver.md              #   Work breakdown & delivery
│   ├── customer-intelligence.md         #   Customer signal synthesis
│   └── cross-functional-liaison.md      #   Coordination & communication
│
├── skills/                              # 42 skills organized by lifecycle phase
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
│   │   ├── business-model-canvas/
│   │   ├── swot-analysis/
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
│   ├── customer-intelligence/           #   Customer signals & health
│   │   ├── feedback-triage/
│   │   ├── customer-journey-mapping/
│   │   ├── churn-analysis/
│   │   └── customer-advisory-board/
│   │
│   ├── technical/                       #   Technical PM skills
│   │   ├── technical-spec/
│   │   ├── design-review/
│   │   └── api-product-design/
│   │
│   ├── planning/                        #   Alignment & decision-making
│   │   ├── okr-authoring/
│   │   ├── stakeholder-mapping/
│   │   └── decision-log/
│   │
│   ├── pricing/                         #   Pricing & monetization
│   │   ├── pricing-strategy/
│   │   └── monetization-experiments/
│   │
│   └── communication/                   #   Influence & documentation
│       ├── meeting-notes/
│       ├── executive-briefing/
│       └── product-narrative/
│
├── commands/                            # 15 chained workflows
│   ├── start.md                         #   /start - launch the orchestrator
│   ├── discover.md                      #   /discover - full discovery cycle
│   ├── write-prd.md                     #   /write-prd - Working Backwards PRD
│   ├── plan-launch.md                   #   /plan-launch - GTM launch plan
│   ├── sprint.md                        #   /sprint - sprint planning
│   ├── strategy.md                      #   /strategy - strategy workshop
│   ├── pricing.md                       #   /pricing - pricing strategy
│   ├── customer-review.md               #   /customer-review - VoC intelligence
│   ├── tech-handoff.md                  #   /tech-handoff - PM → engineering
│   ├── personas.md                      #   /personas - user persona workshop
│   ├── competitive.md                   #   /competitive - competitive intel
│   ├── metrics.md                       #   /metrics - metrics framework
│   ├── okrs.md                          #   /okrs - OKR authoring
│   ├── retro.md                         #   /retro - retrospective
│   └── narrative.md                     #   /narrative - product narrative
│
├── skills-map.md                        # Orchestrator routing reference
│
├── .claude-plugin/                      # Plugin manifest for marketplace install
│   ├── plugin.json
│   └── marketplace.json
│
├── docs/
│   ├── using-workflows.md               # What workflows are and how to use them
│   ├── connecting-your-tools.md         # MCP setup guide for PMs
│   └── installing-in-other-tools.md     # Setup for Cursor, Codex, Gemini, etc.
│
├── examples/
│   ├── CLAUDE.md.example                # Blank product context template
│   ├── CLAUDE.md.b2b-saas              # Filled-in example: compliance SaaS
│   ├── CLAUDE.md.consumer-app          # Filled-in example: fitness app
│   ├── CLAUDE.md.api-platform          # Filled-in example: payments API
│   └── mcp.json.example                # Example MCP config for team sharing
│
├── LICENSE                              # MIT
└── README.md
```

## Quick Start

### 1. Install

**Option A: Plugin install (recommended)**
```bash
claude plugin marketplace add EdgeCaser/shipwright
claude plugin install shipwright@shipwright
```

**Option B: Manual install**
```bash
git clone https://github.com/EdgeCaser/shipwright.git
cp -r shipwright/skills/ your-project/.claude/skills/
cp -r shipwright/agents/ your-project/.claude/agents/
cp -r shipwright/commands/ your-project/.claude/commands/

# Or cherry-pick what you need
cp -r shipwright/skills/execution/prd-development/ your-project/.claude/skills/prd-development/
```

Using a different tool? See the [cross-tool install guide](docs/installing-in-other-tools.md) for Cursor, Codex, Gemini CLI, OpenCode, and Kiro.

### 2. Set up your product context

```bash
cp shipwright/examples/CLAUDE.md.example your-project/CLAUDE.md
# Fill in your product details. This is what gives the skills real context
```

### 3. Use it

Type `/start` to launch the orchestrator. It'll ask what you're working on, figure out which skills and agents to use, and build a plan. You don't need to memorize skill names.

```
/start             - Launch the orchestrator
/discover          - Full discovery cycle
/write-prd         - Working Backwards PRD
/plan-launch       - GTM launch plan
/sprint            - Sprint planning
/strategy          - Strategy session
/pricing           - Pricing strategy
/customer-review   - Customer intelligence review
/tech-handoff      - PM → engineering handoff
/personas          - User persona workshop
/competitive       - Competitive intelligence
/metrics           - Metrics framework design
/okrs              - OKR authoring and review
/retro             - Retrospective facilitation
/narrative         - Product narrative (memo or briefing)
```

### 4. (Optional) Auto-start on session launch

If you want the orchestrator to greet you automatically:

```json
{
  "hooks": {
    "session_start": [
      { "command": "/start" }
    ]
  }
}
```

Drop that in `.claude/settings.json`.

You can also invoke agents directly for parallel work:

```
@orchestrator             - Routes work to the right agent
@discovery-researcher     - Research, competitive analysis, market sizing
@strategy-planner         - Roadmaps, positioning, PRDs, prioritization
@execution-driver         - Epics, stories, sprint plans, release notes
@customer-intelligence    - Feedback triage, churn signals, VoC reports
@cross-functional-liaison - Meeting notes, exec updates, decision logs
```

---

## The 42 Skills

### Discovery & Research (6)

| Skill | What It Does | Framework |
|---|---|---|
| **Opportunity Solution Tree** | Maps outcomes → opportunities → solutions → experiments | Teresa Torres |
| **Discovery Interview Prep** | Interview guides, screeners, and debrief templates | The Mom Test / JTBD |
| **User Research Synthesis** | Raw notes → themed insight cards with evidence trails | Affinity Mapping |
| **Jobs-to-Be-Done** | Job statements, outcome mapping, and opportunity scoring | Christensen / Ulwick |
| **Competitive Landscape** | Feature matrices, positioning maps, strategic posture | Porter's Five Forces |
| **Market Sizing** | TAM/SAM/SOM with top-down, bottom-up, and triangulation | Standard VC methodology |

### Strategy & Planning (8)

| Skill | What It Does | Framework |
|---|---|---|
| **Product Strategy Session** | Vision, bets, boundaries, and success criteria | Marty Cagan / Inspired |
| **Positioning Statement** | Competitive alternatives → unique attributes → value → positioning | April Dunford / Geoffrey Moore |
| **PESTEL Analysis** | Macro environment scan across 6 dimensions | PESTEL |
| **Lean Canvas** | One-page business model with 9 validated boxes | Ash Maurya / Lean Startup |
| **Business Model Canvas** | Full 9-block business model for established products | Osterwalder / Strategyzer |
| **SWOT Analysis** | Strengths, weaknesses, opportunities, threats with cross-referenced strategic options | SWOT + TOWS Matrix |
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

### Customer Intelligence (4)

| Skill | What It Does | Framework |
|---|---|---|
| **Feedback Triage** | Multi-channel feedback → categorized, deduplicated, prioritized themes | Affinity Mapping |
| **Customer Journey Mapping** | End-to-end journey maps with touchpoints, emotions, and drop-offs | Service Design |
| **Churn Analysis** | Diagnose why users leave, design staged retention interventions | Retention Playbook |
| **Customer Advisory Board** | CAB agenda design, discussion guides, and synthesis templates | Strategic Advisory |

### Technical & Cross-Functional (3)

| Skill | What It Does | Framework |
|---|---|---|
| **Technical Spec** | PRD → engineering-ready spec with API contracts, data models, ADRs | ADR / RFC |
| **Design Review** | 7-perspective parallel review: Eng, Design, Exec, Legal, Customer, Devil's Advocate, Sales | Multi-stakeholder review |
| **API Product Design** | API endpoint design, DX, versioning, documentation, developer onboarding | REST / DX best practices |

### Planning & Alignment (3)

| Skill | What It Does | Framework |
|---|---|---|
| **OKR Authoring** | Draft, cascade, and audit OKRs with anti-pattern detection | Measure What Matters |
| **Stakeholder Mapping** | Power × Interest grids with engagement strategies and tracking | Mendelow's Matrix |
| **Decision Log** | Structured PDRs with context, options, rationale, and revisit triggers | ADR (adapted for product) |

### Pricing & Monetization (2)

| Skill | What It Does | Framework |
|---|---|---|
| **Pricing Strategy** | Value metric, model comparison, WTP research, competitive pricing, packaging | Van Westendorp / Gabor-Granger |
| **Monetization Experiments** | Design pricing/packaging experiments with guardrails and kill criteria | Experimentation rigor |

### Communication & Influence (3)

| Skill | What It Does | Framework |
|---|---|---|
| **Meeting Notes** | Raw notes → structured summaries with decisions, actions, questions | Meeting intelligence |
| **Executive Briefing** | One-page SCR (Situation-Complication-Resolution) for leadership asks | SCR / Pyramid Principle |
| **Product Narrative** | Amazon-style 6-pager memos for complex product decisions | Amazon 6-pager |

---

## The 6 Agents

| Agent | What It Does | When to Use It |
|---|---|---|
| **Orchestrator** | Figures out what you need, maps it to skills/agents, builds a plan, and dispatches work after you approve. | Default entry point. Type `/start`. |
| **Discovery Researcher** | Gathers evidence. Competitive analysis, market sizing, interview synthesis. Surfaces findings but doesn't make recommendations. | Before discovery sprints, strategy sessions, entering a new market. |
| **Strategy Planner** | Turns research into strategic artifacts. Challenges assumptions, makes trade-offs visible. | Quarterly planning, PRD authoring, roadmap reviews. |
| **Execution Driver** | Turns strategy into shippable work. Epics, stories, sprint plans, release notes. | Sprint planning, backlog grooming, release prep. |
| **Customer Intelligence** | Synthesizes customer signals. Feedback triage, churn detection, journey friction. | Monthly/quarterly reviews, churn spikes, launches. |
| **Cross-Functional Liaison** | Handles coordination. Meeting notes, stakeholder updates, decision logging. | Daily PM ops, exec communication, decision capture. |

### How the orchestrator works

You describe what you need in plain language. The orchestrator asks a few clarifying questions (deliverable, audience, timeline), maps your request to the right skills and agents, then dispatches them. It never does the actual work itself, it just routes.

This means you can use one entry point (`/start`) for everything without learning what's under the hood.

### Why the agents are separated

Each agent has a narrow job. Research gathers evidence but doesn't recommend. Strategy plans but doesn't break down tickets. Execution ships but doesn't set direction. This is deliberate. It keeps the PM (you) in the decision seat and prevents the kind of circular reasoning you get when one agent tries to do everything.

---

## The 15 Workflows

For a fuller explanation of what workflows are, how to run them, and how to pick the right one, see the [workflows guide](docs/using-workflows.md).

| Command | Skills Chained | Output |
|---|---|---|
| `/start` | Orchestrator → Skills Map → Agent Dispatch | Execution plan + dispatched agents |
| `/discover` | OST → Assumptions → Prioritization → Experiments | Discovery report with experiment backlog |
| `/write-prd` | Press Release → FAQ → User Stories → Full PRD | Complete Working Backwards PRD |
| `/plan-launch` | GTM Strategy → ICP → Positioning → Battlecard → Timeline | GTM launch plan |
| `/sprint` | Sprint Goal → Capacity → Story Selection → Risk Check | Sprint plan with agreement |
| `/strategy` | Vision → Bets → Boundaries → Pre-Mortem → Success Criteria | Product strategy document |
| `/pricing` | Value Metric → Model → Competitive → WTP → Packaging → Experiment | Pricing strategy with validation plan |
| `/customer-review` | Feedback Triage → Journey Map → Churn Analysis → Exec Briefing | Customer intelligence report |
| `/tech-handoff` | PRD → Tech Spec → Design Review → Epics → Stories | Complete engineering handoff package |
| `/personas` | Inputs → Profiles → JTBD Mapping → Validation | Persona document with research gaps |
| `/competitive` | Landscape → Battlecards → Positioning Review | Competitive intelligence package |
| `/metrics` | North Star → Input Metrics → Guardrails → Dashboard Spec | Metrics framework document |
| `/okrs` | Context → Draft → Anti-Pattern Audit → Alignment | OKR document with scoring criteria |
| `/retro` | Format → Observations → Patterns → Actions | Retrospective summary with action items |
| `/narrative` | Format → Draft (Briefing or 6-Pager) → Review | Product narrative for decisions |

---

## Getting the Most Out of It

**Fill in CLAUDE.md first.** Every agent reads it before doing anything. The more context you put in (personas, metrics, priorities, glossary), the less you repeat yourself. When your strategy changes, update it, and every future session picks up the new context automatically.

**Don't try to use all 42 skills at once.** Pick the thing you do every week that feels like a grind (sprint plans, feedback triage, stakeholder updates) and start there. Get comfortable, then expand.

**Run agents in parallel.** The orchestrator does this automatically when steps don't depend on each other, but you can also do it manually:

```
@discovery-researcher  "Research the competitive landscape for [feature area]"
@strategy-planner      "Draft positioning for [product] against [competitor]"
```

**Hook up your tools via MCP.** Shipwright gets a lot more useful when agents can pull real data from Jira, Slack, Notion, Linear, or Amplitude instead of working from pasted descriptions. See the [setup guide](docs/connecting-your-tools.md) for step-by-step instructions and an [example config](examples/mcp.json.example) for team sharing.

**Build your own workflows.** The built-in commands are just markdown files that chain skills together. Copy one, swap out the skills, and you've got a custom workflow that matches how your team actually works.

**Check your skills into git.** As your product evolves, your frameworks should too. What works at Series A looks different at growth stage.

---

## Frameworks Referenced

The skills draw on established PM thinking:

- Teresa Torres, *Continuous Discovery Habits*
- Marty Cagan, *Inspired* and *Empowered*
- April Dunford, *Obviously Awesome*
- Geoffrey Moore, *Crossing the Chasm*
- Rob Fitzpatrick, *The Mom Test*
- Ash Maurya, *Running Lean*
- Alexander Osterwalder, *Business Model Generation*
- John Doerr, *Measure What Matters*
- Clayton Christensen / Tony Ulwick, Jobs-to-Be-Done
- Gary Klein, Pre-Mortem / Prospective Hindsight
- Barbara Minto, The Pyramid Principle
- Sean Ellis, North Star Framework
- Reforge, Growth Loops
- Amazon, Working Backwards / 6-Pager Memos

---

## Contributing

PRs welcome. If you've got a PM skill that works well in your workflow, open a PR with:

1. A new skill directory under the appropriate category
2. A `SKILL.md` following the existing format (Description, When to Use, Framework, Output Format, Common Mistakes)
3. An update to this README's skill table

---

## Acknowledgments

Built on ideas from a growing community of PMs figuring out how to use AI coding agents for product work:

- [Pawel Huryn's PM Skills Marketplace](https://github.com/phuryn/pm-skills) (65 skills, 8 plugins)
- [Dean Peters' Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) (46 skills)
- [Sachin Rekhi's Claude Code for PMs](https://www.sachinrekhi.com/p/claude-code-for-product-managers)
- [prodmgmt.world](https://www.prodmgmt.world/claude-code) plugin directory
- [ccforpms.com](https://ccforpms.com/) free PM course
- [VoltAgent's awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

---

## License

MIT
