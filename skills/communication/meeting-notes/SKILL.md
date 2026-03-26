---
name: meeting-notes
category: communication
tags: [meeting-notes, action-items, decisions, transcript-processing, follow-up, accountability]
inputs: [raw meeting notes or transcript, attendee list, previous action items]
outputs: [structured meeting summary, action item list, decision log entries]
pairs_with: [decision-log, stakeholder-communication, retrospective-facilitator]
---

# Meeting Notes & Action Items

## Description

Transforms raw meeting notes, transcripts, or recordings into structured summaries with decisions captured, action items assigned, open questions tracked, and parking lot items preserved. The single skill every PM uses daily.

## When to Use

- After any meeting (standup, planning, 1:1, design review, stakeholder sync)
- Processing a meeting transcript or recording
- Before the next meeting — review previous action items
- When someone asks "what did we decide in that meeting?"

## Framework

### Meeting Notes Template

```markdown
# [Meeting Name] — [Date]

## Metadata
- **Date & Time:** [date, time, duration]
- **Attendees:** [names — mark who was absent with ~~strikethrough~~]
- **Facilitator:** [name]
- **Note-taker:** [name]
- **Recording:** [link, if available]

---

## Summary (TL;DR)
[2-3 sentences capturing the most important outcomes. If someone reads only this section, they should know what happened.]

---

## Decisions Made

| # | Decision | Context | Decision-Maker | Dissent? |
|---|---|---|---|---|
| D1 | [What was decided] | [Brief context — why this came up] | [Who made the call] | [Any notable disagreement to record] |
| D2 | [What was decided] | [Context] | [Who] | [Dissent] |

---

## Action Items

| # | Action | Owner | Due Date | Status |
|---|---|---|---|---|
| A1 | [Specific, actionable task] | [Single owner — never "the team"] | [Date] | [ ] Open |
| A2 | [Specific task] | [Owner] | [Date] | [ ] Open |
| A3 | [Specific task] | [Owner] | [Date] | [ ] Open |

---

## Discussion Notes

### Topic 1: [Title]
[Key points discussed. Capture the substance, not a transcript. Focus on:]
- Arguments for and against
- Data or evidence cited
- Concerns raised
- Resolution or next step

### Topic 2: [Title]
[Key points discussed]

---

## Open Questions

| # | Question | Owner (to resolve) | Due Date |
|---|---|---|---|
| Q1 | [Unresolved question that needs follow-up] | [Who will answer] | [When] |

---

## Parking Lot
[Items raised but explicitly deferred to a future discussion]
- [Topic 1] — Revisit: [when]
- [Topic 2] — Revisit: [when]

---

## Previous Action Items (Review)

| # | Action | Owner | Status | Outcome |
|---|---|---|---|---|
| A1 (prev) | [From last meeting] | [Owner] | [Done / In Progress / Blocked] | [Brief outcome] |
```

### Processing Raw Transcripts

When given a raw transcript or brain-dump notes:

**Step 1: Extract decisions** — Scan for language indicating a decision was made:
- "We agreed to..."
- "Let's go with..."
- "The decision is..."
- "We're going to..."

**Step 2: Extract action items** — Look for commitments:
- "[Name] will..."
- "Can you [action] by [date]?"
- "The next step is..."
- "We need someone to..."

**Step 3: Identify open questions** — Unresolved items:
- "We still need to figure out..."
- "I'll check on that"
- "TBD"
- Questions asked but not answered

**Step 4: Synthesize discussion** — Compress to key points:
- Remove small talk, filler, and repeated points
- Preserve disagreements and their resolution
- Capture data points and evidence cited
- Note emotional signals ("there was strong pushback on...")

### Meeting-Type-Specific Templates

**For Sprint Planning:**
Add: Sprint goal, committed stories, capacity breakdown

**For 1:1s:**
Add: Career development items, feedback given/received, personal context

**For Design Reviews:**
Add: Design decision log, feedback by reviewer, next iteration scope

**For Stakeholder Syncs:**
Add: Alignment status, escalation items, communication actions

## Output Format

Produce structured meeting notes with:
1. **TL;DR** — 2-3 sentence summary
2. **Decisions** — numbered with context and decision-maker
3. **Action Items** — owned, dated, trackable
4. **Discussion Notes** — substance by topic
5. **Open Questions** — assigned and dated
6. **Parking Lot** — deferred items with revisit dates
7. **Previous Action Review** — accountability check

## Common Mistakes to Avoid

- **Transcript, not notes** — Don't capture everything; capture what matters (decisions, actions, key arguments)
- **Unowned action items** — "We should look into X" is not an action item; "[Name] will research X by Friday" is
- **Missing decisions** — If a decision was made, it must be explicitly captured; implicit decisions get relitigated
- **No TL;DR** — People who weren't in the meeting need the summary; they won't read the full notes
- **Never reviewing previous actions** — Without accountability, meeting notes are write-only artifacts
