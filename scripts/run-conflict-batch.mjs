#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runConflictHarness } from './run-conflict-harness.mjs';

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_REASONING_EFFORT = 'medium';
const DEFAULT_SIDE_A_COMMAND = "cat {{prompt_file}} | claude -p --no-session-persistence --output-format text";
const DEFAULT_SIDE_B_COMMAND = "cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only";

const JUDGE_CONFIGS = [
  {
    label: 'claude-judge',
    command: "cat {{prompt_file}} | claude -p --no-session-persistence --output-format text",
    provider: 'anthropic',
    model: 'claude-max',
  },
  {
    label: 'gpt-judge',
    command: "cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only",
    provider: 'openai',
    model: 'chatgpt-pro',
  },
];

export async function runBatch(options = {}) {
  const scenarioDir = options.scenarioDir || DEFAULT_SCENARIO_DIR;
  const scenarios = await listScenarios(scenarioDir, options.scenarios);
  const sideACommand = options.sideACommand || DEFAULT_SIDE_A_COMMAND;
  const sideBCommand = options.sideBCommand || DEFAULT_SIDE_B_COMMAND;
  const judgeConfigs = options.judgeConfigs || JUDGE_CONFIGS;
  const dryRun = Boolean(options.dryRun);
  const sideAReasoningEffort = options.sideAReasoningEffort || DEFAULT_REASONING_EFFORT;
  const sideBReasoningEffort = options.sideBReasoningEffort || DEFAULT_REASONING_EFFORT;
  const judgeReasoningEffort = options.judgeReasoningEffort || DEFAULT_REASONING_EFFORT;

  const results = [];
  const totalRuns = scenarios.length * judgeConfigs.length;
  let completed = 0;

  for (const scenario of scenarios) {
    for (const judge of judgeConfigs) {
      completed += 1;
      const label = `[${completed}/${totalRuns}] ${scenario} + ${judge.label}`;
      process.stderr.write(`${label} — starting\n`);

      if (dryRun) {
        results.push({
          scenario,
          judgeLabel: judge.label,
          status: 'dry_run',
          winner: null,
          margin: null,
          judgeConfidence: null,
          needsHumanReview: null,
          disagreementRate: null,
          adoptedCritiqueRate: null,
          unsupportedClaimCount: null,
          runId: null,
          error: null,
        });
        process.stderr.write(`${label} — skipped (dry run)\n`);
        continue;
      }

      try {
        const { run } = await runConflictHarness({
          scenario,
          scenarioDir,
          sideACommand,
          sideBCommand,
          judgeCommand: judge.command,
          sideAProvider: 'anthropic',
          sideAModel: 'claude-max',
          sideAReasoningEffort,
          sideBProvider: 'openai',
          sideBModel: 'chatgpt-pro',
          sideBReasoningEffort,
          judgeProvider: judge.provider,
          judgeModel: judge.model,
          judgeReasoningEffort,
        });

        results.push({
          scenario,
          judgeLabel: judge.label,
          status: run.status,
          winner: run.results.winner,
          margin: run.results.margin,
          judgeConfidence: run.results.judge_confidence,
          needsHumanReview: run.results.needs_human_review,
          disagreementRate: run.metrics.disagreement_rate,
          adoptedCritiqueRate: run.metrics.adopted_critique_rate,
          unsupportedClaimCount: run.metrics.unsupported_claim_count,
          runId: run.run_id,
          error: null,
        });

        process.stderr.write(`${label} — ${run.status}, winner: ${run.results.winner || 'none'}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          scenario,
          judgeLabel: judge.label,
          status: 'error',
          winner: null,
          margin: null,
          judgeConfidence: null,
          needsHumanReview: null,
          disagreementRate: null,
          adoptedCritiqueRate: null,
          unsupportedClaimCount: null,
          runId: null,
          error: message,
        });
        process.stderr.write(`${label} — ERROR: ${message}\n`);
      }
    }
  }

  return results;
}

export function buildSummary(results) {
  const lines = [];

  lines.push('# Conflict Harness Batch Summary');
  lines.push(`\nRuns completed: ${results.length}`);
  lines.push(`Errors: ${results.filter((r) => r.status === 'error').length}`);
  lines.push('');

  // Per-run results table
  lines.push('## Run Results');
  lines.push('');
  lines.push('| Scenario | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Adopted |');
  lines.push('|---|---|---|---|---|---|---|---|---|');

  for (const r of results) {
    lines.push([
      '',
      r.scenario,
      r.judgeLabel,
      r.status,
      r.winner || '—',
      r.margin != null ? r.margin.toFixed(2) : '—',
      r.judgeConfidence || '—',
      r.needsHumanReview != null ? String(r.needsHumanReview) : '—',
      r.disagreementRate != null ? r.disagreementRate.toFixed(2) : '—',
      r.adoptedCritiqueRate != null ? r.adoptedCritiqueRate.toFixed(2) : '—',
      '',
    ].join(' | '));
  }

  // Judge agreement analysis
  const scenarios = [...new Set(results.map((r) => r.scenario))];
  const judgeLabels = [...new Set(results.map((r) => r.judgeLabel))];

  if (judgeLabels.length === 2) {
    lines.push('');
    lines.push('## Judge Agreement Analysis');
    lines.push('');
    lines.push('| Scenario | ' + judgeLabels.join(' Winner | ') + ' Winner | Agree? | Margin Delta |');
    lines.push('|---|---|---|---|---|');

    let agreements = 0;
    let comparisons = 0;
    const marginDeltas = [];

    for (const scenario of scenarios) {
      const runs = judgeLabels.map((label) =>
        results.find((r) => r.scenario === scenario && r.judgeLabel === label)
      );

      if (runs.some((r) => !r || r.status !== 'completed')) {
        lines.push(`| ${scenario} | ${runs.map((r) => r?.winner || 'ERROR').join(' | ')} | — | — |`);
        continue;
      }

      comparisons += 1;
      const agree = runs[0].winner === runs[1].winner;
      if (agree) agreements += 1;

      const marginDelta = Math.abs((runs[0].margin || 0) - (runs[1].margin || 0));
      marginDeltas.push(marginDelta);

      lines.push([
        '',
        scenario,
        runs[0].winner || '—',
        runs[1].winner || '—',
        agree ? 'YES' : '**NO**',
        marginDelta.toFixed(2),
        '',
      ].join(' | '));
    }

    const incomplete = scenarios.length - comparisons;

    lines.push('');
    lines.push(`**Completed comparisons:** ${comparisons}/${scenarios.length}`);
    if (comparisons > 0) {
      const agreementRate = ((agreements / comparisons) * 100).toFixed(0);
      const avgMarginDelta = (marginDeltas.reduce((a, b) => a + b, 0) / marginDeltas.length).toFixed(2);
      lines.push(`**Judge agreement rate:** ${agreements}/${comparisons} (${agreementRate}%)`);
      lines.push(`**Average margin delta:** ${avgMarginDelta}`);
      lines.push('');

      if (incomplete > 0) {
        lines.push(`**WARNING:** ${incomplete} scenario(s) did not complete with both judges. The agreement rate is based on partial coverage and should not be used for publishability decisions. Rerun failed scenarios before drawing conclusions.`);
      } else if (Number(agreementRate) >= 70) {
        lines.push('Interpretation: Agreement is above 70%. Single-judge runs are usable with a caveat that judge family affinity exists but does not dominate across scenarios.');
      } else if (Number(agreementRate) >= 50) {
        lines.push('Interpretation: Agreement is between 50-70%. Judge family affinity is a significant variable. Dual-judge runs should be the default for any publishable conclusion.');
      } else {
        lines.push('Interpretation: Agreement is below 50%. Judge family affinity dominates the verdict. The harness needs a third-provider judge or consensus mechanism before any conclusion is publishable.');
      }
    } else {
      lines.push('');
      lines.push('**No completed comparisons.** Cannot assess judge agreement. All scenario pairs must complete with both judges before any interpretation is valid.');
    }
  }

  // Error details
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    lines.push('');
    lines.push('## Errors');
    lines.push('');
    for (const r of errors) {
      lines.push(`- **${r.scenario}** (${r.judgeLabel}): ${r.error}`);
    }
  }

  return lines.join('\n') + '\n';
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
      throw new Error(`Unknown scenario(s): ${missing.join(', ')}. Available: ${scenarios.join(', ')}`);
    }
    scenarios = scenarios.filter((s) => filter.includes(s));
  }

  if (scenarios.length === 0) {
    throw new Error(`No scenarios found in ${scenarioDir}`);
  }

  return scenarios;
}

export function parseCliArgs(argv) {
  const parsed = {
    scenarios: [],
    scenarioDir: DEFAULT_SCENARIO_DIR,
    outPath: null,
    dryRun: false,
    sideAReasoningEffort: DEFAULT_REASONING_EFFORT,
    sideBReasoningEffort: DEFAULT_REASONING_EFFORT,
    judgeReasoningEffort: DEFAULT_REASONING_EFFORT,
    format: 'text',
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--scenario':
        parsed.scenarios.push(argv[i + 1] || '');
        i += 1;
        break;
      case '--scenario-dir':
        parsed.scenarioDir = argv[i + 1] || DEFAULT_SCENARIO_DIR;
        i += 1;
        break;
      case '--out':
        parsed.outPath = argv[i + 1] || null;
        i += 1;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--side-a-reasoning-effort':
        parsed.sideAReasoningEffort = argv[i + 1] || DEFAULT_REASONING_EFFORT;
        i += 1;
        break;
      case '--side-b-reasoning-effort':
        parsed.sideBReasoningEffort = argv[i + 1] || DEFAULT_REASONING_EFFORT;
        i += 1;
        break;
      case '--judge-reasoning-effort':
        parsed.judgeReasoningEffort = argv[i + 1] || DEFAULT_REASONING_EFFORT;
        i += 1;
        break;
      case '--format':
        parsed.format = argv[i + 1] || 'text';
        i += 1;
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

  return parsed;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);

  if (args.help) {
    process.stdout.write([
      'Usage: node scripts/run-conflict-batch.mjs [OPTIONS]',
      '',
      'Runs every scenario with both Claude and GPT as judge, then compares verdicts.',
      '',
      'Options:',
      '  --scenario <id>       Run only this scenario (repeatable)',
      '  --scenario-dir <dir>  Scenario directory (default: benchmarks/scenarios)',
      '  --out <path>          Write summary to file',
      '  --dry-run             List what would run without executing',
      '  --side-a-reasoning-effort <level>  Explicit reasoning effort for Side A (default: medium)',
      '  --side-b-reasoning-effort <level>  Explicit reasoning effort for Side B (default: medium)',
      '  --judge-reasoning-effort <level>   Explicit reasoning effort for judges (default: medium)',
      '  --format text|json    Output format (default: text)',
      '  --help                Show this help',
      '',
      'Examples:',
      '  node scripts/run-conflict-batch.mjs',
      '  node scripts/run-conflict-batch.mjs --scenario prd-hidden-scope-creep --scenario handoff-contradiction',
      '  node scripts/run-conflict-batch.mjs --dry-run',
      '  node scripts/run-conflict-batch.mjs --out benchmarks/results/conflict-harness/batch-summary.md',
      '',
    ].join('\n'));
    return;
  }

  const results = await runBatch({
    scenarios: args.scenarios.length > 0 ? args.scenarios : undefined,
    scenarioDir: args.scenarioDir,
    dryRun: args.dryRun,
    sideAReasoningEffort: args.sideAReasoningEffort,
    sideBReasoningEffort: args.sideBReasoningEffort,
    judgeReasoningEffort: args.judgeReasoningEffort,
  });

  if (args.format === 'json') {
    const output = JSON.stringify(results, null, 2) + '\n';
    if (args.outPath) {
      await writeFile(path.resolve(args.outPath), output, 'utf8');
      process.stderr.write(`Results written to ${path.resolve(args.outPath)}\n`);
    } else {
      process.stdout.write(output);
    }
    return;
  }

  const summary = buildSummary(results);
  if (args.outPath) {
    await writeFile(path.resolve(args.outPath), summary, 'utf8');
    process.stderr.write(`Summary written to ${path.resolve(args.outPath)}\n`);
  }
  process.stdout.write(summary);
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectRun()) {
  process.on('uncaughtException', (error) => {
    process.stderr.write(`Uncaught exception (non-fatal): ${error.message}\n`);
  });
  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    process.stderr.write(`Unhandled rejection (non-fatal): ${message}\n`);
  });
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
