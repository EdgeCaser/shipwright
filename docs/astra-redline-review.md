# Astra red-line review

Date: 2026-09-30. Starting commit: `3a4ea2c`, with the three Grok follow-up fixes already in the working tree. The user requested an independent Astra review and up to three rounds of repair and rebuttal. The reviewer used `gpt-6-astra` at xhigh effort with fresh context and read-only access. The coordinator implemented repairs.

## Round 1

The reviewer found nine confirmed defects, including a malformed-input crash reproduced by the coordinator. All nine were accepted. The previous Grok fixes remain included: complete owner/date comparisons, scoped bare-URL row citations, and reported case-study outcomes.

| ID | Finding | Repair and regression evidence |
|---|---|---|
| R1-01 | A scenario ID could escape the temporary directory, overwrite an existing JSON file, and delete it during cleanup. | Temporary scenarios use a fixed filename. Synthetic tests preserve a sibling sentinel through runner failure and cleanup, with both slash styles. |
| R1-02 | Evidence follow-ups discarded the original scenario prompt and context files, then lost earlier additions. | Re-analysis preserves the original scenario and safe context loader, appends new evidence, and persists evidence history for later follow-ups and retries. A controller regression exercises two additions with unresolved human review. |
| R1-03 | Pricing reconstruction combined fields from different offers into an invented plan/price/currency combination. | Adapter and text facts retain offer identity through deduplication. Both renderers share reconstruction scoped to source and offer; ambiguous legacy groups are omitted. Regressions exercise the complete extraction-to-rendering path, repeated values, source separation, and incomplete offers. The new helper is packaged. |
| R1-04 | HTML comments could satisfy visible contract fields and engineering requirements. | Shared visible-text preparation excludes comments and fenced examples, preserving line numbers. Regressions cover both fence styles and hidden requirements. Citation scanning now also checks prose after the structured envelope. |
| R1-05 | Visible low confidence passed when its explanation mentioned high uncertainty. | The declared leading confidence enum must agree. The existing explained-high positive example still passes. |
| R1-06 | Metric citation numbers were counted as additional measurements. | Recognized citations are separated from metric values. Linked values retain their displayed number; actual numeric contradictions still fail. |
| R1-07 | Session IDs escaped the session store through create/read/update/event helpers. | Every store path uses one safe identifier check. Updates preserve session identity. Regressions cover traversal, separators, drive syntax, device names, and all store entry points. |
| R1-08 | Mock session tests wrote synthetic results and telemetry into normal user output directories. | A test bootstrap creates a disposable output root before production modules load. `SHIPWRIGHT_OUTPUT_ROOT` controls default Fast/Rigor, session, and telemetry locations. |
| R1-09 | Null PRD metrics and strategy bets crashed validation. | Malformed entries return schema errors and unready results. Focused tests cover null, primitive, and array entries; an additional one-field mutation probe exercised 768 malformed variants with no exceptions. |

### Pushback and agreement

- The coordinator rejected a universal restriction on scenario IDs as unnecessary. IDs remain metadata; a fixed temporary filename and existing normalized output paths remove their filesystem effect. The reviewer agreed. Session IDs, which directly name store directories, are restricted.
- The coordinator proposed one output-root setting and test bootstrap instead of passing telemetry paths through every controller API. The reviewer agreed, subject to complete default-path coverage and a before/after file fingerprint check.
- The optional test-description correction was accepted: conflict preflight is described accurately, without claiming crash-atomic installation.

## Round 2

The reviewer independently ran 53 focused tests and confirmed the initial repairs. It found four further counterexamples; all were accepted and repaired:

| Finding | Repair |
|---|---|
| A failed evidence addition disappeared on retry. | Persist the pending follow-up action and supplied evidence before calling the runner. Retry that action with the same evidence; clear pending input only after success. The regression captures a transient failure and verifies that the successful retry includes the original packet, context, and all three additions. |
| Multiple products' offers appeared under the first product name. | Carry product ownership on offer facts and reconstructed tuples. Both formatter modes and comparison rows retain that ownership. Free-entry indicators are scoped to the same product. |
| An adjacent footnote such as `42[1]` was still counted as a second measurement. | Remove adjacent numeric citation markers while retaining the displayed numeric value of a link. |
| Metric ID `m1` matched a row labeled `M10: Abandonment`. | Match complete IDs, treating letters, numbers, hyphens, and underscores as identifier characters. Exact names and explicit ID labels still work. |

The coordinator's focused verification after these repairs passed 111 tests.

## Round 3

The reviewer independently ran 55 focused tests and confirmed all four Round 2 repairs. It identified one final P2 case: an unnamed product's offer still inherited the first named product's identity.

The coordinator accepted and repaired it. Offer facts now retain a separate product identifier even when the source has no product name. Pricing rows explicitly say `Unnamed product`, and free-entry indicators stay tied to the same product. A synthetic catalog regression covers one named product and two distinct unnamed products; the focused pricing/extraction suite passed 91 tests.

**Stopped at the three-round limit.** All 14 confirmed findings have implemented repairs. The final unnamed-product repair was tested by the coordinator after the reviewer's final report; it has not received another independent review. This is not a claim of blanket reviewer approval or proof that no defects remain.

## Verification

- Final full Windows suite: **488 passed, zero failed or skipped**. Earlier Round 1 and Round 2 trees passed 485 and 487 tests respectively.
- Repository validator: **zero errors**, 46 skills, seven agents, 17 workflows.
- SHA-256 fingerprints before and after the full suite: all **4,113 files** under existing `benchmarks/results/` and `benchmarks/telemetry/` unchanged, with no new files.
- Fresh bundle dependency checks and disposable installation/update tests pass. Packaged formatter and pricing comparison modules import successfully.
- `git diff --check`: clean.

These are local deterministic checks using synthetic inputs. No live provider calls, credentials, real-project installation, publication, or push were used. Claude/Codex host acceptance remains separate. Deterministic prose comparison, provenance authenticity, context containment limits, and installer crash recovery retain the limits documented in the prior remediation report.
