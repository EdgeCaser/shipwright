import './helpers/isolate-outputs.mjs';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { executeFastAnalysisForSession } from '../scripts/decision-execution.mjs';
import { startDecisionSession, runFollowUpAction, retrySessionStep } from '../scripts/decision-session-controller.mjs';
import { createSession, getSession, updateSession, appendSessionEvent, getSessionEvents, getSessionDirectory } from '../scripts/session-store.mjs';

async function temporary(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shipwright-redline-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('scenario IDs remain metadata and cannot overwrite or delete a sibling file', async t => {
  const root = await temporary(t);
  const victim = path.join(root, 'victim.json');
  await writeFile(victim, 'SENTINEL');
  for (const scenario_id of ['../' + path.basename(root) + '/victim',
    '..\\' + path.basename(root) + '\\victim']) {
    let called = false;
    await assert.rejects(executeFastAnalysisForSession({ scenario_id, question: 'Synthetic decision?' }, {
      outDir: path.join(root, 'runs'),
      turnRunner: async () => {
        called = true;
        assert.equal(await readFile(victim, 'utf8'), 'SENTINEL');
        throw new Error('stop synthetic run');
      },
    }), /stop synthetic run/);
    assert.equal(called, true);
    assert.equal(await readFile(victim, 'utf8'), 'SENTINEL');
  }
});

test('all session-store paths reject unsafe IDs before creating or changing files', async t => {
  const root = await temporary(t);
  const sessions = path.join(root, 'sessions');
  await mkdir(sessions);
  const input = { question: 'Synthetic?', scenario_id: 'example', scenario_class: 'pricing', sessions_root: sessions };
  for (const id of ['../escaped', '..\\escaped', '/absolute', 'C:\\absolute', 'C:relative', '.', '..', 'CON', 'NUL', 'name:stream', 'trailing.']) {
    assert.throws(() => getSessionDirectory(id, sessions), /safe directory name/);
    await assert.rejects(createSession({ ...input, session_id: id }), /safe directory name/);
    await assert.rejects(getSession(id, sessions), /safe directory name/);
    await assert.rejects(updateSession(id, {}, sessions), /safe directory name/);
    await assert.rejects(appendSessionEvent(id, {}, sessions), /safe directory name/);
    await assert.rejects(getSessionEvents(id, sessions), /safe directory name/);
  }
  assert.deepEqual(await readdir(sessions), []);
  assert.deepEqual(await readdir(root), ['sessions']);
  await createSession({ ...input, session_id: 'safe-id' });
  const updated = await updateSession('safe-id', { session_id: '../escaped' }, sessions);
  assert.equal(updated.session_id, 'safe-id');
});

test('successive evidence additions preserve original scenario and context with human-review state', async t => {
  const root = await temporary(t);
  const scenarioPath = path.join(root, 'scenario.json');
  await writeFile(path.join(root, 'context.md'), 'ORIGINAL_CONTEXT: outstanding debt');
  await writeFile(scenarioPath, JSON.stringify({ id: 'evidence-case', inputs: {
    prompt: 'ORIGINAL_PACKET: decide under the existing constraints', context_files: ['context.md'],
  } }));
  const prompts = [];
  const runner = async ({ runId, prompt }) => {
    prompts.push(prompt);
    return { stdout: JSON.stringify({
      run_id: runId, scenario_id: 'evidence-case', recommendation: 'Wait for human review.',
      confidence_band: 'medium', needs_human_review: true, summary: 'Evidence remains incomplete.',
      key_reasoning: ['Original constraints still apply.', 'New evidence needs verification.'],
      uncertainty_payload: { uncertainty_drivers: ['Missing approval.'],
        disambiguation_questions: ['Has the owner approved?'], needed_evidence: ['Owner decision.'],
        recommended_next_action: 'Request human review.' },
    }) };
  };
  let result = await startDecisionSession({ question: 'Should we proceed?', scenario_id: 'evidence-case',
    scenario_class: 'pricing', scenario_path: scenarioPath, sessions_root: root, fast_turn_runner: runner });
  assert.equal(result.session.status, 'completed');
  for (const additional_evidence of ['FIRST_ADDITION', 'SECOND_ADDITION']) {
    result = await runFollowUpAction(result.session.session_id, 'gather_more_evidence', {
      sessions_root: root, additional_evidence, fast_turn_runner: runner,
    });
    assert.equal(result.session.ux_state, 'not_ready');
    assert.equal(result.session.status, 'completed');
  }
  assert.equal(prompts.length, 3);
  for (const prompt of prompts) {
    assert.match(prompt, /ORIGINAL_PACKET/);
    assert.match(prompt, /ORIGINAL_CONTEXT/);
  }
  assert.match(prompts[1], /FIRST_ADDITION/);
  assert.match(prompts[2], /FIRST_ADDITION/);
  assert.match(prompts[2], /SECOND_ADDITION/);
  assert.deepEqual(result.session.evidence_history, ['FIRST_ADDITION', 'SECOND_ADDITION']);
  const failed = await runFollowUpAction(result.session.session_id, 'gather_more_evidence', {
    sessions_root: root, additional_evidence: 'FAILED_ADDITION',
    fast_turn_runner: async ({ prompt }) => {
      assert.match(prompt, /FAILED_ADDITION/);
      throw new Error('Synthetic transient failure');
    },
  });
  assert.equal(failed.session.status, 'failed');
  assert.equal(failed.session.pending_follow_up.additional_evidence, 'FAILED_ADDITION');
  const retried = await retrySessionStep(failed.session.session_id, { sessions_root: root, fast_turn_runner: runner });
  assert.equal(retried.session.status, 'completed');
  assert.equal(retried.session.ux_state, 'not_ready');
  for (const marker of ['ORIGINAL_PACKET', 'ORIGINAL_CONTEXT', 'FIRST_ADDITION', 'SECOND_ADDITION', 'FAILED_ADDITION']) {
    assert.ok(prompts.at(-1).includes(marker), marker);
  }
  assert.deepEqual(retried.session.evidence_history, ['FIRST_ADDITION', 'SECOND_ADDITION', 'FAILED_ADDITION']);
  assert.equal(retried.session.pending_follow_up, null);
});

test('session-driven runs remove their temporary scenario directory after failure', async t => {
  const root = await temporary(t);
  const saved = { TEMP: process.env.TEMP, TMP: process.env.TMP, TMPDIR: process.env.TMPDIR };
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  const isolated = path.join(root, 'tmp');
  await mkdir(isolated);
  process.env.TEMP = process.env.TMP = process.env.TMPDIR = isolated;
  assert.equal(os.tmpdir(), isolated);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await assert.rejects(executeFastAnalysisForSession({ scenario_id: 'leak-check', question: 'Synthetic decision?' }, {
      outDir: path.join(root, 'runs'),
      turnRunner: async () => { throw new Error('stop synthetic run'); },
    }), /stop synthetic run/);
  }
  assert.deepEqual((await readdir(isolated)).filter(name => name.startsWith('shipwright-session-')), []);
});
