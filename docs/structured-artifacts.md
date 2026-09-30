# Structured artifact handoffs

Markdown is the human-readable artifact. When an automated consumer explicitly requests structured output, append exactly one HTML comment containing a JSON object:

```text
<!-- shipwright:artifact
{ ... complete object conforming to the selected schema ... }
-->
```

Read the schema before producing the payload:

| Producer | artifact_type | Schema |
|---|---|---|
| prd-development | prd | schemas/artifacts/prd.schema.json |
| product-strategy-session | strategy | schemas/artifacts/strategy.schema.json |
| adversarial-review | challenge-report | schemas/artifacts/challenge-report.schema.json |

Use `schema_version: "2.0.0"`, lowercase `mode` (`fast` or `rigorous`), and lowercase depth (`light`, `standard`, `deep`; legacy `quick` means light). These workflow modes are unrelated to the optional decision CLI's separate multi-model harness.

## Shared fields

Include metadata, all six Decision Frame fields, unknowns, PASS/FAIL with reason, evidence entries and the type-specific payload. A reviewable draft can PASS its artifact gates while remaining metadata.status=draft; PASS does not grant human approval. Evidence-insufficient exploratory drafts remain FAIL. Do not put placeholders in fields and report readiness as PASS.

Every evidence entry has a unique `evidence_id`, `kind`, `source_ref`, lowercase confidence, and `supports` IDs. Link the recommendation with `decision_frame.recommendation`. Claims also use explicit evidence IDs. All references must resolve. Evidence of kind `assumption` does not substantiate a factual claim; mark the consuming claim as an assumption or hypothesis. Preserve claim, metric and finding IDs across revisions. A source reference must identify the actual supplied document, passage or URL.

PRD metrics require baseline, target, unit and timeframe. Strategy contains at most four bets with kill criteria. Unknown values remain explicit and block claims of readiness where required by the skill. Narrative-only checks, including guardrail adequacy, source truth and action ownership, still require semantic review; schema validity is insufficient.

## Challenge Reports and resolution

Use verdict `CLEAR`, `DEFEND`, `ESCALATE`, or `INSUFFICIENT_EVIDENCE`. Severity is `critical`, `moderate`, or `minor`; legacy `low` is accepted as minor. Assign a stable `finding_id` to every finding and include it in the visible findings table. Zero findings is valid for CLEAR. A Critical finding requires ESCALATE. An incomplete review uses INSUFFICIENT_EVIDENCE and FAIL.

The revised PRD/strategy records every related finding in `challenge_resolution`, using its original ID:

- `resolved`: note the actual revision and where it appears.
- `waived`: include the explicit human waiver, `waiver_reason` and `owner`; the agent cannot grant itself a waiver.
- `deferred`: retain the finding and explain the dependency. A deferred Critical finding blocks readiness.

Do not merge unrelated reports with colliding IDs. Namespace IDs by report when first created. Pass the full review and original artifact to the author, then check all resolution conditions.

## Validate at the boundary

From the user's project, run the helper by its absolute installed path:

```bash
node /path/to/shipwright/scripts/validate-artifact.mjs artifact.md --artifact-type prd --expect-structured --related strategy.json --related challenge-report.json
```

The validator rejects malformed envelopes, missing contract fields and evidence links. It flags likely citation gaps and cross-artifact contradictions. It cannot establish source truth, identify every contradiction, or prove the prose matches the JSON. A human/model semantic pass must compare both representations. Fix discrepancies before handing off; never use a clean hidden payload to excuse a defective visible artifact.

## Existing artifacts

The v2 contract now enforces fields that older validators left unchecked, including revisit triggers, nonblank values and metric baselines/targets. Existing artifacts must be revalidated before reuse. Add missing fields only from actual evidence or explicit decisions; preserve FAIL for unresolved gaps. Never auto-fill legacy artifacts merely to make validation pass. The test fixtures are synthetic examples, not production migrations.
