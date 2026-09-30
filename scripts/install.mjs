#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { pluginFiles, SOURCE_ROOT } from './build-plugin.mjs';

const hash = data => createHash('sha256').update(data).digest('hex');
async function readOptional(file) {
  try { return await readFile(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function rejectLinks(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing linked installation path: ${current}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

export async function installShipwright(destination, { source = SOURCE_ROOT, apply = false } = {}) {
  const root = await realpath(path.resolve(destination));
  if (root === await realpath(source)) throw new Error('Install into a separate project, not the Shipwright source repository.');
  const files = await pluginFiles(source);
  const targets = new Map();
  for (const host of ['.claude', '.codex']) {
    for (const [relative, data] of files) {
      if (relative.startsWith('.')) continue;
      targets.set(`${host}/${relative}`, data);
    }
  }
  targets.set('.shipwright-source', Buffer.from(path.resolve(source) + '\n'));
  targets.set('shipwright-sync.sh', await readFile(path.join(source, 'scripts/sync.sh')));
  const recordName = '.shipwright-install.json';
  await rejectLinks(root, recordName);
  const priorRaw = await readOptional(path.join(root, recordName));
  const prior = priorRaw ? JSON.parse(priorRaw) : { hashes: {} };
  const ignoreText = (await readOptional(path.join(root, '.shipwright-ignore')))?.toString('utf8') || '';
  const ignorePatterns = ignoreText.split(/\r?\n/).map(line => line.replace(/#.*$/, '').trim()).filter(Boolean)
    .map(pattern => new RegExp('^' + pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'));
  const changes = [], conflicts = [], preserved = [];
  const hashes = { ...prior.hashes };
  for (const [relative, data] of targets) {
    if (ignorePatterns.some(pattern => pattern.test(relative))) { preserved.push(relative); continue; }
    await rejectLinks(root, relative);
    const existing = await readOptional(path.join(root, relative));
    const desiredHash = hash(data);
    if (existing && hash(existing) !== desiredHash && hash(existing) !== prior.hashes?.[relative]) {
      conflicts.push(relative);
      continue;
    }
    if (!existing || hash(existing) !== desiredHash) changes.push(relative);
    hashes[relative] = desiredHash;
  }
  // Retired files are reported, never deleted: local additions and edits remain intact.
  const retired = Object.keys(prior.hashes || {}).filter(relative => !targets.has(relative));
  if (apply && conflicts.length) throw new Error(`Installation conflicts; no files changed. Preserve or relocate these files, or list them in .shipwright-ignore: ${conflicts.join(', ')}`);
  if (apply) {
    for (const relative of changes) {
      await rejectLinks(root, relative);
      const target = path.join(root, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, targets.get(relative));
    }
    await writeFile(path.join(root, recordName), JSON.stringify({ version: 1, source: path.resolve(source), hashes }, null, 2) + '\n');
  }
  return { applied: apply, changes, conflicts, preserved, retired };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const dest = args.find(arg => !arg.startsWith('--')) || process.cwd();
  const result = await installShipwright(dest, { apply: args.includes('--apply') });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.conflicts.length ? 1 : 0;
}
