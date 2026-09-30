import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pluginFiles, SOURCE_ROOT } from '../scripts/build-plugin.mjs';

// Check the actual distributable, not ignored local installs that may be older.
test('release collector and adapters match their canonical sources', async () => {
  const files = await pluginFiles();
  for (const name of ['collect-research', 'source-adapters']) {
    const file = `scripts/${name}.mjs`;
    assert.equal(files.get(file)?.toString('utf8'), await readFile(path.join(SOURCE_ROOT, file), 'utf8'));
  }
});
