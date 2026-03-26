# Failure Modes

Shipwright produces structured artifacts, not guaranteed-correct ones. The frameworks improve output quality significantly (see [golden outputs](../examples/golden-outputs/)), but AI-generated PM artifacts fail in predictable ways. This document describes those failure modes so you can detect them. For deterministic recovery steps, use [recovery playbooks](recovery-playbooks.md).

## Agent failure modes

Each agent has characteristic weaknesses tied to its role.

### Discovery Researcher

| Failure Mode | What It Looks Like | How to Detect | How to Fix |
|---|---|---|---|
| **Fabricated insights** | Research synthesis cites "interview findings" or "usage data" that weren't in your inputs. Sounds authoritative but is invented. | Check every claim against your actual data. If you didn't provide interview transcripts, the agent shouldn't be quoting interviewees. | Provide raw data (paste interview notes, export usage data). Tell the agent: "Only cite evidence I've provided. Flag where evidence is missing." |
| **Public information bias** | Competitive analysis consists entirely of information from competitor websites and press releases. Presents marketing claims as facts. | Ask: "Which of these points come from public marketing vs. independent analysis?" If the answer is "all public," the analysis is shallow. | Supplement with your own competitive intelligence (sales call notes, win/loss interviews, customer comparisons). Tell the agent which claims to treat skeptically. |
| **Symmetrical analysis** | SWOT has exactly 4 items per quadrant. Competitive matrix shows every competitor as "equal but different." Reality is rarely this balanced. | Look for suspicious symmetry. If every competitor has exactly 2 strengths and 2 weaknesses, the analysis is template-driven. | Ask: "Which quadrant is actually strongest? Which competitor is the biggest threat and why?" Force asymmetric conclusions. |

### Strategy Planner

| Failure Mode | What It Looks Like | How to Detect | How to Fix |
|---|---|---|---|
| **Framework overfitting** | Forces a SWOT when the problem is operational. Runs a full positioning exercise for an internal tool. Applies heavyweight strategy to lightweight decisions. | Ask: "Does this decision actually require this framework?" If a pricing decision is being analyzed through PESTEL, the framework is wrong. | Tell the agent which framework to use, or say "this is a tactical decision, not a strategic one — skip the framework and just give me a recommendation." |
| **Unfalsifiable strategies** | Strategy sounds impressive but can't be proven wrong. "We will become the leading platform" is not a strategy. Bets lack kill criteria. | Check: can you describe what failure looks like for each bet? If not, the strategy is unfalsifiable. | Demand kill criteria for every bet. "Under what specific conditions would we abandon this?" If the agent can't answer, the bet isn't well-defined. |
| **Excessive hedging** | Every recommendation comes with "however," "on the other hand," and "it depends." The strategy avoids commitment. | Count recommendations vs. qualifications. If every paragraph ends with a caveat, the agent is optimizing for not being wrong rather than being useful. | Tell the agent: "Take a position. I want your recommendation, not a list of options. You can note risks but must commit to a direction." |

### Execution Driver

| Failure Mode | What It Looks Like | How to Detect | How to Fix |
|---|---|---|---|
| **Verbose stories** | User stories are 200+ words each. Acceptance criteria include implementation details. Stories describe HOW to build, not WHAT to build. | Read the story to a designer who didn't write the spec. If they ask "but what does the user actually want?", the story is too technical. | Tell the agent: "Write stories from the user's perspective. Acceptance criteria should describe behavior, not implementation. Max 3 acceptance criteria per story." |
| **Scope creep via helpfulness** | The agent "helpfully" adds features that weren't in the spec. "While we're building the integration, we should also add a reporting dashboard." | Compare the output scope against the input spec. Anything not in the PRD or spec should be flagged. | Tell the agent: "Only break down what's in the spec. If you think something is missing, flag it as an open question — don't add it to the scope." |
| **Fabricated estimates** | Sprint plan includes hour or point estimates that have no basis. "This story is 5 points" without knowing the team's velocity or capacity. | Ask: "What is this estimate based on?" If the answer is "typical complexity," it's fabricated. | Don't ask the agent for estimates. Use it for scope breakdown and risk identification. Let your engineering team estimate based on their own velocity. |

### Customer Intelligence

| Failure Mode | What It Looks Like | How to Detect | How to Fix |
|---|---|---|---|
| **Anecdotes as data** | Churn analysis treats 3 customer quotes as a statistically significant pattern. "Customers are leaving because of pricing" based on 2 exit interviews. | Check the sample size behind every claim. If "customers" means fewer than 10, the pattern may be noise. | Provide actual data volumes. Tell the agent: "We have 47 churn records. Don't generalize from fewer than 10 examples. Flag small-sample claims." |
| **Correlation as causation** | "Customers who contact support 3+ times are 2x more likely to churn, so we should reduce support contacts." But frequent contacts might mean they're engaged. | For every causal claim, ask: "Is there a plausible reverse causation or confounding variable?" | Tell the agent: "Distinguish correlation from causation. For every pattern, list at least one alternative explanation." |
| **Positivity smoothing** | Journey map shows no truly painful moments. Feedback synthesis describes "areas for improvement" instead of "things that are broken." | Check if the output would make sense in a board meeting where metrics are declining. If it reads like everything is fine, it's smoothed. | Tell the agent: "Be direct about what's broken. Use the customers' actual language, including negative language. Rate each touchpoint honestly." |

### Cross-Functional Liaison

| Failure Mode | What It Looks Like | How to Detect | How to Fix |
|---|---|---|---|
| **Diplomatic vagueness** | Meeting notes say "the team discussed concerns about the timeline" instead of "Sarah said the timeline is impossible and engineering needs 3 more weeks." | Compare the notes against your memory of the meeting. If sharp disagreements are softened, the notes aren't accurate. | Tell the agent: "Capture disagreements exactly as stated. Don't soften language. Attribute concerns to specific people." |
| **Buried critical information** | Executive briefing leads with good news and buries the actual blocker in paragraph 4. Stakeholder update presents risks as "considerations." | Read only the first paragraph and the headers. If you'd walk away thinking everything is fine when it isn't, the information architecture is wrong. | Tell the agent: "Lead with the most important information, even if it's bad news. Use SCR format: Situation, Complication, Resolution — the complication comes second, not last." |

## Workflow failure modes

### When NOT to use each path

| Path | Don't use when... | Use instead... |
|---|---|---|
| **New Feature** (`/discover → /write-prd → /tech-handoff`) | You already have validated customer evidence and a clear spec. Running discovery adds process overhead without insight. | Skip `/discover`, start with `/write-prd` directly. |
| **Quarterly Planning** (`/customer-review → /strategy → /okrs`) | Your strategy hasn't changed and you just need to update OKRs. Running the full path creates busywork. | Run `/okrs` directly with your existing strategy as context. |
| **Launch** (`/strategy → /plan-launch → /sprint`) | The feature is a minor update that doesn't need GTM. Not everything requires a launch plan. | Run `/sprint` directly. Skip strategy and GTM for incremental releases. |

### Signs of hallucinated structure

These patterns suggest the AI is filling templates rather than analyzing reality:

- **Perfectly balanced frameworks.** A SWOT with exactly 4 items per quadrant. A competitive matrix where every competitor scores 3/5. A journey map with exactly one pain point per stage.
- **Suspiciously clean metrics.** Targets are round numbers (50%, 2x, 100K) with no explanation of why that specific number. Baselines are missing or generic.
- **Generic risk sections.** Pre-mortem lists "timeline risk," "resource risk," "technical risk" without specifics tied to YOUR product and situation.
- **Boilerplate personas.** Personas describe generic archetypes ("busy executive who values efficiency") rather than real customer patterns from your data.
- **Universal agreement.** A design review where all 7 perspectives say Green. A strategy with no tensions. A retro where everything went well.

## Detection checklist

Run this after any major artifact:

- [ ] **Source check:** For every factual claim, can I trace it to real data I provided?
- [ ] **Symmetry check:** Is the output suspiciously balanced or uniform?
- [ ] **Specificity check:** Would this output change if I swapped in a different product? If not, it's generic.
- [ ] **Decision check:** Does every section drive toward a decision, or does it just describe the situation?
- [ ] **Discomfort check:** Does the output include at least one conclusion I might push back on? If it's entirely comfortable, it's probably hedging.

## Overriding agent behavior

When an agent is going in the wrong direction, you can intervene at any point:

**Redirect scope:**
```
Stop. You're adding scope that wasn't in the spec. Only work from the PRD I provided.
```

**Force specificity:**
```
Replace all vague claims with specific ones. Where you don't have data, say "no data available" instead of making something up.
```

**Break out of a workflow:**
```
Skip to step 4. I already have the output from steps 1-3 and don't need to regenerate it.
```

**Switch frameworks:**
```
Don't use SWOT here. This is a pricing decision — use the pricing strategy skill instead.
```

**Challenge the output:**
```
Score this artifact against the rubric in evals/prd.md. Where does it score below 7? Fix those sections.
```

The agents are designed to respond to direct correction. They won't argue or insist on following the framework if you redirect them. You're the PM - the agents work for you, not the other way around.

For deterministic repair paths, see [recovery playbooks](recovery-playbooks.md).
