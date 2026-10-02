import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CASES as CLAUDE_CASES } from '../scripts/clean-host-probe.mjs';
import {
  CASES,
  LIVE_ENV_VAR,
  MODEL,
  ancestorInstructionHits,
  buildPlan,
  codexArgs,
  gradeSheet,
  main,
  transcriptFromCodexEvents,
} from '../scripts/codex-clean-host-probe.mjs';
import { temporaryDirectory } from './helpers/temp-dirs.mjs';

const EM_DASH = String.fromCharCode(0x2014);
const scriptPath = fileURLToPath(new URL('../scripts/codex-clean-host-probe.mjs', import.meta.url));

function deps(extra = {}) {
  return {
    exists: () => false,
    home: path.resolve('C:\\Users\\someone'),
    install: async dir => {
      await writeFile(path.join(dir, 'AGENTS.md'), 'product\n', 'utf8');
      return { changes: ['AGENTS.md'] };
    },
    ...extra,
  };
}

function eventStream(text) {
  return `${JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text } })}\n`;
}

test('the five prompts are the Claude probe prompts', () => {
  assert.deepEqual(CASES.map(item => item.prompt), CLAUDE_CASES.map(item => item.prompt));
  assert.equal(MODEL, 'gpt-6-astra');
});

test('a parent AGENTS.md is a hit and the workdir copy is not', () => {
  const root = path.resolve('C:\\probe-root');
  const workdir = path.join(root, 'job');
  const parentFile = path.join(root, 'AGENTS.md');
  const overrideFile = path.join(root, 'AGENTS.override.md');
  const ownFile = path.join(workdir, 'AGENTS.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === parentFile || candidate === overrideFile || candidate === ownFile,
    home: path.resolve('C:\\Users\\someone'),
  });
  assert.ok(hits.includes(parentFile));
  assert.ok(hits.includes(overrideFile));
  assert.equal(hits.includes(ownFile), false);
});

test('the user .codex directory is not treated as a project parent', () => {
  const home = path.resolve('C:\\Users\\ianfe');
  const workdir = path.join(home, 'AppData', 'Local', 'job');
  const userFile = path.join(home, '.codex', 'AGENTS.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === userFile,
    home,
  });
  assert.deepEqual(hits, []);
});

test('a project .codex directory above the workdir is a hit', () => {
  const home = path.resolve('C:\\Users\\ianfe');
  const parent = path.join(home, 'AppData');
  const workdir = path.join(parent, 'Local', 'job');
  const agents = path.join(parent, '.codex', 'AGENTS.md');
  const hits = ancestorInstructionHits(workdir, {
    exists: candidate => candidate === agents,
    home,
  });
  assert.deepEqual(hits, [agents]);
});

test('the session argv ignores user config and pins the September 30 model', () => {
  const args = codexArgs({
    messagePath: 'C:\\operator\\transcripts\\sterility.md',
    workdir: 'C:\\shipwright-codex-clean-host-probe',
  });
  const text = args.join(' ');
  assert.match(text, /exec --ephemeral --skip-git-repo-check --sandbox workspace-write/);
  assert.match(text, /--ignore-user-config/);
  assert.match(text, /--ignore-rules/);
  assert.match(text, /--model gpt-6-astra\b/);
  assert.match(text, /--json/);
  assert.equal(text.includes('--dangerously-bypass'), false);
  assert.equal(text.includes('config.toml'), false);
});

test('the plan names the five cases and leaves the session unstarted', () => {
  const plan = buildPlan({
    workdir: 'C:\\shipwright-codex-clean-host-probe',
    operator: 'C:\\shipwright-codex-clean-host-probe-operator',
    hits: [],
  });
  assert.match(plan, /No session has been started/);
  assert.match(plan, /--ignore-user-config/);
  assert.match(plan, /--model gpt-6-astra/);
  assert.match(plan, /disposable acceptance test/);
  for (const item of CASES) assert.match(plan, new RegExp(item.id));
  assert.equal(plan.includes('shipwright-clean-host-probe\\'), false);
  assert.equal(plan.includes('--dangerously-bypass'), false);
  const grade = gradeSheet();
  assert.match(grade, /headcount/);
  assert.match(grade, /next quarter/);
  assert.match(grade, /session lifetime/);
  assert.match(grade, /audit logs/);
  assert.match(grade, /without a verdict/);
  assert.equal(grade.includes(EM_DASH), false);
});

test('transcriptFromCodexEvents keeps the last agent message', () => {
  const stream = [
    JSON.stringify({ type: 'thread.started' }),
    'not json',
    JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'first' } }),
    JSON.stringify({ type: 'item.completed', item: { type: 'command_execution', text: 'ignored' } }),
    JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'second' } }),
  ].join('\n');
  assert.equal(transcriptFromCodexEvents(stream), 'second');
  assert.throws(() => transcriptFromCodexEvents('{"type":"turn.completed"}'), /No agent message/);
});

test('--run and --live refuse without the env var and do not spawn', async () => {
  let calls = 0;
  const spawnCodex = async () => { calls += 1; throw new Error('spawned'); };
  const run = await main(['--run'], {}, deps({ spawnCodex }));
  const live = await main(['--live'], {}, deps({ spawnCodex }));
  assert.equal(run.code, 2);
  assert.equal(live.code, 2);
  assert.match(run.stderr, new RegExp(LIVE_ENV_VAR));
  assert.equal(calls, 0);
});

test('prepare writes the grade sheet beside an empty install and refuses a second copy', async () => {
  const root = await temporaryDirectory('shipwright-codex-probe-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  const installed = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps());
  assert.equal(installed.code, 0, installed.stderr);
  assert.match(installed.stdout, /No session was started/);
  assert.equal(await readFile(path.join(workdir, 'AGENTS.md'), 'utf8'), 'product\n');
  const grade = await readFile(path.join(operator, 'grade-sheet.md'), 'utf8');
  assert.match(grade, /headcount/);
  await assert.rejects(readFile(path.join(workdir, 'grade-sheet.md'), 'utf8'));
  const again = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps());
  assert.equal(again.code, 1);
  assert.match(again.stderr, /not empty/);
});

test('prepare refuses an ancestor instruction file before install', async () => {
  const root = path.resolve('C:\\probe-parent');
  const workdir = path.join(root, 'job');
  const operator = path.join(root, 'job-operator');
  const hit = path.join(root, 'AGENTS.md');
  let installed = false;
  const result = await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps({
    exists: candidate => candidate === hit,
    install: async () => { installed = true; return { changes: [] }; },
  }));
  assert.equal(result.code, 1);
  assert.equal(installed, false);
  assert.match(result.stderr, /Ancestor instruction files/);
});

test('an outside instruction path stops before the five cases', async () => {
  const root = await temporaryDirectory('shipwright-codex-probe-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  assert.equal((await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps())).code, 0);
  let calls = 0;
  const spawnCodex = async ({ args }) => {
    calls += 1;
    assert.equal(args.includes('--ignore-user-config'), true);
    assert.equal(args[args.indexOf('--model') + 1], 'gpt-6-astra');
    return { code: 0, stdout: eventStream('C:\\Users\\someone\\.codex\\AGENTS.md'), stderr: '' };
  };
  const run = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnCodex }),
  );
  assert.equal(calls, 1);
  assert.match(run.stderr, /five cases were not started/);
  await assert.rejects(readFile(path.join(operator, 'transcripts', 'governance-decision.md'), 'utf8'));
});

test('a clean sterility result writes the five transcripts once', async () => {
  const root = await temporaryDirectory('shipwright-codex-probe-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  assert.equal((await main(['--prepare', '--workdir', workdir, '--operator', operator], {}, deps())).code, 0);
  let calls = 0;
  const spawnCodex = async ({ cwd, prompt }) => {
    calls += 1;
    assert.equal(cwd, workdir);
    const text = calls === 1 ? 'NONE' : `answer ${calls}`;
    assert.match(prompt, calls === 1 ? /NONE/ : /disposable acceptance test/);
    return { code: 0, stdout: eventStream(text), stderr: '' };
  };
  const run = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnCodex }),
  );
  assert.equal(run.code, 0, run.stderr);
  assert.equal(calls, 6);
  const check = await main(['--check', operator, '--workdir', workdir], {}, deps());
  assert.equal(check.code, 0, check.stdout);
  assert.match(check.stdout, /sterility: clean/);
  assert.match(check.stdout, /not scored/);
  const again = await main(
    ['--run', '--workdir', workdir, '--operator', operator],
    { [LIVE_ENV_VAR]: '1' },
    deps({ spawnCodex: async () => { throw new Error('spawned'); } }),
  );
  assert.match(again.stderr, /second pass/);
  assert.equal(calls, 6);
});

test('--check reports missing transcripts and an outside sterility path', async () => {
  const root = await temporaryDirectory('shipwright-codex-probe-');
  const workdir = path.join(root, 'work');
  const operator = path.join(root, 'operator');
  await mkdir(path.join(operator, 'transcripts'), { recursive: true });
  await writeFile(path.join(operator, 'transcripts', 'sterility.md'), 'C:\\Users\\someone\\.codex\\AGENTS.md\n', 'utf8');
  const result = await main(['--check', operator, '--workdir', workdir], {}, deps());
  assert.equal(result.code, 1);
  assert.match(result.stdout, /sterility: outside/);
  assert.match(result.stdout, /governance-decision: missing/);
  assert.equal(/\bPASS\b|\bFAIL\b/.test(result.stdout), false);
});

test('the probe stays unpackaged and contains no em dash', async () => {
  const source = await readFile(scriptPath, 'utf8');
  const note = await readFile(fileURLToPath(new URL('../docs/codex-clean-host-probe.md', import.meta.url)), 'utf8');
  const allowlist = await readFile(fileURLToPath(new URL('../scripts/build-plugin.mjs', import.meta.url)), 'utf8');
  assert.equal(source.includes(EM_DASH), false);
  assert.equal(note.includes(EM_DASH), false);
  assert.equal(allowlist.includes('codex-clean-host-probe'), false);
  assert.match(note, /No session has been started/);
  assert.match(note, /--ignore-user-config/);
  assert.match(note, /gpt-6-astra/);
  for (const item of CASES) assert.ok(note.includes(item.question), item.id);
});
