#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createShellTurnRunner } from './run-conflict-harness.mjs';
import { validateConflictDocument } from './build-case-packet.mjs';
import { AGENT_PROFILES } from './run-conflict-batch.mjs';

const DEFAULT_REASONING_EFFORT = 'medium';
const DEFAULT_TIMEOUT_MS = 120000;
const VALID_FORMATS = new Set(['text', 'json']);
const MAX_GEMINI_TURN_ATTEMPTS = 3;

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

  const [savedPrompt, packetText, runText] = await Promise.all([
    readFile(promptFilePath, 'utf8'),
    readFile(packetFilePath, 'utf8'),
    readFile(runPath, 'utf8'),
  ]);

  const packet = JSON.parse(packetText);
  const run = JSON.parse(runText);
  const outputDir = path.join(runDir, 'rejudges', judgeLabel);
  await mkdir(outputDir, { recursive: true });
  const prompt = buildReplayJudgePrompt(savedPrompt);
  const repairTelemetry = {
    repair_attempted: false,
    repair_attempts: 0,
  };

  await Promise.all([
    writeFile(path.join(outputDir, 'verdict.prompt.txt'), prompt),
    writeFile(path.join(outputDir, 'verdict.input.json'), `${JSON.stringify(packet, null, 2)}\n`),
  ]);

  const rawOutputPath = path.join(outputDir, 'verdict.raw.txt');
  const turnRunner = options.turnRunner || createShellTurnRunner({ shell: resolveReplayShell() });
  const response = await runJudgeTurnWithRetries({
    judgeAgent,
    turnRunner,
    turnOptions: {
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
    },
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
  const verdict = await parseAndValidateVerdict({
    output: response.stdout,
    judgeAgent,
    judgeCommand,
    judgeReasoningEffort,
    runId: run.run_id,
    cwd,
    timeoutMs,
    turnRunner,
    outDir: outputDir,
    promptFilePath,
    packetFilePath,
    repairTelemetry,
  });

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
    replay: repairTelemetry,
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

function resolveReplayShell() {
  if (process.platform !== 'win32') {
    return undefined;
  }

  const gitBashCandidates = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ];

  return gitBashCandidates.find((candidate) => existsSync(candidate));
}

async function runJudgeTurnWithRetries(options) {
  let lastResponse = null;
  let lastFailure = null;

  for (let attempt = 0; attempt < MAX_GEMINI_TURN_ATTEMPTS; attempt += 1) {
    const response = await options.turnRunner({
      ...options.turnOptions,
      attempt,
    });
    lastResponse = response;

    if (!shouldRetryJudgeResponse(response, options.judgeAgent) || attempt === MAX_GEMINI_TURN_ATTEMPTS - 1) {
      return response;
    }

    lastFailure = response.stderr || response.spawnError || 'unknown judge turn failure';
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new Error(`Judge turn failed before producing a response: ${lastFailure || 'unknown error'}`);
}

async function parseAndValidateVerdict(options) {
  const parsed = parseJsonResponse(options.output);
  const validation = validateConflictDocument(parsed, 'verdict');
  if (validation.errors.length === 0) {
    return parsed;
  }

  if (!shouldAttemptVerdictRepair(validation.errors, options.judgeAgent)) {
    throw new Error(formatValidationErrors('Verdict packet failed validation', validation.errors));
  }

  const repaired = await repairVerdict(options, parsed, validation.errors);
  const repairedValidation = validateConflictDocument(repaired, 'verdict');
  if (repairedValidation.errors.length > 0) {
    throw new Error(formatValidationErrors('Verdict packet failed validation', repairedValidation.errors));
  }

  return repaired;
}

function shouldAttemptVerdictRepair(errors, judgeAgent) {
  return errors.every((error) =>
    error.message === 'Missing required property.' && isRepairableVerdictValidationPath(error.path),
  );
}

function isRepairableVerdictValidationPath(pathValue) {
  return pathValue === '$.dimension_rationales' ||
    pathValue === '$.side_summaries' ||
    pathValue === '$.decisive_dimension' ||
    pathValue === '$.rubric_scores.side_a.weighted_total' ||
    pathValue === '$.rubric_scores.side_b.weighted_total';
}

function shouldRetryJudgeResponse(response, judgeAgent) {
  if (judgeAgent !== 'gemini') {
    return false;
  }

  if (typeof response?.exitCode !== 'number' || response.exitCode === 0) {
    return false;
  }

  const stderr = `${response.stderr || ''}\n${response.spawnError || ''}`;
  return /ERR_STREAM_PREMATURE_CLOSE|Premature close/i.test(stderr);
}

async function repairVerdict(options, parsedVerdict, errors) {
  options.repairTelemetry.repair_attempted = true;
  options.repairTelemetry.repair_attempts += 1;
  const repairPrompt = [
    'Your previous judge output was close but rejected by schema validation.',
    'Rewrite it as ONLY a JSON object that preserves the same winner, margin, rubric_scores, decisive_dimension, judge_confidence, needs_human_review, decisive_findings, and rationale unless the schema absolutely requires clarification.',
    'Any rubric_scores.*.weighted_total value must be a normalized aggregate on the same 1-5 scale as the rubric dimensions, not a raw sum.',
    'You MUST include these missing required properties with substantive content:',
    '- dimension_rationales',
    '- side_summaries',
    '- decisive_dimension',
    '- rubric_scores.side_a.weighted_total',
    '- rubric_scores.side_b.weighted_total',
    '',
    'Required schema shape:',
    JSON.stringify(buildVerdictShapeExample(), null, 2),
    '',
    `Validation errors:\n${formatValidationErrors('Verdict packet failed validation', errors)}`,
    '',
    'Previous verdict JSON:',
    JSON.stringify(parsedVerdict, null, 2),
  ].join('\n');

  const repairPromptPath = path.join(options.outDir, 'verdict.repair.prompt.txt');
  const repairOutputPath = path.join(options.outDir, 'verdict.repair.raw.txt');
  await writeFile(repairPromptPath, `${repairPrompt}\n`);

  const response = await options.turnRunner({
    phase: 'judge',
    sideId: null,
    runId: options.runId,
    prompt: repairPrompt,
    packet: parsedVerdict,
    cwd: options.cwd,
    timeoutMs: options.timeoutMs,
    command: options.judgeCommand,
    reasoningEffort: options.judgeReasoningEffort,
    outDir: options.outDir,
    promptFilePath: repairPromptPath,
    packetFilePath: options.packetFilePath,
    attempt: 1,
  });

  if (typeof response.exitCode === 'number' && response.exitCode !== 0) {
    throw new Error(
      `judge repair turn failed with exit code ${response.exitCode}: ${response.stderr || ''}`.trim(),
    );
  }

  if (typeof response.stdout !== 'string') {
    throw new Error('Judge repair turn did not return stdout.');
  }

  await writeFile(repairOutputPath, response.stdout);
  return parseJsonResponse(response.stdout);
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

function buildReplayJudgePrompt(savedPrompt) {
  return [
    savedPrompt.trim(),
    '',
    'Replay addendum:',
    '- This replay will be rejected unless EVERY required property is present.',
    '- Do not omit `dimension_rationales`.',
    '- Do not omit `side_summaries`.',
    '- `rubric_scores.side_a.weighted_total` and `rubric_scores.side_b.weighted_total` must each stay within the same 1-5 scale as the rubric dimensions.',
    '- Return ONLY the JSON object. No markdown fences, no prose before or after.',
  ].join('\n');
}

function buildVerdictShapeExample() {
  return {
    winner: 'tie',
    margin: 0,
    rubric_scores: {
      side_a: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 3,
      },
      side_b: {
        claim_quality: 3,
        evidence_discipline: 3,
        responsiveness_to_critique: 3,
        internal_consistency: 3,
        decision_usefulness: 3,
        weighted_total: 3,
      },
    },
    dimension_rationales: {
      claim_quality: 'Which side made the stronger claims and why.',
      evidence_discipline: 'How each side used or overstated evidence.',
      responsiveness_to_critique: 'How each side responded to the critique phase.',
      internal_consistency: 'Contradictions, coherence, or missing logic.',
      decision_usefulness: 'Which artifact better supports an actual decision.',
    },
    side_summaries: {
      side_a: {
        strengths: ['One concise strength of Side A.'],
        weaknesses: ['One concise weakness of Side A.'],
      },
      side_b: {
        strengths: ['One concise strength of Side B.'],
        weaknesses: ['One concise weakness of Side B.'],
      },
    },
    decisive_dimension: 'decision_usefulness',
    decisive_findings: ['Replace with the actual decisive findings from this run.'],
    judge_confidence: 'low',
    needs_human_review: true,
    rationale: 'One-paragraph explanation of the verdict.',
  };
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
    `## Decisive Dimension`,
    '',
    verdict.decisive_dimension || 'n/a',
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
