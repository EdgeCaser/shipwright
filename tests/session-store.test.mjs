import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  createSession,
  getSession,
  updateSession,
  appendSessionEvent,
  getSessionEvents,
  linkArtifact,
  getSessionDirectory,
} from '../scripts/session-store.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function minimalInput(overrides = {}) {
  return {
    question: 'Should we raise prices now?',
    scenario_id: 'test-pricing',
    scenario_class: 'pricing',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createSession
// ---------------------------------------------------------------------------

test('createSession writes a session record with required fields', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });

    assert.ok(typeof session.session_id === 'string' && session.session_id.length > 0);
    assert.equal(session.question, 'Should we raise prices now?');
    assert.equal(session.scenario_id, 'test-pricing');
    assert.equal(session.scenario_class, 'pricing');
    assert.equal(session.stage, 'pre_run');
    assert.equal(session.status, 'running');
    assert.ok(session.created_at);
    assert.ok(session.updated_at);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession accepts an explicit session_id', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({
      ...minimalInput(),
      session_id: 'explicit-id-123',
      sessions_root: root,
    });

    assert.equal(session.session_id, 'explicit-id-123');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession uses provided status, stage, and ux_state', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({
      ...minimalInput(),
      status: 'awaiting_user_action',
      stage: 'post_single',
      ux_state: 'provisional',
      ux_substate: 'single_run_acceptable',
      sessions_root: root,
    });

    assert.equal(session.status, 'awaiting_user_action');
    assert.equal(session.stage, 'post_single');
    assert.equal(session.ux_state, 'provisional');
    assert.equal(session.ux_substate, 'single_run_acceptable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession appends a session_created event automatically', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    const events = await getSessionEvents(session.session_id, root);

    assert.ok(events.length >= 1);
    assert.equal(events[0].type, 'session_created');
    assert.equal(events[0].session_id, session.session_id);
    assert.equal(events[0].scenario_id, 'test-pricing');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession throws when question is missing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    await assert.rejects(
      () => createSession({ scenario_id: 'x', scenario_class: 'pricing', sessions_root: root }),
      /question is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession throws when scenario_id is missing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    await assert.rejects(
      () => createSession({ question: 'Q?', scenario_class: 'pricing', sessions_root: root }),
      /scenario_id is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('createSession throws when scenario_class is missing', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    await assert.rejects(
      () => createSession({ question: 'Q?', scenario_id: 'x', sessions_root: root }),
      /scenario_class is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// getSession
// ---------------------------------------------------------------------------

test('getSession returns the persisted session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const created = await createSession({ ...minimalInput(), sessions_root: root });
    const loaded = await getSession(created.session_id, root);

    assert.equal(loaded.session_id, created.session_id);
    assert.equal(loaded.question, created.question);
    assert.equal(loaded.scenario_class, created.scenario_class);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('getSession throws when session does not exist', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    await assert.rejects(
      () => getSession('nonexistent-session-id', root),
      /Session not found/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('getSession throws when sessionId is empty', async () => {
  await assert.rejects(
    () => getSession(''),
    /sessionId is required/,
  );
});

// ---------------------------------------------------------------------------
// updateSession
// ---------------------------------------------------------------------------

test('updateSession merges a patch and updates updated_at', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    const before = session.updated_at;

    // Small delay to ensure updated_at changes
    await new Promise((r) => setTimeout(r, 5));

    const updated = await updateSession(session.session_id, {
      status: 'completed',
      ux_state: 'provisional',
    }, root);

    assert.equal(updated.status, 'completed');
    assert.equal(updated.ux_state, 'provisional');
    assert.notEqual(updated.updated_at, before);
    // Original fields preserved
    assert.equal(updated.question, session.question);
    assert.equal(updated.scenario_class, session.scenario_class);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('updateSession deep-merges the artifacts object', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    await updateSession(session.session_id, { artifacts: { analysis_json: '/path/analysis.json' } }, root);
    const updated = await updateSession(session.session_id, { artifacts: { run_json: '/path/run.json' } }, root);

    assert.equal(updated.artifacts.analysis_json, '/path/analysis.json');
    assert.equal(updated.artifacts.run_json, '/path/run.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('updateSession throws when patch is not an object', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    await assert.rejects(
      () => updateSession(session.session_id, 'bad patch', root),
      /patch must be an object/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// appendSessionEvent / getSessionEvents
// ---------------------------------------------------------------------------

test('appendSessionEvent appends events that getSessionEvents can read', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });

    await appendSessionEvent(session.session_id, { type: 'fast_started', run_id: 'run-001' }, root);
    await appendSessionEvent(session.session_id, { type: 'fast_completed', confidence_band: 'high' }, root);

    const events = await getSessionEvents(session.session_id, root);

    // session_created from createSession + 2 new events
    assert.ok(events.length >= 3);
    const types = events.map((e) => e.type);
    assert.ok(types.includes('fast_started'));
    assert.ok(types.includes('fast_completed'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('appendSessionEvent includes session_id on every event', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    const record = await appendSessionEvent(session.session_id, { type: 'test_event' }, root);

    assert.equal(record.session_id, session.session_id);
    assert.ok(record.timestamp);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('getSessionEvents returns empty array when no events file exists', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    // Call with a session id that has no directory at all
    const events = await getSessionEvents('no-such-session', root);
    assert.deepEqual(events, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('appendSessionEvent throws when event is not an object', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    await assert.rejects(
      () => appendSessionEvent(session.session_id, 'not-an-object', root),
      /event must be an object/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// linkArtifact
// ---------------------------------------------------------------------------

test('linkArtifact stores an artifact reference on the session', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    const updated = await linkArtifact(session.session_id, 'analysis_json', '/tmp/analysis.json', root);

    assert.equal(updated.artifacts.analysis_json, '/tmp/analysis.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('linkArtifact overwrites a previously linked artifact of the same type', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-store-'));
  try {
    const session = await createSession({ ...minimalInput(), sessions_root: root });
    await linkArtifact(session.session_id, 'analysis_json', '/old/path.json', root);
    const updated = await linkArtifact(session.session_id, 'analysis_json', '/new/path.json', root);

    assert.equal(updated.artifacts.analysis_json, '/new/path.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// getSessionDirectory
// ---------------------------------------------------------------------------

test('getSessionDirectory returns the expected path', () => {
  const dir = getSessionDirectory('sess-abc-123', '/custom/root');
  assert.ok(dir.endsWith(path.join('sess-abc-123')));
  assert.ok(dir.includes('custom'));
  assert.ok(dir.includes('root'));
});
