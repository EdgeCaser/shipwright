# Structured artifact handoffs

Markdown is the human-readable artifact. When an automated consumer explicitly requests structured output, append exactly one HTML comment containing a JSON object. The comment must start its own line:

```text
<!-- shipwright:artifact
{ ... complete object conforming to the selected schema ... }
-->
```

The JSON must not contain the text `-->`, because it ends the comment early. Write an arrow as `->` or escape it inside a string as `--\u003e`.

Read the schema before producing the payload:

| Producer | artifact_type | Schema |
|---|---|---|
| prd-development | prd | schemas/artifacts/prd.schema.json |
| product-strategy-session | strategy | schemas/artifacts/strategy.schema.json |
| adversarial-review | challenge-report | schemas/artifacts/challenge-report.schema.json |

Use `schema_version: "2.0.0"`, lowercase `mode` (`fast` or `rigorous`), and lowercase depth (`light`, `standard`, `deep`; legacy `quick` means light). These workflow modes are unrelated to the optional decision CLI's separate analysis modes.

## Shared fields

Include metadata, all six Decision Frame fields, unknowns, PASS/FAIL with reason, evidence entries and the type-specific payload. A reviewable draft can PASS its artifact gates while remaining metadata.status=draft; PASS does not grant human approval. Evidence-insufficient exploratory drafts remain FAIL. A Light PRD may PASS directionally with an identified metric and explicit baseline/target gaps, but it is not ready for engineering. A well-formed FAIL is a valid, unready artifact.

`metadata.status=approved` requires `metadata.approval_record` with `human_identity` (a named person's full name or email), `decision_ref` (URL, located file, or namespaced decision/ticket ID), and `decided_at` (timestamp). These fields make the decision traceable; an authored record does not prove authenticity. Verify the source before relying on the approval. Do not synthesize one.

Every evidence entry has a unique `evidence_id`, `kind`, `source_ref`, lowercase confidence, and `supports` IDs. Link the recommendation with `decision_frame.recommendation`. Claims also use explicit evidence IDs. All references must resolve. Evidence of kind `assumption` does not substantiate a factual claim; mark the consuming claim as an assumption or hypothesis. Preserve claim, metric and finding IDs across revisions. A source reference must identify the actual supplied document, passage or URL.

PRD metrics require baseline, target, unit and timeframe. Strategy contains at most four bets with kill criteria. Unknown values remain explicit and block claims of readiness where required by the skill. Narrative-only checks, including guardrail adequacy, source truth and action ownership, still require semantic review; schema validity is insufficient.

## Challenge Reports and resolution

Use verdict `CLEAR`, `DEFEND`, `ESCALATE`, or `INSUFFICIENT_EVIDENCE`. Severity is `critical`, `moderate`, or `minor`; legacy `low` is accepted as minor. Assign a stable `finding_id` to every finding and include it in the visible findings table. Zero findings is valid for CLEAR. A Critical finding requires ESCALATE. An incomplete review uses INSUFFICIENT_EVIDENCE and FAIL.

The revised PRD/strategy records every related finding in `challenge_resolution`, using its original ID:

- `resolved`: note the actual revision and where it appears.
- `waived`: include `waiver_reason`, `owner`, and `human_decision` with the same three provenance fields as an approval record; the agent cannot grant itself a waiver.
- `deferred`: retain the finding, its original severity, and the dependency. A deferred Critical finding blocks readiness; a Minor deferral is informational.

Do not merge unrelated reports with colliding IDs. Namespace IDs by report when first created. Record severity in each resolution so validation without a related report cannot hide a Critical finding. Engineering handoff requires the related challenge report to verify recorded resolutions. Pass the full review and original artifact to the author, then check all resolution conditions.

## Validate at the boundary

From the user's project, run the helper by its absolute installed path:

```bash
node "/path/to/shipwright/scripts/validate-artifact.mjs" "artifact.md" --artifact-type prd --expect-structured --related "strategy.json" --related "challenge-report.json" --require-ready
```

The validator returns separate `valid` and `readiness` results. The default CLI exits 0 for warnings, informational findings, and well-formed unready drafts; exits 1 for invalid contracts or visible/JSON mismatch; and exits 2 with `--require-ready` when a valid artifact is not ready for engineering. JSON output includes `readiness.ready` for the declared artifact use and `readiness.engineeringReady` for handoff.

`engineeringReady` checks deterministic prerequisites, not authorization or human approval. A complete draft can meet those prerequisites while remaining a draft. Verify the referenced human decisions and any required initiative approval before treating the handoff as approved; a successful CLI exit never supplies that approval.

The validator compares the six visible Decision Frame fields and PASS/FAIL status with JSON. Start the visible Pass/Fail Readiness section with its actual PASS or FAIL verdict, then explain it. For PRDs, put metric name, segment, baseline/current, target, unit, and timeframe in a labeled Markdown table so it can compare each value. Equivalent wording can pass free-text checks, but deterministic comparison cannot prove semantic equivalence or source truth. It flags likely citation gaps in prose and table rows and cross-artifact contradictions. Human review must verify source references, approval and waiver provenance, and substantive meaning.

## Existing artifacts

Visible checks ignore HTML comments and fenced code examples, including fences inside list items. A comment that starts a line outside a fence hides everything to its closing marker, or the rest of the document when unclosed; an inline comment must close within its paragraph, so a literal `<!--` in a code span stays visible. Fences may also open on a list-item line. Outside a list, a block indented four spaces after a blank line or heading is treated as code, as Markdown renders it; inside a list, indentation continues the item and stays visible. Confidence starts with its declared `low`, `medium`, or `high` value, which must not be immediately negated; the explanation after it may use "no" or "not"; owner and decision date match their complete normalized values. Metric cells may attach citation markers without treating citation numbers as measurements.

The v2 contract now enforces fields that older validators left unchecked, including revisit triggers, nonblank values and metric baselines/targets. Existing artifacts must be revalidated before reuse. Add missing fields only from actual evidence or explicit decisions; preserve FAIL for unresolved gaps. Never auto-fill legacy artifacts merely to make validation pass. The test fixtures are synthetic examples, not production migrations.
