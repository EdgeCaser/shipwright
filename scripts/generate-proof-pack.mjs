#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  DEFAULT_PROOF_METHOD_REF,
  compareBenchmarkSuites,
  loadBenchmarkSuiteSummary,
  validateBenchmarkSuiteSummary,
} from './run-benchmarks.mjs';

export function generateProofPack(options = {}) {
  const currentSummary = validateBenchmarkSuiteSummary(options.currentSummary, {
    label: 'Current benchmark summary',
  });
  const baselineSummary = options.baselineSummary
    ? validateBenchmarkSuiteSummary(options.baselineSummary, {
        label: 'Baseline benchmark summary',
      })
    : null;

  const reportMode = baselineSummary ? 'comparison' : 'single-arm';
  const comparison = baselineSummary
    ? compareBenchmarkSuites(currentSummary, baselineSummary)
    : null;

  const blockers = collectPublishabilityBlockers(currentSummary, baselineSummary);
  const warnings = collectWarnings(currentSummary, baselineSummary, comparison);

  const report = {
    generated_at: new Date().toISOString(),
    method_ref: DEFAULT_PROOF_METHOD_REF,
    report_mode: reportMode,
    publishable_proof_ready:
      blockers.length === 0 && Boolean(comparison?.publishable_proof_ready),
    comparison_interpretation: comparison?.comparison_interpretation || null,
    blockers,
    warnings,
    current_run: summarizeRun(currentSummary),
    comparison,
  };

  return {
    report,
    markdown: renderProofPackMarkdown(report),
  };
}

export async function generateProofPackFromFiles(options = {}) {
  const currentSummary = await loadBenchmarkSuiteSummary(options.currentPath, {
    label: 'Current benchmark summary',
  });
  const baselineSummary = options.baselinePath
    ? await loadBenchmarkSuiteSummary(options.baselinePath, {
        label: 'Baseline benchmark summary',
      })
    : null;

  return generateProofPack({
    currentSummary,
    baselineSummary,
  });
}

function summarizeRun(summary) {
  return {
    scenario_count: summary.scenario_count,
    status_counts: summary.status_counts,
    mean_first_pass_blind_rating: summary.mean_first_pass_blind_rating,
    mean_final_pass_blind_rating: summary.mean_final_pass_blind_rating,
    provenance: summary.provenance,
    threshold_policy: summary.threshold_policy,
  };
}

function collectPublishabilityBlockers(currentSummary, baselineSummary) {
  const blockers = [];

  blockers.push(...collectSummaryBlockers(currentSummary, 'Current'));

  if (!baselineSummary) {
    blockers.push('No baseline benchmark summary was supplied, so publishable comparison claims are unavailable.');
    return blockers;
  }

  blockers.push(...collectSummaryBlockers(baselineSummary, 'Baseline'));
  return blockers;
}

function collectSummaryBlockers(summary, label) {
  const blockers = [];

  if (!summary.provenance.artifact_generation.independent) {
    blockers.push(`${label} artifact generation is not marked independent.`);
  }

  if (!summary.provenance.blind_review.independent) {
    blockers.push(`${label} blind review is not marked independent.`);
  }

  if (!summary.provenance.blind_review.blinded) {
    blockers.push(`${label} blind review is not marked blinded.`);
  }

  for (const result of summary.results) {
    if (!Number.isFinite(result.first_pass.blind_rating)) {
      blockers.push(
        `${label} scenario "${result.scenario_id}" is missing a numeric first-pass blind rating.`,
      );
    }
  }

  for (const result of summary.results) {
    if (!Number.isFinite(result.final_pass.blind_rating)) {
      blockers.push(
        `${label} scenario "${result.scenario_id}" is missing a numeric final-pass blind rating.`,
      );
    }
  }

  return blockers;
}

function collectWarnings(currentSummary, baselineSummary, comparison) {
  const warnings = [];

  if (currentSummary.threshold_policy.status !== 'final') {
    warnings.push(
      `Current threshold policy is ${currentSummary.threshold_policy.status}; first live comparisons remain provisional.`,
    );
  }

  if (baselineSummary && baselineSummary.threshold_policy.status !== 'final') {
    warnings.push(
      `Baseline threshold policy is ${baselineSummary.threshold_policy.status}; first live comparisons remain provisional.`,
    );
  }

  if (comparison?.comparison_interpretation === 'provisional') {
    warnings.push(
      'Comparison interpretation is provisional until both summaries declare final threshold policy.',
    );
  }

  if (!baselineSummary) {
    warnings.push('This is a single-arm proof status report; comparison metrics are intentionally omitted.');
  }

  return warnings;
}

function renderProofPackMarkdown(report) {
  const lines = [
    '# Shipwright v2 Proof Pack',
    '',
    `Generated: ${report.generated_at}`,
    `Method reference: ${report.method_ref}`,
    `Mode: ${report.report_mode}`,
    '',
    '## Publishability',
    '',
    `Status: ${report.publishable_proof_ready ? 'READY' : 'BLOCKED'}`,
  ];

  if (report.blockers.length > 0) {
    lines.push('', 'Blocking notes:');
    for (const blocker of report.blockers) {
      lines.push(`- ${blocker}`);
    }
  } else {
    lines.push('', 'No publishability blockers detected.');
  }

  if (report.warnings.length > 0) {
    lines.push('', 'Warnings:');
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push(
    '',
    '## Current Run',
    '',
    `- Scenarios: ${report.current_run.scenario_count}`,
    `- Status counts: PASS ${report.current_run.status_counts.PASS} | FAIL ${report.current_run.status_counts.FAIL} | DNF ${report.current_run.status_counts.DNF}`,
    `- Mean first-pass blind rating: ${formatValue(report.current_run.mean_first_pass_blind_rating)}`,
    `- Mean final-pass blind rating: ${formatValue(report.current_run.mean_final_pass_blind_rating)}`,
    `- Artifact generation independent: ${report.current_run.provenance.artifact_generation.independent ? 'yes' : 'no'}`,
    `- Blind review independent: ${report.current_run.provenance.blind_review.independent ? 'yes' : 'no'}`,
    `- Blind review blinded: ${report.current_run.provenance.blind_review.blinded ? 'yes' : 'no'}`,
    `- Threshold policy: ${report.current_run.threshold_policy.status}`,
  );

  if (report.comparison) {
    lines.push('', '## Comparison', '', '| Metric | Current | Baseline | Delta |', '|---|---:|---:|---:|');
    for (const [label, metric] of comparisonRows(report.comparison)) {
      lines.push(
        `| ${label} | ${formatValue(metric.current)} | ${formatValue(metric.baseline)} | ${formatValue(metric.delta)} |`,
      );
    }

    lines.push(
      '',
      `Materially worse first pass: ${report.comparison.materially_worse_first_pass ? 'yes' : 'no'}`,
      `Comparison interpretation: ${report.comparison.comparison_interpretation}`,
    );

    if (report.comparison.scenario_status_changes.length > 0) {
      lines.push('', 'Status changes:');
      for (const change of report.comparison.scenario_status_changes) {
        lines.push(
          `- ${change.scenario_id}: ${change.baseline_status} -> ${change.current_status}`,
        );
      }
    } else {
      lines.push('', 'No scenario status changes detected.');
    }
  }

  return `${lines.join('\n')}\n`;
}

function comparisonRows(comparison) {
  return [
    ['First-pass blind rating', comparison.metrics.first_pass_blind_rating],
    ['First-pass usable rate', comparison.metrics.first_pass_usable_rate],
    ['First-pass validator error rate', comparison.metrics.first_pass_validator_error_rate],
    ['Mean time to first usable (s)', comparison.metrics.mean_time_to_first_usable_seconds],
    ['Mean revision count', comparison.metrics.mean_revision_count],
  ];
}

function formatValue(value) {
  return value === null || value === undefined ? 'n/a' : String(value);
}

function readFlagValue(argv, flagName, fallback) {
  const index = argv.findIndex((arg) => arg === flagName);
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return fallback;
}

async function main(argv = process.argv.slice(2)) {
  const currentPath = readFlagValue(argv, '--current', null);
  const baselinePath = readFlagValue(argv, '--baseline', null);
  const jsonOut = readFlagValue(argv, '--json-out', null);
  const markdownOut = readFlagValue(argv, '--markdown-out', null);

  if (!currentPath || !jsonOut || !markdownOut) {
    console.error(
      'Usage: node scripts/generate-proof-pack.mjs --current path/to/current-summary.json [--baseline path/to/baseline-summary.json] --json-out path/to/output.json --markdown-out path/to/output.md',
    );
    process.exitCode = 1;
    return;
  }

  const { report, markdown } = await generateProofPackFromFiles({
    currentPath,
    baselinePath,
  });

  const jsonOutPath = path.resolve(jsonOut);
  const markdownOutPath = path.resolve(markdownOut);
  await mkdir(path.dirname(jsonOutPath), { recursive: true });
  await mkdir(path.dirname(markdownOutPath), { recursive: true });
  await writeFile(jsonOutPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(markdownOutPath, markdown, 'utf8');
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
