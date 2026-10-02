// The decision has to carry the head of a limit, not the nearest word.
// A head is the noun phrase attached to unknown, not established, except,
// optional, only if, or different inside the same clause. No nearest-word
// fallback: if that phrase has no head, the marker is skipped. A finding
// also needs a ruling of the same kind. A comparison makes an unknown or a
// difference material. A stated fact makes an unestablished point material.
// An exemption or a cutoff makes an exception or an only-if material.
// Author reconciliation records are not an input. No quote, no finding.
// This script is a maintainer check. It is not part of the installed package.
// Do not edit the attachment after the unseen archive score.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { loadEvidenceCases } from './condition-coverage.mjs';

const STOP = new Set(`a an the of to and or for in on at by is are was were be been being this that those these with from into over under than then not no nor so if as it its their they them we our you your only also more most such other same both can may might must should would will just about after before between within without during across per via have has had does did do what when where which while there here each any all some many much very really too own out up off allows allow keeps keep includes include retains retain permits permit means using used still mode`.split(/\s+/));
const COPULA = new Set('is are was were remains remain stays stay'.split(/\s+/));
const AUX = new Set('has have had does did do'.split(/\s+/));
const ORDINAL = new Set('first second third fourth fifth next'.split(/\s+/));

const MARKER = /\b(unknown|unresolved|not stated|not decided|unavailable|not given|unmapped|not established|except|unless|optional|only if|provided that|different)\b/gi;

const RULING = {
  unknown: /%\s*(under|of)|break-even|break even|like for like|at or above/i,
  different: /holds if|%\s*(under|of)|break-even|break even/i,
  unestablished: /blocks? (their|the|a) next|cannot (start|sign|log|access)|clears? the screen/i,
  exception: /blocks? (their|the|a) next|cannot (start|sign|log|access)|\bis exempt\b/i,
  'only-if': /blocks? (their|the|a) next|cannot (start|sign|log|access)|\bis exempt\b/i,
};

export function checkConstraintHead({ prompt = '', prose = '', sources = [] } = {}) {
  const sourceText = sources.map(source => (typeof source === 'string' ? source : source?.text || '')).join('\n');
  const promptUnits = extractUnits(prompt, 'prompt');
  const sourceUnits = extractUnits(sourceText, 'source');
  const proseUnits = extractUnits(prose, 'prose');
  const operative = proseUnits.filter(unit => isOperative(unit.section));
  const operativeText = operative.map(unit => unit.quote).join('\n');
  const qualifying = [
    ...promptUnits,
    ...sourceUnits,
    ...proseUnits.filter(unit => !isOperative(unit.section)),
  ];
  const findings = [];
  const seen = new Set();

  for (const constraint of constraintsFrom(qualifying)) {
    const rulings = operative.filter(unit => RULING[constraint.kind].test(unit.quote));
    if (!rulings.length) continue;
    if (carried(operativeText, constraint)) continue;
    const ruling = rulings.find(unit => !carried(unit.quote, constraint)) || rulings[0];
    const finding = {
      code: 'dropped-head',
      kind: constraint.kind,
      noun: constraint.nouns.join(' '),
      conditionOrigin: constraint.origin,
      conditionQuote: constraint.quote,
      proseQuote: ruling.quote,
      correction: `Carry "${constraint.nouns.join(' ')}" into the decision, or mark that point unresolved.`,
    };
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
  for (const match of quote.matchAll(MARKER)) {
    const kind = kindOf(match[1]);
    const nouns = headFor(quote, match.index, match.index + match[0].length);
    if (!nouns.length) continue;
    found.push({ kind, nouns, quote, origin, index: match.index });
  }
  return found;
}

function kindOf(marker) {
  const text = marker.toLowerCase();
  if (text === 'not established') return 'unestablished';
  if (text === 'except' || text === 'unless' || text === 'optional') return 'exception';
  if (text === 'only if' || text === 'provided that') return 'only-if';
  if (text === 'different') return 'different';
  return 'unknown';
}

function headFor(quote, start, end) {
  const after = headAfter(quote, end);
  if (after.length) return after;
  const table = tableHead(quote, start);
  if (table.length) return table;
  return headBefore(quote, start);
}

function headAfter(quote, end) {
  const rest = quote.slice(end);
  const boundary = rest.search(/[.!?;\n]/);
  const slice = boundary < 0 ? rest : rest.slice(0, boundary);
  if (/^\s*by\b/i.test(slice)) return [];
  if (/^\s*whether\b/i.test(slice)) {
    const words = contentWords(slice).filter(word => word !== 'whether' && !ORDINAL.has(word) && !AUX.has(word));
    return words.length ? [words[words.length - 1]] : [];
  }
  const cut = slice.search(/\b(is|are|was|were|remains|remain|stays|stay|has|have|had|does|did|do)\b/i);
  const phrase = cut < 0 ? slice : slice.slice(0, cut);
  return contentWords(phrase).filter(word => !ORDINAL.has(word)).slice(0, 2);
}

function headBefore(quote, start) {
  const clause = quote.slice(clauseStart(quote, start), start);
  const tokens = [...clause.matchAll(/[A-Za-z][A-Za-z0-9-]{2,}/g)];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const word = tokens[index][0].toLowerCase();
    if (STOP.has(word) || COPULA.has(word) || ORDINAL.has(word)) continue;
    if (AUX.has(word)) return [];
    return [word];
  }
  return [];
}

function tableHead(quote, start) {
  if (!quote.includes('|')) return [];
  const cells = quote.split('|');
  let cursor = 0;
  let holder = -1;
  for (let index = 0; index < cells.length; index += 1) {
    const next = cursor + cells[index].length + 1;
    if (start >= cursor && start < next) holder = index;
    cursor = next;
  }
  if (holder < 0) return [];
  const leftover = cells[holder].replace(/\b(unknown|unresolved|not stated|not decided|unavailable|not given|unmapped|not established|except|unless|optional|only if|provided that|different)\b/i, ' ');
  if (contentWords(leftover).length) return [];
  for (let index = holder - 1; index >= 0; index -= 1) {
    const words = contentWords(cells[index]).filter(word => !ORDINAL.has(word));
    if (words.length) return [words[words.length - 1]];
  }
  return [];
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

function contentWords(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(word => !STOP.has(word) && !COPULA.has(word));
}

function clauseStart(quote, index) {
  const prior = quote.slice(0, index);
  const breaks = [...prior.matchAll(/[.!?\n]/g)];
  return breaks.length ? breaks[breaks.length - 1].index + 1 : 0;
}

function isOperative(section) {
  return /decision frame|revisit|press release|launch|recommendation|positioning|opening summary|\bsolution\b|\bverdict\b|how it works|summary paragraph/i.test(section);
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

export function scoreHeadCases(cases) {
  const tally = { hit: 0, miss: 0, 'false-alarm': 0, 'true-negative': 0, skipped: 0 };
  const rows = [];
  for (const item of cases) {
    const label = String(item.semantic || '').toUpperCase();
    if (label !== 'FAIL' && label !== 'PASS') {
      tally.skipped += 1;
      rows.push({ id: item.id, semantic: item.semantic, status: 'skipped', kind: 'skipped', findings: [] });
      continue;
    }
    const result = checkConstraintHead(item);
    const expectedFail = label === 'FAIL';
    const predictedFail = result.status === 'fail';
    let kind = 'true-negative';
    if (expectedFail && predictedFail) kind = 'hit';
    else if (expectedFail && !predictedFail) kind = 'miss';
    else if (!expectedFail && predictedFail) kind = 'false-alarm';
    tally[kind] += 1;
    rows.push({
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
    });
  }
  return { tally, rows };
}

export { loadEvidenceCases };

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

if (process.argv[1] && path.basename(process.argv[1]) === 'constraint-head.mjs') {
  const evidence = readArg('--evidence');
  if (evidence) {
    console.log(JSON.stringify(scoreHeadCases(loadEvidenceCases(evidence)), null, 2));
  } else {
    const prompt = readArg('--prompt') ? readFileSync(readArg('--prompt'), 'utf8') : '';
    const prose = readArg('--prose') ? readFileSync(readArg('--prose'), 'utf8') : '';
    const source = readArg('--source');
    const sources = source ? [readFileSync(source, 'utf8')] : [];
    console.log(JSON.stringify(checkConstraintHead({ prompt, prose, sources }), null, 2));
  }
}
