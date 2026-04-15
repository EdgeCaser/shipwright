#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  buildCasePacket,
  loadCasePacket,
  validateConflictDocument,
} from './build-case-packet.mjs';

const VALID_FORMATS = new Set(['text', 'json']);
const VALID_MODES = new Set(['head_to_head', 'coalition_vs_coalition', 'swap_test']);
const VALID_ACCESS_MODES = new Set(['subscription_cli']);
const SIDE_IDS = Object.freeze(['side_a', 'side_b']);
const IDENTITY_LEAK_PATTERNS = [
  /\bI am Claude\b/i,
  /\bAs an OpenAI model\b/i,
  /\bAs ChatGPT\b/i,
  /\bAnthropic\b/i,
  /\bOpenAI\b/i,
];
const UNSEEN_OPPONENT_PATTERNS = [
  /\bSide A\b/i,
  /\bSide B\b/i,
  /\byour first-pass artifact\b/i,
  /\bas Side A argued\b/i,
  /\bas Side B argued\b/i,
];
const DEFAULT_BUDGETS = Object.freeze({
  maxVisibleRounds: 3,
  maxCostUsd: 1_000_000,
  maxLatencyMs: 360_000,
  minMarginForVerdict: 0.1,
  judgeReservedBudgetUsd: 0,
});
const DEFAULT_REASONING_EFFORT = 'medium';

export async function runConflictHarness(options = {}) {
  const casePacket = await resolveCasePacket(options);
  const mode = normalizeMode(options.mode || 'head_to_head');
  if (mode !== 'head_to_head') {
    throw new Error('Phase 1 only supports head_to_head mode.');
  }

  const runId = normalizeRunId(options.runId, casePacket.scenario_id);
  const outDir = resolveRunDirectory(casePacket.scenario_id, runId, options.outDir);
  const cwd = path.resolve(options.cwd || process.cwd());
  const timeoutMs = normalizePositiveNumber(options.timeoutMs ?? 120000, '--timeout-ms');
  const budgets = {
    max_visible_rounds: normalizePositiveInteger(
      options.maxVisibleRounds ?? casePacket.max_rounds ?? DEFAULT_BUDGETS.maxVisibleRounds,
      '--max-visible-rounds',
    ),
    max_cost_usd: normalizeNonNegativeNumber(
      options.maxCostUsd ?? DEFAULT_BUDGETS.maxCostUsd,
      '--max-cost-usd',
    ),
    max_latency_ms: normalizePositiveInteger(
      options.maxLatencyMs ?? DEFAULT_BUDGETS.maxLatencyMs,
      '--max-latency-ms',
    ),
    min_margin_for_verdict: normalizeNonNegativeNumber(
      options.minMarginForVerdict ?? DEFAULT_BUDGETS.minMarginForVerdict,
      '--min-margin-for-verdict',
    ),
  };
  const judgeReservedBudgetUsd = normalizeNonNegativeNumber(
    options.judgeReservedBudgetUsd ?? DEFAULT_BUDGETS.judgeReservedBudgetUsd,
    '--judge-reserved-budget-usd',
  );
  const turnRunner = options.turnRunner || createShellTurnRunner();
  const commandConfig = normalizeCommandConfig(options);
  const reasoningEfforts = {
    side_a: normalizeReasoningEffort(
      options.sideAReasoningEffort ?? DEFAULT_REASONING_EFFORT,
      '--side-a-reasoning-effort',
    ),
    side_b: normalizeReasoningEffort(
      options.sideBReasoningEffort ?? DEFAULT_REASONING_EFFORT,
      '--side-b-reasoning-effort',
    ),
    judge: normalizeReasoningEffort(
      options.judgeReasoningEffort ?? DEFAULT_REASONING_EFFORT,
      '--judge-reasoning-effort',
    ),
  };

  await createTranscriptLayout(outDir);
  const run = createInitialRunRecord({
    runId,
    casePacket,
    mode,
    budgets,
    sideAProvider: options.sideAProvider || 'openai',
    sideAModel: options.sideAModel || 'chatgpt-pro',
    sideAReasoningEffort: reasoningEfforts.side_a,
    sideBProvider: options.sideBProvider || 'anthropic',
    sideBModel: options.sideBModel || 'claude-max',
    sideBReasoningEffort: reasoningEfforts.side_b,
    judgeProvider: options.judgeProvider || 'openai',
    judgeModel: options.judgeModel || 'chatgpt-pro',
    judgeReasoningEffort: reasoningEfforts.judge,
    judgeSelectionPolicy: options.judgeSelectionPolicy || 'single_judge_cli',
  });

  await writeJson(path.join(outDir, 'config.json'), buildConfigRecord({
    cwd,
    mode,
    runId,
    casePacket,
    budgets,
    timeoutMs,
    judgeReservedBudgetUsd,
    commandConfig,
    reasoningEfforts,
  }));
  await writeJson(path.join(outDir, 'case-packet.json'), casePacket);
  await persistRunState(outDir, run, {
    lastCompletedPhase: 'init',
    nextAction: 'first_pass',
  });

  let findingSequence = 0;

  for (const sideId of SIDE_IDS) {
    const response = await invokeCommittedArtifactTurn({
      phase: 'first_pass',
      sideId,
      run,
      casePacket,
      outDir,
      cwd,
      timeoutMs,
      turnRunner,
      command: commandConfig[sideId],
      reasoningEffort: reasoningEfforts[sideId],
    });
    run.sides[sideId].first_pass = response.packet;
    run.metrics.total_estimated_cost_usd += response.estimatedCostUsd;
  }

  run.status = 'first_pass_complete';
  await validateAndPersistRun(outDir, run, {
    lastCompletedPhase: 'first_pass',
    nextAction: 'rebuttal',
  });

  if (hasExceededVisiblePhaseBudget(run, judgeReservedBudgetUsd)) {
    run.status = 'budget_exhausted';
    await validateAndPersistRun(outDir, run, {
      lastCompletedPhase: 'first_pass',
      nextAction: 'stopped',
    });
    return { run, outDir };
  }

  for (const sideId of SIDE_IDS) {
    findingSequence += 1;
    const targetSide = sideId === 'side_a' ? 'side_b' : 'side_a';
    const response = await invokeCritiqueTurn({
      sideId,
      targetSide,
      run,
      casePacket,
      outDir,
      cwd,
      timeoutMs,
      turnRunner,
      command: commandConfig[sideId],
      reasoningEffort: reasoningEfforts[sideId],
      findingSequence,
    });
    run.sides[sideId].rebuttal = response.packet;
    run.metrics.total_estimated_cost_usd += response.estimatedCostUsd;
  }

  run.status = 'rebuttal_complete';
  await validateAndPersistRun(outDir, run, {
    lastCompletedPhase: 'rebuttal',
    nextAction: 'final',
  });

  if (hasExceededVisiblePhaseBudget(run, judgeReservedBudgetUsd)) {
    run.status = 'budget_exhausted';
    await validateAndPersistRun(outDir, run, {
      lastCompletedPhase: 'rebuttal',
      nextAction: 'stopped',
    });
    return { run, outDir };
  }

  for (const sideId of SIDE_IDS) {
    const targetSide = sideId === 'side_a' ? 'side_b' : 'side_a';
    const response = await invokeCommittedArtifactTurn({
      phase: 'final',
      sideId,
      run,
      casePacket,
      outDir,
      cwd,
      timeoutMs,
      turnRunner,
      command: commandConfig[sideId],
      reasoningEffort: reasoningEfforts[sideId],
      critiquePacket: run.sides[targetSide].rebuttal,
    });
    run.sides[sideId].final = response.packet;
    run.metrics.total_estimated_cost_usd += response.estimatedCostUsd;
  }

  run.status = 'final_complete';
  await validateAndPersistRun(outDir, run, {
    lastCompletedPhase: 'final',
    nextAction: 'adjudication',
  });

  if (hasExceededVisiblePhaseBudget(run, judgeReservedBudgetUsd)) {
    run.status = 'budget_exhausted';
    await validateAndPersistRun(outDir, run, {
      lastCompletedPhase: 'final',
      nextAction: 'stopped',
    });
    return { run, outDir };
  }

  if (!hasReservedJudgeBudget(run, judgeReservedBudgetUsd)) {
    run.status = 'budget_exhausted_no_verdict';
    await validateAndPersistRun(outDir, run, {
      lastCompletedPhase: 'final',
      nextAction: 'stopped',
    });
    return { run, outDir };
  }

  const judgeResponse = await invokeJudgeTurn({
    run,
    casePacket,
    outDir,
    cwd,
    timeoutMs,
    turnRunner,
    command: commandConfig.judge,
    reasoningEffort: reasoningEfforts.judge,
  });
  run.judge.verdict = judgeResponse.packet;
  run.metrics.total_estimated_cost_usd += judgeResponse.estimatedCostUsd;
  applyVerdictToRun(run, judgeResponse.packet);
  computeRunMetrics(run);
  run.status = 'completed';

  await validateAndPersistRun(outDir, run, {
    lastCompletedPhase: 'adjudication',
    nextAction: 'done',
  });

  return { run, outDir };
}

export function createShellTurnRunner(options = {}) {
  const shellConfig = resolveShellConfig(options.shell);

  return async function runShellTurn(turnOptions) {
    if (!turnOptions.command || turnOptions.command.trim().length === 0) {
      throw new Error(`Missing command for ${turnOptions.phase} ${turnOptions.sideId || 'judge'} turn.`);
    }

    let command = expandCommandTemplate(turnOptions.command, turnOptions);
    command = injectReasoningEffort(command, turnOptions.reasoningEffort);

    // For codex exec commands, inject --output-last-message to get file-based
    // output as a fallback when stdout pipes break (EPIPE).
    let outputFilePath = null;
    if (/\bcodex\s+exec\b/.test(command)) {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'shipwright-codex-'));
      outputFilePath = path.join(tmpDir, 'output.txt');
      command = command.replace(
        /\bcodex\s+exec\b/,
        `codex exec --output-last-message '${outputFilePath}'`,
      );
    }

    const startedAt = Date.now();

    const result = await new Promise((resolve) => {
      const child = spawn(shellConfig.command, shellConfig.args(command), {
        cwd: turnOptions.cwd,
        env: {
          ...process.env,
          SHIPWRIGHT_CONFLICT_RUN_ID: turnOptions.runId,
          SHIPWRIGHT_CONFLICT_SIDE_ID: turnOptions.sideId || '',
          SHIPWRIGHT_CONFLICT_PHASE: turnOptions.phase,
          SHIPWRIGHT_CONFLICT_PROMPT_FILE: turnOptions.promptFilePath,
          SHIPWRIGHT_CONFLICT_PACKET_FILE: turnOptions.packetFilePath,
          SHIPWRIGHT_CONFLICT_OUT_DIR: turnOptions.outDir,
          SHIPWRIGHT_CONFLICT_REASONING_EFFORT: turnOptions.reasoningEffort || '',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let settled = false;
      let timeoutHandle = null;

      const finalize = (payload) => {
        if (settled) return;
        settled = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        resolve({
          stdout,
          stderr,
          durationMs: Date.now() - startedAt,
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
        finalize({ exitCode: 1, spawnError: error.message });
      });
      child.on('close', (code) => {
        finalize({ exitCode: typeof code === 'number' ? code : 1 });
      });

      timeoutHandle = setTimeout(() => {
        stderr += `${stderr ? '\n' : ''}Timed out after ${turnOptions.timeoutMs}ms.`;
        child.kill('SIGKILL');
      }, turnOptions.timeoutMs);

      child.stdin.on('error', (error) => {
        stderr += `${stderr ? '\n' : ''}stdin write error: ${error.message}`;
      });
      child.stdin.end(turnOptions.prompt);
    });

    // If codex wrote to the output file, prefer it over stdout (which may
    // be empty or truncated due to EPIPE).
    if (outputFilePath) {
      try {
        const fileContent = await readFile(outputFilePath, 'utf8');
        if (fileContent.trim().length > 0) {
          result.stdout = fileContent;
        }
        await unlink(outputFilePath);
      } catch {
        // File doesn't exist or can't be read — fall through to stdout.
      }
    }

    return result;
  };
}

function resolveShellConfig(explicitShell) {
  const shell = explicitShell || detectDefaultShell();
  const shellLower = shell.toLowerCase();

  if (shellLower.endsWith('bash.exe') || shellLower.endsWith('/bash') || shellLower.endsWith('\\bash')) {
    return {
      command: shell,
      args: (command) => ['-lc', command],
    };
  }

  if (shellLower.endsWith('zsh') || shellLower.endsWith('zsh.exe') || shellLower.endsWith('/sh')) {
    return {
      command: shell,
      args: (command) => ['-lc', command],
    };
  }

  if (shellLower.endsWith('powershell.exe') || shellLower.endsWith('pwsh.exe')) {
    return {
      command: shell,
      args: (command) => ['-Command', command],
    };
  }

  if (shellLower.endsWith('cmd.exe')) {
    return {
      command: shell,
      args: (command) => ['/d', '/s', '/c', command],
    };
  }

  return {
    command: shell,
    args: (command) => ['-lc', command],
  };
}

function detectDefaultShell() {
  if (process.env.SHELL) {
    return process.env.SHELL;
  }

  if (process.platform === 'win32') {
    const gitBashCandidates = [
      'C:\\Program Files\\Git\\bin\\bash.exe',
      'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
    ];
    const gitBash = gitBashCandidates.find((candidate) => existsSync(candidate));
    if (gitBash) {
      return gitBash;
    }
    return process.env.ComSpec || 'powershell.exe';
  }

  return '/bin/zsh';
}

export function parseCliArgs(argv) {
  const parsed = {
    scenario: '',
    scenarioDir: null,
    casePacketPath: '',
    outDir: null,
    cwd: process.cwd(),
    runId: null,
    mode: 'head_to_head',
    sideACommand: '',
    sideBCommand: '',
    judgeCommand: '',
    sideAProvider: 'openai',
    sideAModel: 'chatgpt-pro',
    sideAReasoningEffort: DEFAULT_REASONING_EFFORT,
    sideBProvider: 'anthropic',
    sideBModel: 'claude-max',
    sideBReasoningEffort: DEFAULT_REASONING_EFFORT,
    judgeProvider: 'openai',
    judgeModel: 'chatgpt-pro',
    judgeReasoningEffort: DEFAULT_REASONING_EFFORT,
    judgeSelectionPolicy: 'single_judge_cli',
    maxCostUsd: DEFAULT_BUDGETS.maxCostUsd,
    maxLatencyMs: DEFAULT_BUDGETS.maxLatencyMs,
    minMarginForVerdict: DEFAULT_BUDGETS.minMarginForVerdict,
    timeoutMs: 120000,
    judgeReservedBudgetUsd: DEFAULT_BUDGETS.judgeReservedBudgetUsd,
    format: 'text',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--scenario':
        parsed.scenario = argv[index + 1] || '';
        index += 1;
        break;
      case '--scenario-dir':
        parsed.scenarioDir = argv[index + 1] || null;
        index += 1;
        break;
      case '--case-packet':
        parsed.casePacketPath = argv[index + 1] || '';
        index += 1;
        break;
      case '--out-dir':
        parsed.outDir = argv[index + 1] || null;
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
      case '--mode':
        parsed.mode = argv[index + 1] || 'head_to_head';
        index += 1;
        break;
      case '--side-a-command':
        parsed.sideACommand = argv[index + 1] || '';
        index += 1;
        break;
      case '--side-b-command':
        parsed.sideBCommand = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-command':
        parsed.judgeCommand = argv[index + 1] || '';
        index += 1;
        break;
      case '--side-a-provider':
        parsed.sideAProvider = argv[index + 1] || 'openai';
        index += 1;
        break;
      case '--side-a-model':
        parsed.sideAModel = argv[index + 1] || 'chatgpt-pro';
        index += 1;
        break;
      case '--side-a-reasoning-effort':
        parsed.sideAReasoningEffort = argv[index + 1] || DEFAULT_REASONING_EFFORT;
        index += 1;
        break;
      case '--side-b-provider':
        parsed.sideBProvider = argv[index + 1] || 'anthropic';
        index += 1;
        break;
      case '--side-b-model':
        parsed.sideBModel = argv[index + 1] || 'claude-max';
        index += 1;
        break;
      case '--side-b-reasoning-effort':
        parsed.sideBReasoningEffort = argv[index + 1] || DEFAULT_REASONING_EFFORT;
        index += 1;
        break;
      case '--judge-provider':
        parsed.judgeProvider = argv[index + 1] || 'openai';
        index += 1;
        break;
      case '--judge-model':
        parsed.judgeModel = argv[index + 1] || 'chatgpt-pro';
        index += 1;
        break;
      case '--judge-reasoning-effort':
        parsed.judgeReasoningEffort = argv[index + 1] || DEFAULT_REASONING_EFFORT;
        index += 1;
        break;
      case '--judge-selection-policy':
        parsed.judgeSelectionPolicy = argv[index + 1] || 'single_judge_cli';
        index += 1;
        break;
      case '--max-cost-usd':
        parsed.maxCostUsd = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--max-latency-ms':
        parsed.maxLatencyMs = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--min-margin-for-verdict':
        parsed.minMarginForVerdict = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--judge-reserved-budget-usd':
        parsed.judgeReservedBudgetUsd = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--format':
        parsed.format = argv[index + 1] || 'text';
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
  if (!VALID_MODES.has(parsed.mode)) {
    throw new Error(`Unsupported mode "${parsed.mode}".`);
  }

  return parsed;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(
      'Usage: node scripts/run-conflict-harness.mjs (--scenario scenario-id | --case-packet path) --side-a-command "<cmd>" --side-b-command "<cmd>" --judge-command "<cmd>" [--out-dir dir] [--format text|json]',
    );
    return;
  }

  const { run } = await runConflictHarness({
    scenario: args.scenario,
    scenarioDir: args.scenarioDir || undefined,
    casePacketPath: args.casePacketPath || undefined,
    outDir: args.outDir || undefined,
    cwd: args.cwd,
    runId: args.runId,
    mode: args.mode,
    sideACommand: args.sideACommand,
    sideBCommand: args.sideBCommand,
    judgeCommand: args.judgeCommand,
    sideAProvider: args.sideAProvider,
    sideAModel: args.sideAModel,
    sideAReasoningEffort: args.sideAReasoningEffort,
    sideBProvider: args.sideBProvider,
    sideBModel: args.sideBModel,
    sideBReasoningEffort: args.sideBReasoningEffort,
    judgeProvider: args.judgeProvider,
    judgeModel: args.judgeModel,
    judgeReasoningEffort: args.judgeReasoningEffort,
    judgeSelectionPolicy: args.judgeSelectionPolicy,
    maxCostUsd: args.maxCostUsd,
    maxLatencyMs: args.maxLatencyMs,
    minMarginForVerdict: args.minMarginForVerdict,
    timeoutMs: args.timeoutMs,
    judgeReservedBudgetUsd: args.judgeReservedBudgetUsd,
  });

  if (args.format === 'json') {
    console.log(JSON.stringify(run, null, 2));
    return;
  }

  process.stdout.write(formatRunSummary(run));
}

async function resolveCasePacket(options) {
  if (options.casePacket && typeof options.casePacket === 'object') {
    const validation = validateConflictDocument(options.casePacket, 'case');
    if (validation.errors.length > 0) {
      throw new Error(formatValidationErrors('Provided case packet failed validation', validation.errors));
    }
    return options.casePacket;
  }

  if (typeof options.casePacketPath === 'string' && options.casePacketPath.trim().length > 0) {
    return loadCasePacket(options.casePacketPath);
  }

  return buildCasePacket({
    scenario: options.scenario,
    scenarioDir: options.scenarioDir,
  });
}

function createInitialRunRecord(options) {
  return {
    run_id: options.runId,
    scenario_id: options.casePacket.scenario_id,
    mode: options.mode,
    status: 'initialized',
    sides: {
      side_a: {
        provider: options.sideAProvider,
        model: options.sideAModel,
        reasoning_effort: options.sideAReasoningEffort,
        access_mode: 'subscription_cli',
        role: 'side_a',
        first_pass: null,
        rebuttal: null,
        final: null,
      },
      side_b: {
        provider: options.sideBProvider,
        model: options.sideBModel,
        reasoning_effort: options.sideBReasoningEffort,
        access_mode: 'subscription_cli',
        role: 'side_b',
        first_pass: null,
        rebuttal: null,
        final: null,
      },
    },
    judge: {
      provider: options.judgeProvider,
      model: options.judgeModel,
      reasoning_effort: options.judgeReasoningEffort,
      access_mode: 'subscription_cli',
      blind_labels: true,
      family_blind: false,
      selection_policy: options.judgeSelectionPolicy,
      verdict: null,
    },
    budgets: options.budgets,
    results: {
      winner: null,
      margin: null,
      judge_confidence: null,
      swap_stable: null,
      needs_human_review: null,
    },
    metrics: {
      disagreement_rate: null,
      declared_adoption_rate: null,
      substantive_revision_rate: null,
      unsupported_claim_count: null,
      self_contradiction_count: null,
      total_estimated_cost_usd: 0,
      swap_margin_delta: null,
      judge_margin: null,
      cost_per_resolved_run: null,
    },
    audit: {
      identity_leak_warnings: [],
      protocol_violations: [],
    },
  };
}

function buildConfigRecord(options) {
  return {
    run_id: options.runId,
    scenario_id: options.casePacket.scenario_id,
    mode: options.mode,
    cwd: options.cwd,
    budgets: options.budgets,
    timeout_ms: options.timeoutMs,
    judge_reserved_budget_usd: options.judgeReservedBudgetUsd,
    reasoning_efforts: options.reasoningEfforts,
    commands: {
      side_a: options.commandConfig.side_a ? '[configured]' : '[injected-runner]',
      side_b: options.commandConfig.side_b ? '[configured]' : '[injected-runner]',
      judge: options.commandConfig.judge ? '[configured]' : '[injected-runner]',
    },
  };
}

async function invokeCommittedArtifactTurn(options) {
  const turnLabel = options.phase === 'first_pass' ? 'first-pass' : 'final';
  const directoryName = options.sideId === 'side_a' ? 'side-a' : 'side-b';
  const sideDir = path.join(options.outDir, directoryName);
  const basePrompt = options.phase === 'first_pass'
    ? buildFirstPassPrompt(options.casePacket, options.run.run_id, options.sideId)
    : buildFinalPrompt(
      options.casePacket,
      options.run.run_id,
      options.sideId,
      options.run.sides[options.sideId].first_pass,
      options.critiquePacket,
    );

  const inputPacket = options.phase === 'first_pass'
    ? options.casePacket
    : {
      case_packet: options.casePacket,
      first_pass: options.run.sides[options.sideId].first_pass,
      critique_packet: options.critiquePacket,
    };

  let attempt = 0;
  let lastResponse = null;
  let repairIssueType = null;
  while (attempt < 2) {
    const response = await invokeTurn({
      phase: options.phase,
      sideId: options.sideId,
      runId: options.run.run_id,
      prompt: buildRepairPrompt(basePrompt, {
        issueType: repairIssueType,
        sideId: options.sideId,
      }, attempt),
      packet: inputPacket,
      cwd: options.cwd,
      timeoutMs: options.timeoutMs,
      turnRunner: options.turnRunner,
      command: options.command,
      reasoningEffort: options.reasoningEffort,
      outDir: options.outDir,
      promptFilePath: path.join(sideDir, `${turnLabel}.prompt.txt`),
      packetFilePath: path.join(sideDir, `${turnLabel}.input.json`),
      rawOutputPath: path.join(sideDir, `${turnLabel}.raw.txt`),
      attempt,
    });
    const packet = response.packet;
    assertCommittedArtifactPacket(packet, options.run.run_id, options.sideId, options.phase);

    const identityLeaks = findIdentityLeaks(packet);
    const unseenOpponent = options.phase === 'first_pass' ? findUnseenOpponentReferences(packet) : [];

    if (identityLeaks.length > 0 && attempt === 0) {
      repairIssueType = 'identity_leak';
      attempt += 1;
      lastResponse = response;
      continue;
    }

    if (unseenOpponent.length > 0 && attempt === 0) {
      repairIssueType = 'unseen_opponent';
      attempt += 1;
      lastResponse = response;
      continue;
    }

    if (identityLeaks.length > 0) {
      options.run.audit.identity_leak_warnings.push(
        `${options.sideId}:${options.phase}:${identityLeaks.join('; ')}`,
      );
    }

    if (unseenOpponent.length > 0) {
      options.run.audit.protocol_violations.push(
        `${options.sideId}:${options.phase}:${unseenOpponent.join('; ')}`,
      );
      options.run.status = 'protocol_violation';
      await validateAndPersistRun(options.outDir, options.run, {
        lastCompletedPhase: options.phase,
        nextAction: 'stopped',
      });
      throw new Error(`Protocol violation: ${unseenOpponent.join('; ')}`);
    }

    await writeText(path.join(sideDir, `${turnLabel}.md`), packet.artifact_markdown);
    await writeJson(path.join(sideDir, `${turnLabel}.json`), packet);
    return {
      packet,
      estimatedCostUsd: response.estimatedCostUsd,
      rawOutputPath: response.rawOutputPath,
    };
  }

  if (lastResponse) {
    const packet = lastResponse.packet;
    assertCommittedArtifactPacket(packet, options.run.run_id, options.sideId, options.phase);
    options.run.audit.identity_leak_warnings.push(
      `${options.sideId}:${options.phase}:explicit provider self-identification persisted after repair retry`,
    );
    await writeText(path.join(sideDir, `${turnLabel}.md`), packet.artifact_markdown);
    await writeJson(path.join(sideDir, `${turnLabel}.json`), packet);
    return {
      packet,
      estimatedCostUsd: lastResponse.estimatedCostUsd,
      rawOutputPath: lastResponse.rawOutputPath,
    };
  }

  throw new Error(`Unable to complete ${options.phase} for ${options.sideId}.`);
}

async function invokeCritiqueTurn(options) {
  const directoryName = options.sideId === 'side_a' ? 'side-a' : 'side-b';
  const sideDir = path.join(options.outDir, directoryName);
  const prompt = buildCritiquePrompt(
    options.casePacket,
    options.run.run_id,
    options.sideId,
    options.run.sides[options.targetSide].first_pass,
  );
  const inputPacket = {
    case_packet: options.casePacket,
    opposing_first_pass: options.run.sides[options.targetSide].first_pass,
  };

  const response = await invokeTurn({
    phase: 'rebuttal',
    sideId: options.sideId,
    runId: options.run.run_id,
    prompt,
    packet: inputPacket,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs,
    turnRunner: options.turnRunner,
    command: options.command,
    reasoningEffort: options.reasoningEffort,
    outDir: options.outDir,
    promptFilePath: path.join(sideDir, 'rebuttal.prompt.txt'),
    packetFilePath: path.join(sideDir, 'rebuttal.input.json'),
    rawOutputPath: path.join(sideDir, 'rebuttal.raw.txt'),
    attempt: 0,
  });
  const packet = {
    ...response.packet,
    finding_id: `finding-${options.findingSequence}`,
  };
  assertCritiquePacket(packet, options.targetSide);
  await writeText(path.join(sideDir, 'rebuttal.md'), formatCritiqueMarkdown(packet));
  await writeJson(path.join(sideDir, 'rebuttal.json'), packet);
  return {
    packet,
    estimatedCostUsd: response.estimatedCostUsd,
  };
}

async function invokeJudgeTurn(options) {
  const judgeDir = path.join(options.outDir, 'judge');
  const judgePacket = buildJudgePacket(options.run, options.casePacket);
  const prompt = buildJudgePrompt(judgePacket, options.run.budgets.min_margin_for_verdict);
  const response = await invokeTurn({
    phase: 'judge',
    sideId: null,
    runId: options.run.run_id,
    prompt,
    packet: judgePacket,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs,
    turnRunner: options.turnRunner,
    command: options.command,
    reasoningEffort: options.reasoningEffort,
    outDir: options.outDir,
    promptFilePath: path.join(judgeDir, 'verdict.prompt.txt'),
    packetFilePath: path.join(judgeDir, 'verdict.input.json'),
    rawOutputPath: path.join(judgeDir, 'verdict.raw.txt'),
    attempt: 0,
  });

  const verdict = response.packet;
  const validation = validateConflictDocument(verdict, 'verdict');
  if (validation.errors.length > 0) {
    throw new Error(formatValidationErrors('Verdict packet failed validation', validation.errors));
  }

  await writeJson(path.join(judgeDir, 'verdict.json'), verdict);
  await writeText(path.join(judgeDir, 'verdict.md'), formatVerdictMarkdown(verdict));
  return {
    packet: verdict,
    estimatedCostUsd: response.estimatedCostUsd,
  };
}

async function invokeTurn(options) {
  await writeText(options.promptFilePath, options.prompt);
  await writeJson(options.packetFilePath, options.packet);

  const response = await options.turnRunner({
    phase: options.phase,
    sideId: options.sideId,
    runId: options.runId,
    prompt: options.prompt,
    packet: options.packet,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs,
    command: options.command,
    reasoningEffort: options.reasoningEffort,
    outDir: options.outDir,
    promptFilePath: options.promptFilePath,
    packetFilePath: options.packetFilePath,
    attempt: options.attempt,
  });

  if (response && response.packet) {
    const raw = typeof response.stdout === 'string'
      ? response.stdout
      : JSON.stringify(response.packet, null, 2);
    await writeText(options.rawOutputPath, raw);
    return {
      packet: response.packet,
      estimatedCostUsd: normalizeEstimatedCost(response.usage?.estimatedCostUsd),
      rawOutputPath: options.rawOutputPath,
    };
  }

  if (!response || typeof response.stdout !== 'string') {
    throw new Error(`Turn runner for ${options.phase} did not return a packet or stdout.`);
  }

  await writeText(options.rawOutputPath, response.stdout);
  if (typeof response.exitCode === 'number' && response.exitCode !== 0) {
    throw new Error(
      `${options.phase} ${options.sideId || 'judge'} turn failed with exit code ${response.exitCode}: ${response.stderr || ''}`.trim(),
    );
  }

  const parsed = parseJsonResponse(response.stdout);
  return {
    packet: parsed.packet,
    estimatedCostUsd: normalizeEstimatedCost(parsed.usage?.estimatedCostUsd),
    rawOutputPath: options.rawOutputPath,
  };
}

function parseJsonResponse(output) {
  const candidate = extractJsonCandidate(output);
  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch (error) {
    throw new Error(`Model output is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.packet) {
    return {
      packet: parsed.packet,
      usage: parsed.usage || {},
    };
  }

  return {
    packet: parsed,
    usage: {},
  };
}

function extractJsonCandidate(output) {
  const trimmed = output.trim();
  if (trimmed.startsWith('{')) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function assertCommittedArtifactPacket(packet, runId, sideId, phase) {
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
    throw new Error(`${phase} ${sideId} packet must be an object.`);
  }

  const required = ['run_id', 'side_id', 'round', 'artifact_markdown', 'claims', 'citations', 'conclusion_confidence', 'open_questions', 'critique_responses'];
  for (const key of required) {
    if (!(key in packet)) {
      throw new Error(`${phase} ${sideId} packet is missing ${key}.`);
    }
  }

  if (packet.run_id !== runId) {
    throw new Error(`${phase} ${sideId} packet has unexpected run_id.`);
  }
  if (packet.side_id !== sideId) {
    throw new Error(`${phase} ${sideId} packet has unexpected side_id.`);
  }
  if (packet.round !== phase) {
    throw new Error(`${phase} ${sideId} packet has unexpected round.`);
  }
}

function assertCritiquePacket(packet, targetSide) {
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
    throw new Error('Critique packet must be an object.');
  }
  const required = ['target_side', 'finding_id', 'target_claim_ids', 'claim_under_attack', 'attack_type', 'evidence_or_reason', 'severity'];
  for (const key of required) {
    if (!(key in packet)) {
      throw new Error(`Critique packet is missing ${key}.`);
    }
  }
  if (packet.target_side !== targetSide) {
    throw new Error('Critique packet target_side does not match the opposing side.');
  }
}

function buildFirstPassPrompt(casePacket, runId, sideId) {
  return [
    `You are ${sideId.toUpperCase()} in a sealed first-pass conflict harness run.`,
    'Do not reveal provider identity.',
    'Do not mention or speculate about the opponent.',
    'Do not write the literal strings "Side A", "Side B", "side_a", or "side_b" anywhere in your output, including inside artifact_markdown. Refer to roles, teams, or parties with scenario-native language (e.g., "the requesting team", "the receiving team") instead.',
    'Return ONLY a JSON object with this exact shape:',
    '',
    JSON.stringify(
      {
        run_id: runId,
        side_id: sideId,
        round: 'first_pass',
        artifact_markdown: '# Your artifact',
        claims: [
          {
            claim_id: `${sideId}-claim-1`,
            summary: 'One major claim',
            evidence_refs: ['ctx-1'],
            is_major: true,
          },
        ],
        citations: ['ctx-1'],
        conclusion_confidence: 'medium',
        open_questions: [],
        critique_responses: [],
      },
      null,
      2,
    ),
    '',
    'Case packet:',
    JSON.stringify(casePacket, null, 2),
  ].join('\n');
}

function buildCritiquePrompt(casePacket, runId, sideId, opposingFirstPass) {
  const targetSide = sideId === 'side_a' ? 'side_b' : 'side_a';
  return [
    `You are ${sideId.toUpperCase()} in the rebuttal phase for run ${runId}.`,
    'Attack only visible claims from the opposing first-pass artifact.',
    'Return ONLY a JSON object with this exact shape:',
    '',
    JSON.stringify(
      {
        target_side: targetSide,
        finding_id: 'runner-will-assign',
        target_claim_ids: [`${targetSide}-claim-1`],
        claim_under_attack: 'The opposing claim to challenge.',
        attack_type: 'evidence_gap',
        evidence_or_reason: 'Why the visible claim is weak.',
        severity: 'medium',
      },
      null,
      2,
    ),
    '',
    'Case packet:',
    JSON.stringify(casePacket, null, 2),
    '',
    'Opposing first-pass artifact:',
    JSON.stringify(opposingFirstPass, null, 2),
  ].join('\n');
}

function buildRepairPrompt(basePrompt, issue, attempt) {
  if (attempt === 0) return basePrompt;

  const messages = {
    identity_leak:
      'Repair instruction: remove any provider self-identification or family naming from the JSON output. Keep the same packet shape.',
    unseen_opponent:
      'Repair instruction: remove any mention of unseen opponent content or speculation about the other side, AND remove any literal occurrence of the strings "Side A", "Side B", "side_a", or "side_b" from artifact_markdown and every other field. Use scenario-native role names instead. Keep the same packet shape.',
  };

  return `${basePrompt}\n\n${messages[issue.issueType] || 'Repair instruction: keep the exact packet shape.'}`;
}

function buildFinalPrompt(casePacket, runId, sideId, firstPassPacket, critiquePacket) {
  return [
    `You are ${sideId.toUpperCase()} in the final revision phase for run ${runId}.`,
    'You must either adopt the critique or reject it with reasoning.',
    'Do not reveal provider identity.',
    'Return ONLY a JSON object with this exact shape:',
    '',
    JSON.stringify(
      {
        run_id: runId,
        side_id: sideId,
        round: 'final',
        artifact_markdown: '# Revised artifact',
        claims: [
          {
            claim_id: `${sideId}-claim-1`,
            summary: 'Updated major claim',
            evidence_refs: ['ctx-1'],
            is_major: true,
          },
        ],
        citations: ['ctx-1'],
        conclusion_confidence: 'medium',
        open_questions: [],
        critique_responses: [
          {
            finding_id: critiquePacket?.finding_id || 'finding-1',
            disposition: 'adopted',
            rationale: 'Why the critique was adopted or rejected.',
          },
        ],
      },
      null,
      2,
    ),
    '',
    'Case packet:',
    JSON.stringify(casePacket, null, 2),
    '',
    'Your first-pass artifact:',
    JSON.stringify(firstPassPacket, null, 2),
    '',
    'Visible critique packet:',
    JSON.stringify(critiquePacket, null, 2),
  ].join('\n');
}

function buildJudgePacket(run, casePacket) {
  return {
    case_packet: casePacket,
    first_pass_artifacts: {
      side_a: redactProviderIdentity(run.sides.side_a.first_pass),
      side_b: redactProviderIdentity(run.sides.side_b.first_pass),
    },
    critique_packets: {
      side_a: redactProviderIdentity(run.sides.side_a.rebuttal),
      side_b: redactProviderIdentity(run.sides.side_b.rebuttal),
    },
    final_artifacts: {
      side_a: redactProviderIdentity(run.sides.side_a.final),
      side_b: redactProviderIdentity(run.sides.side_b.final),
    },
    min_margin_for_verdict: run.budgets.min_margin_for_verdict,
  };
}

function buildJudgePrompt(judgePacket, minMarginForVerdict) {
  return [
    'You are the judge in a blinded conflict harness run.',
    'Provider identity is intentionally hidden. Do not infer provider family.',
    'Return ONLY a JSON object with this exact shape:',
    '',
    JSON.stringify(
      {
        winner: 'tie',
        margin: 0,
        rubric_scores: {
          side_a: {
            claim_quality: 3,
            evidence_discipline: 3,
            responsiveness_to_critique: 3,
            internal_consistency: 3,
            decision_usefulness: 3,
            weighted_total: 3.0,
          },
          side_b: {
            claim_quality: 3,
            evidence_discipline: 3,
            responsiveness_to_critique: 3,
            internal_consistency: 3,
            decision_usefulness: 3,
            weighted_total: 3.0,
          },
        },
        dimension_rationales: {
          claim_quality: 'Brief explanation of which side made the stronger claims and why.',
          evidence_discipline: 'Brief explanation of how the sides used or overstated evidence.',
          responsiveness_to_critique: 'Brief explanation of how each side handled the critique phase.',
          internal_consistency: 'Brief explanation of contradictions, coherence, or missing logic.',
          decision_usefulness: 'Brief explanation of which artifact better supports an actual decision.',
        },
        side_summaries: {
          side_a: {
            strengths: ['One concise strength of Side A.'],
            weaknesses: ['One concise weakness of Side A.'],
          },
          side_b: {
            strengths: ['One concise strength of Side B.'],
            weaknesses: ['One concise weakness of Side B.'],
          },
        },
        decisive_dimension: 'decision_usefulness',
        decisive_findings: ['Replace with the actual decisive findings from this run.'],
        judge_confidence: 'low',
        needs_human_review: true,
        rationale: 'One-paragraph explanation of the verdict.',
      },
      null,
      2,
    ),
    '',
    `Use min_margin_for_verdict = ${minMarginForVerdict}.`,
    'Set rubric_scores.*.weighted_total as a normalized aggregate on the same 1-5 scale as the rubric dimensions, not as a raw sum.',
    'Treat each side\'s reported conclusion_confidence as a calibration signal, not a vote multiplier.',
    'Reward confidence when it is well matched to the evidence and penalize overconfidence when the artifact overreaches.',
    'judge_confidence rubric:',
    '- high: the winning side is clearly stronger on at least 3 rubric dimensions and has no major unsupported-claim problem',
    '- medium: the winning side leads overall but has at least 1 weak dimension or absorbed only part of the opposing critique',
    '- low: score margin is below min_margin_for_verdict or both sides have significant unsupported claims',
    '',
    'Judge packet:',
    JSON.stringify(judgePacket, null, 2),
  ].join('\n');
}

function applyVerdictToRun(run, verdict) {
  const unsupportedBySide = computeUnsupportedClaimCounts(run);
  const marginBelowThreshold = verdict.margin < run.budgets.min_margin_for_verdict;
  const bothSidesUnsupported = unsupportedBySide.side_a > 0 && unsupportedBySide.side_b > 0;

  run.results.winner = verdict.winner;
  run.results.margin = verdict.margin;
  run.results.judge_confidence = verdict.judge_confidence;
  run.results.swap_stable = null;
  run.results.needs_human_review =
    Boolean(verdict.needs_human_review) || marginBelowThreshold || bothSidesUnsupported;
}

function computeRunMetrics(run) {
  run.metrics.disagreement_rate = computeDisagreementRate(run);
  run.metrics.declared_adoption_rate = computeDeclaredAdoptionRate(run);
  run.metrics.substantive_revision_rate = computeSubstantiveRevisionRate(run);
  const unsupportedCounts = computeUnsupportedClaimCounts(run);
  run.metrics.unsupported_claim_count = unsupportedCounts.side_a + unsupportedCounts.side_b;
  run.metrics.self_contradiction_count = 0;
  run.metrics.swap_margin_delta = null;
  run.metrics.judge_margin = run.results.margin;
  run.metrics.cost_per_resolved_run =
    run.results.winner && run.results.winner !== 'tie'
      ? run.metrics.total_estimated_cost_usd
      : null;
}

function computeDisagreementRate(run) {
  const rates = SIDE_IDS.map((sideId) => {
    const firstPass = run.sides[sideId].first_pass;
    const critique = run.sides[sideId === 'side_a' ? 'side_b' : 'side_a'].rebuttal;
    if (!firstPass || !Array.isArray(firstPass.claims)) return 0;
    const majorClaims = firstPass.claims.filter((claim) => claim.is_major);
    if (majorClaims.length === 0 || !critique) return 0;
    const targeted = new Set(critique.target_claim_ids || []);
    const disputed = majorClaims.filter((claim) => targeted.has(claim.claim_id)).length;
    return disputed / majorClaims.length;
  });

  return roundNumber((rates[0] + rates[1]) / 2, 4);
}

function computeDeclaredAdoptionRate(run) {
  const responses = SIDE_IDS.flatMap((sideId) => run.sides[sideId].final?.critique_responses || []);
  if (responses.length === 0) return 0;
  const adopted = responses.filter((entry) => entry.disposition === 'adopted').length;
  return roundNumber(adopted / responses.length, 4);
}

function computeSubstantiveRevisionRate(run) {
  let totalResponses = 0;
  let substantivelyRevised = 0;

  for (const sideId of SIDE_IDS) {
    const finalPacket = run.sides[sideId].final;
    const responses = finalPacket?.critique_responses || [];
    const firstPassPacket = run.sides[sideId].first_pass;
    const critiquePacket = run.sides[sideId === 'side_a' ? 'side_b' : 'side_a'].rebuttal;

    for (const response of responses) {
      totalResponses += 1;
      if (response.disposition !== 'adopted') continue;
      if (didSubstantivelyReviseTargetedClaims(firstPassPacket, finalPacket, critiquePacket, response)) {
        substantivelyRevised += 1;
      }
    }
  }

  if (totalResponses === 0) return 0;
  return roundNumber(substantivelyRevised / totalResponses, 4);
}

function didSubstantivelyReviseTargetedClaims(firstPassPacket, finalPacket, critiquePacket, response) {
  if (!firstPassPacket || !finalPacket || !critiquePacket) return false;
  if (response.finding_id !== critiquePacket.finding_id) return false;

  const targetClaimIds = critiquePacket.target_claim_ids || [];
  if (targetClaimIds.length === 0) return false;

  const firstClaims = new Map((firstPassPacket.claims || []).map((claim) => [claim.claim_id, claim]));
  const finalClaims = new Map((finalPacket.claims || []).map((claim) => [claim.claim_id, claim]));

  for (const claimId of targetClaimIds) {
    const firstClaim = firstClaims.get(claimId);
    const finalClaim = finalClaims.get(claimId);

    if (firstClaim && !finalClaim) {
      return true;
    }

    if (!firstClaim || !finalClaim) {
      continue;
    }

    if (normalizeComparableText(firstClaim.summary) !== normalizeComparableText(finalClaim.summary)) {
      return true;
    }

    if (normalizeStringArray(firstClaim.evidence_refs).join('|') !== normalizeStringArray(finalClaim.evidence_refs).join('|')) {
      return true;
    }

    if (Boolean(firstClaim.is_major) !== Boolean(finalClaim.is_major)) {
      return true;
    }
  }

  return false;
}

function computeUnsupportedClaimCounts(run) {
  return {
    side_a: countUnsupportedClaims(run.sides.side_a.final || run.sides.side_a.first_pass),
    side_b: countUnsupportedClaims(run.sides.side_b.final || run.sides.side_b.first_pass),
  };
}

function countUnsupportedClaims(packet) {
  if (!packet || !Array.isArray(packet.claims)) return 0;
  return packet.claims.filter((claim) => !Array.isArray(claim.evidence_refs) || claim.evidence_refs.length === 0).length;
}

async function validateAndPersistRun(outDir, run, state) {
  const validation = validateConflictDocument(run, 'run');
  if (validation.errors.length > 0) {
    throw new Error(formatValidationErrors('Run record failed validation', validation.errors));
  }
  await persistRunState(outDir, run, state);
}

async function persistRunState(outDir, run, state) {
  await writeJson(path.join(outDir, 'run.json'), run);
  await writeJson(path.join(outDir, 'state.json'), {
    run_id: run.run_id,
    last_completed_phase: state.lastCompletedPhase,
    next_action: state.nextAction,
    status: run.status,
  });
}

async function createTranscriptLayout(outDir) {
  await mkdir(path.join(outDir, 'side-a'), { recursive: true });
  await mkdir(path.join(outDir, 'side-b'), { recursive: true });
  await mkdir(path.join(outDir, 'judge'), { recursive: true });
  await mkdir(path.join(outDir, 'swap-test'), { recursive: true });
  await mkdir(path.join(outDir, 'review'), { recursive: true });
}

function hasExceededVisiblePhaseBudget(run, judgeReservedBudgetUsd) {
  return run.metrics.total_estimated_cost_usd > run.budgets.max_cost_usd - judgeReservedBudgetUsd;
}

function hasReservedJudgeBudget(run, judgeReservedBudgetUsd) {
  return run.metrics.total_estimated_cost_usd <= run.budgets.max_cost_usd - judgeReservedBudgetUsd;
}

function findIdentityLeaks(packet) {
  const serialized = JSON.stringify(packet);
  return IDENTITY_LEAK_PATTERNS
    .filter((pattern) => pattern.test(serialized))
    .map((pattern) => pattern.source);
}

function findUnseenOpponentReferences(packet) {
  const artifactMarkdown = typeof packet?.artifact_markdown === 'string'
    ? packet.artifact_markdown
    : '';
  return UNSEEN_OPPONENT_PATTERNS
    .filter((pattern) => pattern.test(artifactMarkdown))
    .map((pattern) => pattern.source);
}

function redactProviderIdentity(value) {
  if (typeof value === 'string') {
    let redacted = value;
    for (const pattern of IDENTITY_LEAK_PATTERNS) {
      const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
      redacted = redacted.replace(new RegExp(pattern.source, flags), '[redacted-provider]');
    }
    return redacted;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactProviderIdentity(entry));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, redactProviderIdentity(entry)]),
    );
  }
  return value;
}

function normalizeCommandConfig(options) {
  if (options.turnRunner) {
    return { side_a: null, side_b: null, judge: null };
  }

  return {
    side_a: normalizeRequiredString(options.sideACommand, '--side-a-command'),
    side_b: normalizeRequiredString(options.sideBCommand, '--side-b-command'),
    judge: normalizeRequiredString(options.judgeCommand, '--judge-command'),
  };
}

function normalizeMode(value) {
  if (!VALID_MODES.has(value)) {
    throw new Error(`Unsupported mode "${value}".`);
  }
  return value;
}

function normalizeRunId(value, scenarioId) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').replace('Z', 'Z');
  return `conflict-${timestamp}-${scenarioId}`;
}

function resolveRunDirectory(scenarioId, runId, outDir) {
  const root = path.resolve(outDir || path.join('benchmarks', 'results', 'conflict-harness'));
  return path.join(root, scenarioId, runId);
}

function normalizeRequiredString(value, flagName) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(`Missing required ${flagName}.`);
}

function normalizeReasoningEffort(value, flagName) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(`${flagName} must be a non-empty string.`);
}

function normalizePositiveInteger(value, flagName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }
  return value;
}

function normalizePositiveNumber(value, flagName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${flagName} must be a positive number.`);
  }
  return value;
}

function normalizeNonNegativeNumber(value, flagName) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${flagName} must be a non-negative number.`);
  }
  return value;
}

function normalizeEstimatedCost(value) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function expandCommandTemplate(command, turnOptions) {
  const replacements = {
    '{{prompt_file}}': shellEscape(turnOptions.promptFilePath),
    '{{packet_file}}': shellEscape(turnOptions.packetFilePath),
    '{{run_id}}': shellEscape(turnOptions.runId),
    '{{side_id}}': shellEscape(turnOptions.sideId || ''),
    '{{phase}}': shellEscape(turnOptions.phase),
    '{{out_dir}}': shellEscape(turnOptions.outDir),
    '{{reasoning_effort}}': shellEscape(turnOptions.reasoningEffort || ''),
  };

  let expanded = command;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    expanded = expanded.split(pattern).join(replacement);
  }
  return expanded;
}

export function injectReasoningEffort(command, reasoningEffort) {
  if (!reasoningEffort) return command;

  let nextCommand = command;

  if (/(^|\|\s*)claude\b/.test(nextCommand) && !/\s--effort\b/.test(nextCommand)) {
    nextCommand = nextCommand.replace(
      /(^|\|\s*)claude\b/,
      (_match, prefix) => `${prefix}claude --effort ${shellEscape(reasoningEffort)}`,
    );
  }

  if (/(^|\|\s*)codex\s+exec\b/.test(nextCommand) && !/\bmodel_reasoning_effort\b/.test(nextCommand)) {
    nextCommand = nextCommand.replace(
      /(^|\|\s*)codex\s+exec\b/,
      (_match, prefix) => `${prefix}codex exec -c model_reasoning_effort=${shellEscape(reasoningEffort)}`,
    );
  }

  if (/(^|\|\s*)gemini\b/.test(nextCommand) && !/\s-m\s/.test(nextCommand) && !/\s--model\s/.test(nextCommand)) {
    const geminiAlias = `shipwright-gemini-${normalizeGeminiReasoningEffort(reasoningEffort)}`;
    nextCommand = nextCommand.replace(
      /(^|\|\s*)gemini\b/,
      (_match, prefix) => `${prefix}gemini -m ${shellEscape(geminiAlias)}`,
    );
  }

  return nextCommand;
}

function normalizeGeminiReasoningEffort(reasoningEffort) {
  const normalized = typeof reasoningEffort === 'string' ? reasoningEffort.trim().toLowerCase() : '';
  if (normalized === 'medium' || normalized === 'high') {
    return normalized;
  }
  if (normalized === 'low') {
    return 'medium';
  }
  return 'medium';
}

function shellEscape(value) {
  const stringValue = typeof value === 'string' ? value : String(value ?? '');
  return `'${stringValue.replace(/'/g, `'\\''`)}'`;
}

function normalizeComparableText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) return [];
  return [...values]
    .map((value) => (typeof value === 'string' ? value.trim() : String(value ?? '').trim()))
    .sort();
}

function formatValidationErrors(label, errors) {
  return `${label}:\n${errors.map((error) => `${error.path}: ${error.message}`).join('\n')}`;
}

function formatRunSummary(run) {
  return [
    `Run ID: ${run.run_id}`,
    `Scenario: ${run.scenario_id}`,
    `Status: ${run.status}`,
    `Winner: ${run.results.winner || 'n/a'}`,
    `Margin: ${run.results.margin ?? 'n/a'}`,
    `Needs human review: ${run.results.needs_human_review ?? 'n/a'}`,
  ].join('\n') + '\n';
}

function formatCritiqueMarkdown(packet) {
  return [
    `# Critique: ${packet.finding_id}`,
    '',
    `- Target Side: ${packet.target_side}`,
    `- Target Claim IDs: ${(packet.target_claim_ids || []).join(', ')}`,
    `- Attack Type: ${packet.attack_type}`,
    `- Severity: ${packet.severity}`,
    '',
    `## Claim Under Attack`,
    packet.claim_under_attack,
    '',
    `## Evidence Or Reason`,
    packet.evidence_or_reason,
    '',
  ].join('\n');
}

function formatVerdictMarkdown(packet) {
  return [
    '# Verdict',
    '',
    `- Winner: ${packet.winner}`,
    `- Margin: ${packet.margin}`,
    `- Judge Confidence: ${packet.judge_confidence}`,
    `- Needs Human Review: ${packet.needs_human_review}`,
    '',
    '## Dimension Rationales',
    `- Claim Quality: ${packet.dimension_rationales?.claim_quality || 'n/a'}`,
    `- Evidence Discipline: ${packet.dimension_rationales?.evidence_discipline || 'n/a'}`,
    `- Responsiveness To Critique: ${packet.dimension_rationales?.responsiveness_to_critique || 'n/a'}`,
    `- Internal Consistency: ${packet.dimension_rationales?.internal_consistency || 'n/a'}`,
    `- Decision Usefulness: ${packet.dimension_rationales?.decision_usefulness || 'n/a'}`,
    '',
    '## Side Summaries',
    `### Side A Strengths`,
    ...((packet.side_summaries?.side_a?.strengths || []).map((entry) => `- ${entry}`)),
    '',
    `### Side A Weaknesses`,
    ...((packet.side_summaries?.side_a?.weaknesses || []).map((entry) => `- ${entry}`)),
    '',
    `### Side B Strengths`,
    ...((packet.side_summaries?.side_b?.strengths || []).map((entry) => `- ${entry}`)),
    '',
    `### Side B Weaknesses`,
    ...((packet.side_summaries?.side_b?.weaknesses || []).map((entry) => `- ${entry}`)),
    '',
    `- Decisive Dimension: ${packet.decisive_dimension || 'n/a'}`,
    '',
    '## Decisive Findings',
    ...(packet.decisive_findings || []).map((finding) => `- ${finding}`),
    '',
    '## Rationale',
    packet.rationale,
    '',
  ].join('\n');
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath, value) {
  await writeFile(filePath, `${value}\n`, 'utf8');
}

function roundNumber(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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
