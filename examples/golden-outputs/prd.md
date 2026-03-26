# Golden Output: PRD

**Workflow:** `/write-prd`
**Skill chain:** Press Release → FAQ → User Stories → Full PRD
**Product context:** ComplianceOS — B2B SaaS compliance automation (see `examples/CLAUDE.md.b2b-saas`)

---

## Scenario

The PM needs to spec out a new "Evidence Auto-Collection" feature that integrates with AWS, GCP, and GitHub to pull compliance evidence automatically. This is strategic priority #2 for the quarter.

## Input prompt

```
Write a PRD for the evidence auto-collection feature. We need to integrate with AWS, GCP,
and GitHub to automatically pull compliance evidence instead of requiring manual uploads.
This is our #2 priority this quarter.
```

---

## Baseline output (without Shipwright)

> A typical AI response to this prompt. Not bad — but notice what's missing.

### Product Requirements Document: Evidence Auto-Collection

**Overview:** The Evidence Auto-Collection feature will allow ComplianceOS users to automatically collect compliance evidence from cloud providers and code repositories, eliminating manual uploads.

**Problem:** Compliance officers currently spend significant time manually collecting and uploading evidence from various tools. This is tedious and error-prone.

**Solution:** Build integrations with AWS, GCP, and GitHub that automatically pull relevant compliance evidence on a scheduled basis.

**Requirements:**
- AWS integration (CloudTrail, IAM, S3 bucket policies, Config)
- GCP integration (Cloud Audit Logs, IAM, Security Command Center)
- GitHub integration (branch protection, code review policies, access controls)
- Scheduled evidence collection (daily, weekly, or custom)
- Evidence mapping to compliance controls
- Dashboard showing collection status
- Manual override for re-collection

**Success Metrics:**
- Reduce evidence collection time by 70%
- 90% of evidence collected automatically
- Customer satisfaction improvement

**Timeline:** 8-10 weeks for MVP with AWS, then GCP and GitHub in subsequent releases.

**Risks:**
- API rate limits
- Data sensitivity
- Integration maintenance burden

---

## Shipwright output (with `/write-prd`)

> The workflow forces 3 phases: press release first (customer value), then FAQ (hard questions), then full requirements. Each phase feeds the next.

### Phase 1: Internal Press Release

# ComplianceOS Eliminates Manual Evidence Collection for Cloud-First Companies

## Headline
ComplianceOS customers now pass audits without manually gathering a single piece of evidence from their cloud infrastructure.

## Subheading
For compliance officers at mid-market fintech companies, Evidence Auto-Collection continuously pulls and maps compliance evidence from AWS, GCP, and GitHub — reducing audit prep from weeks to hours.

## Summary
ComplianceOS today launched Evidence Auto-Collection, a new capability that connects directly to customers' cloud infrastructure and developer tools to automatically gather, validate, and map compliance evidence to SOC 2, HIPAA, and PCI-DSS controls. Compliance officers who previously spent 3-4 weeks manually collecting screenshots, logs, and configurations from 12+ tools can now maintain continuous evidence coverage with zero manual uploads for supported integrations.

## Problem Statement
Carmen is a compliance officer at a 200-person fintech company. Every quarter, she spends 3 weeks asking engineering teams to export CloudTrail logs, screenshot IAM configurations, and document GitHub branch protection rules. Engineers resent the interruption. Evidence arrives in inconsistent formats. And Carmen still isn't sure she has everything until the auditor asks for something she missed. The process is manual, adversarial, and unreliable.

## Solution
Evidence Auto-Collection connects to customers' existing AWS accounts, GCP projects, and GitHub organizations using read-only credentials. It continuously monitors and collects evidence relevant to active compliance frameworks, maps each piece of evidence to the specific control it satisfies, and flags gaps where evidence is missing or stale. Carmen opens ComplianceOS and sees a live evidence dashboard — green where auto-collected, yellow where evidence is aging, red where manual intervention is still needed.

## How It Works
- **Connect once:** Add read-only credentials for AWS, GCP, and/or GitHub through a guided setup wizard. No agents to install, no infrastructure changes.
- **Automatic mapping:** ComplianceOS maps collected artifacts (CloudTrail logs, IAM policies, branch protection rules, PR review settings) to the specific controls in your active frameworks.
- **Continuous monitoring:** Evidence is refreshed on a configurable schedule (daily default). If a configuration changes and breaks compliance, Carmen gets an alert.
- **Gap detection:** The dashboard shows which controls have fresh evidence, which are stale, and which still require manual uploads.
- **Auditor-ready export:** When audit time comes, export a complete, time-stamped evidence package organized by control.

## Customer Quote
"I used to spend the first three weeks of every quarter chasing engineers for screenshots. Now I open ComplianceOS and 80% of my evidence is already there, mapped to the right controls, and timestamped. Last audit, the auditor said it was the most organized evidence package they'd ever seen."

## Call to Action
Existing ComplianceOS customers can enable Evidence Auto-Collection from Settings → Integrations. New customers can see it in action during a demo at complianceos.com/demo.

---

### Phase 2: FAQ

## Customer FAQ

**Q: What cloud providers do you support?**
A: At launch, AWS, GCP, and GitHub. Azure and GitLab are on the roadmap for H2 2026. We prioritized based on customer infrastructure surveys — 89% of our customers use at least one of the launch providers.

**Q: What permissions does this require?**
A: Read-only access. We never write to or modify your infrastructure. Specific permissions are documented per provider: AWS uses a cross-account IAM role with SecurityAudit policy; GCP uses a service account with Viewer role; GitHub uses a GitHub App with read-only repository and organization permissions.

**Q: Will this work with our existing compliance frameworks?**
A: Yes. Evidence Auto-Collection maps to controls across SOC 2, HIPAA, and PCI-DSS. Multi-framework overlap detection means a single piece of evidence (e.g., CloudTrail logging configuration) can satisfy controls across multiple frameworks simultaneously.

**Q: What happens when you can't collect evidence automatically?**
A: The dashboard clearly marks which controls still need manual evidence. Auto-collection doesn't replace all manual evidence — it handles infrastructure and developer tool evidence. Process-based evidence (e.g., training records, policy acknowledgments) still requires manual upload.

## Internal FAQ

**Q: Why now? What's the urgency?**
A: 60% of pipeline deals in Q2 cited "too much manual work" as a concern during evaluation. Win/loss analysis shows we lose to Vanta specifically on integration depth. Evidence auto-collection directly addresses the #1 churn risk factor identified in Q1 customer health reviews.

**Q: What are we NOT building?**
A: We are not building real-time remediation (auto-fixing non-compliant configurations). We are not building Azure or GitLab integrations in this phase. We are not building custom evidence collection scripts — we support the standard APIs only.

**Q: How will we measure success?**
A: Primary metric: % of controls with auto-collected evidence (target: 60% for customers using 2+ integrations). Secondary: time to audit-ready (target: reduce from 47 days to 30 days). Guardrail: no increase in false-positive evidence mapping rates.

**Q: What are the biggest risks?**
A: (1) API rate limiting from cloud providers during initial backfill — mitigation: progressive collection with configurable throttling. (2) Evidence mapping accuracy — incorrect mapping is worse than no mapping — mitigation: confidence scoring with manual review required below 85% confidence. (3) Credential rotation — customers may revoke or rotate credentials without updating ComplianceOS — mitigation: daily health check with alerts on failed collection attempts.

**Q: What's the estimated effort?**
A: L-sized initiative. ~10 weeks with 2 engineers. Breakdown: AWS integration (3 weeks), GCP integration (2 weeks), GitHub integration (2 weeks), evidence mapping engine (2 weeks), dashboard and gap detection (1 week). This assumes we reuse the existing control mapping taxonomy.

---

### Phase 3: Detailed Requirements

# Product Requirements Document: Evidence Auto-Collection

## Metadata
- Author: PM (ComplianceOS)
- Status: Draft
- Stakeholders: Engineering, Compliance team, Customer Success, Sales

## 1. Context & Motivation
**Customer evidence:** Q1 customer health reviews identified manual evidence collection as the #1 churn risk factor. 8/12 CAB members independently raised this as their top pain point. Support tickets related to "evidence upload" increased 34% QoQ.

**Business case:** 60% of Q2 pipeline deals cite integration depth as an evaluation criterion. Win rate against Vanta drops from 45% to 22% when the prospect uses AWS + GitHub (where Vanta has deeper integrations). Improving evidence automation directly addresses our weakest competitive dimension.

**Opportunity cost:** This displaces the "Custom Report Builder" initiative from the Q3 roadmap. Report Builder had a RICE score of 34; Evidence Auto-Collection scored 67 with reach defined as affected customer accounts.

## 2. Goals & Success Metrics

| Goal | Metric | Current | Target | Timeframe |
|---|---|---|---|---|
| Automate evidence collection | % of controls with auto-collected evidence (for customers using 2+ integrations) | 0% | 60% | 8 weeks post-launch |
| Reduce audit prep time | Time to first framework completion | 47 days | 30 days | Q3 2026 |
| Improve retention | Net revenue retention | 108% | 112% | Q4 2026 |

**Guardrail metrics (must NOT get worse):**
- Evidence mapping accuracy must stay above 95% (measured by auditor rejection rate)
- Integration setup completion rate must stay above 80%

## 3. User Stories

### Persona: Compliance Officer Carmen
- As Carmen, I want to connect my AWS account to ComplianceOS so that evidence is collected automatically without bothering the engineering team.
  - Acceptance criteria:
    - [ ] Guided setup flow for AWS cross-account role creation
    - [ ] Read-only permissions only — no write access
    - [ ] Setup completes in under 15 minutes with no engineering assistance
    - [ ] Success confirmation shows which controls are now auto-covered
  - Edge cases:
    - Multiple AWS accounts: allow adding multiple accounts, evidence merged into single view
    - Restricted AWS organizations: provide CloudFormation template as alternative to console setup

- As Carmen, I want to see which controls have fresh evidence and which have gaps so that I know exactly where I need to focus manual effort.
  - Acceptance criteria:
    - [ ] Dashboard shows per-control evidence status: auto-collected (green), stale (yellow), manual needed (red)
    - [ ] Staleness threshold is configurable (default: 30 days)
    - [ ] Gap report exportable as CSV for team delegation
  - Edge cases:
    - Control mapped to multiple evidence sources: show green if ANY source is fresh, yellow only if ALL are stale

### Persona: CTO Dev
- As Dev, I want evidence collection to happen without any ongoing engineering effort so that my team stays focused on the product roadmap.
  - Acceptance criteria:
    - [ ] Zero engineering involvement after initial credential setup
    - [ ] No agents, sidecars, or infrastructure to maintain
    - [ ] Credential rotation alerts go to Carmen, not engineering
  - Edge cases:
    - API rate limiting: automatic backoff with no manual intervention required

## 4. Scope

### In Scope
- AWS integration: CloudTrail, IAM policies, S3 bucket policies, Config rules, GuardDuty status
- GCP integration: Cloud Audit Logs, IAM bindings, Security Command Center findings, VPC firewall rules
- GitHub integration: branch protection rules, required review settings, CODEOWNERS presence, org-level 2FA enforcement
- Evidence-to-control mapping engine with confidence scoring
- Dashboard with auto/manual/gap status per control
- Configurable collection schedule (daily default)
- Auditor-ready evidence export

### Out of Scope
- Azure and GitLab integrations — Rationale: coverage for 89% of customer base with AWS/GCP/GitHub; Azure/GitLab planned for H2 2026
- Real-time remediation — Rationale: auto-fixing compliance issues is a different product surface; detect first, remediate later
- Custom evidence scripts — Rationale: maintenance burden too high; standard APIs only
- SOC 1 or ISO 27001 control mapping — Rationale: frameworks not yet supported in ComplianceOS

### Future Considerations
- Azure integration (H2 2026)
- GitLab integration (H2 2026)
- Automated remediation suggestions (2027)
- Custom evidence collection via webhooks

## 5. Technical Considerations
- API approach: use provider SDKs (boto3, google-cloud-python, PyGithub) with read-only credentials
- Evidence storage: store raw evidence artifacts in S3 with encryption at rest; metadata in Postgres
- Collection architecture: async job queue (existing Celery infrastructure) with per-provider workers
- Rate limiting: exponential backoff with provider-specific rate limit awareness
- Security: credentials stored in AWS Secrets Manager; accessed only by collection workers; audit log for all evidence access

## 6. Dependencies

| Dependency | Team/System | Status | Risk |
|---|---|---|---|
| Control taxonomy finalization | Compliance Content | Complete | Low |
| Multi-framework mapping (for PCI-DSS) | Compliance Content | In Progress | Medium — needed for PCI evidence mapping |
| Secrets Manager access | Platform/Infra | Available | Low |

## 7. Rollout Plan
- [ ] Week 1-3: AWS integration + mapping engine (internal dogfood with team AWS account)
- [ ] Week 4-5: GCP integration (dogfood with team GCP project)
- [ ] Week 6-7: GitHub integration + dashboard (dogfood with ComplianceOS org)
- [ ] Week 8: Beta with 5 design partner customers (selected from CAB)
- [ ] Week 9: Address beta feedback, fix mapping accuracy issues
- [ ] Week 10: GA for all customers

## 8. Open Questions

| Question | Owner | Due Date | Resolution |
|---|---|---|---|
| Can we guarantee evidence freshness SLA to enterprise customers? | PM + Eng Lead | Week 2 | TBD |
| Should evidence mapping confidence threshold be customer-configurable? | PM | Week 3 | TBD |
| How do we handle evidence for controls that span multiple providers? | Eng Lead | Week 2 | TBD |

---

## Why the Shipwright output is better

1. **Customer-first structure.** The Working Backwards method forced the PRD to start with Carmen's actual pain ("3 weeks chasing engineers for screenshots") rather than jumping to technical requirements. The baseline went straight to a solution description and feature list.

2. **Hard questions surfaced early.** The FAQ phase forced explicit answers to "What are we NOT building?" and "What are the biggest risks?" before writing a single requirement. The baseline mentioned risks as a 3-item afterthought.

3. **Evidence-grounded decisions.** The Shipwright output cites specific data: "60% of pipeline deals," "win rate drops from 45% to 22%," "8/12 CAB members." The baseline says "significant time" and "tedious and error-prone" without quantification.

4. **Explicit scope boundaries with rationale.** Each out-of-scope item has a "Rationale" explaining *why* it's excluded and *when* it might be revisited. The baseline's scope is implicit — it lists what to build but not what to skip.

5. **Testable acceptance criteria.** User stories have checkbox acceptance criteria and edge cases. The baseline lists requirements as bullet points with no definition of "done."

6. **Guardrail metrics.** The Shipwright output defines what must NOT get worse (evidence mapping accuracy, setup completion rate) alongside what should improve. The baseline's success metrics are vague ("customer satisfaction improvement") and have no guardrails.
