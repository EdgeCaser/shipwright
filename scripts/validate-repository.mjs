#!/usr/bin/env node
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

export async function validateRepository(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const errors = [];
  const read = file => readFile(path.join(root, file), 'utf8');
  const exists = async file => { try { await access(path.join(root, file)); return true; } catch { return false; } };
  const manifest = JSON.parse(await read('manifest.json'));
  const skillPaths = new Map();
  const required = ['Description', 'When to Use', 'Depth', 'Framework', 'Minimum Evidence Bar', 'Output Format', 'Common Mistakes to Avoid', 'Weak vs. Strong Output'];
  const signatures = ['Decision Frame', 'Unknowns & Evidence Gaps', 'Pass/Fail Readiness', 'Recommended Next Artifact'];
  for (const [category, names] of Object.entries(manifest.skills)) {
    for (const name of names) {
      const file = `skills/${category}/${name}/SKILL.md`;
      if (skillPaths.has(name)) errors.push(`Duplicate skill: ${name}`);
      skillPaths.set(name, file);
      if (!await exists(file)) { errors.push(`Missing skill: ${file}`); continue; }
      const text = await read(file);
      if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) errors.push(`Missing frontmatter: ${file}`);
      if (!text.includes('docs/workflow-contract.md')) errors.push(`Missing shared workflow contract: ${file}`);
      const fm = text.split(/\r?\n---/)[0];
      if (!new RegExp(`^name: ${name}$`, 'm').test(fm.replace(/\r/g, ''))) errors.push(`Wrong skill name: ${file}`);
      if (!/^description: .+/m.test(fm) || !/^default_depth: standard/m.test(fm)) errors.push(`Incomplete frontmatter: ${file}`);
      let previous = -1;
      for (const section of required) {
        const position = text.indexOf(`## ${section}`);
        if (position < 0 || position <= previous) errors.push(`Missing/out-of-order ${section}: ${file}`);
        previous = position;
      }
      for (const signature of signatures) if (!text.includes(signature)) errors.push(`Missing ${signature}: ${file}`);
    }
  }
  const actualSkills = (await walk(path.join(root, 'skills'))).filter(file => file.endsWith('/SKILL.md'));
  if (actualSkills.length !== skillPaths.size) errors.push('Skill inventory differs from manifest.');
  for (const [field, dir, ext] of [['agents', 'agents', '.md'], ['commands', 'commands', '.md'], ['evals', 'evals', '.md'], ['golden-outputs', 'examples/golden-outputs', '.md'], ['docs', 'docs', '.md']]) {
    for (const name of manifest[field]) if (!await exists(`${dir}/${name}${ext}`)) errors.push(`Missing registered ${field}: ${name}`);
  }
  const agentSkills = new Map();
  for (const name of manifest.agents) {
    const text = await read(`agents/${name}.md`);
    agentSkills.set(name, new Set([...text.matchAll(/skills\/[^/\s]+\/([^/\s]+)\/SKILL\.md/g)].map(m => m[1])));
  }
  for (const [name, route] of Object.entries(manifest.routing)) {
    if (!manifest.commands.includes(name)) errors.push(`Unregistered route: ${name}`);
    const agents = route.agents || [route.agent];
    if (Boolean(route.agent) === Boolean(route.agents)) errors.push(`Route must declare agent or agents: ${name}`);
    for (const agent of agents) if (!agentSkills.has(agent)) errors.push(`Unknown agent ${agent}: ${name}`);
    const text = await read(`commands/${name}.md`);
    const used = new Set([...text.matchAll(/skills\/[^/\s]+\/([^/\s]+)\/SKILL\.md/g)].map(m => m[1]));
    for (const skill of new Set([...route.skills, ...used])) {
      if (!skillPaths.has(skill)) errors.push(`Unknown skill ${skill}: ${name}`);
      if (!route.skills.includes(skill) || !used.has(skill)) errors.push(`Route/command skill mismatch ${skill}: ${name}`);
      if (!agents.some(agent => agentSkills.get(agent)?.has(skill))) errors.push(`No assigned agent can execute ${skill}: ${name}`);
    }
  }
  for (const file of [...skillPaths.values(), ...manifest.commands.map(n => `commands/${n}.md`), ...manifest.agents.map(n => `agents/${n}.md`), ...manifest.docs.map(n => `docs/${n}.md`), ...manifest.evals.map(n => `evals/${n}.md`)]) {
    const text = await read(file);
    for (const match of text.matchAll(/(?:skills\/[a-z-]+\/[a-z-]+\/SKILL\.md|(?:docs|evals)\/[a-z0-9-]+\.md)/g)) {
      if (!await exists(match[0])) errors.push(`Broken reference ${match[0]}: ${file}`);
    }
  }
  const plugin = JSON.parse(await read('.claude-plugin/plugin.json'));
  const market = JSON.parse(await read('.claude-plugin/marketplace.json'));
  if (manifest.version !== plugin.version || market.plugins.find(p => p.name === plugin.name)?.version !== plugin.version) errors.push('Release versions disagree.');
  return { errors: [...new Set(errors)], counts: { skills: skillPaths.size, agents: manifest.agents.length, workflows: Object.keys(manifest.routing).length } };
}

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file.replaceAll('\\', '/'));
  }
  return files;
}

function isDirectRun() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (process.argv[1] && isDirectRun()) {
  const result = await validateRepository(process.argv[2]);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.errors.length ? 1 : 0;
}
