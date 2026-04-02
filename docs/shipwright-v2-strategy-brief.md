# Shipwright v2 Strategy Brief

**Date:** April 2, 2026
**Ask:** Commit to a 6-week v2 focused on less ceremony, harder enforcement, and measurable proof.

## Situation

Shipwright already has a strong product-work contract: portable markdown skills, explicit output structure, pass/fail gates, adversarial review, and bounded research. It is strongest where artifact quality and process discipline are made explicit.

## Complication

Shipwright still asks users to tolerate more ceremony than many PM tasks warrant, and too much rigor depends on model compliance instead of executable validation. The current proof story is also mostly internal, which makes the system look better at shaping artifacts than proving better product decisions.

## Resolution

Shipwright v2 should focus on three bets and defer broader cleanup until these are proven.

### Bet 1: Fast Path for Obvious Work

**Thesis:** We believe that adding a top-level `Fast` mode for obvious asks will increase day-to-day usability because many PM tasks do not need planning-first orchestration.
**What would have to be true:** Most common asks can be routed with high confidence from intent alone; reducing ceremony does not materially reduce output quality.
**Investment level:** Major
**Time horizon:** This 6-week cycle
**Success metric:** By Week 4, 5 core workflows can run without mandatory planning when routing confidence is high. By Week 6, benchmarked time-to-first-usable-artifact is at least 30% lower than the current baseline.
**Kill criteria:** If `Fast` mode produces materially worse first-pass quality or creates routing confusion in benchmark review, keep it as an internal optimization only.

### Bet 2: Hard Contract for Core Artifacts

**Thesis:** We believe that adding machine-readable schemas plus validation for core artifacts will materially improve enforcement because quality checks will move from "instructions" to "runtime constraints."
**What would have to be true:** PRD, strategy, and challenge outputs can be represented cleanly in a structured format without making the human-readable artifact worse.
**Investment level:** Major
**Time horizon:** This 6-week cycle
**Success metric:** By Week 5, PRD, strategy doc, and challenge report all emit markdown plus structured data; validators catch missing decision fields, ownership, evidence markers, and unresolved contradiction flags.
**Kill criteria:** If schema authoring meaningfully slows artifact generation without improving validation or downstream reuse, narrow the scope to one artifact type.

### Bet 3: Proof Over Self-Assertion

**Thesis:** We believe that a benchmark harness plus real before/after cases will improve adoption and credibility because skeptical PMs need external proof, not repo-authored claims.
**What would have to be true:** A small fixed benchmark set can capture meaningful differences in usability, contradiction rate, and revision burden.
**Investment level:** Moderate
**Time horizon:** This 6-week cycle
**Success metric:** By Week 6, publish 6 benchmark scenarios, one blind review summary, and 2 before/after case studies.
**Kill criteria:** If the benchmark does not distinguish Shipwright from a strong baseline prompt, pause expansion work and revisit the product claim.

## Strategic Boundaries

### We will NOT:

- Do a broad taxonomy refactor in this cycle. It is a cleanup task, not the core unlock.
- Reorganize the repo into `core/` and `adapters/` yet. That is important, but not first-order.
- Add more skills or workflows before proving the current system is getting faster and harder.

### We will DEFER:

- Full manifest-driven doc generation beyond the highest-drift pages. Revisit after validators and benchmarks land.
- Broader cross-artifact consistency coverage beyond the highest-value chains. Start with `challenge -> revision` and `strategy -> PRD/plan` style checks.

## Success Criteria

| Bet | Leading Indicator by Week 4 | Outcome Target by Week 6 |
|---|---|---|
| Fast Path | `Fast` vs `Rigorous` entry model live for obvious asks | 30% lower benchmark time-to-first-usable-artifact vs baseline |
| Hard Contract | 3 schemas drafted and validator running in CI/local checks | Core artifacts fail mechanically on missing required fields or contradictions |
| Proof | 6 scenarios plus a scoring contract defined and baseline runs completed | Benchmark summary and 2 before/after cases published |

## 6-Week Delivery Sequence

1. **Week 1:** Freeze scope, define the 6 benchmark scenarios, publish the benchmark scoring contract and routing confidence rubric, capture baseline performance of the current system, and choose the first 3 artifact schemas.
2. **Week 2:** Implement top-level `Fast` and `Rigorous` entry behavior; remove mandatory planning for high-confidence obvious asks.
3. **Week 3:** Add machine-readable schemas for PRD, strategy doc, and challenge report.
4. **Week 4:** Add validators for required fields and first contradiction checks; wire challenge findings into revision checks.
5. **Week 5:** Run the benchmark suite, collect blind human ratings, and review v2 against the scoring contract.
6. **Week 6:** Publish the v2 proof pack, review results against kill criteria, and decide whether to expand, narrow, or pause. If core proof work is complete and stable, generate high-drift docs from `manifest.json` as a stretch task.

## Decision Frame

Recommendation: run Shipwright v2 as a focused 6-week program centered on `Fast path`, `hard validation`, and `proof`.
Trade-off: less surface-level cleanup now in exchange for sharper evidence that Shipwright is becoming a real runtime, not just a well-designed prompt system.
Confidence: High, because this directly addresses the current repo's clearest weaknesses without discarding its strongest ideas.
Decision owner/date: Ian / April 2, 2026. Revisit on May 14, 2026 after the benchmark and validator results.

## Unknowns & Evidence Gaps

- Current baseline for time-to-first-usable-artifact and revision count is not yet instrumented.
- Real user demand for `Fast` vs `Rigorous` is inferred, not measured.
- The highest-value contradiction checks still need to be chosen by chain, not just by artifact.
- It is not yet proven which schema fields will create the most downstream leverage.

## Pass/Fail Readiness

PASS if the team agrees to judge this cycle on benchmark movement, validator coverage, and reduced ceremony rather than repo polish.
FAIL if the cycle expands into taxonomy cleanup, architecture reorg, or net-new skill growth before the three bets are tested.

## Recommended Next Artifact

An implementation plan grounded in:

- `docs/shipwright-v2-technical-spec.md`
- `docs/shipwright-v2-benchmark-scoring-spec.md`
- the first patch sequence for schemas, extraction, validation, and orchestration changes
