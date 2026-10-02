import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CASES,
  LIVE_ENV_VAR,
  STERILITY_PROMPT,
  ancestorInstructionHits,
  buildPlan,
  claudeArgs,
  gradeSheet,
  main,
  sterilityVerdict,
  transcriptFromStream,
} from '../scripts/clean-host-probe.mjs';
import { temporaryDirectory } from './helpers/temp-dirs.mjs';

const EM_DASH = String.fromCharCode(0x2014);
const scriptPath = fileURLToPath(new URL('../scripts/clean-host-probe.mjs', import.meta.url));
const FROZEN = {
  'governance-decision': 'Should we acquire our smaller competitor, a 30-person company with overlapping customers? Give me a verdict. This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.',
  'pricing-decision': 'Should we raise our subscription prices by 15 percent next quarter? Give me a verdict. This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.',
  'prd-draft': 'Write a PRD for single sign-on support in our admin console. Our customers are IT admins at companies with 200 to 2,000 employees. This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.',
  'pricing-framework': 'How should we price a team plan for our note-taking app? We have a free tier and about 4,000 weekly active users. This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.',
  'ambiguous-pricing-decision': 'Should we go with the cheaper pricing option for the vendor contract? This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.',
};

function deps(extra = {}) {
  return {
    exists: () => false,
    home: path.resolve('C:\\Users\\someone'),
    install: async dir => {
      await writeFile(path.join(dir, 'CLAUDE.md'), 'product\n', 'utf8');
      return { changes: ['CLAUDE.md'] };
    },
    ...extra,
  };
}

test('the five prompts are the frozen September 30 strings', () => {
  assert.deepEqual(CASES.map(item => item.id), Object.keys(FROZEN));
  for (const item of CASES) {
    assert.equal(item.prompt, FROZEN[item.id]);
    assert.equal(item.prompt.includes(EM_DASH), false);
  }
  assert.match(STERILITY_PROMPT, /single word NONE/);
});

test('a parent instruction file is a hit and the workdir copy is not', () => {
  const root = path.resolve('C:\\probe-root');
  const workdir = path.join(root, 'job');
  const parentFile = path.join(root, 'CLAUDE.md');
  const localFile = path.join(root, 'CLAUDE.local.md');
  const ownFile = path.join(workdir, 'CLAUDE.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === parentFile || candidate === localFile || candidate === ownFile,
    home: path.resolve('C:\\Users\\someone'),
  });
  assert.ok(hits.includes(parentFile));
  assert.ok(hits.includes(localFile));
  assert.equal(hits.includes(ownFile), false);
});

test('the user .claude directory is not treated as a project parent', () => {
  const home = path.resolve('C:\\Users\\ianfe');
  const workdir = path.join(home, 'AppData', 'Local', 'shipwright-clean-host-probe');
  const userFile = path.join(home, '.claude', 'CLAUDE.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === userFile,
    home,
  });
  assert.deepEqual(hits, []);
});

test('a project .claude directory above the workdir is a hit', () => {
  const home = path.resolve('C:\\Users\\ianfe');
  const parent = path.join(home, 'AppData');
  const workdir = path.join(parent, 'Local', 'shipwright-clean-host-probe');
  const rules = path.join(parent, '.claude', 'rules');
  const claude = path.join(parent, '.claude', 'CLAUDE.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === rules || candidate === claude,
    home,
  });
  assert.ok(hits.includes(rules));
  assert.ok(hits.includes(claude));
});

test('the ancestor walk stops at the filesystem root', () => {
  const seen = [];
  ancestorInstructionHits(path.resolve('C:\\shipwright-clean-host-probe'), {
    exists: candidate => { seen.push(candidate); return false; },
    home: path.resolve('C:\\Users\\ianfe'),
  });
  assert.equal(seen.length, 4);
});

test('the session argv keeps project settings and the September 30 tools', () => {
  const args = claudeArgs({ settingsPath: 'C:\\operator\\settings.json' });
  const text = args.join(' ');
  assert.match(text, /--setting-sources project\b/);
  assert.match(text, /--model claude-opus-5-5\b/);
  assert.match(text, /--output-format stream-json/);
  assert.match(text, /Bash\(node \*\)/);
  assert.equal(text.includes('--bare'), false);
  assert.equal(text.includes('--safe-mode'), false);
  assert.equal(text.includes('--effort'), false);
  assert.equal(/--setting-sources [^\n]*user/.test(text), false);
});

test('the plan names the five cases and leaves the session unstarted', () => {
  const plan = buildPlan({
    workdir: 'C:\\work',
    operator: 'C:\\work-operator',
    hits: [],
  });
  assert.match(plan, /No session has been started/);
  assert.match(plan, /--setting-sources project\b/);
  assert.match(plan, /disposable acceptance test/);
  for (const id of Object.keys(FROZEN)) assert.match(plan, new RegExp(id));
  assert.equal(plan.includes('--bare'), false);
  assert.equal(plan.includes('--safe-mode'), false);
  assert.equal(plan.includes('--effort'), false);
  assert.equal(/--setting-sources [^\n]*user/.test(plan), false);
  const grade = gradeSheet();
  assert.match(grade, /headcount/);
  assert.match(grade, /next quarter/);
  assert.match(grade, /session lifetime/);
  assert.match(grade, /audit logs/);
  assert.match(grade, /without a verdict/);
  assert.equal(grade.includes(EM_DASH), false);
});

test('transcriptFromStream keeps the last result string', () => {
  const stream = [
    JSON.stringify({ type: 'system' }),
    'not json',
    JSON.stringify({ type: 'result', result: { ignored: true } }),
    JSON.stringify({ type: 'result', result: 'first' }),
    JSON.stringify({ type: 'result', result: 'second' }),
  ].join('\n');
  assert.equal(transcriptFromStream(stream), 'second');
  assert.throws(() => transcriptFromStream('{"type":"result","result":1}'), /No result event/);
});

test('sterility accepts NONE or in-workdir paths and rejects the rest', () => {
  const workdir = path.resolve('C:\\job');
  assert.equal(sterilityVerdict('NONE', workdir).ok, true);
  assert.equal(sterilityVerdict(path.join(workdir, 'CLAUDE.md'), workdir).ok, true);
  const outside = sterilityVerdict('C:\\Users\\someone\\.claude\\CLAUDE.md', workdir);
  assert.equal(outside.ok, false);
  assert.deepEqual(outside.outside, ['C:\\Users\\someone\\.claude\\CLAUDE.md']);
  const prose = sterilityVerdict('I loaded no CLAUDE.md files.', workdir);
  assert.equal(prose.ok, false);
  assert.equal(prose.unparsed.length, 1);
});

test('--run and --live refuse without the env var and do not spawn', async () => {
  let calls = 0;
  const spawnClaude = async () => { calls += 1; throw new Error('spawned'); };
  const run = await main(['--run'], {}, deps({ spawnClaude }));
  const live = await main(['--live'], {}, deps({ spawnClaude }));
  assert.equal(run.code, 2);
  assert.equal(live.code, 2);
  assert.match(run.stderr, new RegExp(LIVE_ENV_VAR));
  assert.equal(calls, 0);
});

test('prepare writes the grade sheet beside an empty install and refuses a second copy', async () => {
  const root = await temporaryDirectory('shipwright-clean-host-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  const installed = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps());
  assert.equal(installed.code, 0, installed.stderr);
  assert.match(installed.stdout, /No session was started/);
  const workFiles = await readFile(path.join(workdir, 'CLAUDE.md'), 'utf8');
  assert.equal(workFiles, 'product\n');
  const grade = await readFile(path.join(operator, 'grade-sheet.md'), 'utf8');
  assert.match(grade, /headcount/);
  const settings = JSON.parse(await readFile(path.join(operator, 'settings.json'), 'utf8'));
  assert.equal(settings.autoMemoryEnabled, false);
  assert.equal(settings.disableClaudeAiConnectors, true);
  await assert.rejects(readFile(path.join(workdir, 'grade-sheet.md'), 'utf8'));
  const again = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps());
  assert.equal(again.code, 1);
  assert.match(again.stderr, /not empty/);
});

test('prepare refuses an ancestor instruction file before install', async () => {
  const root = path.resolve('C:\\probe-parent');
  const workdir = path.join(root, 'job');
  const operator = path.join(root, 'job-operator');
  const hit = path.join(root, 'CLAUDE.md');
  let installed = false;
  const result = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps({
    exists: candidate => candidate === hit,
    install: async () => { installed = true; return { changes: [] }; },
  }));
  assert.equal(result.code, 1);
  assert.equal(installed, false);
  assert.match(result.stderr, /Ancestor instruction files/);
  assert.match(result.stderr, /CLAUDE\.md/);
});

test('an outside instruction path stops before the five cases', async () => {
  const root = await temporaryDirectory('shipwright-clean-host-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  const prepared = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps());
  assert.equal(prepared.code, 0, prepared.stderr);
  let calls = 0;
  const spawnClaude = async () => {
    calls += 1;
    const result = 'C:\\Users\\someone\\.claude\\CLAUDE.md';
    return { code: 0, stdout: `${JSON.stringify({ type: 'result', result })}\n`, stderr: '' };
  };
  const run = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnClaude }),
  );
  assert.equal(calls, 1);
  assert.match(run.stderr, /five cases were not started/);
  const saved = await readFile(path.join(operator, 'transcripts', 'sterility.md'), 'utf8');
  assert.match(saved, /CLAUDE\.md/);
  await assert.rejects(readFile(path.join(operator, 'transcripts', 'governance-decision.md'), 'utf8'));
});

test('a clean sterility result writes the five transcripts once', async () => {
  const root = await temporaryDirectory('shipwright-clean-host-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  assert.equal((await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps())).code, 0);
  let calls = 0;
  const spawnClaude = async ({ cwd, args, env, prompt }) => {
    calls += 1;
    assert.equal(cwd, workdir);
    assert.equal(args[args.indexOf('--setting-sources') + 1], 'project');
    assert.equal(args.includes('--bare'), false);
    assert.equal(args.includes('--safe-mode'), false);
    assert.equal(args.includes('--effort'), false);
    assert.equal(env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, '1');
    assert.equal(env.ENABLE_CLAUDEAI_MCP_SERVERS, 'false');
    assert.match(prompt, calls === 1 ? /NONE/ : /disposable acceptance test/);
    return { code: 0, stdout: `${JSON.stringify({ type: 'result', result: calls === 1 ? 'NONE' : `answer ${calls}` })}\n`, stderr: '' };
  };
  const run = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnClaude }),
  );
  assert.equal(run.code, 0, run.stderr);
  assert.equal(calls, 6);
  const check = await main(['--check', operator, '--workdir', workdir], {}, deps());
  assert.equal(check.code, 0, check.stdout);
  assert.match(check.stdout, /sterility: clean/);
  assert.match(check.stdout, /not scored/);
  for (const id of Object.keys(FROZEN)) assert.match(check.stdout, new RegExp(`${id}: present`));
  const again = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnClaude: async () => { throw new Error('spawned'); } }),
  );
  assert.equal(again.code, 1);
  assert.match(again.stderr, /second pass/);
  assert.equal(calls, 6);
});

test('--check reports missing transcripts and an outside sterility path', async () => {
  const root = await temporaryDirectory('shipwright-clean-host-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  await mkdir(path.join(operator, 'transcripts'), { recursive: true });
  await writeFile(path.join(operator, 'transcripts', 'sterility.md'), 'C:\\Users\\someone\\.claude\\CLAUDE.md\n', 'utf8');
  const result = await main(['--check', operator, '--workdir', workdir], {}, deps());
  assert.equal(result.code, 1);
  assert.match(result.stdout, /sterility: outside/);
  assert.match(result.stdout, /governance-decision: missing/);
  assert.match(result.stdout, /not scored/);
  assert.equal(/\bPASS\b|\bFAIL\b/.test(result.stdout), false);
});

test('the probe stays unpackaged and contains no em dash', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const note = await readFile(fileURLToPath(new URL('../docs/clean-host-probe.md', import.meta.url)), 'utf8');
  const allowlist = await readFile(fileURLToPath(new URL('../scripts/build-plugin.mjs', import.meta.url)), 'utf8');
  assert.equal(source.includes(EM_DASH), false);
  assert.equal(note.includes(EM_DASH), false);
  assert.equal(allowlist.includes('clean-host-probe'), false);
  assert.match(note, /No session has been started/);
  assert.match(note, /--setting-sources project/);
  for (const item of CASES) assert.ok(note.includes(item.question), item.id);
});
