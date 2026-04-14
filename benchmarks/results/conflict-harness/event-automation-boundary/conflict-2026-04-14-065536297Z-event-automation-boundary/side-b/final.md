# Phase 1 PRD: Event Automation Platform with Human-in-the-Loop Boundaries

## Decision Frame

**Problem:** Event management companies spend 60-70% of coordinator time on repetitive communication (venue availability checks, vendor follow-ups, client Q&A) while pricing decisions require human judgment due to variable margins, relationship context, and contractual risk. Current tools force a binary choice: full automation (risky for pricing) or full manual (wasteful for routine tasks).

**Bet:** A platform that automates deterministic communication workflows via WhatsApp while enforcing hard human-approval gates on pricing commitments will reduce coordinator workload by 40%+ without increasing pricing errors.

**Phase 1 Scope:** WhatsApp assistant for client-facing communication, internal console for operator oversight, and a strict boundary architecture that separates LLM-powered tasks from deterministic+human-approved tasks.

**What this PRD decides:** Whether to greenlight Phase 1 engineering. It does NOT decide pricing strategy, vendor integrations beyond WhatsApp, or multi-tenant architecture.

---

## Product Architecture

### 1. WhatsApp Assistant (Client-Facing)

**Deterministic functions (no LLM):**
- Event date/time confirmation from calendar database
- Venue availability lookups against inventory system
- Standard package descriptions from content catalog
- Booking status updates from order management system
- Document delivery (contracts, invoices, receipts)
- FAQ responses from curated answer bank (keyword-matched, not generated)

**LLM-assisted functions (constrained):**
- Natural language understanding of inbound client messages to classify intent (one of ~15 predefined intents)
- Response drafting for non-pricing inquiries using approved templates + slot-filling
- Summarization of long client threads for operator handoff

**Hard boundary — LLM NEVER does:**
- Generate, suggest, or confirm any pricing figure
- Make availability commitments for dates not confirmed in the inventory system
- Modify contract terms or suggest contractual language
- Respond to complaints without human routing
- Infer client budget or willingness-to-pay

### 2. Human Approval Gates

**Trigger conditions (any one triggers escalation):**
- Client message classified as pricing-related (intent: `pricing_inquiry`, `discount_request`, `package_customization`, `quote_request`)
- Client message contains monetary terms (currency symbols, "cost", "price", "budget", "quote")
- LLM confidence on intent classification < 0.85 threshold
- Client message classified as complaint or escalation
- Conversation exceeds 3 turns without resolution
- Any message from a flagged/VIP client account

**Approval workflow:**
1. Assistant immediately responds: "Let me connect you with [Coordinator Name] who can help with that. They'll respond within [SLA window]."
2. Internal console shows escalation with full conversation context, client history, and suggested response (if non-pricing)
3. Coordinator approves, edits, or writes custom response
4. Response sent via WhatsApp under coordinator's name
5. Conversation returns to automated mode only after coordinator explicitly releases it

**SLA commitments:** Pricing escalations responded to within 15 minutes during business hours, 2 hours outside.

### 3. Internal Console

**Core views:**
- **Queue:** Pending escalations sorted by SLA urgency, with one-click approve/edit/reject
- **Active conversations:** All ongoing WhatsApp threads with automation status indicators (green=automated, yellow=escalated, red=SLA breach)
- **Audit log:** Every message sent, who approved it, what the LLM suggested vs. what was sent, classification confidence scores
- **Override controls:** Pause automation per-client, per-intent-category, or globally (kill switch)

**Reporting:**
- Automation rate (% of messages handled without human intervention)
- Escalation reasons breakdown
- SLA compliance
- LLM classification accuracy (sampled weekly by coordinator review)

### 4. Deterministic Boundary Architecture

**Principle:** The LLM is a classification and drafting tool only. It never executes actions or commits the business to anything.

**Implementation:**
- LLM outputs are always intermediate: intent labels, draft text, confidence scores
- All external-facing messages pass through a deterministic template engine that validates content against business rules before sending
- Pricing data lives in a separate service the LLM has no access to; pricing responses are assembled by deterministic code after human approval
- Message audit trail logs LLM input/output separately from final sent message
- LLM provider can be swapped without changing business logic (abstraction layer between intent classification and action execution)

**Fallback behavior:**
- If LLM service is unavailable: all messages route to human queue, FAQ responses served from static cache
- If classification returns low confidence on all intents: route to human
- If template engine cannot fill all required slots: route to human rather than send incomplete message

---

## Success Metrics (Phase 1, 90-day window)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Automation rate | ≥40% of inbound messages handled without escalation | Console analytics |
| Pricing containment | 0 pricing commitments made without human approval | Audit log review (weekly) |
| Classification accuracy | ≥90% intent classification agreement with human review | Weekly sample of 50 messages |
| Response time (automated) | <30 seconds for deterministic responses | System logs |
| SLA compliance | ≥95% of escalations responded within SLA | Console analytics |
| Coordinator satisfaction | ≥4/5 on "console helps me work faster" | Monthly survey |

---

## Unknowns & Evidence Gaps

1. **Client acceptance of bot interaction.** No data on whether event management clients (often emotionally invested in their events) will accept WhatsApp automation. Risk: clients may feel depersonalized. **Mitigation:** Phase 1 starts with post-booking coordination only (not sales), where relationship is already established. **Evidence needed:** Client NPS comparison (automated vs. manual) after 30 days.

2. **Intent classification accuracy on event-specific language.** General LLMs may misclassify domain-specific phrases (e.g., "What's the damage?" = pricing inquiry, not complaint). **Mitigation:** Fine-tuned classification prompt with event management examples; low-confidence threshold routes to human. **Evidence needed:** Labeled dataset of 500+ real client messages for prompt engineering and accuracy benchmarking before launch.

3. **WhatsApp Business API rate limits and template approval timelines.** Meta's approval process for message templates can take days; rate limits may constrain high-volume periods. **Evidence needed:** API sandbox testing with realistic message volumes; template pre-approval for top 20 response types.

4. **Coordinator adoption of console workflow.** If the approval queue adds friction compared to just replying directly in WhatsApp, coordinators will bypass the system. **Evidence needed:** Time-motion comparison of current workflow vs. console-based workflow with 3 coordinators over 2 weeks.

5. **Regulatory requirements for automated messaging in target markets.** WhatsApp commerce policies, GDPR/data residency for conversation logs, opt-in requirements. **Evidence needed:** Legal review of WhatsApp Business Policy compliance for target markets before launch.

6. **Edge case volume.** Unknown what percentage of messages will be genuinely ambiguous (not clearly automated or clearly escalated). High edge-case volume could negate automation benefits. **Evidence needed:** Manual classification of 2 weeks of historical WhatsApp conversations.

---

## Pass/Fail Readiness

### Pass conditions for full Phase 1 greenlight (all required before client-facing deployment):
- [ ] Labeled dataset of ≥500 historical client messages with intent classifications reviewed by 2+ coordinators (inter-rater agreement ≥80%)
- [ ] WhatsApp Business API sandbox access confirmed; ≥10 message templates pre-approved by Meta
- [ ] Legal sign-off on automated messaging compliance for primary operating market
- [ ] 3 coordinators committed to 2-week pilot with defined rollback procedure
- [ ] Kill switch and fallback-to-human architecture reviewed and approved by engineering lead
- [ ] Pricing data isolation architecture reviewed — confirmed LLM has zero read access to pricing database

### Parallel-eligible engineering (may proceed before full greenlight):
- Deterministic boundary enforcement layer and template validation engine
- Internal console scaffolding (queue, audit log, override controls)
- Fallback-to-human routing and kill switch implementation
- Audit logging infrastructure and message trail separation
- LLM abstraction layer (provider-swappable intent classification interface)

These workstreams have no dependency on the labeled dataset or WhatsApp API access and de-risk the architecture before client-facing integration begins.

### Fail conditions (any one blocks full greenlight):
- [ ] Cannot obtain ≥500 labeled messages (insufficient training data)
- [ ] WhatsApp Business API access denied or template approval takes >30 days
- [ ] Legal identifies blocking compliance issue with no clear remediation
- [ ] Fewer than 2 coordinators willing to pilot
- [ ] Engineering review identifies scenario where LLM output could reach client without template validation

### Current status: **NOT READY for full greenlight** — labeled dataset and API access are prerequisites for client-facing deployment that have not been started. However, boundary architecture and console engineering can begin immediately in parallel with research prerequisites.

---

## Recommended Next Artifact

**Immediate next steps (parallel tracks):**

**Track A — Research:** Customer Research Brief — structured interviews with 5 event coordinators to validate:
1. Which message types consume the most time (validates automation priority)
2. Comfort level with automated client communication (validates client acceptance assumption)
3. Current pricing workflow and where errors occur (validates approval gate design)
4. WhatsApp usage patterns and volume benchmarks (validates technical assumptions)

This research directly addresses Evidence Gaps #1, #4, and #6 and produces the labeled message dataset needed for the full greenlight.

**Track B — Engineering:** Technical Spike document for deterministic boundary architecture proof-of-concept, including template validation engine, pricing data isolation, and audit logging. This work proceeds independently of the labeled dataset and WhatsApp API access.

**Full Phase 1 engineering (client-facing integration) should not begin until both tracks complete and all Pass conditions are met.**
