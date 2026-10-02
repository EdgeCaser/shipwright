import assert from 'node:assert/strict';
import test from 'node:test';

import { checkConstraintEcho } from '../scripts/constraint-echo.mjs';
import {
  RUBRIC,
  adjudicateFromJudgments,
  mergeVerdicts,
  pairId,
  parseVerdictText,
  quotePairs,
  rubricHash,
  scoreParaphrase,
  splitPairs,
} from '../scripts/paraphrase-echo.mjs';

const cadence = {
  prompt: 'Billing cadence is unknown.',
  prose: '# Recommendation\n\n$8 is 20% under the $10 plan.',
  semantic: 'FAIL',
};

test('the rubric fails closed when the limit is unclear', () => {
  assert.match(RUBRIC, /If you cannot tell, return drop/);
  assert.equal(RUBRIC.includes('\u2014'), false);
  assert.equal(rubricHash().length, 16);
});

test('a pair id is the hash of the two quotes', () => {
  const id = pairId('Billing cadence is unknown.', '$8 is 20% under the $10 plan.');
  assert.equal(id, pairId('Billing cadence is unknown.', '$8 is 20% under the $10 plan.'));
  assert.notEqual(id, pairId('Billing cadence is unknown.', 'Another ruling.'));
  assert.match(id, /^[0-9a-f]{12}$/);
});

test('quote pairs keep the two sentences and drop the grade', () => {
  const pairs = quotePairs([cadence]);
  assert.equal(pairs.length, 1);
  assert.deepEqual(Object.keys(pairs[0]).sort(), ['conditionQuote', 'id', 'proseQuote']);
  assert.equal(JSON.stringify(pairs).includes('FAIL'), false);
  assert.equal(pairs[0].id, pairId(pairs[0].conditionQuote, pairs[0].proseQuote));
});

test('an echo judgment clears the finding the code kept', () => {
  const pairs = quotePairs([cadence]);
  const cleared = scoreParaphrase([cadence], [{ id: pairs[0].id, verdict: 'echo' }]);
  assert.equal(cleared.rows[0].status, 'pass');
  const kept = scoreParaphrase([cadence], [{ id: pairs[0].id, verdict: 'drop' }]);
  assert.equal(kept.rows[0].status, 'fail');
});

test('a missing or unclear judgment keeps the finding', () => {
  assert.equal(scoreParaphrase([cadence], []).rows[0].status, 'fail');
  assert.equal(scoreParaphrase([cadence], [{ id: 'nope', verdict: 'maybe' }]).rows[0].status, 'fail');
});

test('the harness does not treat a renamed limit as an echo by itself', () => {
  const renamed = {
    prompt: 'Billing cadence is unknown.',
    prose: '# Recommendation\n\nThe 20% gap stays unresolved until the billing period is known.',
  };
  assert.equal(checkConstraintEcho(renamed).status, 'pass');
  const droppedNoun = {
    prompt: 'Billing cadence is unknown.',
    prose: '# Recommendation\n\n$8 is 20% under the $10 plan until the billing period is known.',
  };
  const code = checkConstraintEcho(droppedNoun);
  assert.equal(code.status, 'fail');
  const pairs = quotePairs([droppedNoun]);
  const still = checkConstraintEcho({
    ...droppedNoun,
    adjudicate: adjudicateFromJudgments([{ id: pairs[0].id, verdict: 'drop' }]),
  });
  assert.equal(still.status, 'fail');
});

test('parsed verdicts ignore prose around the array and reject other words', () => {
  const parsed = parseVerdictText('Notes\n```json\n[{"id":"abc","verdict":"echo"},{"id":"def","verdict":"keep"}]\n```\n');
  assert.deepEqual(parsed, [{ id: 'abc', verdict: 'echo' }]);
  assert.deepEqual(parseVerdictText('no array here'), []);
});

test('a pair with no parsed verdict stays unparsed', () => {
  const pairs = [
    { id: 'abc', conditionQuote: 'a', proseQuote: 'b' },
    { id: 'def', conditionQuote: 'c', proseQuote: 'd' },
  ];
  const merged = mergeVerdicts(pairs, [{ id: 'abc', verdict: 'echo' }]);
  assert.equal(merged.unparsed, 1);
  assert.deepEqual(merged.judgments, [{ id: 'abc', verdict: 'echo' }]);
});

test('split keeps every pair and does not invent batches for an empty list', () => {
  const pairs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const groups = splitPairs(pairs, 2);
  assert.equal(groups.length, 2);
  assert.equal(groups.flat().length, 3);
  assert.deepEqual(splitPairs([], 4), []);
});
