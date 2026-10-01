# Final artifact reconciliation

Use this local check for substantial decisions, competitor comparisons and PRDs containing material evidence claims, calculations or customer promises. It adds no model calls. It checks explicit records; it cannot decide whether a page entails a claim or whether the author omitted a contradiction.

## Keep a small record while drafting

Work under the project's `.shipwright/scratch/` directory. Use one record for the artifact, with only relevant domains. Preserve the supplied request or input passage verbatim as `requestText`. Keep supplied facts, assumptions, proposals and unknowns distinct. Preserve relevant source passages with their surrounding context and dates. The collector's `primarySource` objects retain bounded fetched text and metadata in `evidence.json`; a truncated excerpt or generated fetch summary remains insufficient for a claim it does not establish. If primary context is unavailable, use an unresolved claim and state the limit.

Run the installed helper with `--help evidence`, `--help inputs` or `--help behavior` for the exact fields and a generic example. Paths below are relative examples: resolve the script from the actual installation root and use absolute paths if needed. Run plain Node commands without shell chaining.

```text
node <installed-root>/scripts/reconcile-artifact.mjs --help inputs
```

The top-level JSON record contains:

```json
{
  "version": 1,
  "domains": ["inputs"],
  "requestText": "The original supplied request or input passage.",
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

For quantities the helper supports a few explicit arithmetic and scope checks. Unsupported calculations remain unresolved and need a separately justified method. For PRDs, the operative behavior is the capability that supports a promise: a percentile target cannot establish a maximum, and an online condition cannot establish offline enforcement. For evidence, text inclusion, typed source records and matching tuples establish internal consistency only. The author must inspect source context and determine applicability.

## Reconcile the final draft

1. Save the complete draft. In a separate final reading, compare the actual opening, recommendation, tables, promises and requirements with the supplied inputs and primary evidence. Complete the four `review` observations and retain unresolved claims explicitly. A conditional recommendation can remain useful with missing evidence.
2. Run the helper against that exact draft and record:

```text
node <installed-root>/scripts/reconcile-artifact.mjs --artifact .shipwright/scratch/final.md --record .shipwright/scratch/reconciliation.json --out .shipwright/scratch/reconciliation-receipt.json
node <installed-root>/scripts/validate-artifact.mjs .shipwright/scratch/final.md --format json
```

3. Read both results. Correct contradictory records and their corresponding prose once, then rerun both commands after the last edit. Do not fix only a record while leaving stronger prose in the artifact. Deliver the saved draft without rewriting it after these checks. A further rewrite invalidates the old artifact hash and requires a new check.

The receipt includes the artifact and record hashes, checked-record counts, errors, unresolved warnings and explicit limitations. Exit 0 means no record errors; it can include unresolved support. Exit 1 means malformed or inconsistent records, or a file error. `recordConsistency: consistent` is not semantic certification, independent review, approval or readiness. The unchanged artifact validator controls structural validity and its explicit readiness gate.

If Node, the helper, writing permission or source context is unavailable, disclose the missing check and return the useful conditional draft. Do not claim execution from reading this document. Honor a user's no-writing instruction and disclose that the executable check was not run. These files are internal working evidence; save a final deliverable elsewhere only when requested.
