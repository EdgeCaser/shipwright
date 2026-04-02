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
