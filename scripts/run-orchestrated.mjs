#!/usr/bin/env node

/**
 * Orchestrated analysis runner for Shipwright.
 *
 * Single entry point: present a scenario, get routed to Fast Mode or Rigor Mode
 * based on scenario class and provider availability. Confirmation gates prevent
 * escalation from running without explicit user approval.
 *
 * Flow:
 *   1. pre_run routing  â€” decide starting mode based on scenario class + providers
 *   2. Fast Mode        â€” single-pass analysis
 *   3. post_single      â€” orchestrator evaluates Fast Mode result
 *   4. [gate]           â€” if escalation recommended, ask for confirmation
 *   5. Rigor Mode       â€” full conflict harness (debate + third-family judge)
 *   6. post_judge       â€” orchestrator evaluates Rigor Mode result
 *   7. terminal state   â€” provisional / more_rigor_recommended / not_ready
 *
 * Usage:
 *   node scripts/run-orchestrated.mjs \
 *     --scenario <id> \
 *     --scenario-class <governance|pricing|product_strategy|publication|unclassified> \
 *     --available-provider claude \
 *     --available-provider gpt \
 *     [--available-provider gemini] \
 *     [--yes]          # auto-confirm all escalation gates
 *     [--dry-run]      # print routing plan without running
 *     [--out-dir <path>]
 *
 * Examples:
 *   node scripts/run-orchestrated.mjs \
 *     --scenario bayer-breakup-not-now \
 *     --scenario-class governance \
 *     --available-provider claude \
 *     --available-provider gpt
 *
 *   node scripts/run-orchestrated.mjs \
 *     --scenario pricing-partial-data \
 *     --scenario-class pricing \
 *     --available-provider claude \
 *     --yes
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import path from 'node:path';
import {
  route,
  assessProviderAvailability,
  SCENARIO_CLASSES,
} from './orchestrate.mjs';
import { runFastAnalysis, AGENT_PROFILES } from './run-fast-analysis.mjs';
import { runConflictHarness } from './run-conflict-harness.mjs';
import { buildCasePacketFromScenario } from './build-case-packet.mjs';
import { emit } from './telemetry.mjs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_OUT_DIR = path.resolve('benchmarks', 'results', 'orchestrated');

/**
 * Provider-to-command mapping used for both Fast Mode and Rigor Mode turns.
 * These match the commands in AGENT_PROFILES and run-conflict-harness.mjs defaults.
 */
const PROVIDER_COMMANDS = {
  claude: 'cat {{prompt_file}} | claude -p --no-session-persistence --output-format text',
  gpt: 'cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only',
  gemini: 'cat {{prompt_file}} | gemini --approval-mode plan --output-format text -p "Use stdin as the full task. Return only the requested JSON object."',
};

const PROVIDER_META = {
  claude: { provider: 'anthropic', model: 'claude-max' },
  gpt: { provider: 'openai', model: 'chatgpt-pro' },
  gemini: { provider: 'google', model: 'gemini-2.5-flash-lite' },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run an orchestrated analysis on a scenario.
 *
 * @param {object} options
 * @param {string} options.scenario                  - Scenario ID
 * @param {string} [options.scenarioClass]           - Scenario class ID
 * @param {string[]} [options.availableProviders]    - Available provider IDs
 * @param {string} [options.scenarioDir]
 * @param {string} [options.outDir]
 * @param {string} [options.runId]
 * @param {boolean} [options.autoConfirm]            - Skip confirmation gates
 * @param {boolean} [options.dryRun]                 - Print plan only, no execution
 * @param {number} [options.timeoutMs]
 * @param {function} [options.confirmFn]             - Injectable confirmation function for testing
 */
export async function runOrchestrated(options = {}) {
  const scenarioArg = options.scenario;
  if (!scenarioArg || typeof scenarioArg !== 'string' || scenarioArg.trim().length === 0) {
    throw new Error('--scenario is required.');
  }

  // When a full file path is passed (e.g. from shipwright.mjs), derive the ID
  // from the basename so it doesn't bleed into output directory names.
  const scenarioId = scenarioArg.endsWith('.json')
    ? path.basename(scenarioArg, '.json')
    : scenarioArg;

  const scenarioClass = options.scenarioClass || 'unclassified';
  const availableProviders = options.availableProviders || ['claude'];
  const autoConfirm = Boolean(options.autoConfirm);
  const dryRun = Boolean(options.dryRun);
  const scenarioDir = options.scenarioDir || DEFAULT_SCENARIO_DIR;
  const timeoutMs = options.timeoutMs || 120_000;
  const confirmFn = options.confirmFn || makeStdinConfirm();

  const runId = options.runId || generateRunId(scenarioId);
  const outDir = path.resolve(options.outDir || DEFAULT_OUT_DIR, scenarioId, runId);

  if (!dryRun) {
    await mkdir(outDir, { recursive: true });
  }

  const providerAvailability = assessProviderAvailability(availableProviders);
  const orchestrationLog = [];

  // -------------------------------------------------------------------------
  // Pre-run routing
  // -------------------------------------------------------------------------

  const preRunResult = route({
    scenario_class: scenarioClass,
    stage: 'pre_run',
    confidence_band: null,
    needs_human_review: null,
    uncertainty_payload_present: false,
    provider_availability: providerAvailability,
  });

  orchestrationLog.push({ stage: 'pre_run', result: preRunResult });

  printStage('PRE-RUN', preRunResult.explanation);

  if (dryRun) {
    printStage('DRY RUN', `Would run: ${preRunResult.recommended_next_mode || 'single_analysis'}`);
    printTerminalState(preRunResult);
    return { dryRun: true, preRunResult, orchestrationLog };
  }

  emit('run_started', {
    run_id: runId,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    available_providers: availableProviders,
    can_run_double_panel: providerAvailability.can_run_double_panel,
  });

  // -------------------------------------------------------------------------
  // Stage 1: Fast Mode
  // -------------------------------------------------------------------------

  // Pick the first available provider for Fast Mode.
  const fastProvider = pickFastProvider(availableProviders);

  if (!AGENT_PROFILES[fastProvider]) {
    throw new Error(`Provider "${fastProvider}" is not available for Fast Mode. Supported: ${Object.keys(AGENT_PROFILES).join(', ')}`);
  }

  printStage('STAGE 1 â€” FAST MODE', `Running ${fastProvider} fast analysis on: ${scenarioId}`);

  let fastRun;
  let fastAnalysis;

  try {
    const result = await runFastAnalysis({
      scenario: scenarioArg,
      scenarioDir,
      agentId: fastProvider,
      outDir: path.join(outDir, 'stage-1-fast'),
      runId: `${runId}-fast`,
      scenarioClass,
      availableProviders,
      timeoutMs,
    });
    fastRun = result.run;
    fastAnalysis = result.analysis;
  } catch (err) {
    throw new Error(`Fast Mode failed: ${err.message}`);
  }

  printFastResult(fastRun, fastAnalysis);

  emit('fast_completed', {
    run_id: runId,
    fast_run_id: fastRun.run_id,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    agent: fastProvider,
    confidence_band: fastRun.confidence_band,
    ux_state: fastRun.ux_state,
    needs_human_review: fastRun.needs_human_review,
    has_uncertainty_payload: fastRun.has_uncertainty_payload,
  });

  // -------------------------------------------------------------------------
  // Post-single routing
  // -------------------------------------------------------------------------

  const postSingleResult = route({
    scenario_class: scenarioClass,
    stage: 'post_single',
    confidence_band: fastRun.confidence_band,
    needs_human_review: fastRun.needs_human_review,
    uncertainty_payload_present: fastAnalysis?.uncertainty_payload != null,
    provider_availability: providerAvailability,
  });

  orchestrationLog.push({ stage: 'post_single', result: postSingleResult });

  // -------------------------------------------------------------------------
  // Terminal check: if post_single is already provisional with no escalation
  // -------------------------------------------------------------------------

  if (
    postSingleResult.ux_state === 'provisional' &&
    !postSingleResult.recommended_next_mode
  ) {
    await writeOrchestrationArtifacts(outDir, {
      runId,
      scenarioId,
      scenarioClass,
      orchestrationLog,
      terminalStage: 'post_single',
      terminalResult: postSingleResult,
      fastRunId: fastRun.run_id,
    });

    emit('run_completed', {
      run_id: runId,
      scenario_id: scenarioId,
      scenario_class: scenarioClass,
      terminal_stage: 'post_single',
      terminal_ux_state: postSingleResult.ux_state,
      terminal_ux_substate: postSingleResult.ux_substate,
      stages_run: ['fast'],
    });

    printStage('RESULT', postSingleResult.explanation);
    printTerminalState(postSingleResult);
    return {
      runId,
      scenarioId,
      terminalStage: 'post_single',
      terminalUxState: postSingleResult.ux_state,
      orchestrationLog,
    };
  }

  // -------------------------------------------------------------------------
  // Escalation gate: Rigor Mode
  // -------------------------------------------------------------------------

  const shouldRunRigor = providerAvailability.can_run_third_family_judge && (
    postSingleResult.recommended_next_mode === 'double_panel' ||
    postSingleResult.recommended_next_mode === 'judge'
  );

  if (!shouldRunRigor) {
    // No escalation path available â€” terminal at post_single.
    await writeOrchestrationArtifacts(outDir, {
      runId,
      scenarioId,
      scenarioClass,
      orchestrationLog,
      terminalStage: 'post_single',
      terminalResult: postSingleResult,
      fastRunId: fastRun.run_id,
    });

    emit('run_completed', {
      run_id: runId,
      scenario_id: scenarioId,
      scenario_class: scenarioClass,
      terminal_stage: 'post_single',
      terminal_ux_state: postSingleResult.ux_state,
      terminal_ux_substate: postSingleResult.ux_substate,
      stages_run: ['fast'],
    });

    printStage('RESULT', postSingleResult.explanation);
    if (postSingleResult.follow_up_action) {
      process.stdout.write(`Next action: ${postSingleResult.follow_up_action}\n`);
    }
    printTerminalState(postSingleResult);
    return {
      runId,
      scenarioId,
      terminalStage: 'post_single',
      terminalUxState: postSingleResult.ux_state,
      orchestrationLog,
    };
  }

  // -------------------------------------------------------------------------
  // Confirmation gate
  // -------------------------------------------------------------------------

  printStage('ESCALATION GATE', postSingleResult.explanation);
  process.stdout.write(`\nRecommendation: ${postSingleResult.follow_up_action}\n`);
  process.stdout.write('This will run a full conflict harness (debate + judge) across three model families.\n');

  emit('escalation_offered', {
    run_id: runId,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    fast_ux_state: fastRun.ux_state,
    fast_confidence: fastRun.confidence_band,
    recommended_next_mode: postSingleResult.recommended_next_mode,
  });

  const confirmed = autoConfirm
    ? (process.stdout.write('Auto-confirming escalation (--yes)\n'), true)
    : await confirmFn('Run Rigor Mode? [y/N] ');

  if (!confirmed) {
    const userDeclinedResult = route({
      scenario_class: scenarioClass,
      stage: 'post_single',
      confidence_band: fastRun.confidence_band,
      needs_human_review: fastRun.needs_human_review,
      uncertainty_payload_present: fastAnalysis?.uncertainty_payload != null,
      user_declined_escalation: true,
      provider_availability: providerAvailability,
    });

    orchestrationLog.push({ stage: 'post_single_declined', result: userDeclinedResult });

    await writeOrchestrationArtifacts(outDir, {
      runId,
      scenarioId,
      scenarioClass,
      orchestrationLog,
      terminalStage: 'post_single_declined',
      terminalResult: userDeclinedResult,
      fastRunId: fastRun.run_id,
    });

    emit('escalation_declined', {
      run_id: runId,
      scenario_id: scenarioId,
      scenario_class: scenarioClass,
    });

    emit('run_completed', {
      run_id: runId,
      scenario_id: scenarioId,
      scenario_class: scenarioClass,
      terminal_stage: 'post_single_declined',
      terminal_ux_state: userDeclinedResult.ux_state,
      terminal_ux_substate: userDeclinedResult.ux_substate,
      stages_run: ['fast'],
    });

    printStage('RESULT', userDeclinedResult.explanation);
    printTerminalState(userDeclinedResult);
    return {
      runId,
      scenarioId,
      terminalStage: 'post_single_declined',
      terminalUxState: userDeclinedResult.ux_state,
      orchestrationLog,
    };
  }

  emit('escalation_accepted', {
    run_id: runId,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
  });

  // -------------------------------------------------------------------------
  // Stage 2: Rigor Mode (conflict harness)
  // -------------------------------------------------------------------------

  const { sideA, sideB, judge } = assignRoles(availableProviders);

  printStage(
    'STAGE 2 â€” RIGOR MODE',
    `Running conflict harness: ${sideA} vs ${sideB}, judged by ${judge}`,
  );

  let rigorRun;

  try {
    // Build the case packet directly to avoid the benchmark fixture validation
    // in loadBenchmarkScenario â€” orchestrated runs don't need pre-authored artifacts.
    const scenarioFilePath = scenarioArg.endsWith('.json')
      ? path.resolve(scenarioArg)
      : path.join(scenarioDir, `${scenarioArg}.json`);
    const scenarioJson = JSON.parse(await readFile(scenarioFilePath, 'utf8'));
    const casePacket = buildCasePacketFromScenario(scenarioJson);

    const result = await runConflictHarness({
      casePacket,
      outDir: path.join(outDir, 'stage-2-rigor'),
      runId: `${runId}-rigor`,
      sideACommand: PROVIDER_COMMANDS[sideA] || PROVIDER_COMMANDS.gpt,
      sideBCommand: PROVIDER_COMMANDS[sideB] || PROVIDER_COMMANDS.claude,
      judgeCommand: PROVIDER_COMMANDS[judge] || PROVIDER_COMMANDS.gpt,
      sideAProvider: PROVIDER_META[sideA]?.provider || sideA,
      sideAModel: PROVIDER_META[sideA]?.model || sideA,
      sideBProvider: PROVIDER_META[sideB]?.provider || sideB,
      sideBModel: PROVIDER_META[sideB]?.model || sideB,
      judgeProvider: PROVIDER_META[judge]?.provider || judge,
      judgeModel: PROVIDER_META[judge]?.model || judge,
      timeoutMs,
    });
    rigorRun = result.run;
  } catch (err) {
    throw new Error(`Rigor Mode failed: ${err.message}`);
  }

  printRigorResult(rigorRun);

  const rigorResultRaw = rigorRun.results || rigorRun.verdict || {};

  emit('rigor_completed', {
    run_id: runId,
    rigor_run_id: rigorRun.run_id,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    side_a: sideA,
    side_b: sideB,
    judge,
    winner: rigorResultRaw.winner || null,
    judge_confidence: rigorResultRaw.judge_confidence || null,
    needs_human_review: rigorResultRaw.needs_human_review || false,
    has_uncertainty_payload: rigorResultRaw.uncertainty_payload != null,
  });

  // -------------------------------------------------------------------------
  // Post-judge routing
  // -------------------------------------------------------------------------

  const rigorConfidence = rigorResultRaw.judge_confidence || null;
  const rigorNeedsReview = rigorResultRaw.needs_human_review || false;
  const rigorHasPayload = rigorResultRaw.uncertainty_payload != null;

  const postJudgeResult = route({
    scenario_class: scenarioClass,
    stage: 'post_judge',
    confidence_band: rigorConfidence,
    needs_human_review: rigorNeedsReview,
    uncertainty_payload_present: rigorHasPayload,
    panel_agreement: null, // head_to_head: judge always resolves; not directionally_incoherent
    provider_availability: providerAvailability,
  });

  orchestrationLog.push({ stage: 'post_judge', result: postJudgeResult });

  await writeOrchestrationArtifacts(outDir, {
    runId,
    scenarioId,
    scenarioClass,
    orchestrationLog,
    terminalStage: 'post_judge',
    terminalResult: postJudgeResult,
    fastRunId: fastRun.run_id,
    rigorRunId: rigorRun.run_id,
  });

  emit('run_completed', {
    run_id: runId,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    terminal_stage: 'post_judge',
    terminal_ux_state: postJudgeResult.ux_state,
    terminal_ux_substate: postJudgeResult.ux_substate,
    stages_run: ['fast', 'rigor'],
  });

  printStage('RESULT', postJudgeResult.explanation);
  if (postJudgeResult.follow_up_action) {
    process.stdout.write(`Next action: ${postJudgeResult.follow_up_action}\n`);
  }
  printTerminalState(postJudgeResult);

  return {
    runId,
    scenarioId,
    terminalStage: 'post_judge',
    terminalUxState: postJudgeResult.ux_state,
    orchestrationLog,
  };
}

// ---------------------------------------------------------------------------
// Output artifacts
// ---------------------------------------------------------------------------

async function writeOrchestrationArtifacts(outDir, opts) {
  const {
    runId,
    scenarioId,
    scenarioClass,
    orchestrationLog,
    terminalStage,
    terminalResult,
    fastRunId,
    rigorRunId,
  } = opts;

  const orchestration = {
    run_id: runId,
    scenario_id: scenarioId,
    scenario_class: scenarioClass,
    terminal_stage: terminalStage,
    terminal_ux_state: terminalResult.ux_state,
    terminal_ux_substate: terminalResult.ux_substate,
    terminal_explanation: terminalResult.explanation,
    fast_run_id: fastRunId || null,
    rigor_run_id: rigorRunId || null,
    log: orchestrationLog,
    completed_at: new Date().toISOString(),
  };

  await writeJson(path.join(outDir, 'orchestration.json'), orchestration);
}

// ---------------------------------------------------------------------------
// Print helpers
// ---------------------------------------------------------------------------

function printStage(label, message) {
  process.stdout.write(`\n=== ${label} ===\n${message}\n`);
}

function printFastResult(run, analysis) {
  process.stdout.write(`\nFast Mode result:\n`);
  process.stdout.write(`  UX state:   ${run.ux_state}\n`);
  process.stdout.write(`  Confidence: ${run.confidence_band}\n`);
  if (analysis?.recommendation) {
    process.stdout.write(`  Direction:  ${analysis.recommendation}\n`);
  }
}

function printRigorResult(run) {
  process.stdout.write(`\nRigor Mode result:\n`);
  process.stdout.write(`  Status:           ${run.status}\n`);
  const result = run.results || run.verdict;
  if (result) {
    process.stdout.write(`  Winner:           ${result.winner || '(none)'}\n`);
    process.stdout.write(`  Judge confidence: ${result.judge_confidence || '(none)'}\n`);
    process.stdout.write(`  Needs review:     ${result.needs_human_review}\n`);
    if (result.decisive_dimension) {
      process.stdout.write(`  Decisive factor:  ${result.decisive_dimension}\n`);
    }
  }
}

function printTerminalState(result) {
  const label = result.ux_state.toUpperCase().replace(/_/g, ' ');
  process.stdout.write(`\n--- TERMINAL STATE: ${label} ---\n`);
  if (result.ux_substate) {
    process.stdout.write(`Substate: ${result.ux_substate}\n`);
  }
}

// ---------------------------------------------------------------------------
// Confirmation gate
// ---------------------------------------------------------------------------

function makeStdinConfirm() {
  return async function confirm(prompt) {
    if (!process.stdin.isTTY) {
      process.stdout.write(`${prompt}(confirmation unavailable: stdin is not a TTY; rerun with --yes to confirm)\n`);
      return false;
    }

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
      });
    });
  };
}

// ---------------------------------------------------------------------------
// Provider role assignment
// ---------------------------------------------------------------------------

/**
 * Assign side_a, side_b, and judge from available providers.
 *
 * Default preference: gpt â†’ side_a, claude â†’ side_b, gemini â†’ judge.
 * Falls back gracefully when fewer providers are available.
 */
function assignRoles(availableProviders) {
  const available = [...availableProviders];

  if (available.length < 3) {
    throw new Error('Rigor Mode requires three distinct providers: two debaters and a third-family judge.');
  }

  // Preferred assignments
  const preferred = { sideA: 'gpt', sideB: 'claude', judge: 'gemini' };

  const sideA = available.includes(preferred.sideA) ? preferred.sideA
    : available[0] || 'gpt';

  const remaining = available.filter((p) => p !== sideA);

  const sideB = remaining.includes(preferred.sideB) ? preferred.sideB
    : remaining[0] || 'claude';

  const remainingForJudge = remaining.filter((p) => p !== sideB);

  const judge = remainingForJudge.includes(preferred.judge) ? preferred.judge
    : remainingForJudge[0];

  return { sideA, sideB, judge };
}

/**
 * Pick the provider to use for Fast Mode (stage 1).
 * Prefer claude, then first available.
 */
function pickFastProvider(availableProviders) {
  if (availableProviders.includes('claude')) return 'claude';
  return availableProviders[0] || 'claude';
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function generateRunId(scenarioId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').replace('Z', 'Z');
  return `orchestrated-${timestamp}-${scenarioId}`;
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseCliArgs(argv) {
  const parsed = {
    scenario: '',
    scenarioClass: 'unclassified',
    availableProviders: [],
    scenarioDir: DEFAULT_SCENARIO_DIR,
    outDir: null,
    runId: null,
    autoConfirm: false,
    dryRun: false,
    timeoutMs: 120_000,
    format: 'text',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scenario':
        parsed.scenario = argv[i + 1] || '';
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
      case '--scenario-dir':
        parsed.scenarioDir = argv[i + 1] || DEFAULT_SCENARIO_DIR;
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
      case '--yes':
        parsed.autoConfirm = true;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[i + 1]) || 120_000;
        i += 1;
        break;
      case '--format':
        parsed.format = argv[i + 1] || 'text';
        i += 1;
        break;
      default:
        if (token.startsWith('--')) {
          throw new Error(`Unknown flag: ${token}`);
        }
        break;
    }
  }

  // Default to claude if no provider specified.
  if (parsed.availableProviders.length === 0) {
    parsed.availableProviders = ['claude'];
  }

  // Validate scenario class.
  if (!SCENARIO_CLASSES[parsed.scenarioClass]) {
    const supported = Object.keys(SCENARIO_CLASSES).join(', ');
    throw new Error(`Unknown scenario class "${parsed.scenarioClass}". Supported: ${supported}`);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('run-orchestrated.mjs') || process.argv[1].endsWith('run-orchestrated'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    await runOrchestrated({
      scenario: args.scenario,
      scenarioClass: args.scenarioClass,
      availableProviders: args.availableProviders,
      scenarioDir: args.scenarioDir,
      outDir: args.outDir || undefined,
      runId: args.runId || undefined,
      autoConfirm: args.autoConfirm,
      dryRun: args.dryRun,
      timeoutMs: args.timeoutMs,
    });
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

