# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem statement:** Event management companies spend 60-80% of operator time on repetitive inquiry handling, quote generation, and scheduling coordination. This labor is expensive, error-prone, and creates response-time bottlenecks that lose bookings.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-approval gateway for pricing commitments — with strict deterministic boundaries constraining where LLM inference is permitted?

**Stakeholders:** Event operations managers (primary user), end clients (WhatsApp channel), finance/pricing team (approval authority), engineering (build team).

**Scope boundary:** Phase 1 covers inquiry intake, FAQ handling, quote draft generation, calendar availability checks, and human-approved quote delivery. Phase 1 does NOT cover payment processing, vendor coordination, post-event follow-up, or multi-language support.

**Success criteria for Phase 1:**
- Reduce median first-response time from >2 hours to <5 minutes for standard inquiries
- Route 70%+ of inbound WhatsApp inquiries to automated FAQ or quote-draft flows without operator intervention
- Zero pricing commitments issued without explicit human approval
- Operator NPS ≥ 40 on internal console usability

---

## Product Components

### 1. WhatsApp Client Assistant

**What it does:** Receives inbound client messages via WhatsApp Business API, classifies intent, handles FAQ responses, collects event requirements, and generates draft quotes for human review.

**LLM boundary rules (strict):**
- LLM MAY: classify message intent, extract structured event details (date, guest count, venue preference, event type), generate natural-language FAQ responses from an approved knowledge base, draft conversational replies for operator review.
- LLM MAY NOT: state prices, confirm availability, make commitments about services, agree to terms, or send any message containing financial figures without human approval flag.
- All LLM outputs that will be sent to clients pass through a deterministic validation layer that scans for price patterns, commitment language, and availability confirmations. Any match triggers routing to human queue.

**Deterministic components:**
- Intent classifier output mapped to finite action set (FAQ, quote-request, scheduling-inquiry, escalation, out-of-scope)
- Calendar availability checked via direct API integration (no LLM interpretation of availability)
- Price lookup from structured pricing table with rule-based modifiers (weekend surcharge, peak-season multiplier, guest-count tiers) — never LLM-generated
- Template-based quote documents populated from structured data

### 2. Internal Operator Console

**What it does:** Web-based dashboard for operators to monitor conversations, review AI-drafted responses before send, approve/modify quotes, and manage the approval queue.

**Key features:**
- Real-time conversation feed with AI classification labels and confidence scores
- Draft review panel: see AI-proposed response alongside extracted event details and pricing lookup results
- One-click approve, edit-and-approve, or reject-and-respond-manually
- Approval queue sorted by urgency (time-since-inquiry, client tier, event date proximity)
- Audit log of all approvals with operator ID, timestamp, and any modifications made

**No LLM in the console itself.** All console logic is deterministic: filtering, sorting, rendering structured data. The AI drafts visible in the console were generated in the WhatsApp processing pipeline.

### 3. Human Approval Gateway

**What it does:** Enforces the constraint that no pricing commitment reaches a client without explicit human sign-off.

**Rules (non-negotiable, enforced in code):**
- Every message classified as containing a price, availability confirmation, or service commitment enters the approval queue
- Messages in the approval queue are BLOCKED from delivery until an authorized operator approves
- Approval requires authentication (operator login session) — no auto-approval, no timeout-based auto-send
- If no operator approves within SLA threshold (configurable, default 30 min), escalation notification fires to team lead
- Gateway is implemented as a middleware layer — the WhatsApp send function physically cannot bypass it for flagged message types

---

## Architecture: LLM vs. Deterministic Boundary Map

| Function | LLM | Deterministic | Rationale |
|---|---|---|---|
| Message intent classification | ✓ | | Natural language variance too high for rules |
| Event detail extraction | ✓ | | Unstructured text → structured fields |
| FAQ response generation | ✓ | | Conversational tone from approved knowledge base |
| Price calculation | | ✓ | Financial accuracy; auditable; no hallucination risk |
| Calendar availability | | ✓ | Direct API lookup; binary yes/no |
| Quote document assembly | | ✓ | Template population from structured data |
| Commitment detection (guardrail) | | ✓ | Regex + keyword scanning; deterministic safety net |
| Conversation routing | | ✓ | Rule-based on intent classification output |
| Approval enforcement | | ✓ | Middleware gate; no AI discretion |
| Escalation triggers | | ✓ | Timer-based; configurable thresholds |

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact if wrong | Mitigation |
|---|---|---|---|
| U1 | Intent classification accuracy at launch — no labeled training data from actual client conversations yet | Misrouted inquiries → frustrated clients or missed quotes | Collect 500+ real conversations in shadow mode before go-live; human-in-loop for first 4 weeks with operator override tracking |
| U2 | Operator adoption of console — may prefer existing workflow (email/WhatsApp direct) | Platform becomes shelfware; no efficiency gain | Co-design console with 3 target operators; measure time-to-approve vs. current workflow in pilot |
| U3 | WhatsApp Business API rate limits and template approval timelines | Delayed go-live; restricted messaging patterns | Apply for API access immediately; design message flows within template constraints; identify fallback channel (SMS) |
| U4 | Client willingness to interact with AI-assisted WhatsApp (vs. expectation of human) | Negative client experience; brand risk | First 2 weeks: AI drafts only, human sends all; measure client satisfaction before increasing automation |
| U5 | Commitment-detection guardrail false positive rate — overly aggressive filtering could queue too many messages | Operator overload; negates automation benefit | Tune detection rules on historical conversation corpus; target <15% false positive rate |
| U6 | Pricing table completeness — real-world quotes may require custom components not in structured table | Operators must manually build quotes anyway for complex events | Categorize last 100 quotes by complexity; if >30% require custom pricing, add "custom quote" escalation path |

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] WhatsApp Business API approved and message templates accepted
- [ ] Intent classifier achieves ≥85% accuracy on held-out test set of real conversations
- [ ] Commitment-detection guardrail: 0% false negatives (no price/commitment leaks) in 1000-message stress test
- [ ] Commitment-detection guardrail: <15% false positive rate on same test set
- [ ] Approval gateway: penetration test confirms no bypass path exists
- [ ] Console load test: <2s page load with 50 concurrent operators
- [ ] 2-week shadow mode completed with operator feedback incorporated
- [ ] Data processing agreement covers client message storage and LLM API usage
- [ ] Pricing table validated against last 6 months of actual quotes

### Fail criteria (any triggers re-evaluation):
- Intent classifier accuracy <75% after tuning on real data → re-evaluate NLU approach
- Operator time-to-approve exceeds current workflow time → console UX redesign required
- WhatsApp API approval denied or restricted to fewer than needed templates → pivot to alternative channel
- >40% of real quotes require custom pricing not in structured table → expand pricing engine scope before launch

---

## Recommended Next Artifact

**Technical Design Document** covering:
1. WhatsApp Business API integration architecture (webhook handling, message queue, template management)
2. LLM service design: model selection, prompt templates, output validation pipeline, fallback behavior on LLM failure
3. Commitment-detection guardrail specification: exact pattern set, testing methodology, update process
4. Approval gateway middleware: authentication flow, queue data model, escalation state machine
5. Console frontend: wireframes, API contract with backend, real-time update mechanism
6. Observability: logging strategy for LLM inputs/outputs, approval audit trail, conversation analytics pipeline

**Why this next:** The PRD establishes what and why. The technical design document resolves how — particularly the LLM boundary enforcement, which is architecturally load-bearing and must be designed before implementation begins. Getting the guardrail architecture wrong would undermine the core safety property of the platform.
