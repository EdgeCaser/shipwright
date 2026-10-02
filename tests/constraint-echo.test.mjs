import assert from 'node:assert/strict';
import test from 'node:test';

import { checkConstraintEcho } from '../scripts/constraint-echo.mjs';

const check = (prompt, prose, sources = [], adjudicate = null) => checkConstraintEcho({ prompt, prose, sources, adjudicate });

test('an unknown cadence dropped from a price comparison fails', () => {
  const prompt = 'How should we price the team plan?';
  const prose = [
    '# Sources',
    '| Billing cadence | not stated |',
    '',
    '## Positioning recommendation',
    '$8 is 20% under the $10 entry plans.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].noun, /cadence/);
  assert.ok(prose.includes(result.findings[0].conditionQuote));
  assert.ok(prose.includes(result.findings[0].proseQuote));
});

test('the same comparison passes when the decision carries cadence', () => {
  const prompt = 'How should we price the team plan?';
  const prose = [
    '# Sources',
    'Billing cadence is unknown.',
    '',
    '## Positioning recommendation',
    'The 20% under figure stays unresolved until billing cadence is known.',
  ].join('\n');
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a sign-in promise that drops an optional password fails', () => {
  const prompt = 'Write the PRD.';
  const prose = [
    '## Requirements',
    'Enforcement includes Optional (SSO or password).',
    '',
    '## Press release',
    'Removing a person in the IdP blocks their next console sign-in.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].noun, /password/);
});

test('the sign-in promise passes when it names password', () => {
  const prompt = 'Write the PRD.';
  const prose = [
    '## Requirements',
    'Enforcement includes Optional (SSO or password).',
    '',
    '## Press release',
    'Removing a person blocks their next SSO sign-in. Password users are unchanged.',
  ].join('\n');
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a partner percentage fails when seat counts differ', () => {
  const prompt = 'Partners have different seat counts.';
  const prose = '# Recommendation\n\nRevenue holds if 85% of partners still renew.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].noun, /seat/);
  assert.equal(result.findings[0].conditionOrigin, 'prompt');
});

test('the partner percentage passes when the decision names seats', () => {
  const prompt = 'Partners have different seat counts.';
  const prose = '# Recommendation\n\nRevenue holds if 85% of partners renew only when seat counts are equal, and they are not.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('an exemption fails when it drops an only-if noun', () => {
  const prompt = 'Should we publish the exemption?';
  const prose = [
    '# Test',
    'The exception applies only if the activity is occasional and the risk is real.',
    '',
    '## Decision Frame',
    'The company is exempt.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].noun, /occasional|activity/);
});

test('screen clearing stated as fact fails when it is not established', () => {
  const prompt = 'Engineering has not established whether the event clears the screen.';
  const prose = '# Launch copy\n\nOn receipt the kiosk clears the screen.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].noun, /screen/);
});

test('screen clearing passes when the launch copy says it is not established', () => {
  const prompt = 'Engineering has not established whether the event clears the screen.';
  const prose = '# Launch copy\n\nWhether receipt clears the screen is not established.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a refusal with no positive ruling passes', () => {
  const prompt = 'Should we publish?';
  const prose = '# Sources\n\nBilling cadence is unknown.\n\n## Decision Frame\n\nDo not publish a price.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('an author record cannot restore a dropped noun', () => {
  const prompt = 'Partners have different seat counts.';
  const prose = '# Recommendation\n\nRevenue holds if 85% of partners still renew.';
  const result = checkConstraintEcho({ prompt, prose, record: { ok: true } });
  assert.equal(result.status, 'fail');
});

test('a paraphrase adjudicator can keep a decision that carries the constraint in other words', () => {
  const prompt = 'Billing cadence is unknown.';
  const prose = '# Recommendation\n\n$8 is 20% under the $10 plan.';
  const code = check(prompt, prose);
  assert.equal(code.status, 'fail');
  const kept = check(prompt, prose, [], () => 'echo');
  assert.equal(kept.status, 'pass');
});

test('a retained page can supply the unknown noun', () => {
  const prompt = 'Compare the plans.';
  const prose = '# Recommendation\n\nOur plan is 20% under the other plan.';
  const sources = ['The captured page says the billing cadence is unknown.'];
  const result = check(prompt, prose, sources);
  assert.equal(result.status, 'fail');
  assert.equal(result.findings[0].conditionOrigin, 'source');
});
