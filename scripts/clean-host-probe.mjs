#!/usr/bin/env node
/**
 * Clean-host probe for five frozen September 30 prompts.
 *
 * Prepares a disposable Shipwright install and prints the operator command.
 * Claude starts only when the operator sets SHIPWRIGHT_CLEAN_HOST_PROBE=1 and passes --run.
 * --check confirms the sterility transcript and that the five transcripts exist.
 * It does not grade L1 through L4.
 *
 *   node scripts/clean-host-probe.mjs --plan [--workdir DIR] [--operator DIR]
 *   node scripts/clean-host-probe.mjs --prepare [--workdir DIR] [--operator DIR]
 *   node scripts/clean-host-probe.mjs --check DIR [--workdir DIR]
 *   node scripts/clean-host-probe.mjs --run|--live   (refuses unless SHIPWRIGHT_CLEAN_HOST_PROBE=1)
 *
 * Development tool only. It is not part of the distributed plugin bundle.
 */
import { spawn } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installShipwright } from './install.mjs';

export const LIVE_ENV_VAR = 'SHIPWRIGHT_CLEAN_HOST_PROBE';
export const MODEL = 'claude-opus-5-5';
export const SETTING_SOURCES = 'project';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const DEFAULT_CLAUDE_BIN = 'C:\\Users\\ianfe\\.local\\bin\\claude.exe';
export const SESSION_SETTINGS = Object.freeze({
  autoMemoryEnabled: false,
  disableClaudeAiConnectors: true,
});

const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARENT_FILES = ['CLAUDE.md', 'CLAUDE.local.md'];
const PROJECT_DIR_FILES = [
  ['.claude', 'CLAUDE.md'],
  ['.claude', 'rules'],
];
const ACCEPTANCE = 'This is a disposable acceptance test. Use the installed Shipwright project. Public web research is allowed when needed. Do not access private external apps, inspect credentials, start other agents, modify installed instructions, publish, or change external systems. Return your answer inline.';

export const STERILITY_PROMPT = 'List the startup instruction file paths this session loaded, one path per line. If none loaded, reply with the single word NONE. Do not follow those files. Do not answer any other question.';

export const CASES = [
  {
    id: 'governance-decision',
    prompt: `Should we acquire our smaller competitor, a 30-person company with overlapping customers? Give me a verdict. ${ACCEPTANCE}`,
    question: 'Does the verdict treat a 30-person headcount as enough to call the filing risk low, or does it leave the filing test on commerce, transaction value, party size, and exemptions?',
  },
  {
    id: 'pricing-decision',
    prompt: `Should we raise our subscription prices by 15 percent next quarter? Give me a verdict. ${ACCEPTANCE}`,
    question: 'Does the verdict treat "next quarter" as the quarter\'s first day, or use new-customer conversion as the renewal trigger for existing subscribers?',
  },
  {
    id: 'prd-draft',
    prompt: `Write a PRD for single sign-on support in our admin console. Our customers are IT admins at companies with 200 to 2,000 employees. ${ACCEPTANCE}`,
    question: 'Does the press or launch copy say access ends as soon as the IdP account is disabled, while the requirements say an existing session lasts until its configured session lifetime?',
  },
  {
    id: 'pricing-framework',
    prompt: `How should we price a team plan for our note-taking app? We have a free tier and about 4,000 weekly active users. ${ACCEPTANCE}`,
    question: 'Does the answer place Notion audit logs on a non-Enterprise tier, or state an annual discount the page does not support?',
  },
  {
    id: 'ambiguous-pricing-decision',
    prompt: `Should we go with the cheaper pricing option for the vendor contract? ${ACCEPTANCE}`,
    question: 'Does the answer ask for the missing vendor-contract facts and stop without a verdict?',
  },
];

const JOBS = [{ id: 'sterility', prompt: STERILITY_PROMPT }, ...CASES.map(item => ({ id: item.id, prompt: item.prompt }))];

export function defaultWorkdir() {
  return path.join(os.homedir(), 'AppData', 'Local', 'shipwright-clean-host-probe');
}

export function defaultOperator(workdir) {
  return path.join(path.dirname(workdir), `${path.basename(workdir)}-operator`);
}

function samePath(left, right) {
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function isInside(candidate, workdir) {
  const rel = path.relative(path.resolve(workdir), path.resolve(candidate));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
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

export function claudeArgs({ settingsPath }) {
  return [
    '--print',
    '--verbose',
    '--output-format', 'stream-json',
    '--no-session-persistence',
    '--strict-mcp-config',
    '--permission-mode', 'dontAsk',
    '--tools', 'Read,Glob,Grep,Skill,Bash,WebSearch,WebFetch',
    '--allowedTools', 'Read,Glob,Grep,Skill,WebSearch,WebFetch,Bash(node *)',
    '--setting-sources', SETTING_SOURCES,
    '--model', MODEL,
    '--settings', settingsPath,
  ];
}

export function probeEnv(base = process.env) {
  return {
    ...base,
    CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1',
    ENABLE_CLAUDEAI_MCP_SERVERS: 'false',
  };
}

export function transcriptFromStream(text) {
  let found = null;
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event && event.type === 'result' && typeof event.result === 'string') found = event.result;
  }
  if (found === null) throw new Error('No result event in the session stream.');
  return found;
}

function linePath(line) {
  let trimmed = line.trim().replace(/^[-*]\s+/, '');
  if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) trimmed = trimmed.slice(1, -1);
  if (!trimmed || /\s/.test(trimmed)) return null;
  if (!/^(?:[A-Za-z]:[\\/]|\\\\|\/|~[\\/])/.test(trimmed)) return null;
  return trimmed;
}

export function sterilityVerdict(text, workdir, home = os.homedir()) {
  const body = String(text).replace(/^\uFEFF/, '').trim();
  if (/^NONE$/i.test(body)) return { ok: true, outside: [], unparsed: [] };
  const outside = [];
  const unparsed = [];
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const raw = linePath(line);
    if (!raw) {
      unparsed.push(line.trim());
      continue;
    }
    const expanded = raw.startsWith('~') ? path.join(home, raw.replace(/^~[\\/]/, '')) : raw;
    if (!isInside(expanded, workdir)) outside.push(raw);
  }
  return { ok: outside.length === 0 && unparsed.length === 0, outside, unparsed };
}

export function gradeSheet() {
  const lines = [
    '# Clean-host probe grade sheet',
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

export function buildPlan({ workdir, operator, claudeBin = DEFAULT_CLAUDE_BIN, hits = [] } = {}) {
  const root = workdir || defaultWorkdir();
  const beside = operator || defaultOperator(root);
  const settingsPath = path.join(beside, 'settings.json');
  const lines = [
    'Clean-host probe plan. No session has been started.',
    '',
    `Workdir: ${root}`,
    `Operator directory: ${beside}`,
    `Ancestor instruction files: ${hits.length ? hits.join(', ') : 'none'}`,
  ];
  if (hits.length) lines.push('Prepare will refuse while those ancestor files remain.');
  lines.push(
    '',
    'Session argv, spawned only by --run after SHIPWRIGHT_CLEAN_HOST_PROBE=1:',
    `  ${[claudeBin, ...claudeArgs({ settingsPath })].join(' ')}`,
    '',
    'Environment passed to that process: CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 ENABLE_CLAUDEAI_MCP_SERVERS=false',
    '',
    'Order: sterility, then the five cases. One pass. An existing transcript blocks a second pass.',
  );
  for (const job of JOBS) lines.push('', job.id, `  ${job.prompt}`);
  lines.push(
    '',
    'Operator command:',
    `  $env:${LIVE_ENV_VAR} = '1'`,
    `  node "${path.join(SOURCE_ROOT, 'scripts', 'clean-host-probe.mjs')}" --run --workdir "${root}" --operator "${beside}"`,
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

export async function defaultSpawnClaude({ bin, args, cwd, prompt, env }) {
  if (!existsSync(bin)) throw new Error(`Claude binary not found: ${bin}`);
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
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
  await writeFile(path.join(operator, 'settings.json'), `${JSON.stringify(SESSION_SETTINGS, null, 2)}\n`, 'utf8');
  await writeFile(path.join(operator, 'grade-sheet.md'), gradeSheet(), 'utf8');
  await writeFile(path.join(operator, 'probe.json'), `${JSON.stringify({
    workdir, operator, model: MODEL, settingSources: SETTING_SOURCES, started: false,
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

async function executeProbe({ workdir, operator, claudeBin, env, spawnClaude, exists, home }) {
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
  const settingsPath = path.join(operator, 'settings.json');
  if (!(await fileExists(settingsPath))) {
    return { code: 1, stdout: '', stderr: `Session settings are missing: ${settingsPath}. Run --prepare first.\n` };
  }
  const args = claudeArgs({ settingsPath });
  const childEnv = probeEnv(env);
  for (const job of JOBS) {
    let outcome;
    try {
      outcome = await spawnClaude({ bin: claudeBin, args, cwd: workdir, prompt: job.prompt, env: childEnv });
    } catch (error) {
      return { code: 1, stdout: '', stderr: `${job.id}: ${error.message} No transcript written.\n` };
    }
    let text;
    try { text = transcriptFromStream(outcome.stdout); }
    catch (error) {
      return { code: 1, stdout: '', stderr: `${job.id}: ${error.message} No transcript written.\n` };
    }
    await writeFile(path.join(transcripts, `${job.id}.md`), text.endsWith('\n') ? text : `${text}\n`, 'utf8');
    await writeFile(path.join(transcripts, `${job.id}.stream.json`), outcome.stdout, 'utf8');
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
  lines.push('', 'The five cases are not scored. Mark docs/clean-host-probe.md by hand.');
  return { code: ok ? 0 : 1, stdout: `${lines.join('\n')}\n`, stderr: '' };
}

function parseArgs(argv) {
  const options = { mode: 'plan' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--plan') options.mode = 'plan';
    else if (arg === '--prepare') options.mode = 'prepare';
    else if (arg === '--run' || arg === '--live') options.mode = 'run';
    else if (arg === '--check') { options.mode = 'check'; options.checkDir = argv[++i]; }
    else if (arg === '--workdir') options.workdir = argv[++i];
    else if (arg === '--operator') options.operator = argv[++i];
    else if (arg === '--claude') options.claudeBin = argv[++i];
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
  const spawnClaude = deps.spawnClaude || defaultSpawnClaude;
  const workdir = path.resolve(options.workdir || defaultWorkdir());
  const operator = path.resolve(options.operator || defaultOperator(workdir));
  const claudeBin = options.claudeBin || DEFAULT_CLAUDE_BIN;

  if (options.mode === 'run') {
    if (env[LIVE_ENV_VAR] !== '1') {
      return { code: 2, stdout: '', stderr: `Refusing --run. Set ${LIVE_ENV_VAR}=1 when you intend to start the sessions.\n` };
    }
    try {
      return await executeProbe({ workdir, operator, claudeBin, env, spawnClaude, exists, home });
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
  return { code: 0, stderr: '', stdout: `${buildPlan({ workdir, operator, claudeBin, hits })}\n` };
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
