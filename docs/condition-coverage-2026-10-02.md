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

## Constraint echo

`scripts/constraint-echo.mjs` is a separate check. It pulls the noun attached to unknown, not stated, not established, except, optional, only if, and different. The decision, revisit trigger, launch copy, and press release have to carry that noun. An unestablished point also has to stay marked not established. A refusal with no positive ruling passes. A paraphrase adjudicator can be passed in. The archive score did not use one, so a decision that carries the point in other words still fails. Thirteen synthetic tests cover the pairs. With these tests the full suite passed 696, zero failures. The check is not on the package allowlist. The rules were not edited after this score.

| Set | Recorded fails caught | Passes flagged |
|---|---:|---:|
| Later 20, input and evidence | 7 of 8 | 12 of 12 |
| Earlier 20, mechanism remediation | 7 of 9 | 10 of 11 |

The catch rate travels, which the phrase checker did not. The cost is that careful answers fail too. One earlier pass survived. None of the later passes did. Many flagged nouns are the nearest word, such as "contents", "moves", "engineering", or "second", rather than the constraint the human graded. That score stands. It was not tuned.

## Paraphrase check

`scripts/paraphrase-echo.mjs` applies a judge to the quote pairs the echo check already produced. The rubric was committed in `b0b17d6a` before this score. Its hash is `969bf3c80ee1b105`. The judge sees the constraint sentence and the ruling sentence. It does not see the grade, the author record, or the rest of the draft. An echo removes that pair. A drop, a missing judgment, or an unclear word keeps the finding. The echo extractor was not edited.

Twelve judges split 173 unique pairs and saw no labels. The result was 28 echo, 145 drop, and 0 unparsed. Those judgments were applied once to each archive. With the nine harness tests, the full suite passed 705, zero failures.

| Set | Recorded fails caught | Passes flagged |
|---|---:|---:|
| Later 20, input and evidence | 7 of 8 | 12 of 12 |
| Earlier 20, mechanism remediation | 7 of 9 | 10 of 11 |

The document tallies match the echo check with no judge. The 28 echoes sat inside answers that still had another drop. The three misses were answers the echo check did not flag, so the judge had no pair that could restore them. The rubric was not edited after this score. Verdict ids are in `docs/paraphrase-echo-judgments-2026-10-02.json`. The check is not on the package allowlist.

## Head attachment

`scripts/constraint-head.mjs` was committed in `aa7d05af` before this score. A marker counts only when its own clause has a head. A previous sentence, a nearest leftover word, and a by-phrase agent do not supply one. The decision has to carry that head, and only a ruling of the same kind can make the finding: a comparison for an unknown or a difference, a stated fact for an unestablished point, an exemption or a cutoff for an exception or an only-if. The rule was not edited after the score. The check is not on the package allowlist. With these fifteen tests the full suite passed 720, zero failures.

The scored set is the 2026-09-30 live acceptance, which the earlier checks had not used. Labels are the coordinator lines that name a material L1, L2, L3, or L4 failure. The Claude structured PRD is L5, a contract miss, and it was skipped. Caveats that the note did not call material failures stayed passes.

| Set | Recorded fails caught | Passes flagged |
|---|---:|---:|
| 2026-09-30, 4 material fails and 14 passes | 2 of 4 | 1 of 14 |

The two hits are Claude pricing-decision and Claude pricing-framework. The pricing-decision findings quote the new-customer conversion trigger against an unknown market and an unknown price level. The pricing-framework finding quotes an unknown collaborator count against a price-test trigger, which is a different defect from the Business-tier audit log the note names. The miss is Claude governance-decision and Claude prd-draft. The one false alarm is Claude build-vs-buy, on an unknown cost comparison beside a stated fee range. Thirteen passes produced no finding.

## Decision Frame

Keep the release hold. Leave the phrase check, the echo check, the paraphrase check, and the head check unpackaged.

## Unknowns & Evidence Gaps

This set has four material fails. One of the two hits names a different defect from the note. The September 30 answers are now spent, along with the earlier 40. The sterile profile probe named earlier was not run.

## Pass/Fail Readiness

Fail as a release gate. Pass as a recorded result: on a set the rule had not seen, thirteen of fourteen careful answers stayed clear, and two of four material fails were flagged.

## Recommended Next Artifact

Leave the attachment as it is. Another rule fitted on these answers would reuse a spent set.
