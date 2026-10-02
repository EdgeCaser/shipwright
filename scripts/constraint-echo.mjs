// The decision, revisit trigger, and launch promise must carry each constraint
// noun already written in the prompt, the retained page, or the draft, or that
// section must mark the point unresolved. Nouns come from the words attached to
// unknown, not established, except, optional, only if, and different.
// Author reconciliation records are not an input. No quote, no finding.
// This script is a maintainer check. It is not part of the installed package.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { loadEvidenceCases } from './condition-coverage.mjs';

const STOP = new Set(`a an the of to and or for in on at by is are was were be been being this that those these with from into over under than then not no nor so if as it its their they them we our you your only also more most such other same both can may might must should would will just about after before between within without during across per via have has had does did do what when where which while there here each any all some many much very really too own out up off allows allow keeps keep includes include retains retain permits permit means using used still mode`.split(/\s+/));

export function checkConstraintEcho({ prompt = '', prose = '', sources = [], adjudicate = null } = {}) {
  const sourceText = sources.map(source => (typeof source === 'string' ? source : source?.text || '')).join('\n');
  const promptUnits = extractUnits(prompt, 'prompt');
  const sourceUnits = extractUnits(sourceText, 'source');
  const proseUnits = extractUnits(prose, 'prose');
  const operative = proseUnits.filter(unit => isOperative(unit.section));
  const operativeText = operative.map(unit => unit.quote).join('\n');
  const rulings = operative.filter(unit => isRuling(unit.quote));
  const qualifying = [
    ...promptUnits,
    ...sourceUnits,
    ...proseUnits.filter(unit => !isOperative(unit.section)),
  ];
  const findings = [];
  const seen = new Set();

  if (rulings.length === 0) return { status: 'pass', findings: [] };

  for (const constraint of constraintsFrom(qualifying)) {
    if (carried(operativeText, constraint)) continue;
    const ruling = rulings.find(unit => !carried(unit.quote, constraint)) || rulings[0];
    const finding = {
      code: 'dropped-constraint',
      kind: constraint.kind,
      noun: constraint.nouns.join(' '),
      conditionOrigin: constraint.origin,
      conditionQuote: constraint.quote,
      proseQuote: ruling.quote,
      correction: `Carry "${constraint.nouns.join(' ')}" into the decision, or mark that point unresolved.`,
    };
    if (adjudicate && adjudicate(finding) === 'echo') continue;
    const key = `${finding.noun}\n${finding.proseQuote}`;
    if (seen.has(key)) continue;
    if (!finding.conditionQuote || !finding.proseQuote) continue;
    if (finding.conditionQuote === finding.proseQuote) continue;
    const haystack = finding.conditionOrigin === 'prompt' ? prompt
      : finding.conditionOrigin === 'source' ? sourceText : prose;
    if (!haystack.includes(finding.conditionQuote) || !prose.includes(finding.proseQuote)) continue;
    seen.add(key);
    findings.push(finding);
  }

  return { status: findings.length ? 'fail' : 'pass', findings: findings.slice(0, 12) };
}

function constraintsFrom(units) {
  const found = [];
  const seen = new Set();
  for (const unit of units) {
    for (const constraint of constraintsIn(unit.quote, unit.origin)) {
      const key = `${constraint.kind}:${constraint.nouns.join('|')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(constraint);
    }
  }
  return found;
}

function constraintsIn(quote, origin) {
  const found = [];
  const take = (kind, nouns, index) => {
    const unique = [...new Set(nouns.map(noun => noun.toLowerCase()))].filter(noun => noun.length >= 3 && !STOP.has(noun)).slice(0, 2);
    if (!unique.length) return;
    found.push({ kind, nouns: unique, quote, origin, index });
  };
  for (const match of quote.matchAll(/\b(unknown|unresolved|not stated|not decided|unavailable|not given|unmapped)\b/gi)) {
    take('unknown', nearestBefore(quote, match.index), match.index);
  }
  for (const match of quote.matchAll(/\bnot established\b/gi)) {
    const whether = /\bwhether\b/i.exec(quote.slice(match.index, match.index + 120));
    const nouns = whether
      ? clauseNouns(quote.slice(match.index + whether.index + whether[0].length)).slice(-1)
      : nearestBefore(quote, match.index).slice(-1);
    take('unestablished', nouns, match.index);
  }
  for (const match of quote.matchAll(/\b(except|unless|optional)\b/gi)) {
    take('exception', contentWords(quote.slice(match.index + match[0].length, match.index + match[0].length + 60)).slice(0, 2), match.index);
  }
  for (const match of quote.matchAll(/\b(only if|provided that)\b/gi)) {
    take('only-if', contentWords(quote.slice(match.index + match[0].length, match.index + match[0].length + 80)).slice(0, 2), match.index);
  }
  for (const match of quote.matchAll(/\bdifferent\b/gi)) {
    take('different', contentWords(quote.slice(match.index + match[0].length, match.index + match[0].length + 50)).slice(0, 2), match.index);
  }
  return found;
}

function carried(text, constraint) {
  if (!constraint.nouns.every(noun => echoed(text, noun))) return false;
  if (constraint.kind === 'unestablished') return /not established|unresolved|undetermined/i.test(text);
  return true;
}

function echoed(text, noun) {
  const forms = new Set([noun, noun.endsWith('s') ? noun.slice(0, -1) : `${noun}s`]);
  return [...forms].some(form => form.length >= 3 && new RegExp(`\\b${escapeRegExp(form)}\\b`, 'i').test(text));
}

function isOperative(section) {
  return /decision frame|revisit|press release|launch|recommendation|positioning|opening summary|\bsolution\b|\bverdict\b|how it works|summary paragraph/i.test(section);
}

function isRuling(quote) {
  if (/cannot claim|can't claim|do not claim|don't claim|no comparable|not comparable|undetermined|do not publish|don't publish|should not publish/i.test(quote)) return false;
  return /blocks? (their|the|a) next|cannot (start|sign|log|access)|clears? the screen|%\s*(under|of)|break-even|break even|like for like|at or above|\bis exempt\b|we should|recommend|holds if|roll(?: |-)?out/i.test(quote);
}

function nearestBefore(quote, index) {
  return contentWords(quote.slice(Math.max(0, index - 80), index)).slice(-1);
}

function clauseNouns(text) {
  return contentWords(text.split(/[.!?]/)[0]);
}

function contentWords(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(word => !STOP.has(word));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractUnits(text, origin) {
  const units = [];
  let section = 'preamble';
  let blockStart = -1;
  let blockEnd = -1;
  const flush = () => {
    if (blockStart < 0) return;
    pushPieces(units, text.slice(blockStart, blockEnd), section, origin);
    blockStart = -1;
  };
  walkLines(text, (line, start) => {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      section = heading[2].trim();
      return;
    }
    if (/^\s*\|/.test(line)) {
      flush();
      const trimmed = line.trim();
      if (trimmed) units.push({ quote: trimmed, section, origin });
      pushCells(units, line, section, origin);
      return;
    }
    if (!line.trim()) {
      flush();
      return;
    }
    if (/^\s*(?:[-*+]|\d+\.)\s+/.test(line)) flush();
    if (blockStart < 0) blockStart = start;
    blockEnd = start + line.length;
  });
  flush();
  return units;
}

function pushCells(units, line, section, origin) {
  const marks = [];
  for (let i = 0; i < line.length; i += 1) if (line[i] === '|') marks.push(i);
  for (let c = 0; c < marks.length - 1; c += 1) {
    const quote = line.slice(marks[c] + 1, marks[c + 1]).trim();
    if (quote && !/^[:\-\s]+$/.test(quote)) units.push({ quote, section, origin });
  }
}

function pushPieces(units, paragraph, section, origin) {
  const quotes = [];
  let start = 0;
  const boundary = /[.!?](?=\s+[A-Z])/g;
  let match;
  while ((match = boundary.exec(paragraph))) {
    quotes.push(paragraph.slice(start, match.index + 1).trim());
    start = match.index + 1;
    while (start < paragraph.length && /\s/.test(paragraph[start])) start += 1;
  }
  const rest = paragraph.slice(start).trim();
  if (rest) quotes.push(rest);
  for (const quote of quotes) if (quote) units.push({ quote, section, origin });
}

function walkLines(text, onLine) {
  let i = 0;
  while (i < text.length) {
    let end = text.indexOf('\n', i);
    if (end < 0) end = text.length;
    let lineEnd = end;
    if (lineEnd > i && text[lineEnd - 1] === '\r') lineEnd -= 1;
    onLine(text.slice(i, lineEnd), i);
    i = end < text.length ? end + 1 : text.length;
  }
}

export function scoreEchoCases(cases, adjudicate = null) {
  const tally = { hit: 0, miss: 0, 'false-alarm': 0, 'true-negative': 0 };
  const rows = cases.map(item => {
    const result = checkConstraintEcho({ ...item, adjudicate });
    const expectedFail = String(item.semantic).toUpperCase() === 'FAIL';
    const predictedFail = result.status === 'fail';
    let kind = 'true-negative';
    if (expectedFail && predictedFail) kind = 'hit';
    else if (expectedFail && !predictedFail) kind = 'miss';
    else if (!expectedFail && predictedFail) kind = 'false-alarm';
    tally[kind] += 1;
    return {
      id: item.id,
      semantic: item.semantic,
      status: result.status,
      kind,
      findings: result.findings.map(finding => ({
        code: finding.code,
        kind: finding.kind,
        noun: finding.noun,
        conditionQuote: finding.conditionQuote,
        proseQuote: finding.proseQuote,
      })),
    };
  });
  return { tally, rows };
}

export { loadEvidenceCases };

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

if (process.argv[1] && path.basename(process.argv[1]) === 'constraint-echo.mjs') {
  const evidence = readArg('--evidence');
  if (evidence) {
    console.log(JSON.stringify(scoreEchoCases(loadEvidenceCases(evidence)), null, 2));
  } else {
    const prompt = readArg('--prompt') ? readFileSync(readArg('--prompt'), 'utf8') : '';
    const prose = readArg('--prose') ? readFileSync(readArg('--prose'), 'utf8') : '';
    const source = readArg('--source');
    const sources = source ? [readFileSync(source, 'utf8')] : [];
    console.log(JSON.stringify(checkConstraintEcho({ prompt, prose, sources }), null, 2));
  }
}
