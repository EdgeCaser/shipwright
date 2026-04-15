# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem Statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks — venue availability checks, vendor follow-ups, client Q&A, and quote assembly — that could be partially automated. However, pricing commitments and contract terms carry financial and legal risk that demands human judgment.

**Decision:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant for intake and FAQ, (2) an internal operator console for workflow management, and (3) a human-in-the-loop approval gate for all pricing and commitment outputs?

**Scope Boundary:** Phase 1 covers client intake, FAQ automation, quote draft generation, and operator approval workflows. It explicitly excludes payment processing, contract execution, multi-language support beyond English/Spanish, and direct vendor booking.

**Target User:** Small-to-mid event management companies (5-50 employees) handling 20-200 events/month, currently using WhatsApp manually for client communication.

### System Architecture Boundaries

#### LLM Usage — Deterministic Boundary Spec

The platform enforces a strict separation between **deterministic operations** and **LLM-assisted operations**:

| Layer | Deterministic (No LLM) | LLM-Assisted |
|-------|----------------------|---------------|
| **Data retrieval** | Venue availability, calendar lookups, package catalog queries | — |
| **Client communication** | Template-based confirmations, status updates, receipt delivery | Intent classification, FAQ response generation, intake summarization |
| **Pricing** | Price lookups from catalog, tax/fee calculation, discount rule application | Draft quote narrative (human-approved before send) |
| **Scheduling** | Calendar slot matching, conflict detection | Natural language date parsing (validated against deterministic calendar) |
| **Escalation** | Rule-based routing (keyword triggers, confidence thresholds) | Sentiment detection for urgency flagging |

**Hard rule:** No LLM output that contains a price, date commitment, contractual term, or policy statement may reach a client without explicit human approval in the operator console. The system enforces this at the message-send layer, not at the generation layer — meaning the LLM may draft such content, but it is held in a review queue.

### WhatsApp Assistant

**Capabilities (Phase 1):**
- Respond to inbound client messages on WhatsApp Business API
- Classify intent: new inquiry, existing event question, complaint, pricing request, general FAQ
- For FAQ intents: generate response from approved knowledge base, send directly
- For pricing/commitment intents: generate draft response, route to operator approval queue
- For unclassifiable intents: escalate to human operator with context summary
- Maintain conversation context within a session (max 24hr window per WhatsApp API rules)

**Confidence Threshold:** LLM responses with confidence < 0.7 (calibrated during pilot) are auto-escalated. All escalations include the raw client message, classified intent, and draft response for operator review.

### Internal Operator Console

**Capabilities (Phase 1):**
- Dashboard: pending approvals, active conversations, escalations, daily event pipeline
- Approval queue: review LLM-drafted pricing/commitment messages, edit-and-approve or reject-and-redraft
- Conversation view: full WhatsApp thread with LLM annotations (intent, confidence, entities extracted)
- Override controls: operator can take over any conversation, disable automation per-client, adjust confidence thresholds
- Audit log: every LLM generation, approval decision, edit, and client-sent message is logged with timestamp, operator ID, and original vs. edited content

### Human-in-the-Loop Approval Gates

**Gate 1 — Pricing Commitments:** Any message containing a dollar amount, discount percentage, package price, or payment term requires operator approval. Detection is deterministic (regex + entity extraction), not LLM-based.

**Gate 2 — Date/Venue Commitments:** Any message confirming a specific date, time, or venue booking requires operator approval. Detection uses deterministic calendar cross-reference.

**Gate 3 — Policy/Contractual Statements:** Any message containing cancellation terms, liability language, or refund commitments requires operator approval. Detection uses keyword allowlist maintained by the operator.

**Bypass Prevention:** Approval gates are enforced at the WhatsApp API send layer as the single chokepoint for all client-facing messages during non-admin runtime operation. There is no non-admin code path from LLM output to client-facing message that skips the gate check.

#### Outbound Path Inventory & Threat Model

All client-facing message paths must route through the send-layer gate. The following outbound paths are identified for Phase 1:

| Outbound Path | Gate Mediated | Notes |
|---------------|---------------|-------|
| LLM-generated FAQ response | Yes | Auto-send only if no commitment content detected |
| LLM-drafted pricing/commitment response | Yes | Held in approval queue |
| Operator-composed message via console | Yes | Operator messages still logged and scanned for audit, but approval is implicit (operator is the human in the loop) |
| WhatsApp template messages (confirmations, receipts) | Yes | Templates are pre-approved; deterministic content only |
| Retry/resend of failed messages | Yes | Resends re-enter the gate; no direct retry-to-API path |
| Admin override sends | Logged, not gated | Admin-level access with full audit trail; see admin scope below |

**Admin Scope:** Admin override is a break-glass capability limited to users with admin console roles. All admin sends are logged with reason codes and flagged in the daily audit digest. Admin override frequency is a monitored metric — sustained use above 2% of total sends triggers a process review.

**Phase 1 Gate Verification Strategy:**
- **Integration test suite:** Automated tests for each outbound path confirming gate interception. Tests include negative cases: message payloads containing commitment patterns must be blocked when submitted without approval.
- **Shadow-mode audit:** During the 2-week shadow period, compare all messages that *would have been* auto-sent against gate classification. Any message containing commitment content that was not flagged constitutes a gate failure.
- **Penetration boundary:** The Technical Design Document (next artifact) must include a threat model covering: direct API calls bypassing the application layer, race conditions in approval state, and message content mutation between gate check and send.

## Unknowns & Evidence Gaps

| ID | Unknown | Impact | Mitigation |
|----|---------|--------|------------|
| U-1 | Operator approval latency tolerance — how long will clients wait for a pricing response via WhatsApp before abandoning? | High — if approval SLA > 5 min, automation value proposition collapses for real-time pricing queries | Pilot measurement: track time-to-approval and client drop-off rate. Set initial SLA target at 3 min during business hours. |
| U-2 | LLM confidence threshold calibration — 0.7 is a starting guess. Too low = risky auto-sends; too high = everything escalates and operators drown. | High — directly affects automation rate and operator workload | Run shadow mode for 2 weeks: LLM generates responses for all messages but none are auto-sent. Measure accuracy at various thresholds against operator decisions. |
| U-3 | WhatsApp Business API rate limits and template approval timelines for the target market | Medium — could constrain response patterns and require pre-approved templates for common scenarios | Pre-register 20 template categories during onboarding. Monitor rejection rates. |
| U-4 | Client comfort with AI-assisted responses on WhatsApp — will they expect (or reject) bot-like interaction? | Medium — affects adoption and client satisfaction | A/B test: disclose AI assistance vs. transparent human-branded responses. Measure satisfaction scores. |
| U-5 | Event management domain coverage — how many FAQ intents can we realistically automate in Phase 1 without a large knowledge base? | Medium — affects the ratio of automated vs. escalated conversations | Catalog top-50 FAQ from 3 pilot customers before build. Target 80% coverage of inbound volume by intent. |
| U-6 | No primary user research conducted yet — operator workflow assumptions are based on domain knowledge, not validated observation | High — console design and approval flow may not match actual operator behavior | Conduct 5 contextual inquiry sessions with target operators before finalizing console wireframes. |
| U-7 | Gate recall for deterministic commitment detection — regex and keyword approaches may miss novel phrasing of pricing or policy commitments, creating false negatives | Medium — a missed gate means ungated commitment content reaches clients | Shadow-mode false-negative analysis: have operators flag any auto-sent message that should have been gated. Maintain and version the detection rule set iteratively. |

## Pass/Fail Readiness

### Phase 1 Launch Criteria

| # | Criterion | Metric | Threshold | Status |
|---|-----------|--------|-----------|--------|
| 1 | No pricing/commitment message reaches client without approval during non-admin runtime | Gate bypass rate (non-admin paths) | 0% | Not yet testable |
| 2 | FAQ auto-response accuracy | Operator agreement rate (shadow mode) | ≥ 90% | Not yet measured |
| 3 | Approval queue latency | P95 time-to-approval during business hours | ≤ 5 min | Not yet measured |
| 4 | Escalation rate is manageable | % of messages escalated to human | ≤ 30% of total volume | Not yet measured |
| 5 | Audit completeness | % of client-sent messages with full audit trail (including admin overrides) | 100% | Not yet testable |
| 6 | WhatsApp API compliance | Template approval rate | ≥ 95% | Not yet tested |
| 7 | Operator adoption | Operators using console daily after week 2 | ≥ 80% of assigned operators | Not yet measured |
| 8 | Gate integration test coverage | All identified outbound paths have gate-interception tests | 100% path coverage | Not yet testable |

**Go/No-Go Decision:** All 8 criteria must be met during a 2-week pilot with 3 customers before general availability. Criteria 1, 5, and 8 are non-negotiable (safety); criteria 2-4, 6-7 have a one-iteration grace period if within 10% of threshold.

### Risks Accepted in Phase 1

- **Single-language limitation** may exclude segments of the target market
- **No offline/async approval flow** — operators must be online during business hours
- **LLM provider dependency** — no fallback model in Phase 1 (mitigated by deterministic fallback responses for high-confidence intents)
- **Admin override exists as ungated path** — mitigated by audit logging, reason codes, and usage monitoring with 2% threshold trigger

## Recommended Next Artifact

**Technical Design Document** covering:
1. WhatsApp Business API integration architecture and message routing
2. LLM service abstraction layer (provider-agnostic interface for future model swaps)
3. Approval gate enforcement implementation — specifically the send-layer interception pattern and threat model (direct API bypass, race conditions, content mutation between gate check and send)
4. Outbound path inventory verification: integration test specifications for each identified path
5. Audit log schema and retention policy
6. Confidence threshold calibration methodology

**Followed by:** Operator console wireframes informed by contextual inquiry sessions (addresses U-6), then a shadow-mode pilot plan addressing U-1, U-2, U-5, and U-7.
