import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { extractStructuredArtifact, validateStructuredArtifact } from '../scripts/extract-structured-artifact.mjs';
import { IssueType, Severity, validateArtifact, visibleMarkdown } from '../scripts/validate-artifact.mjs';

const fixturePath = path.resolve('benchmarks/fixtures/prd-hidden-scope-creep/final-pass.md');
const fixture = readFileSync(fixturePath, 'utf8');
const related = JSON.parse(readFileSync(path.resolve('benchmarks/fixtures/prd-hidden-scope-creep/related/challenge-report.json'), 'utf8'));

function variant(changeArtifact = () => {}, changeVisible = value => value) {
  const artifact = structuredClone(extractStructuredArtifact(fixture).artifact);
  changeArtifact(artifact);
  const visible = changeVisible(fixture.slice(0, fixture.indexOf('<!-- shipwright:artifact')));
  return `${visible}\n<!-- shipwright:artifact\n${JSON.stringify(artifact, null, 2)}\n-->\n`;
}

test('citation checks flag table claims and do not let an unrelated URL excuse a percentage', () => {
  const text = `# Market

| Metric | Value |
|---|---|
| ARR | $4M |

See https://example.com. Conversion was 62% last quarter.`;
  const result = validateArtifact(text);
  assert.ok(result.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  assert.ok(result.issues.some(issue => issue.type === IssueType.UNSUPPORTED_NUMERIC));
  assert.equal(result.valid, true);
  assert.ok(result.issues.every(issue => issue.severity === Severity.WARNING));
});

test('claims after the structured envelope still receive citation checks', () => {
  const result = validateArtifact(fixture + '\nARR was $4M. Conversion was 62%.\n');
  assert.ok(result.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  assert.ok(result.issues.some(issue => issue.type === IssueType.UNSUPPORTED_NUMERIC));
});

test('visible Decision Frame and approved status cannot be supplied by hidden JSON alone', () => {
  const text = variant(
    artifact => { artifact.metadata.status = 'approved'; },
    visible => visible.replace(/## Decision Frame[\s\S]*?## Unknowns & Evidence Gaps/,
      '## Decision Frame\n\nRecommendation: ship a limited rollout.\n\n## Unknowns & Evidence Gaps'),
  );
  const result = validateArtifact(text, { artifactType: 'prd', relatedArtifacts: [related] });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH));
  assert.ok(result.issues.some(issue => issue.type === IssueType.INVALID_STRUCTURED_ARTIFACT
    && issue.message.includes('approval_record')));
});

test('approval needs a traceable decision reference and named human', () => {
  const artifact = structuredClone(extractStructuredArtifact(fixture).artifact);
  artifact.metadata.status = 'approved';
  artifact.metadata.approval_record = {
    human_identity: 'PM', decision_ref: 'approved', decided_at: '2026-04-02T10:00:00Z',
  };
  let result = validateStructuredArtifact(artifact);
  assert.ok(result.errors.some(error => error.path.endsWith('human_identity')));
  assert.ok(result.errors.some(error => error.path.endsWith('decision_ref')));
  artifact.metadata.approval_record = {
    human_identity: 'Alex Chen', decision_ref: 'DEC-123', decided_at: '2026-04-02T10:00:00Z',
  };
  result = validateStructuredArtifact(artifact);
  assert.equal(result.errors.length, 0);
});

test('Light PRD records honest gaps without becoming a corrupt artifact', () => {
  const text = variant(
    artifact => {
      artifact.depth = 'light';
      artifact.pass_fail_readiness = { status: 'FAIL', reason: 'Analytics export is pending.' };
      artifact.payload.success_metrics[0].baseline = '[TBD, requires: analytics export]';
    },
    visible => visible.replace('| 42 | 65 |', '| [TBD, requires: analytics export] | 65 |')
      .replace('PASS because', 'FAIL because'),
  );
  const result = validateArtifact(text, { artifactType: 'prd' });
  assert.equal(result.valid, true);
  assert.equal(result.readiness.ready, false);
  assert.equal(result.readiness.engineeringReady, false);
  assert.ok(!result.issues.some(issue => issue.severity === Severity.ERROR));

  const directional = text.replace('"status": "FAIL"', '"status": "PASS"')
    .replace('FAIL because', 'PASS because');
  const pass = validateArtifact(directional, { artifactType: 'prd' });
  assert.equal(pass.valid, true);
  assert.equal(pass.readiness.ready, true);
  assert.equal(pass.readiness.engineeringReady, false);
});

test('visible unknown baseline contradicts fabricated JSON zero', () => {
  const text = variant(
    artifact => { artifact.payload.success_metrics[0].baseline = 0; },
    visible => visible.replace('| 42 | 65 |', '| [TBD, requires: analytics export] | 65 |'),
  );
  const result = validateArtifact(text, { artifactType: 'prd' });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
    && issue.message.includes('baseline')));
});

test('metric table binds baseline and target to their own columns and metric', () => {
  for (const row of [
    '| workflow handoff completion rate | mid-market support teams | 65 | 42 | percent | 30 days | (source: support-workflow-audit) |',
    '| workflow handoff completion rate | mid-market support teams | -42 | 65 | percent | 30 days | (source: support-workflow-audit) |',
  ]) {
    const text = variant(
      () => {},
      visible => visible.replace(/\| workflow handoff completion rate \|[^\n]+/, row),
    );
    const result = validateArtifact(text, { artifactType: 'prd' });
    assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
      && issue.message.includes('baseline')));
  }
});

test('metric IDs match complete labels rather than longer identifiers', () => {
  for (const [label, valid] of [
    ['M10: Abandonment', false], ['m1-other: Abandonment', false], ['m1_extra: Abandonment', false],
    ['M1: Activation', true], ['Activation (m1)', true], ['Activation', true],
  ]) {
    const text = variant(artifact => {
      const metric = artifact.payload.success_metrics[0];
      for (const entry of artifact.evidence) entry.supports = entry.supports.map(id => id === metric.metric_id ? 'm1' : id);
      metric.metric_id = 'm1';
      metric.name = 'Activation';
    }, visible => visible.replace('| workflow handoff completion rate |', '| ' + label + ' |'));
    assert.equal(validateArtifact(text).valid, valid, label);
  }
});

test('paraphrase is accepted but opposite recommendation is rejected', () => {
  const equivalent = variant(() => {}, visible => visible.replace(
    'Recommendation: Ship a limited workflow handoff release for support teams.',
    'Recommendation: Release the bounded support-team workflow handoff.',
  ));
  assert.ok(!validateArtifact(equivalent, { artifactType: 'prd' }).issues
    .some(issue => issue.message.includes('recommendation differs')));
  const opposite = variant(() => {}, visible => visible.replace(
    'Recommendation: Ship a limited workflow handoff release for support teams.',
    'Recommendation: Do not ship the limited workflow handoff release for support teams.',
  ));
  assert.ok(validateArtifact(opposite, { artifactType: 'prd' }).issues
    .some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH && issue.message.includes('recommendation')));
});

for (const [field, structured, visible] of [
  ['confidence', 'high', 'highly uncertain'],
  ['confidence', 'high', 'not high'],
  ['confidence', 'high', 'high not confirmed'],
  ['confidence', 'high', 'High is not warranted yet'],
  ['owner', 'Alex Kim', 'Alex Kimball'],
  ['decision_date', '2026-04-02', 'not 2026-04-02'],
]) {
  test(`visible ${field} rejects false agreement: ${visible}`, () => {
    const label = field === 'decision_date' ? 'Decision date' : field;
    const text = variant(artifact => { artifact.decision_frame[field] = structured; },
      markdown => markdown.replace(new RegExp(`^${label}:.*$`, 'im'), `${label}: ${visible}`));
    const result = validateArtifact(text);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
      && issue.message.includes(field)));
  });
}

test('visible exact owner/date and explained confidence retain case and formatting tolerance', () => {
  const text = variant(artifact => { artifact.decision_frame.owner = 'Alex Kim'; }, markdown => markdown
    .replace(/^Owner:.*$/m, '**Owner:** ALEX KIM')
    .replace(/^Decision date:.*$/m, '**Decision Date:** 2026-04-02')
    .replace(/^Confidence:.*$/m, '**Confidence:** High, based on the support workflow audit.'));
  assert.equal(validateArtifact(text).valid, true);
});

test('an agreeing confidence level may be explained with "no" or "not"', () => {
  for (const explained of ['High, because no segment-level baseline exists yet.',
    'High. Not all regions were sampled.', 'High (no blocking evidence gaps).']) {
    const text = variant(() => {}, markdown => markdown.replace(/^Confidence:.*$/m, `Confidence: ${explained}`));
    assert.equal(validateArtifact(text).valid, true, explained);
  }
});

test('an inline code span containing a comment opener does not hide later claims', () => {
  const text = 'Authors mark drafts with `<!--` markers.\n\nARR was $4M and conversion was 62% last quarter.\n';
  const types = validateArtifact(text).issues.map(issue => issue.type);
  assert.ok(types.includes(IssueType.UNSUPPORTED_DOLLAR));
  assert.ok(types.includes(IssueType.UNSUPPORTED_NUMERIC));
  const blockComment = validateArtifact('Intro.\n\n<!-- unfinished draft\nARR was $4M.\n');
  assert.ok(!blockComment.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  const laterCloser = validateArtifact(text + '\nFlow: signup --> activation.\n');
  assert.ok(laterCloser.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  const crlf = validateArtifact((text + '\nFlow: signup --> activation.\n').replace(/\n/g, '\r\n'));
  assert.ok(crlf.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  const inlineClosed = validateArtifact('A note <!-- hidden $4M --> ends here.\n');
  assert.ok(!inlineClosed.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  // The opener must not pair with the structured envelope's closer and hide a correct contract.
  const correct = variant(() => {}, visible => visible.replace('\n', '\nDrafts use `<!--` markers.\n'));
  assert.equal(validateArtifact(correct).valid, true);
});

test('indented text continues a list item or paragraph instead of becoming hidden code', () => {
  const claims = 'ARR was $4M and conversion was 62% last quarter.';
  for (const text of [`Findings:\n\n- Pricing\n\n    ${claims}\n`, `Findings:\n\n1. Pricing\n    ${claims}\n`,
    `Findings continue\n    ${claims}\n`]) {
    const types = validateArtifact(text).issues.map(issue => issue.type);
    assert.ok(types.includes(IssueType.UNSUPPORTED_DOLLAR), text);
  }
  const code = validateArtifact(`## Example\n\n    ${claims}\n\nDone.\n`).issues.map(issue => issue.type);
  assert.ok(!code.includes(IssueType.UNSUPPORTED_DOLLAR));
  const afterList = validateArtifact(`- Pricing\n\nClosing paragraph.\n\n    ${claims}\n`).issues.map(issue => issue.type);
  assert.ok(!afterList.includes(IssueType.UNSUPPORTED_DOLLAR));
});

test('a comment opener inside a fence is code, and a fence marker inside a comment is hidden', () => {
  const claims = 'ARR was $4M and conversion was 62% last quarter.\n';
  const example = 'Example:\n\n```html\n<!-- start a hidden note\n```\n\n';
  const types = validateArtifact(example + claims).issues.map(issue => issue.type);
  assert.ok(types.includes(IssueType.UNSUPPORTED_DOLLAR));
  const correct = variant(() => {}, visible => visible.replace('\n', '\n' + example));
  assert.equal(validateArtifact(correct).valid, true);
  const commentedFence = validateArtifact('<!-- draft\n```\n-->\n\n' + claims).issues.map(issue => issue.type);
  assert.ok(commentedFence.includes(IssueType.UNSUPPORTED_DOLLAR));
});

test('confidence compares the stated level before the explanation', () => {
  const text = variant(() => {}, markdown => markdown.replace(/^Confidence:.*$/m,
    'Confidence: low (high uncertainty).'));
  const result = validateArtifact(text);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
    && issue.message.includes('confidence')));
});

for (const [name, wrap] of [
  ['HTML comment', text => `<!-- hidden draft\n${text}\n-->`],
  ['backtick example', text => '```markdown\n' + text + '\n```'],
  ['tilde example', text => '~~~markdown\n' + text + '\n~~~'],
  ['list-nested example', text => '- Example:\n\n    ```markdown\n' + text + '\n    ```'],
  ['list-item fence', text => '- ```markdown\n' + text.replace(/^/gm, '  ') + '\n  ```'],
  ['indented code block', text => text.replace(/^(?=.)/gm, '    ')],
]) {
  test(`${name} cannot supply visible contract fields or engineering requirements`, () => {
    const hiddenContract = variant(() => {}, visible => wrap(visible)
      + '\n# No contract is visible\n');
    const result = validateArtifact(hiddenContract, { relatedArtifacts: [related] });
    assert.equal(result.valid, false);
    assert.equal(result.readiness.engineeringReady, false);
    assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH));
    const hiddenRequirements = variant(() => {}, visible => visible
      + '\n' + wrap('## Detailed Requirements\n\nSupport teams can trigger handoff.') + '\n');
    const requirements = validateArtifact(hiddenRequirements, { relatedArtifacts: [related] });
    assert.equal(requirements.valid, true);
    assert.equal(requirements.readiness.engineeringReady, false);
    assert.ok(requirements.readiness.engineeringReasons.some(reason => /Detailed requirements/.test(reason)));
    // Assert on the scanner itself, after a paragraph that closes any list, so this cannot pass by accident.
    const scanned = visibleMarkdown('Intro.\n\n' + wrap('## Detailed Requirements\n\nSupport teams can trigger handoff.')
      + '\n\nAfter.\n');
    assert.doesNotMatch(scanned, /Detailed Requirements|Support teams/);
    assert.match(scanned, /Intro\.[\s\S]*After\./);
  });
}

test('metric comparison separates numeric values from attached citations', () => {
  for (const cell of ['42 [1]', '42[1]', '42 [audit 2026](https://example.com/reports/2026)',
    '42 (source: audit-2026)', '[42](https://example.com/reports/2026)']) {
    const text = variant(() => {}, visible => visible.replace('| 42 | 65 |', `| ${cell} | 65 |`));
    assert.equal(validateArtifact(text).valid, true, cell);
  }
  for (const cell of ['142 [1]', '42 or 142 [1]', '[142](https://example.com/reports/2026)']) {
    const text = variant(() => {}, visible => visible.replace('| 42 | 65 |', `| ${cell} | 65 |`));
    assert.equal(validateArtifact(text).valid, false, cell);
  }
});

for (const column of ['Source', 'Citation', 'Reference']) {
  for (const protocol of ['http', 'https']) {
    test(`bare ${protocol} URL in ${column} sources only its table row`, () => {
      const result = validateArtifact(`| Plan | Price | ${column} |\n|---|---|---|\n| Pro | $49 | ${protocol}://example.com/pricing |\n| Enterprise | $99 | |`);
      const warnings = result.issues.filter(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR);
      assert.equal(warnings.length, 1);
      assert.match(warnings[0].excerpt, /\$99/);
    });
  }
}

test('bare URL in a Notes column does not source the price in another cell', () => {
  for (const extraSource of ['', ' | Source']) {
    const result = validateArtifact(`| Plan | Price | Notes${extraSource} |\n|---|---|---${extraSource ? '|---' : ''}|\n| Pro | $49 | https://example.com/pricing${extraSource ? ' | ' : ''} |`);
    assert.ok(result.issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR));
  }
});

test('case-study index describes reported outcomes without claiming verified proof', () => {
  const index = readFileSync(path.resolve('case-studies/README.md'), 'utf8');
  assert.match(index, /unverified/i);
  assert.match(index, /reported outcomes/i);
  assert.doesNotMatch(index, /\breal (?:problems|stakes|outcomes)\b|\bproof\b|\bproduction evidence\b/i);
});

test('Minor deferral remains informational while Critical deferral blocks readiness without a related report', () => {
  const minor = variant(artifact => {
    artifact.challenge_resolution = [{
      finding_id: 'minor-1', state: 'deferred', severity: 'minor',
      note: 'Awaiting optional documentation refresh.',
    }];
  });
  const minorResult = validateArtifact(minor, { artifactType: 'prd' });
  assert.equal(minorResult.valid, true);
  assert.equal(minorResult.readiness.ready, true);
  assert.ok(minorResult.issues.some(issue => issue.type === IssueType.CHALLENGE_FINDING_UNRESOLVED
    && issue.severity === Severity.INFO));

  const critical = variant(artifact => {
    artifact.challenge_resolution = [{
      finding_id: 'critical-1', state: 'deferred', severity: 'critical',
      note: 'Awaiting decision.',
    }];
  });
  const criticalResult = validateArtifact(critical, { artifactType: 'prd' });
  assert.equal(criticalResult.valid, true);
  assert.equal(criticalResult.readiness.ready, false);
});

test('waived Critical finding without human decision is invalid with or without related report', () => {
  const text = variant(artifact => {
    artifact.challenge_resolution = [{
      finding_id: 'finding-scope-creep', state: 'waived', severity: 'critical',
      note: 'Accept risk.', owner: 'PM', waiver_reason: 'approved',
    }];
  });
  for (const relatedArtifacts of [[], [related]]) {
    const result = validateArtifact(text, { artifactType: 'prd', relatedArtifacts });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some(issue => issue.type === IssueType.INVALID_STRUCTURED_ARTIFACT
      && issue.message.includes('human_decision')));
  }
});

test('CLI exit codes separate warning, invalid contract, and requested engineering readiness', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'shipwright-validation-'));
  try {
    const file = path.join(directory, 'artifact.md');
    const run = (...args) => spawnSync(process.execPath,
      [path.resolve('scripts/validate-artifact.mjs'), file, ...args], { encoding: 'utf8' });
    writeFileSync(file, '# Market\n\nARR was $4M.\n');
    assert.equal(run().status, 0);
    writeFileSync(file, fixture);
    const unready = run('--artifact-type', 'prd', '--require-ready');
    assert.equal(unready.status, 2);
    assert.match(unready.stdout, /NOT READY/);
    assert.match(unready.stdout, /Detailed requirements/);
    assert.match(unready.stdout, /Related challenge report/);
    assert.doesNotMatch(unready.stdout, /^OK:/m);
    writeFileSync(file, variant(artifact => { artifact.metadata.status = 'approved'; }));
    assert.equal(run('--artifact-type', 'prd').status, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('malformed resolution shapes yield schema errors instead of throwing', () => {
  const artifact = structuredClone(extractStructuredArtifact(fixture).artifact);
  for (const malformed of [{}, [null], [{ finding_id: 'x', state: 'waived', note: 'x', waiver_reason: 7 }]]) {
    artifact.challenge_resolution = malformed;
    assert.doesNotThrow(() => validateStructuredArtifact(artifact));
    assert.ok(validateStructuredArtifact(artifact).errors.length > 0);
  }
});

for (const [scenario, collection] of [
  ['prd-hidden-scope-creep', 'success_metrics'],
  ['board-update-ambiguity', 'bets'],
]) {
  test(`malformed ${collection} entries return contract errors and unready results`, () => {
    const original = readFileSync(path.resolve(`benchmarks/fixtures/${scenario}/final-pass.md`), 'utf8');
    const artifact = extractStructuredArtifact(original).artifact;
    for (const entry of [null, false, 7, 'invalid', []]) {
      artifact.payload[collection] = [entry];
      const text = original.slice(0, original.indexOf('<!-- shipwright:artifact'))
        + `<!-- shipwright:artifact\n${JSON.stringify(artifact)}\n-->`;
      const result = validateArtifact(text);
      assert.equal(result.valid, false);
      assert.equal(result.readiness.ready, false);
      assert.equal(result.readiness.engineeringReady, false);
      assert.ok(result.issues.some(issue => issue.type === IssueType.INVALID_STRUCTURED_ARTIFACT
        && issue.message.includes(`payload.${collection}[0]`)));
    }
  });
}

test('numeric strings and timeframe cells cannot match a different value by substring', () => {
  for (const [field, value, from, to] of [
    ['baseline', '65', '| 42 | 65 |', '| 165 | 65 |'],
    ['timeframe', '30 days', '| 30 days |', '| 130 days |'],
  ]) {
    const text = variant(artifact => { artifact.payload.success_metrics[0][field] = value; },
      visible => visible.replace(from, to));
    assert.ok(validateArtifact(text).issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
      && issue.message.includes(field)));
  }
});

test('visible FAIL cannot be excused by mentioning an earlier PASS in its explanation', () => {
  const text = variant(() => {}, visible => visible.replace(
    'PASS because the critical scope finding has been resolved',
    'FAIL because a prior PASS claim has unresolved scope'));
  const result = validateArtifact(text);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some(issue => issue.type === IssueType.PROSE_JSON_MISMATCH
    && issue.message.includes('Pass/Fail Readiness')));
});

test('a traceable waiver still requires its owner without a related report', () => {
  const artifact = structuredClone(extractStructuredArtifact(fixture).artifact);
  artifact.challenge_resolution = [{ finding_id: 'minor-1', state: 'waived', severity: 'minor',
    note: 'Recorded risk acceptance.', waiver_reason: 'Accept the documentation delay.',
    human_decision: { human_identity: 'Alex Chen', decision_ref: 'DEC-123', decided_at: '2026-04-02T10:00:00Z' } }];
  assert.ok(validateStructuredArtifact(artifact).errors.some(error => error.path.endsWith('.owner')));
});

test('engineering readiness requires the matching review and rejects colliding finding IDs', () => {
  const withRequirements = fixture.replace('## Unknowns & Evidence Gaps',
    '## Detailed Requirements\n\nSupport teams can trigger handoff and view the shared audit trail; manager routing stays out of scope.\n\n## Unknowns & Evidence Gaps');
  const unrelated = structuredClone(related);
  unrelated.payload.findings = [];
  const result = validateArtifact(withRequirements, { relatedArtifacts: [unrelated] });
  assert.equal(result.readiness.engineeringReady, false);
  assert.ok(result.readiness.engineeringReasons.some(reason => reason.includes('finding-scope-creep')));
  const collision = validateArtifact(withRequirements, { relatedArtifacts: [related, structuredClone(related)] });
  assert.equal(collision.valid, false);
  assert.ok(collision.issues.some(issue => issue.type === IssueType.INVALID_RELATED_ARTIFACT));
  const ready = validateArtifact(withRequirements, { relatedArtifacts: [related] });
  assert.equal(ready.valid, true, JSON.stringify(ready.issues));
  assert.equal(ready.readiness.engineeringReady, true, JSON.stringify(ready.readiness));
});

test('Light strategy cannot inherit the directional PRD exception for unknown measurements', () => {
  const strategy = readFileSync(path.resolve('benchmarks/fixtures/board-update-ambiguity/final-pass.md'), 'utf8');
  const text = strategy.replace('"baseline": 105', '"baseline": "[TBD, requires: analytics]"');
  assert.notEqual(text, strategy);
  const result = validateArtifact(text, { artifactType: 'strategy' });
  assert.equal(result.valid, true);
  assert.equal(result.readiness.ready, false);
  assert.equal(result.readiness.engineeringReady, false);
  assert.ok(result.issues.some(issue => issue.type === IssueType.READINESS_FAILED));
});

test('a fence closes only at a closer within three columns of its container', () => {
  const inside = visibleMarkdown('```markdown\n    ```\nOwner: Example\n```\n\nAfter.\n');
  assert.doesNotMatch(inside, /Owner/);
  assert.match(inside, /After\./);
  const nested = visibleMarkdown('- Example:\n\n    ```\n    code line\n    ```\n\nAfter.\n');
  assert.doesNotMatch(nested, /code line/);
  assert.match(nested, /After\./);
});

test('a heading or thematic break ends a list before indented code', () => {
  for (const separator of ['## Next\n\n', '\n* * *\n\n']) {
    const scanned = visibleMarkdown('- item\n' + separator + '    Owner: hidden example\n\nAfter.\n');
    assert.doesNotMatch(scanned, /hidden example/, separator);
    assert.match(scanned, /After\./);
  }
});

test('an inline triple-backtick span does not suppress later citation checks', () => {
  for (const opener of ['```x``` is the flag.', '```js`x is literal.']) {
    const types = validateArtifact(`${opener}\n\nRevenue was $5M last year.\n`).issues.map(issue => issue.type);
    assert.ok(types.includes(IssueType.UNSUPPORTED_DOLLAR), opener);
  }
});

test('a visible requirements heading may be indented up to three spaces', () => {
  for (const indent of ['', '   ']) {
    const text = variant(() => {}, visible => visible
      + `\n${indent}## Detailed Requirements\n\nSupport teams can trigger handoff.\n`);
    const result = validateArtifact(text, { relatedArtifacts: [related] });
    assert.ok(!result.readiness.engineeringReasons.some(reason => /Detailed requirements/.test(reason)), JSON.stringify(indent));
  }
});

test('the packaged escape for an arrow in envelope JSON produces a valid artifact', () => {
  const doc = readFileSync(path.resolve('docs/structured-artifacts.md'), 'utf8');
  const escape = doc.match(/escape it inside a string as `([^`]+)`/)?.[1];
  assert.ok(escape && !escape.includes('>'), escape);
  const artifact = structuredClone(extractStructuredArtifact(fixture).artifact);
  artifact.decision_frame.revisit_trigger += ' (signup ARROW activation)';
  const json = JSON.stringify(artifact, null, 2).replace('ARROW', escape);
  const text = `${fixture.slice(0, fixture.indexOf('<!-- shipwright:artifact'))}<!-- shipwright:artifact\n${json}\n-->\n`;
  assert.match(extractStructuredArtifact(text).artifact.decision_frame.revisit_trigger, /signup --> activation/);
  assert.equal(validateArtifact(text).valid, true);
});

test('a fenced example of the envelope is documentation, not a second envelope', () => {
  const example = '\nExample envelope:\n\n```text\n<!-- shipwright:artifact\n{ "example": true }\n-->\n```\n\n';
  const withExample = fixture.replace('\n', '\n' + example);
  assert.equal(validateArtifact(withExample).valid, true);
  assert.equal(extractStructuredArtifact(withExample).artifact.artifact_type, 'prd');
  const duplicate = fixture + fixture.slice(fixture.indexOf('<!-- shipwright:artifact'));
  assert.equal(validateArtifact(duplicate).valid, false);
});

test('the validator CLI accepts the path before or after flags with values', () => {
  for (const args of [['--artifact-type', 'prd', fixturePath], [fixturePath, '--artifact-type', 'prd'],
    ['--format', 'json', fixturePath]]) {
    const run = spawnSync(process.execPath, [path.resolve('scripts/validate-artifact.mjs'), ...args], { encoding: 'utf8' });
    assert.equal(run.status, 0, args.join(' ') + run.stderr + run.stdout);
  }
});

test('code examples before the envelope never hide it from contract checks', () => {
  const contradiction = fixture.replace(/^Confidence:.*$/m, 'Confidence: low.');
  const directory = mkdtempSync(path.join(tmpdir(), 'shipwright-envelope-'));
  try {
    for (const [name, example] of [
      ['comment with a fence marker', '<!-- draft\n```\n-->\n'],
      ['indented closer inside a fence', '```markdown\n    ```\nstill code\n```\n'],
      ['indented code line', 'Intro.\n\n    ```\n\nAfter.\n'],
    ]) {
      const correct = fixture.replace('\n', '\n\n' + example + '\n');
      assert.equal(extractStructuredArtifact(correct).artifact?.artifact_type, 'prd', name);
      assert.equal(validateArtifact(correct, { expectStructured: true }).valid, true, name);
      // The default CLI must still see the contract and fail a contradiction.
      const file = path.join(directory, 'artifact.md');
      writeFileSync(file, contradiction.replace('\n', '\n\n' + example + '\n'));
      const run = spawnSync(process.execPath, [path.resolve('scripts/validate-artifact.mjs'), file], { encoding: 'utf8' });
      assert.equal(run.status, 1, name + run.stdout);
      assert.match(run.stdout, /prose-json-mismatch/, name);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('an envelope found only inside a code example is reported, not silently skipped', () => {
  const envelope = fixture.slice(fixture.indexOf('<!-- shipwright:artifact'));
  const text = `# Notes\n\n\`\`\`markdown\n${envelope}\`\`\`\n`;
  const result = validateArtifact(text);
  assert.equal(result.valid, true);
  assert.ok(result.issues.some(issue => issue.type === IssueType.MISSING_STRUCTURED_ARTIFACT
    && issue.severity === Severity.WARNING));
  assert.ok(!validateArtifact(fixture).issues.some(issue => issue.type === IssueType.MISSING_STRUCTURED_ARTIFACT));
});

test('a heading or break inside a list item keeps the item text visible', () => {
  for (const nested of ['  ## Detail', '  ***']) {
    const text = `Intro.\n\n- Findings\n\n${nested}\n\n    ARR was $4M in 2025.\n`;
    assert.match(visibleMarkdown(text), /ARR was \$4M/, nested);
    assert.ok(validateArtifact(text).issues.some(issue => issue.type === IssueType.UNSUPPORTED_DOLLAR), nested);
  }
});

test('user-facing decision explanations contain no em dash', () => {
  const source = readFileSync(path.resolve('scripts/orchestrate.mjs'), 'utf8');
  const code = source.split('\n').filter(line => !/^\s*(?:\/\/|\*|\/\*)/.test(line));
  assert.deepEqual(code.filter(line => line.includes('—')), []);
});
