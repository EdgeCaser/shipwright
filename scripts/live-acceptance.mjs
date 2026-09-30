#!/usr/bin/env node
/**
 * Live acceptance harness for Shipwright on Claude Code and Codex.
 *
 * This script never starts an agent. It prints the steps an operator runs by hand,
 * then grades the transcripts the operator saved. All grading is offline.
 *
 *   node scripts/live-acceptance.mjs --plan [--agent claude|codex] [--workdir DIR] [--out DIR]
 *   node scripts/live-acceptance.mjs --prepare [--agent claude|codex] [--workdir DIR]
 *   node scripts/live-acceptance.mjs --check DIR
 *   node scripts/live-acceptance.mjs --live        (refuses unless SHIPWRIGHT_LIVE_ACCEPTANCE=1)
 *
 * Development tool only. It is not part of the distributed plugin bundle.
 */
import { readFile, readdir, mkdtemp, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import { validateArtifact } from './validate-artifact.mjs';
import { installShipwright } from './install.mjs';

export const LIVE_ENV_VAR = 'SHIPWRIGHT_LIVE_ACCEPTANCE';
const EM_DASH = String.fromCharCode(0x2014);
const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CLOSING_BLOCKS = [
  { label: 'Decision Frame', pattern: /Decision Frame/i },
  { label: 'Unknowns & Evidence Gaps', pattern: /Unknowns\s*(?:&|and)\s*Evidence Gaps/i },
  { label: 'Pass/Fail Readiness', pattern: /Pass\s*\/\s*Fail Readiness/i },
  { label: 'Recommended Next Artifact', pattern: /Recommended Next Artifact/i },
];

const label = name => ({ label: `${name} section`, pattern: new RegExp(`^[\\s#>*_-]*${name}\\b`, 'm') });
const DECISION_SECTIONS = ['RECOMMENDATION', 'CONFIDENCE', 'NEEDS_HUMAN_REVIEW', 'SUMMARY', 'KEY_REASONING'].map(label);

// Each prompt avoids double quotes, dollar signs and backticks so it is safe inside a double-quoted shell argument.
export const PROMPTS = [
  {
    id: 'market-sizing',
    title: 'Plain-language routing to market sizing',
    prompt: 'We are a 12-person startup selling churn-prediction software to mid-market SaaS companies. Estimate the TAM, SAM and SOM for our first two years.',
    has: [
      { label: 'TAM', pattern: /\bTAM\b/ },
      { label: 'SAM', pattern: /\bSAM\b/ },
      { label: 'SOM', pattern: /\bSOM\b/ },
      { label: 'stated assumptions', pattern: /assum/i },
    ],
    closing: true,
  },
  {
    id: 'pricing-framework',
    title: 'Plain-language routing to pricing strategy',
    prompt: 'How should we price a team plan for our note-taking app? We have a free tier and about 4,000 weekly active users.',
    has: [
      { label: 'pricing content', pattern: /pric/i },
      { label: 'value metric, tiers or willingness to pay', pattern: /value metric|tier|willingness to pay|packag/i },
    ],
    closing: true,
  },
  {
    id: 'prd-draft',
    title: 'Plain-language routing to a PRD',
    prompt: 'Write a PRD for single sign-on support in our admin console. Our customers are IT admins at companies with 200 to 2,000 employees.',
    has: [
      { label: 'problem or context section', pattern: /^[\s#>*_-]*(?:\d+\.\s*)?(?:Problem|Context|Background)/im },
      { label: 'success metrics', pattern: /success metrics?|metrics?/i },
      { label: 'scope or out of scope', pattern: /out of scope|non-goals?|scope/i },
    ],
    closing: true,
  },
  {
    id: 'competitive-landscape',
    title: 'Plain-language routing to competitive landscape',
    prompt: 'Who are the main competitors for a lightweight invoicing tool aimed at freelancers, and where are the gaps we could exploit?',
    has: [
      { label: 'competitors', pattern: /competitor/i },
      { label: 'positioning or gaps', pattern: /positioning|differentiat|gap/i },
    ],
    closing: true,
  },
  {
    id: 'governance-decision',
    title: 'High-stakes governance decision with stress-test offer',
    prompt: 'Should we acquire our smaller competitor, a 30-person company with overlapping customers? Give me a verdict.',
    has: [
      ...DECISION_SECTIONS,
      { label: 'scenario class named as governance', pattern: /governance/i },
      { label: 'stress-test offer', pattern: /stress-test/i },
    ],
    closing: true,
  },
  {
    id: 'pricing-decision',
    title: 'High-stakes pricing decision',
    prompt: 'Should we raise our subscription prices by 15 percent next quarter? Give me a verdict.',
    has: [
      ...DECISION_SECTIONS,
      { label: 'scenario class named as pricing', pattern: /pricing/i },
    ],
    closing: true,
  },
  {
    id: 'build-vs-buy-decision',
    title: 'High-stakes build versus buy decision',
    prompt: 'Should we go build versus buy for our billing engine? Give me a verdict.',
    has: [
      ...DECISION_SECTIONS,
      { label: 'scenario class named as product_strategy', pattern: /product[_ ]strategy/i },
    ],
    closing: true,
  },
  {
    id: 'ambiguous-pricing-decision',
    title: 'Ambiguous pricing should-we question gets a clarification',
    prompt: 'Should we go with the cheaper pricing option for the vendor contract?',
    has: [
      { label: 'asks a clarifying question or requests the missing details', pattern: /\?|\b(?:clarify|clarification|tell me|let me know|need to know|missing details|more details)\b/i },
    ],
    forbid: [
      { label: 'no verdict issued before clarifying', pattern: /^[\s#>*_-]*RECOMMENDATION\b/m },
    ],
  },
  {
    id: 'coding-question',
    title: 'Non-Shipwright coding question stays in normal coding mode',
    prompt: 'In JavaScript, write a debounce function and explain why it needs clearTimeout.',
    has: [
      { label: 'code block', pattern: /```/ },
      { label: 'mentions clearTimeout', pattern: /clearTimeout/ },
    ],
    forbid: [
      { label: 'no Shipwright decision sections', pattern: /^[\s#>*_-]*(?:RECOMMENDATION|NEEDS_HUMAN_REVIEW)\b/m },
      ...CLOSING_BLOCKS.map(block => ({ label: `no ${block.label} block`, pattern: block.pattern })),
    ],
  },
  {
    id: 'structured-prd-artifact',
    title: 'Structured PRD artifact that passes the validator',
    prompt: 'Write a PRD for self-serve SSO and append the structured artifact block for an automated consumer, following docs/structured-artifacts.md.',
    has: [
      { label: 'structured artifact block', pattern: /<!--\s*shipwright:artifact/ },
    ],
    closing: true,
    validator: { artifactType: 'prd', expectStructured: true },
  },
];

function shellQuote(text) {
  return `"${text.replace(/(["\\$`])/g, '\\$1')}"`;
}

export function agentCommand(agent, prompt) {
  if (agent === 'claude') return `claude -p ${shellQuote(prompt)}`;
  if (agent === 'codex') return `codex exec ${shellQuote(prompt)}`;
  throw new Error(`Unknown agent: ${agent}. Use claude or codex.`);
}

function conditionsOf(entry) {
  const list = [
    ...(entry.has || []).map(item => `has ${item.label}`),
    ...(entry.closing ? CLOSING_BLOCKS.map(block => `has closing block ${block.label}`) : []),
    ...(entry.forbid || []).map(item => `forbids: ${item.label}`),
    'no em dash',
  ];
  if (entry.validator) list.push(`validator passes (${entry.validator.artifactType}, structured block required)`);
  return list;
}

export function describeConditions(entry) {
  return conditionsOf(entry);
}

export function gradeTranscript(entry, text) {
  const failures = [];
  if (!text || text.trim().length < 40) failures.push('transcript is empty or too short');
  for (const item of entry.has || []) if (!item.pattern.test(text)) failures.push(`missing ${item.label}`);
  if (entry.closing) {
    for (const block of CLOSING_BLOCKS) if (!block.pattern.test(text)) failures.push(`missing closing block: ${block.label}`);
  }
  for (const item of entry.forbid || []) if (item.pattern.test(text)) failures.push(`forbidden: ${item.label}`);
  const dashAt = text.indexOf(EM_DASH);
  if (dashAt >= 0) failures.push(`em dash present at offset ${dashAt}`);
  if (entry.validator) {
    const result = validateArtifact(text, { artifactType: entry.validator.artifactType, expectStructured: entry.validator.expectStructured });
    if (!result.valid) {
      const errors = result.issues.filter(issue => issue.severity === 'error').slice(0, 3).map(issue => `${issue.type}: ${issue.message}`);
      failures.push(`validator failed: ${errors.join('; ') || result.summary}`);
    }
  }
  return { id: entry.id, pass: failures.length === 0, failures };
}

export async function checkDirectory(dir, prompts = PROMPTS) {
  const results = [];
  for (const entry of prompts) {
    let text;
    try { text = await readFile(path.join(dir, `${entry.id}.md`), 'utf8'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      results.push({ id: entry.id, pass: false, failures: [`missing transcript ${entry.id}.md`] });
      continue;
    }
    results.push(gradeTranscript(entry, text));
  }
  return results;
}

export function buildPlan({ agent = 'claude', workdir = '<workdir>', out } = {}) {
  agentCommand(agent, 'probe');
  const transcripts = out || path.join(workdir, 'transcripts');
  const lines = [
    `Shipwright live acceptance plan (${agent}). Nothing below has been run.`,
    '',
    'Setup',
    `  1. Create an empty disposable directory, never a real project: ${workdir}`,
    `  2. Preview and apply the repo installer into it:`,
    `       node "${path.join(SOURCE_ROOT, 'scripts/install.mjs')}" "${workdir}"`,
    `       node "${path.join(SOURCE_ROOT, 'scripts/install.mjs')}" "${workdir}" --apply`,
    `  3. Create the transcript folder: ${transcripts}`,
    `  4. Restart or reload ${agent} in ${workdir} so it discovers the installed skills.`,
    '',
    `Prompts (run each from ${workdir}; save the full reply as <id>.md in the transcript folder)`,
  ];
  PROMPTS.forEach((entry, index) => {
    lines.push('', `  ${index + 1}. ${entry.id}: ${entry.title}`,
      `       ${agentCommand(agent, entry.prompt)} > "${path.join(transcripts, `${entry.id}.md`)}"`);
  });
  lines.push('', 'Grade', `  node scripts/live-acceptance.mjs --check "${transcripts}"`, '',
    'Cleanup', `  Delete ${workdir} when finished.`);
  return lines.join('\n');
}

export function formatTable(results) {
  const width = Math.max(...results.map(result => result.id.length), 2);
  const rows = results.map(result => `${result.id.padEnd(width)}  ${result.pass ? 'PASS' : 'FAIL'}${result.pass ? '' : '  ' + result.failures.join(' | ')}`);
  const passed = results.filter(result => result.pass).length;
  return [...rows, '', `${passed}/${results.length} passed`].join('\n');
}

function parseArgs(argv) {
  const options = { mode: 'plan', agent: 'claude' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--plan') options.mode = 'plan';
    else if (arg === '--prepare') options.mode = 'prepare';
    else if (arg === '--live') options.mode = 'live';
    else if (arg === '--check') { options.mode = 'check'; options.checkDir = argv[++i]; }
    else if (arg === '--agent') options.agent = argv[++i];
    else if (arg === '--workdir') options.workdir = argv[++i];
    else if (arg === '--out') options.out = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { return { code: 2, stdout: '', stderr: error.message + '\n' }; }
  if (!['claude', 'codex'].includes(options.agent)) return { code: 2, stdout: '', stderr: `Unknown agent: ${options.agent}. Use claude or codex.\n` };

  if (options.mode === 'live') {
    if (env[LIVE_ENV_VAR] !== '1') {
      return { code: 2, stdout: '', stderr: `Refusing --live. Live sessions need the maintainer's authorization; set ${LIVE_ENV_VAR}=1 to acknowledge it.\n` };
    }
    return { code: 0, stderr: '', stdout: 'Live running is the operator\'s step. This script does not start agents. Use --plan for the commands, run them yourself, then grade with --check.\n' };
  }

  if (options.mode === 'check') {
    if (!options.checkDir) return { code: 2, stdout: '', stderr: '--check needs a transcript directory.\n' };
    try { await readdir(options.checkDir); }
    catch { return { code: 1, stdout: '', stderr: `Cannot read transcript directory: ${options.checkDir}\n` }; }
    const results = await checkDirectory(options.checkDir);
    return { code: results.every(result => result.pass) ? 0 : 1, stdout: formatTable(results) + '\n', stderr: '' };
  }

  if (options.mode === 'prepare') {
    // Installs with the repo installer into a disposable directory. No agent is started.
    const own = !options.workdir;
    const workdir = options.workdir ? path.resolve(options.workdir) : await mkdtemp(path.join(os.tmpdir(), 'shipwright-live-'));
    try {
      if (!own) {
        await mkdir(workdir, { recursive: true });
        if ((await readdir(workdir)).length) return { code: 1, stdout: '', stderr: `Workdir is not empty: ${workdir}\n` };
      }
      const result = await installShipwright(workdir, { apply: true });
      return { code: 0, stderr: '', stdout: `Installed ${result.changes.length} files into ${workdir}${own ? ' (temporary, removed on exit)' : ''}.\n` };
    } catch (error) {
      return { code: 1, stdout: '', stderr: error.message + '\n' };
    } finally {
      if (own) await rm(workdir, { recursive: true, force: true });
    }
  }

  return { code: 0, stderr: '', stdout: buildPlan({ agent: options.agent, workdir: options.workdir ? path.resolve(options.workdir) : undefined, out: options.out ? path.resolve(options.out) : undefined }) + '\n' };
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
