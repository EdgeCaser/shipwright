import { rmSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Each test file runs in its own process; its temporary roots are removed when it exits.
const roots = new Set();
process.once('exit', () => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

export async function temporaryDirectory(prefix) {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  roots.add(root);
  return root;
}
