import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { captureInputs, loadSnapshot, validateSnapshot } from '../scripts/capture-inputs.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shipwright-input-capture-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const options = { requestPath: path.join(root, 'request.txt'), recordPath: path.join(root, 'inputs.json'), directory: path.join(root, 'history'), artifactPath: path.join(root, 'final.md') };
  const input = { id: 'buyers', kind: 'supplied', quote: 'Six bought', value: 6, unit: 'count', population: 'trial prospects', period: { kind: 'window', value: 'last week' }, role: 'purchasers' };
  await writeFile(options.requestPath, 'Six bought last week. Exposure count is unknown.');
  await writeFile(options.recordPath, JSON.stringify({ inputs: [input, { id: 'exposure', kind: 'unknown', quote: 'Exposure count is unknown.' }], behaviors: [] }));
  return { options, input };
}

test('capture preserves exact request and unknowns before designated draft without authentication claim', async t => {
  const { options } = await fixture(t);
  const receipt = await captureInputs(options), history = await loadSnapshot(options.directory);
  assert.equal(receipt.revision, 1);
  assert.equal(history.snapshot.requestText, await readFile(options.requestPath, 'utf8'));
  assert.equal(history.snapshot.inputs[1].kind, 'unknown');
  assert.equal(receipt.snapshotSha256, history.rootSha256);
  assert.equal(receipt.capture.method, 'author-copy');
  assert.equal(receipt.capture.authenticity, 'unverified');
});

test('first capture refuses an existing draft rather than backdating preservation', async t => {
  const { options } = await fixture(t);
  await writeFile(options.artifactPath, 'Already drafted');
  await assert.rejects(captureInputs(options), /must precede/);
});

test('revisions preserve earlier bytes and require reason even after drafting', async t => {
  const { options, input } = await fixture(t);
  const first = await captureInputs(options);
  const old = await readFile(path.join(options.directory, 'snapshot-0001.json'));
  await writeFile(options.artifactPath, 'Draft');
  await writeFile(options.requestPath, 'Six bought last week. There were 30 exposures.');
  await writeFile(options.recordPath, JSON.stringify({ inputs: [input, { id: 'exposure', kind: 'supplied', quote: '30 exposures', value: 30, unit: 'count' }] }));
  await assert.rejects(captureInputs(options), /reason/);
  const second = await captureInputs({ ...options, reason: 'New supplied exposure count' });
  assert.equal(second.revision, 2);
  assert.equal(second.rootSha256, first.rootSha256);
  assert.notEqual(second.snapshotSha256, first.snapshotSha256);
  assert.deepEqual(await readFile(path.join(options.directory, 'snapshot-0001.json')), old);
  await assert.rejects(captureInputs({ ...options, artifactPath: path.join(path.dirname(options.artifactPath), 'different.md'), reason: 'Switch draft' }), /cannot change/);
});

test('history detects changed predecessor and missing revision', async t => {
  const { options } = await fixture(t);
  await captureInputs(options);
  await captureInputs({ ...options, reason: 'Reviewed unchanged extraction' });
  const file = path.join(options.directory, 'snapshot-0001.json');
  const original = await readFile(file, 'utf8');
  await writeFile(file, original.replace('Initial capture before designated draft', 'Edited reason'));
  await assert.rejects(loadSnapshot(options.directory), /history/);
  await writeFile(file, original);
  await rm(file);
  await assert.rejects(loadSnapshot(options.directory), /missing|unexpected/);
});

test('incorrect excerpts, invented unknown values and proposed implementation are rejected', () => {
  const source = { version: 1, requestText: 'Count unknown.', inputs: [{ id: 'x', kind: 'unknown', quote: 'Count unknown.', value: 7 }], behaviors: [] };
  assert.match(validateSnapshot(source).join(' '), /unknown cannot carry/);
  source.inputs = [{ id: 'x', kind: 'supplied', quote: 'Seven buyers' }];
  assert.match(validateSnapshot(source).join(' '), /absent/);
  source.inputs = [];
  source.behaviors = [{ id: 'b', provenance: { origin: 'proposed-requirement' }, guaranteeStatus: 'implemented' }];
  assert.match(validateSnapshot(source).join(' '), /proposal/);
  source.behaviors = [{ id: 'b', provenance: { origin: 'supplied' }, sourceQuote: 'Delivery is immediate.' }];
  assert.match(validateSnapshot(source).join(' '), /absent/);
});

test('an incorrect but internally plausible author extraction remains a disclosed limitation', () => {
  const snapshot = { version: 1, requestText: 'Six buyers.', inputs: [{ id: 'x', kind: 'supplied', quote: 'Six buyers.', value: 60, unit: 'count' }], behaviors: [] };
  assert.deepEqual(validateSnapshot(snapshot), []); // Exact passage presence is not semantic extraction.
});

test('a linked snapshot directory is refused but a linked ancestor is resolved', async t => {
  const { options } = await fixture(t);
  const root = path.dirname(options.directory), type = process.platform === 'win32' ? 'junction' : 'dir';
  const real = path.join(root, 'real-history');
  await mkdir(real);
  await symlink(real, options.directory, type);
  await assert.rejects(captureInputs(options), /must not be a symbolic link/);
  await rm(options.directory, { recursive: true, force: true });
  const realParent = path.join(root, 'real-parent');
  await mkdir(realParent);
  await symlink(realParent, path.join(root, 'alias'), type);
  const receipt = await captureInputs({ ...options, directory: path.join(root, 'alias', 'history') });
  assert.equal(receipt.revision, 1);
});
