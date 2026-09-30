import assert from 'node:assert/strict';
import test from 'node:test';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildPlugin, pluginFiles, SOURCE_ROOT } from '../scripts/build-plugin.mjs';

const execFileAsync = promisify(execFile);

const packagedMarkdown = files => [...files]
  .filter(([file]) => file.endsWith('.md'))
  .map(([file, content]) => [file, content.toString('utf8')]);
const localLinks = markdown => [...markdown.matchAll(/\]\(([^)]+)\)/g)]
  .map(match => match[1].split('#', 1)[0])
  .filter(target => target && !/^[a-z][a-z0-9+.-]*:/i.test(target));

test('package README is self-contained plugin guidance rather than source-checkout instructions', async () => {
  const files = await pluginFiles();
  const readme = files.get('README.md')?.toString('utf8') || '';
  assert.match(readme, /^# Shipwright Plugin Guide/m);
  assert.doesNotMatch(readme, /node scripts\/build-plugin\.mjs/);
  assert.doesNotMatch(readme, /node scripts\/install\.mjs/);
  assert.ok(files.has('docs/plugin-guide.md'));
});

test('every packaged relative Node helper reference resolves inside the package', async () => {
  const files = await pluginFiles();
  for (const [file, markdown] of packagedMarkdown(files)) {
    for (const match of markdown.matchAll(/node\s+(?:\.\/)?scripts\/([^\s`"']+)/g)) {
      const helper = match[1].replace(/[),.;]+$/, '');
      assert.ok(files.has(`scripts/${helper}`), `${file} references missing scripts/${helper}`);
    }
  }
});

test('every packaged relative Markdown link resolves to a packaged file or directory', async () => {
  const files = await pluginFiles();
  const names = new Set(files.keys());
  for (const [file, markdown] of packagedMarkdown(files)) {
    for (const target of localLinks(markdown)) {
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target)).replace(/\/$/, '');
      const exists = names.has(resolved) || [...names].some(name => name.startsWith(`${resolved}/`));
      assert.ok(exists, `${file} links to missing ${target}`);
    }
  }
});

test('packaged guidance resolves helpers from the installed root and accurately limits automated review', async () => {
  const files = await pluginFiles();
  const agent = files.get('agents/orchestrator.md')?.toString('utf8') || '';
  const review = files.get('skills/adversarial-review/SKILL.md')?.toString('utf8') || '';
  assert.match(agent, /node "<absolute-shipwright-root>\/scripts\/collect-research\.mjs"/);
  assert.match(review, /node "<absolute-shipwright-root>\/scripts\/validate-artifact\.mjs"/);
  assert.match(agent, /A second automated model review is not included in this distribution/);
  assert.doesNotMatch(agent, /install.*provider|add.*provider/i);
});

test('the Node installer preflights conflicts and applies a disposable update without Bash', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shipwright-portable-update-'));
  const source = path.join(root, 'source');
  const project = path.join(root, 'project');
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const entry of ['skills', 'commands', 'agents', 'evals', 'schemas', 'output-styles', 'docs', 'scripts', 'examples', '.claude-plugin', '.codex']) {
    await cp(path.join(SOURCE_ROOT, entry), path.join(source, entry), { recursive: true });
  }
  for (const entry of ['manifest.json', 'skills-map.md', 'LICENSE']) {
    await cp(path.join(SOURCE_ROOT, entry), path.join(source, entry));
  }
  await mkdir(project);
  await writeFile(path.join(project, 'AGENTS.md'), 'Project-owned instructions');
  const installer = path.join(source, 'scripts', 'install.mjs');
  await execFileAsync(process.execPath, [installer, project, '--apply']);

  const guide = path.join(source, 'docs', 'plugin-guide.md');
  await writeFile(guide, `${await readFile(guide, 'utf8')}\nDisposable update marker one.\n`);
  await execFileAsync(process.execPath, [installer, project, '--apply']);
  assert.match(await readFile(path.join(project, '.claude', 'README.md'), 'utf8'), /Disposable update marker one/);
  assert.ok((await readFile(path.join(project, 'AGENTS.md'), 'utf8')).startsWith('Project-owned instructions\n\n<!-- shipwright:begin -->'));

  const localReadme = path.join(project, '.codex', 'README.md');
  await writeFile(localReadme, 'Project customization');
  await writeFile(guide, `${await readFile(guide, 'utf8')}\nDisposable update marker two.\n`);
  await assert.rejects(execFileAsync(process.execPath, [installer, project, '--apply']));
  assert.equal(await readFile(localReadme, 'utf8'), 'Project customization');
  assert.doesNotMatch(await readFile(path.join(project, '.claude', 'README.md'), 'utf8'), /Disposable update marker two/);
});

test('a fresh bundle contains the plugin guide and its linked golden-output examples', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shipwright-fresh-bundle-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const output = path.join(root, 'bundle');
  await buildPlugin(output);
  assert.match(await readFile(path.join(output, 'README.md'), 'utf8'), /^# Shipwright Plugin Guide/m);
  for (const name of ['prd.md', 'strategy.md', 'design-review.md']) {
    await readFile(path.join(output, 'examples', 'golden-outputs', name), 'utf8');
  }
});

test('packaged commands follow authorization and host-capability contracts', async () => {
  const files = await pluginFiles();
  const prd = files.get('commands/write-prd.md')?.toString('utf8') || '';
  const start = files.get('commands/start.md')?.toString('utf8') || '';
  assert.match(prd, /Use the problem statement, customer context, and evidence already supplied/);
  assert.match(prd, /Ask at most two\s+targeted questions/);
  assert.doesNotMatch(prd, /Review with the PM before proceeding/);
  assert.match(start, /Delegate specialist work only when the current host supports an agent tool/);
  assert.match(start, /Otherwise complete the workflow in the current session/);
  assert.match(start, /Do not run the helper when the PM gave an explicit command or named artifact/);
  const orchestrator = files.get('agents/orchestrator.md').toString('utf8');
  assert.doesNotMatch(orchestrator, /If `scripts\/route-request\.mjs` exists, run it/);
  assert.match(orchestrator, /A skipped or unavailable helper alone does not require escalation/);
  assert.match(start, /Skipping an unnecessary or unavailable helper alone does not require escalation/);
});

test('Light design review and evidence gates do not impose unsupported numeric quotas', async () => {
  const files = await pluginFiles();
  const design = files.get('skills/design-review/SKILL.md')?.toString('utf8') || '';
  assert.match(design, /At Light depth, use only Engineering, Customer Voice, and Devil's Advocate/);
  assert.match(design, /Overall Verdict \(Light\)/);

  for (const name of [
    'discovery-interview-prep', 'workflow-questionnaire', 'jobs-to-be-done',
    'competitive-battlecard', 'user-story-writing', 'artifact-quality-audit',
  ]) {
    const skill = files.get(`skills/${name}/SKILL.md`)?.toString('utf8') || '';
    const readiness = skill.slice(skill.indexOf('Pass/Fail Readiness'), skill.indexOf('Recommended Next Artifact'));
    assert.doesNotMatch(readiness, /at least 3|3\+ acceptance|2\+|at least 2 artifacts/i, name);
    assert.match(readiness, /evidence|supported|coverage|rationales/i, name);
  }
  const audit = files.get('skills/artifact-quality-audit/SKILL.md')?.toString('utf8') || '';
  assert.match(audit, /A single-artifact audit may PASS without a trend claim/);
});
