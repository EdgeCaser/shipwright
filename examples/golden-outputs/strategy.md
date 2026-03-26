# Golden Output: Product Strategy

**Workflow:** `/strategy`
**Skill chain:** Vision → Strategic Context → Bets → Boundaries → Pre-Mortem → Success Criteria
**Product context:** ComplianceOS — B2B SaaS compliance automation (see `examples/CLAUDE.md.b2b-saas`)

---

## Scenario

The PM needs to set product direction for H2 2026. The company just closed its Series A, multi-framework support shipped in Q2, and the board is pushing to move upmarket.

## Input prompt

```
Help me build our product strategy for H2 2026. We just shipped multi-framework
(PCI-DSS alongside SOC 2 and HIPAA), we're Series A, and the board wants us
to start moving upmarket toward 500+ employee companies.
```

---

## Baseline output (without Shipwright)

> The AI gives reasonable strategic thinking but as a narrative essay. Notice the absence of falsifiable claims, kill criteria, or explicit trade-offs.

### ComplianceOS H2 2026 Product Strategy

**Vision:** Become the leading compliance automation platform for mid-market and enterprise companies.

**Key Strategic Themes:**

1. **Enterprise Readiness:** Build features needed to serve larger organizations (500+ employees), including role-based access control, SSO/SAML, audit trails, and multi-team workspaces. This is critical to moving upmarket as the board requires.

2. **Platform Expansion:** Now that we support SOC 2, HIPAA, and PCI-DSS, we should consider adding ISO 27001 and GDPR to capture international markets. This would significantly expand our addressable market.

3. **Evidence Automation:** Continue deepening our integrations with cloud providers and developer tools. Automation is our biggest competitive differentiator and should remain a priority.

4. **Customer Success:** Invest in onboarding and customer success to improve retention. Our NPS of 34 has room for improvement, and better onboarding will support the move upmarket where expectations are higher.

**Priorities:**
- Q3: Enterprise features (RBAC, SSO) + ISO 27001 framework
- Q4: Evidence automation v2 + GDPR + improved onboarding

**Success Metrics:**
- Land 3 enterprise customers (500+ employees) by end of year
- Increase NPS from 34 to 45
- Grow ARR by 2x

**Risks:**
- Moving upmarket too fast could strain our support team
- International frameworks add compliance complexity
- Enterprise sales cycles are longer and less predictable

---

## Shipwright output (with `/strategy`)

> The workflow forces structured phases: vision, strategic context, explicit bets with kill criteria, boundaries, pre-mortem, and measurable success criteria.

## Product Vision

For compliance officers and CTOs at mid-market fintech companies (100-1000 employees), who need to achieve and maintain multiple compliance certifications without dedicated compliance engineering teams, ComplianceOS will make continuous compliance as effortless as continuous integration. Unlike manual consulting firms that provide point-in-time assessments, and unlike competitors who catalog controls without automating evidence, our product closes the loop from control to evidence to audit — automatically and continuously.

## Strategic Context

### Current State
- Product stage: Growth (Series A, 18 months post-launch)
- Key metrics (trailing): 42 frameworks completed/quarter, 47-day average time to first completion, 108% NRR, NPS 34
- Biggest recent win: PCI-DSS launch expanded multi-framework to 3 standards; overlap detection reduces effort by 30% for customers running 2+ frameworks
- Biggest current challenge: pipeline concentrated in 100-300 employee segment; enterprise (500+) deal cycle is 2x longer with 60% lower close rate

### Market Context
- Market trajectory: Growing — compliance requirements expanding (new SEC cyber rules, state privacy laws)
- Key trends: (1) Shift from point-in-time to continuous compliance, (2) cloud-native infrastructure makes API-based evidence collection viable, (3) consolidation among compliance tools (Vanta acquired a SOC 2 consultancy in Q1)
- Competitive pressure: High — Vanta and Drata both raised growth rounds in 2025 and are expanding integration libraries

### Customer Context
- Primary persona: Compliance Officer Carmen — owns audit readiness, manages evidence across 12+ tools
- Core JTBD: "Help me prove to auditors that our controls are working without making it a quarter-long project every time"
- Current satisfaction: NPS 34 (strong among power users, weak among new customers in first 90 days)
- Top unmet needs: (1) Automated evidence collection, (2) faster time-to-value in onboarding, (3) multi-team workflows for larger orgs

## Strategic Bets

### Bet 1: Evidence Auto-Collection (Major)
**Thesis:** We believe that automatically collecting 60%+ of compliance evidence from cloud infrastructure and developer tools will reduce time-to-audit-ready by 40% and become our primary competitive differentiator, because the #1 pain point across our customer base is manual evidence gathering and our win rate drops 23 points against Vanta when prospects use AWS + GitHub.

**What would have to be true:**
- Cloud provider APIs expose sufficient evidence (tested: yes for AWS/GCP/GitHub)
- Evidence-to-control mapping can be automated at >95% accuracy
- Customers will grant read-only infrastructure access (validated with 8/12 CAB members)

**Investment level:** Major — 2 engineers, 10 weeks
**Time horizon:** Q3 2026 (ship by mid-Q3, iterate through end of Q3)
**Success metric:** 60% of controls auto-covered for customers using 2+ integrations
**Kill criteria:** Abandon if evidence mapping accuracy falls below 90% after 4 weeks of iteration, or if fewer than 40% of existing customers connect at least one integration within 60 days of launch.

### Bet 2: Enterprise Foundations (Major)
**Thesis:** We believe that RBAC, SSO/SAML, and multi-team workspaces will unblock enterprise deals, because 4 of our 5 lost enterprise deals in Q1-Q2 cited "doesn't support our org structure" as a disqualifier — and our 3 enterprise design partners have confirmed these as hard requirements.

**What would have to be true:**
- Enterprise prospects are blocked on these specific capabilities (not on trust, brand, or other factors)
- Our current architecture can support team-level permissions without a rewrite
- The 3 design partners will convert to paid after these ship

**Investment level:** Major — 2 engineers, 8 weeks
**Time horizon:** Q3-Q4 2026 (SSO/RBAC in Q3, multi-team in Q4)
**Success metric:** Close 3 enterprise customers (500+ employees) with ACV > $80K by end of Q4
**Kill criteria:** Abandon upmarket push if enterprise pipeline doesn't reach 10 qualified opportunities by end of Q3 (despite SSO/RBAC shipping), or if design partner conversion rate is 0/3.

### Bet 3: Onboarding Acceleration (Moderate)
**Thesis:** We believe that reducing time-to-first-framework-completion from 47 days to 30 days will improve NRR from 108% to 115%, because our churn analysis shows that customers who complete their first framework in under 35 days have 3x higher retention at 12 months, and new customer NPS is 18 points lower than power user NPS.

**What would have to be true:**
- The bottleneck is product experience (not customer readiness or compliance knowledge)
- A guided setup flow can replace the current white-glove onboarding for mid-market
- Faster onboarding doesn't reduce evidence quality or audit pass rates

**Investment level:** Moderate — 1 engineer + 1 designer, 6 weeks
**Time horizon:** Q4 2026
**Success metric:** Median time-to-first-framework-completion drops to 30 days for new customers
**Kill criteria:** Abandon if guided onboarding completion rate is below 50% in beta (indicating the product can't replace human guidance).

## Strategic Boundaries

### We will NOT:
- **Add ISO 27001 or GDPR in H2 2026** — Rationale: international frameworks add localization, legal review, and support complexity. Our current 3 frameworks serve 95% of our customer base. International expansion is a 2027 initiative after we've proven the upmarket motion.
- **Build self-serve onboarding this half** — Rationale: ACV is $45K+ and enterprise customers expect guided setup. Self-serve optimizes for a segment we're not targeting. Onboarding acceleration (Bet 3) improves guided onboarding, not replaces it.
- **Pursue SMB (sub-100 employees)** — Rationale: our pricing and support model doesn't work below 100 employees. This is Vanta's strongest segment and we'd be fighting on their turf.
- **Build an audit marketplace** — Rationale: partnering with existing audit firms is working. Building a marketplace changes our business model and regulatory exposure.

### We will DEFER:
- Azure and GitLab integrations — Revisit: Q1 2027 or when 3+ enterprise customers request them
- Custom report builder — Revisit: Q4 2026 if NRR target is hit (reporting becomes more valuable at scale)
- API/webhook platform for custom evidence — Revisit: 2027 alongside potential developer ecosystem play

## Pre-Mortem: What Could Go Wrong

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Evidence mapping accuracy is too low — auditors reject auto-collected evidence | Medium | Critical | Confidence scoring with manual review required below 85%; pilot with 5 auditor-friendly customers first |
| Enterprise deals take 6+ months, missing Q4 targets | High | High | Use design partner pipeline (already in motion) rather than cold enterprise outreach; set Q3 milestone for pipeline health |
| Onboarding acceleration backfires — customers feel abandoned without white-glove | Medium | Medium | A/B test guided vs. current onboarding; maintain CSM availability as fallback |
| Vanta ships equivalent evidence automation first | Medium | High | Our multi-framework overlap detection is unique; focus marketing on "continuous compliance across frameworks" not just "evidence collection" |
| Engineering capacity: 3 major bets compete for 5-person team | High | High | Sequence explicitly: Bet 1 (Q3) → Bet 2 (Q3-Q4, staggered) → Bet 3 (Q4). No parallel major initiatives. |

## Success Criteria

| Bet | Leading Indicator (4 weeks) | Lagging Indicator (quarter) | Target |
|---|---|---|---|
| Evidence Auto-Collection | Integration connection rate (% of customers who connect 1+ provider) | % of controls with auto-collected evidence | 60% connection rate / 60% control coverage |
| Enterprise Foundations | Enterprise pipeline qualified opportunities | Enterprise customers closed (500+ employees) | 10 qualified opps by end Q3 / 3 closed by end Q4 |
| Onboarding Acceleration | Guided setup completion rate | Median time-to-first-framework-completion | 70% completion / 30 days median |

### Review Cadence
- **Weekly:** Integration connection rate, evidence mapping accuracy, enterprise pipeline movement
- **Monthly:** NRR trend, time-to-first-framework-completion trend, bet-level health check (green/yellow/red)
- **Quarterly:** Full strategy review — keep/adjust/kill each bet based on kill criteria and leading indicators

---

## Why the Shipwright output is better

1. **Falsifiable bets replace vague themes.** Each bet has a testable thesis ("We believe X will cause Y because Z") with explicit kill criteria. The baseline's "themes" ("Enterprise Readiness," "Platform Expansion") can't be proven wrong and will never be abandoned.

2. **Kill criteria force intellectual honesty.** "Abandon upmarket push if enterprise pipeline doesn't reach 10 qualified opportunities by end of Q3" is a pre-committed exit. The baseline says "enterprise sales cycles are longer" as a risk but offers no decision trigger.

3. **Boundaries are decisions, not deferrals.** "We will NOT add ISO 27001 in H2" with a rationale is a strategic choice. The baseline suggests adding ISO 27001 in Q3 without addressing the cost — it reads as a wish list, not a strategy.

4. **Pre-mortem adds rigor.** The pre-mortem identifies 5 specific failure modes with likelihood, impact, and mitigations. The baseline lists 3 one-line risks with no mitigation plans.

5. **Quantified strategic context.** The Shipwright output ties every bet to specific data: "win rate drops 23 points," "4 of 5 lost enterprise deals cited org structure," "customers who complete first framework in <35 days have 3x retention." The baseline uses directional language ("significantly expand," "room for improvement") without numbers.

6. **Explicit sequencing.** The pre-mortem identifies capacity as a risk and the strategy sequences bets: Bet 1 → Bet 2 (staggered) → Bet 3. The baseline puts everything into Q3 and Q4 without addressing the constraint.
