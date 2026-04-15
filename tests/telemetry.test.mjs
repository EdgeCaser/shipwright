import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { emit, summary } from '../scripts/telemetry.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function readEvents(logPath) {
  const raw = await readFile(logPath, 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function makeLogPath(root) {
  return path.join(root, 'events.jsonl');
}

// ---------------------------------------------------------------------------
// emit
// ---------------------------------------------------------------------------

test('emit writes a JSONL event with event type, timestamp, and fields', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 'sess-001', scenario_class: 'pricing' }, logPath);

    const events = await readEvents(logPath);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, 'session_started');
    assert.equal(events[0].session_id, 'sess-001');
    assert.equal(events[0].scenario_class, 'pricing');
    assert.ok(events[0].timestamp);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('emit appends multiple events in order', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 'sess-001' }, logPath);
    await emit('fast_completed', { session_id: 'sess-001', confidence_band: 'high' }, logPath);
    await emit('session_completed', { session_id: 'sess-001', ux_state: 'provisional' }, logPath);

    const events = await readEvents(logPath);
    assert.equal(events.length, 3);
    assert.equal(events[0].event, 'session_started');
    assert.equal(events[1].event, 'fast_completed');
    assert.equal(events[2].event, 'session_completed');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('emit creates the log directory if it does not exist', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = path.join(root, 'nested', 'deep', 'events.jsonl');
  try {
    await emit('session_started', { session_id: 'sess-001' }, logPath);

    const events = await readEvents(logPath);
    assert.equal(events.length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('emit never throws even on invalid path (fire and forget)', async () => {
  // Pass a path that can't be written (root directory that doesn't exist
  // under a non-writable location). emit should silently swallow the error.
  await assert.doesNotReject(
    () => emit('session_started', {}, '/dev/null/cannot/write/here/events.jsonl'),
  );
});

// ---------------------------------------------------------------------------
// summary — session funnel
// ---------------------------------------------------------------------------

test('summary returns empty stats when no log file exists', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    const stats = await summary({ logPath, format: 'json' });
    assert.deepEqual(stats, {});
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary counts session_started, session_completed, session_failed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 's1', scenario_class: 'pricing' }, logPath);
    await emit('session_started', { session_id: 's2', scenario_class: 'governance' }, logPath);
    await emit('session_completed', { session_id: 's1', ux_state: 'provisional', ux_substate: 'single_run_acceptable' }, logPath);
    await emit('session_failed', { session_id: 's2', mode: 'fast' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.sessions.started, 2);
    assert.equal(stats.sessions.completed, 1);
    assert.equal(stats.sessions.failed, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary tracks session_presented count', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 's1' }, logPath);
    await emit('session_presented', { session_id: 's1', status: 'completed' }, logPath);
    await emit('session_presented', { session_id: 's1', status: 'completed' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.sessions.presented, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary distributes sessions by scenario_class', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 's1', scenario_class: 'pricing' }, logPath);
    await emit('session_started', { session_id: 's2', scenario_class: 'governance' }, logPath);
    await emit('session_started', { session_id: 's3', scenario_class: 'pricing' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.sessions.scenario_class.pricing, 2);
    assert.equal(stats.sessions.scenario_class.governance, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary distributes completed sessions by ux_state', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_completed', { session_id: 's1', ux_state: 'provisional' }, logPath);
    await emit('session_completed', { session_id: 's2', ux_state: 'provisional' }, logPath);
    await emit('session_completed', { session_id: 's3', ux_state: 'not_ready' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.sessions.completed_ux_state.provisional, 2);
    assert.equal(stats.sessions.completed_ux_state.not_ready, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// summary — escalation gate
// ---------------------------------------------------------------------------

test('summary tracks escalation_offered, next_step_confirmed, next_step_declined', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('escalation_offered', { session_id: 's1' }, logPath);
    await emit('escalation_offered', { session_id: 's2' }, logPath);
    await emit('escalation_offered', { session_id: 's3' }, logPath);
    await emit('next_step_confirmed', { session_id: 's1' }, logPath);
    await emit('next_step_declined', { session_id: 's2' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.escalation.offered, 3);
    assert.equal(stats.escalation.confirmed, 1);
    assert.equal(stats.escalation.declined, 1);
    assert.equal(stats.escalation.confirmation_rate, '33%');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary merges legacy escalation_accepted into confirmed count', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('escalation_offered', { session_id: 's1' }, logPath);
    await emit('escalation_offered', { session_id: 's2' }, logPath);
    await emit('next_step_confirmed', { session_id: 's1' }, logPath);
    await emit('escalation_accepted', { session_id: 's2' }, logPath); // legacy

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.escalation.confirmed, 2); // both new + legacy
    assert.equal(stats.escalation.confirmation_rate, '100%');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary reports n/a confirmation_rate when no escalations offered', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 's1' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.escalation.confirmation_rate, 'n/a');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// summary — fast and rigor
// ---------------------------------------------------------------------------

test('summary aggregates fast_completed confidence distribution', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('fast_completed', { session_id: 's1', confidence_band: 'high', needs_human_review: false, has_uncertainty_payload: false }, logPath);
    await emit('fast_completed', { session_id: 's2', confidence_band: 'high', needs_human_review: false, has_uncertainty_payload: false }, logPath);
    await emit('fast_completed', { session_id: 's3', confidence_band: 'medium', needs_human_review: true, has_uncertainty_payload: true }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.fast.total, 3);
    assert.equal(stats.fast.confidence.high, 2);
    assert.equal(stats.fast.confidence.medium, 1);
    assert.equal(stats.fast.needs_human_review, 1);
    assert.equal(stats.fast.has_uncertainty_payload, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary aggregates rigor_completed judge_confidence and winner', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('rigor_completed', { session_id: 's1', judge_confidence: 'high', winner: 'side_a' }, logPath);
    await emit('rigor_completed', { session_id: 's2', judge_confidence: 'medium', winner: 'side_b' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.rigor.total, 2);
    assert.equal(stats.rigor.judge_confidence.high, 1);
    assert.equal(stats.rigor.judge_confidence.medium, 1);
    assert.equal(stats.rigor.winner.side_a, 1);
    assert.equal(stats.rigor.winner.side_b, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// summary — legacy compatibility
// ---------------------------------------------------------------------------

test('summary omits legacy runs section when no run_started or run_completed events', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('session_started', { session_id: 's1' }, logPath);
    const stats = await summary({ logPath, format: 'json' });
    assert.equal(stats.runs, null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary includes legacy runs section when run_started events exist', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  try {
    await emit('run_started', { run_id: 'r1' }, logPath);
    await emit('run_completed', { run_id: 'r1', terminal_ux_state: 'provisional' }, logPath);

    const stats = await summary({ logPath, format: 'json' });
    assert.ok(stats.runs);
    assert.equal(stats.runs.started, 1);
    assert.equal(stats.runs.completed, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// summary — text output (smoke test)
// ---------------------------------------------------------------------------

test('summary text output contains Session Funnel and Escalation Gate headings', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-telemetry-'));
  const logPath = makeLogPath(root);
  // Redirect stdout to capture output
  const lines = [];
  const originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => { lines.push(chunk); return true; };
  try {
    await emit('session_started', { session_id: 's1', scenario_class: 'pricing' }, logPath);
    await emit('session_completed', { session_id: 's1', ux_state: 'provisional' }, logPath);
    await emit('escalation_offered', { session_id: 's1' }, logPath);
    await emit('next_step_declined', { session_id: 's1' }, logPath);

    await summary({ logPath, format: 'text' });
    const output = lines.join('');

    assert.ok(output.includes('Session Funnel'));
    assert.ok(output.includes('Escalation Gate'));
    assert.ok(output.includes('Started:'));
    assert.ok(output.includes('Offered:'));
  } finally {
    process.stdout.write = originalWrite;
    await rm(root, { recursive: true, force: true });
  }
});
