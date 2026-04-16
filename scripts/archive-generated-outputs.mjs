#!/usr/bin/env node

import { cp, mkdir, rename, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SOURCE_PATHS = [
  path.join('benchmarks', 'results'),
  path.join('benchmarks', 'telemetry'),
];

export async function archiveGeneratedOutputs(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const mode = normalizeMode(options.mode);
  const targetRoot = path.resolve(options.targetRoot || guessDefaultTargetRoot(cwd));
  const sourcePaths = normalizeSourcePaths(options.sourcePaths);
  const operations = await planArchiveOperations({ cwd, sourcePaths, targetRoot });

  if (options.dryRun) {
    return { cwd, targetRoot, mode, dryRun: true, operations };
  }

  for (const operation of operations) {
    await mkdir(path.dirname(operation.to), { recursive: true });
    if (mode === 'copy') {
      await cp(operation.from, operation.to, { recursive: true, force: true });
      continue;
    }

    try {
      await rename(operation.from, operation.to);
    } catch (error) {
      if (error?.code !== 'EXDEV' && error?.code !== 'EEXIST') {
        throw error;
      }

      await cp(operation.from, operation.to, { recursive: true, force: true });
      await rm(operation.from, { recursive: true, force: true });
    }
  }

  return { cwd, targetRoot, mode, dryRun: false, operations };
}

export async function planArchiveOperations({ cwd = process.cwd(), sourcePaths = DEFAULT_SOURCE_PATHS, targetRoot }) {
  if (!targetRoot) {
    throw new Error('targetRoot is required');
  }

  const resolvedCwd = path.resolve(cwd);
  const resolvedTargetRoot = path.resolve(targetRoot);
  const operations = [];

  for (const sourcePath of normalizeSourcePaths(sourcePaths)) {
    const absoluteSource = path.resolve(resolvedCwd, sourcePath);
    if (!(await pathExists(absoluteSource))) {
      continue;
    }

    const sourceStats = await stat(absoluteSource);
    if (!sourceStats.isDirectory()) {
      continue;
    }

    if (isNestedPath(absoluteSource, resolvedTargetRoot)) {
      throw new Error(`Target root cannot live inside source path: ${absoluteSource}`);
    }

    const relativeSource = path.relative(resolvedCwd, absoluteSource);
    const targetPath = path.join(resolvedTargetRoot, relativeSource);

    if (absoluteSource === targetPath) {
      continue;
    }

    operations.push({
      from: absoluteSource,
      to: targetPath,
      relative_source: relativeSource,
    });
  }

  return operations;
}

export function guessDefaultTargetRoot(cwd = process.cwd()) {
  const resolvedCwd = path.resolve(cwd);
  if (process.platform === 'win32') {
    const root = path.parse(resolvedCwd).root || 'C:\\';
    return path.join(root, 'shipwright-artifacts');
  }

  return path.join(os.homedir(), 'shipwright-artifacts');
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    mode: 'move',
    targetRoot: guessDefaultTargetRoot(),
    dryRun: false,
    sourcePaths: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--target-root':
        options.targetRoot = requireValue(argv, index, token);
        index += 1;
        break;
      case '--mode':
        options.mode = requireValue(argv, index, token);
        index += 1;
        break;
      case '--path':
        options.sourcePaths.push(requireValue(argv, index, token));
        index += 1;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (options.sourcePaths.length === 0) {
    options.sourcePaths = [...DEFAULT_SOURCE_PATHS];
  }

  return {
    ...options,
    mode: normalizeMode(options.mode),
  };
}

function normalizeMode(mode) {
  if (mode === 'move' || mode === 'copy') {
    return mode;
  }

  throw new Error(`Unsupported mode: ${mode}. Use "move" or "copy".`);
}

function normalizeSourcePaths(sourcePaths) {
  if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) {
    return [...DEFAULT_SOURCE_PATHS];
  }

  return sourcePaths.map((value) => String(value)).filter(Boolean);
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
}

function isNestedPath(parentPath, childPath) {
  const relative = path.relative(parentPath, childPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function formatResult(result) {
  if (result.operations.length === 0) {
    return 'No generated output directories found.\n';
  }

  const lines = [
    `${result.dryRun ? 'Planned' : 'Completed'} ${result.mode} to ${result.targetRoot}`,
  ];

  for (const operation of result.operations) {
    lines.push(`- ${operation.relative_source} -> ${operation.to}`);
  }

  return `${lines.join('\n')}\n`;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/archive-generated-outputs.mjs [options]',
    '',
    'Options:',
    '  --target-root <path>  Archive root outside OneDrive (default: C:\\shipwright-artifacts on Windows)',
    '  --mode <move|copy>    Move by default; copy leaves source files in place',
    '  --path <relative>     Source path to archive. Repeatable. Defaults to benchmarks/results + benchmarks/telemetry',
    '  --dry-run             Show planned operations without modifying files',
  ].join('\n');
}

const isCliEntryPoint = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCliEntryPoint) {
  try {
    const options = parseArgs();
    if (options.help) {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }

    const result = await archiveGeneratedOutputs(options);
    process.stdout.write(formatResult(result));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.stderr.write(`${usage()}\n`);
    process.exit(1);
  }
}
