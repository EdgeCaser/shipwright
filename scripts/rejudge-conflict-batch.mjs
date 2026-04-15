#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { rejudgeConflictRun } from './rejudge-conflict-run.mjs';

const DEFAULT_ROOT_DIR = path.resolve('benchmarks', 'results', 'conflict-harness');
const VALID_FORMATS = new Set(['text', 'json']);

export async function discoverRunDirs(rootDir, scenarioFilters) {
  const scenarioDirs = await readdir(rootDir, { withFileTypes: true });
  const allowedScenarios = scenarioFilters && scenarioFilters.length > 0
    ? new Set(scenarioFilters)
    : null;

  const unknownScenarios = [];
  if (allowedScenarios) {
    for (const scenario of allowedScenarios) {
      if (!scenarioDirs.some((entry) => entry.isDirectory() && entry.name === scenario)) {
        unknownScenarios.push(scenario);
      }
    }
  }
  if (unknownScenarios.length > 0) {
    throw new Error(`Unknown scenario(s): ${unknownScenarios.join(', ')}`);
  }

  const runDirs = [];
  for (const scenarioEntry of scenarioDirs) {
    if (!scenarioEntry.isDirectory()) continue;
    if (allowedScenarios && !allowedScenarios.has(scenarioEntry.name)) continue;

    const scenarioPath = path.join(rootDir, scenarioEntry.name);
    const entries = await readdir(scenarioPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!entry.name.startsWith('conflict-')) continue;
      runDirs.push(path.join(scenarioPath, entry.name));
    }
  }

  return runDirs.sort();
}

export async function runRejudgeBatch(options = {}) {
  const rootDir = path.resolve(options.rootDir || DEFAULT_ROOT_DIR);
  const runDirs = options.runDirs && options.runDirs.length > 0
    ? options.runDirs.map((runDir) => path.resolve(runDir))
    : await discoverRunDirs(rootDir, options.scenarios);

  const results = [];
  const totalRuns = runDirs.length;

  for (let index = 0; index < runDirs.length; index += 1) {
    const runDir = runDirs[index];
    const label = `[${index + 1}/${totalRuns}] ${path.basename(runDir)}`;
    process.stderr.write(`${label} — rejudging\n`);

    try {
      const run = JSON.parse(await readFile(path.join(runDir, 'run.json'), 'utf8'));
      const result = await rejudgeConflictRun({
        runDir,
        judgeAgent: options.judgeAgent,
        judgeCommand: options.judgeCommand,
        judgeProvider: options.judgeProvider,
        judgeModel: options.judgeModel,
        judgeReasoningEffort: options.judgeReasoningEffort,
        label: options.label,
        cwd: options.cwd,
        timeoutMs: options.timeoutMs,
        turnRunner: options.turnRunner,
      });

      results.push({
        runDir,
        runId: run.run_id,
        scenario: run.scenario_id,
        status: 'completed',
        winner: result.verdict.winner,
        margin: result.verdict.margin,
        judgeConfidence: result.verdict.judge_confidence,
        needsHumanReview: result.verdict.needs_human_review,
        outputDir: result.outputDir,
        error: null,
      });
      process.stderr.write(`${label} — completed, winner: ${result.verdict.winner}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let runId = null;
      let scenario = path.basename(path.dirname(runDir));
      try {
        const run = JSON.parse(await readFile(path.join(runDir, 'run.json'), 'utf8'));
        runId = run.run_id;
        scenario = run.scenario_id;
      } catch {
        // Leave fallback values.
      }

      results.push({
        runDir,
        runId,
        scenario,
        status: 'error',
        winner: null,
        margin: null,
        judgeConfidence: null,
        needsHumanReview: null,
        outputDir: null,
        error: message,
      });
      process.stderr.write(`${label} — ERROR: ${message}\n`);
    }
  }

  return results;
}

export function buildBatchSummary(results, judgeLabel) {
  const lines = [];
  lines.push('# Rejudge Batch Summary');
  lines.push('');
  lines.push(`Judge: ${judgeLabel}`);
  lines.push(`Runs attempted: ${results.length}`);
  lines.push(`Errors: ${results.filter((result) => result.status === 'error').length}`);
  lines.push('');
  lines.push('| Scenario | Run ID | Status | Winner | Margin | Confidence | Human Review |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const result of results) {
    lines.push([
      '',
      result.scenario || '—',
      result.runId || '—',
      result.status,
      result.winner || '—',
      result.margin != null ? result.margin.toFixed(2) : '—',
      result.judgeConfidence || '—',
      result.needsHumanReview != null ? String(result.needsHumanReview) : '—',
      '',
    ].join(' | '));
  }

  return `${lines.join('\n')}\n`;
}

export function parseCliArgs(argv) {
  const parsed = {
    rootDir: DEFAULT_ROOT_DIR,
    scenarios: [],
    runDirs: [],
    outPath: null,
    judgeAgent: 'gemini',
    judgeCommand: '',
    judgeProvider: '',
    judgeModel: '',
    judgeReasoningEffort: 'medium',
    label: '',
    cwd: process.cwd(),
    timeoutMs: 120000,
    format: 'text',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--root-dir':
        parsed.rootDir = argv[index + 1] || DEFAULT_ROOT_DIR;
        index += 1;
        break;
      case '--scenario':
        parsed.scenarios.push(argv[index + 1] || '');
        index += 1;
        break;
      case '--run-dir':
        parsed.runDirs.push(argv[index + 1] || '');
        index += 1;
        break;
      case '--out':
        parsed.outPath = argv[index + 1] || null;
        index += 1;
        break;
      case '--judge-agent':
        parsed.judgeAgent = argv[index + 1] || 'gemini';
        index += 1;
        break;
      case '--judge-command':
        parsed.judgeCommand = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-provider':
        parsed.judgeProvider = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-model':
        parsed.judgeModel = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-reasoning-effort':
        parsed.judgeReasoningEffort = argv[index + 1] || 'medium';
        index += 1;
        break;
      case '--label':
        parsed.label = argv[index + 1] || '';
        index += 1;
        break;
      case '--cwd':
        parsed.cwd = argv[index + 1] || process.cwd();
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

  return parsed;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(
      'Usage: node scripts/rejudge-conflict-batch.mjs [--scenario scenario-id] [--run-dir completed-run-dir] [--judge-agent gemini] [--out summary.md] [--format text|json]',
    );
    return;
  }

  const results = await runRejudgeBatch({
    rootDir: args.rootDir,
    scenarios: args.scenarios.length > 0 ? args.scenarios : undefined,
    runDirs: args.runDirs.length > 0 ? args.runDirs : undefined,
    judgeAgent: args.judgeAgent,
    judgeCommand: args.judgeCommand || undefined,
    judgeProvider: args.judgeProvider || undefined,
    judgeModel: args.judgeModel || undefined,
    judgeReasoningEffort: args.judgeReasoningEffort,
    label: args.label || undefined,
    cwd: args.cwd,
    timeoutMs: args.timeoutMs,
  });

  if (args.format === 'json') {
    const output = JSON.stringify(results, null, 2);
    if (args.outPath) {
      await writeFile(args.outPath, `${output}\n`, 'utf8');
    }
    console.log(output);
    return;
  }

  const judgeLabel = args.label || `${args.judgeAgent}-judge`;
  const summary = buildBatchSummary(results, judgeLabel);
  if (args.outPath) {
    await writeFile(args.outPath, summary, 'utf8');
  }
  console.log(summary.trimEnd());
}

const isMainModule = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMainModule) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
