# Launch Decision Memo: Conflicting Stakeholder Commitments

**Status:** Decision Required — Immediate  
**Prepared for:** Executive Leadership  
**Context:** Three non-negotiable constraints are in active conflict. This memo frames the decision, surfaces unknowns, and recommends a path to resolution.

---

## Decision Frame

### The Core Conflict

Three commitments have been made independently, and they cannot all be honored as stated:

| Party | Commitment | Timeline |
|---|---|---|
| Engineering | Earliest complete build | 8 weeks from now |
| Sales | Customer-facing Q1 delivery promise | Already committed, Q1 boundary |
| CEO | Conference announcement | 3 weeks from now |

Each stakeholder has characterized their constraint as non-negotiable. That framing is a negotiating posture, not an objective fact — but unpacking it requires evidence this memo does not yet have.

### What Kind of Decision This Is

This is not a scheduling problem. It is a **commitment-sequencing failure**: external promises were made before internal readiness was confirmed. The decision is therefore not "which date wins" but **which commitment, if broken, causes the least irreversible damage** — and what must be done in the next 72 hours to limit exposure on all three fronts.

### The Structural Options

**Option A — Conference Announcement Only (3 weeks)**  
Announce at conference with a defined GA date (8+ weeks out). Sales reframes Q1 commitment as "announced in Q1" rather than "delivered in Q1." Engineering timeline unchanged.  
*Risk:* Sales relationship damage if customers won't accept the reframe. Conference announcement locks a public date.

**Option B — Soft Q1 Delivery (Partial / Beta)**  
Ship a limited release to sales-committed accounts in Q1. Full GA follows engineering's 8-week estimate. Conference announcement positions this as "early access launch."  
*Risk:* Partial release may undermine quality signal. Engineering scope must be immediately triaged to identify what is shippable in <4 weeks.

**Option C — Slip Everything, Recalibrate**  
Acknowledge the conflict publicly within the organization, reset all three stakeholders to a single honest date, absorb relationship damage now rather than compound it.  
*Risk:* Sales customer attrition. CEO may override. Morale impact.

**Option D — CEO Skips Conference Announcement**  
Pull the conference announcement. Sales commitment honored at Q1. Engineering holds 8-week timeline.  
*Risk:* Conference opportunity cost. CEO buy-in unlikely without strong business case.

---

## Unknowns & Evidence Gaps

This memo cannot recommend a specific option without answers to the following. These are **blocking unknowns** — the decision should not be finalized until each is resolved.

### ctx-1 — What did sales actually promise customers?
The Q1 commitment may range from "general availability" to "you'll be in our beta" to "contract signed and implementation begins." The legal and relational exposure is entirely different across these. **Required:** Sales lead to produce exact language from customer communications within 24 hours.

### ctx-2 — What is the conference announcement's reversibility?
Is the CEO slot confirmed and announced? Or is it a planned slot not yet public? A private conference session that hasn't been promoted is very different from a keynote listed in the conference program. **Required:** Comms/CEO to confirm public commitment status by EOD.

### ctx-3 — What is the engineering 8-week estimate's confidence interval?
Is 8 weeks a p50 or a p90 estimate? Is there a shippable subset (core feature complete) achievable in 4-5 weeks that would support a limited release? **Required:** Engineering lead to provide a scope-tiered estimate: what ships in 3 weeks, 5 weeks, 8 weeks.

### ctx-4 — What is the actual customer consequence of slipping Q1?
Are there contract penalties? Renewal decisions at risk? Or is this a relationship expectation without formal consequence? **Required:** Sales to assess customer-by-customer impact within 48 hours.

### ctx-5 — Does the CEO have full visibility into the conflict?
If the CEO's conference commitment was made without knowing sales had already committed Q1 and engineering was 8 weeks out, the CEO may be willing to modify approach once the conflict is named explicitly. **Required:** A direct, unambiguous conflict briefing to the CEO before any option is pursued.

---

## Pass/Fail Readiness

### Criteria for a Viable Launch Decision

A launch decision passes only if it satisfies all of the following:

- [ ] **Commitment alignment:** All three stakeholders have agreed — explicitly, in writing — to the same date and the same definition of "launch"
- [ ] **Engineering sign-off:** Engineering has confirmed the selected date is achievable at acceptable quality, or has documented the explicit quality trade-offs being accepted
- [ ] **Customer exposure mapped:** Sales has confirmed what each committed customer will receive and when, and has communicated any changes
- [ ] **Conference posture confirmed:** If an announcement is made at the conference, the announced date matches the engineering-confirmed date
- [ ] **Escalation path identified:** If engineering slips after the decision is made, there is a pre-agreed owner and protocol for re-escalation

### Current State

Zero of five criteria are currently met. **This is not a ready-to-decide situation.** The memo's role is to create the conditions for a decision, not to make one prematurely.

### Time Constraint

The conference is 3 weeks out. If Option A (conference announcement) is viable, the CEO needs an answer within **5 business days** to prepare remarks. This creates a hard internal deadline that is shorter than any of the external ones.

---

## Recommended Next Artifact

**Artifact:** Stakeholder Alignment Brief + Triage Decision Meeting Agenda  
**Owner:** PM or Chief of Staff  
**Due:** Within 48 hours

The next artifact should:

1. **Collect the blocking unknowns** (ctx-1 through ctx-5 above) — assign each to a named owner with a 24-48 hour deadline
2. **Convene a single room** (or call) with the CEO, sales lead, and engineering lead — this conflict cannot be resolved asynchronously; each party needs to hear the others' constraints directly
3. **Present the four options** from this memo with the evidence collected, and force a ranked preference from each stakeholder
4. **Produce a written decision** within 72 hours with a single date, a single definition of launch, and named owners for each commitment thread

**What this memo should not be used for:** Making a unilateral recommendation on which stakeholder's constraint to override. That decision requires political authority this memo does not have, and evidence this memo does not yet possess.
