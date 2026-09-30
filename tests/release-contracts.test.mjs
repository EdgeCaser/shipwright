import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm, mkdir, cp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { extractStructuredArtifact, validateStructuredArtifact } from '../scripts/extract-structured-artifact.mjs';
import { validateArtifact, IssueType } from '../scripts/validate-artifact.mjs';
import { routeRequest } from '../scripts/route-request.mjs';
import { runFastAnalysis, validateFastAnalysis } from '../scripts/run-fast-analysis.mjs';
import { computeBlindRatingFromRaters } from '../scripts/blind-review-utils.mjs';
import { buildBenchmarkSuiteSummary, validateBenchmarkSuiteSummary, runBenchmarkSuite } from '../scripts/run-benchmarks.mjs';
import { buildPlugin, pluginFiles, SOURCE_ROOT } from '../scripts/build-plugin.mjs';
import { installShipwright } from '../scripts/install.mjs';
import { validateRepository } from '../scripts/validate-repository.mjs';
import { executeFollowUpAction } from '../scripts/follow-up-actions.mjs';
import { createSession } from '../scripts/session-store.mjs';

const wrap = value => `<!-- shipwright:artifact\n${JSON.stringify(value)}\n-->`;
const fixture = async () => extractStructuredArtifact(await readFile(path.join(SOURCE_ROOT, 'benchmarks/fixtures/prd-hidden-scope-creep/final-pass.md'), 'utf8')).artifact;
const has = (result, type) => result.issues.some(issue => issue.type === type);
async function temporary(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-contract-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

for (const value of [null, [], 12, true, 'hello']) {
  test(`structured envelopes reject ${JSON.stringify(value)}`, () => {
    assert.ok(extractStructuredArtifact(wrap(value)).error);
  });
}
test('duplicate and unterminated envelopes fail even after a valid one', () => {
  assert.ok(extractStructuredArtifact(wrap({}) + wrap({})).error);
  assert.ok(extractStructuredArtifact('<!-- shipwright:artifact\n{}').error);
  assert.ok(extractStructuredArtifact(wrap({}) + '\n<!-- shipwright:artifact\n{}').error);
});
test('typed consumers require a payload even without expectStructured', () => {
  assert.ok(has(validateArtifact('# Draft', { artifactType: 'prd' }), IssueType.MISSING_STRUCTURED_ARTIFACT));
});
test('schema-invalid nested arrays return issues instead of crashing', async () => {
  for (const field of ['success_metrics', 'customer_evidence_ids']) {
    const artifact = await fixture(); artifact.payload[field] = {};
    assert.ok(has(validateArtifact(wrap(artifact)), IssueType.INVALID_STRUCTURED_ARTIFACT));
  }
});
test('blank contract fields and absent metric baselines are rejected', async () => {
  const artifact = await fixture(); artifact.decision_frame.revisit_trigger = '   ';
  delete artifact.payload.success_metrics[0].baseline;
  const { errors } = validateStructuredArtifact(artifact);
  assert.ok(errors.some(e => e.path.endsWith('revisit_trigger')));
  assert.ok(errors.some(e => e.path.endsWith('baseline')));
});
test('evidence references reject duplicates, dangling IDs and assumptions as factual support', async () => {
  const artifact = await fixture();
  artifact.evidence.push(structuredClone(artifact.evidence[0]));
  artifact.payload.customer_evidence_ids.push('missing-reference');
  artifact.evidence.forEach(e => { e.kind = 'assumption'; });
  const { issues } = validateArtifact(wrap(artifact));
  for (const fragment of ['Duplicate evidence ID', 'Unknown evidence ID', 'Missing evidence linkage']) {
    assert.ok(issues.some(e => e.message.includes(fragment)), fragment);
  }
});
test('FAIL is not downstream readiness and malformed related artifacts cannot bypass checks', async () => {
  const artifact = await fixture(); artifact.pass_fail_readiness.status = 'FAIL';
  const result = validateArtifact(wrap(artifact), { relatedArtifacts: [{ artifact_type: 'strategy', payload: null }] });
  assert.ok(has(result, IssueType.READINESS_FAILED));
  assert.ok(has(result, IssueType.INVALID_RELATED_ARTIFACT));
});
test('critical findings require ESCALATE and finding IDs are unique', async () => {
  const artifact = JSON.parse(await readFile(path.join(SOURCE_ROOT, 'benchmarks/fixtures/handoff-contradiction/related/challenge-report.json'), 'utf8'));
  artifact.payload.verdict = 'CLEAR';
  artifact.payload.findings[0].severity = 'critical';
  artifact.payload.findings.push(structuredClone(artifact.payload.findings[0]));
  const result = validateArtifact(wrap(artifact));
  assert.ok(result.issues.some(e => e.message.includes('require the ESCALATE')));
  assert.ok(result.issues.some(e => e.message.includes('Duplicate finding_id')));
});
for (const heading of ['Sources', 'References', 'Evidence']) {
  test(`${heading} cannot hide a short, unlinked quantitative claim`, () => {
    assert.ok(has(validateArtifact(`Revenue is $4M.\n\n## ${heading}\n\nhttps://example.com`), IssueType.UNSUPPORTED_DOLLAR));
  });
}

test('every workflow supports explicit plain and namespaced commands', async () => {
  const manifest = JSON.parse(await readFile(path.join(SOURCE_ROOT, 'manifest.json'), 'utf8'));
  for (const route of Object.keys(manifest.routing)) {
    for (const prefix of ['/', '/shipwright:']) {
      assert.equal(routeRequest(`${prefix}${route} Should we acquire a competitor?`).topRoute?.route, route);
    }
  }
});
for (const [question, scenarioClass] of [
  ['Should we restructure the board?', 'governance'], ['Should we acquire Acme?', 'governance'],
  ['Should we go public?', 'publication'], ['Should we sunset this product?', 'product_strategy'],
  ['Should we raise our prices?', 'pricing'],
]) {
  test(`decision route: ${question}`, () => {
    const result = routeRequest(question);
    assert.equal(result.topRoute.route, 'decision-analysis'); assert.equal(result.decisionClass, scenarioClass);
  });
}
test('acquisition research is not automatically a decision analysis', () => {
  assert.equal(routeRequest('Competitive landscape of recent acquisitions').topRoute.route, 'competitive');
});

const validAnalysis = (run = 'r', scenario = 's') => ({ run_id: run, scenario_id: scenario,
  recommendation: 'Collect customer evidence first.', confidence_band: 'high', needs_human_review: false,
  summary: 'The supplied data supports a narrow next step.', key_reasoning: ['The scope is bounded.', 'Evidence is traceable.'] });
test('uncertain and human-review analyses require actionable uncertainty fields', () => {
  for (const change of [{ confidence_band: 'medium' }, { needs_human_review: true }]) {
    assert.ok(validateFastAnalysis({ ...validAnalysis(), ...change }, 's', 'r').some(e => e.includes('uncertainty_payload')));
  }
});
test('runner honors custom commands, includes context, and rejects nonzero exit despite valid JSON', async t => {
  const dir = await temporary(t);
  const scenario = path.join(dir, 's.json');
  await writeFile(path.join(dir, 'evidence.txt'), 'Cohort evidence marker');
  await writeFile(scenario, JSON.stringify({ id: 's', inputs: { prompt: 'Should we proceed?', context_files: ['evidence.txt'] } }));
  await assert.rejects(runFastAnalysis({ scenario, runId: 'r', outDir: dir, agentId: 'claude', agentCommand: 'custom-command',
    turnRunner: async options => {
      assert.equal(options.command, 'custom-command');
      assert.ok(options.prompt.includes('Cohort evidence marker'));
      return { stdout: JSON.stringify(validAnalysis()), exitCode: 2 };
    },
  }), /exited with code 2/);
});
test('gather evidence with no new data produces a brief without re-running a model', async t => {
  const dir = await temporary(t);
  const session = await createSession({ question: 'Should we proceed?', scenario_id: 's', scenario_class: 'pricing', sessions_root: dir });
  const result = await executeFollowUpAction(session, 'gather_more_evidence', {
    sessions_root: dir, fast_turn_runner: () => { throw new Error('Should not run'); },
  });
  assert.equal(result.mode, 'brief_generated');
});
test('blind reviewers must be distinct identities', () => {
  assert.throws(() => computeBlindRatingFromRaters([{ rater_id: 'a' }, { rater_id: 'a' }, { rater_id: 'b' }], 'first_pass'), /distinct/);
});
test('benchmark summaries reject stale aggregate values', () => {
  const summary = buildBenchmarkSuiteSummary(); summary.status_counts.PASS = 100;
  assert.throws(() => validateBenchmarkSuiteSummary(summary), /status_counts/);
});
test('unknown benchmark IDs fail instead of producing an empty or partial success', async () => {
  await assert.rejects(runBenchmarkSuite({ scenarioIds: ['does-not-exist'] }), /[Uu]nknown/);
});

test('release allowlist flattens all skills and includes their local dependencies', async t => {
  const dir = await temporary(t); const output = path.join(dir, 'bundle');
  const result = await buildPlugin(output);
  assert.equal(result.skills, 48);
  const files = await pluginFiles();
  assert.ok(files.has('.codex-plugin/plugin.json'));
  for (const forbidden of ['.env', '.git/', 'benchmarks/results/', 'benchmarks/telemetry/', 'node_modules/']) {
    assert.ok([...files.keys()].every(file => !file.startsWith(forbidden)));
  }
  for (const [file, content] of files) {
    if (!/\.mjs$/.test(file)) continue;
    for (const match of content.toString().matchAll(/from ['"]\.\/([^'"]+)['"]/g)) {
      assert.ok(files.has(`scripts/${match[1]}`), `${file} dependency ${match[1]}`);
    }
  }
  const installedValidator = await import(pathToFileURL(path.join(output, 'scripts/validate-artifact.mjs')));
  assert.equal(installedValidator.validateArtifact(wrap(await fixture())).issues.filter(i => i.severity === 'error').length, 0);
  await assert.rejects(buildPlugin(output), /new directory/);
});
test('installer preserves root instructions and local additions, and blocks modified-file overwrite atomically', async t => {
  const dir = await temporary(t);
  await writeFile(path.join(dir, 'AGENTS.md'), 'Existing project instructions');
  await mkdir(path.join(dir, '.codex/skills/local'), { recursive: true });
  await writeFile(path.join(dir, '.codex/skills/local/SKILL.md'), 'Local skill');
  await installShipwright(dir, { apply: true });
  assert.equal((await installShipwright(dir)).changes.length, 0);
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), 'Existing project instructions');
  assert.equal(await readFile(path.join(dir, '.codex/skills/local/SKILL.md'), 'utf8'), 'Local skill');
  const owned = path.join(dir, '.codex/docs/output-standard.md');
  await writeFile(owned, 'User customizations');
  await assert.rejects(installShipwright(dir, { apply: true }), /no files changed/);
  assert.equal(await readFile(owned, 'utf8'), 'User customizations');
});
test('installer refuses to claim pre-existing unowned files', async t => {
  const dir = await temporary(t);
  await mkdir(path.join(dir, '.claude/docs'), { recursive: true });
  await writeFile(path.join(dir, '.claude/docs/output-standard.md'), 'Existing unrelated file');
  await assert.rejects(installShipwright(dir, { apply: true }), /Installation conflicts/);
  await assert.rejects(readFile(path.join(dir, '.shipwright-install.json')), { code: 'ENOENT' });
});
test('repository validator detects broken handoffs and registrations', async t => {
  const dir = await temporary(t);
  for (const source of ['skills', 'commands', 'agents', 'docs', 'evals', 'examples/golden-outputs', '.claude-plugin', 'manifest.json']) {
    await cp(path.join(SOURCE_ROOT, source), path.join(dir, source), { recursive: true });
  }
  assert.deepEqual((await validateRepository(dir)).errors, []);
  const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
  manifest.version = '0.0.0'; manifest.routing['tech-handoff'].agent = 'discovery-researcher';
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  const errors = (await validateRepository(dir)).errors;
  assert.ok(errors.some(e => e.includes('Release versions')));
  assert.ok(errors.some(e => e.includes('No assigned agent can execute technical-spec')));
});

test('research fetch deadline covers a stalled response body', async t => {
  const { createServer } = await import('node:http');
  const { fetchWithTimeout } = await import('../scripts/collect-research.mjs');
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.flushHeaders();
    response.write('partial body');
    // Intentionally never end the body.
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const response = await fetchWithTimeout(`http://127.0.0.1:${server.address().port}/`, {}, 150);
  await assert.rejects(response.text(), /abort|timeout/i);
});

test('benchmark summaries reject scores outside 0-100 even if aggregates agree', async () => {
  const suite = await runBenchmarkSuite({ scenarioIds: ['prd-hidden-scope-creep'] });
  suite.results[0].first_pass.blind_rating = 101;
  const summary = buildBenchmarkSuiteSummary({ results: suite.results });
  assert.throws(() => validateBenchmarkSuiteSummary(summary), /blind_rating/);
});

test('blank baselines and impossible calendar dates cannot pass readiness', async () => {
  const artifact = await fixture();
  artifact.payload.success_metrics[0].baseline = '   ';
  assert.ok(has(validateArtifact(wrap(artifact)), IssueType.INVALID_STRUCTURED_ARTIFACT));
  artifact.payload.success_metrics[0].baseline = 10;
  artifact.decision_frame.decision_date = '2026-02-30';
  assert.ok(has(validateArtifact(wrap(artifact)), IssueType.MISSING_DECISION_FIELD));
});
test('extraneous fields cannot crash semantic validation', async () => {
  const artifact = await fixture(); artifact.payload.findings = {};
  assert.doesNotThrow(() => validateArtifact(wrap(artifact)));
});

test('installer refuses linked host directories before writing outside the project', async t => {
  const dir = await temporary(t);
  const project = path.join(dir, 'project'); const other = path.join(dir, 'other');
  await mkdir(project); await mkdir(other);
  const { symlink, readdir } = await import('node:fs/promises');
  await symlink(other, path.join(project, '.codex'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installShipwright(project, { apply: true }), /linked installation path/);
  assert.deepEqual(await readdir(other), []);
  await assert.rejects(readFile(path.join(project, '.shipwright-install.json')), { code: 'ENOENT' });
});

test('PASS cannot hide missing business inputs behind nonempty placeholders', async () => {
  const artifact = await fixture(); artifact.payload.success_metrics[0].baseline = 'TBD';
  assert.ok(has(validateArtifact(wrap(artifact)), IssueType.READINESS_FAILED));
});
