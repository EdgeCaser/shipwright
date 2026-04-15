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
import { runConflictHarness } from './run-conflict-harness.mjs';
import { buildCasePacketFromScenario } from './build-case-packet.mjs';

const DEFAULT_FAST_OUT_DIR = path.resolve('benchmarks', 'results', 'fast-analysis');
const DEFAULT_RIGOR_OUT_DIR = path.resolve('benchmarks', 'results', 'orchestrated');

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
 * @param {object} session
 * @param {object} [options]
 * @param {string[]} [options.availableProviders]
 * @param {string} [options.outDir]
 * @param {number} [options.timeoutMs]
 * @param {function} [options.turnRunner]
 */
export async function executeRigorAnalysisForSession(session, options = {}) {
  validateSession(session);

  const availableProviders = options.availableProviders || getAvailableProviders(session);
  if (availableProviders.length < 3) {
    throw new Error('Rigor Mode execution requires three distinct providers.');
  }

  const scenario = await materializeScenarioObject(session);
  const casePacket = buildCasePacketFromScenario(scenario);
  const { sideA, sideB, judge } = assignRigorRoles(availableProviders);
  const outDir = options.outDir || DEFAULT_RIGOR_OUT_DIR;

  const result = await runConflictHarness({
    casePacket,
    outDir,
    runId: options.runId || null,
    sideACommand: PROVIDER_COMMANDS[sideA],
    sideBCommand: PROVIDER_COMMANDS[sideB],
    judgeCommand: PROVIDER_COMMANDS[judge],
    sideAProvider: PROVIDER_META[sideA]?.provider || sideA,
    sideAModel: PROVIDER_META[sideA]?.model || sideA,
    sideBProvider: PROVIDER_META[sideB]?.provider || sideB,
    sideBModel: PROVIDER_META[sideB]?.model || sideB,
    judgeProvider: PROVIDER_META[judge]?.provider || judge,
    judgeModel: PROVIDER_META[judge]?.model || judge,
    timeoutMs: options.timeoutMs,
    turnRunner: options.turnRunner,
  });

  const run = result.run;
  const verdict = run.results || run.verdict || {};

  return {
    stage: 'post_judge',
    run_id: run.run_id,
    out_dir: result.outDir,
    mode: 'rigor',
    provider_roles: { side_a: sideA, side_b: sideB, judge },
    artifact_refs: {
      run_json: path.join(result.outDir, 'run.json'),
      verdict_json: path.join(result.outDir, 'judge', 'verdict.json'),
      verdict_md: path.join(result.outDir, 'judge', 'verdict.md'),
      case_packet_json: path.join(result.outDir, 'case-packet.json'),
    },
    routing_input: {
      confidence_band: verdict.judge_confidence || null,
      needs_human_review: verdict.needs_human_review || false,
      uncertainty_payload_present: hasRigorUncertaintyPayload(verdict),
      panel_agreement: null,
    },
    summary: {
      winner: verdict.winner || null,
      judge_confidence: verdict.judge_confidence || null,
      needs_human_review: verdict.needs_human_review || false,
      decisive_dimension: verdict.decisive_dimension || null,
    },
    raw: { run, verdict },
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

function assignRigorRoles(availableProviders) {
  const available = [...availableProviders];
  if (available.length < 3) {
    throw new Error('Three providers are required to assign Rigor Mode roles.');
  }

  const preferred = { sideA: 'gpt', sideB: 'claude', judge: 'gemini' };

  const sideA = available.includes(preferred.sideA) ? preferred.sideA : available[0];
  const remaining = available.filter((p) => p !== sideA);
  const sideB = remaining.includes(preferred.sideB) ? preferred.sideB : remaining[0];
  const remainingForJudge = remaining.filter((p) => p !== sideB);
  const judge = remainingForJudge.includes(preferred.judge) ? preferred.judge : remainingForJudge[0];

  return { sideA, sideB, judge };
}

function hasRigorUncertaintyPayload(verdict) {
  return Boolean(
    verdict.uncertainty_drivers
    || verdict.disambiguation_questions
    || verdict.needed_evidence
    || verdict.recommended_next_artifact
    || verdict.recommended_next_action
    || verdict.can_resolve_with_more_evidence !== undefined
    || verdict.escalation_recommendation,
  );
}
