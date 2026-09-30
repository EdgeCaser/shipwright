import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { extractStructuredArtifact, validateStructuredArtifact } from '../scripts/extract-structured-artifact.mjs';
import { IssueType, Severity, validateArtifact } from '../scripts/validate-artifact.mjs';

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
