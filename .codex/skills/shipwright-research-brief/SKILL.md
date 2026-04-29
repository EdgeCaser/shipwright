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

1. **Classify the request** to configure retrieval before collecting:
   - `node scripts/classify-request.mjs "<primary query>"`
   - The output names a `requestType` (pricing, competitive, market-size, acquisition, funding, reviews, general), a collector-compatible `suggestedMode` (`standard`, `auto`, or `deep`), and `priorityFacts` to watch for in the facts sidecar.
   - Use `suggestedMode` as the `--mode` value in step 2.

2. Run the local collector first:
   - `node scripts/collect-research.mjs --query "<primary query>" --mode <suggestedMode>`
   - otherwise `node .codex/scripts/collect-research.mjs --query "<primary query>" --mode <suggestedMode>`
   - otherwise `node .claude/scripts/collect-research.mjs --query "<primary query>" --mode <suggestedMode>`
   - Prefer the repo-level `scripts/collect-research.mjs` when available because it writes `facts.json` for the deterministic pre-flight. The `.codex` and `.claude` copies are fallback collectors and may only emit `evidence.json`/`evidence.md`.

3. **Format the facts sidecar** if `facts.json` exists:
   - `node scripts/format-facts.mjs path/to/facts.json`
   - The compact block output (~300-500 tokens) is ready to inject directly into a synthesis prompt as structured evidence. Read it before the full evidence pack, if `priorityFacts` fields are all present at high confidence, the full pack may only be needed for context.

4. Interpret `facts.json` by `confidence_hint`:
   - `high`: use directly for structured fields, tables, and summaries, while keeping source attribution.
   - `medium`: treat as provisional; verify against the cited evidence pack entry before relying on it for a material claim, comparison, or recommendation.
   - `low`: treat as a lead only; do not present it as settled unless corroborated from the evidence pack or another source.
   - if `confidence_hint` is missing, treat it as `medium`.

5. Read the generated evidence pack.
6. If the evidence pack is usable, synthesize from it without starting a broad `Web Search` pass.
7. Only if the evidence pack still has material gaps should you use interactive browsing.
8. Keep any follow-up browsing gap-focused rather than restarting the whole search pass.
9. Treat raw `Web Search` as fallback, not first-pass retrieval, whenever the local collector is available.

**For multi-competitor pricing requests:** run the collector once per competitor, then generate the comparison table from the specific facts packs you intend to compare:
```bash
node scripts/pricing-diff.mjs \
  .shipwright/research/comp-a/facts.json \
  .shipwright/research/comp-b/facts.json
```
If you staged the intended packs into a comparison-only directory, you can also use `node scripts/pricing-diff.mjs --dir path/to/comparison-set/`.
Paste the table directly into the brief's pricing evidence section.

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
