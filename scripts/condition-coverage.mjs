// Offline check for a condition that the final prose drops.
// Inputs are the user prompt, retained source text, and the final prose.
// Author reconciliation records are not an input. A finding has to quote the
// condition and the sentence or cell that drops it. No quote, no finding.
// This script is a maintainer check. It is not part of the installed package.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const STRICT_RISK = /not likely to result in a risk|unlikely to result in a risk/i;
const VALUE_GAP = /different contract values|different seat prices|different seat counts|contract values and seat prices differ/i;
const CAVEAT = /cannot stand in|can't stand in|does not|doesn't|do not|don't|cannot|can't|is not|isn't|are not|aren't|not a revenue|equal value|equal contract|assuming equal|if values were equal|if every\b[^.]{0,40}equal|unresolved|not comparable|cannot claim|can't claim|do not claim|not established/i;

export function checkConditionCoverage({ prompt = '', prose = '', sources = [] } = {}) {
  const sourceText = sources.map(source => (typeof source === 'string' ? source : source?.text || '')).join('\n');
  const promptUnits = extractUnits(prompt, 'prompt');
  const sourceUnits = extractUnits(sourceText, 'source');
  const proseUnits = extractUnits(prose, 'prose');
  const findings = [];
  const seen = new Set();

  const add = finding => {
    const key = `${finding.code}\n${finding.proseQuote}`;
    if (seen.has(key)) return;
    if (!finding.conditionQuote || !finding.proseQuote) return;
    if (finding.conditionQuote === finding.proseQuote) return;
    const conditionHaystack = finding.conditionOrigin === 'prompt' ? prompt
      : finding.conditionOrigin === 'source' ? sourceText : prose;
    if (!conditionHaystack.includes(finding.conditionQuote)) return;
    if (!prose.includes(finding.proseQuote)) return;
    seen.add(key);
    findings.push(finding);
  };

  checkApplicability(promptUnits, sourceUnits, proseUnits, add);
  checkMeasures(promptUnits, proseUnits, add);
  checkExceptions(promptUnits, sourceUnits, proseUnits, add);
  checkComparisons(proseUnits, sourceUnits, add);

  return { status: findings.length ? 'fail' : 'pass', findings: findings.slice(0, 12) };
}

function checkApplicability(promptUnits, sourceUnits, proseUnits, add) {
  const strict = [...sourceUnits, ...proseUnits, ...promptUnits].find(unit => STRICT_RISK.test(unit.quote));
  for (const unit of proseUnits) {
    if (!isWeakRiskTest(unit.quote) || (strict && unit.quote.includes(strict.quote))) continue;
    if (strict) {
      add({
        code: 'weakened-applicability',
        conditionOrigin: strict.origin,
        conditionQuote: strict.quote,
        proseQuote: unit.quote,
        correction: 'State the stricter risk test in the same claim, or remove the weaker test.',
      });
    }
  }

  const unmapped = promptUnits.find(unit => /have not mapped\b[^.]{0,80}\brisks?\b/i.test(unit.quote));
  if (!unmapped) return;
  for (const unit of proseUnits) {
    if (!isHeadcountExemption(unit.quote)) continue;
    add({
      code: 'weakened-applicability',
      conditionOrigin: 'prompt',
      conditionQuote: unmapped.quote,
      proseQuote: unit.quote,
      correction: 'Leave applicability undetermined until the unmapped risk inputs are known.',
    });
  }
}

function checkMeasures(promptUnits, proseUnits, add) {
  const gap = promptUnits.find(unit => VALUE_GAP.test(unit.quote));
  if (!gap) return;
  for (const unit of proseUnits) {
    if (swapsCountForValue(unit.quote) || doublesPrice(unit.quote) || countThreshold(unit.quote)) {
      add({
        code: 'measure-swap',
        conditionOrigin: 'prompt',
        conditionQuote: gap.quote,
        proseQuote: unit.quote,
        correction: 'Keep the count result on the count, and state the price basis before any value threshold.',
      });
    }
  }
}

function checkExceptions(promptUnits, sourceUnits, proseUnits, add) {
  const rules = [
    {
      present: quote => /optional/i.test(quote) && /password/i.test(quote),
      promise: statesBlockedSignIn,
      kept: quote => /password/i.test(quote) || /optional/i.test(quote),
      correction: 'Keep the Optional-mode password exception beside the sign-in promise.',
    },
    {
      present: quote => /not established/i.test(quote) && /screen/i.test(quote),
      promise: statesScreenClears,
      kept: quote => /not established|proposed|unverified|hypothesis|unknown/i.test(quote),
      correction: 'Do not state screen clearing as behavior that has been established.',
    },
    {
      present: quote => /offline/i.test(quote) && /reconnect/i.test(quote),
      promise: quote => /all (users|kiosks|sessions|devices)/i.test(quote) && /immediately|at once|right away/i.test(quote),
      kept: quote => /offline|reconnect/i.test(quote),
      correction: 'Keep the offline-until-reconnect limit beside any immediate-cutoff promise.',
    },
  ];
  const background = [...promptUnits, ...sourceUnits, ...proseUnits];
  for (const rule of rules) {
    const condition = background.find(unit => rule.present(unit.quote));
    if (!condition) continue;
    const promiseSections = new Set(proseUnits.filter(unit => rule.promise(unit.quote) && isPromiseSection(unit.section)).map(unit => unit.section));
    for (const section of promiseSections) {
      const sectionQuote = proseUnits.filter(unit => unit.section === section).map(unit => unit.quote).join('\n');
      if (rule.kept(sectionQuote)) continue;
      const claim = proseUnits.find(unit => unit.section === section && rule.promise(unit.quote));
      add({
        code: 'dropped-exception',
        conditionOrigin: condition.origin,
        conditionQuote: condition.quote,
        proseQuote: claim.quote,
        correction: rule.correction,
      });
    }
  }
}

function checkComparisons(proseUnits, sourceUnits, add) {
  const unknowns = [];
  for (const unit of [...proseUnits, ...sourceUnits]) {
    if (fieldUnresolved(unit.quote, 'cadence')) unknowns.push({ field: 'cadence', unit });
    if (fieldUnresolved(unit.quote, 'currency')) unknowns.push({ field: 'currency', unit });
  }
  for (const unknown of unknowns) {
    for (const unit of proseUnits) {
      if (!isComparisonSection(unit.section) || !comparisonClaim(unit.quote)) continue;
      const sectionQuote = proseUnits.filter(item => item.section === unit.section).map(item => item.quote).join('\n');
      if (new RegExp(unknown.field, 'i').test(sectionQuote) && /unknown|unresolved|not stated|not comparable/i.test(sectionQuote)) continue;
      if (CAVEAT.test(unit.quote) && new RegExp(unknown.field, 'i').test(unit.quote)) continue;
      add({
        code: 'unresolved-comparison',
        conditionOrigin: unknown.unit.origin,
        conditionQuote: unknown.unit.quote,
        proseQuote: unit.quote,
        correction: `Keep the unresolved ${unknown.field} attached to the comparison, or drop the comparison.`,
      });
    }
  }
}

function isWeakRiskTest(quote) {
  if (!/low-risk/i.test(quote)) return false;
  if (!/left out|exempt|exemption|omitted/i.test(quote)) return false;
  if (STRICT_RISK.test(quote)) return false;
  if (/cannot be left out|can't be left out|not be left out|may not be left out/i.test(quote)) return false;
  return true;
}

function isHeadcountExemption(quote) {
  if (!/\b(employees|staff|headcount)\b/i.test(quote) || !/\b(exempt|exemption)\b/i.test(quote)) return false;
  if (STRICT_RISK.test(quote)) return false;
  if (/\b(not|no|never|cannot|can't|don't|do not|does not|whether|proposed|draft|statement)\b/i.test(quote)) return false;
  if (/["“”]/.test(quote)) return false;
  return true;
}

function swapsCountForValue(quote) {
  const count = /renewal[ -]rate|per arm|customer counts?|organization counts?|organisation counts?|seat counts?/i.test(quote);
  const value = /\bmargin\b|\brevenue\b|break-even|break even/i.test(quote);
  return count && value && !CAVEAT.test(quote);
}

function doublesPrice(quote) {
  const base = /full[- ]price revenue|changed-price revenue|revenue at the (new|higher) price/i.test(quote);
  const again = /\bagain\b|second time|multiply|multiplied|uplift|\b1\.\d{2}\b/i.test(quote);
  return base && again && !CAVEAT.test(quote);
}

function countThreshold(quote) {
  const percent = /\b([1-9]\d?)\s*%/.exec(quote);
  if (!percent || Number(percent[1]) >= 100) return false;
  const count = /customers?|organizations?|organisations?|seats?|partners?/i.test(quote);
  const asRule = /break-even|break even|enough to|operating threshold|rollout threshold/i.test(quote);
  const basis = /unchanged[- ]price|list price|old price|equal value|no-change/i.test(quote);
  return count && asRule && !basis && !CAVEAT.test(quote);
}

function statesBlockedSignIn(quote) {
  if (/\b(does not|doesn't|do not|don't|will not|won't)\s+block/i.test(quote)) return false;
  return /blocks? (their|the|a) next/i.test(quote) && /sign-?in|log-?in/i.test(quote);
}

function statesScreenClears(quote) {
  if (/\b(does not|doesn't|do not|don't|will not|won't|cannot|can't|not)\s+clear/i.test(quote)) return false;
  return /clears? the screen|screen clears|clear the screen/i.test(quote);
}

function fieldUnresolved(quote, field) {
  const name = field === 'cadence' ? /(billing cadence|\bcadence\b)/i : /\bcurrency\b/i;
  return name.test(quote) && /unknown|not stated|isn't stated|is not stated|does not state|doesn't state|unresolved|not given|unavailable/i.test(quote);
}

function comparisonClaim(quote) {
  return /\d+\s*%\s*(under|below|cheaper|less)|\bcheaper\b|under the \$/i.test(quote);
}

function isPromiseSection(section) {
  return /press release|opening summary|\bsummary\b|how it works|launch copy|\bheadline\b|subheading|\bsolution\b|recommendation|decision frame|positioning|\bverdict\b/i.test(section);
}

function isComparisonSection(section) {
  return /recommendation|positioning|decision frame|packaging|\bverdict\b/i.test(section);
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
      pushCells(units, line, section, origin);
      return;
    }
    if (!line.trim()) {
      flush();
      return;
    }
    // A bullet is its own claim. Joining a list makes two careful lines look like one swap.
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
  for (let i = 0; i < marks.length - 1; i += 1) {
    const quote = line.slice(marks[i] + 1, marks[i + 1]).trim();
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
  if (quotes.length > 1) units.push({ quote: paragraph.trim(), section, origin });
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

export function scoreCases(cases) {
  const tally = { hit: 0, miss: 0, 'false-alarm': 0, 'true-negative': 0, quotes: 0, quoteChecks: 0 };
  const rows = cases.map(item => {
    const result = checkConditionCoverage(item);
    const expectedFail = String(item.semantic).toUpperCase() === 'FAIL';
    const predictedFail = result.status === 'fail';
    let kind = 'true-negative';
    if (expectedFail && predictedFail) kind = 'hit';
    else if (expectedFail && !predictedFail) kind = 'miss';
    else if (!expectedFail && predictedFail) kind = 'false-alarm';
    tally[kind] += 1;
    let quoteHit = null;
    if (expectedFail && Array.isArray(item.excerpts) && item.excerpts.length) {
      tally.quoteChecks += 1;
      quoteHit = result.findings.some(finding => item.excerpts.some(excerpt =>
        finding.proseQuote.includes(excerpt) || excerpt.includes(finding.proseQuote)
        || finding.conditionQuote.includes(excerpt) || excerpt.includes(finding.conditionQuote)));
      if (quoteHit) tally.quotes += 1;
    }
    return {
      id: item.id,
      semantic: item.semantic,
      status: result.status,
      kind,
      quoteHit,
      findings: result.findings.map(finding => ({ code: finding.code, correction: finding.correction })),
    };
  });
  return { tally, rows };
}

export function loadEvidenceCases(dir) {
  const reviewPath = path.join(dir, 'semantic-review.json');
  const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
  const reviews = Array.isArray(review.reviews) ? review.reviews : [];
  const runs = readdirSync(path.join(dir, 'runs'));
  return reviews.map(item => {
    const folder = runs.find(name => name.startsWith(`${String(item.number).padStart(2, '0')}-`));
    if (!folder) throw new Error(`Missing run folder for review ${item.number}`);
    const runDir = path.join(dir, 'runs', folder);
    const prosePath = existsSync(path.join(runDir, 'saved-final.md'))
      ? path.join(runDir, 'saved-final.md')
      : path.join(runDir, 'response.md');
    return {
      id: folder,
      semantic: item.semantic,
      prompt: readFileSync(path.join(runDir, 'prompt.txt'), 'utf8'),
      prose: readFileSync(prosePath, 'utf8'),
      excerpts: item.conflictingExcerpts || [],
    };
  });
}

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : '';
}

if (process.argv[1] && path.basename(process.argv[1]) === 'condition-coverage.mjs') {
  const evidence = readArg('--evidence');
  if (evidence) {
    const scored = scoreCases(loadEvidenceCases(evidence));
    console.log(JSON.stringify(scored, null, 2));
  } else {
    const prompt = readArg('--prompt') ? readFileSync(readArg('--prompt'), 'utf8') : '';
    const prose = readArg('--prose') ? readFileSync(readArg('--prose'), 'utf8') : '';
    const source = readArg('--source');
    const sources = source ? [{ id: path.basename(source), text: readFileSync(source, 'utf8') }] : [];
    console.log(JSON.stringify(checkConditionCoverage({ prompt, prose, sources }), null, 2));
  }
}
