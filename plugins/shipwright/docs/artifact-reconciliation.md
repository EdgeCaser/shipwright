# Final artifact reconciliation

Use this local check for substantial decisions, competitor comparisons and PRDs containing material evidence claims, calculations or customer promises. It adds no model calls. It checks explicit records; it cannot decide whether a page entails a claim or whether the author omitted a contradiction.

## Capture inputs before drafting

Before substantive drafting, preserve the original request or supplied passages under `.shipwright/scratch/`. Use an existing supplied file if available. Otherwise copy the request verbatim into `request.txt` and use `--method author-copy`. The helper cannot read or authenticate the host's original message channel. `supplied-file` describes a local file, not verified user authorization. Do not claim an author-written copy is an authenticated original.

Create `inputs.json` with `inputs` and `behaviors` arrays. Keep it small: material supplied facts with exact `quote` excerpts, populations, periods, units, numerator/denominator roles and study design; explicit unknowns without values; assumptions and proposals separately labeled. Canonical behaviors retain `sourceQuote`, trigger, stage (`receipt`, `application` or `unknown`), population, online/offline boundary, latency, prerequisites, exceptions, guarantee status and `provenance.origin` (`supplied`, `proposed-requirement`, `implementation-evidence` or `unknown`). Before a draft exists, these behaviors have no `artifactQuotes`. An input classified as implementation evidence also has `origin: implementation-evidence`; a requested feature is not implementation evidence.

Run the installed helper against a new history directory and the designated final draft path:

```text
node <installed-root>/scripts/capture-inputs.mjs --request .shipwright/scratch/request.txt --record .shipwright/scratch/inputs.json --out .shipwright/scratch/input-history --artifact .shipwright/scratch/final.md --method author-copy
```

Read the captured extraction against the original passages before using it. Initial capture refuses an existing designated draft. It does not monitor other draft paths. If new input or an extraction correction changes the snapshot, rerun with `--reason "what changed and why"`. Earlier revision files remain, linked by hashes; do not overwrite, delete or silently replace them to make the answer agree. A hash proves recorded identity, not extraction correctness, completeness, source truth or approval. Someone who can replace the entire history can replace its provenance too.

## Keep a small record while drafting

Work under the project's `.shipwright/scratch/` directory. Use one version 2 record for the artifact, with only relevant domains. Copy `snapshotSha256` and `rootSha256` from capture into `inputSnapshot`. Reuse captured input IDs and fields. `requestText` may be omitted because the snapshot supplies it; if included it must match. Add later assumptions and proposals as such. To change a supplied fact, revise the capture with a reason. Preserve source passages with surrounding definitions, exceptions, table context and dates. The collector's `primarySource` objects retain bounded fetched text and metadata in `evidence.json`; truncation or a generated summary remains insufficient for a claim it does not establish.

For a known public source, direct capture needs no search provider:

```text
node <installed-root>/scripts/collect-research.mjs --url https://example.org/source --mode auto --out-dir .shipwright/scratch/source-pack
```

Read successful page context and acquisition limits. Blocked destinations, failed requests, unsupported content types and truncated context remain explicit gaps. A successful fetch does not prove primary authority or semantic support. If context is unavailable, keep the claim unresolved. Preserve rule prerequisites and referenced definitions, and match them to established or unresolved case inputs. Comparison conclusions must retain the source tuple's price, currency, unit, cadence and conditions.

Run the installed helper with `--help evidence`, `--help inputs` or `--help behavior` for the exact fields and a generic example. Paths below are relative examples: resolve the script from the actual installation root and use absolute paths if needed. Run plain Node commands without shell chaining.

```text
node <installed-root>/scripts/reconcile-artifact.mjs --help inputs
```

The top-level JSON record contains:

```json
{
  "version": 2,
  "inputSnapshot": { "snapshotSha256": "<from capture>", "rootSha256": "<from capture>" },
  "domains": ["inputs"],
  "inputs": [],
  "calculations": [],
  "review": {
    "sourceSupport": "What the inspected sources establish, and their limits.",
    "userFacts": "Compare quantities, populations, periods and unknowns with the request.",
    "consistency": "Compare the recommendation and customer copy with tables and operative requirements.",
    "approval": "Identify actual decision records or state that approval is absent.",
    "unresolved": []
  }
}
```

The empty arrays above are a starting shape, not a completed record. Add canonical inputs and linked calculations or scoped/unresolved claims. For the other domains use `evidenceSources` and `evidenceClaims`, or `behaviors` and `promises`. Every calculation, evidence claim, behavior and promise needs `id` and `artifactQuotes`, a list of exact visible excerpts from the final artifact. Include material occurrences in the opening, summaries, table rows, recommendations, launch copy and acceptance criteria. Reuse canonical records; do not retype a different population or billing term to make a claim fit.

For quantities, preserve revenue versus customer/seat retention, the weighting basis, baseline counterfactual, comparison population and horizon. An equal-value assumption allows a count retention calculation as a conditional illustration; it does not authorize a revenue operating threshold. A prospect experiment does not establish renewal response. Conditional arithmetic can remain useful without becoming an observed outcome or operating threshold; unsupported calculations name missing inputs.

For PRDs, supplied behavior is not verified implementation, and proposed requirements cannot prove existing capability. Final behaviors link to the snapshot with `provenance.sourceBehaviorId`. An implementation claim needs exact `evidenceRefs` to supplied inputs classified as implementation evidence. A percentile target cannot establish a maximum; receipt cannot establish application; an online condition cannot establish offline enforcement. Preserve every relevant prerequisite and exception through opening summaries, launch copy, FAQs, requirements and acceptance criteria. Links and tuple matches check consistency only; they cannot establish entailment or discover missing source rules.

## Reconcile the final draft

1. Save the complete draft. In a separate final reading, compare the actual opening, recommendation, tables, promises and requirements with the supplied inputs and primary evidence. Complete the four `review` observations and retain unresolved claims explicitly. A conditional recommendation can remain useful with missing evidence.
2. Run the helper against that exact draft and record:

```text
node <installed-root>/scripts/reconcile-artifact.mjs --artifact .shipwright/scratch/final.md --record .shipwright/scratch/reconciliation.json --snapshot .shipwright/scratch/input-history --out .shipwright/scratch/reconciliation-receipt.json
node <installed-root>/scripts/validate-artifact.mjs .shipwright/scratch/final.md --format json
```

3. Read both results. Inspect `coverage.unmappedLines`, especially opening summaries, FAQs, launch copy and recommendations, for missing claims or lost conditions. This syntactic inventory lists visible text outside exact mapped excerpts; it does not classify materiality. Unmapped prose can be harmless, and mapped prose can still be unsupported. Correct contradictory records and corresponding prose once, then rerun both commands after the last edit. Do not alter records alone while stronger prose remains. Deliver the checked draft without another rewrite.

The receipt includes artifact, record and snapshot hashes, checked-record counts, uncovered text, errors, unresolved warnings and limitations. Exit 0 means no record errors; it can include unresolved support. Exit 1 means malformed or inconsistent records, changed history or a file error. Legacy version 1 records remain supported without snapshot assurance. `recordConsistency: consistent` is not semantic certification, independent review, approval or readiness. The artifact validator controls structural validity and its explicit readiness gate.

If Node, the helper, writing permission or source context is unavailable, disclose the missing check and return the useful conditional draft. Do not claim execution from reading this document. Honor a user's no-writing instruction and disclose that the executable check was not run. These files are internal working evidence; save a final deliverable elsewhere only when requested.
