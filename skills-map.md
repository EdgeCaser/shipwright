# Shipwright Skills Map

> This file is the orchestrator agent's routing reference. It maps plain-language PM needs
> to the skills, agents, and workflows best suited to handle them.

## All Skills — Quick Reference

### Discovery & Research
| Skill | Directory | Best For |
|---|---|---|
| Opportunity Solution Tree | `skills/discovery/opportunity-solution-tree/` | Mapping outcomes to opportunities to experiments |
| Discovery Interview Prep | `skills/discovery/discovery-interview-prep/` | Preparing customer interview materials |
| User Research Synthesis | `skills/discovery/user-research-synthesis/` | Turning raw interview notes into insight cards |
| Jobs-to-Be-Done | `skills/discovery/jobs-to-be-done/` | Framing needs as job statements, finding underserved outcomes |
| Competitive Landscape | `skills/discovery/competitive-landscape/` | Structured competitor analysis |
| Market Sizing | `skills/discovery/market-sizing/` | TAM/SAM/SOM estimation |
| Workflow Questionnaire | `skills/discovery/workflow-questionnaire/` | Constraint-aware questionnaires to map prospect workflows and surface friction |

### Strategy & Planning
| Skill | Directory | Best For |
|---|---|---|
| Product Strategy Session | `skills/strategy/product-strategy-session/` | Vision, bets, boundaries, success criteria |
| Positioning Statement | `skills/strategy/positioning-statement/` | Market positioning and messaging |
| PESTEL Analysis | `skills/strategy/pestel-analysis/` | Macro environment scanning |
| Lean Canvas | `skills/strategy/lean-canvas/` | One-page business model |
| Roadmap Planning | `skills/strategy/roadmap-planning/` | Now/Next/Later outcome-based roadmaps |
| Prioritization Advisor | `skills/strategy/prioritization-advisor/` | RICE, ICE, Kano, MoSCoW scoring |
| SWOT Analysis | `skills/strategy/swot-analysis/` | Strengths, weaknesses, opportunities, threats with strategic options |
| Business Model Canvas | `skills/strategy/business-model-canvas/` | Full 9-block business model mapping |
| Build-vs-Buy Analysis | `skills/strategy/build-vs-buy-analysis/` | Build, buy, or integrate decision with TCO and strategic fit |

### Execution & Delivery
| Skill | Directory | Best For |
|---|---|---|
| PRD Development | `skills/execution/prd-development/` | Working Backwards PRDs |
| User Story Writing | `skills/execution/user-story-writing/` | INVEST stories with acceptance criteria |
| Epic Breakdown | `skills/execution/epic-breakdown/` | Decomposing initiatives into shippable epics |
| Sprint Planning | `skills/execution/sprint-planning/` | Sprint goals, capacity, scope selection |
| Pre-Mortem | `skills/execution/pre-mortem/` | Risk identification before launch |
| Release Notes | `skills/execution/release-notes/` | Multi-audience release communications |

### Go-to-Market & Growth
| Skill | Directory | Best For |
|---|---|---|
| Go-to-Market Strategy | `skills/gtm/go-to-market-strategy/` | Beachhead, ICP, messaging, launch plan |
| Competitive Battlecard | `skills/gtm/competitive-battlecard/` | Sales-ready competitive intelligence |
| Growth Loops | `skills/gtm/growth-loops/` | Mapping compounding growth mechanisms |

### Measurement & Iteration
| Skill | Directory | Best For |
|---|---|---|
| Metrics Dashboard | `skills/measurement/metrics-dashboard/` | North Star + input metrics architecture |
| A/B Test Analysis | `skills/measurement/ab-test-analysis/` | Experiment result evaluation |
| Artifact Quality Audit | `skills/measurement/artifact-quality-audit/` | Multi-artifact scoring, drift detection, quality trend analysis |
| Retrospective Facilitator | `skills/measurement/retrospective-facilitator/` | Team retros with action items |
| Stakeholder Communication | `skills/measurement/stakeholder-communication/` | Status updates calibrated by audience |

### Customer Intelligence
| Skill | Directory | Best For |
|---|---|---|
| Feedback Triage | `skills/customer-intelligence/feedback-triage/` | Multi-channel feedback synthesis |
| Customer Journey Mapping | `skills/customer-intelligence/customer-journey-mapping/` | End-to-end experience mapping |
| Churn Analysis | `skills/customer-intelligence/churn-analysis/` | Retention diagnosis and playbook |
| Customer Advisory Board | `skills/customer-intelligence/customer-advisory-board/` | CAB session preparation |

### Technical & Cross-Functional
| Skill | Directory | Best For |
|---|---|---|
| Adversarial Review | `skills/technical/adversarial-review/` | Pressure-testing completed artifacts for weak evidence, hedging, scope drift, and buried risk |
| Technical Spec | `skills/technical/technical-spec/` | Engineering-ready specifications |
| Design Review | `skills/technical/design-review/` | 7-perspective proposal review |
| API Product Design | `skills/technical/api-product-design/` | API endpoint and DX design |

### Planning & Alignment
| Skill | Directory | Best For |
|---|---|---|
| OKR Authoring | `skills/planning/okr-authoring/` | Drafting and auditing OKRs |
| Stakeholder Mapping | `skills/planning/stakeholder-mapping/` | Power × Interest grids |
| Decision Log | `skills/planning/decision-log/` | Product decision records |

### Pricing & Monetization
| Skill | Directory | Best For |
|---|---|---|
| Pricing Strategy | `skills/pricing/pricing-strategy/` | Pricing model and packaging design |
| Monetization Experiments | `skills/pricing/monetization-experiments/` | Pricing experiment design |

### Communication & Influence
| Skill | Directory | Best For |
|---|---|---|
| Meeting Notes | `skills/communication/meeting-notes/` | Structured meeting summaries |
| Executive Briefing | `skills/communication/executive-briefing/` | One-page SCR briefs |
| Product Narrative | `skills/communication/product-narrative/` | Amazon-style 6-pager memos |

---

## All Agents — Capability Matrix

| Agent | Core Capability | Uses These Skills | Does NOT Do |
|---|---|---|---|
| **discovery-researcher** | Gather evidence, analyze markets, synthesize research | discovery/*, measurement/metrics-dashboard | Make product recommendations |
| **strategy-planner** | Build strategic artifacts, challenge assumptions, make trade-offs explicit | strategy/*, execution/prd-development, execution/pre-mortem, gtm/*, pricing/* | Conduct research, break down stories |
| **execution-driver** | Decompose work, write stories, plan sprints, produce release comms | execution/*, measurement/*, technical/technical-spec | Set strategy, conduct research |
| **customer-intelligence** | Synthesize customer signals, detect churn, map journeys | customer-intelligence/*, measurement/* | Make product decisions, respond to customers |
| **cross-functional-liaison** | Document decisions, communicate to stakeholders, track alignment | communication/*, planning/*, measurement/stakeholder-communication, execution/release-notes | Make strategic decisions, conduct research |
| **red-team** | Pressure-test finished artifacts for unsupported claims, scope drift, generic analysis, and buried risk | technical/adversarial-review, evals/*, docs/failure-modes | Produce original artifacts or rewrite author work |

---

## Recommended Paths

When the user's intent is broad (e.g., "help me plan the quarter" or "I need to ship this feature"), route to one of these 3 paths:

| Path | Trigger | Chain | End State |
|---|---|---|---|
| **New Feature** | User has a feature idea or customer problem to solve | `/discover` → `/write-prd` → `/tech-handoff` | Discovery report, PRD, tech spec, design review, epics, stories |
| **Quarterly Planning** | Start of quarter/half, setting direction | `/customer-review` → `/strategy` → `/okrs` | Customer intel report, strategy doc with bets, audited OKRs |
| **Launch** | Feature/product ready to ship, needs GTM | `/strategy` → `/plan-launch` → `/sprint` | Strategy doc, GTM plan with battlecards, sprint plan |

If the user's need doesn't fit a path, use the individual workflow table below.

---

## All Workflows — When to Use Each

| Command | Chain | Best For | Time Required |
|---|---|---|---|
| `/discover` | OST → Assumptions → Prioritization → Experiments | Starting a discovery cycle | 30-60 min |
| `/challenge` | Artifact selection → Red-team review → Verdict → Next action | Adversarial review of an existing artifact | 10-30 min |
| `/write-prd` | Press Release → FAQ → Stories → Full PRD | New feature specification | 45-90 min |
| `/plan-launch` | GTM → ICP → Positioning → Battlecard → Timeline | Product or feature launch | 60-90 min |
| `/sprint` | Goal → Capacity → Selection → Risk Check | Sprint planning prep | 20-40 min |
| `/strategy` | Vision → Bets → Boundaries → Pre-Mortem → Success Criteria | Strategy development | 60-120 min |
| `/pricing` | Evidence Basis → Value Metric → Model → WTP → Packaging → Experiment | Pricing strategy with evidence-backed validation plan | 60-120 min |
| `/customer-review` | Feedback → Journey → Churn → Exec Briefing | Customer intelligence report | 45-90 min |
| `/tech-handoff` | PRD → Tech Spec → Design Review → Epics → Stories | Complete engineering handoff package | 90-180 min |
| `/personas` | Inputs → Persona Profiles → JTBD Mapping → Validation | Building user personas | 30-60 min |
| `/competitive` | Evidence Basis → Landscape → Battlecards → Positioning Review | Competitive intelligence package grounded in a fresh evidence pass when needed | 60-120 min |
| `/metrics` | North Star → Input Metrics → Guardrails → Dashboard Spec | Metrics framework design | 30-60 min |
| `/okrs` | Context → Draft → Anti-Pattern Audit → Alignment Check | OKR authoring and review | 30-60 min |
| `/retro` | Format → Observations → Patterns → Actions | Team retrospective facilitation | 20-40 min |
| `/narrative` | Format → Draft (Briefing or 6-Pager) → Review | Product narratives for decisions | 30-90 min |
| `/status` | Context → Draft → Honesty Check | Stakeholder status updates | 15-30 min |
| `/quality-check` | Identify Artifacts → Score → Trend → Recommend | Artifact quality audit and drift detection | 20-40 min |

---

## Keyword → Skill Routing

When the user says something containing these keywords, route to the corresponding skill:

| Keywords | Route To |
|---|---|
| "PRD", "requirements", "spec out", "write up the feature" | prd-development |
| "user stories", "acceptance criteria", "break it down for eng" | user-story-writing |
| "roadmap", "what should we build next", "prioritize" | roadmap-planning, prioritization-advisor |
| "OKRs", "objectives", "key results", "goals for the quarter" | okr-authoring |
| "competitors", "competitive", "who else does this" | competitive-landscape |
| "market size", "TAM", "how big is the opportunity" | market-sizing |
| "pricing", "how much should we charge", "monetization" | pricing-strategy |
| "launch", "go to market", "GTM" | go-to-market-strategy |
| "churn", "retention", "why are users leaving" | churn-analysis |
| "feedback", "what are customers saying", "NPS", "reviews" | feedback-triage |
| "interview", "talk to customers", "user research" | discovery-interview-prep |
| "experiment", "A/B test", "did it work" | ab-test-analysis |
| "sprint", "sprint planning", "what should we commit to" | sprint-planning |
| "retro", "retrospective", "what went well" | retrospective-facilitator |
| "meeting notes", "summarize the meeting", "action items" | meeting-notes |
| "stakeholder", "update the VP", "exec update" | stakeholder-communication, executive-briefing |
| "decision", "why did we decide", "document the choice" | decision-log |
| "positioning", "messaging", "how do we describe ourselves" | positioning-statement |
| "tech spec", "architecture", "hand off to engineering" | technical-spec |
| "design review", "get feedback on this proposal" | design-review |
| "red team", "challenge this", "pressure test", "poke holes", "stress test this artifact" | adversarial-review or /challenge when the artifact already exists |
| "API", "developer experience", "endpoints" | api-product-design |
| "strategy", "vision", "where are we going" | product-strategy-session |
| "pre-mortem", "what could go wrong", "risks" | pre-mortem |
| "release notes", "changelog", "what shipped" | release-notes |
| "business model", "lean canvas", "is this viable" | lean-canvas |
| "journey map", "customer experience", "touchpoints" | customer-journey-mapping |
| "battlecard", "sales enablement", "objection handling" | competitive-battlecard |
| "growth", "acquisition", "viral", "loops" | growth-loops |
| "metrics", "dashboard", "north star", "what should we measure" | metrics-dashboard |
| "memo", "6-pager", "make the case for" | product-narrative |
| "one-pager", "brief the exec", "get approval" | executive-briefing |
| "JTBD", "jobs to be done", "what are users hiring us for" | jobs-to-be-done |
| "stakeholder map", "who do I need to influence" | stakeholder-mapping |
| "CAB", "advisory board", "customer panel" | customer-advisory-board |
| "PESTEL", "macro", "regulatory", "external factors" | pestel-analysis |
| "epic", "break this initiative down" | epic-breakdown |
| "pricing experiment", "test the price", "conversion optimization" | monetization-experiments |
| "opportunity solution tree", "OST", "discovery tree" | opportunity-solution-tree |
| "questionnaire", "workflow discovery", "friction audit", "process mapping", "where can we automate", "workflow friction" | workflow-questionnaire |
| "SWOT", "strengths weaknesses", "strategic assessment" | swot-analysis |
| "business model canvas", "BMC", "9 blocks", "full business model" | business-model-canvas |
| "build or buy", "build vs buy", "vendor vs in-house", "should we build", "buy or integrate" | build-vs-buy-analysis |
| "status update", "weekly update", "stakeholder update", "progress report" | /status workflow |
| "quality check", "are outputs getting worse", "artifact quality", "quality drift" | /quality-check workflow |
| "personas", "who are our users", "user profiles" | /personas workflow |
| "competitive analysis", "who are we up against" | /competitive workflow |
| "metrics framework", "what should we track", "dashboard design" | /metrics workflow |
| "OKR", "quarterly goals", "objectives and key results" | /okrs workflow |
| "retro", "what went well", "retrospective" | /retro workflow |
| "write a memo", "make the case", "narrative", "one-pager" | /narrative workflow |

## Red-Team Routing Note

Use challenge language differently depending on artifact state:

- **Completed artifact** (passed structural checks, ready for review or delivery): route to `@red-team` or `/challenge`.
- **In-progress artifact** (still being authored, sections incomplete or placeholder): keep the work with the producing agent and increase rigor there. Do not spawn red-team until the artifact is stable enough to review.
- **Gray zone** (artifact exists but the user is actively iterating on it): ask the PM whether they want a formal adversarial pass now or want to finish revisions first.
