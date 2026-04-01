---
name: shipwright-research-brief
description: "Use for market, competitor, pricing, TAM/SAM/SOM, and business-attractiveness research in Codex. Starts with Shipwright's local research collector before interactive browsing."
---

# Shipwright Research Brief

Use this skill for web-heavy product, market, and business research in Codex.

## Best Fit

- competitive landscape analysis
- market sizing or TAM/SAM/SOM work
- pricing scans
- business attractiveness and category viability questions
- buyer, use-case, or go-to-market research that depends on current public-web evidence

## Retrieval Workflow

1. Translate the user's request into one primary query.
2. Run the local collector first:
   - `node .codex/scripts/collect-research.mjs --query "<primary query>" --mode auto`
   - otherwise `node scripts/collect-research.mjs --query "<primary query>" --mode auto`
   - otherwise `node .claude/scripts/collect-research.mjs --query "<primary query>" --mode auto`
3. Read the generated evidence pack.
4. If the evidence pack is usable, synthesize from it without starting a broad `Web Search` pass.
5. Only if the evidence pack still has material gaps should you use interactive browsing.
6. Keep any follow-up browsing gap-focused rather than restarting the whole search pass.
7. Treat raw `Web Search` as fallback, not first-pass retrieval, whenever the local collector is available.

## Synthesis Rules

- Keep the work bounded to one primary deliverable.
- Separate retrieval from synthesis when the question is broad.
- Prefer factual findings, explicit assumptions, and decision-useful takeaways.
- For business-attractiveness questions, pair the evidence with:
  - `skills/discovery/market-sizing/SKILL.md`
  - `skills/discovery/competitive-landscape/SKILL.md`
  - `skills/strategy/build-vs-buy-analysis/SKILL.md`

## Output Shape

Use a concise structured brief with:

1. Executive summary
2. Market or category evidence
3. Competitor and pricing evidence
4. Key risks and differentiation angles
5. Recommendation

Close with:

- `Decision Frame`
- `Unknowns & Evidence Gaps`
- `Pass/Fail Readiness`
- `Recommended Next Artifact`
