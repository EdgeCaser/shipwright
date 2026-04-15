# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-2
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
A useful v1 must require structured handoff context, explicit ownership states, and manager visibility into pending and overdue handoffs.

## Evidence Or Reason
The artifact internally contradicts this claim. Functional Requirement #3 mandates structured context fields (reason, status, next action) as required, yet the Unknowns section explicitly states 'No evidence yet on which handoff context fields are truly required versus nice-to-have.' A PRD cannot credibly label fields as must-have requirements while simultaneously admitting it has no evidence for which fields matter. This is not tight scoping — it is premature commitment dressed as discipline. The same gap applies to 'overdue handoff' visibility: the artifact admits 'No validated threshold yet for what counts as an overdue handoff,' making the reporting requirement (track overdue handoffs) unimplementable as specified. The claim presents these as settled v1 requirements when they are actually untested hypotheses that should appear in the evidence gaps column, not the requirements table.

