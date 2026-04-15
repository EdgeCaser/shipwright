#!/usr/bin/env node

/**
 * Fast Mode analysis runner.
 *
 * Single model, single structured analysis pass. No debate format, no rebuttals,
 * no judge. For users who need a directional answer quickly and accept that the
 * output is provisional.
 *
 * This is a distinct execution path from the conflict harness (Rigor Mode).
 * Escalation from Fast to Rigor Mode regenerates from scratch — Fast Mode output
 * is not fed into the harness as a first-pass artifact.
 *
 * Usage:
 *   node scripts/run-fast-analysis.mjs \
 *     --scenario <scenario-id> \
 *     --agent <claude|gpt|gemini> \
 *     [--scenario-dir <path>] \
 *     [--out-dir <path>] \
 *     [--run-id <id>] \
 *     [--timeout-ms <ms>] \
 *     [--format text|json]
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { route, assessProviderAvailability } from './orchestrate.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_OUT_DIR = path.resolve('benchmarks', 'results', 'fast-analysis');
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_REASONING_EFFORT = 'medium';
const SCHEMA_PATH = path.resolve('schemas', 'fast-analysis.schema.json');

export const AGENT_PROFILES = {
  claude: {
    id: 'claude',
    label: 'claude',
    command: 'cat {{prompt_file}} | claude -p --no-session-persistence --output-format text',
    provider: 'anthropic',
    model: 'claude-max',
  },
  gpt: {
    id: 'gpt',
    label: 'gpt',
    command: 'cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only',
    provider: 'openai',
    model: 'chatgpt-pro',
  },
  gemini: {
    id: 'gemini',
    label: 'gemini',
    command: 'cat {{prompt_file}} | gemini --approval-mode plan --output-format text -p "Use stdin as the full task. Return only the requested JSON object."',
    provider: 'google',
    model: 'gemini-2.5-flash-lite',
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a fast single-pass analysis on a scenario.
 *
 * @param {object} options
 * @param {string} options.scenario        - Scenario ID or path
 * @param {string} [options.scenarioDir]   - Directory to resolve scenario IDs from
 * @param {string} [options.agentId]       - Agent ID: 'claude', 'gpt', or 'gemini'
 * @param {string} [options.agentCommand]  - Shell command template (overrides agentId default)
 * @param {string} [options.provider]      - Provider label for run record
 * @param {string} [options.model]         - Model label for run record
 * @param {string} [options.outDir]        - Output directory root
 * @param {string} [options.runId]         - Explicit run ID (auto-generated if omitted)
 * @param {number} [options.timeoutMs]     - Per-turn timeout in ms
 * @param {string} [options.reasoningEffort]
 * @param {function} [options.turnRunner]  - Injectable turn runner for testing
 */
export async function runFastAnalysis(options = {}) {
  const scenario = await loadScenario(options);
  const agentProfile = resolveAgentProfile(options);
  const runId = normalizeRunId(options.runId, scenario.id);
  const outDir = resolveRunDirectory(scenario.id, runId, options.outDir);
  const timeoutMs = normalizePositiveNumber(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, '--timeout-ms');
  const reasoningEffort = options.reasoningEffort || DEFAULT_REASONING_EFFORT;
  const turnRunner = options.turnRunner || createShellTurnRunner();

  await mkdir(outDir, { recursive: true });

  const config = {
    run_id: runId,
    scenario_id: scenario.id,
    mode: 'fast',
    agent: agentProfile.id,
    provider: agentProfile.provider,
    model: agentProfile.model,
    reasoning_effort: reasoningEffort,
    timeout_ms: timeoutMs,
  };
  await writeJson(path.join(outDir, 'config.json'), config);
  await writeJson(path.join(outDir, 'scenario.json'), scenario);

  const prompt = buildFastAnalysisPrompt(scenario, runId);
  const promptFilePath = path.join(outDir, 'analysis.prompt.txt');
  const rawOutputPath = path.join(outDir, 'analysis.raw.txt');

  const turnResult = await turnRunner({
    phase: 'analysis',
    runId,
    prompt,
    command: agentProfile.command,
    promptFilePath,
    rawOutputPath,
    timeoutMs,
    reasoningEffort,
    cwd: options.cwd || process.cwd(),
  });

  await writeFile(rawOutputPath, turnResult.stdout || '', 'utf8');

  let parsed;
  try {
    parsed = extractJson(turnResult.stdout);
  } catch (error) {
    const run = buildRunRecord({
      runId, scenario, agentProfile, config,
      status: 'error',
      error: `JSON parse failed: ${error.message}`,
      raw: turnResult.stdout,
    });
    await writeJson(path.join(outDir, 'run.json'), run);
    throw new Error(`Fast analysis JSON parse failed for ${scenario.id}: ${error.message}`);
  }

  const validationErrors = validateFastAnalysis(parsed, scenario.id, runId);
  if (validationErrors.length > 0) {
    const run = buildRunRecord({
      runId, scenario, agentProfile, config,
      status: 'error',
      error: `Schema validation failed: ${validationErrors.join('; ')}`,
      raw: turnResult.stdout,
    });
    await writeJson(path.join(outDir, 'run.json'), run);
    throw new Error(`Fast analysis schema validation failed for ${scenario.id}: ${validationErrors.join('; ')}`);
  }

  // Enforce uncertainty payload presence when required.
  const requiresPayload = parsed.confidence_band !== 'high' || parsed.needs_human_review;
  if (requiresPayload && !parsed.uncertainty_payload) {
    // Treat as a soft violation: log it but do not fail the run.
    process.stderr.write(
      `Warning: ${scenario.id} returned confidence_band="${parsed.confidence_band}" and needs_human_review=${parsed.needs_human_review} but omitted uncertainty_payload.\n`,
    );
  }

  const uxState = computeUxState(parsed);

  // Attach orchestrator routing result — tells the user what to do next.
  const scenarioClass = options.scenarioClass || 'unclassified';
  const providerAvailability = assessProviderAvailability(
    options.availableProviders || [agentProfile.id],
  );
  const orchestratorResult = route({
    scenario_class: scenarioClass,
    stage: 'post_single',
    confidence_band: parsed.confidence_band,
    needs_human_review: parsed.needs_human_review,
    uncertainty_payload_present: parsed.uncertainty_payload != null,
    provider_availability: providerAvailability,
  });

  const analysis = {
    ...parsed,
    ux_state: uxState,
    orchestrator: {
      scenario_class: scenarioClass,
      stage: 'post_single',
      ...orchestratorResult,
    },
  };

  await writeJson(path.join(outDir, 'analysis.json'), analysis);

  const run = buildRunRecord({
    runId, scenario, agentProfile, config,
    status: 'completed',
    analysis,
  });
  await writeJson(path.join(outDir, 'run.json'), run);

  return { run, analysis, outDir };
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

export function buildFastAnalysisPrompt(scenario, runId) {
  const prompt = scenario.inputs?.prompt || scenario.prompt || '';
  if (!prompt) {
    throw new Error(`Scenario ${scenario.id} has no prompt field.`);
  }

  const exampleOutput = {
    run_id: runId,
    scenario_id: scenario.id,
    recommendation: 'A concise, direct statement of the recommended direction.',
    confidence_band: 'high',
    needs_human_review: false,
    summary: 'A 1-2 sentence summary of the core reasoning.',
    key_reasoning: [
      'First key reason supporting the recommendation.',
      'Second key reason supporting the recommendation.',
    ],
  };

  const exampleOutputWithPayload = {
    ...exampleOutput,
    confidence_band: 'medium',
    uncertainty_payload: {
      uncertainty_drivers: [
        'Concrete reason this recommendation is uncertain.',
      ],
      disambiguation_questions: [
        'The most important question that would resolve the uncertainty.',
      ],
      needed_evidence: [
        'Specific evidence that would raise confidence.',
      ],
      recommended_next_action: 'The single most important next step before acting on this.',
    },
  };

  return [
    'You are a strategic analyst providing a fast directional recommendation.',
    'Do not reveal your provider identity.',
    'Analyze the scenario below and return a structured JSON recommendation.',
    '',
    'Return ONLY a JSON object. No prose before or after.',
    '',
    'When confidence_band is "high" and needs_human_review is false, use this shape:',
    '',
    JSON.stringify(exampleOutput, null, 2),
    '',
    'When confidence_band is "medium" or "low", OR when needs_human_review is true,',
    'you MUST include an "uncertainty_payload" field. Use this shape:',
    '',
    JSON.stringify(exampleOutputWithPayload, null, 2),
    '',
    'Rules:',
    '- recommendation: a direct, actionable statement of what to do or which direction to take',
    '- confidence_band: "high" if the evidence clearly supports the recommendation, "medium" if there are meaningful gaps or competing factors, "low" if the question cannot be reliably answered with available evidence',
    '- needs_human_review: true if the scenario involves significant stakeholder sensitivity, legal/ethical risk, or information gaps that require human judgment before acting',
    '- key_reasoning: 2-4 bullet points, each one a concrete reason for the recommendation',
    '- uncertainty_payload: required when confidence_band is not "high" or needs_human_review is true',
    '',
    '---',
    '',
    'Scenario:',
    '',
    prompt,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// UX state routing
// ---------------------------------------------------------------------------

export function computeUxState(analysis) {
  if (analysis.confidence_band === 'high' && !analysis.needs_human_review) {
    return 'fast_provisional';
  }
  return 'fast_uncertain';
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFastAnalysis(value, scenarioId, runId) {
  const errors = [];

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return ['Root value must be a JSON object.'];
  }

  if (value.run_id !== runId) {
    errors.push(`run_id mismatch: expected "${runId}", got "${value.run_id}".`);
  }

  if (value.scenario_id !== scenarioId) {
    errors.push(`scenario_id mismatch: expected "${scenarioId}", got "${value.scenario_id}".`);
  }

  if (typeof value.recommendation !== 'string' || value.recommendation.trim().length === 0) {
    errors.push('recommendation must be a non-empty string.');
  }

  if (!['high', 'medium', 'low'].includes(value.confidence_band)) {
    errors.push(`confidence_band must be "high", "medium", or "low". Got: "${value.confidence_band}".`);
  }

  if (typeof value.needs_human_review !== 'boolean') {
    errors.push('needs_human_review must be a boolean.');
  }

  if (typeof value.summary !== 'string' || value.summary.trim().length === 0) {
    errors.push('summary must be a non-empty string.');
  }

  if (!Array.isArray(value.key_reasoning) || value.key_reasoning.length === 0) {
    errors.push('key_reasoning must be a non-empty array.');
  } else if (value.key_reasoning.some((item) => typeof item !== 'string' || item.trim().length === 0)) {
    errors.push('key_reasoning items must be non-empty strings.');
  }

  if (value.uncertainty_payload !== undefined) {
    const p = value.uncertainty_payload;
    if (typeof p !== 'object' || p === null || Array.isArray(p)) {
      errors.push('uncertainty_payload must be an object.');
    } else {
      for (const field of ['uncertainty_drivers', 'disambiguation_questions', 'needed_evidence']) {
        if (!Array.isArray(p[field]) || p[field].length === 0) {
          errors.push(`uncertainty_payload.${field} must be a non-empty array.`);
        }
      }
      if (typeof p.recommended_next_action !== 'string' || p.recommended_next_action.trim().length === 0) {
        errors.push('uncertainty_payload.recommended_next_action must be a non-empty string.');
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Turn runner (mirrors run-conflict-harness.mjs createShellTurnRunner)
// ---------------------------------------------------------------------------

export function createShellTurnRunner(options = {}) {
  const shellConfig = resolveShellConfig(options.shell);

  return async function runShellTurn(turnOptions) {
    if (!turnOptions.command || turnOptions.command.trim().length === 0) {
      throw new Error(`Missing command for fast analysis turn (scenario: ${turnOptions.runId}).`);
    }

    let command = expandCommandTemplate(turnOptions.command, turnOptions);

    let outputFilePath = null;
    if (/\bcodex\s+exec\b/.test(command)) {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'shipwright-fast-'));
      outputFilePath = path.join(tmpDir, 'output.txt');
      command = command.replace(
        /\bcodex\s+exec\b/,
        `codex exec --output-last-message '${outputFilePath}'`,
      );
    }

    // Write prompt to file for {{prompt_file}} template expansion.
    await mkdir(path.dirname(turnOptions.promptFilePath), { recursive: true });
    await writeFile(turnOptions.promptFilePath, turnOptions.prompt, 'utf8');

    const startedAt = Date.now();

    const result = await new Promise((resolve) => {
      const child = spawn(shellConfig.command, shellConfig.args(command), {
        cwd: turnOptions.cwd,
        env: {
          ...process.env,
          SHIPWRIGHT_FAST_RUN_ID: turnOptions.runId,
          SHIPWRIGHT_FAST_PHASE: turnOptions.phase,
          SHIPWRIGHT_FAST_PROMPT_FILE: turnOptions.promptFilePath,
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
        resolve({ stdout, stderr, durationMs: Date.now() - startedAt, ...payload });
      };

      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', (error) => { finalize({ exitCode: 1, spawnError: error.message }); });
      child.on('close', (code) => { finalize({ exitCode: typeof code === 'number' ? code : 1 }); });

      timeoutHandle = setTimeout(() => {
        stderr += `${stderr ? '\n' : ''}Timed out after ${turnOptions.timeoutMs}ms.`;
        child.kill('SIGKILL');
      }, turnOptions.timeoutMs);

      child.stdin.on('error', (error) => {
        stderr += `${stderr ? '\n' : ''}stdin write error: ${error.message}`;
      });
      child.stdin.end(turnOptions.prompt);
    });

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

// ---------------------------------------------------------------------------
// Scenario loading
// ---------------------------------------------------------------------------

async function loadScenario(options) {
  const scenarioId = options.scenario;
  if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.trim().length === 0) {
    throw new Error('--scenario is required.');
  }

  const scenarioDir = path.resolve(options.scenarioDir || DEFAULT_SCENARIO_DIR);
  const scenarioFile = scenarioId.endsWith('.json')
    ? path.resolve(scenarioId)
    : path.join(scenarioDir, `${scenarioId}.json`);

  if (!existsSync(scenarioFile)) {
    throw new Error(`Scenario file not found: ${scenarioFile}`);
  }

  const raw = JSON.parse(await readFile(scenarioFile, 'utf8'));

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Scenario must be a JSON object: ${scenarioFile}`);
  }

  const id = raw.id || raw.scenario_id;
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`Scenario is missing id: ${scenarioFile}`);
  }

  const prompt = raw.inputs?.prompt || raw.prompt;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error(`Scenario is missing inputs.prompt: ${scenarioFile}`);
  }

  return { ...raw, id, source_path: scenarioFile };
}

// ---------------------------------------------------------------------------
// Agent resolution
// ---------------------------------------------------------------------------

function resolveAgentProfile(options) {
  if (options.agentId) {
    const profile = AGENT_PROFILES[options.agentId];
    if (!profile) {
      const supported = Object.keys(AGENT_PROFILES).join(', ');
      throw new Error(`Unknown agent "${options.agentId}". Supported: ${supported}`);
    }
    return { ...profile };
  }

  // Allow fully custom agent config via explicit options.
  if (options.agentCommand) {
    return {
      id: 'custom',
      label: 'custom',
      command: options.agentCommand,
      provider: options.provider || 'unknown',
      model: options.model || 'unknown',
    };
  }

  // Default to claude.
  return { ...AGENT_PROFILES.claude };
}

// ---------------------------------------------------------------------------
// Run record
// ---------------------------------------------------------------------------

function buildRunRecord({ runId, scenario, agentProfile, config, status, analysis, error, raw }) {
  return {
    run_id: runId,
    scenario_id: scenario.id,
    mode: 'fast',
    agent: agentProfile.id,
    provider: agentProfile.provider,
    model: agentProfile.model,
    status,
    recommendation: analysis?.recommendation ?? null,
    confidence_band: analysis?.confidence_band ?? null,
    needs_human_review: analysis?.needs_human_review ?? null,
    ux_state: analysis?.ux_state ?? null,
    has_uncertainty_payload: analysis?.uncertainty_payload != null,
    orchestrator_ux_state: analysis?.orchestrator?.ux_state ?? null,
    orchestrator_next_mode: analysis?.orchestrator?.recommended_next_mode ?? null,
    orchestrator_requires_confirmation: analysis?.orchestrator?.requires_user_confirmation ?? null,
    error: error ?? null,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseCliArgs(argv) {
  const parsed = {
    scenario: '',
    scenarioDir: null,
    scenarioClass: 'unclassified',
    availableProviders: [],
    agentId: 'claude',
    agentCommand: null,
    provider: null,
    model: null,
    outDir: null,
    runId: null,
    cwd: process.cwd(),
    timeoutMs: DEFAULT_TIMEOUT_MS,
    reasoningEffort: DEFAULT_REASONING_EFFORT,
    format: 'text',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scenario':
        parsed.scenario = argv[i + 1] || '';
        i += 1;
        break;
      case '--scenario-dir':
        parsed.scenarioDir = argv[i + 1] || null;
        i += 1;
        break;
      case '--scenario-class':
        parsed.scenarioClass = argv[i + 1] || 'unclassified';
        i += 1;
        break;
      case '--available-provider':
        parsed.availableProviders.push(argv[i + 1] || '');
        i += 1;
        break;
      case '--agent':
        parsed.agentId = argv[i + 1] || 'claude';
        i += 1;
        break;
      case '--agent-command':
        parsed.agentCommand = argv[i + 1] || null;
        i += 1;
        break;
      case '--provider':
        parsed.provider = argv[i + 1] || null;
        i += 1;
        break;
      case '--model':
        parsed.model = argv[i + 1] || null;
        i += 1;
        break;
      case '--out-dir':
        parsed.outDir = argv[i + 1] || null;
        i += 1;
        break;
      case '--run-id':
        parsed.runId = argv[i + 1] || null;
        i += 1;
        break;
      case '--cwd':
        parsed.cwd = argv[i + 1] || process.cwd();
        i += 1;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[i + 1]) || DEFAULT_TIMEOUT_MS;
        i += 1;
        break;
      case '--reasoning-effort':
        parsed.reasoningEffort = argv[i + 1] || DEFAULT_REASONING_EFFORT;
        i += 1;
        break;
      case '--format':
        parsed.format = argv[i + 1] || 'text';
        i += 1;
        break;
      default:
        break;
    }
  }

  return parsed;
}

function formatRunSummary(run, analysis) {
  const lines = [];
  lines.push(`# Fast Analysis: ${run.scenario_id}`);
  lines.push('');
  lines.push(`Run ID:    ${run.run_id}`);
  lines.push(`Agent:     ${run.agent} (${run.provider})`);
  lines.push(`Status:    ${run.status}`);
  lines.push(`UX State:  ${run.ux_state}`);
  lines.push('');

  if (run.status === 'completed' && analysis) {
    lines.push(`**${analysis.recommendation}**`);
    lines.push('');
    lines.push(`Confidence: ${analysis.confidence_band}  |  Human review: ${analysis.needs_human_review}`);
    lines.push('');
    lines.push(analysis.summary);
    lines.push('');
    lines.push('Key reasoning:');
    for (const reason of analysis.key_reasoning) {
      lines.push(`- ${reason}`);
    }

    if (analysis.uncertainty_payload) {
      lines.push('');
      lines.push('--- Uncertainty Payload ---');
      lines.push('');
      lines.push('Uncertainty drivers:');
      for (const driver of analysis.uncertainty_payload.uncertainty_drivers) {
        lines.push(`- ${driver}`);
      }
      lines.push('');
      lines.push('Disambiguation questions:');
      for (const q of analysis.uncertainty_payload.disambiguation_questions) {
        lines.push(`- ${q}`);
      }
      lines.push('');
      lines.push('Needed evidence:');
      for (const ev of analysis.uncertainty_payload.needed_evidence) {
        lines.push(`- ${ev}`);
      }
      lines.push('');
      lines.push(`Next action: ${analysis.uncertainty_payload.recommended_next_action}`);
    }
  }

  if (run.status === 'completed' && analysis?.orchestrator) {
    const o = analysis.orchestrator;
    lines.push('');
    lines.push('--- What to do next ---');
    lines.push('');
    lines.push(o.explanation);
    if (o.follow_up_action) {
      lines.push('');
      lines.push(`Next action: ${o.follow_up_action}`);
    }
    if (o.recommended_next_mode) {
      lines.push(`Next mode:   ${o.recommended_next_mode}${o.requires_user_confirmation ? ' (confirmation required)' : ''}`);
    }
  }

  if (run.error) {
    lines.push('');
    lines.push(`Error: ${run.error}`);
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function resolveRunDirectory(scenarioId, runId, outDir) {
  const root = path.resolve(outDir || DEFAULT_OUT_DIR);
  return path.join(root, scenarioId, runId);
}

function normalizeRunId(value, scenarioId) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').replace('Z', 'Z');
  return `fast-${timestamp}-${scenarioId}`;
}

function normalizePositiveNumber(value, flagName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${flagName} must be a positive number.`);
  }
  return value;
}

function expandCommandTemplate(command, turnOptions) {
  // Normalize path separators to forward slashes for Git Bash on Windows.
  const promptFile = (turnOptions.promptFilePath || '').replace(/\\/g, '/');
  return command.replace(/\{\{prompt_file\}\}/g, promptFile);
}

function extractJson(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('No output to parse.');
  }

  const trimmed = raw.trim();

  // Try parsing directly first.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // Extract from fenced code block.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    return JSON.parse(fenced[1].trim());
  }

  // Find first { and last } as fallback.
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error('Could not locate JSON object in model output.');
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

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('run-fast-analysis.mjs') || process.argv[1].endsWith('run-fast-analysis'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    const { run, analysis, outDir } = await runFastAnalysis({
      scenario: args.scenario,
      scenarioDir: args.scenarioDir || undefined,
      scenarioClass: args.scenarioClass || 'unclassified',
      availableProviders: args.availableProviders.length > 0 ? args.availableProviders : undefined,
      agentId: args.agentCommand ? undefined : args.agentId,
      agentCommand: args.agentCommand || undefined,
      provider: args.provider || undefined,
      model: args.model || undefined,
      outDir: args.outDir || undefined,
      runId: args.runId || undefined,
      cwd: args.cwd,
      timeoutMs: args.timeoutMs,
      reasoningEffort: args.reasoningEffort,
    });

    if (args.format === 'json') {
      console.log(JSON.stringify({ run, analysis, outDir }, null, 2));
    } else {
      process.stdout.write(formatRunSummary(run, analysis));
      process.stderr.write(`Output: ${outDir}\n`);
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}
