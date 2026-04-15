#!/usr/bin/env node

/**
 * Shipwright entry point.
 *
 * Thin CLI adapter over the session controller for plain-language questions.
 * Users pass a question; Shipwright creates a decision session and returns the
 * presented state payload instead of requiring terminal-shaped workflow steps.
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
} from './decision-session-controller.mjs';

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

  try {
    if (args.dryRun) {
      const providerAvailability = assessProviderAvailability(args.providers);
      const routing = route({
        scenario_class: args.class,
        stage: 'pre_run',
        confidence_band: null,
        needs_human_review: null,
        uncertainty_payload_present: false,
        provider_availability: providerAvailability,
      });
      printDryRun({
        question: args.question,
        scenario_class: args.class,
        provider_availability: providerAvailability,
        routing,
      });
      process.exit(0);
    }

    const sessionResult = await startDecisionSession({
      question: args.question,
      scenario_id: args.id || slugify(args.question),
      scenario_class: args.class,
      available_providers: args.providers,
      sessions_root: args.outDir ? path.join(args.outDir, 'sessions') : undefined,
      fast_out_dir: args.outDir ? path.join(args.outDir, 'stage-1-fast') : undefined,
      rigor_out_dir: args.outDir ? path.join(args.outDir, 'stage-2-rigor') : undefined,
      auto_confirm: args.yes,
      timeout_ms: args.timeoutMs,
    });

    const finalResult = sessionResult.session?.session_id
      ? await getDecisionSession(
        sessionResult.session.session_id,
        args.outDir ? path.join(args.outDir, 'sessions') : undefined,
      )
      : sessionResult;

    printPresented(finalResult.presented || finalResult);
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
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
    --provider claude --provider gpt --provider gemini

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

function printDryRun(payload) {
  process.stdout.write(`\n=== DRY RUN ===\n`);
  process.stdout.write(`Question: ${payload.question}\n`);
  process.stdout.write(`Class: ${payload.scenario_class}\n`);
  process.stdout.write(`Providers: ${payload.provider_availability.available_providers.join(', ')}\n`);
  process.stdout.write(`\nState: ${payload.routing.ux_state}\n`);
  if (payload.routing.ux_substate) {
    process.stdout.write(`Substate: ${payload.routing.ux_substate}\n`);
  }
  if (payload.routing.recommended_next_mode) {
    process.stdout.write(`Next mode: ${payload.routing.recommended_next_mode}\n`);
  }
  process.stdout.write(`\n${payload.routing.explanation}\n`);
  if (payload.routing.follow_up_action) {
    process.stdout.write(`Action: ${payload.routing.follow_up_action}\n`);
  }
}

function printPresented(presented) {
  if (!presented) {
    process.stdout.write('No presented session payload available.\n');
    return;
  }

  process.stdout.write(`\n=== ${presented.headline} ===\n`);
  if (presented.current_recommendation) {
    process.stdout.write(`\nRecommendation:\n${presented.current_recommendation}\n`);
  }
  process.stdout.write(`\nState: ${presented.state}\n`);
  if (presented.substate) {
    process.stdout.write(`Substate: ${presented.substate}\n`);
  }
  if (presented.why_this_state) {
    process.stdout.write(`\nWhy:\n${presented.why_this_state}\n`);
  }
  if (presented.recommended_next_action) {
    process.stdout.write(`\nNext action:\n${presented.recommended_next_action}\n`);
  }
  if (presented.uncertainty_payload) {
    process.stdout.write(`\nUncertainty guidance:\n`);
    for (const item of presented.uncertainty_payload.uncertainty_drivers || []) {
      process.stdout.write(`- Driver: ${item}\n`);
    }
    for (const item of presented.uncertainty_payload.disambiguation_questions || []) {
      process.stdout.write(`- Question: ${item}\n`);
    }
    for (const item of presented.uncertainty_payload.needed_evidence || []) {
      process.stdout.write(`- Evidence: ${item}\n`);
    }
  }
  if (presented.available_actions?.length) {
    process.stdout.write(`\nAvailable actions: ${presented.available_actions.join(', ')}\n`);
  }
  process.stdout.write(`\nSession ID: ${presented.session_id}\n`);
}
