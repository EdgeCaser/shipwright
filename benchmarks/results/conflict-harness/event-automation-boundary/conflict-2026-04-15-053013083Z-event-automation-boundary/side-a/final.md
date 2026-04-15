# Phase 1 PRD: Event Automation Platform

## Decision Frame

**What decision does this PRD gate?**
Whether to staff and fund a Phase 1 build (est. 8–12 weeks) that ships a WhatsApp intake assistant, an internal ops console, and a human-approval layer for pricing commitments — before any autonomous execution capability is introduced.

**Core bet:** The primary friction in event management operations is not a shortage of staff — it is latency and consistency in qualification, scoping, and commitment. An LLM-assisted intake loop (WhatsApp) paired with a deterministic approval gate can cut quote turnaround from 48–72 hrs to under 4 hrs without increasing error rate on pricing.

**Scope boundary (Phase 1):**
- IN: WhatsApp assistant for intake and FAQ; internal console for ops team; human-in-the-loop approval for any commitment ≥ pricing threshold; deterministic rules engine for all downstream actions post-approval.
- OUT: Autonomous booking, payment processing, vendor negotiation, or any LLM-generated commitment flowing to a client without human review.

**LLM usage policy (non-negotiable):**
| Function | LLM Allowed? | Rationale |
|---|---|---|
| Client intake classification | Yes | Low-stakes, reversible |
| FAQ / info responses | Yes | Factual, bounded |
| Draft quote generation | Yes (draft only) | Human reviews before send |
| Pricing commitment to client | No | Deterministic rule + human sign-off |
| Vendor availability lookup | No | API call, not inference |
| Contract generation | No | Template engine only |
| Any action with financial consequence | No | Hard boundary |

This table is the authoritative LLM boundary document for Phase 1. Any deviation requires an ADR.

---

## Target Users

**Primary:** Internal ops team (2–6 coordinators) managing inbound event requests across WhatsApp, email, and phone.
**Secondary:** Clients initiating event inquiries via WhatsApp.
**Out of scope for Phase 1:** Vendors, venues, finance team.

---

## Functional Requirements

### F1 — WhatsApp Intake Assistant
- Receives inbound WhatsApp messages via WhatsApp Business API.
- Classifies intent: new inquiry, existing booking question, vendor coordination, or out-of-scope.
- Collects structured intake fields: event type, date range, headcount, venue preference, budget signal.
- Responds with FAQ answers or confirms handoff to ops console.
- Does NOT confirm pricing, availability, or commit to any service.
- Fallback: if confidence < threshold OR intent = pricing/commitment, route to human immediately with full context.

### F2 — Internal Ops Console
- Displays all active conversations with intake summary and extracted fields.
- Allows ops team to assign, respond, escalate.
- Shows pending approval queue for pricing commitments.
- Audit log: every LLM-generated draft is marked as draft; every human action is timestamped and attributed.

### F3 — Human Approval Gate (Pricing)
- When a quote draft is generated, it enters PENDING state.
- Ops team member reviews draft in console, edits if needed, approves or rejects.
- Only upon explicit approval does any pricing information reach the client.
- Approval is a named, timestamped action — non-repudiable.
- No auto-approval path exists in Phase 1, regardless of quote size.

### F4 — Deterministic Rules Engine
- Post-approval actions (send quote, schedule follow-up, log to CRM) are executed by rule, not LLM.
- Rules are version-controlled and operator-editable without code deployment.

---

## Non-Functional Requirements

- **Latency:** WhatsApp response within 10 seconds for automated replies.
- **Audit:** 100% of LLM-generated content logged with prompt, completion, model version, and timestamp.
- **Explainability:** Ops team can see why any message was classified as it was (top-reason display).
- **Failsafe:** Any LLM service outage falls back to human-only queue; no client-facing degradation.
- **Data residency:** Client PII must not be sent to LLM providers without consent; intake fields are structured and separated from free-text before LLM call.

---

## Unknowns & Evidence Gaps

**Note:** The table below represents minimum known blockers as of this draft. Discovery interviews will likely surface additional blockers not yet visible from the outside. The list should be treated as a floor, not a ceiling.

| # | Unknown | Why It Matters | How to Resolve | Blocking? |
|---|---|---|---|---|
| U1 | Actual intake volume and peak load | Determines whether WhatsApp throughput and console queue design are sufficient | Ops team audit of last 90 days of inbound inquiries | Yes — before infra sizing |
| U2 | Ops team approval latency in practice | If team approves in <15 min, the gate adds minimal friction; if >4 hrs, client experience degrades | Shadow study: time ops team on current quote approval flow | Yes — affects UX promise |
| U3 | WhatsApp Business API availability in target market | WABA has geo/tier restrictions; some markets require BSP intermediary | Confirm with ops which countries clients are in; check WABA terms | Yes — before committing to WhatsApp channel |
| U4 | Acceptable LLM provider for PII handling | Ops and legal may have constraints on which LLM APIs can receive client data | Legal/compliance review before vendor selection | Yes — before architecture commit |
| U5 | Threshold for "pricing commitment" | $0? Any number? Only confirmed bookings? | Product + ops alignment session | Yes — defines the gate trigger |
| U6 | Approval role design | Who can approve? Single approver, role-based, or tiered by deal size? Mis-specifying this creates compliance gaps | Ops workflow mapping session | Yes — gates console data model |
| U7 | Deterministic fallback behavior for ambiguous messages | Messages that are neither clearly in-scope nor out-of-scope — what does the rules engine do? Silence is not acceptable | Edge-case mapping exercise with ops team | Yes — required before fallback spec |
| U8 | WhatsApp conversation consent and retention policy | WABA terms + local data law may require explicit opt-in; retention periods affect storage design | Legal review of applicable data regulations | Yes — before any data is stored |
| U9 | Internal console integration constraints | Ops likely uses existing CRM, calendar, and ticketing tools; unknown systems affect scope sharply | Ops team systems audit | Soft — can scope to Phase 1b if isolated |

**Gap summary:** U1–U8 are plausible Phase 1 blockers; U9 can likely be deferred. This list was constructed from the prompt and product reasoning — it is not exhaustive. Discovery interviews should be treated as a blocker-identification exercise, not a confirmation exercise. This PRD should not gate a build until U1–U8 are resolved or explicitly scoped out with documented assumptions.

---

## Pass/Fail Readiness

**This PRD is READY TO PROCEED to discovery sprint if and only if:**

| Criterion | Status | Owner |
|---|---|---|
| Ops team sponsor identified and committed to 3 discovery sessions | ⬜ Not confirmed | Product lead |
| WhatsApp Business API feasibility confirmed for target geo | ⬜ Not confirmed | Engineering lead |
| LLM provider shortlist with PII handling confirmed | ⬜ Not confirmed | Engineering + Legal |
| "Pricing commitment" threshold defined and agreed | ⬜ Not confirmed | Product + Ops |
| Ops team approval latency baseline measured | ⬜ Not confirmed | Product lead |
| Approval role and permission model agreed | ⬜ Not confirmed | Product + Ops |
| Ambiguous-message fallback behavior specified | ⬜ Not confirmed | Product + Engineering |
| WhatsApp consent and retention policy cleared by Legal | ⬜ Not confirmed | Legal |

**Current readiness verdict: NOT READY FOR BUILD.** Ready for a 1-week discovery sprint to resolve U1–U8. Discovery should be scoped to surface blockers not yet visible, not just confirm the ones listed here.

**Hard stops that would kill Phase 1:**
- WABA unavailable in primary market → pivot to SMS or web chat before committing to WhatsApp architecture.
- Legal blocks LLM providers from receiving PII → scope drops to rule-based intake only; LLM value drops sharply.
- Ops approval latency > 4 hrs structurally → human gate becomes a bottleneck; re-evaluate whether automation actually helps.
- No viable approval role model → gate cannot be specified; Phase 1 core value proposition collapses.

---

## Recommended Next Artifact

**Immediate (this week):** Discovery sprint kickoff doc — a one-pager scoping 5 ops team interviews and a systems audit to close U1–U8. Frame discovery sessions as blocker-hunting, not requirements-gathering.

**After discovery closes U1–U8:**
- If green: Technical Architecture Decision Record (ADR) covering LLM provider, WABA integration pattern, approval gate data model, and fallback behavior spec.
- If yellow (1–2 unknowns soft): Proceed to ADR with explicit assumptions logged and a 2-week checkpoint.
- If red (hard stop triggered): Scope pivot memo recommending either channel swap or rules-only Phase 1.

**Do not proceed to:**
- Engineering spec
- Vendor contracts
- UI wireframes

...until the ADR is approved. Wireframes built before the LLM boundary, approval gate data model, and fallback behavior are locked will be thrown away.

