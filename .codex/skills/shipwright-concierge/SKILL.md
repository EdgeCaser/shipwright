---
name: shipwright-concierge
description: "Use for plain-language PM, strategy, discovery, launch, pricing, and business-analysis requests in Codex when the user wants Shipwright-style output without slash commands."
---

# Shipwright Concierge for Codex

This skill gives Codex a conversational Shipwright entry point. Use it when the user asks for PM or business work in plain English and expects Shipwright-quality structure without invoking Claude Code commands.

## What This Skill Does

- routes the request to the smallest viable Shipwright framework or combination of frameworks
- keeps public-web research bounded
- requires the local research collector before interactive browsing when the helper is available
- preserves Shipwright's evidence-first output style

## Routing Rules

1. If the request clearly maps to one framework, use that framework directly.
2. If the request spans multiple Shipwright areas, consult `manifest.json` and `skills-map.md`.
3. Prefer one deliverable at a time instead of bundling research, synthesis, and packaging into one huge run.

## Common Mappings

- business attractiveness or market viability:
  - `skills/discovery/market-sizing/SKILL.md`
  - `skills/discovery/competitive-landscape/SKILL.md`
  - `skills/strategy/build-vs-buy-analysis/SKILL.md`
- pricing:
  - `skills/pricing/pricing-strategy/SKILL.md`
  - `skills/strategy/build-vs-buy-analysis/SKILL.md`
- customer/problem discovery:
  - `skills/discovery/opportunity-solution-tree/SKILL.md`
  - `skills/customer-intelligence/feedback-triage/SKILL.md`
- product strategy:
  - `skills/strategy/product-strategy-session/SKILL.md`
  - `skills/strategy/prioritization-advisor/SKILL.md`

## Public-Web Research Protocol

If fresh public-web evidence is needed, follow this protocol in order:

1. First run the local research collector if available:
   - `node .codex/scripts/collect-research.mjs --query "<primary query>" --mode auto`
   - otherwise `node scripts/collect-research.mjs --query "<primary query>" --mode auto`
   - otherwise `node .claude/scripts/collect-research.mjs --query "<primary query>" --mode auto`
2. Read the generated `evidence.md` or `evidence.json`.
3. Synthesize from that evidence pack first.
4. Do not use `Web Search` before attempting the collector when the helper exists and a key is configured.
5. Use interactive browsing only for unresolved gaps, collector failure, or `needs-interactive-followup`.
6. If you must browse interactively, keep the queries gap-focused and limited.
7. If the evidence pack was usable, do not replace it with a new broad raw-search pass.

## Interaction Style

- Ask at most 2 clarifying questions if the goal is unclear.
- If the ask is already clear, proceed directly.
- Return findings inline unless the user explicitly asks for a saved artifact.
- When you used the collector, say so briefly in the answer or working trace.

## Output Standard

For substantial outputs, end with:

- `Decision Frame`
- `Unknowns & Evidence Gaps`
- `Pass/Fail Readiness`
- `Recommended Next Artifact`
