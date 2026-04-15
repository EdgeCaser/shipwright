#!/usr/bin/env node

/**
 * Telemetry module for Shipwright.
 *
 * Append-only JSONL event log. Used to tune confidence thresholds and
 * analyze the escalation funnel across runs.
 *
 * emit() is fire-and-forget — telemetry failures never surface to callers.
 * summary() reads the log and prints aggregate stats.
 *
 * Event types (session-centric — emitted by decision-session-controller):
 *   session_started          — a decision session was created and Fast Mode began
 *   fast_completed           — Fast Mode analysis finished
 *   escalation_offered       — user was shown an escalation recommendation
 *   next_step_confirmed      — user confirmed escalation to Rigor Mode
 *   next_step_declined       — user declined escalation
 *   rigor_completed          — Rigor Mode (conflict harness) finished
 *   session_completed        — session reached a terminal state
 *   session_failed           — session execution step failed
 *   session_presented        — session state was fetched and presented
 *
 * Legacy event types (emitted by older CLI scripts):
 *   run_started              — a new orchestrated run began
 *   escalation_accepted      — user confirmed escalation (old CLI)
 *   escalation_declined      — user declined escalation (old CLI)
 *   run_completed            — orchestrated run reached a terminal state
 *
 * Usage (as a module):
 *   import { emit, summary } from './telemetry.mjs';
 *
 *   emit('fast_completed', { run_id, scenario_id, scenario_class, agent,
 *     confidence_band, ux_state, needs_human_review, has_uncertainty_payload });
 *
 * CLI (summary):
 *   node scripts/telemetry.mjs
 *   node scripts/telemetry.mjs --log <path>
 *   node scripts/telemetry.mjs --format json
 */

import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_LOG_PATH = path.resolve('benchmarks', 'telemetry', 'events.jsonl');

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

/**
 * Append a telemetry event to the log. Fire-and-forget — never throws.
 *
 * @param {string} event      - Event type (e.g. 'fast_completed')
 * @param {object} fields     - Event-specific fields
 * @param {string} [logPath]  - Override log file path
 */
export async function emit(event, fields = {}, logPath = DEFAULT_LOG_PATH) {
  const record = {
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  try {
    await mkdir(path.dirname(logPath), { recursive: true });
    await appendFile(logPath, JSON.stringify(record) + '\n', 'utf8');
  } catch {
    // Telemetry failures are silent — never interrupt a run.
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Read the event log and print aggregate stats.
 *
 * @param {object} [options]
 * @param {string} [options.logPath]   - Override log file path
 * @param {string} [options.format]    - 'text' (default) or 'json'
 */
export async function summary(options = {}) {
  const logPath = options.logPath || DEFAULT_LOG_PATH;
  const format = options.format || 'text';

  if (!existsSync(logPath)) {
    if (format === 'json') {
      return {};
    }
    process.stdout.write('No telemetry log found. Run shipwright.mjs to generate events.\n');
    return;
  }

  const raw = await readFile(logPath, 'utf8');
  const events = raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);

  const stats = computeStats(events);

  if (format === 'json') {
    return stats;
  }

  printStats(stats, events.length);
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

function computeStats(events) {
  const byType = groupBy(events, 'event');

  // ---------------------------------------------------------------------------
  // Session funnel (session-centric events from decision-session-controller)
  // ---------------------------------------------------------------------------

  const sessionStartedEvents = byType['session_started'] || [];
  const sessionCompletedEvents = byType['session_completed'] || [];
  const sessionFailedEvents = byType['session_failed'] || [];
  const sessionPresentedEvents = byType['session_presented'] || [];
  const followUpEvents = byType['follow_up_action_executed'] || [];
  const followUpActionDist = countBy(followUpEvents, 'action');

  const sessionCompletedUxDist = countBy(sessionCompletedEvents, 'ux_state');
  const sessionCompletedSubstateDist = countBy(sessionCompletedEvents, 'ux_substate');
  const sessionClassDist = countBy(sessionStartedEvents, 'scenario_class');

  // Escalation gate (session-centric)
  const escalationsOffered = (byType['escalation_offered'] || []).length;
  const nextStepConfirmed = (byType['next_step_confirmed'] || []).length;
  const nextStepDeclined = (byType['next_step_declined'] || []).length;
  // Legacy CLI escalation events
  const escalationsAccepted = (byType['escalation_accepted'] || []).length;
  const escalationsDeclined = (byType['escalation_declined'] || []).length;
  const totalConfirmed = nextStepConfirmed + escalationsAccepted;
  const totalDeclined = nextStepDeclined + escalationsDeclined;

  // ---------------------------------------------------------------------------
  // Legacy run funnel (run_started / run_completed from CLI scripts)
  // ---------------------------------------------------------------------------

  const runsStarted = (byType['run_started'] || []).length;
  const runsCompleted = (byType['run_completed'] || []).length;

  // ---------------------------------------------------------------------------
  // Fast Mode outcomes
  // ---------------------------------------------------------------------------

  const fastEvents = byType['fast_completed'] || [];
  const confidenceDist = countBy(fastEvents, 'confidence_band');
  const uxStateDist = countBy(fastEvents, 'ux_state');
  const fastClassDist = countBy(fastEvents, 'scenario_class');
  const needsReviewCount = fastEvents.filter((e) => e.needs_human_review).length;
  const hasPayloadCount = fastEvents.filter((e) => e.has_uncertainty_payload).length;

  // Confidence by class
  const confidenceByClass = {};
  for (const e of fastEvents) {
    const cls = e.scenario_class || 'unclassified';
    if (!confidenceByClass[cls]) confidenceByClass[cls] = {};
    confidenceByClass[cls][e.confidence_band] = (confidenceByClass[cls][e.confidence_band] || 0) + 1;
  }

  // ---------------------------------------------------------------------------
  // Rigor Mode outcomes
  // ---------------------------------------------------------------------------

  const rigorEvents = byType['rigor_completed'] || [];
  const rigorConfDist = countBy(rigorEvents, 'judge_confidence');
  const rigorWinnerDist = countBy(rigorEvents, 'winner');

  // ---------------------------------------------------------------------------
  // Legacy terminal states
  // ---------------------------------------------------------------------------

  const terminalEvents = byType['run_completed'] || [];
  const terminalDist = countBy(terminalEvents, 'terminal_ux_state');
  const terminalSubstateDist = countBy(terminalEvents, 'terminal_ux_substate');

  return {
    total_events: events.length,
    sessions: {
      started: sessionStartedEvents.length,
      completed: sessionCompletedEvents.length,
      failed: sessionFailedEvents.length,
      presented: sessionPresentedEvents.length,
      scenario_class: sessionClassDist,
      completed_ux_state: sessionCompletedUxDist,
      completed_ux_substate: sessionCompletedSubstateDist,
      follow_up_actions: followUpActionDist,
    },
    escalation: {
      offered: escalationsOffered,
      confirmed: totalConfirmed,
      declined: totalDeclined,
      confirmation_rate: escalationsOffered > 0
        ? ((totalConfirmed / escalationsOffered) * 100).toFixed(0) + '%'
        : 'n/a',
    },
    fast: {
      total: fastEvents.length,
      confidence: confidenceDist,
      ux_state: uxStateDist,
      scenario_class: fastClassDist,
      needs_human_review: needsReviewCount,
      has_uncertainty_payload: hasPayloadCount,
      confidence_by_class: confidenceByClass,
    },
    rigor: {
      total: rigorEvents.length,
      judge_confidence: rigorConfDist,
      winner: rigorWinnerDist,
    },
    // Legacy CLI stats — present when run_started / run_completed events exist
    runs: runsStarted + runsCompleted > 0
      ? { started: runsStarted, completed: runsCompleted }
      : null,
    terminal: Object.keys(terminalDist).length > 0
      ? { ux_state: terminalDist, ux_substate: terminalSubstateDist }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Print
// ---------------------------------------------------------------------------

function printStats(stats, totalEvents) {
  const lines = [];

  lines.push('# Shipwright Telemetry Summary');
  lines.push('');
  lines.push(`Total events logged: ${totalEvents}`);

  // Session funnel
  if (stats.sessions.started > 0 || stats.sessions.completed > 0) {
    lines.push('');
    lines.push('## Session Funnel');
    lines.push('');
    lines.push(`Started:   ${stats.sessions.started}`);
    lines.push(`Completed: ${stats.sessions.completed} (${pct(stats.sessions.completed, stats.sessions.started)})`);
    lines.push(`Failed:    ${stats.sessions.failed} (${pct(stats.sessions.failed, stats.sessions.started)})`);
    lines.push(`Presented: ${stats.sessions.presented}`);

    if (Object.keys(stats.sessions.scenario_class).length > 0) {
      lines.push('');
      lines.push('Sessions by scenario class:');
      for (const [cls, count] of sortedEntries(stats.sessions.scenario_class)) {
        lines.push(`  ${cls}: ${count} (${pct(count, stats.sessions.started)})`);
      }
    }

    if (Object.keys(stats.sessions.completed_ux_state).length > 0) {
      const totalCompleted = stats.sessions.completed;
      lines.push('');
      lines.push('Completed session states:');
      for (const [state, count] of sortedEntries(stats.sessions.completed_ux_state)) {
        lines.push(`  ${state}: ${count} (${pct(count, totalCompleted)})`);
      }
    }

    if (Object.keys(stats.sessions.follow_up_actions).length > 0) {
      const totalFollowUps = Object.values(stats.sessions.follow_up_actions).reduce((a, b) => a + b, 0);
      lines.push('');
      lines.push(`Follow-up actions executed: ${totalFollowUps}`);
      for (const [action, count] of sortedEntries(stats.sessions.follow_up_actions)) {
        lines.push(`  ${action}: ${count}`);
      }
    }
  }

  // Escalation gate
  lines.push('');
  lines.push('## Escalation Gate');
  lines.push('');
  lines.push(`Offered:           ${stats.escalation.offered}`);
  lines.push(`Confirmed (rigor): ${stats.escalation.confirmed}`);
  lines.push(`Declined:          ${stats.escalation.declined}`);
  lines.push(`Confirmation rate: ${stats.escalation.confirmation_rate}`);

  // Fast Mode
  if (stats.fast.total > 0) {
    lines.push('');
    lines.push('## Fast Mode');
    lines.push('');
    lines.push(`Analyses run: ${stats.fast.total}`);
    lines.push(`Needs human review: ${stats.fast.needs_human_review}/${stats.fast.total}`);
    lines.push(`Has uncertainty payload: ${stats.fast.has_uncertainty_payload}/${stats.fast.total}`);
    lines.push('');
    lines.push('Confidence distribution:');
    for (const [band, count] of sortedEntries(stats.fast.confidence)) {
      lines.push(`  ${band}: ${count} (${pct(count, stats.fast.total)})`);
    }
    lines.push('');
    lines.push('UX state distribution:');
    for (const [state, count] of sortedEntries(stats.fast.ux_state)) {
      lines.push(`  ${state}: ${count} (${pct(count, stats.fast.total)})`);
    }

    if (Object.keys(stats.fast.confidence_by_class).length > 0) {
      lines.push('');
      lines.push('Confidence by scenario class:');
      for (const [cls, dist] of Object.entries(stats.fast.confidence_by_class)) {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        const parts = Object.entries(dist).map(([b, c]) => `${b}: ${c}`).join(', ');
        lines.push(`  ${cls} (${total}): ${parts}`);
      }
    }
  }

  // Rigor Mode
  if (stats.rigor.total > 0) {
    lines.push('');
    lines.push('## Rigor Mode');
    lines.push('');
    lines.push(`Runs completed: ${stats.rigor.total}`);
    lines.push('');
    lines.push('Judge confidence:');
    for (const [band, count] of sortedEntries(stats.rigor.judge_confidence)) {
      lines.push(`  ${band}: ${count} (${pct(count, stats.rigor.total)})`);
    }
    if (Object.keys(stats.rigor.winner).length > 0) {
      lines.push('');
      lines.push('Winner distribution:');
      for (const [winner, count] of sortedEntries(stats.rigor.winner)) {
        lines.push(`  ${winner}: ${count} (${pct(count, stats.rigor.total)})`);
      }
    }
  }

  // Legacy terminal states (CLI runs)
  if (stats.terminal && Object.keys(stats.terminal.ux_state).length > 0) {
    const totalTerminal = Object.values(stats.terminal.ux_state).reduce((a, b) => a + b, 0);
    lines.push('');
    lines.push('## Terminal States (legacy CLI)');
    lines.push('');
    for (const [state, count] of sortedEntries(stats.terminal.ux_state)) {
      lines.push(`  ${state}: ${count} (${pct(count, totalTerminal)})`);
    }
  }

  // Legacy run funnel
  if (stats.runs) {
    lines.push('');
    lines.push(`Legacy runs started: ${stats.runs.started}  completed: ${stats.runs.completed}`);
  }

  process.stdout.write(lines.join('\n') + '\n');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const k = item[key];
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}

function countBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const k = item[key] ?? 'null';
    result[k] = (result[k] || 0) + 1;
  }
  return result;
}

function sortedEntries(obj) {
  return Object.entries(obj).sort(([, a], [, b]) => b - a);
}

function pct(n, total) {
  if (total === 0) return '—';
  return `${((n / total) * 100).toFixed(0)}%`;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('telemetry.mjs') || process.argv[1].endsWith('telemetry'));

if (isMain) {
  const args = { logPath: DEFAULT_LOG_PATH, format: 'text' };
  for (let i = 2; i < process.argv.length; i += 1) {
    if (process.argv[i] === '--log') { args.logPath = process.argv[i + 1]; i += 1; }
    if (process.argv[i] === '--format') { args.format = process.argv[i + 1]; i += 1; }
  }
  await summary(args);
}
