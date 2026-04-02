#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { loadBenchmarkScenario } from './run-benchmarks.mjs';
import { SCORE_DIMENSIONS } from './blind-review-utils.mjs';

const REVIEW_PACKET_SCHEMA_VERSION = '1.0.0';
const DEFAULT_CURRENT_SCENARIO_DIR = path.resolve('benchmarks', 'scenarios');
const DEFAULT_BASELINE_SCENARIO_DIR = path.resolve(
  'benchmarks',
  'baselines',
  'strong-prompt-v1',
  'scenarios',
);

export async function prepareBlindReviewBundle(options = {}) {
  const currentScenarioDir = path.resolve(
    options.currentScenarioDir || DEFAULT_CURRENT_SCENARIO_DIR,
  );
  const baselineScenarioDir = path.resolve(
    options.baselineScenarioDir || DEFAULT_BASELINE_SCENARIO_DIR,
  );
  const seed = options.seed || 'shipwright-v2-proof-content';
  const generatedAt = options.generatedAt || new Date().toISOString();
  const reviewRunId =
    options.reviewRunId || `review-run-${generatedAt.replace(/[:.]/g, '-')}`;

  const currentScenarios = await loadScenarioDirectory(currentScenarioDir, {
    label: 'Current scenario directory',
  });
  const baselineScenarios = await loadScenarioDirectory(baselineScenarioDir, {
    label: 'Baseline scenario directory',
    missingHint: options.baselineScenarioDir
      ? null
      : 'Create the baseline scenario tree first or pass --baseline-scenarios explicitly.',
  });
  assertMatchingScenarioSets(currentScenarios, baselineScenarios);

  const scenarioIds = [...currentScenarios.keys()].sort();
  const assignments = [];
  const reviewScenarios = [];

  for (const scenarioId of scenarioIds) {
    const currentScenario = currentScenarios.get(scenarioId);
    const baselineScenario = baselineScenarios.get(scenarioId);
    const reviewScenario = {
      scenario_id: scenarioId,
      title: currentScenario.title,
      first_pass: [],
      final_pass: [],
    };

    for (const phase of ['first_pass', 'final_pass']) {
      const blindedArtifacts = await buildBlindedArtifacts({
        currentScenario,
        baselineScenario,
        scenarioId,
        phase,
        seed,
      });

      reviewScenario[phase] = blindedArtifacts.map((artifact) => ({
        artifact_id: artifact.artifact_id,
        blinded_label: artifact.blinded_label,
        artifact_text: artifact.artifact_text,
      }));

      for (const artifact of blindedArtifacts) {
        assignments.push({
          scenario_id: scenarioId,
          title: currentScenario.title,
          phase,
          artifact_id: artifact.artifact_id,
          blinded_label: artifact.blinded_label,
          origin: artifact.origin,
          source_artifact_path: artifact.source_artifact_path,
        });
      }
    }

    reviewScenarios.push(reviewScenario);
  }

  const packet = {
    schema_version: REVIEW_PACKET_SCHEMA_VERSION,
    review_run_id: reviewRunId,
    generated_at: generatedAt,
    instructions:
      'Score each artifact independently on decision usefulness, evidence discipline, internal consistency, and actionability. Artifact origin is intentionally hidden.',
    scenarios: reviewScenarios,
  };

  const adminManifest = {
    schema_version: REVIEW_PACKET_SCHEMA_VERSION,
    review_run_id: reviewRunId,
    generated_at: generatedAt,
    seed,
    current_scenario_dir: currentScenarioDir,
    baseline_scenario_dir: baselineScenarioDir,
    provenance: {
      current: createDefaultProvenanceOverlay(
        'Set true only after the Shipwright benchmark run is frozen and attributable.',
      ),
      baseline: createDefaultProvenanceOverlay(
        'Set true only after the comparison method and artifacts are independently produced.',
      ),
    },
    assignments,
  };

  const reviewTemplate = {
    schema_version: REVIEW_PACKET_SCHEMA_VERSION,
    review_run_id: reviewRunId,
    reviewer_id: 'replace-me',
    responses: assignments.map((assignment) => ({
      artifact_id: assignment.artifact_id,
      decision_usefulness: null,
      evidence_discipline: null,
      internal_consistency: null,
      actionability: null,
    })),
  };

  const markdown = renderReviewPacketMarkdown(packet);

  if (options.outDir) {
    const outDir = path.resolve(options.outDir);
    await mkdir(outDir, { recursive: true });
    await writeFile(
      path.join(outDir, 'review-packet.json'),
      `${JSON.stringify(packet, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      path.join(outDir, 'review-packet.md'),
      markdown,
      'utf8',
    );
    await writeFile(
      path.join(outDir, 'admin-manifest.json'),
      `${JSON.stringify(adminManifest, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      path.join(outDir, 'review-template.json'),
      `${JSON.stringify(reviewTemplate, null, 2)}\n`,
      'utf8',
    );
  }

  return {
    packet,
    adminManifest,
    reviewTemplate,
    markdown,
  };
}

async function buildBlindedArtifacts(options) {
  const currentArtifactPath = resolveScenarioArtifactPath(
    options.currentScenario,
    options.phase,
  );
  const baselineArtifactPath = resolveScenarioArtifactPath(
    options.baselineScenario,
    options.phase,
  );
  const currentArtifactText = stripStructuredPayload(
    await readFile(currentArtifactPath, 'utf8'),
  );
  const baselineArtifactText = stripStructuredPayload(
    await readFile(baselineArtifactPath, 'utf8'),
  );

  const pair = deterministicOrder(
    [
      {
        origin: 'current',
        artifact_text: currentArtifactText,
        source_artifact_path: path.relative(process.cwd(), currentArtifactPath),
      },
      {
        origin: 'baseline',
        artifact_text: baselineArtifactText,
        source_artifact_path: path.relative(process.cwd(), baselineArtifactPath),
      },
    ],
    `${options.seed}:${options.scenarioId}:${options.phase}`,
  );

  return pair.map((artifact, index) => ({
    ...artifact,
    blinded_label: index === 0 ? 'A' : 'B',
    artifact_id: `${options.scenarioId}:${options.phase}:${index === 0 ? 'A' : 'B'}`,
  }));
}

function resolveScenarioArtifactPath(scenario, phase) {
  const relativePath = scenario.fixtures?.[`${phase}_artifact`];
  return path.resolve(path.dirname(scenario.source_path), relativePath);
}

export function stripStructuredPayload(text) {
  return text
    .replace(/<!--\s*shipwright:artifact[\s\S]*?-->\s*/g, '')
    .trim();
}

function createDefaultProvenanceOverlay(artifactNotes) {
  return {
    artifact_generation: {
      independent: false,
      notes: artifactNotes,
    },
    blind_review: {
      independent: false,
      blinded: false,
      notes: 'Set true only after at least 3 independent reviewers score blinded artifacts without origin knowledge.',
    },
  };
}

async function loadScenarioDirectory(scenarioDir, options = {}) {
  let entries;
  try {
    entries = await readdir(scenarioDir, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      const hint = options.missingHint ? ` ${options.missingHint}` : '';
      throw new Error(`${options.label || 'Scenario directory'} not found: ${scenarioDir}.${hint}`);
    }
    throw error;
  }
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(scenarioDir, entry.name))
    .sort();

  if (files.length === 0) {
    throw new Error(`${options.label || 'Scenario directory'} does not contain any .json scenario files: ${scenarioDir}.`);
  }

  const scenarios = new Map();
  for (const filePath of files) {
    const scenario = await loadBenchmarkScenario(filePath);
    scenarios.set(scenario.id, scenario);
  }
  return scenarios;
}

function assertMatchingScenarioSets(currentScenarios, baselineScenarios) {
  const currentIds = [...currentScenarios.keys()].sort();
  const baselineIds = [...baselineScenarios.keys()].sort();

  if (currentIds.length !== baselineIds.length) {
    throw new Error(
      'Current and baseline scenario directories must contain the same scenario ids.',
    );
  }

  for (let index = 0; index < currentIds.length; index += 1) {
    if (currentIds[index] !== baselineIds[index]) {
      throw new Error(
        'Current and baseline scenario directories must contain the same scenario ids.',
      );
    }
  }
}

function deterministicOrder(items, salt) {
  const hash = createHash('sha256').update(salt).digest('hex');
  const shouldSwap = Number.parseInt(hash.slice(0, 2), 16) % 2 === 1;
  return shouldSwap ? [items[1], items[0]] : items;
}

function renderReviewPacketMarkdown(packet) {
  const lines = [
    '# Shipwright Blind Review Packet',
    '',
    `Review run: ${packet.review_run_id}`,
    `Generated: ${packet.generated_at}`,
    '',
    'Score each artifact independently on these dimensions:',
    '',
  ];

  for (const dimension of SCORE_DIMENSIONS) {
    lines.push(`- ${dimension}`);
  }

  for (const scenario of packet.scenarios) {
    lines.push('', `## ${scenario.title}`, '', `Scenario ID: ${scenario.scenario_id}`);
    for (const phase of ['first_pass', 'final_pass']) {
      const label = phase === 'first_pass' ? 'First Pass' : 'Final Pass';
      lines.push('', `### ${label}`);
      for (const artifact of scenario[phase]) {
        lines.push(
          '',
          `#### Artifact ${artifact.blinded_label}`,
          '',
          artifact.artifact_text,
        );
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

function readFlagValue(argv, flagName, fallback) {
  const index = argv.findIndex((arg) => arg === flagName);
  if (index !== -1 && argv[index + 1]) return argv[index + 1];
  return fallback;
}

async function main(argv = process.argv.slice(2)) {
  const outDir = readFlagValue(argv, '--out-dir', null);
  if (!outDir) {
    console.error(
      'Usage: node scripts/prepare-blind-review.mjs --out-dir path/to/output [--current-scenarios benchmarks/scenarios] [--baseline-scenarios benchmarks/baselines/strong-prompt-v1/scenarios] [--review-run-id proof-run-001] [--seed shipwright-v2-proof-content]',
    );
    process.exitCode = 1;
    return;
  }

  await prepareBlindReviewBundle({
    outDir,
    currentScenarioDir: readFlagValue(argv, '--current-scenarios', DEFAULT_CURRENT_SCENARIO_DIR),
    baselineScenarioDir: readFlagValue(
      argv,
      '--baseline-scenarios',
      DEFAULT_BASELINE_SCENARIO_DIR,
    ),
    reviewRunId: readFlagValue(argv, '--review-run-id', null),
    seed: readFlagValue(argv, '--seed', 'shipwright-v2-proof-content'),
  });
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
