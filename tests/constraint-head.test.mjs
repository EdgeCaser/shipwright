import assert from 'node:assert/strict';
import test from 'node:test';

import { checkConstraintHead } from '../scripts/constraint-head.mjs';

const check = (prompt, prose, sources = []) => checkConstraintHead({ prompt, prose, sources });

test('an unknown cadence dropped from a price comparison fails on the head', () => {
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
  assert.equal(result.findings[0].noun, 'cadence');
  assert.equal(result.findings[0].code, 'dropped-head');
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

test('a previous clause does not supply the head', () => {
  const prompt = 'The drawer moves daily. Billing cadence is unknown.';
  const prose = '# Recommendation\n\n$8 is 20% under the $10 plan.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].noun, 'cadence');
});

test('a marker with no head does not flag a comparison', () => {
  const prompt = 'It is unknown. Engineering has not established it.';
  const prose = '# Recommendation\n\n$8 is 20% under the $10 plan.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a by-phrase agent is not the head', () => {
  const prompt = 'It is not established by engineering.';
  const prose = '# Launch copy\n\nOn receipt the kiosk clears the screen.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a recommendation that is not a comparison does not use an unknown cadence', () => {
  const prompt = 'Billing cadence is unknown.';
  const prose = '# Recommendation\n\nWe should publish the notes.';
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

test('the sign-in promise passes when it names the optional heads', () => {
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
});

test('an exemption fails when it drops an only-if head', () => {
  const prompt = 'Should we publish the exemption?';
  const prose = [
    '# Test',
    'The exception applies only if the activity is occasional.',
    '',
    '## Decision Frame',
    'The company is exempt.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.equal(result.findings[0].noun, 'activity');
});

test('screen clearing stated as fact fails when it is not established', () => {
  const prompt = 'Engineering has not established whether the event clears the screen.';
  const prose = '# Launch copy\n\nOn receipt the kiosk clears the screen.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.equal(result.findings[0].noun, 'screen');
});

test('screen clearing passes when the launch copy keeps the head unresolved', () => {
  const prompt = 'Engineering has not established whether the event clears the screen.';
  const prose = '# Launch copy\n\nWhether receipt clears the screen is not established.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a refusal with no material ruling passes', () => {
  const prompt = 'Should we publish?';
  const prose = '# Sources\n\nBilling cadence is unknown.\n\n## Decision Frame\n\nDo not publish a price.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('an author record cannot restore a dropped head', () => {
  const prompt = 'Partners have different seat counts.';
  const prose = '# Recommendation\n\nRevenue holds if 85% of partners still renew.';
  const result = checkConstraintHead({ prompt, prose, record: { ok: true } });
  assert.equal(result.status, 'fail');
});

test('rows without a pass or fail grade are skipped', async () => {
  const { scoreHeadCases } = await import('../scripts/constraint-head.mjs');
  const scored = scoreHeadCases([{ id: 'open', semantic: 'NOT ASSESSED', prompt: '', prose: '' }]);
  assert.equal(scored.tally.skipped, 1);
  assert.equal(scored.tally.hit, 0);
});
