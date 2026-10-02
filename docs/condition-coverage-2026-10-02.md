# Offline condition check, 2026-10-02

Public release remains on hold. This note records one offline checker. It does not change installed instructions, reconciliation, or the package.

## What it sees

`scripts/condition-coverage.mjs` takes the user prompt, optional retained source text, and the final prose. It does not take an author reconciliation record. A finding is kept only when both quotes are exact slices of those inputs: the condition, and the sentence, cell, or bullet that drops it. No quote, no finding.

The checks are narrow:

- A low-risk or headcount exemption stated beside a stricter "not likely to result in a risk" test, or while the prompt says risks are unmapped.
- A count, renewal rate, or per-arm interval used in the same claim as revenue, margin, or break-even, after the prompt says contract values or seat counts differ. A second pattern flags a price multiplier applied again to changed-price revenue.
- A promise section that blocks the next sign-in, clears the screen, or cuts everyone off immediately, when an Optional password, an unestablished screen clear, or an offline-until-reconnect limit is stated elsewhere and missing from that section.
- A cheaper or percent-under claim in a recommendation section when the draft or a retained source says cadence or currency is unknown.

Eighteen unit tests cover paired wording for those four shapes, including a correct answer an author record cannot talk out of a failure. The full Node suite passed 676 tests, zero failures. The previous recorded suite was 658. The difference is these 18 tests. The checker is not on the package allowlist in `scripts/build-plugin.mjs`.

## Archive score

Both sets are the 20 substantive saved answers already graded in the October 1 evidence directories. Prompts and saved finals were the only inputs. Retained page files were not passed in, so a condition that exists only on a page was invisible. The grades are the archived semantic labels.

The later set is the one whose published failure notes match these patterns. On that set the checker caught every recorded fail and false-alarmed two passes.

| Set | Recorded fails caught | Passes flagged | Quote overlap on hits |
|---|---:|---:|---:|
| Input and evidence, 2026-10-01 | 8 of 8 | 2 of 12 | 5 of 8 |
| Mechanism remediation, 2026-10-01 | 2 of 9 | 1 of 11 | No recorded excerpts |

The two false alarms on the later set, and the one on the earlier set, are careful renewal answers. A bullet names seat counts and revenue together, or says a revenue break-even is anchored on retention that includes seat downgrades. The rule treats that co-occurrence as a swap. Three of the eight hits on the later set agreed with the fail label but quoted a different sentence than the recorded conflict.

The earlier set was not used to choose the patterns. The checker missed both privacy-applicability fails, the field-access behavior fail, the repeat training-renewal fail, the preserved pricing-decision fail, the preserved SSO fail, and the preserved pricing-framework fail. Those drops are real and worded outside these patterns: a missing legal prerequisite, a behavior exception other than password or screen clearing, and a comparison that does not say "cadence" or "currency" next to "unknown."

## What this does not support

The plain check is not accurate enough to block a recommendation. It repeats the fitted failures and also flags answers that keep the two measures apart in one bullet. It does not generalize to the previous round. Adding it to the installed path, or running another live round to word around it, is not justified by this score.

## Decision Frame

Keep the release hold. Leave the checker unpackaged. The measured bar for any later gate is fewer false alarms on answers that already passed human review, and a higher catch rate on a set that was not used to write the patterns.

## Unknowns & Evidence Gaps

Whether a sterile host profile would change the underlying answers. Whether page text, passed in as source rather than as the model's summary, would catch the comparison misses. The 20-answer sets are the ones already spent. They are not a new sample.

## Pass/Fail Readiness

Fail as a release gate. Pass as a recorded negative result: author-record reconciliation was the wrong layer, and this quote check is not yet the replacement.

## Recommended Next Artifact

A revision of this checker only if it can separate "these two measures differ" from "this count was used as that value" on the three false-alarm answers without losing the eight hits. Do that offline. Do not start a live rerun from this result.
