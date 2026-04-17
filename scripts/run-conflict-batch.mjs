#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runConflictHarness } from './run-conflict-harness.mjs';

const DEFAULT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_REASONING_EFFORT = 'medium';
export const AGENT_PROFILES = {
  claude: {
    id: 'claude',
    label: 'claude',
    command: "cat {{prompt_file}} | claude -p --no-session-persistence --output-format text",
    provider: 'anthropic',
    model: 'claude-max',
  },
  gpt: {
    id: 'gpt',
    label: 'gpt',
    command: "cat {{prompt_file}} | codex exec --ephemeral --sandbox read-only",
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

const DEFAULT_SIDE_A_AGENT = 'claude';
const DEFAULT_SIDE_B_AGENT = 'gpt';
const DEFAULT_JUDGE_AGENTS = ['claude', 'gpt'];

function resolveAgentProfile(agentId, roleName) {
  const profile = AGENT_PROFILES[agentId];
  if (!profile) {
    const supported = Object.keys(AGENT_PROFILES).join(', ');
    throw new Error(`Unknown ${roleName} "${agentId}". Supported agents: ${supported}`);
  }
  return { ...profile };
}

function createRoleConfig(options = {}) {
  if (options.swapSides && (options.sideAAgent || options.sideBAgent)) {
    throw new Error('Use either --swap-sides or explicit --side-a-agent/--side-b-agent flags, not both.');
  }

  const defaultSideAAgent = options.swapSides ? DEFAULT_SIDE_B_AGENT : DEFAULT_SIDE_A_AGENT;
  const defaultSideBAgent = options.swapSides ? DEFAULT_SIDE_A_AGENT : DEFAULT_SIDE_B_AGENT;
  const sideA = resolveAgentProfile(options.sideAAgent || defaultSideAAgent, 'side-a agent');
  const sideB = resolveAgentProfile(options.sideBAgent || defaultSideBAgent, 'side-b agent');

  if (sideA.id === sideB.id) {
    throw new Error(`Side A and Side B must use different agents. Both were set to "${sideA.id}".`);
  }

  const judgeIds = options.judgeAgents && options.judgeAgents.length > 0
    ? options.judgeAgents
    : DEFAULT_JUDGE_AGENTS;
  const judges = judgeIds.map((judgeId) => {
    const judge = resolveAgentProfile(judgeId, 'judge agent');
    return {
      ...judge,
      label: `${judge.label}-judge`,
    };
  });

  // Warn when a judge family matches the Side A family — known positional lean.
  const sameProviderJudges = judges.filter((j) => j.provider === sideA.provider);
  if (sameProviderJudges.length > 0) {
    const names = sameProviderJudges.map((j) => j.label).join(', ');
    process.stderr.write(
      `\nWARNING: Judge(s) [${names}] share a provider family with Side A (${sideA.provider}).\n` +
      `  Claude-family judges have a documented positional lean toward Side A (~100% side_a rate).\n` +
      `  Results from these judges cannot be trusted as standalone verdicts.\n` +
      `  Recommended: add --judge-agent gpt (or another family) as a cross-check, or use --swap-sides.\n\n`
    );
  }

  return { sideA, sideB, judges };
}

export async function runBatch(options = {}) {
  const scenarioDir = options.scenarioDir || DEFAULT_SCENARIO_DIR;
  const scenarios = await listScenarios(scenarioDir, options.scenarios);
  const roleConfig = createRoleConfig(options);
  const sideACommand = options.sideACommand || roleConfig.sideA.command;
  const sideBCommand = options.sideBCommand || roleConfig.sideB.command;
  const judgeConfigs = options.judgeConfigs || roleConfig.judges;
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
          sideALabel: roleConfig.sideA.label,
          sideBLabel: roleConfig.sideB.label,
          status: 'dry_run',
          winner: null,
          margin: null,
          judgeConfidence: null,
          needsHumanReview: null,
          disagreementRate: null,
          declaredAdoptionRate: null,
          substantiveRevisionRate: null,
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
          sideAProvider: roleConfig.sideA.provider,
          sideAModel: roleConfig.sideA.model,
          sideAReasoningEffort,
          sideBProvider: roleConfig.sideB.provider,
          sideBModel: roleConfig.sideB.model,
          sideBReasoningEffort,
          judgeProvider: judge.provider,
          judgeModel: judge.model,
          judgeReasoningEffort,
        });

        results.push({
          scenario,
          judgeLabel: judge.label,
          sideALabel: roleConfig.sideA.label,
          sideBLabel: roleConfig.sideB.label,
          status: run.status,
          winner: run.results.winner,
          margin: run.results.margin,
          judgeConfidence: run.results.judge_confidence,
          needsHumanReview: run.results.needs_human_review,
          disagreementRate: run.metrics.disagreement_rate,
          declaredAdoptionRate: run.metrics.declared_adoption_rate,
          substantiveRevisionRate: run.metrics.substantive_revision_rate,
          unsupportedClaimCount: run.metrics.unsupported_claim_count,
          runId: run.run_id,
          harnessSchemaVersion: run.harness_schema_version || null,
          judgeProvider: judge.provider || null,
          decisiveDimension: run.results.decisive_dimension || null,
          error: null,
          // Phase 2 uncertainty payload (present when triggered)
          uncertaintyDrivers: run.results.uncertainty_drivers || null,
          disambiguationQuestions: run.results.disambiguation_questions || null,
          neededEvidence: run.results.needed_evidence || null,
          recommendedNextAction: run.results.recommended_next_action || null,
          escalationRecommendation: run.results.escalation_recommendation || null,
          canResolveWithMoreEvidence: run.results.can_resolve_with_more_evidence ?? null,
        });

        process.stderr.write(`${label} — ${run.status}, winner: ${run.results.winner || 'none'}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          scenario,
          judgeLabel: judge.label,
          sideALabel: roleConfig.sideA.label,
          sideBLabel: roleConfig.sideB.label,
          status: 'error',
          winner: null,
          margin: null,
          judgeConfidence: null,
          needsHumanReview: null,
          disagreementRate: null,
          declaredAdoptionRate: null,
          substantiveRevisionRate: null,
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

// Documented empirical leans: the side each provider family consistently favors as judge.
const PROVIDER_LEAN = {
  anthropic: 'side_a', // ~100% side_a rate across all judged runs
  openai: 'side_b',    // ~3x side_b rate vs side_a across rebaseline corpus
};

export async function runSwapTests(lowTrustResults, options = {}) {
  const swapPairs = [];

  for (const r of lowTrustResults) {
    process.stderr.write(`\nSwap test: ${r.scenario} (original winner: ${r.winner}, judge: ${r.judgeLabel})\n`);

    const swapRuns = await runBatch({
      scenarios: [r.scenario],
      scenarioDir: options.scenarioDir,
      sideAAgent: r.sideBLabel,
      sideBAgent: r.sideALabel,
      judgeAgents: ['claude'],
      sideAReasoningEffort: options.sideAReasoningEffort,
      sideBReasoningEffort: options.sideBReasoningEffort,
      judgeReasoningEffort: options.judgeReasoningEffort,
    });

    const swapRun = swapRuns[0];
    let swapOutcome;
    if (!swapRun || swapRun.status !== 'completed') {
      swapOutcome = 'error';
    } else if (swapRun.winner === 'side_a') {
      swapOutcome = 'confirmed_lean'; // Claude still called side_a (now GPT's artifact) — positional lean confirmed
    } else if (swapRun.winner === 'side_b') {
      swapOutcome = 'quality_confirmed'; // Claude overrode lean to call its own artifact — original verdict was genuine
    } else {
      swapOutcome = 'inconclusive';
    }

    swapPairs.push({ original: r, swapRun, swapOutcome });
    process.stderr.write(`Swap result: ${swapRun?.winner || 'error'} → ${swapOutcome}\n`);
  }

  return swapPairs;
}

export function verdictTrustLevel(result) {
  if (!result.winner || result.status !== 'completed' || !result.judgeProvider) return 'unknown';
  if (result.winner === 'tie') return 'medium';
  const lean = PROVIDER_LEAN[result.judgeProvider];
  if (!lean) return 'medium'; // provider with no empirical lean data
  return result.winner === lean ? 'low' : 'high';
}

const LEAN_SIDE_LABEL = {
  side_a: 'Side A',
  side_b: 'Side B',
};

const DIM_EXPLANATION = {
  decision_usefulness: 'operational specificity — concrete next steps, named owners, quantified thresholds',
  evidence_discipline: 'staying within the evidence and not overreaching',
  claim_quality: 'the strength and precision of the claims made',
  responsiveness_to_critique: 'how well the artifact incorporated rebuttal feedback',
  internal_consistency: 'logical coherence across the artifact',
};

export function verdictInterpretation(result) {
  const trust = verdictTrustLevel(result);
  const judgeLabel = result.judgeLabel || 'The judge';
  const lean = PROVIDER_LEAN[result.judgeProvider];
  const leanLabel = lean ? LEAN_SIDE_LABEL[lean] : null;
  const winnerLabel = result.winner === 'side_a' ? (result.sideALabel || 'Side A')
    : result.winner === 'side_b' ? (result.sideBLabel || 'Side B')
    : null;
  const dimNote = result.decisiveDimension
    ? ` Resolved on ${result.decisiveDimension}${DIM_EXPLANATION[result.decisiveDimension] ? ` (${DIM_EXPLANATION[result.decisiveDimension]})` : ''}.`
    : '';

  if (trust === 'unknown') return 'Verdict incomplete or missing data — no interpretation available.';

  if (result.winner === 'tie') {
    return `${judgeLabel} deadlocked — both artifacts scored too close to call.${dimNote} Check the uncertainty payload for what evidence would resolve this.`;
  }

  if (trust === 'high') {
    return `${judgeLabel} overrode its documented lean toward ${leanLabel} to call ${winnerLabel} the winner — this is the strongest trust signal the harness produces.${dimNote}`;
  }

  if (trust === 'low') {
    if (result.swapOutcome === 'quality_confirmed') {
      return `${judgeLabel} called ${winnerLabel} the winner (lean-aligned), but a swap test showed ${judgeLabel} overriding its lean to call the same artifact from the other side — quality confirmed.${dimNote}`;
    }
    if (result.swapOutcome === 'confirmed_lean') {
      return `${judgeLabel} called ${winnerLabel} the winner, and a swap test confirmed this is positional lean — ${judgeLabel} called side_a again with sides reversed.${dimNote} Discount this verdict.`;
    }
    if (result.swapOutcome === 'inconclusive') {
      return `${judgeLabel} called ${winnerLabel} the winner (lean-aligned), and the swap test was a tie — verdict remains inconclusive.${dimNote}`;
    }
    return `${judgeLabel} called ${winnerLabel} the winner, consistent with its documented lean toward ${leanLabel}.${dimNote} Run --auto-swap before drawing conclusions.`;
  }

  // medium — neutral provider, no documented lean
  return `${judgeLabel} (no documented lean) called ${winnerLabel} the winner.${dimNote}`;
}

export function buildSummary(results) {
  const lines = [];

  lines.push('# Conflict Harness Batch Summary');
  const versions = [...new Set(results.map((r) => r.harnessSchemaVersion).filter(Boolean))];
  lines.push(`\nHarness schema version: ${versions.length > 0 ? versions.join(', ') : 'unknown'}`);
  lines.push(`Runs completed: ${results.length}`);
  lines.push(`Errors: ${results.filter((r) => r.status === 'error').length}`);
  lines.push('');

  // Positional lean warning — surface inline so it can't be missed
  const completedResults = results.filter((r) => r.sideAProvider && r.judgeProvider);
  const sideAProviders = [...new Set(completedResults.map((r) => r.sideAProvider))];
  for (const sideAProvider of sideAProviders) {
    const biasedJudgeLabels = [
      ...new Set(
        completedResults
          .filter((r) => r.sideAProvider === sideAProvider && r.judgeProvider === sideAProvider)
          .map((r) => r.judgeLabel)
      ),
    ];
    if (biasedJudgeLabels.length > 0) {
      lines.push(`> **WARNING — Positional Lean:** Judge(s) [${biasedJudgeLabels.join(', ')}] share a provider family with Side A (${sideAProvider}).`);
      lines.push(`> Claude-family judges call side_a ~100% of the time. GPT-family judges call side_b at ~3x the rate of side_a.`);
      lines.push(`> Verdicts from these judges cannot be trusted as standalone conclusions. Add a cross-family judge or run --swap-sides before drawing any conclusions.`);
      lines.push('');
    }
  }

  // Per-run results table
  lines.push('## Run Results');
  lines.push('');
  const hasSwapData = results.some((r) => r.swapOutcome);

  lines.push(`| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Trust |${hasSwapData ? ' Swap |' : ''} Human Review | Disagreement | Declared | Revised |`);
  lines.push(`|---|---|---|---|---|---|---|---|---|${hasSwapData ? '---|' : ''}---|---|---|---|`);

  for (const r of results) {
    const trust = verdictTrustLevel(r);
    const swapCol = hasSwapData ? (r.swapOutcome || '—') : null;
    const row = [
      '',
      r.scenario,
      r.sideALabel || '—',
      r.sideBLabel || '—',
      r.judgeLabel,
      r.status,
      r.winner || '—',
      r.margin != null ? r.margin.toFixed(2) : '—',
      r.judgeConfidence || '—',
      trust,
      ...(hasSwapData ? [swapCol] : []),
      r.needsHumanReview != null ? String(r.needsHumanReview) : '—',
      r.disagreementRate != null ? r.disagreementRate.toFixed(2) : '—',
      r.declaredAdoptionRate != null ? r.declaredAdoptionRate.toFixed(2) : '—',
      r.substantiveRevisionRate != null ? r.substantiveRevisionRate.toFixed(2) : '—',
      '',
    ];
    lines.push(row.join(' | '));
  }

  // Plain-English verdict interpretations
  const interpretable = results.filter((r) => r.status === 'completed');
  if (interpretable.length > 0) {
    lines.push('');
    lines.push('## Verdict Interpretations');
    lines.push('');
    for (const r of interpretable) {
      lines.push(`**${r.scenario} (${r.judgeLabel}):** ${verdictInterpretation(r)}`);
      lines.push('');
    }
  }

  // Swap test results section
  const swapTested = results.filter((r) => r.swapOutcome);
  if (swapTested.length > 0) {
    lines.push('## Swap Test Results');
    lines.push('');
    lines.push('These scenarios had low-trust Claude verdicts and were re-run with sides reversed to test for positional lean.');
    lines.push('');
    lines.push('| Scenario | Original Winner | Swap Winner | Outcome | Interpretation |');
    lines.push('|---|---|---|---|---|');
    for (const r of swapTested) {
      const outcomeLabel = {
        quality_confirmed: '✓ Quality confirmed',
        confirmed_lean: '✗ Lean confirmed',
        inconclusive: '~ Inconclusive',
        error: 'Error',
      }[r.swapOutcome] || r.swapOutcome;
      const interp = {
        quality_confirmed: 'Verdict is genuine — trust upgraded to high.',
        confirmed_lean: 'Positional lean confirmed — discount this verdict.',
        inconclusive: 'Swap tied — verdict remains ambiguous.',
        error: 'Swap run failed.',
      }[r.swapOutcome] || '—';
      lines.push(`| ${r.scenario} | ${r.winner || '—'} | ${r.swapWinner || '—'} | ${outcomeLabel} | ${interp} |`);
    }
    lines.push('');
  }

  // Flagged verdicts — uncertainty payload for triggered runs
  const flagged = results.filter(
    (r) => r.status === 'completed' && (r.needsHumanReview || r.winner === 'tie' || r.judgeConfidence === 'low') && r.recommendedNextAction
  );
  if (flagged.length > 0) {
    lines.push('');
    lines.push('## Flagged Verdicts — Uncertainty Payload');
    lines.push('');
    lines.push('These runs triggered the Phase 2 uncertainty payload. Each entry includes actionable routing guidance.');
    for (const r of flagged) {
      lines.push('');
      lines.push(`### ${r.scenario}`);
      lines.push(`**Winner:** ${r.winner} | **Confidence:** ${r.judgeConfidence} | **Human review:** ${r.needsHumanReview}`);
      if (r.uncertaintyDrivers?.length) {
        lines.push('');
        lines.push('**Why uncertain:**');
        for (const d of r.uncertaintyDrivers) lines.push(`- ${d}`);
      }
      if (r.disambiguationQuestions?.length) {
        lines.push('');
        lines.push('**Questions to resolve:**');
        for (const q of r.disambiguationQuestions) lines.push(`- ${q}`);
      }
      if (r.neededEvidence?.length) {
        lines.push('');
        lines.push('**Evidence needed:**');
        for (const e of r.neededEvidence) lines.push(`- ${e}`);
      }
      if (r.recommendedNextAction) {
        lines.push('');
        lines.push(`**Next action:** ${r.recommendedNextAction}`);
      }
      if (r.escalationRecommendation) {
        lines.push('');
        lines.push(`**Escalation:** ${r.escalationRecommendation}`);
      }
    }
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

  // Decisive dimension breakdown by judge family
  const completedWithDim = results.filter((r) => r.status === 'completed' && r.decisiveDimension);
  if (completedWithDim.length > 0) {
    lines.push('');
    lines.push('## Decisive Dimension by Judge Family');
    lines.push('');

    const providers = [...new Set(completedWithDim.map((r) => r.judgeProvider).filter(Boolean))];
    const allDims = [...new Set(completedWithDim.map((r) => r.decisiveDimension))].sort();

    lines.push('| Dimension | ' + providers.join(' | ') + ' | All |');
    lines.push('|---|' + providers.map(() => '---|').join('') + '---|');

    for (const dim of allDims) {
      const allCount = completedWithDim.filter((r) => r.decisiveDimension === dim).length;
      const allPct = ((allCount / completedWithDim.length) * 100).toFixed(0);
      const providerCols = providers.map((p) => {
        const providerRuns = completedWithDim.filter((r) => r.judgeProvider === p);
        if (providerRuns.length === 0) return '—';
        const count = providerRuns.filter((r) => r.decisiveDimension === dim).length;
        return `${count}/${providerRuns.length} (${((count / providerRuns.length) * 100).toFixed(0)}%)`;
      });
      lines.push(`| ${dim} | ${providerCols.join(' | ')} | ${allCount}/${completedWithDim.length} (${allPct}%) |`);
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
    swapSides: false,
    autoSwap: false,
    sideAAgent: '',
    sideBAgent: '',
    judgeAgents: [],
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
      case '--swap-sides':
        parsed.swapSides = true;
        break;
      case '--auto-swap':
        parsed.autoSwap = true;
        break;
      case '--side-a-agent':
        parsed.sideAAgent = argv[i + 1] || '';
        i += 1;
        break;
      case '--side-b-agent':
        parsed.sideBAgent = argv[i + 1] || '';
        i += 1;
        break;
      case '--judge-agent':
        parsed.judgeAgents.push(argv[i + 1] || '');
        i += 1;
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
      '  --swap-sides          Run with Side A = GPT and Side B = Claude',
      '  --auto-swap           After the main run, re-run low-trust Claude verdicts with sides swapped to confirm or refute positional lean',
      '  --side-a-agent <id>   Agent for Side A (claude|gpt|gemini)',
      '  --side-b-agent <id>   Agent for Side B (claude|gpt|gemini)',
      '  --judge-agent <id>    Judge agent to include (repeatable; default: claude + gpt)',
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

  const batchOptions = {
    scenarios: args.scenarios.length > 0 ? args.scenarios : undefined,
    scenarioDir: args.scenarioDir,
    dryRun: args.dryRun,
    swapSides: args.swapSides,
    sideAAgent: args.sideAAgent || undefined,
    sideBAgent: args.sideBAgent || undefined,
    judgeAgents: args.judgeAgents.length > 0 ? args.judgeAgents : undefined,
    sideAReasoningEffort: args.sideAReasoningEffort,
    sideBReasoningEffort: args.sideBReasoningEffort,
    judgeReasoningEffort: args.judgeReasoningEffort,
  };

  const results = await runBatch(batchOptions);

  let swapPairs = [];
  if (args.autoSwap && !args.dryRun) {
    const swapCandidates = results.filter(
      (r) => verdictTrustLevel(r) === 'low' && r.judgeProvider === 'anthropic'
    );
    if (swapCandidates.length > 0) {
      process.stderr.write(`\nAuto-swap: ${swapCandidates.length} low-trust Claude verdict(s) queued for swap testing.\n`);
      swapPairs = await runSwapTests(swapCandidates, {
        scenarioDir: args.scenarioDir,
        sideAReasoningEffort: args.sideAReasoningEffort,
        sideBReasoningEffort: args.sideBReasoningEffort,
        judgeReasoningEffort: args.judgeReasoningEffort,
      });
      for (const { original, swapRun, swapOutcome } of swapPairs) {
        const r = results.find((x) => x === original);
        if (r) {
          r.swapWinner = swapRun?.winner || null;
          r.swapOutcome = swapOutcome;
        }
      }
    } else {
      process.stderr.write('\nAuto-swap: no low-trust Claude verdicts found — skipping swap tests.\n');
    }
  }

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
