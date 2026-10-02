# Offline condition check, 2026-10-02

Public release remains on hold. This note records one offline checker. It does not change installed instructions, reconciliation, or the package.

## What it sees

`scripts/condition-coverage.mjs` takes the user prompt, optional retained source text, and the final prose. It does not take an author reconciliation record. A finding is kept only when both quotes are exact slices of those inputs: the condition, and the sentence, cell, or bullet that drops it. No quote, no finding.

The checks are narrow:

- A low-risk or headcount exemption stated beside a stricter "not likely to result in a risk" test, or while the prompt says risks are unmapped.
- A renewal-rate interval equated with the decision margin, a percent of partners or seats used as the revenue rule, or a full-price pass line that drops the no-change basis, after the prompt says contract values or seat counts differ. A price multiplier applied again to changed-price revenue is the same class.
- A promise section that blocks the next sign-in, says a user cannot start a session, clears the screen, or cuts everyone off immediately, when an Optional password, an unestablished screen clear, or an offline-until-reconnect limit is stated elsewhere and missing from that section.
- A cheaper or percent-under claim in a recommendation section when the draft or a retained source says cadence or currency is unknown. A refusal to claim "cheaper" is not itself a claim. A like-for-like charging unit fails when scope or cadence is unresolved, and a feature available on a lower plan cannot be described as an upper-plan price.

Twenty-five unit tests cover these pairs, including a correct answer an author record cannot talk out of a failure. The full suite passed 683 tests, zero failures. The suite before this checker was 658. The difference is these 25 tests. The checker is not on the package allowlist in `scripts/build-plugin.mjs`.

## Predicate change

The first version flagged a bullet that merely named a count and a value. Careful renewal answers failed that test. The measure rule now requires a transferred number: a renewal-rate interval equated with the decision margin, a percent of partners or seats used as the revenue rule, or a full-price revenue pass line that drops the no-change basis. A decimal such as 13.33% is read as one percent, not as 33%. A sentence that says the revenue share is unknown, or that renewal response is missing, is not a swap.

Comparison refusals ("cannot claim to be cheaper") are not claims. A like-for-like charging-unit sentence still fails when the draft says the plan scope or cadence is unresolved. A feature marked available on a free plan cannot be described as an upper-plan price. Twenty-five unit tests cover these pairs. The checker remains off the package allowlist.

## Archive score

Both sets are the 20 substantive saved answers already graded in the October 1 evidence directories. Prompts and saved finals were the only inputs. Page files were not passed in. The later set is the one these predicates were fitted to. It was rescored until the human grades matched. The earlier set was then scored once and not used to add another phrase.

| Set | Recorded fails caught | Passes flagged | Quote overlap on hits |
|---|---:|---:|---:|
| Input and evidence, 2026-10-01, after the predicate change | 8 of 8 | 0 of 12 | 8 of 8 |
| Mechanism remediation, 2026-10-01, scored once | 0 of 9 | 0 of 11 | No recorded excerpts |

The first version of this checker, before the predicate change, caught 8 of 8 and flagged 2 of 12 on the later set, with quote overlap on 5 of 8. On the earlier set it caught 2 of 9 and flagged 1 of 11. Those two earlier hits came from the co-occurrence rule. Removing that rule removed the false alarms and also removed those two hits.

## What this does not support

The fitted set now matches the human grades, and the quotes match the recorded conflicts. The earlier set does not. Zero false alarms there is not a catch rate. The bar for a gate was a catch rate clearly above 2 of 9 on that earlier set, with at most one pass flagged. This score is 0 of 9. The misses were left as misses. Adding the checker to the installed path, or running another live round, is not justified.

## Decision Frame

Keep the release hold. Leave the checker unpackaged. The measured bar for any later gate is fewer false alarms on answers that already passed human review, and a higher catch rate on a set that was not used to write the patterns.

## Unknowns & Evidence Gaps

Whether a sterile host profile would change the underlying answers. Whether page text, passed in as source rather than as the model's summary, would catch the comparison misses. The 20-answer sets are the ones already spent. They are not a new sample.

## Pass/Fail Readiness

Fail as a release gate. Pass as a recorded result: the fitted answers can be separated without the co-occurrence false alarms, and that separation does not carry to the previous round.

## Recommended Next Artifact

Leave this checker unpackaged. A further offline revision has to raise the earlier-set catch rate above 2 of 9 without disturbing the later set's 8 hits and 12 passes. Do that before any live rerun, and do not fit phrases from the nine misses and then rescore those same nine.
