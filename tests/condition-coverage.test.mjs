import assert from 'node:assert/strict';
import test from 'node:test';

import { checkConditionCoverage } from '../scripts/condition-coverage.mjs';

const check = (prompt, prose, sources = []) => checkConditionCoverage({ prompt, prose, sources });
const codes = result => result.findings.map(finding => finding.code);

test('a weaker risk test fails when the stricter test is also present', () => {
  const prompt = 'We have not mapped the risks of individual processing activities.';
  const prose = [
    '# Publication decision',
    'The current exception requires that the processing is not likely to result in a risk.',
    '',
    '| Activity | Exception |',
    '| --- | --- |',
    '| Payroll | Only occasional, low-risk activities can be left out. |',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.ok(codes(result).includes('weakened-applicability'));
  const finding = result.findings.find(item => item.code === 'weakened-applicability');
  assert.ok(prose.includes(finding.proseQuote));
  assert.ok(prose.includes(finding.conditionQuote));
  assert.match(finding.proseQuote, /low-risk activities can be left out/);
});

test('rejecting headcount and keeping the strict test passes', () => {
  const prompt = 'We have not mapped the risks of individual processing activities.';
  const prose = '# Decision\n\nEighteen employees do not make the company exempt. Publish nothing until the processing is shown to be not likely to result in a risk.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a headcount exemption fails while risks stay unmapped', () => {
  const prompt = 'We have not mapped the risks of the payroll activity.';
  const prose = '# Decision\n\nEighteen employees means the company is exempt from this duty.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.match(result.findings[0].conditionQuote, /have not mapped/);
  assert.match(result.findings[0].proseQuote, /exempt/);
});

test('a count interval used as a revenue margin fails', () => {
  const prompt = 'There are 900 organizations with different contract values and seat prices.';
  const prose = '# Recommendation\n\nSixty organizations per arm gives a renewal-rate interval about as wide as the 12-point revenue margin the decision turns on.';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.ok(codes(result).includes('measure-swap'));
  assert.match(result.findings[0].conditionQuote, /different contract values/);
});

test('adjacent bullets can name seats and revenue without becoming one swap', () => {
  const prompt = 'There are 640 partners with different seat counts.';
  const prose = [
    '# Decision',
    '- How many partners renew, and what their seat counts are.',
    '- Revenue at stake depends on the contract values, which are unknown.',
  ].join('\n');
  assert.equal(check(prompt, prose).status, 'pass');
});

test('the same interval passes when the prose says it does not resolve revenue', () => {
  const prompt = 'There are 900 organizations with different contract values and seat prices.';
  const prose = '# Recommendation\n\nThe renewal-rate interval is about 11 points. It does not resolve the revenue margin, because contract values differ.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('applying the price increase to changed-price revenue fails', () => {
  const prompt = 'Partners have different contract values. The discount is 12 percent.';
  const prose = '# Recommendation\n\nTake the changed-price revenue and multiply by 1.12 again to reach break-even.';
  assert.equal(check(prompt, prose).status, 'fail');
});

test('an equal-value illustration can carry a customer percentage', () => {
  const prompt = 'Partners have different contract values.';
  const prose = '# Recommendation\n\nIf values were equal, 88% customer retention would be the break-even illustration. They are not equal, so this is not a rollout threshold.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a sign-in promise that drops optional passwords fails', () => {
  const prompt = 'Write a PRD for admin console single sign-on.';
  const prose = [
    '# PRD',
    '## Requirements',
    'Enforcement modes include Optional (SSO or password) and Required.',
    '',
    '## Press release',
    'Removing a person in the IdP blocks their next console sign-in.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.ok(codes(result).includes('dropped-exception'));
  assert.match(result.findings[0].proseQuote, /blocks their next console sign-in/);
  assert.match(result.findings[0].conditionQuote, /password/);
});

test('the same promise passes when the press release keeps the exception', () => {
  const prompt = 'Write a PRD for admin console single sign-on.';
  const prose = [
    '# PRD',
    '## Requirements',
    'Enforcement modes include Optional (SSO or password) and Required.',
    '',
    '## Press release',
    'Removing a person in the IdP blocks their next SSO sign-in. Optional mode password users are unchanged.',
  ].join('\n');
  assert.equal(check(prompt, prose).status, 'pass');
});

test('screen clearing stated as fact fails when the prompt says it is not established', () => {
  const prompt = 'Engineering has not established whether receiving the event clears the screen.';
  const prose = '# Opening summary\n\nOn receipt the kiosk clears the screen.';
  assert.equal(check(prompt, prose).status, 'fail');
});

test('a revisit trigger that says receipt cannot clear the screen passes', () => {
  const prompt = 'Engineering has not established whether receiving the event clears the screen.';
  const prose = '# Decision Frame\n\n- Revisit if receipt cannot clear the screen or kiosks stay offline.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('screen clearing passes when the summary marks it unestablished', () => {
  const prompt = 'Engineering has not established whether receiving the event clears the screen.';
  const prose = '# Opening summary\n\nWhether receipt clears the screen is not established. Offline kiosks keep cached pages until reconnect.';
  assert.equal(check(prompt, prose).status, 'pass');
});

test('a percentage advantage fails when the draft itself left cadence unknown', () => {
  const prompt = 'How should we price the team plan?';
  const prose = [
    '# Pricing',
    '## Sources',
    'Billing cadence for the $10 row is not stated.',
    '',
    '## Positioning recommendation',
    '$8 is 20% under the $10 entry plans and should be the offer.',
  ].join('\n');
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.ok(codes(result).includes('unresolved-comparison'));
  assert.match(result.findings[0].conditionQuote, /cadence/);
  assert.match(result.findings[0].proseQuote, /20%/);
});

test('the same advantage passes when the recommendation keeps the unknown cadence', () => {
  const prompt = 'How should we price the team plan?';
  const prose = [
    '# Pricing',
    '## Sources',
    'Billing cadence for the $10 row is not stated.',
    '',
    '## Positioning recommendation',
    'A 20% gap is not comparable while billing cadence is unresolved.',
  ].join('\n');
  assert.equal(check(prompt, prose).status, 'pass');
});

test('currency from a retained source page can block a cheaper claim', () => {
  const prompt = 'Compare the two team plans.';
  const prose = '# Positioning recommendation\n\nOur plan is cheaper than the $10 plan.';
  const sources = ['The captured page does not state the currency of the $10 plan. Currency is unknown.'];
  const result = check(prompt, prose, sources);
  assert.equal(result.status, 'fail');
  assert.equal(result.findings[0].conditionOrigin, 'source');
  assert.ok(sources[0].includes(result.findings[0].conditionQuote));
});

test('an author record cannot explain away a dropped exception', () => {
  const prompt = 'Write a PRD for admin console single sign-on.';
  const prose = '## Press release\n\nRemoving a person in the IdP blocks their next console sign-in.\n\n## Requirements\n\nOptional mode allows password sign-in.';
  const result = checkConditionCoverage({
    prompt,
    prose,
    record: { status: 'consistent', promises: [] },
  });
  assert.equal(result.status, 'fail');
});

test('quotes survive CRLF table cells', () => {
  const prompt = 'We have not mapped the risks of this processing.';
  const prose = '# Decision\r\n\r\nThe test is not likely to result in a risk.\r\n\r\n| Row | Claim |\r\n| --- | --- |\r\n| A | Only low-risk activities can be left out. |\r\n';
  const result = check(prompt, prose);
  assert.equal(result.status, 'fail');
  assert.ok(prose.includes(result.findings[0].proseQuote));
  assert.ok(prose.includes(result.findings[0].conditionQuote));
});
