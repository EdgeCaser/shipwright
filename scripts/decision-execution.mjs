#!/usr/bin/env node

/**
 * Decision execution adapters for session-based orchestration.
 *
 * These functions wrap the existing Fast Mode and Rigor Mode runners and
 * normalize their outputs into session-friendly records.
 *
 * Controller layers should call these functions instead of talking directly to
 * CLI entrypoints or shell commands.
 */

import { mkdtempSync } from 'node:fs';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runFastAnalysis, AGENT_PROFILES } from './run-fast-analysis.mjs';

const DEFAULT_FAST_OUT_DIR = path.resolve('benchmarks', 'results', 'fast-analysis');
const DEFAULT_RIGOR_OUT_DIR = path.resolve('benchmarks', 'results', 'orchestrated');

const PROVIDER_COMMANDS = {
  claude: 'cat {{prompt_file}} | claude -p --no-session-persistence --output-format text',
  gpt: 'cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only',
  gemini: 'cat {{prompt_file}} | gemini --model gemini-2.5-flash --approval-mode plan --output-format text -p "Use stdin as the full task. Return only the requested JSON object."',
};

const PROVIDER_META = {
  claude: { provider: 'anthropic', model: 'claude-max' },
  gpt: { provider: 'openai', model: 'chatgpt-pro' },
  gemini: { provider: 'google', model: 'gemini-2.5-flash' },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute Fast Mode for a session and return a normalized result.
 *
 * @param {object} session
 * @param {object} [options]
 * @param {string} [options.agentId]
 * @param {string} [options.outDir]
 * @param {number} [options.timeoutMs]
 * @param {function} [options.turnRunner]
 */
export async function executeFastAnalysisForSession(session, options = {}) {
  validateSession(session);

  const scenarioFile = await ensureScenarioFile(session);
  const availableProviders = getAvailableProviders(session);
  const agentId = options.agentId || pickFastProvider(availableProviders);
  const outDir = options.outDir || DEFAULT_FAST_OUT_DIR;

  try {
    const { run, analysis, outDir: runOutDir } = await runFastAnalysis({
      scenario: scenarioFile,
      agentId,
      outDir,
      runId: options.runId || null,
      scenarioClass: session.scenario_class || 'unclassified',
      availableProviders,
      timeoutMs: options.timeoutMs,
      turnRunner: options.turnRunner,
    });

    return {
      stage: 'post_single',
      run_id: run.run_id,
      out_dir: runOutDir,
      mode: 'fast',
      artifact_refs: {
        analysis_json: path.join(runOutDir, 'analysis.json'),
        run_json: path.join(runOutDir, 'run.json'),
        scenario_json: path.join(runOutDir, 'scenario.json'),
      },
      routing_input: {
        confidence_band: analysis.confidence_band,
        needs_human_review: analysis.needs_human_review,
        uncertainty_payload_present: analysis.uncertainty_payload != null,
      },
      summary: {
        recommendation: analysis.recommendation,
        ux_state: analysis.ux_state,
        orchestrator_ux_state: analysis.orchestrator?.ux_state || null,
        orchestrator_next_mode: analysis.orchestrator?.recommended_next_mode || null,
      },
      raw: { run, analysis },
    };
  } finally {
    await cleanupScenarioFile(session, scenarioFile);
  }
}

/**
 * Execute Rigor Mode for a session and return a normalized result.
 *
 * Rigor Mode requires the decision harness (cross-model conflict runner).
 * This function is a stub in the open-source Shipwright distribution.
 *
 * When options.turnRunner is provided (test/mock path), a minimal judge-only
 * execution runs and returns a normalized result. In production, no turnRunner
 * is supplied and the function throws, directing users to ShipwrightPlus.
 */
export async function executeRigorAnalysisForSession(session, options = {}) {
  if (!options.turnRunner) {
    throw new Error(
      'Rigor Mode requires the Shipwright decision harness, which is not included in this distribution. ' +
      'Fast Mode is available with a single provider.'
    );
  }

  const runId = `rigor-${session.scenario_id}-${Date.now()}`;
  const judgeResult = await options.turnRunner({ phase: 'judge', runId, sideId: 'judge' });
  const packet = judgeResult.packet;

  return {
    stage: 'post_judge',
    run_id: runId,
    out_dir: options.outDir || null,
    mode: 'rigor',
    artifact_refs: {},
    routing_input: {
      confidence_band: packet.judge_confidence || 'medium',
      needs_human_review: packet.needs_human_review || false,
      uncertainty_payload_present: false,
      panel_agreement: 'converged',
    },
    summary: {
      winner: packet.winner,
      ux_state: null,
    },
    raw: { judgeResult },
  };
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

function validateSession(session) {
  if (!session || typeof session !== 'object' || Array.isArray(session)) {
    throw new Error('session is required');
  }
  if (typeof session.scenario_id !== 'string' || session.scenario_id.trim().length === 0) {
    throw new Error('session.scenario_id is required');
  }
  if (typeof session.question !== 'string' || session.question.trim().length === 0) {
    throw new Error('session.question is required');
  }
}

function getAvailableProviders(session) {
  const providers = session.provider_availability?.available_providers;
  if (Array.isArray(providers) && providers.length > 0) {
    return providers;
  }
  return ['claude'];
}

async function ensureScenarioFile(session) {
  if (session.scenario_path && path.extname(session.scenario_path) === '.json') {
    return path.resolve(session.scenario_path);
  }

  const tmpDir = mkdtempSync(path.join(tmpdir(), 'shipwright-session-'));
  const filePath = path.join(tmpDir, `${session.scenario_id}.json`);
  const scenario = buildScenarioObject(session);
  await writeFile(filePath, JSON.stringify(scenario, null, 2) + '\n', 'utf8');
  return filePath;
}

async function cleanupScenarioFile(session, scenarioFile) {
  if (session.scenario_path && path.resolve(session.scenario_path) === path.resolve(scenarioFile)) {
    return;
  }
  try {
    await unlink(scenarioFile);
  } catch {
    // best effort
  }
}

async function materializeScenarioObject(session) {
  if (session.scenario_path && path.extname(session.scenario_path) === '.json') {
    return JSON.parse(await readFile(path.resolve(session.scenario_path), 'utf8'));
  }
  return buildScenarioObject(session);
}

function buildScenarioObject(session) {
  return {
    id: session.scenario_id,
    title: session.question.length > 80 ? session.question.slice(0, 77) + '...' : session.question,
    inputs: {
      prompt: session.question,
      expected_artifact_type: 'recommendation',
    },
  };
}

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

function pickFastProvider(availableProviders) {
  if (availableProviders.includes('claude')) return 'claude';
  return availableProviders[0] || 'claude';
}

