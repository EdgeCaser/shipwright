#!/usr/bin/env node
/**
 * Codex clean-host probe for the five frozen September 30 prompts.
 *
 * Prepares a disposable Shipwright install and prints the operator command.
 * Codex starts only when the operator sets SHIPWRIGHT_CODEX_CLEAN_HOST_PROBE=1 and passes --run.
 * --check confirms the sterility transcript and that the five transcripts exist.
 * It does not grade the five cases.
 *
 *   node scripts/codex-clean-host-probe.mjs --plan [--workdir DIR] [--operator DIR]
 *   node scripts/codex-clean-host-probe.mjs --prepare [--workdir DIR] [--operator DIR]
 *   node scripts/codex-clean-host-probe.mjs --check DIR [--workdir DIR]
 *   node scripts/codex-clean-host-probe.mjs --run|--live   (refuses unless the env var is 1)
 *
 * Development tool only. It is not part of the distributed plugin bundle.
 * It does not edit the Claude probe or the shared instruction files.
 */
import { spawn } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CASES, STERILITY_PROMPT, sterilityVerdict } from './clean-host-probe.mjs';
import { installShipwright } from './install.mjs';

export { CASES, STERILITY_PROMPT };

export const LIVE_ENV_VAR = 'SHIPWRIGHT_CODEX_CLEAN_HOST_PROBE';
export const MODEL = 'gpt-6-astra';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const DEFAULT_CODEX_JS = 'C:\\Users\\ianfe\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js';

const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARENT_FILES = ['AGENTS.md', 'AGENTS.override.md'];
const PROJECT_DIR_FILES = [['.codex', 'AGENTS.md']];
const JOBS = [{ id: 'sterility', prompt: STERILITY_PROMPT }, ...CASES.map(item => ({ id: item.id, prompt: item.prompt }))];

export function defaultWorkdir() {
  return path.join(path.parse(process.cwd()).root, 'shipwright-codex-clean-host-probe');
}

export function defaultOperator(workdir) {
  return path.join(path.dirname(workdir), `${path.basename(workdir)}-operator`);
}

function samePath(left, right) {
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

export function ancestorInstructionHits(workdir, { exists = existsSync, home = os.homedir() } = {}) {
  const hits = [];
  const seen = new Set();
  let current = path.resolve(workdir);
  while (true) {
    const parent = path.dirname(current);
    if (samePath(parent, current) || seen.has(parent)) break;
    seen.add(parent);
    for (const name of PARENT_FILES) {
      const candidate = path.join(parent, name);
      if (exists(candidate)) hits.push(candidate);
    }
    if (!samePath(parent, home)) {
      for (const parts of PROJECT_DIR_FILES) {
        const candidate = path.join(parent, ...parts);
        if (exists(candidate)) hits.push(candidate);
      }
    }
    current = parent;
  }
  return hits;
}

export function codexArgs({ messagePath, workdir, codexJs = DEFAULT_CODEX_JS }) {
  return [
    codexJs,
    'exec',
    '--ephemeral',
    '--skip-git-repo-check',
    '--sandbox', 'workspace-write',
    '--cd', workdir,
    '--json',
    '--output-last-message', messagePath,
    '--ignore-user-config',
    '--ignore-rules',
    '-c', 'windows.sandbox="unelevated"',
    '--model', MODEL,
    '-',
  ];
}

export function transcriptFromCodexEvents(text) {
  let found = null;
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    const item = event && event.item;
    if (event && event.type === 'item.completed' && item && item.type === 'agent_message' && typeof item.text === 'string') {
      found = item.text;
    }
  }
  if (found === null) throw new Error('No agent message in the Codex event stream.');
  return found;
}

export function gradeSheet() {
  const lines = [
    '# Codex clean-host probe grade sheet',
    '',
    'Mark each question after reading the transcript. This sheet is not a score. The script does not answer these questions.',
    '',
    '## sterility',
    '',
    'The sterility transcript should be the single word NONE, or absolute paths that all sit inside the workdir. An outside path means the five transcripts stay unused.',
    '',
  ];
  for (const item of CASES) {
    lines.push(`## ${item.id}`, '', item.question, '', 'Mark:', '', 'Notes:', '');
  }
  return lines.join('\n');
}

export function buildPlan({ workdir, operator, codexJs = DEFAULT_CODEX_JS, hits = [] } = {}) {
  const root = workdir || defaultWorkdir();
  const beside = operator || defaultOperator(root);
  const sampleMessage = path.join(beside, 'transcripts', 'sterility.md');
  const lines = [
    'Codex clean-host probe plan. No session has been started.',
    '',
    `Workdir: ${root}`,
    `Operator directory: ${beside}`,
    `Ancestor instruction files: ${hits.length ? hits.join(', ') : 'none'}`,
  ];
  if (hits.length) lines.push('Prepare will refuse while those ancestor files remain.');
  lines.push(
    '',
    'Session argv, spawned only by --run after SHIPWRIGHT_CODEX_CLEAN_HOST_PROBE=1:',
    `  ${[process.execPath, ...codexArgs({ messagePath: sampleMessage, workdir: root, codexJs })].join(' ')}`,
    '',
    'The prompt is the process stdin. User config.toml and execpolicy rules are not loaded. windows.sandbox is unelevated so a command can read the install. The September 30 xhigh effort lived in user config, so this command does not set it.',
    '',
    'Order: sterility, then the five cases. One pass. An existing transcript blocks a second pass.',
  );
  for (const job of JOBS) lines.push('', job.id, `  ${job.prompt}`);
  lines.push(
    '',
    'Operator command:',
    `  $env:${LIVE_ENV_VAR} = '1'`,
    `  node "${path.join(SOURCE_ROOT, 'scripts', 'codex-clean-host-probe.mjs')}" --run --workdir "${root}" --operator "${beside}"`,
    '',
    'Grade the five transcripts by hand. This script does not score them.',
  );
  return lines.join('\n');
}

async function fileExists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function defaultSpawnCodex({ nodeBin = process.execPath, args, cwd, prompt }) {
  const codexJs = args[0];
  if (!existsSync(codexJs)) throw new Error(`Codex entrypoint not found: ${codexJs}`);
  return new Promise((resolve, reject) => {
    const child = spawn(nodeBin, args, { cwd, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    let settled = false;
    const timer = setTimeout(() => {
      child.kill();
      if (settled) return;
      settled = true;
      reject(new Error(`Session timed out after ${SESSION_TIMEOUT_MS}ms`));
    }, SESSION_TIMEOUT_MS);
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    child.stdout.on('data', chunk => out.push(chunk));
    child.stderr.on('data', chunk => err.push(chunk));
    child.on('error', error => finish(reject, error));
    child.on('close', code => finish(resolve, {
      code,
      stdout: Buffer.concat(out).toString('utf8'),
      stderr: Buffer.concat(err).toString('utf8'),
    }));
    child.stdin.end(prompt, 'utf8');
  });
}

async function readTranscript(messagePath, stdout) {
  try {
    const written = await readFile(messagePath, 'utf8');
    if (written.trim()) return written.endsWith('\n') ? written : `${written}\n`;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const text = transcriptFromCodexEvents(stdout);
  return text.endsWith('\n') ? text : `${text}\n`;
}

async function prepareProbe({ workdir, operator, exists, home, install }) {
  const hits = ancestorInstructionHits(workdir, { exists, home });
  if (hits.length) {
    return { code: 1, stdout: '', stderr: `Refusing to prepare. Ancestor instruction files:\n${hits.map(hit => `  ${hit}`).join('\n')}\n` };
  }
  await mkdir(workdir, { recursive: true });
  await mkdir(operator, { recursive: true });
  if ((await readdir(workdir)).length) return { code: 1, stdout: '', stderr: `Workdir is not empty: ${workdir}\n` };
  if ((await readdir(operator)).length) return { code: 1, stdout: '', stderr: `Operator directory is not empty: ${operator}\n` };
  const installed = await install(workdir, { apply: true });
  await writeFile(path.join(operator, 'grade-sheet.md'), gradeSheet(), 'utf8');
  await writeFile(path.join(operator, 'probe.json'), `${JSON.stringify({
    workdir, operator, model: MODEL, ignoreUserConfig: true, ignoreRules: true, windowsSandbox: 'unelevated', started: false,
  }, null, 2)}\n`, 'utf8');
  const prompts = path.join(operator, 'prompts');
  await mkdir(prompts, { recursive: true });
  await writeFile(path.join(prompts, 'sterility.txt'), `${STERILITY_PROMPT}\n`, 'utf8');
  for (const item of CASES) await writeFile(path.join(prompts, `${item.id}.txt`), `${item.prompt}\n`, 'utf8');
  return {
    code: 0,
    stderr: '',
    stdout: [
      `Installed ${installed.changes.length} files into ${workdir}.`,
      `Operator files are in ${operator}.`,
      'No session was started.',
      '',
      buildPlan({ workdir, operator, hits }),
      '',
    ].join('\n'),
  };
}

async function executeProbe({ workdir, operator, codexJs, spawnCodex, exists, home }) {
  const hits = ancestorInstructionHits(workdir, { exists, home });
  if (hits.length) {
    return { code: 1, stdout: '', stderr: `Refusing to start. Ancestor instruction files:\n${hits.map(hit => `  ${hit}`).join('\n')}\n` };
  }
  const transcripts = path.join(operator, 'transcripts');
  await mkdir(transcripts, { recursive: true });
  const existing = [];
  for (const job of JOBS) {
    if (await fileExists(path.join(transcripts, `${job.id}.md`))) existing.push(job.id);
  }
  if (existing.length) {
    return { code: 1, stdout: '', stderr: `Refusing a second pass. Transcripts already exist: ${existing.join(', ')}.\n` };
  }
  for (const job of JOBS) {
    const messagePath = path.join(transcripts, `${job.id}.md`);
    const args = codexArgs({ messagePath, workdir, codexJs });
    let outcome;
    try {
      outcome = await spawnCodex({ args, cwd: workdir, prompt: job.prompt });
    } catch (error) {
      return { code: 1, stdout: '', stderr: `${job.id}: ${error.message} No transcript written.\n` };
    }
    let text;
    try { text = await readTranscript(messagePath, outcome.stdout); }
    catch (error) {
      return { code: 1, stdout: '', stderr: `${job.id}: ${error.message} No transcript written.\n` };
    }
    await writeFile(messagePath, text, 'utf8');
    await writeFile(path.join(transcripts, `${job.id}.events.jsonl`), outcome.stdout, 'utf8');
    await writeFile(path.join(transcripts, `${job.id}.stderr.txt`), outcome.stderr || '', 'utf8');
    await writeFile(path.join(transcripts, `${job.id}.meta.json`), `${JSON.stringify({ exitCode: outcome.code }, null, 2)}\n`, 'utf8');
    if (job.id === 'sterility') {
      const verdict = sterilityVerdict(text, workdir, home);
      if (!verdict.ok) {
        const detail = [...verdict.outside, ...verdict.unparsed].join('\n');
        return { code: 1, stdout: '', stderr: `Sterility transcript is not limited to the workdir. The five cases were not started.\n${detail}\n` };
      }
    }
  }
  return { code: 0, stderr: '', stdout: `Wrote ${JOBS.length} transcripts to ${transcripts}. Grade the five cases by hand. This script does not score them.\n` };
}

export async function checkProbe(operator, workdir) {
  let root = workdir;
  if (!root) {
    try {
      const meta = JSON.parse(await readFile(path.join(operator, 'probe.json'), 'utf8'));
      if (meta && typeof meta.workdir === 'string') root = meta.workdir;
    } catch (error) {
      if (error.code !== 'ENOENT') return { code: 1, stdout: '', stderr: `${error.message}\n` };
    }
  }
  if (!root) return { code: 2, stdout: '', stderr: '--check needs the workdir in probe.json or --workdir.\n' };
  const transcripts = path.join(operator, 'transcripts');
  const lines = [];
  let ok = true;
  let sterilityText = null;
  try { sterilityText = await readFile(path.join(transcripts, 'sterility.md'), 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (sterilityText === null) {
    ok = false;
    lines.push('sterility: missing');
  } else {
    const verdict = sterilityVerdict(sterilityText, root);
    if (verdict.ok) lines.push('sterility: clean');
    else {
      ok = false;
      lines.push(`sterility: outside or unparsed (${[...verdict.outside, ...verdict.unparsed].join('; ')})`);
    }
  }
  for (const item of CASES) {
    let text = null;
    try { text = await readFile(path.join(transcripts, `${item.id}.md`), 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (text === null) {
      ok = false;
      lines.push(`${item.id}: missing`);
    } else if (!text.trim()) {
      ok = false;
      lines.push(`${item.id}: empty`);
    } else lines.push(`${item.id}: present`);
  }
  lines.push('', 'The five cases are not scored. Mark docs/codex-clean-host-probe.md by hand.');
  return { code: ok ? 0 : 1, stdout: `${lines.join('\n')}\n`, stderr: '' };
}

function parseArgs(argv) {
  const options = { mode: 'plan' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--plan') options.mode = 'plan';
    else if (arg === '--prepare') options.mode = 'prepare';
    else if (arg === '--run' || arg === '--live') options.mode = 'run';
    else if (arg === '--check') { options.mode = 'check'; options.checkDir = argv[i += 1]; }
    else if (arg === '--workdir') options.workdir = argv[i += 1];
    else if (arg === '--operator') options.operator = argv[i += 1];
    else if (arg === '--codex') options.codexJs = argv[i += 1];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.mode === 'check' && !options.checkDir) throw new Error('--check needs the operator directory.');
  return options;
}

export async function main(argv = process.argv.slice(2), env = process.env, deps = {}) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { return { code: 2, stdout: '', stderr: `${error.message}\n` }; }
  const exists = deps.exists || existsSync;
  const home = deps.home || os.homedir();
  const install = deps.install || installShipwright;
  const spawnCodex = deps.spawnCodex || defaultSpawnCodex;
  const workdir = path.resolve(options.workdir || defaultWorkdir());
  const operator = path.resolve(options.operator || defaultOperator(workdir));
  const codexJs = options.codexJs || DEFAULT_CODEX_JS;

  if (options.mode === 'run') {
    if (env[LIVE_ENV_VAR] !== '1') {
      return { code: 2, stdout: '', stderr: `Refusing --run. Set ${LIVE_ENV_VAR}=1 when you intend to start the sessions.\n` };
    }
    try {
      return await executeProbe({ workdir, operator, codexJs, spawnCodex, exists, home });
    } catch (error) {
      return { code: 1, stdout: '', stderr: `${error.message}\n` };
    }
  }

  if (options.mode === 'check') {
    try { return await checkProbe(path.resolve(options.checkDir), options.workdir ? workdir : undefined); }
    catch (error) { return { code: 1, stdout: '', stderr: `${error.message}\n` }; }
  }

  const hits = ancestorInstructionHits(workdir, { exists, home });
  if (options.mode === 'prepare') {
    try { return await prepareProbe({ workdir, operator, exists, home, install }); }
    catch (error) { return { code: 1, stdout: '', stderr: `${error.message}\n` }; }
  }
  return { code: 0, stderr: '', stdout: `${buildPlan({ workdir, operator, codexJs, hits })}\n` };
}

function isDirectRun() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (process.argv[1] && isDirectRun()) {
  const { code, stdout, stderr } = await main();
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  process.exitCode = code;
}
