import assert from 'node:assert/strict';
import test from 'node:test';

import { routeRequest } from '../scripts/route-request.mjs';

test('routeRequest returns HIGH confidence for explicit workflow asks', { concurrency: false }, () => {
  const result = routeRequest('Write a PRD for self-serve SSO');
  assert.deepEqual(result.topRoute, { route: 'write-prd', kind: 'workflow' });
  assert.equal(result.routeConfidence, 'HIGH');
  assert.equal(result.autoEscalate, false);
});

test('routeRequest auto-escalates research-heavy asks', { concurrency: false }, () => {
  const result = routeRequest('Do competitive pricing research for payroll SaaS');
  assert.equal(result.autoEscalate, true);
  assert.ok(result.escalateReasons.includes('external-research-required'));
});

test('product subjects do not become external readers', () => {
  for (const prompt of ['Write a PRD for customer onboarding', 'Write a PRD for the customer onboarding flow']) {
    const result = routeRequest(prompt);
    assert.deepEqual(result.topRoute, { route: 'write-prd', kind: 'workflow' });
    assert.equal(result.routeConfidence, 'HIGH');
    assert.equal(result.autoEscalate, false);
    assert.ok(!result.blockers.includes('audience-outside-product'));
  }
  const sprint = routeRequest('Sprint plan for the engineering team');
  assert.ok(!sprint.blockers.includes('audience-outside-product'));
  assert.equal(sprint.autoEscalate, false);
});

test('supplied prices and packaging route to pricing without external research', () => {
  for (const prompt of ['Here are our prices; recommend packaging', 'Pricing page copy from the numbers I pasted']) {
    const result = routeRequest(prompt);
    assert.deepEqual(result.topRoute, { route: 'pricing', kind: 'workflow' });
    assert.ok(!result.blockers.includes('external-research-required'));
    assert.equal(result.autoEscalate, false);
  }
});

test('explicit fresh competitor lookup still requires external research with supplied data', () => {
  for (const prompt of [
    'Here are our prices; look up current competitor prices and recommend packaging',
    'Look up competitor prices for our packaging decision',
  ]) {
    const result = routeRequest(prompt);
    assert.ok(result.blockers.includes('external-research-required'));
    assert.ok(result.escalateReasons.includes('external-research-required'));
  }
});

test('explicit customer and engineering readers escalate communication artifacts', () => {
  for (const prompt of [
    'Draft a status update to customers about the delay',
    'Prepare a presentation for engineering leadership',
  ]) {
    const result = routeRequest(prompt);
    assert.ok(result.blockers.includes('audience-outside-product'));
    assert.ok(result.escalateReasons.includes('stakeholder-audience-outside-product'));
  }
});

test('routeRequest lowers confidence when no deterministic winner exists', { concurrency: false }, () => {
  const result = routeRequest('Help me with something for next quarter');
  assert.equal(result.routeConfidence, 'LOW');
  assert.equal(result.topRoute, null);
});

test('routeRequest auto-escalates engineering handoff artifacts', { concurrency: false }, () => {
  const result = routeRequest('Create a tech handoff for the new onboarding flow');
  assert.deepEqual(result.topRoute, { route: 'tech-handoff', kind: 'workflow' });
  assert.equal(result.autoEscalate, true);
  assert.ok(result.escalateReasons.includes('engineering-handoff-artifact'));
});

test('routeRequest adds audience-outside-product blocker for executive-facing asks', { concurrency: false }, () => {
  const result = routeRequest('Write a PRD for board review');
  assert.deepEqual(result.topRoute, { route: 'write-prd', kind: 'workflow' });
  assert.ok(result.blockers.includes('audience-outside-product'));
  assert.ok(result.escalateReasons.includes('stakeholder-audience-outside-product'));
});

test('routeRequest adds multi-step dependency blocker for launch plans', { concurrency: false }, () => {
  const result = routeRequest('Create a launch plan for the API expansion');
  assert.deepEqual(result.topRoute, { route: 'plan-launch', kind: 'workflow' });
  assert.ok(result.blockers.includes('multi-step-dependency'));
  assert.equal(result.routeConfidence, 'MEDIUM');
});

test('routeRequest auto-escalates budget and roadmap decisions', { concurrency: false }, () => {
  const result = routeRequest('Write a product strategy memo for roadmap approval and budget planning');
  assert.deepEqual(result.topRoute, { route: 'strategy', kind: 'workflow' });
  assert.ok(result.escalateReasons.includes('budget-or-roadmap-decision'));
  assert.equal(result.autoEscalate, true);
});

test('routeRequest auto-escalates when contradiction warning count crosses threshold', { concurrency: false }, () => {
  const result = routeRequest('Write a PRD for self-serve SSO', {
    contradictionWarningCount: 2,
  });
  assert.deepEqual(result.topRoute, { route: 'write-prd', kind: 'workflow' });
  assert.ok(result.escalateReasons.includes('validator-contradictions'));
  assert.equal(result.autoEscalate, true);
});

test('common price-change and build-or-buy questions route to decision analysis', () => {
  for (const [question, decisionClass] of [
    ['Should we raise the price of the Pro plan?', 'pricing'],
    ['Should we increase our prices next quarter?', 'pricing'],
    ['Should we cut prices for SMB?', 'pricing'],
    ['Should we build or buy a billing system?', 'product_strategy'],
  ]) {
    const result = routeRequest(question);
    assert.equal(result.topRoute?.route, 'decision-analysis', question);
    assert.equal(result.decisionClass, decisionClass, question);
  }
  assert.notEqual(routeRequest('Recommend packaging for our current prices').topRoute?.route, 'decision-analysis');
});

test('pricing page, copy and announcement questions are not price decisions', () => {
  for (const question of ['Should we change the pricing page headline?',
    'Should we announce the price change by email or in-app?', 'Should we reduce pricing page load time?',
    'Should we announce the price increase by email?']) {
    assert.notEqual(routeRequest(question).topRoute?.route, 'decision-analysis', question);
  }
  assert.equal(routeRequest('Should we approve the price increase?').decisionClass, 'pricing');
});

test('price decisions may name the plan or price before the noun', () => {
  for (const question of ['Should we raise the Pro plan price?', 'Should we raise Pro prices?',
    'Should we increase our subscription price?', 'Should we raise the monthly price to $12?',
    'Should we lower the entry price?']) {
    assert.equal(routeRequest(question).decisionClass, 'pricing', question);
  }
  for (const question of ['Should we change who owns pricing?', 'Should we reduce time spent on pricing?']) {
    assert.notEqual(routeRequest(question).topRoute?.route, 'decision-analysis', question);
  }
});

test('moving customers between named pricing models is a price decision', () => {
  for (const question of [
    'Should we move our analytics add-on from per-seat to usage-based pricing? We have 1,200 paying accounts and churn rose last quarter',
    'Should we switch from per-seat to usage-based pricing?', 'Should we migrate existing customers to usage-based billing?',
    'Should we go from flat-rate to tiered pricing?', 'Should we transition the Pro plan to per-user pricing?',
    'Should we change from seat-based to consumption-based pricing?', 'Should we shift enterprise accounts to metered billing?']) {
    const result = routeRequest(question);
    assert.equal(result.decisionClass, 'pricing', question);
    assert.equal(result.topRoute?.route, 'decision-analysis', question);
  }
  for (const question of ['Should we move the CTA to the pricing page?', 'Should we migrate our data to tiered storage?',
    'Should we switch from Stripe to Chargebee?', 'Should we move the team to a hybrid work schedule?',
    'Should we move to a hybrid model?', 'Should we move from per-seat to usage-based dashboards?',
    'Write a PRD for usage-based billing']) {
    assert.equal(routeRequest(question).decisionClass, null, question);
  }
});

// [question, decision route expected, expected decisionClass]
const DECISION_CORPUS = [
  ['Should we acquire our largest competitor?', true, 'governance'],
  ['Should we merge with Acme?', true, 'governance'],
  ['Should we restructure the board?', true, 'governance'],
  ['Should we divest the hardware line?', true, 'governance'],
  ['Should we spin off the data team?', true, 'governance'],
  ['Should I reorganize the product org?', true, 'governance'],
  ['Should we go public next year?', true, 'publication'],
  ['Should we file for an IPO?', true, 'publication'],
  ['Should we issue a press release about the breach?', true, 'publication'],
  ['Should the company make a public announcement about layoffs?', true, 'publication'],
  ['Should we kill the legacy mobile app?', true, 'product_strategy'],
  ['Should we sunset the v1 API?', true, 'product_strategy'],
  ['Should we shut down the EU office?', true, 'product_strategy'],
  ['Should we pivot to enterprise?', true, 'product_strategy'],
  ['Should we bet the company on AI agents?', true, 'product_strategy'],
  ['Should we build or buy a billing system?', true, 'product_strategy'],
  ['Should we build vs buy our search?', true, 'product_strategy'],
  ['Should we build versus buy analytics?', true, 'product_strategy'],
  ['Should we buy vs build the CRM?', true, 'product_strategy'],
  ['Should I buy or build a data pipeline?', true, 'product_strategy'],
  ['Should we do a build-vs-buy review?', true, 'product_strategy'],
  ['Should we raise prices?', true, 'pricing'],
  ['Should we raise the price of the Pro plan?', true, 'pricing'],
  ['Should we lower our price for students?', true, 'pricing'],
  ['Should I cut pricing for startups?', true, 'pricing'],
  ['Should we reprice the Team tier?', true, 'pricing'],
  ['Should we approve the price increase?', true, 'pricing'],
  ['Should we increase our subscription price?', true, 'pricing'],
  ['Should we reduce prices in Europe?', true, 'pricing'],
  ['Should we change pricing for annual plans?', true, 'pricing'],
  ['Should we kill the worker process after a timeout?', false, null],
  ['Should we kill the background service after a timeout?', false, null],
  ['Should we shut down the API service after the deployment fails?', false, null],
  ['Should we shut down this product line after the deployment fails?', true, 'product_strategy'],
  ['Should we publish the PRD for review?', false, null],
  ['Should we kill the legacy product line?', true, 'product_strategy'],
  ['Should we make a public announcement about layoffs?', true, 'publication'],
  ['Write a PRD for self-serve SSO', false, null],
  ['Who owns pricing?', false, null],
  ['Pricing page copy for the homepage', false, null],
  ['What is our pricing strategy?', false, null],
  ['Recommend packaging for our current prices', false, null],
  ['Do competitive pricing research for payroll SaaS', false, null],
  ['Raise prices by 10% and draft the customer email', false, null],
  ['Should we change the pricing page headline?', false, null],
  ['Should we announce the price increase by email?', false, null],
  ['Should we reduce pricing page load time?', false, null],
  ['Should we change who owns pricing?', false, null],
  ['Should we reduce time spent on pricing?', false, null],
  ['Should we ship the feature on Friday?', false, null],
  ['Should we hire a VP of sales?', false, null],
  ['Build or buy analysis for billing', false, null],
  ['Competitive landscape of recent acquisitions', false, null],
  ['Create a launch plan for the API expansion', false, null],
  ['Sprint plan for the engineering team', false, null],
  ['Is the price too high?', false, null],
  ['Should we reconsider our pricing?', false, null],
  ['Should we update the pricing page?', false, null],
];

test('phrase corpus: decision routing and scenario class', () => {
  assert.ok(DECISION_CORPUS.length >= 50);
  for (const [question, isDecision, decisionClass] of DECISION_CORPUS) {
    const result = routeRequest(question);
    assert.equal(result.topRoute?.route === 'decision-analysis', isDecision, question);
    assert.equal(result.decisionClass, decisionClass, question);
  }
});

test('should-questions on pricing or build-versus-buy with no class get MEDIUM and a clarification hint', () => {
  for (const question of ['Should we reconsider our pricing?', 'Should we revisit pricing for enterprise?',
    'Should we rethink the price of the add-on?', 'Should we go with usage-based pricing?',
    'Should I look at our prices again?', 'Should we build versus buying a CDP?']) {
    const result = routeRequest(question);
    assert.equal(result.routeConfidence, 'MEDIUM', question);
    assert.equal(result.decisionClass, null, question);
    assert.equal(result.clarificationHints.length, 1, question);
    assert.match(result.clarificationHints[0], /price change/, question);
    assert.match(result.clarificationHints[0], /build-or-buy/, question);
    assert.ok(!result.clarificationHints[0].includes(String.fromCharCode(0x2014)));
  }
});

test('clarification fallback stays off for classified, non-should and unrelated questions', () => {
  for (const question of ['Who owns pricing?', 'What is our pricing strategy?', 'Pricing page copy for the homepage',
    'Is the price too high?', 'Recommend packaging for our current prices', 'Build or buy analysis for billing',
    'Should we raise prices?', 'Should we build or buy a billing system?', 'Should we acquire a competitor?',
    'Should we ship the feature on Friday?']) {
    assert.deepEqual(routeRequest(question).clarificationHints, [], question);
  }
  assert.deepEqual(routeRequest('').clarificationHints, []);
});
