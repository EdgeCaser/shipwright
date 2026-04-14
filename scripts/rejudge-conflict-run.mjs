#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createShellTurnRunner } from './run-conflict-harness.mjs';
import { validateConflictDocument } from './build-case-packet.mjs';
import { AGENT_PROFILES } from './run-conflict-batch.mjs';

const DEFAULT_REASONING_EFFORT = 'medium';
const DEFAULT_TIMEOUT_MS = 120000;
const VALID_FORMATS = new Set(['text', 'json']);

export async function rejudgeConflictRun(options = {}) {
  const runDir = normalizeRequiredPath(options.runDir, '--run-dir');
  const judgeAgent = options.judgeAgent || 'gemini';
  const profile = resolveJudgeProfile(judgeAgent);
  const judgeLabel = options.label || `${judgeAgent}-judge`;
  const judgeCommand = options.judgeCommand || profile.command;
  const judgeProvider = options.judgeProvider || profile.provider;
  const judgeModel = options.judgeModel || profile.model;
  const judgeReasoningEffort = normalizeRequiredString(
    options.judgeReasoningEffort || DEFAULT_REASONING_EFFORT,
    '--judge-reasoning-effort',
  );
  const timeoutMs = normalizePositiveInteger(options.timeoutMs || DEFAULT_TIMEOUT_MS, '--timeout-ms');
  const cwd = path.resolve(options.cwd || process.cwd());

  const existingJudgeDir = path.join(runDir, 'judge');
  const promptFilePath = path.join(existingJudgeDir, 'verdict.prompt.txt');
  const packetFilePath = path.join(existingJudgeDir, 'verdict.input.json');
  const runPath = path.join(runDir, 'run.json');

  const [prompt, packetText, runText] = await Promise.all([
    readFile(promptFilePath, 'utf8'),
    readFile(packetFilePath, 'utf8'),
    readFile(runPath, 'utf8'),
  ]);

  const packet = JSON.parse(packetText);
  const run = JSON.parse(runText);
  const outputDir = path.join(runDir, 'rejudges', judgeLabel);
  await mkdir(outputDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(outputDir, 'verdict.prompt.txt'), prompt),
    writeFile(path.join(outputDir, 'verdict.input.json'), `${JSON.stringify(packet, null, 2)}\n`),
  ]);

  const rawOutputPath = path.join(outputDir, 'verdict.raw.txt');
  const turnRunner = options.turnRunner || createShellTurnRunner();
  const response = await turnRunner({
    phase: 'judge',
    sideId: null,
    runId: run.run_id,
    prompt,
    packet,
    cwd,
    timeoutMs,
    command: judgeCommand,
    reasoningEffort: judgeReasoningEffort,
    outDir: outputDir,
    promptFilePath,
    packetFilePath,
    attempt: 0,
  });

  if (typeof response.exitCode === 'number' && response.exitCode !== 0) {
    throw new Error(
      `judge turn failed with exit code ${response.exitCode}: ${response.stderr || ''}`.trim(),
    );
  }

  if (typeof response.stdout !== 'string') {
    throw new Error('Judge turn did not return stdout.');
  }

  await writeFile(rawOutputPath, response.stdout);
  const verdict = parseJsonResponse(response.stdout);
  const validation = validateConflictDocument(verdict, 'verdict');
  if (validation.errors.length > 0) {
    throw new Error(formatValidationErrors('Verdict packet failed validation', validation.errors));
  }

  const metadata = {
    source_run_dir: runDir,
    source_run_id: run.run_id,
    judge: {
      label: judgeLabel,
      agent: judgeAgent,
      provider: judgeProvider,
      model: judgeModel,
      reasoning_effort: judgeReasoningEffort,
      command: judgeCommand,
    },
  };

  await Promise.all([
    writeFile(path.join(outputDir, 'verdict.json'), `${JSON.stringify(verdict, null, 2)}\n`),
    writeFile(path.join(outputDir, 'verdict.md'), formatVerdictMarkdown(verdict)),
    writeFile(path.join(outputDir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`),
  ]);

  return {
    outputDir,
    verdict,
    metadata,
  };
}

export function parseCliArgs(argv) {
  const parsed = {
    runDir: '',
    judgeAgent: 'gemini',
    judgeCommand: '',
    judgeProvider: '',
    judgeModel: '',
    judgeReasoningEffort: DEFAULT_REASONING_EFFORT,
    label: '',
    cwd: process.cwd(),
    timeoutMs: DEFAULT_TIMEOUT_MS,
    format: 'text',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--run-dir':
        parsed.runDir = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-agent':
        parsed.judgeAgent = argv[index + 1] || 'gemini';
        index += 1;
        break;
      case '--judge-command':
        parsed.judgeCommand = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-provider':
        parsed.judgeProvider = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-model':
        parsed.judgeModel = argv[index + 1] || '';
        index += 1;
        break;
      case '--judge-reasoning-effort':
        parsed.judgeReasoningEffort = argv[index + 1] || DEFAULT_REASONING_EFFORT;
        index += 1;
        break;
      case '--label':
        parsed.label = argv[index + 1] || '';
        index += 1;
        break;
      case '--cwd':
        parsed.cwd = argv[index + 1] || process.cwd();
        index += 1;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--format':
        parsed.format = argv[index + 1] || 'text';
        index += 1;
        break;
      case '--help':
        parsed.help = true;
        break;
      default:
        if (token.startsWith('--')) {
          throw new Error(`Unknown flag: ${token}`);
        }
        break;
    }
  }

  if (!VALID_FORMATS.has(parsed.format)) {
    throw new Error(`Unsupported format "${parsed.format}". Use text or json.`);
  }

  return parsed;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(
      'Usage: node scripts/rejudge-conflict-run.mjs --run-dir <completed-run-dir> [--judge-agent gemini] [--label gemini-judge] [--format text|json]',
    );
    return;
  }

  const result = await rejudgeConflictRun({
    runDir: args.runDir,
    judgeAgent: args.judgeAgent,
    judgeCommand: args.judgeCommand || undefined,
    judgeProvider: args.judgeProvider || undefined,
    judgeModel: args.judgeModel || undefined,
    judgeReasoningEffort: args.judgeReasoningEffort,
    label: args.label || undefined,
    cwd: args.cwd,
    timeoutMs: args.timeoutMs,
  });

  if (args.format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(formatResultSummary(result));
}

function resolveJudgeProfile(judgeAgent) {
  const profile = AGENT_PROFILES[judgeAgent];
  if (!profile) {
    const supported = Object.keys(AGENT_PROFILES).join(', ');
    throw new Error(`Unknown judge agent "${judgeAgent}". Supported agents: ${supported}`);
  }
  return profile;
}

function normalizeRequiredPath(value, flagName) {
  const normalized = normalizeRequiredString(value, flagName);
  return path.resolve(normalized);
}

function normalizeRequiredString(value, flagName) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new Error(`Missing required ${flagName}.`);
}

function normalizePositiveInteger(value, flagName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }
  return value;
}

function parseJsonResponse(output) {
  const candidate = extractJsonCandidate(output);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new Error(`Model output is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractJsonCandidate(output) {
  const trimmed = output.trim();
  if (trimmed.startsWith('{')) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function formatValidationErrors(label, errors) {
  return `${label}:\n${errors.map((error) => `${error.path}: ${error.message}`).join('\n')}`;
}

function formatVerdictMarkdown(verdict) {
  return [
    `# Verdict: ${verdict.winner}`,
    '',
    `- Margin: ${verdict.margin}`,
    `- Confidence: ${verdict.judge_confidence}`,
    `- Needs human review: ${verdict.needs_human_review}`,
    '',
    '## Dimension Rationales',
    '',
    `- Claim Quality: ${verdict.dimension_rationales?.claim_quality || 'n/a'}`,
    `- Evidence Discipline: ${verdict.dimension_rationales?.evidence_discipline || 'n/a'}`,
    `- Responsiveness To Critique: ${verdict.dimension_rationales?.responsiveness_to_critique || 'n/a'}`,
    `- Internal Consistency: ${verdict.dimension_rationales?.internal_consistency || 'n/a'}`,
    `- Decision Usefulness: ${verdict.dimension_rationales?.decision_usefulness || 'n/a'}`,
    '',
    '## Side Summaries',
    '',
    '### Side A Strengths',
    ...((verdict.side_summaries?.side_a?.strengths || []).map((entry) => `- ${entry}`)),
    '',
    '### Side A Weaknesses',
    ...((verdict.side_summaries?.side_a?.weaknesses || []).map((entry) => `- ${entry}`)),
    '',
    '### Side B Strengths',
    ...((verdict.side_summaries?.side_b?.strengths || []).map((entry) => `- ${entry}`)),
    '',
    '### Side B Weaknesses',
    ...((verdict.side_summaries?.side_b?.weaknesses || []).map((entry) => `- ${entry}`)),
    '',
    '## Rationale',
    '',
    verdict.rationale,
    '',
    '## Decisive Findings',
    '',
    ...(verdict.decisive_findings || []).map((finding) => `- ${finding}`),
    '',
    '## Rubric Scores',
    '',
    `- Side A weighted total: ${verdict.rubric_scores?.side_a?.weighted_total ?? 'n/a'}`,
    `- Side B weighted total: ${verdict.rubric_scores?.side_b?.weighted_total ?? 'n/a'}`,
    '',
  ].join('\n');
}

function formatResultSummary(result) {
  return [
    `Rejudge output: ${result.outputDir}`,
    `Winner: ${result.verdict.winner}`,
    `Margin: ${result.verdict.margin}`,
    `Confidence: ${result.verdict.judge_confidence}`,
    `Needs human review: ${result.verdict.needs_human_review}`,
  ].join('\n');
}

const isMainModule = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMainModule) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
