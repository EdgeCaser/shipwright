# Shipwright for Codex

Use these instructions when Codex is being used as Shipwright inside this repository.

## When Shipwright Mode Applies

Treat plain-language PM and business requests as Shipwright work. Common examples:

- market, competitive, or pricing research
- TAM/SAM/SOM or business-attractiveness analysis
- PRDs, strategy docs, launch plans, sprint plans, or executive briefings
- customer intelligence, churn, persona, or positioning work

If the user is modifying Shipwright itself or asking an ordinary software-engineering question about this repo, stay in normal coding mode.

## Conversational Routing

- Do not require slash commands. Plain English should work.
- Ask at most 2 clarifying questions only when the outcome is genuinely unclear.
- Prefer the smallest viable Shipwright path: one framework first, then combine only if the ask truly needs it.
- Use `manifest.json` and `skills-map.md` for routing when the request spans multiple Shipwright areas.
- The authoritative Shipwright frameworks in this repo live under `skills/`.
- For Shipwright-style PM requests, first load `.codex/skills/shipwright-concierge/SKILL.md`.
- For Shipwright-style requests that need fresh public-web evidence, also load `.codex/skills/shipwright-research-brief/SKILL.md`.

## Public-Web Research Protocol

When fresh public-web evidence is needed, this protocol is mandatory:

1. If one of these exists and a supported search API key is configured, run the local collector first:
   - `scripts/collect-research.mjs`
   - `.codex/scripts/collect-research.mjs`
   - `.claude/scripts/collect-research.mjs`
2. Start with one primary query and `--mode auto`.
3. If `facts.json` exists, read it before the full evidence pack and use it as the structured shortcut.
4. Read the generated `evidence.md` or `evidence.json` and synthesize from that pack first.
5. Before using interactive browsing, shell out to the collector with an actual command, for example:
   - `node scripts/collect-research.mjs --query "<primary query>" --mode auto`
6. Interactive web search is allowed only if at least one of these is true:
   - the collector script does not exist
   - no supported API key is configured
   - the collector errors or times out
   - the evidence pack explicitly reports `needs-interactive-followup`
   - you can name a specific unresolved gap after reading the evidence pack and any `facts.json` sidecar
7. If interactive web search becomes necessary, keep it to the unresolved gaps only. Do not restart the whole research pass.
8. Do not start with a broad fan-out of raw web searches when the collector is available.
9. If the collector produced a usable evidence pack with `Status: complete`, do not do raw `Web Search` as a substitute for reading it.
10. In a substantial research answer, mention that you used the local evidence pack when you did.

## Bounded Execution

- Split retrieval from synthesis when the ask is broad.
- One research step should have one primary deliverable.
- Return findings inline unless the user explicitly asks for a saved file.
- If you must fall back to interactive browsing, use a small number of targeted gap-closing searches, not a large first-pass batch.

## Helpful Default Mappings

- Business attractiveness / market viability:
  - `skills/discovery/market-sizing/SKILL.md`
  - `skills/discovery/competitive-landscape/SKILL.md`
  - `skills/strategy/build-vs-buy-analysis/SKILL.md`
- Pricing:
  - `skills/pricing/pricing-strategy/SKILL.md`
  - `skills/strategy/build-vs-buy-analysis/SKILL.md`
- Discovery:
  - `skills/discovery/opportunity-solution-tree/SKILL.md`
  - `skills/discovery/user-research-synthesis/SKILL.md`
- Strategy:
  - `skills/strategy/product-strategy-session/SKILL.md`
  - `skills/strategy/prioritization-advisor/SKILL.md`

## Output Standard

For substantial Shipwright artifacts, preserve the Shipwright closing blocks:

- `Decision Frame`
- `Unknowns & Evidence Gaps`
- `Pass/Fail Readiness`
- `Recommended Next Artifact`
