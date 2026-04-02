import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const CANONICAL_COLLECTOR = path.join(ROOT, 'scripts/collect-research.mjs');
const FALLBACK_COLLECTORS = [
  path.join(ROOT, '.claude/scripts/collect-research.mjs'),
  path.join(ROOT, '.codex/scripts/collect-research.mjs'),
];

test('fallback collect-research copies stay in sync with the canonical repo collector', { concurrency: false }, async () => {
  const canonical = await readFile(CANONICAL_COLLECTOR, 'utf8');

  for (const fallbackPath of FALLBACK_COLLECTORS) {
    const fallback = await readFile(fallbackPath, 'utf8');
    assert.equal(
      fallback,
      canonical,
      `${path.relative(ROOT, fallbackPath)} drifted from scripts/collect-research.mjs`,
    );
  }
});
