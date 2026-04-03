import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildParallelVarianceReport,
  classifyVariance,
  computeTokenJaccard,
  createShellSessionRunner,
  loadPromptSource,
  normalizeResponseText,
  parseCliArgs,
  runParallelVariance,
} from '../scripts/run-parallel-variance.mjs';

test('normalizeResponseText trims and collapses excessive whitespace', () => {
  assert.equal(
    normalizeResponseText(' Hello   world \n\n\nSecond line\t\t\n'),
    'Hello world\n\nSecond line',
  );
});

test('computeTokenJaccard returns 1 for equivalent normalized text', () => {
  assert.equal(
    computeTokenJaccard('Ship it now.', ' ship   it now '),
    1,
  );
});

test('classifyVariance returns stable for identical outputs', () => {
  assert.equal(
    classifyVariance({
      failedSessionCount: 0,
      uniqueResponseCount: 1,
      minSimilarity: 1,
      minWordCount: 100,
      maxWordCount: 100,
    }),
    'stable',
  );
});

test('classifyVariance returns moderate_drift for bounded differences', () => {
  assert.equal(
    classifyVariance({
      failedSessionCount: 0,
      uniqueResponseCount: 2,
      minSimilarity: 0.72,
      minWordCount: 100,
      maxWordCount: 145,
    }),
    'moderate_drift',
  );
});

test('classifyVariance returns high_drift for materially different outputs', () => {
  assert.equal(
    classifyVariance({
      failedSessionCount: 0,
      uniqueResponseCount: 2,
      minSimilarity: 0.34,
      minWordCount: 100,
      maxWordCount: 250,
    }),
    'high_drift',
  );
});

test('classifyVariance returns execution_error when any session fails', () => {
  assert.equal(
    classifyVariance({
      failedSessionCount: 1,
      uniqueResponseCount: 2,
      minSimilarity: 0.9,
      minWordCount: 100,
      maxWordCount: 100,
    }),
    'execution_error',
  );
});

test('loadPromptSource loads benchmark scenario prompts by id', async () => {
  // Integration-style coverage: this expects the canonical scenario fixture to exist on disk.
  const promptSource = await loadPromptSource({
    scenario: 'event-automation-boundary',
  });

  assert.equal(promptSource.type, 'benchmark-scenario');
  assert.equal(promptSource.scenario_id, 'event-automation-boundary');
  assert.match(promptSource.prompt, /Phase 1 PRD/);
});

test('parseCliArgs validates supported formats and thresholds', () => {
  assert.deepEqual(
    parseCliArgs([
      '--prompt',
      'Hello',
      '--command',
      'claude -p',
      '--count',
      '3',
      '--format',
      'json',
      '--max-variance',
      'moderate_drift',
    ]),
    {
      prompt: 'Hello',
      promptFile: '',
      scenario: '',
      scenarioDir: path.resolve('benchmarks', 'scenarios'),
      command: 'claude -p',
      count: 3,
      timeoutMs: 120000,
      format: 'json',
      outPath: null,
      cwd: process.cwd(),
      runId: null,
      maxVariance: 'moderate_drift',
    },
  );
});

test('buildParallelVarianceReport summarizes identical sessions as stable', () => {
  const report = buildParallelVarianceReport({
    command: 'claude -p',
    promptSource: {
      type: 'prompt',
      label: 'inline-prompt',
      prompt: 'What is the recommendation?',
    },
    sessions: [
      {
        sessionId: 'session-1',
        exitCode: 0,
        durationMs: 50,
        stdout: 'Recommendation: ship it now.',
        stderr: '',
      },
      {
        sessionId: 'session-2',
        exitCode: 0,
        durationMs: 60,
        stdout: 'Recommendation: ship it now.',
        stderr: '',
      },
    ],
  });

  assert.equal(report.aggregate.variance_level, 'stable');
  assert.equal(report.aggregate.unique_response_count, 1);
  assert.equal(report.aggregate.pairwise_similarity.min, 1);
});

test('runParallelVariance uses the provided sessionRunner and writes output', async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-parallel-variance-'));
  try {
    const outPath = path.join(rootDir, 'report.json');
    const calls = [];

    const report = await runParallelVariance({
      prompt: 'Should we ship?',
      command: 'fake-claude',
      count: 3,
      outPath,
      sessionRunner: async (options) => {
        calls.push(options.sessionId);
        return {
          sessionId: options.sessionId,
          exitCode: 0,
          durationMs: 25,
          stdout: options.sessionId === 'session-3' ? 'Recommendation: wait.' : 'Recommendation: ship.',
          stderr: '',
        };
      },
    });

    const written = JSON.parse(await readFile(outPath, 'utf8'));
    assert.deepEqual(calls, ['session-1', 'session-2', 'session-3']);
    assert.equal(report.sessions.length, 3);
    assert.equal(written.sessions.length, 3);
    assert.equal(report.aggregate.variance_level, 'high_drift');
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('runParallelVariance enforces max variance thresholds', async () => {
  await assert.rejects(
    runParallelVariance({
      prompt: 'Should we ship?',
      command: 'fake-claude',
      count: 2,
      maxVariance: 'moderate_drift',
      sessionRunner: async (options) => ({
        sessionId: options.sessionId,
        exitCode: 0,
        durationMs: 10,
        stdout:
          options.sessionId === 'session-1'
            ? 'Recommendation: ship immediately with broad scope.'
            : 'Recommendation: do not proceed until next quarter and cut the scope in half.',
        stderr: '',
      }),
    }),
    /Variance level high_drift exceeded --max-variance moderate_drift/,
  );
});

test('createShellSessionRunner supports prompt-file placeholders', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-parallel-shell-'));
  try {
    const promptFilePath = path.join(tempDir, 'prompt.txt');
    await writeFile(promptFilePath, 'hello from prompt file', 'utf8');

    const runner = createShellSessionRunner();
    const result = await runner({
      sessionId: 'session-1',
      command: 'cat {{prompt_file}}',
      prompt: 'ignored stdin payload',
      promptFilePath,
      timeoutMs: 1000,
      cwd: process.cwd(),
      runId: 'run-1',
      promptSource: { scenario_id: null },
      sessionCount: 2,
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout, 'hello from prompt file');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
