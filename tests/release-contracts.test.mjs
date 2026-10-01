import './helpers/isolate-outputs.mjs';
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
import { createHash } from 'node:crypto';
import { applyManagedBlock, installShipwright, uninstallShipwright } from '../scripts/install.mjs';
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
  const visibleFixture = await readFile(path.join(SOURCE_ROOT, 'benchmarks/fixtures/prd-hidden-scope-creep/final-pass.md'), 'utf8');
  const validation = installedValidator.validateArtifact(visibleFixture);
  assert.equal(validation.valid, true, JSON.stringify(validation.issues));
  assert.equal(validation.artifact.metadata.status, 'draft');
  const installedFormatter = await import(pathToFileURL(path.join(output, 'scripts/format-facts.mjs')));
  const installedDiff = await import(pathToFileURL(path.join(output, 'scripts/pricing-diff.mjs')));
  assert.match(installedFormatter.formatFactsBlock({ facts: [] }), /no facts extracted/);
  assert.match(installedDiff.buildPricingDiff([]), /No facts packs/);
  await assert.rejects(buildPlugin(output), /new directory/);
});
test('installer preserves root instructions and local additions, and blocks conflicts before writing', async t => {
  const dir = await temporary(t);
  await writeFile(path.join(dir, 'AGENTS.md'), 'Existing project instructions');
  await mkdir(path.join(dir, '.codex/skills/local'), { recursive: true });
  await writeFile(path.join(dir, '.codex/skills/local/SKILL.md'), 'Local skill');
  await installShipwright(dir, { apply: true });
  assert.equal((await installShipwright(dir)).changes.length, 0);
  assert.ok((await readFile(path.join(dir, 'AGENTS.md'), 'utf8')).startsWith('Existing project instructions'));
  assert.equal(await readFile(path.join(dir, '.codex/skills/local/SKILL.md'), 'utf8'), 'Local skill');
  const owned = path.join(dir, '.codex/docs/output-standard.md');
  await writeFile(owned, 'User customizations');
  await assert.rejects(installShipwright(dir, { apply: true }), /no files changed/);
  assert.equal(await readFile(owned, 'utf8'), 'User customizations');
});
test('installer writes a managed instruction block into AGENTS.md and CLAUDE.md', async t => {
  const dir = await temporary(t);
  const preview = await installShipwright(dir);
  assert.ok(preview.changes.includes('AGENTS.md') && preview.changes.includes('CLAUDE.md'));
  await assert.rejects(readFile(path.join(dir, 'AGENTS.md')), { code: 'ENOENT' });
  await assert.rejects(readFile(path.join(dir, 'CLAUDE.md')), { code: 'ENOENT' });
  await installShipwright(dir, { apply: true });
  for (const [file, host] of [['AGENTS.md', '.codex'], ['CLAUDE.md', '.claude']]) {
    const text = await readFile(path.join(dir, file), 'utf8');
    assert.ok(text.startsWith('<!-- shipwright:begin -->') && text.trimEnd().endsWith('<!-- shipwright:end -->'));
    for (const label of ['RECOMMENDATION', 'CONFIDENCE', 'NEEDS_HUMAN_REVIEW', 'SUMMARY', 'KEY_REASONING', 'stress-test',
      'Decision Frame', 'Unknowns & Evidence Gaps', 'Pass/Fail Readiness', 'Recommended Next Artifact']) assert.ok(text.includes(label), label);
    assert.ok(text.includes(host + '/skills/pricing-strategy/SKILL.md'));
    assert.doesNotMatch(text, /\{\{|\u2014/);
  }
  assert.equal((await installShipwright(dir)).changes.length, 0);
});
test('host instructions stay within the word budget and keep the required behaviors', async () => {
  const text = await readFile(new URL('../docs/host-instructions.md', import.meta.url), 'utf8');
  const words = text.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 350, `host-instructions.md has ${words} words, budget is 350`);
  for (const term of ['governance', 'publication', 'product_strategy', 'pricing', 'unclassified', 'UNCERTAINTY_DRIVERS',
    'DISAMBIGUATION_QUESTIONS', 'NEEDED_EVIDENCE', 'RECOMMENDED_NEXT_ACTION', 'normal coding mode', 'em dashes (U+2014)', '{{HOST_DIR}}',
    'End with the four closing blocks', 'give no verdict or labeled sections until it is answered']) {
    assert.ok(text.includes(term), term);
  }
  assert.ok(!text.includes(String.fromCharCode(0x2014)));
});
test('reinstall refuses edited managed blocks and keeps outside user text byte-for-byte', async t => {
  const dir = await temporary(t);
  const before = 'Top notes\r\n\r\nKeep me  \n';
  const after = '\nTrailing user text without newline';
  await writeFile(path.join(dir, 'CLAUDE.md'), before);
  await installShipwright(dir, { apply: true });
  const first = await readFile(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(first.startsWith(before));
  const stale = first.replace('Decision analysis routing', 'STALE HEADING') + after;
  await writeFile(path.join(dir, 'CLAUDE.md'), stale);
  const record = await readFile(path.join(dir, '.shipwright-install.json'));
  await assert.rejects(installShipwright(dir, { apply: true }), /Installation conflicts/);
  const second = await readFile(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.equal(second, stale);
  assert.deepEqual(await readFile(path.join(dir, '.shipwright-install.json')), record);
  assert.equal(second.split('<!-- shipwright:begin -->').length, 2);
  assert.ok(second.includes('STALE HEADING'));
});
test('malformed block markers stop the install before anything is written', async t => {
  const dir = await temporary(t);
  await writeFile(path.join(dir, 'AGENTS.md'), 'x\n<!-- shipwright:begin -->\nno end');
  await assert.rejects(installShipwright(dir, { apply: true }), /Malformed Shipwright block/);
  await assert.rejects(readFile(path.join(dir, '.shipwright-install.json')), { code: 'ENOENT' });
});

test('duplicate and mixed managed markers are rejected before install writes', async t => {
  const begin = '<!-- shipwright:begin -->';
  const end = '<!-- shipwright:end -->';
  for (const malformed of [`prefix\n${begin}\nbody\n${end}\n${end}\n`, `${end}\n${begin}\nbody\n${end}`]) {
    assert.throws(() => applyManagedBlock(malformed, 'replacement'), /Malformed Shipwright block/);
    const dir = await temporary(t);
    await writeFile(path.join(dir, 'AGENTS.md'), malformed);
    await assert.rejects(installShipwright(dir, { apply: true }), /Malformed Shipwright block/);
    assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), malformed);
    await assert.rejects(readFile(path.join(dir, '.shipwright-install.json')), { code: 'ENOENT' });
  }
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

test('documented test commands include TAP reporter and .tap destination', async () => {
  const readme = await readFile(path.join(SOURCE_ROOT, 'README.md'), 'utf8');
  const contributing = await readFile(path.join(SOURCE_ROOT, 'CONTRIBUTING.md'), 'utf8');
  const tapPattern = /--test-reporter=tap/;
  const tapDestPattern = /--test-reporter-destination=[^\s]*\.tap/;
  const bareTestPattern = /node --test --test-concurrency=1 tests\/\*\.test\.mjs(?!.*--test-reporter=tap)/;
  assert.ok(tapPattern.test(readme), 'README.md must contain --test-reporter=tap');
  assert.ok(tapDestPattern.test(readme), 'README.md must contain --test-reporter-destination ending in .tap');
  assert.ok(tapPattern.test(contributing), 'CONTRIBUTING.md must contain --test-reporter=tap');
  assert.ok(tapDestPattern.test(contributing), 'CONTRIBUTING.md must contain --test-reporter-destination ending in .tap');
  const readmeLines = readme.split('\n').filter(line => /node --test --test-concurrency=1 tests\/\*\.test\.mjs/.test(line));
  const contributingLines = contributing.split('\n').filter(line => /node --test --test-concurrency=1 tests\/\*\.test\.mjs/.test(line));
  for (const line of readmeLines) {
    assert.ok(/--test-reporter=tap/.test(line), `README test command must include --test-reporter=tap: ${line}`);
  }
  for (const line of contributingLines) {
    assert.ok(/--test-reporter=tap/.test(line), `CONTRIBUTING test command must include --test-reporter=tap: ${line}`);
  }
});

const EM_DASH = String.fromCharCode(0x2014);
const exists = file => readFile(file).then(() => true, () => false);
async function tree(dir, base = dir) {
  const { readdir } = await import('node:fs/promises');
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await tree(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

test('installed block tells the model not to use em dashes', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  for (const file of ['AGENTS.md', 'CLAUDE.md']) {
    const text = await readFile(path.join(dir, file), 'utf8');
    assert.match(text, /must not use em dashes \(U\+2014\)/);
    assert.ok(!text.includes(EM_DASH));
  }
});
test('uninstall preview lists removals and writes nothing', async t => {
  const dir = await temporary(t);
  await writeFile(path.join(dir, 'AGENTS.md'), 'Mine\n');
  await installShipwright(dir, { apply: true });
  const snapshot = await tree(dir);
  const agents = await readFile(path.join(dir, 'AGENTS.md'), 'utf8');
  const preview = await uninstallShipwright(dir);
  assert.equal(preview.applied, false);
  assert.ok(preview.removed.includes('.codex/docs/output-standard.md'));
  assert.deepEqual(preview.blocksRemoved, ['AGENTS.md', 'CLAUDE.md']);
  assert.ok(preview.dirsRemoved.includes('.claude') && preview.dirsRemoved.includes('.codex'));
  assert.deepEqual(await tree(dir), snapshot);
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), agents);
});
test('uninstall apply removes installed files, dirs, blocks and the record, and keeps user content exactly', async t => {
  const dir = await temporary(t);
  const mine = 'Top notes\r\n\r\nKeep me  \n';
  const noNewline = 'No trailing newline';
  await writeFile(path.join(dir, 'AGENTS.md'), mine);
  await writeFile(path.join(dir, 'CLAUDE.md'), noNewline);
  await writeFile(path.join(dir, 'unrelated.txt'), 'other');
  await installShipwright(dir, { apply: true });
  const result = await uninstallShipwright(dir, { apply: true });
  assert.equal(result.applied, true);
  assert.deepEqual(result.kept, []);
  assert.deepEqual(result.refused, []);
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), mine);
  assert.equal(await readFile(path.join(dir, 'CLAUDE.md'), 'utf8'), noNewline);
  assert.deepEqual(await tree(dir), ['AGENTS.md', 'CLAUDE.md', 'unrelated.txt']);
  await assert.rejects(readFile(path.join(dir, '.shipwright-install.json')), { code: 'ENOENT' });
});
test('uninstall deletes AGENTS.md and CLAUDE.md the installer created, and leaves an empty project dir', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  await uninstallShipwright(dir, { apply: true });
  assert.deepEqual(await tree(dir), []);
  // A file that only had the block but was user-created before install is kept, empty.
  await writeFile(path.join(dir, 'AGENTS.md'), '');
  await installShipwright(dir, { apply: true });
  await uninstallShipwright(dir, { apply: true });
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), '');
  assert.equal(await exists(path.join(dir, 'CLAUDE.md')), false);
});
test('uninstall keeps created instruction files that gained user content after install', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const text = await readFile(path.join(dir, 'CLAUDE.md'), 'utf8');
  await writeFile(path.join(dir, 'CLAUDE.md'), 'Added later\n\n' + text);
  await uninstallShipwright(dir, { apply: true });
  assert.equal(await readFile(path.join(dir, 'CLAUDE.md'), 'utf8'), 'Added later\n\n');
});
test('uninstall keeps and reports a modified installed file', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const owned = path.join(dir, '.codex/docs/output-standard.md');
  await writeFile(owned, 'User customizations');
  const result = await uninstallShipwright(dir, { apply: true });
  assert.ok(result.kept.some(entry => entry.path === '.codex/docs/output-standard.md' && /modified/.test(entry.reason)));
  assert.ok(!result.removed.includes('.codex/docs/output-standard.md'));
  assert.equal(await readFile(owned, 'utf8'), 'User customizations');
  assert.ok(!result.dirsRemoved.includes('.codex') && !result.dirsRemoved.includes('.codex/docs'));
  assert.equal(await exists(path.join(dir, '.codex/README.md')), false);
});

test('uninstall refuses an edited managed block and remains recoverable', async t => {
  const dir = await temporary(t);
  const before = 'Top notes\r\nKeep me  \n';
  const after = '\nTrailing user text';
  await writeFile(path.join(dir, 'AGENTS.md'), before);
  await installShipwright(dir, { apply: true });
  const installed = await readFile(path.join(dir, 'AGENTS.md'), 'utf8');
  const edited = installed.replace('<!-- shipwright:end -->', 'My added instruction\n<!-- shipwright:end -->') + after;
  await writeFile(path.join(dir, 'AGENTS.md'), edited);
  const preview = await uninstallShipwright(dir);
  assert.ok(preview.kept.some(entry => entry.path === 'AGENTS.md' && /managed block/.test(entry.reason)));
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), edited);
  const result = await uninstallShipwright(dir, { apply: true });
  assert.ok(result.kept.some(entry => entry.path === 'AGENTS.md'));
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), edited);
  assert.equal(await exists(path.join(dir, '.shipwright-install.json')), true);
  await writeFile(path.join(dir, 'AGENTS.md'), installed + after);
  const retry = await uninstallShipwright(dir, { apply: true });
  assert.deepEqual(retry.kept, []);
  const restored = await readFile(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(restored.startsWith(before) && restored.endsWith(after));
  assert.equal(await exists(path.join(dir, '.shipwright-install.json')), false);
});

test('malformed markers stop uninstall before any file is removed', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const file = path.join(dir, 'AGENTS.md');
  const malformed = await readFile(file, 'utf8') + '<!-- shipwright:end -->\n';
  await writeFile(file, malformed);
  const before = await tree(dir);
  await assert.rejects(uninstallShipwright(dir, { apply: true }), /Malformed Shipwright block/);
  assert.deepEqual(await tree(dir), before);
  assert.equal(await readFile(file, 'utf8'), malformed);
  assert.equal(await exists(path.join(dir, '.shipwright-install.json')), true);
});
test('uninstall keeps a user-added file and the directories that hold it', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  await mkdir(path.join(dir, '.claude/skills/local'), { recursive: true });
  await writeFile(path.join(dir, '.claude/skills/local/SKILL.md'), 'Local skill');
  await uninstallShipwright(dir, { apply: true });
  assert.deepEqual(await tree(dir), ['.claude/skills/local/SKILL.md']);
});
test('uninstall without hashes reports files as unverifiable and deletes nothing', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const recordPath = path.join(dir, '.shipwright-install.json');
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  const legacy = Object.fromEntries(Object.keys(record.hashes).map(key => [key, null]));
  await writeFile(recordPath, JSON.stringify({ version: 1, source: record.source, hashes: legacy }));
  const before = await tree(dir);
  const result = await uninstallShipwright(dir, { apply: true });
  assert.deepEqual(result.removed, []);
  assert.ok(result.kept.length > 0 && result.kept.every(entry => /unverifiable/.test(entry.reason)));
  assert.deepEqual((await tree(dir)).filter(file => file !== '.shipwright-install.json' && !/^(AGENTS|CLAUDE)\.md$/.test(file)),
    before.filter(file => file !== '.shipwright-install.json' && !/^(AGENTS|CLAUDE)\.md$/.test(file)));
});
test('uninstall refuses tampered record paths that escape the project', async t => {
  const dir = await temporary(t);
  const project = path.join(dir, 'project'); const other = path.join(dir, 'other');
  await mkdir(project); await mkdir(other);
  const outside = path.join(dir, 'outside.txt'); const linked = path.join(other, 'victim.txt');
  await writeFile(outside, 'keep'); await writeFile(linked, 'keep');
  const { symlink } = await import('node:fs/promises');
  await symlink(other, path.join(project, 'jump'), process.platform === 'win32' ? 'junction' : 'dir');
  const sha = text => createHash('sha256').update(text).digest('hex');
  const hashes = { '../outside.txt': sha('keep'), 'jump/victim.txt': sha('keep'), [outside.split(path.sep).join('/')]: sha('keep') };
  await writeFile(path.join(project, '.shipwright-install.json'), JSON.stringify({ version: 1, hashes, dirs: ['..', 'jump'] }));
  const result = await uninstallShipwright(project, { apply: true });
  assert.deepEqual(result.removed, []);
  assert.ok(result.refused.includes('../outside.txt') && result.refused.includes('jump/victim.txt'));
  assert.equal(await readFile(outside, 'utf8'), 'keep');
  assert.equal(await readFile(linked, 'utf8'), 'keep');
});

test('forged in-project record entries cannot remove user files or begin uninstall', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const note = path.join(dir, 'user-note.txt');
  const recordPath = path.join(dir, '.shipwright-install.json');
  await writeFile(note, 'my user data');
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  record.hashes['user-note.txt'] = createHash('sha256').update('my user data').digest('hex');
  await writeFile(recordPath, JSON.stringify(record));
  const before = await tree(dir);
  const preview = await uninstallShipwright(dir);
  assert.ok(preview.refused.includes('user-note.txt'));
  assert.deepEqual(await tree(dir), before);
  const result = await uninstallShipwright(dir, { apply: true });
  assert.equal(result.applied, false);
  assert.ok(result.refused.includes('user-note.txt'));
  assert.deepEqual(await tree(dir), before);
  assert.equal(await readFile(note, 'utf8'), 'my user data');
  assert.equal(await exists(recordPath), true);
  await assert.rejects(installShipwright(dir, { apply: true }), /unowned paths/);
});

test('forged hashes at packaged paths cannot authorize deletion of user content', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const relative = '.codex/README.md';
  const note = path.join(dir, relative);
  const recordPath = path.join(dir, '.shipwright-install.json');
  const originalRecord = await readFile(recordPath);
  const originalFile = await readFile(note);
  await writeFile(note, 'my replacement user data');
  const record = JSON.parse(originalRecord);
  record.hashes[relative] = createHash('sha256').update('my replacement user data').digest('hex');
  await writeFile(recordPath, JSON.stringify(record));
  const before = await tree(dir);
  const bytes = await Promise.all(before.map(file => readFile(path.join(dir, file))));
  for (const apply of [false, true]) {
    const result = await uninstallShipwright(dir, { apply });
    assert.equal(result.applied, false);
    assert.ok(result.refused.includes(relative));
    assert.deepEqual(await tree(dir), before);
    assert.deepEqual(await Promise.all(before.map(file => readFile(path.join(dir, file)))), bytes);
  }
  await writeFile(note, originalFile);
  await writeFile(recordPath, originalRecord);
  assert.equal((await uninstallShipwright(dir, { apply: true })).applied, true);
  assert.deepEqual(await tree(dir), []);
});

test('forged managed-block hashes cannot authorize removal of edited instructions', async t => {
  const dir = await temporary(t);
  await installShipwright(dir, { apply: true });
  const file = path.join(dir, 'AGENTS.md');
  const edited = (await readFile(file, 'utf8')).replace('<!-- shipwright:end -->', 'User instructions\n<!-- shipwright:end -->');
  await writeFile(file, edited);
  const recordPath = path.join(dir, '.shipwright-install.json');
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  record.blocks['AGENTS.md'].hash = createHash('sha256').update(edited.trimEnd()).digest('hex');
  await writeFile(recordPath, JSON.stringify(record));
  const result = await uninstallShipwright(dir, { apply: true });
  assert.ok(result.kept.some(entry => entry.path === 'AGENTS.md'));
  assert.equal(await readFile(file, 'utf8'), edited);
  assert.equal(await exists(recordPath), true);
});

test('forged block separator metadata cannot strip user instructions', async t => {
  const dir = await temporary(t);
  const userText = 'Important user instructions\n';
  await writeFile(path.join(dir, 'AGENTS.md'), userText);
  await installShipwright(dir, { apply: true });
  const recordPath = path.join(dir, '.shipwright-install.json');
  const record = JSON.parse(await readFile(recordPath, 'utf8'));
  record.blocks['AGENTS.md'].added = userText + '\n';
  await writeFile(recordPath, JSON.stringify(record));
  const agents = await readFile(path.join(dir, 'AGENTS.md'));
  const before = await tree(dir);
  const result = await uninstallShipwright(dir, { apply: true });
  assert.equal(result.applied, false);
  assert.ok(result.refused.includes('AGENTS.md'));
  assert.deepEqual(await tree(dir), before);
  assert.deepEqual(await readFile(path.join(dir, 'AGENTS.md')), agents);
  assert.equal(await exists(recordPath), true);
});
test('uninstall errors without an install record and refuses the source repository', async t => {
  const dir = await temporary(t);
  await assert.rejects(uninstallShipwright(dir, { apply: true }), /No Shipwright install record/);
  await assert.rejects(uninstallShipwright(SOURCE_ROOT), /not the Shipwright source repository/);
  const { execFile } = await import('node:child_process');
  const code = await new Promise(resolve => execFile(process.execPath, [path.join(SOURCE_ROOT, 'scripts/install.mjs'), dir, '--uninstall'], error => resolve(error?.code ?? 0)));
  assert.equal(code, 1);
});
