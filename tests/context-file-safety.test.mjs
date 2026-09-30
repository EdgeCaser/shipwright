import './helpers/isolate-outputs.mjs';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { runFastAnalysis } from '../scripts/run-fast-analysis.mjs';
import { handleDecisionSessionRequest } from '../scripts/decision-session-service.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-context-safe-'));
  const scenarioDir = path.join(root, 'scenarios');
  await mkdir(scenarioDir);
  const scenarioPath = path.join(scenarioDir, 'case.json');
  const outsidePath = path.join(root, 'outside.txt');
  await writeFile(outsidePath, 'outside fixture', 'utf8');
  return {
    root,
    scenarioDir,
    scenarioPath,
    outsidePath,
    async scenario(contextFiles) {
      await writeFile(scenarioPath, JSON.stringify({
        id: 'context-case',
        inputs: { prompt: 'Evaluate this synthetic case.', context_files: contextFiles },
      }), 'utf8');
    },
    async cleanup() { await rm(root, { recursive: true, force: true }); },
  };
}

async function runWithFakeRunner(f, runId = 'context-test') {
  let calls = 0;
  let seenPrompt = '';
  const run = () => runFastAnalysis({
    scenario: f.scenarioPath,
    outDir: path.join(f.root, 'out'),
    runId,
    agentId: 'claude',
    turnRunner: async ({ prompt, runId: actualRunId }) => {
      calls += 1;
      seenPrompt = prompt;
      return { exitCode: 0, stdout: JSON.stringify({
        run_id: actualRunId,
        scenario_id: 'context-case',
        recommendation: 'Proceed with the synthetic case.',
        confidence_band: 'high',
        needs_human_review: false,
        summary: 'Synthetic evidence is sufficient for this test.',
        key_reasoning: ['The input is synthetic.', 'The test runner is injected.'],
      }) };
    },
  });
  return { run, calls: () => calls, prompt: () => seenPrompt };
}

test('context traversal, absolute paths, missing files, and secret names fail before the runner', async () => {
  const f = await fixture();
  try {
    await writeFile(path.join(f.scenarioDir, '.env'), 'SYNTHETIC_SECRET=fixture', 'utf8');
    await writeFile(path.join(f.scenarioDir, '.env.production'), 'SYNTHETIC_SECRET=fixture', 'utf8');
    await writeFile(path.join(f.scenarioDir, 'credentials.json'), '{}', 'utf8');
    await mkdir(path.join(f.scenarioDir, 'directory'));
    for (const [file, message] of [
      ['../outside.txt', /leaves the scenario directory/],
      [f.outsidePath, /Absolute context path/],
      ['missing.txt', /Context file not found/],
      ['.env', /Secret-file input/],
      ['.env.production', /Secret-file input/],
      ['credentials.json', /Secret-file input/],
      ['directory', /not a regular file/],
    ]) {
      await f.scenario([file]);
      const fake = await runWithFakeRunner(f, `case-${path.basename(file).replace(/[^a-z0-9]/gi, '-')}`);
      await assert.rejects(fake.run(), message);
      assert.equal(fake.calls(), 0, `Runner was called for ${file}`);
    }
  } finally {
    await f.cleanup();
  }
});

test('relative scenario paths cannot traverse the configured scenario directory', async () => {
  const f = await fixture();
  try {
    await writeFile(path.join(f.root, 'outside.json'), JSON.stringify({
      id: 'outside', inputs: { prompt: 'Synthetic only.' },
    }), 'utf8');
    let calls = 0;
    await assert.rejects(runFastAnalysis({
      scenario: '../outside.json',
      scenarioDir: f.scenarioDir,
      outDir: path.join(f.root, 'out'),
      turnRunner: async () => { calls += 1; throw new Error('Runner should not start'); },
    }), /Scenario path leaves the scenario directory/);
    assert.equal(calls, 0);
  } finally {
    await f.cleanup();
  }
});

test('realpath-linked context escape fails before the runner', async t => {
  const f = await fixture();
  try {
    const outsideDir = path.join(f.root, 'outside-dir');
    await mkdir(outsideDir);
    await writeFile(path.join(outsideDir, 'outside.txt'), 'outside fixture', 'utf8');
    try {
      await symlink(outsideDir, path.join(f.scenarioDir, 'linked-dir'), 'junction');
    } catch (error) {
      if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error?.code)) {
        t.skip(`Directory junctions unavailable: ${error.code}`);
        return;
      }
      throw error;
    }
    await f.scenario(['linked-dir/outside.txt']);
    const fake = await runWithFakeRunner(f);
    await assert.rejects(fake.run(), /leaves the scenario directory/);
    assert.equal(fake.calls(), 0);
  } finally {
    await f.cleanup();
  }
});

test('safe relative context reaches the injected runner', async () => {
  const f = await fixture();
  try {
    await writeFile(path.join(f.scenarioDir, 'notes.txt'), 'Synthetic context only.', 'utf8');
    await f.scenario(['notes.txt']);
    const fake = await runWithFakeRunner(f);
    const result = await fake.run();
    assert.equal(fake.calls(), 1);
    assert.match(fake.prompt(), /Synthetic context only/);
    assert.equal(result.run.status, 'completed');
  } finally {
    await f.cleanup();
  }
});

test('session service scenario_path cannot pass escaping context to its runner', async () => {
  const f = await fixture();
  try {
    await f.scenario(['../outside.txt']);
    let calls = 0;
    const response = await handleDecisionSessionRequest({
      method: 'POST',
      path: '/decision-sessions',
      body: {
        question: 'Should we proceed with this synthetic case?',
        scenario_class: 'product_strategy',
        scenario_path: f.scenarioPath,
        available_providers: ['claude'],
        fast_out_dir: path.join(f.root, 'out'),
        fast_turn_runner: async () => { calls += 1; throw new Error('Runner should not start'); },
      },
    }, { sessions_root: path.join(f.root, 'sessions') });
    assert.equal(calls, 0);
    assert.equal(response.data?.session?.status, 'failed');
  } finally {
    await f.cleanup();
  }
});
