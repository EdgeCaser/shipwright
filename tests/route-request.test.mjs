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
