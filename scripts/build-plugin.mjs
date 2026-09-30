#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Explicit distribution allowlist. Never package credentials, local installs or run artifacts.
export async function pluginFiles(root = SOURCE_ROOT) {
  const files = new Map();
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  const rewrite = text => text
    .replace(/skills\/[a-z-]+\/([a-z-]+)\/SKILL\.md/g, 'skills/$1/SKILL.md')
    .replace(/\.codex\/skills\//g, 'skills/');
  async function add(source, target = source) {
    const content = await readFile(path.join(root, source));
    files.set(target, /\.(md|json)$/.test(target) ? Buffer.from(rewrite(content.toString('utf8'))) : content);
  }
  async function addTree(dir) {
    for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`Refusing symlink in package: ${dir}/${entry.name}`);
      if (entry.isDirectory()) await addTree(`${dir}/${entry.name}`);
      else await add(`${dir}/${entry.name}`);
    }
  }
  for (const [category, names] of Object.entries(manifest.skills)) {
    for (const name of names) await add(`skills/${category}/${name}/SKILL.md`, `skills/${name}/SKILL.md`);
  }
  for (const name of ['shipwright-concierge', 'shipwright-research-brief']) {
    await add(`.codex/skills/${name}/SKILL.md`, `skills/${name}/SKILL.md`);
  }
  for (const dir of ['commands', 'agents', 'evals', 'schemas', 'output-styles', 'examples/golden-outputs']) await addTree(dir);
  // Public operational docs only; internal review exchanges and outreach are excluded.
  for (const name of [...manifest.docs, 'workflow-contract', 'structured-artifacts', 'plugin-guide']) await add(`docs/${name}.md`);
  for (const entry of ['collect-research', 'source-adapters', 'classify-request', 'format-facts',
    'pricing-diff', 'pricing-tuples', 'extract-structured-artifact', 'validate-artifact', 'route-request']) await add(`scripts/${entry}.mjs`);
  for (const file of ['manifest.json', 'skills-map.md', 'LICENSE', '.claude-plugin/plugin.json']) await add(file);
  // The source README documents checkout-only development tools. A directory install needs
  // a guide whose links and commands are valid inside this bundle.
  await add('docs/plugin-guide.md', 'README.md');
  const plugin = JSON.parse(files.get('.claude-plugin/plugin.json'));
  files.set('.codex-plugin/plugin.json', Buffer.from(JSON.stringify({ name: plugin.name, version: plugin.version,
    description: 'Evidence-backed product management skills and workflows.', skills: './skills/',
    author: plugin.author, repository: plugin.repository, homepage: plugin.homepage, license: plugin.license,
    interface: {
      displayName: 'Shipwright', developerName: plugin.author.name, category: 'Productivity',
      shortDescription: 'Research, decisions and product planning with explicit evidence.',
      longDescription: 'Shipwright provides 46 product-management frameworks, workflow routing, evidence checks and structured handoffs for research, pricing, PRDs, strategy and launches.',
      capabilities: [], defaultPrompt: 'Use Shipwright to help with my product-management task.',
    } }, null, 2) + '\n'));
  return files;
}

export async function buildPlugin(outDir, root = SOURCE_ROOT) {
  const destination = path.resolve(outDir);
  const files = await pluginFiles(root);
  try { await lstat(destination); throw new Error(`Output must be a new directory: ${destination}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const [relative, content] of files) {
    const target = path.join(destination, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, { flag: 'wx' });
  }
  return { destination, files: files.size, skills: [...files.keys()].filter(p => /^skills\/[^/]+\/SKILL.md$/.test(p)).length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/build-plugin.mjs <new-output-directory>');
  console.log(JSON.stringify(await buildPlugin(process.argv[2]), null, 2));
}
