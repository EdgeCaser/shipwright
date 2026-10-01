import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

test('public CLI help contains no em dash', { concurrency: false }, () => {
  const result = spawnSync(process.execPath, [path.resolve('scripts/shipwright.mjs'), '--help'], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, /—/u);
});
