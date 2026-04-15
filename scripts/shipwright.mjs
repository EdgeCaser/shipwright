#!/usr/bin/env node

/**
 * Shipwright entry point.
 *
 * Takes a plain-text question, routes it through Fast Mode and optionally
 * Rigor Mode based on scenario class and available providers.
 *
 * No scenario file required. The question is passed directly; a transient
 * scenario object is constructed in memory and cleaned up after the run.
 *
 * Usage:
 *   node scripts/shipwright.mjs \
 *     --question "Should we break up Bayer now?" \
 *     --class governance \
 *     --provider claude \
 *     --provider gpt \
 *     [--yes]       # auto-confirm escalation gates
 *     [--dry-run]   # print routing plan without running
 *     [--id <slug>] # override auto-generated scenario ID
 *     [--out-dir <path>]
 *
 * Scenario classes:
 *   governance       Board / restructuring / org decisions (cross-family required)
 *   publication      Publication-claim work (cross-family required)
 *   pricing          Pricing / packaging (single analysis default)
 *   product_strategy Product strategy / prioritization (single analysis default)
 *   unclassified     Everything else (single analysis default)
 */

import { mkdtempSync } from 'node:fs';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runOrchestrated } from './run-orchestrated.mjs';
import { SCENARIO_CLASSES } from './orchestrate.mjs';

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('shipwright.mjs') || process.argv[1].endsWith('shipwright'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.question || args.question.trim().length === 0) {
    process.stderr.write('Error: --question is required.\n\n');
    printHelp();
    process.exit(1);
  }

  let tempFile = null;

  try {
    const scenarioId = args.id || slugify(args.question);
    tempFile = await writeTempScenario(scenarioId, args.question);

    await runOrchestrated({
      scenario: tempFile,
      scenarioClass: args.class,
      availableProviders: args.providers,
      outDir: args.outDir || undefined,
      runId: args.runId || undefined,
      autoConfirm: args.yes,
      dryRun: args.dryRun,
      timeoutMs: args.timeoutMs,
    });
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  } finally {
    if (tempFile) {
      try { await unlink(tempFile); } catch { /* best-effort cleanup */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Temp scenario file
// ---------------------------------------------------------------------------

async function writeTempScenario(scenarioId, question) {
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'shipwright-'));
  const filePath = path.join(tmpDir, `${scenarioId}.json`);

  const scenario = {
    id: scenarioId,
    title: question.length > 80 ? question.slice(0, 77) + '...' : question,
    inputs: {
      prompt: question,
      // Required by the conflict harness case packet schema.
      expected_artifact_type: 'recommendation',
    },
  };

  await writeFile(filePath, JSON.stringify(scenario, null, 2) + '\n', 'utf8');
  return filePath;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseCliArgs(argv) {
  const parsed = {
    question: '',
    class: 'unclassified',
    providers: [],
    id: null,
    outDir: null,
    runId: null,
    yes: false,
    dryRun: false,
    timeoutMs: 120_000,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--question':
      case '-q':
        parsed.question = argv[i + 1] || '';
        i += 1;
        break;
      case '--class':
      case '-c':
        parsed.class = argv[i + 1] || 'unclassified';
        i += 1;
        break;
      case '--provider':
      case '-p':
        parsed.providers.push(argv[i + 1] || '');
        i += 1;
        break;
      case '--id':
        parsed.id = argv[i + 1] || null;
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
      case '-y':
        parsed.yes = true;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[i + 1]) || 120_000;
        i += 1;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      default:
        if (token.startsWith('--') || token.startsWith('-')) {
          throw new Error(`Unknown flag: ${token}`);
        }
        // Bare argument: treat as the question if none set yet.
        if (!parsed.question) {
          parsed.question = token;
        }
        break;
    }
  }

  if (parsed.providers.length === 0) {
    parsed.providers = ['claude'];
  }

  if (!SCENARIO_CLASSES[parsed.class]) {
    const supported = Object.keys(SCENARIO_CLASSES).join(', ');
    throw new Error(`Unknown class "${parsed.class}". Supported: ${supported}`);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'question';
}

function printHelp() {
  process.stdout.write(`
Shipwright — PM decision analysis

Usage:
  node scripts/shipwright.mjs --question "Your question here" [options]

Options:
  --question, -q  <text>      The decision question to analyze (required)
  --class, -c     <class>     Scenario class (default: unclassified)
  --provider, -p  <id>        Available provider: claude, gpt, gemini (repeatable)
  --yes, -y                   Auto-confirm escalation gates
  --dry-run                   Print routing plan without running
  --id            <slug>      Override auto-generated scenario ID
  --out-dir       <path>      Output directory root
  --timeout-ms    <ms>        Per-turn timeout (default: 120000)
  --help, -h                  Show this help

Scenario classes:
  governance       Board / restructuring decisions (cross-family required)
  publication      Publication-claim work (cross-family required)
  pricing          Pricing / packaging
  product_strategy Product strategy / prioritization
  unclassified     Everything else (default)

Examples:
  node scripts/shipwright.mjs \\
    --question "Should we break up Bayer now?" \\
    --class governance \\
    --provider claude --provider gpt

  node scripts/shipwright.mjs \\
    --question "Should we raise prices by 15% in Q3?" \\
    --class pricing \\
    --provider claude \\
    --yes

  node scripts/shipwright.mjs \\
    --question "Is this feature worth building?" \\
    --dry-run
`);
}
