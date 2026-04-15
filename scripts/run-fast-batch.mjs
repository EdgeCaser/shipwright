#!/usr/bin/env node

/**
 * Fast Mode batch runner.
 *
 * Runs fast single-pass analysis across multiple scenarios and agents.
 * When multiple agents are specified, runs all agents on each scenario and
 * reports agreement/divergence on ux_state and recommendation direction.
 *
 * Usage:
 *   node scripts/run-fast-batch.mjs \
 *     [--scenario <id>] \
 *     [--agent <claude|gpt|gemini>] \
 *     [--scenario-dir <path>] \
 *     [--out <path>] \
 *     [--dry-run] \
 *     [--format text|json]
 *
 * Examples:
 *   # All scenarios, default agent (claude)
 *   node scripts/run-fast-batch.mjs
 *
 *   # Specific scenarios, two agents
 *   node scripts/run-fast-batch.mjs \
 *     --scenario openai-nonprofit-control \
 *     --scenario pricing-partial-data \
 *     --agent claude --agent gpt
 *
 *   # All scenarios, save summary
 *   node scripts/run-fast-batch.mjs --agent claude --out benchmarks/results/fast-analysis/batch-summary.md
 */

import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runFastAnalysis, AGENT_PROFILES } from './run-fast-analysis.mjs';

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_AGENT = 'claude';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runFastBatch(options = {}) {
  const scenarioDir = options.scenarioDir || DEFAULT_SCENARIO_DIR;
  const scenarios = await listScenarios(scenarioDir, options.scenarios);
  const agentIds = resolveAgentIds(options.agents);
  const dryRun = Boolean(options.dryRun);

  const results = [];
  const total = scenarios.length * agentIds.length;
  let completed = 0;

  for (const scenario of scenarios) {
    for (const agentId of agentIds) {
      completed += 1;
      const label = `[${completed}/${total}] ${scenario} + ${agentId}`;
      process.stderr.write(`${label} — starting\n`);

      if (dryRun) {
        results.push(makeDryRunResult(scenario, agentId));
        process.stderr.write(`${label} — skipped (dry run)\n`);
        continue;
      }

      try {
        const { run, analysis } = await runFastAnalysis({
          scenario,
          scenarioDir,
          agentId,
          outDir: options.outDir,
          timeoutMs: options.timeoutMs,
          reasoningEffort: options.reasoningEffort,
        });

        results.push({
          scenario,
          agentId,
          status: run.status,
          uxState: run.ux_state,
          confidenceBand: run.confidence_band,
          needsHumanReview: run.needs_human_review,
          hasUncertaintyPayload: run.has_uncertainty_payload,
          recommendation: analysis?.recommendation ?? null,
          runId: run.run_id,
          error: null,
        });

        process.stderr.write(`${label} — ${run.status}, ux_state: ${run.ux_state}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          scenario,
          agentId,
          status: 'error',
          uxState: null,
          confidenceBand: null,
          needsHumanReview: null,
          hasUncertaintyPayload: null,
          recommendation: null,
          runId: null,
          error: message,
        });
        process.stderr.write(`${label} — ERROR: ${message}\n`);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Summary formatting
// ---------------------------------------------------------------------------

export function buildSummary(results) {
  const lines = [];
  const completed = results.filter((r) => r.status === 'completed');
  const errors = results.filter((r) => r.status === 'error');

  lines.push('# Fast Analysis Batch Summary');
  lines.push('');
  lines.push(`Runs completed: ${completed.length}`);
  lines.push(`Errors: ${errors.length}`);
  lines.push('');

  // Per-run results table
  lines.push('## Run Results');
  lines.push('');
  lines.push('| Scenario | Agent | Status | UX State | Confidence | Human Review | Uncertainty Payload |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const r of results) {
    lines.push([
      '',
      r.scenario,
      r.agentId,
      r.status,
      r.uxState || '—',
      r.confidenceBand || '—',
      r.needsHumanReview != null ? String(r.needsHumanReview) : '—',
      r.hasUncertaintyPayload != null ? String(r.hasUncertaintyPayload) : '—',
      '',
    ].join(' | '));
  }

  // Multi-agent agreement analysis (only when 2+ agents ran the same scenarios)
  const agentIds = [...new Set(results.map((r) => r.agentId))];
  const scenarios = [...new Set(results.map((r) => r.scenario))];

  if (agentIds.length >= 2) {
    lines.push('');
    lines.push('## Agent Agreement Analysis');
    lines.push('');
    lines.push(`| Scenario | ${agentIds.map((a) => `${a} UX State`).join(' | ')} | Agree? |`);
    lines.push(`|---|${agentIds.map(() => '---|').join('')}---|`);

    let agreements = 0;
    let comparisons = 0;

    for (const scenario of scenarios) {
      const scenarioResults = agentIds.map((agentId) =>
        results.find((r) => r.scenario === scenario && r.agentId === agentId),
      );

      if (scenarioResults.some((r) => !r || r.status !== 'completed')) {
        const cells = scenarioResults.map((r) => r?.uxState || 'ERROR');
        lines.push(`| ${scenario} | ${cells.join(' | ')} | — |`);
        continue;
      }

      comparisons += 1;
      const uxStates = scenarioResults.map((r) => r.uxState);
      const agree = uxStates.every((s) => s === uxStates[0]);
      if (agree) agreements += 1;

      lines.push([
        '',
        scenario,
        ...uxStates,
        agree ? 'YES' : '**NO**',
        '',
      ].join(' | '));
    }

    lines.push('');
    lines.push(`**Completed comparisons:** ${comparisons}/${scenarios.length}`);

    if (comparisons > 0) {
      const agreementRate = ((agreements / comparisons) * 100).toFixed(0);
      lines.push(`**Agent agreement rate (ux_state):** ${agreements}/${comparisons} (${agreementRate}%)`);
      lines.push('');

      if (Number(agreementRate) >= 80) {
        lines.push(
          'Interpretation: High ux_state agreement. Fast Mode is returning consistent confidence signals across families on this scenario set.',
        );
      } else if (Number(agreementRate) >= 50) {
        lines.push(
          'Interpretation: Moderate ux_state agreement. Some scenarios produce divergent confidence signals across families. These are candidates for Rigor Mode escalation.',
        );
      } else {
        lines.push(
          'Interpretation: Low ux_state agreement. Fast Mode confidence signals diverge significantly across families. Consider defaulting these scenarios to Rigor Mode.',
        );
      }
    }
  }

  // UX state distribution
  if (completed.length > 0) {
    lines.push('');
    lines.push('## UX State Distribution');
    lines.push('');

    const provisional = completed.filter((r) => r.uxState === 'fast_provisional').length;
    const uncertain = completed.filter((r) => r.uxState === 'fast_uncertain').length;
    const reviewFlagged = completed.filter((r) => r.needsHumanReview === true).length;
    const withPayload = completed.filter((r) => r.hasUncertaintyPayload === true).length;

    lines.push(`| State | Count | % |`);
    lines.push(`|---|---|---|`);
    lines.push(`| fast_provisional | ${provisional} | ${pct(provisional, completed.length)} |`);
    lines.push(`| fast_uncertain | ${uncertain} | ${pct(uncertain, completed.length)} |`);
    lines.push('');
    lines.push(`Needs human review: ${reviewFlagged}/${completed.length}`);
    lines.push(`Has uncertainty payload: ${withPayload}/${completed.length}`);

    if (uncertain > 0) {
      lines.push('');
      lines.push('**Uncertain scenarios** (candidates for Rigor Mode escalation):');
      for (const r of completed.filter((r) => r.uxState === 'fast_uncertain')) {
        lines.push(`- ${r.scenario} (${r.agentId}, confidence: ${r.confidenceBand})`);
      }
    }
  }

  // Error details
  if (errors.length > 0) {
    lines.push('');
    lines.push('## Errors');
    lines.push('');
    for (const r of errors) {
      lines.push(`- **${r.scenario}** (${r.agentId}): ${r.error}`);
    }
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function resolveAgentIds(agents) {
  if (!agents || agents.length === 0) {
    return [DEFAULT_AGENT];
  }
  for (const id of agents) {
    if (!AGENT_PROFILES[id]) {
      const supported = Object.keys(AGENT_PROFILES).join(', ');
      throw new Error(`Unknown agent "${id}". Supported: ${supported}`);
    }
  }
  return [...new Set(agents)];
}

async function listScenarios(scenarioDir, filter) {
  const files = await readdir(scenarioDir);
  let scenarios = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();

  if (Array.isArray(filter) && filter.length > 0) {
    const missing = filter.filter((s) => !scenarios.includes(s));
    if (missing.length > 0) {
      throw new Error(
        `Unknown scenario(s): ${missing.join(', ')}. Available: ${scenarios.join(', ')}`,
      );
    }
    scenarios = scenarios.filter((s) => filter.includes(s));
  }

  if (scenarios.length === 0) {
    throw new Error(`No scenarios found in ${scenarioDir}`);
  }

  return scenarios;
}

function makeDryRunResult(scenario, agentId) {
  return {
    scenario,
    agentId,
    status: 'dry_run',
    uxState: null,
    confidenceBand: null,
    needsHumanReview: null,
    hasUncertaintyPayload: null,
    recommendation: null,
    runId: null,
    error: null,
  };
}

function pct(n, total) {
  if (total === 0) return '—';
  return `${((n / total) * 100).toFixed(0)}%`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseCliArgs(argv) {
  const parsed = {
    scenarios: [],
    agents: [],
    scenarioDir: DEFAULT_SCENARIO_DIR,
    outDir: null,
    outPath: null,
    dryRun: false,
    timeoutMs: undefined,
    reasoningEffort: undefined,
    format: 'text',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scenario':
        parsed.scenarios.push(argv[i + 1] || '');
        i += 1;
        break;
      case '--agent':
        parsed.agents.push(argv[i + 1] || '');
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
      case '--out':
        parsed.outPath = argv[i + 1] || null;
        i += 1;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[i + 1]);
        i += 1;
        break;
      case '--reasoning-effort':
        parsed.reasoningEffort = argv[i + 1] || undefined;
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

  return parsed;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('run-fast-batch.mjs') || process.argv[1].endsWith('run-fast-batch'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    const results = await runFastBatch({
      scenarios: args.scenarios.length > 0 ? args.scenarios : undefined,
      agents: args.agents.length > 0 ? args.agents : undefined,
      scenarioDir: args.scenarioDir,
      outDir: args.outDir || undefined,
      dryRun: args.dryRun,
      timeoutMs: args.timeoutMs,
      reasoningEffort: args.reasoningEffort,
    });

    if (args.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else {
      const summary = buildSummary(results);
      process.stdout.write(summary);

      if (args.outPath) {
        await writeFile(path.resolve(args.outPath), summary, 'utf8');
        process.stderr.write(`Summary written to: ${args.outPath}\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}
