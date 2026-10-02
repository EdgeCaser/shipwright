// A one-shot paraphrase judge for pairs the constraint echo check already produced.
// The judge sees the constraint sentence and the ruling sentence. It does not see
// the grade, the author record, or the rest of the draft. This file does not
// decide echo by itself. It applies a judgments file. Missing and unclear
// judgments keep the finding.
// The rubric below is the check. Do not edit it after an archive score.
// This script is a maintainer check. It is not part of the installed package.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { checkConstraintEcho, loadEvidenceCases, scoreEchoCases } from './constraint-echo.mjs';

export const RUBRIC = `You judge one pair at a time. You see a constraint sentence and a ruling sentence. You do not see the rest of the draft, the grade, the author, or any other case.

The constraint sentence states a limit on a claim. The limit is one of these relations:
- a point is unknown, not stated, not decided, unavailable, not given, or unmapped
- a point is not established
- an exception, an unless, or an optional path
- a condition that holds only if, or provided that
- a stated difference between things being compared

The ruling sentence makes a recommendation, comparison, trigger, promise, or other positive claim. Decide whether the ruling still carries that same limit in other words.

Return echo only when a reader of these two sentences would say the ruling keeps the limit. Keeping the limit means the ruling renames the limited thing and still withholds, qualifies, or refuses the claim, or it repeats the exception, the only-if condition, or the difference in other words.

Return drop when the ruling states the claim the limit was holding back. Return drop when the ruling is about a different point. A shared topic, a nearby noun, or a hedge that does not preserve the limit is drop. If the head word of the constraint sentence is incidental, judge the limit the sentence actually states. If you cannot tell, return drop.

Examples, not cases to score:

Constraint: Billing cadence is unknown.
Ruling: The 20% gap stays unresolved until the billing period is known.
echo

Constraint: Billing cadence is unknown.
Ruling: The team plan is 20% under the entry plan.
drop

Constraint: Enforcement includes Optional (SSO or password).
Ruling: An IdP removal blocks the next sign-in, and password users still sign in.
echo

Constraint: Enforcement includes Optional (SSO or password).
Ruling: An IdP removal blocks the next console sign-in.
drop

Constraint: Engineering has not established whether the event clears the screen.
Ruling: Whether receipt clears the display is not established.
echo

Constraint: Engineering has not established whether the event clears the screen.
Ruling: On receipt the kiosk clears the screen.
drop

Constraint: Partners have different seat counts.
Ruling: Revenue holds if 85% renew, and the seats are not equal.
echo

Constraint: Partners have different seat counts.
Ruling: Revenue holds if 85% of partners still renew.
drop

Reply with one word for the pair: echo or drop.`;

export function rubricHash() {
  return createHash('sha256').update(RUBRIC).digest('hex').slice(0, 16);
}

export function pairKey(conditionQuote, proseQuote) {
  return `${conditionQuote}\n---\n${proseQuote}`;
}

export function pairId(conditionQuote, proseQuote) {
  return createHash('sha256').update(pairKey(conditionQuote, proseQuote)).digest('hex').slice(0, 12);
}

export function quotePairs(cases) {
  const seen = new Map();
  for (const item of cases) {
    checkConstraintEcho({
      prompt: item.prompt || '',
      prose: item.prose || '',
      sources: item.sources || [],
      adjudicate(finding) {
        const id = pairId(finding.conditionQuote, finding.proseQuote);
        if (!seen.has(id)) {
          seen.set(id, {
            id,
            conditionQuote: finding.conditionQuote,
            proseQuote: finding.proseQuote,
          });
        }
        return 'drop';
      },
    });
  }
  return [...seen.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function adjudicateFromJudgments(judgments = []) {
  const byId = new Map();
  for (const row of judgments) {
    if (!row || (row.verdict !== 'echo' && row.verdict !== 'drop')) continue;
    if (row.conditionQuote && row.proseQuote) byId.set(pairId(row.conditionQuote, row.proseQuote), row.verdict);
    if (typeof row.id === 'string') byId.set(row.id, row.verdict);
  }
  return (finding) => {
    const verdict = byId.get(pairId(finding.conditionQuote, finding.proseQuote))
      || byId.get(finding.id);
    return verdict === 'echo' ? 'echo' : 'drop';
  };
}

export function scoreParaphrase(cases, judgments) {
  return scoreEchoCases(cases, adjudicateFromJudgments(judgments));
}

export function parseVerdictText(text) {
  const source = String(text || '');
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : source;
  const match = body.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const rows = JSON.parse(match[0]);
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(row => row && typeof row.id === 'string' && (row.verdict === 'echo' || row.verdict === 'drop'))
      .map(row => ({ id: row.id, verdict: row.verdict }));
  } catch {
    return [];
  }
}

export function mergeVerdicts(pairs, parsedRows) {
  const got = new Map();
  for (const row of parsedRows) {
    if (!got.has(row.id)) got.set(row.id, row.verdict);
  }
  const judgments = [];
  let unparsed = 0;
  for (const pair of pairs) {
    const verdict = got.get(pair.id);
    if (verdict === 'echo' || verdict === 'drop') judgments.push({ id: pair.id, verdict });
    else unparsed += 1;
  }
  return { judgments, unparsed };
}

export function splitPairs(pairs, batches) {
  const count = Math.max(1, Number(batches) || 1);
  const size = Math.ceil(pairs.length / count);
  const groups = [];
  for (let index = 0; index < pairs.length; index += size) groups.push(pairs.slice(index, index + size));
  return groups;
}

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

function evidenceDirs() {
  const dirs = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === '--evidence') dirs.push(process.argv[index + 1]);
  }
  return dirs.filter(Boolean);
}

if (process.argv[1] && path.basename(process.argv[1]) === 'paraphrase-echo.mjs') {
  const dirs = evidenceDirs();
  if (process.argv.includes('--dump-pairs')) {
    const cases = dirs.flatMap(dir => loadEvidenceCases(dir));
    const pairs = quotePairs(cases);
    const out = readArg('--out');
    if (out) writeFileSync(out, JSON.stringify({ pairs }));
    console.log(JSON.stringify({ pairs: pairs.length, rubric: rubricHash() }));
  } else if (process.argv.includes('--split')) {
    const loaded = JSON.parse(readFileSync(readArg('--pairs'), 'utf8'));
    const groups = splitPairs(loaded.pairs || [], readArg('--batches') || 8);
    const outdir = readArg('--outdir');
    mkdirSync(outdir, { recursive: true });
    groups.forEach((group, index) => {
      const file = path.join(outdir, `batch-${String(index + 1).padStart(2, '0')}.json`);
      writeFileSync(file, JSON.stringify({ rubric: RUBRIC, pairs: group }));
      console.log(`${group.length} ${file}`);
    });
  } else if (process.argv.includes('--judgments')) {
    const cases = dirs.flatMap(dir => loadEvidenceCases(dir));
    const judgments = JSON.parse(readFileSync(readArg('--judgments'), 'utf8'));
    const scored = scoreParaphrase(cases, judgments);
    console.log(JSON.stringify({
      tally: scored.tally,
      rubric: rubricHash(),
      rows: scored.rows.map(row => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        findings: row.findings.length,
      })),
    }));
  } else {
    console.log(JSON.stringify({ rubric: rubricHash() }));
  }
}
