import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, rm, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROMPTS, LIVE_ENV_VAR, main, gradeTranscript, buildPlan, agentCommand } from '../scripts/live-acceptance.mjs';
import { temporaryDirectory } from './helpers/temp-dirs.mjs';

const EM_DASH = String.fromCharCode(0x2014);
const scriptPath = fileURLToPath(new URL('../scripts/live-acceptance.mjs', import.meta.url));

const CLOSING = `
## Decision Frame
Recommendation: proceed with the smaller scope.
## Unknowns & Evidence Gaps
Admin demand is unmeasured.
## Pass/Fail Readiness
PASS: draft is reviewable.
## Recommended Next Artifact
A pricing analysis.
`;
const DECISION = `
RECOMMENDATION
Do not proceed yet.
CONFIDENCE
medium
NEEDS_HUMAN_REVIEW
yes, integration risk
SUMMARY
Overlap is high and integration cost is unknown.
KEY_REASONING
- Customer overlap is 60 percent.
`;

function prdArtifact() {
  return {
    schema_version: '2.0.0', artifact_type: 'prd', mode: 'fast', depth: 'standard',
    metadata: { title: 'Self-serve SSO PRD', status: 'draft', authors: ['PM'], updated_at: '2026-04-02' },
    decision_frame: { recommendation: 'Ship SSO first', tradeoff: 'Narrower scope vs broader coverage', confidence: 'medium', owner: 'PM', decision_date: '2026-04-02', revisit_trigger: 'New customer evidence changes the recommendation.' },
    unknowns: ['Unknown admin demand'],
    pass_fail_readiness: { status: 'PASS', reason: 'Core sections are present.' },
    evidence: [{ evidence_id: 'ev-1', kind: 'research', source_ref: 'customer-interviews', confidence: 'high', supports: ['decision_frame.recommendation', 'problem-1', 'metric-activation'] }],
    payload: {
      problem_statement: { problem_id: 'problem-1', text: 'Admins churn when SSO is missing.' },
      customer_evidence_ids: ['ev-1'],
      success_metrics: [{ metric_id: 'metric-activation', name: 'Activation Rate', segment: 'mid-market', unit: '%', timeframe: 'quarterly', baseline: 12, target: 20, evidence_ids: ['ev-1'] }],
      scope: { in: ['SAML login'], out: ['SCIM provisioning'] },
      open_questions: ['Which IdPs matter most?'],
      target_segment: 'mid-market',
    },
  };
}

const prdTranscript = () => `# Self-serve SSO PRD

## Problem
Admins churn when SSO is missing.

## Goals & Success Metrics

| Metric | Segment | Baseline | Target | Unit | Timeframe | Source |
|---|---|---|---|---|---|---|
| Activation Rate | mid-market | 12 | 20 | % | quarterly | (source: customer-interviews) |

## Scope
In scope: SAML login. Out of scope: SCIM provisioning.

## Decision Frame

Recommendation: Ship SSO first
Tradeoff: Narrower scope vs broader coverage
Confidence: medium
Owner: PM
Decision date: 2026-04-02
Revisit trigger: New customer evidence changes the recommendation.

## Unknowns & Evidence Gaps
Admin demand is unmeasured.

## Pass/Fail Readiness

PASS: Core sections are present.

## Recommended Next Artifact
A launch plan.

<!-- shipwright:artifact
${JSON.stringify(prdArtifact(), null, 2)}
-->
`;

const GOOD = {
  'market-sizing': `TAM is 9,000 firms, SAM is 2,400 and SOM is 60 in year two. Assumptions: 8 percent yearly win rate, stated in the sizing table.\n${CLOSING}`,
  'pricing-framework': `Price the team plan around a per-seat value metric with two tiers. Willingness to pay comes from interviews.\n${CLOSING}`,
  'prd-draft': `# PRD: SSO\n## Problem\nAdmins need SSO.\n## Success Metrics\nActivation moves from 12 to 20 percent.\n## Scope\nOut of scope: SCIM.\n${CLOSING}`,
  'competitive-landscape': `The main competitors are A, B and C. The gap is freelancer-first positioning.\n${CLOSING}`,
  'governance-decision': `Scenario class: governance.\n${DECISION}\n${CLOSING}\nThis class benefits from a stress-test. Want me to argue the opposing position?`,
  'pricing-decision': `Scenario class: pricing.\n${DECISION}\n${CLOSING}`,
  'build-vs-buy-decision': `Scenario class: product_strategy.\n${DECISION}\n${CLOSING}`,
  'ambiguous-pricing-decision': 'Tell me whether this is a price change or a build-or-buy choice. That detail lets me classify the decision.',
  'coding-question': 'Here is a debounce:\n```js\nfunction debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }\n```\nclearTimeout cancels the pending call so only the last one fires.',
  'structured-prd-artifact': prdTranscript(),
};

async function writeTranscripts(dir, overrides = {}) {
  for (const entry of PROMPTS) {
    const text = entry.id in overrides ? overrides[entry.id] : GOOD[entry.id];
    if (text !== null) await writeFile(path.join(dir, `${entry.id}.md`), text);
  }
}

test('prompt set has 8 to 12 unique, well-formed prompts', () => {
  assert.ok(PROMPTS.length >= 8 && PROMPTS.length <= 12, `count ${PROMPTS.length}`);
  assert.equal(new Set(PROMPTS.map(entry => entry.id)).size, PROMPTS.length);
  for (const entry of PROMPTS) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.ok(entry.prompt.length > 20);
    assert.doesNotMatch(entry.prompt, /["$`\\]/, `${entry.id} must be safe inside a double-quoted shell argument`);
    assert.ok((entry.has?.length || 0) + (entry.forbid?.length || 0) + (entry.closing ? 1 : 0) + (entry.validator ? 1 : 0) >= 1, `${entry.id} has a pass condition`);
    assert.ok(entry.prompt.indexOf(EM_DASH) < 0);
  }
  assert.deepEqual(Object.keys(GOOD).sort(), PROMPTS.map(entry => entry.id).sort());
});

test('plan prints both agent commands for every prompt and executes nothing', async () => {
  for (const agent of ['claude', 'codex']) {
    const plan = buildPlan({ agent, workdir: '/scratch/wd' });
    for (const entry of PROMPTS) assert.ok(plan.includes(`${entry.id}.md`), `${agent} plan lists ${entry.id}`);
    assert.ok(plan.includes(agent === 'claude' ? 'claude -p "' : 'codex exec "'));
    assert.ok(plan.includes('install.mjs'));
    assert.equal(plan.indexOf(EM_DASH), -1);
  }
  const result = await main(['--plan', '--agent', 'codex'], {});
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Nothing below has been run/);
  assert.throws(() => agentCommand('other', 'x'));
  assert.equal((await main(['--agent', 'other'], {})).code, 2);
});

test('--check passes synthetic good transcripts', async () => {
  const dir = await temporaryDirectory('shipwright-live-good-');
  await writeTranscripts(dir);
  const result = await main(['--check', dir], {});
  assert.equal(result.code, 0, result.stdout);
  assert.match(result.stdout, new RegExp(`${PROMPTS.length}/${PROMPTS.length} passed`));
  await rm(dir, { recursive: true, force: true });
});

test('--check fails with a clear reason for a missing closing block', async () => {
  const dir = await temporaryDirectory('shipwright-live-closing-');
  await writeTranscripts(dir, { 'pricing-framework': GOOD['pricing-framework'].replace('Recommended Next Artifact', 'Next') });
  const result = await main(['--check', dir], {});
  assert.equal(result.code, 1);
  assert.match(result.stdout, /pricing-framework\s+FAIL\s+missing closing block: Recommended Next Artifact/);
  await rm(dir, { recursive: true, force: true });
});

test('--check fails when an em dash is present', async () => {
  const dir = await temporaryDirectory('shipwright-live-dash-');
  await writeTranscripts(dir, { 'market-sizing': GOOD['market-sizing'] + `\nA point ${EM_DASH} made.` });
  const result = await main(['--check', dir], {});
  assert.equal(result.code, 1);
  assert.match(result.stdout, /market-sizing\s+FAIL\s+em dash present/);
  await rm(dir, { recursive: true, force: true });
});

test('--check fails for a missing transcript and an unreadable directory', async () => {
  const dir = await temporaryDirectory('shipwright-live-missing-');
  await writeTranscripts(dir, { 'coding-question': null });
  const result = await main(['--check', dir], {});
  assert.equal(result.code, 1);
  assert.match(result.stdout, /coding-question\s+FAIL\s+missing transcript coding-question\.md/);
  assert.equal((await main(['--check', path.join(dir, 'nope')], {})).code, 1);
  await rm(dir, { recursive: true, force: true });
});

test('grading catches behavior failures and validator failures', () => {
  const byId = id => PROMPTS.find(entry => entry.id === id);
  assert.match(gradeTranscript(byId('governance-decision'), GOOD['governance-decision'].replace('stress-test', 'review')).failures.join(), /stress-test offer/);
  assert.match(gradeTranscript(byId('ambiguous-pricing-decision'), `RECOMMENDATION\nGo.\nprice change build-or-buy`).failures.join(), /no verdict issued/);
  assert.match(gradeTranscript(byId('coding-question'), GOOD['coding-question'] + '\n## Decision Frame').failures.join(), /Decision Frame/);
  const broken = GOOD['structured-prd-artifact'].replace('"schema_version": "2.0.0"', ',, "schema_version": "2.0.0"');
  assert.match(gradeTranscript(byId('structured-prd-artifact'), broken).failures.join(), /validator failed/);
  assert.equal(gradeTranscript(byId('structured-prd-artifact'), GOOD['structured-prd-artifact']).pass, true);
});

test('--live refuses without the env var and only points at the operator with it', async () => {
  const refused = await main(['--live'], {});
  assert.notEqual(refused.code, 0);
  assert.match(refused.stderr, new RegExp(LIVE_ENV_VAR));
  const wrong = await main(['--live'], { [LIVE_ENV_VAR]: '0' });
  assert.notEqual(wrong.code, 0);
  const ack = await main(['--live'], { [LIVE_ENV_VAR]: '1' });
  assert.equal(ack.code, 0);
  assert.match(ack.stdout, /operator/);
});

test('--live exits non-zero from the command line without the env var', async () => {
  const { execFileSync } = await import('node:child_process');
  const env = { ...process.env };
  delete env[LIVE_ENV_VAR];
  assert.throws(() => execFileSync(process.execPath, [scriptPath, '--live'], { env, stdio: 'pipe' }), error => error.status !== 0);
});

test('--prepare installs into a disposable directory and refuses a non-empty workdir', async () => {
  const before = (await readdir(os.tmpdir())).filter(name => name.startsWith('shipwright-live-'));
  const dir = await temporaryDirectory('shipwright-live-prepare-');
  const installed = await main(['--prepare', '--workdir', dir], {});
  assert.equal(installed.code, 0, installed.stderr);
  assert.ok((await readdir(dir)).includes('.shipwright-install.json'));
  const again = await main(['--prepare', '--workdir', dir], {});
  assert.equal(again.code, 1);
  assert.match(again.stderr, /not empty/);
  const auto = await main(['--prepare'], {});
  assert.equal(auto.code, 0, auto.stderr);
  await rm(dir, { recursive: true, force: true });
  const after = (await readdir(os.tmpdir())).filter(name => name.startsWith('shipwright-live-'));
  assert.deepEqual(after, before);
});

test('the script never spawns an agent and stays out of benchmarks', async () => {
  const source = await readFile(scriptPath, 'utf8');
  assert.doesNotMatch(source, /child_process|\bspawn|\bexecFile|\bexecSync|\bfork\(/);
  assert.doesNotMatch(source, /benchmarks[\\/]/);
  assert.equal(source.indexOf(EM_DASH), -1);
});

test('operator guide lists every prompt id and has no em dash', async () => {
  const guide = await readFile(fileURLToPath(new URL('../docs/live-acceptance.md', import.meta.url)), 'utf8');
  for (const entry of PROMPTS) assert.ok(guide.includes(`\`${entry.id}\``), entry.id);
  assert.equal(guide.indexOf(EM_DASH), -1);
});
