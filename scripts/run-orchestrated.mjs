#!/usr/bin/env node

/**
 * Orchestrated analysis runner for Shipwright.
 *
 * Thin CLI adapter over the decision-session controller. The product flow now
 * lives in the session stack:
 * - decision-session-controller.mjs
 * - decision-execution.mjs
 * - session-presenter.mjs
 *
 * This wrapper exists for CLI compatibility only.
 */

import path from 'node:path';
import {
  route,
  assessProviderAvailability,
  SCENARIO_CLASSES,
} from './orchestrate.mjs';
import {
  startDecisionSession,
  getDecisionSession,
  confirmNextStep,
} from './decision-session-controller.mjs';

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_OUT_DIR = path.resolve('benchmarks', 'results', 'orchestrated');

/**
 * Run an orchestrated analysis on a scenario.
 *
 * @param {object} options
 * @param {string} options.scenario
 * @param {string} [options.scenarioClass]
 * @param {string[]} [options.availableProviders]
 * @param {string} [options.scenarioDir]
 * @param {string} [options.outDir]
 * @param {boolean} [options.autoConfirm]
 * @param {boolean} [options.dryRun]
 * @param {number} [options.timeoutMs]
 * @param {'text'|'json'} [options.format]
 */
export async function runOrchestrated(options = {}) {
  const scenarioArg = options.scenario;
  if (!scenarioArg || typeof scenarioArg !== 'string' || scenarioArg.trim().length === 0) {
    throw new Error('--scenario is required.');
  }

  const scenarioClass = options.scenarioClass || 'unclassified';
  const availableProviders = options.availableProviders || ['claude'];
  const scenarioPath = resolveScenarioPath(scenarioArg, options.scenarioDir || DEFAULT_SCENARIO_DIR);
  const dryRun = Boolean(options.dryRun);
  const outDir = path.resolve(options.outDir || DEFAULT_OUT_DIR);
  const format = options.format || 'text';

  if (dryRun) {
    const providerAvailability = assessProviderAvailability(availableProviders);
    const routingResult = route({
      scenario_class: scenarioClass,
      stage: 'pre_run',
      confidence_band: null,
      needs_human_review: null,
      uncertainty_payload_present: false,
      provider_availability: providerAvailability,
    });
    const payload = {
      dryRun: true,
      scenario: scenarioArg,
      scenario_path: scenarioPath,
      scenario_class: scenarioClass,
      provider_availability: providerAvailability,
      routing: routingResult,
    };
    printOutput(payload, format, true);
    return payload;
  }

  const started = await startDecisionSession({
    question: deriveQuestionFromScenarioPath(scenarioArg, scenarioPath),
    scenario_id: path.basename(scenarioPath, '.json'),
    scenario_class: scenarioClass,
    available_providers: availableProviders,
    scenario_path: scenarioPath,
    sessions_root: path.join(outDir, 'sessions'),
    fast_out_dir: path.join(outDir, 'stage-1-fast'),
    rigor_out_dir: path.join(outDir, 'stage-2-rigor'),
    auto_confirm: Boolean(options.autoConfirm),
    timeout_ms: options.timeoutMs,
  });

  let result = started;

  if (options.autoConfirm && started.session?.status === 'awaiting_user_action') {
    result = await confirmNextStep(started.session.session_id, {
      sessions_root: path.join(outDir, 'sessions'),
      timeout_ms: options.timeoutMs,
      rigor_out_dir: path.join(outDir, 'stage-2-rigor'),
    });
  } else if (started.session?.session_id) {
    result = await getDecisionSession(started.session.session_id, path.join(outDir, 'sessions'));
  }

  printOutput(result, format, false);
  return result;
}

function resolveScenarioPath(scenarioArg, scenarioDir) {
  if (scenarioArg.endsWith('.json')) {
    return path.resolve(scenarioArg);
  }
  return path.resolve(scenarioDir, `${scenarioArg}.json`);
}

function deriveQuestionFromScenarioPath(scenarioArg, scenarioPath) {
  if (!scenarioArg.endsWith('.json')) {
    return path.basename(scenarioArg, '.json').replace(/-/g, ' ');
  }
  return path.basename(scenarioPath, '.json').replace(/-/g, ' ');
}

function printOutput(result, format, isDryRun) {
  if (format === 'json') {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  if (isDryRun) {
    process.stdout.write(`\n=== DRY RUN ===\n`);
    process.stdout.write(`State: ${result.routing.ux_state}\n`);
    if (result.routing.ux_substate) {
      process.stdout.write(`Substate: ${result.routing.ux_substate}\n`);
    }
    if (result.routing.recommended_next_mode) {
      process.stdout.write(`Next mode: ${result.routing.recommended_next_mode}\n`);
    }
    process.stdout.write(`\n${result.routing.explanation}\n`);
    if (result.routing.follow_up_action) {
      process.stdout.write(`Action: ${result.routing.follow_up_action}\n`);
    }
    return;
  }

  const presented = result.presented || null;
  if (!presented) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  process.stdout.write(`\n=== ${presented.headline} ===\n`);
  process.stdout.write(`State: ${presented.state}\n`);
  if (presented.substate) {
    process.stdout.write(`Substate: ${presented.substate}\n`);
  }
  if (presented.current_recommendation) {
    process.stdout.write(`\nRecommendation:\n${presented.current_recommendation}\n`);
  }
  if (presented.why_this_state) {
    process.stdout.write(`\nWhy:\n${presented.why_this_state}\n`);
  }
  if (presented.recommended_next_action) {
    process.stdout.write(`\nNext action:\n${presented.recommended_next_action}\n`);
  }
  if (presented.uncertainty_payload) {
    process.stdout.write(`\nUncertainty guidance:\n`);
    printUncertaintyPayload(presented.uncertainty_payload);
  }
  if (presented.available_actions?.length) {
    process.stdout.write(`\nAvailable actions: ${presented.available_actions.join(', ')}\n`);
  }
  process.stdout.write(`\nSession ID: ${presented.session_id}\n`);
}

function printUncertaintyPayload(payload) {
  for (const item of payload.uncertainty_drivers || []) {
    process.stdout.write(`- Driver: ${item}\n`);
  }
  for (const item of payload.disambiguation_questions || []) {
    process.stdout.write(`- Question: ${item}\n`);
  }
  for (const item of payload.needed_evidence || []) {
    process.stdout.write(`- Evidence: ${item}\n`);
  }
  if (payload.recommended_next_artifact) {
    process.stdout.write(`- Artifact: ${payload.recommended_next_artifact}\n`);
  }
  if (payload.escalation_recommendation) {
    process.stdout.write(`- Escalation: ${payload.escalation_recommendation}\n`);
  }
}

export function parseCliArgs(argv) {
  const parsed = {
    scenario: '',
    scenarioClass: 'unclassified',
    availableProviders: [],
    scenarioDir: DEFAULT_SCENARIO_DIR,
    outDir: null,
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

  if (parsed.availableProviders.length === 0) {
    parsed.availableProviders = ['claude'];
  }

  if (!SCENARIO_CLASSES[parsed.scenarioClass]) {
    const supported = Object.keys(SCENARIO_CLASSES).join(', ');
    throw new Error(`Unknown scenario class "${parsed.scenarioClass}". Supported: ${supported}`);
  }

  return parsed;
}

const isMain = process.argv[1]
  && (process.argv[1].endsWith('run-orchestrated.mjs') || process.argv[1].endsWith('run-orchestrated'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    await runOrchestrated(args);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}
