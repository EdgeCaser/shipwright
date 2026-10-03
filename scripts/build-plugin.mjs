#!/usr/bin/env node
import { mkdir, readFile, readdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

export const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLUGIN_ROOT_LINE = 'Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file\'s path instead.';

// Explicit distribution allowlist. Never package credentials, local installs or run artifacts.
export async function pluginFiles(root = SOURCE_ROOT) {
  const files = new Map();
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  const rewrite = text => text
    .replace(/skills\/[a-z-]+\/([a-z-]+)\/SKILL\.md/g, 'skills/$1/SKILL.md')
    .replace(/\.codex\/skills\//g, 'skills/');
  // Claude Code fills in ${CLAUDE_PLUGIN_ROOT} in command and skill text; other hosts leave it as written.
  const withRoot = text => text.replace(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/, `$1\n${PLUGIN_ROOT_LINE}\n`);
  async function add(source, target = source) {
    const content = await readFile(path.join(root, source));
    if (!/\.(md|json)$/.test(target)) { files.set(target, content); return; }
    let text = rewrite(content.toString('utf8'));
    if (/^(commands\/[^/]+|skills\/[^/]+\/SKILL)\.md$/.test(target)) {
      text = withRoot(text);
      if (!text.includes(PLUGIN_ROOT_LINE)) throw new Error(`No frontmatter to anchor the plugin root line: ${source}`);
    }
    files.set(target, Buffer.from(text));
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
  for (const name of ['leeward-concierge', 'leeward-research-brief']) {
    await add(`.codex/skills/${name}/SKILL.md`, `skills/${name}/SKILL.md`);
  }
  for (const dir of ['commands', 'agents', 'evals', 'schemas', 'output-styles', 'examples/golden-outputs']) await addTree(dir);
  // Public operational docs only; internal review exchanges and outreach are excluded.
  for (const name of [...manifest.docs, 'workflow-contract', 'structured-artifacts', 'plugin-guide', 'artifact-reconciliation']) await add(`docs/${name}.md`);
  for (const entry of ['collect-research', 'source-adapters', 'classify-request', 'format-facts',
    'pricing-diff', 'pricing-tuples', 'markdown-scan', 'extract-structured-artifact', 'validate-artifact', 'route-request',
    'reconcile-artifact', 'reconcile-evidence', 'reconcile-inputs', 'reconcile-behavior', 'capture-inputs', 'public-source-fetch']) await add(`scripts/${entry}.mjs`);
  for (const file of ['manifest.json', 'skills-map.md', 'LICENSE', '.claude-plugin/plugin.json']) await add(file);
  // The source README documents checkout-only development tools. A directory install needs
  // a guide whose links and commands are valid inside this bundle.
  await add('docs/plugin-guide.md', 'README.md');
  const plugin = JSON.parse(files.get('.claude-plugin/plugin.json'));
  files.set('.codex-plugin/plugin.json', Buffer.from(JSON.stringify({ name: plugin.name, version: plugin.version,
    description: 'Evidence-backed product management skills and workflows.', skills: './skills/',
    author: plugin.author, repository: plugin.repository, homepage: plugin.homepage, license: plugin.license,
    interface: {
      displayName: plugin.displayName, developerName: plugin.author.name, category: 'Productivity',
      shortDescription: 'Evidence-based PM workflows',
      longDescription: 'Leeward provides 46 product-management frameworks, workflow routing, evidence checks and structured handoffs for research, pricing, PRDs, strategy and launches.',
      capabilities: [], defaultPrompt: 'Use Leeward to help with my product-management task.',
      websiteURL: plugin.homepage, supportURL: plugin.supportUrl, privacyPolicyURL: plugin.privacyPolicyUrl,
      termsOfServiceURL: plugin.termsOfServiceUrl,
    } }, null, 2) + '\n'));
  return files;
}

/** The directory bundle adds the listing icons, which project installs don't need. */
export async function bundleFiles(root = SOURCE_ROOT) {
  const files = await pluginFiles(root);
  const icon = await readFile(path.join(root, 'assets/shipwright-icon.png'));
  files.set('.claude-plugin/icon.png', icon);
  files.set('assets/icon.png', icon);
  const codex = JSON.parse(files.get('.codex-plugin/plugin.json'));
  Object.assign(codex.interface, { logo: './assets/icon.png', composerIcon: './assets/icon.png' });
  files.set('.codex-plugin/plugin.json', Buffer.from(JSON.stringify(codex, null, 2) + '\n'));
  return files;
}

export async function buildPlugin(outDir, root = SOURCE_ROOT) {
  const destination = path.resolve(outDir);
  const files = await bundleFiles(root);
  try { await lstat(destination); throw new Error(`Output must be a new directory: ${destination}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const [relative, content] of files) {
    const target = path.join(destination, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, { flag: 'wx' });
  }
  return { destination, files: files.size, skills: [...files.keys()].filter(p => /^skills\/[^/]+\/SKILL.md$/.test(p)).length };
}

function isDirectRun() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (process.argv[1] && isDirectRun()) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/build-plugin.mjs <new-output-directory>');
  console.log(JSON.stringify(await buildPlugin(process.argv[2]), null, 2));
}
