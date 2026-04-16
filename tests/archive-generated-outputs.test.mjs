import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  archiveGeneratedOutputs,
  parseArgs,
  planArchiveOperations,
} from '../scripts/archive-generated-outputs.mjs';

test('planArchiveOperations includes default generated directories that exist', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-archive-'));
  try {
    await mkdir(path.join(root, 'benchmarks', 'results'), { recursive: true });
    await mkdir(path.join(root, 'benchmarks', 'telemetry'), { recursive: true });

    const operations = await planArchiveOperations({
      cwd: root,
      targetRoot: path.join(root, '..', 'archive-target'),
    });

    assert.equal(operations.length, 2);
    assert.equal(operations[0].relative_source, path.join('benchmarks', 'results'));
    assert.equal(operations[1].relative_source, path.join('benchmarks', 'telemetry'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('archiveGeneratedOutputs moves generated directories to the target root', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-archive-'));
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'sw-archive-target-'));

  try {
    const sourceFile = path.join(root, 'benchmarks', 'results', 'sample', 'result.json');
    await mkdir(path.dirname(sourceFile), { recursive: true });
    await writeFile(sourceFile, '{"ok":true}');

    const result = await archiveGeneratedOutputs({
      cwd: root,
      targetRoot,
      sourcePaths: [path.join('benchmarks', 'results')],
      mode: 'move',
    });

    assert.equal(result.operations.length, 1);
    await assert.rejects(() => readFile(sourceFile, 'utf8'));
    const archived = await readFile(path.join(targetRoot, 'benchmarks', 'results', 'sample', 'result.json'), 'utf8');
    assert.equal(archived, '{"ok":true}');
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(targetRoot, { recursive: true, force: true });
  }
});

test('archiveGeneratedOutputs dry-run reports operations without modifying files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sw-archive-'));
  const targetRoot = await mkdtemp(path.join(os.tmpdir(), 'sw-archive-target-'));

  try {
    const sourceFile = path.join(root, 'benchmarks', 'telemetry', 'events.jsonl');
    await mkdir(path.dirname(sourceFile), { recursive: true });
    await writeFile(sourceFile, 'event');

    const result = await archiveGeneratedOutputs({
      cwd: root,
      targetRoot,
      sourcePaths: [path.join('benchmarks', 'telemetry')],
      mode: 'copy',
      dryRun: true,
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.operations.length, 1);
    const stillThere = await readFile(sourceFile, 'utf8');
    assert.equal(stillThere, 'event');
    await assert.rejects(() => readFile(path.join(targetRoot, 'benchmarks', 'telemetry', 'events.jsonl'), 'utf8'));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(targetRoot, { recursive: true, force: true });
  }
});

test('parseArgs accepts repeated --path values', () => {
  const options = parseArgs([
    '--target-root', 'C:\\shipwright-artifacts',
    '--mode', 'copy',
    '--path', 'benchmarks/results',
    '--path', 'benchmarks/telemetry',
    '--dry-run',
  ]);

  assert.equal(options.targetRoot, 'C:\\shipwright-artifacts');
  assert.equal(options.mode, 'copy');
  assert.equal(options.dryRun, true);
  assert.deepEqual(options.sourcePaths, ['benchmarks/results', 'benchmarks/telemetry']);
});
