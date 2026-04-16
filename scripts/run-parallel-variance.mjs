#!/usr/bin/env node

import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  DEFAULT_SCENARIO_DIR,
  loadBenchmarkScenario,
} from './run-benchmarks.mjs';

const VALID_FORMATS = new Set(['text', 'json']);
const VALID_VARIANCE_LEVELS = new Set([
  'stable',
  'moderate_drift',
  'high_drift',
  'execution_error',
]);
const VARIANCE_RANK = {
  stable: 0,
  moderate_drift: 1,
  high_drift: 2,
  execution_error: 3,
};

export async function loadPromptSource(options = {}) {
  const prompt = typeof options.prompt === 'string' ? options.prompt : '';
  const promptFile = typeof options.promptFile === 'string' ? options.promptFile : '';
  const scenarioArg = typeof options.scenario === 'string' ? options.scenario : '';
  const provided = [prompt, promptFile, scenarioArg].filter((entry) => entry.trim().length > 0);

  if (provided.length !== 1) {
    throw new Error(
      'Provide exactly one of --prompt, --prompt-file, or --scenario.',
    );
  }

  if (prompt.trim().length > 0) {
    return {
      type: 'prompt',
      label: 'inline-prompt',
      prompt,
      scenario_id: null,
    };
  }

  if (promptFile.trim().length > 0) {
    const resolved = path.resolve(promptFile);
    return {
      type: 'prompt-file',
      label: resolved,
      prompt: await readFile(resolved, 'utf8'),
      scenario_id: null,
    };
  }

  const scenarioPath = resolveScenarioPath(
    scenarioArg,
    options.scenarioDir || DEFAULT_SCENARIO_DIR,
  );
  const scenario = await loadBenchmarkScenario(scenarioPath);
  return {
    type: 'benchmark-scenario',
    label: scenario.id,
    prompt: scenario.inputs.prompt,
    scenario_id: scenario.id,
    scenario_title: scenario.title,
    scenario_path: scenario.source_path,
  };
}

export async function runParallelVariance(options = {}) {
  const command = normalizeNonEmptyString(options.command, '--command');
  const promptSource = await loadPromptSource(options);
  const sessionCount = normalizeSessionCount(options.sessionCount ?? options.count ?? 2);
  const timeoutMs = normalizeTimeout(options.timeoutMs ?? 120000);
  const cwd = path.resolve(options.cwd || process.cwd());
  const runId = normalizeRunId(options.runId);
  const sessionRunner = options.sessionRunner || createShellSessionRunner();

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'shipwright-parallel-variance-'));
  const promptFilePath = path.join(tempRoot, 'prompt.txt');
  await writeFile(promptFilePath, promptSource.prompt, 'utf8');

  try {
    const tasks = [];
    for (let index = 0; index < sessionCount; index += 1) {
      const sessionId = `session-${index + 1}`;
      tasks.push(
        sessionRunner({
          sessionId,
          command,
          prompt: promptSource.prompt,
          promptFilePath,
          timeoutMs,
          cwd,
          runId,
          promptSource,
          sessionCount,
        }),
      );
    }

    const rawSessions = await Promise.all(tasks);
    const report = buildParallelVarianceReport({
      command,
      cwd,
      runId,
      promptSource,
      sessions: rawSessions,
      generatedAt: new Date().toISOString(),
      timeoutMs,
    });

    if (options.outPath) {
      const outPath = path.resolve(options.outPath);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    }

    const maxVariance = options.maxVariance || null;
    if (maxVariance) {
      assertVarianceWithinLimit(report.aggregate.variance_level, maxVariance);
    }

    return report;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

export function buildParallelVarianceReport(options = {}) {
  const prompt = typeof options.promptSource?.prompt === 'string' ? options.promptSource.prompt : '';
  const promptHash = sha256(prompt);
  const sessions = (options.sessions || []).map((session) => normalizeSessionResult(session));
  const successfulSessions = sessions.filter((session) => session.exit_code === 0);
  const pairwise = buildPairwiseComparisons(successfulSessions);
  const aggregate = buildAggregateSummary(successfulSessions, sessions, pairwise);

  return {
    generated_at: options.generatedAt || new Date().toISOString(),
    run_id: options.runId || normalizeRunId(),
    command: options.command || '',
    cwd: options.cwd || process.cwd(),
    timeout_ms: options.timeoutMs || null,
    prompt_source: {
      type: options.promptSource?.type || 'prompt',
      label: options.promptSource?.label || 'inline-prompt',
      scenario_id: options.promptSource?.scenario_id || null,
      scenario_title: options.promptSource?.scenario_title || null,
      scenario_path: options.promptSource?.scenario_path || null,
      prompt_sha256: promptHash,
      prompt_length: prompt.length,
    },
    aggregate,
    pairwise,
    sessions,
  };
}

export function normalizeSessionResult(session) {
  const stdout = typeof session?.stdout === 'string' ? session.stdout : '';
  const stderr = typeof session?.stderr === 'string' ? session.stderr : '';
  const normalizedResponse = normalizeResponseText(stdout);
  const wordCount = countWords(stdout);
  const lineCount = stdout.length === 0 ? 0 : stdout.split('\n').length;

  return {
    session_id: session?.sessionId || session?.session_id || 'session-unknown',
    exit_code:
      typeof session?.exitCode === 'number'
        ? session.exitCode
        : typeof session?.exit_code === 'number'
          ? session.exit_code
          : 1,
    duration_ms:
      typeof session?.durationMs === 'number'
        ? session.durationMs
        : typeof session?.duration_ms === 'number'
          ? session.duration_ms
          : 0,
    stdout,
    stderr,
    word_count: wordCount,
    line_count: lineCount,
    normalized_response_sha256: sha256(normalizedResponse),
    raw_response_sha256: sha256(stdout),
  };
}

export function normalizeResponseText(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function computeTokenJaccard(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 && rightTokens.size === 0) return 1;

  const union = new Set([...leftTokens, ...rightTokens]);
  let intersectionSize = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersectionSize += 1;
  }

  return roundNumber(intersectionSize / union.size, 4);
}

export function classifyVariance(options = {}) {
  const failedSessionCount = options.failedSessionCount || 0;
  if (failedSessionCount > 0) return 'execution_error';

  const uniqueResponseCount = options.uniqueResponseCount || 0;
  const minSimilarity =
    typeof options.minSimilarity === 'number' ? options.minSimilarity : 1;
  const minWordCount = typeof options.minWordCount === 'number' ? options.minWordCount : 0;
  const maxWordCount = typeof options.maxWordCount === 'number' ? options.maxWordCount : 0;
  const wordRatio =
    minWordCount === 0
      ? maxWordCount === 0
        ? 1
        // If one successful session returns no content and another does, treat the
        // spread as unbounded so the run cannot be classified as stable or moderate.
        : Number.POSITIVE_INFINITY
      : maxWordCount / minWordCount;

  if (uniqueResponseCount <= 1) return 'stable';
  if (minSimilarity >= 0.85 && wordRatio <= 1.25) return 'stable';
  if (minSimilarity >= 0.6 && wordRatio <= 1.75) return 'moderate_drift';
  return 'high_drift';
}

export function formatParallelVarianceReport(report) {
  const lines = [
    `Variance Level: ${report.aggregate.variance_level}`,
    `Sessions: ${report.aggregate.successful_session_count}/${report.aggregate.session_count} successful`,
    `Unique normalized responses: ${report.aggregate.unique_response_count}`,
    `Pairwise similarity: min ${formatMaybeNumber(report.aggregate.pairwise_similarity.min)} / mean ${formatMaybeNumber(report.aggregate.pairwise_similarity.mean)} / max ${formatMaybeNumber(report.aggregate.pairwise_similarity.max)}`,
    `Word count: min ${report.aggregate.word_count.min} / mean ${formatMaybeNumber(report.aggregate.word_count.mean)} / max ${report.aggregate.word_count.max}`,
  ];

  if (report.aggregate.failed_session_count > 0) {
    lines.push(`Failed sessions: ${report.aggregate.failed_session_count}`);
  }

  for (const session of report.sessions) {
    lines.push(
      `${session.session_id}: exit=${session.exit_code} duration_ms=${session.duration_ms} words=${session.word_count} hash=${session.normalized_response_sha256.slice(0, 12)}`,
    );
  }

  return `${lines.join('\n')}\n`;
}

export function parseCliArgs(argv) {
  const parsed = {
    prompt: '',
    promptFile: '',
    scenario: '',
    scenarioDir: DEFAULT_SCENARIO_DIR,
    command: '',
    count: 2,
    timeoutMs: 120000,
    format: 'text',
    outPath: null,
    cwd: process.cwd(),
    runId: null,
    maxVariance: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--prompt':
        parsed.prompt = argv[index + 1] || '';
        index += 1;
        break;
      case '--prompt-file':
        parsed.promptFile = argv[index + 1] || '';
        index += 1;
        break;
      case '--scenario':
        parsed.scenario = argv[index + 1] || '';
        index += 1;
        break;
      case '--scenario-dir':
        parsed.scenarioDir = argv[index + 1] || DEFAULT_SCENARIO_DIR;
        index += 1;
        break;
      case '--command':
        parsed.command = argv[index + 1] || '';
        index += 1;
        break;
      case '--count':
        parsed.count = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--format':
        parsed.format = argv[index + 1] || 'text';
        index += 1;
        break;
      case '--out':
        parsed.outPath = argv[index + 1] || null;
        index += 1;
        break;
      case '--cwd':
        parsed.cwd = argv[index + 1] || process.cwd();
        index += 1;
        break;
      case '--run-id':
        parsed.runId = argv[index + 1] || null;
        index += 1;
        break;
      case '--max-variance':
        parsed.maxVariance = argv[index + 1] || null;
        index += 1;
        break;
      case '--help':
        parsed.help = true;
        break;
      default:
        if (token.startsWith('--')) {
          throw new Error(`Unknown flag: ${token}`);
        }
        break;
    }
  }

  if (!VALID_FORMATS.has(parsed.format)) {
    throw new Error(`Unsupported format "${parsed.format}". Use text or json.`);
  }

  if (
    parsed.maxVariance !== null &&
    !VALID_VARIANCE_LEVELS.has(parsed.maxVariance)
  ) {
    throw new Error(
      `Unsupported --max-variance "${parsed.maxVariance}". Use stable, moderate_drift, high_drift, or execution_error.`,
    );
  }

  return parsed;
}

export function createShellSessionRunner(options = {}) {
  const shellConfig = resolveShellConfig(options.shell);

  return async function runShellSession(sessionOptions) {
    const command = expandCommandTemplate(sessionOptions.command, sessionOptions);
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const child = spawn(shellConfig.command, shellConfig.args(command), {
        cwd: sessionOptions.cwd,
        env: {
          ...process.env,
          SHIPWRIGHT_PARALLEL_RUN_ID: sessionOptions.runId,
          SHIPWRIGHT_PARALLEL_SESSION_ID: sessionOptions.sessionId,
          SHIPWRIGHT_PARALLEL_TOTAL: String(sessionOptions.sessionCount),
          SHIPWRIGHT_PARALLEL_PROMPT_FILE: sessionOptions.promptFilePath,
          SHIPWRIGHT_PARALLEL_SCENARIO_ID: sessionOptions.promptSource?.scenario_id || '',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let finished = false;
      let timeoutHandle = null;

      const finalize = (payload) => {
        if (finished) return;
        finished = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        resolve({
          sessionId: sessionOptions.sessionId,
          durationMs: Date.now() - startedAt,
          stdout,
          stderr,
          ...payload,
        });
      };

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
      child.on('error', (error) => {
        finalize({
          exitCode: 1,
          stderr: `${stderr}${stderr ? '\n' : ''}${error.message}`,
        });
      });
      child.on('close', (code) => {
        finalize({
          exitCode: typeof code === 'number' ? code : 1,
        });
      });

      timeoutHandle = setTimeout(() => {
        stderr += `${stderr ? '\n' : ''}Timed out after ${sessionOptions.timeoutMs}ms.`;
        child.kill('SIGKILL');
      }, sessionOptions.timeoutMs);

      child.stdin.end(sessionOptions.prompt);
    });
  };
}

function resolveShellConfig(explicitShell) {
  const shell = explicitShell || detectDefaultShell();
  const shellLower = shell.toLowerCase();

  if (shellLower.endsWith('bash.exe') || shellLower.endsWith('/bash') || shellLower.endsWith('\\bash')) {
    return { command: shell, args: (cmd) => ['-lc', cmd] };
  }
  if (shellLower.endsWith('zsh') || shellLower.endsWith('zsh.exe') || shellLower.endsWith('/sh')) {
    return { command: shell, args: (cmd) => ['-lc', cmd] };
  }
  if (shellLower.endsWith('powershell.exe') || shellLower.endsWith('pwsh.exe')) {
    return { command: shell, args: (cmd) => ['-Command', cmd] };
  }
  if (shellLower.endsWith('cmd.exe')) {
    return { command: shell, args: (cmd) => ['/d', '/s', '/c', cmd] };
  }
  return { command: shell, args: (cmd) => ['-lc', cmd] };
}

function detectDefaultShell() {
  if (process.env.SHELL) return process.env.SHELL;

  if (process.platform === 'win32') {
    const gitBashCandidates = [
      'C:\\Program Files\\Git\\bin\\bash.exe',
      'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
    ];
    const gitBash = gitBashCandidates.find((candidate) => existsSync(candidate));
    if (gitBash) return gitBash;
    return process.env.ComSpec || 'powershell.exe';
  }

  return '/bin/zsh';
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(
      'Usage: node scripts/run-parallel-variance.mjs --command "<claude-command>" (--prompt "..." | --prompt-file path | --scenario scenario-id) [--count 3 (>=2)] [--timeout-ms 120000] [--format text|json] [--out path] [--max-variance moderate_drift]',
    );
    return;
  }

  const report = await runParallelVariance(args);
  if (args.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  process.stdout.write(formatParallelVarianceReport(report));
}

function buildAggregateSummary(successfulSessions, allSessions, pairwise) {
  const normalizedHashes = new Set(
    successfulSessions.map((session) => session.normalized_response_sha256),
  );
  const wordCounts = successfulSessions.map((session) => session.word_count);
  const similarities = pairwise.map((entry) => entry.token_jaccard_similarity);
  const minWordCount = wordCounts.length === 0 ? 0 : Math.min(...wordCounts);
  const maxWordCount = wordCounts.length === 0 ? 0 : Math.max(...wordCounts);

  return {
    session_count: allSessions.length,
    successful_session_count: successfulSessions.length,
    failed_session_count: allSessions.length - successfulSessions.length,
    unique_response_count: normalizedHashes.size,
    pairwise_similarity: {
      min: similarities.length === 0 ? null : Math.min(...similarities),
      mean: similarities.length === 0 ? null : roundNumber(mean(similarities), 4),
      max: similarities.length === 0 ? null : Math.max(...similarities),
    },
    word_count: {
      min: minWordCount,
      mean: roundNumber(mean(wordCounts), 2),
      max: maxWordCount,
    },
    variance_level: classifyVariance({
      failedSessionCount: allSessions.length - successfulSessions.length,
      uniqueResponseCount: normalizedHashes.size,
      minSimilarity: similarities.length === 0 ? 1 : Math.min(...similarities),
      minWordCount,
      maxWordCount,
    }),
  };
}

function buildPairwiseComparisons(successfulSessions) {
  const results = [];
  for (let leftIndex = 0; leftIndex < successfulSessions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < successfulSessions.length; rightIndex += 1) {
      const left = successfulSessions[leftIndex];
      const right = successfulSessions[rightIndex];
      results.push({
        left_session_id: left.session_id,
        right_session_id: right.session_id,
        exact_match:
          left.normalized_response_sha256 === right.normalized_response_sha256,
        token_jaccard_similarity: computeTokenJaccard(left.stdout, right.stdout),
        word_count_delta: Math.abs(left.word_count - right.word_count),
      });
    }
  }
  return results;
}

function tokenize(input) {
  const normalized = normalizeResponseText(input).toLowerCase();
  return normalized.match(/[a-z0-9]+/g) || [];
}

function countWords(input) {
  return tokenize(input).length;
}

function mean(values) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0) return 0;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function roundNumber(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input || '').digest('hex');
}

function resolveScenarioPath(scenarioArg, scenarioDir) {
  if (scenarioArg.endsWith('.json')) {
    return path.resolve(scenarioArg);
  }
  return path.resolve(scenarioDir, `${scenarioArg}.json`);
}

function normalizeNonEmptyString(value, flagName) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(`Missing required ${flagName}.`);
}

function normalizeSessionCount(value) {
  if (!Number.isInteger(value) || value < 2) {
    throw new Error('--count must be an integer greater than or equal to 2.');
  }
  return value;
}

function normalizeTimeout(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('--timeout-ms must be a positive number.');
  }
  return value;
}

function normalizeRunId(value) {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return `parallel-${Date.now()}`;
}

function formatMaybeNumber(value) {
  return value === null || value === undefined ? 'n/a' : String(value);
}

function expandCommandTemplate(command, sessionOptions) {
  const replacements = {
    '{{prompt_file}}': shellEscape(sessionOptions.promptFilePath),
    '{{session_id}}': shellEscape(sessionOptions.sessionId),
    '{{run_id}}': shellEscape(sessionOptions.runId),
    '{{scenario_id}}': shellEscape(sessionOptions.promptSource?.scenario_id || ''),
  };

  let expanded = command;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    expanded = expanded.split(pattern).join(replacement);
  }
  return expanded;
}

function shellEscape(value) {
  const stringValue = typeof value === 'string' ? value : String(value ?? '');
  return `'${stringValue.replace(/'/g, `'\\''`)}'`;
}

function assertVarianceWithinLimit(actual, maxVariance) {
  if (VARIANCE_RANK[actual] > VARIANCE_RANK[maxVariance]) {
    throw new Error(
      `Variance level ${actual} exceeded --max-variance ${maxVariance}.`,
    );
  }
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
