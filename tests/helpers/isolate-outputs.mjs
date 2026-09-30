import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after } from 'node:test';

// Load before the production modules: every test process owns disposable outputs.
const root = mkdtempSync(path.join(tmpdir(), 'shipwright-test-outputs-'));
process.env.SHIPWRIGHT_OUTPUT_ROOT = root;
after(() => rmSync(root, { recursive: true, force: true }));
