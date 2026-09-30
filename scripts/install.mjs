#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat, realpath, readdir, rm, rmdir } from 'node:fs/promises';
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

export const BLOCK_BEGIN = '<!-- shipwright:begin -->';
export const BLOCK_END = '<!-- shipwright:end -->';
// Host instruction files that carry the managed block, with the host directory each one points at.
const HOST_BLOCKS = [['AGENTS.md', '.codex'], ['CLAUDE.md', '.claude']];

export function managedBlock(template, hostDir) {
  const body = template.toString('utf8').replace(/\r\n/g, '\n').replace(/\{\{HOST_DIR\}\}/g, hostDir).trim();
  return [BLOCK_BEGIN, '<!-- Managed by Shipwright install. Edits inside this block are replaced on the next install. -->', body, BLOCK_END].join('\n');
}

// Replaces an existing managed block in place, or appends one. Content outside the block is never touched.
export function applyManagedBlock(existing, block) {
  if (existing === null || existing === '') return block + '\n';
  const begin = existing.indexOf(BLOCK_BEGIN);
  const end = existing.indexOf(BLOCK_END);
  if (begin === -1 && end === -1) return existing + (existing.endsWith('\n') ? '\n' : '\n\n') + block + '\n';
  if (begin === -1 || end < begin || existing.indexOf(BLOCK_BEGIN, begin + 1) !== -1) {
    throw new Error('Malformed Shipwright block markers; fix or remove them and re-run the install.');
  }
  return existing.slice(0, begin) + block + existing.slice(end + BLOCK_END.length);
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
  const template = files.get('docs/host-instructions.md');
  if (!template) throw new Error('Package is missing docs/host-instructions.md.');
  const blockWrites = new Map();
  const blocks = { ...(prior.blocks || {}) };
  for (const [relative, hostDir] of HOST_BLOCKS) {
    if (ignorePatterns.some(pattern => pattern.test(relative))) { preserved.push(relative); continue; }
    await rejectLinks(root, relative);
    const raw = await readOptional(path.join(root, relative));
    const before = raw === null ? null : raw.toString('utf8');
    const after = applyManagedBlock(before, managedBlock(template, hostDir));
    if (!blocks[relative]) {
      // Remembers whether the installer created this file and what it appended, so uninstall can reverse it exactly.
      const hasMarkers = before !== null && before.includes(BLOCK_BEGIN);
      if (!hasMarkers) blocks[relative] = { created: before === null, added: !before ? '' : (before.endsWith('\n') ? '\n' : '\n\n') };
    }
    if (after !== before) { changes.push(relative); blockWrites.set(relative, after); }
  }
  // Retired files are reported, never deleted: local additions and edits remain intact.
  const retired = Object.keys(prior.hashes || {}).filter(relative => !targets.has(relative));
  if (apply && conflicts.length) throw new Error(`Installation conflicts; no files changed. Preserve or relocate these files, or list them in .shipwright-ignore: ${conflicts.join(', ')}`);
  if (apply) {
    const dirs = new Set(prior.dirs || []);
    for (const relative of changes) {
      await rejectLinks(root, relative);
      const target = path.join(root, relative);
      for (let dir = path.dirname(target); dir !== root; dir = path.dirname(dir)) {
        if (await lstat(dir).then(() => true, () => false)) break;
        dirs.add(path.relative(root, dir).split(path.sep).join('/'));
      }
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, blockWrites.has(relative) ? blockWrites.get(relative) : targets.get(relative));
    }
    await writeFile(path.join(root, recordName), JSON.stringify({ version: 1, source: path.resolve(source), hashes, dirs: [...dirs].sort(), blocks }, null, 2) + '\n');
  }
  return { applied: apply, changes, conflicts, preserved, retired };
}

const RECORD_NAME = '.shipwright-install.json';

// Removes a managed block and reverses the separator the installer added. Returns null when no block is present.
export function removeManagedBlock(text, info) {
  const begin = text.indexOf(BLOCK_BEGIN);
  const end = text.indexOf(BLOCK_END);
  if (begin === -1 && end === -1) return null;
  if (begin === -1 || end < begin || text.indexOf(BLOCK_BEGIN, begin + 1) !== -1) {
    throw new Error('Malformed Shipwright block markers; fix or remove them and re-run the uninstall.');
  }
  const before = text.slice(0, begin);
  const after = text.slice(end + BLOCK_END.length);
  if (after === '\n' && typeof info?.added === 'string' && before.endsWith(info.added)) {
    return before.slice(0, before.length - info.added.length);
  }
  return before + after;
}

export async function uninstallShipwright(destination, { source = SOURCE_ROOT, apply = false } = {}) {
  const root = await realpath(path.resolve(destination));
  if (root === await realpath(source)) throw new Error('Uninstall from the target project, not the Shipwright source repository.');
  await rejectLinks(root, RECORD_NAME);
  const raw = await readOptional(path.join(root, RECORD_NAME));
  if (!raw) throw new Error(`No Shipwright install record found in ${root}. Nothing to uninstall.`);
  let record;
  try { record = JSON.parse(raw); } catch { throw new Error(`The install record in ${root} is not valid JSON. Nothing was removed.`); }
  if (!record || typeof record !== 'object') throw new Error('The install record is malformed. Nothing was removed.');
  const hashes = record.hashes && typeof record.hashes === 'object' ? record.hashes : {};
  const inside = relative => {
    if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..')) return null;
    const full = path.resolve(root, relative);
    const rel = path.relative(root, full);
    return rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? full : null;
  };
  const safe = async relative => {
    const full = inside(relative);
    if (!full) return null;
    try { await rejectLinks(root, relative); } catch { return null; }
    return full;
  };
  const removed = [], kept = [], refused = [], blocksRemoved = [], dirsRemoved = [];
  const removeSet = new Set();
  for (const [relative, expected] of Object.entries(hashes)) {
    const full = await safe(relative);
    if (!full) { refused.push(relative); continue; }
    const existing = await readOptional(full).catch(() => null);
    if (existing === null) continue;
    if (typeof expected !== 'string') { kept.push({ path: relative, reason: 'unverifiable, no recorded hash' }); continue; }
    if (hash(existing) !== expected) { kept.push({ path: relative, reason: 'modified since install' }); continue; }
    removed.push(relative);
    removeSet.add(full);
  }
  const blockPlans = [];
  for (const [relative] of HOST_BLOCKS) {
    const full = await safe(relative);
    if (!full) { refused.push(relative); continue; }
    const existing = await readOptional(full);
    if (existing === null) continue;
    const info = record.blocks?.[relative];
    const text = removeManagedBlock(existing.toString('utf8'), info);
    if (text === null) continue;
    blocksRemoved.push(relative);
    blockPlans.push({ full, text, deleteFile: text === '' && info?.created === true });
  }
  // Directories: those the installer created (older records: parents of removed files), removed only if nothing else is left in them.
  const candidates = new Set();
  if (Array.isArray(record.dirs)) {
    for (const relative of record.dirs) { if (await safe(relative)) candidates.add(relative); else refused.push(relative); }
  } else {
    for (const relative of removed) {
      for (let dir = path.posix.dirname(relative); dir !== '.'; dir = path.posix.dirname(dir)) candidates.add(dir);
    }
  }
  const dirOrder = [...candidates].sort((a, b) => b.split('/').length - a.split('/').length);
  for (const relative of dirOrder) {
    const full = path.resolve(root, relative);
    let entries;
    try { entries = await readdir(full); } catch { continue; }
    if (entries.every(name => removeSet.has(path.join(full, name)))) {
      dirsRemoved.push(relative);
      removeSet.add(full);
    }
  }
  if (apply) {
    for (const relative of removed) await rm(path.join(root, relative), { force: true });
    for (const plan of blockPlans) {
      if (plan.deleteFile) await rm(plan.full, { force: true });
      else await writeFile(plan.full, plan.text);
    }
    for (const relative of dirsRemoved) await rmdir(path.join(root, relative));
    await rm(path.join(root, RECORD_NAME), { force: true });
  }
  return { applied: apply, removed, blocksRemoved, dirsRemoved, kept, refused };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const dest = args.find(arg => !arg.startsWith('--')) || process.cwd();
  if (args.includes('--uninstall')) {
    try {
      const result = await uninstallShipwright(dest, { apply: args.includes('--apply') });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.refused.length ? 1 : 0;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  } else {
    const result = await installShipwright(dest, { apply: args.includes('--apply') });
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.conflicts.length ? 1 : 0;
  }
}
