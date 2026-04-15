#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  DEFAULT_SCENARIO_DIR,
  loadBenchmarkScenario,
} from './run-benchmarks.mjs';

const SCHEMA_FILE_BY_NAME = Object.freeze({
  case: 'conflict-case.schema.json',
  run: 'conflict-run.schema.json',
  verdict: 'conflict-verdict.schema.json',
});

export const DEFAULT_CONFLICT_SCHEMA_DIR = path.resolve('schemas');
export const DEFAULT_CONFLICT_MAX_ROUNDS = 3;
export const DEFAULT_TOOL_POLICY = 'none';
export const DEFAULT_RUBRIC_DIMENSIONS = Object.freeze([
  'claim quality',
  'evidence discipline',
  'responsiveness to critique',
  'internal consistency',
  'decision usefulness',
]);
export const DEFAULT_SHARING_POLICY = Object.freeze({
  share_case_packet: true,
  share_committed_artifacts_after_first_pass: true,
  share_critiques_after_open: true,
  share_hidden_reasoning: false,
  share_provider_identity: false,
  share_internal_coalition_drafts: false,
});

const schemaCache = new Map();

export function loadConflictSchema(schemaName) {
  if (!SCHEMA_FILE_BY_NAME[schemaName]) {
    throw new Error(`Unsupported conflict schema: ${schemaName}`);
  }

  if (schemaCache.has(schemaName)) {
    return schemaCache.get(schemaName);
  }

  const schemaPath = path.resolve(DEFAULT_CONFLICT_SCHEMA_DIR, SCHEMA_FILE_BY_NAME[schemaName]);
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  schemaCache.set(schemaName, schema);
  return schema;
}

export function validateConflictValue(value, schema, currentPath = '$', errors = []) {
  if (!schema || typeof schema !== 'object') return errors;

  if ('type' in schema && !matchesSchemaType(value, schema.type)) {
    errors.push({
      path: currentPath,
      message: `Expected ${formatExpectedType(schema.type)}.`,
    });
    return errors;
  }

  if ('enum' in schema && !schema.enum.includes(value)) {
    errors.push({
      path: currentPath,
      message: `Expected one of: ${schema.enum.map((entry) => String(entry)).join(', ')}.`,
    });
    return errors;
  }

  if (schema.type === 'string' && typeof schema.minLength === 'number' && value.length < schema.minLength) {
    errors.push({
      path: currentPath,
      message: `Expected string length >= ${schema.minLength}.`,
    });
    return errors;
  }

  if (
    (schema.type === 'number' || schema.type === 'integer') &&
    typeof schema.minimum === 'number' &&
    value < schema.minimum
  ) {
    errors.push({
      path: currentPath,
      message: `Expected value >= ${schema.minimum}.`,
    });
    return errors;
  }

  if (
    (schema.type === 'number' || schema.type === 'integer') &&
    typeof schema.maximum === 'number' &&
    value > schema.maximum
  ) {
    errors.push({
      path: currentPath,
      message: `Expected value <= ${schema.maximum}.`,
    });
    return errors;
  }

  if (matchesSchemaType(value, 'object')) {
    const properties = schema.properties || {};
    const required = schema.required || [];

    for (const key of required) {
      if (!(key in value)) {
        errors.push({
          path: `${currentPath}.${key}`,
          message: 'Missing required property.',
        });
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push({
            path: `${currentPath}.${key}`,
            message: 'Unexpected property.',
          });
        }
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (!(key in value)) continue;
      validateConflictValue(value[key], childSchema, `${currentPath}.${key}`, errors);
    }
    return errors;
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({
        path: currentPath,
        message: `Expected at least ${schema.minItems} item(s).`,
      });
    }

    if (schema.items) {
      value.forEach((item, index) => {
        validateConflictValue(item, schema.items, `${currentPath}[${index}]`, errors);
      });
    }
  }

  return errors;
}

export function validateConflictDocument(document, schemaName) {
  const schema = loadConflictSchema(schemaName);
  const errors = validateConflictValue(document, schema, '$', []);
  return { schema, errors };
}

export function buildCasePacketFromScenario(scenario, options = {}) {
  if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) {
    throw new Error('Scenario must be a benchmark scenario object.');
  }

  const expectedSections = Array.isArray(scenario.validator?.expect_sections)
    ? scenario.validator.expect_sections
    : [];
  const expectStructured = Boolean(scenario.validator?.expect_structured);
  const contextFiles = Array.isArray(scenario.inputs?.context_files)
    ? scenario.inputs.context_files
    : [];
  const scoringSpecRef = scenario.inputs?.scoring_spec_ref || null;

  const packet = {
    scenario_id: scenario.id,
    title: scenario.title || scenario.id,
    prompt: scenario.inputs?.prompt || '',
    artifact_type: scenario.inputs?.expected_artifact_type || '',
    rubric: {
      dimensions: options.rubricDimensions || [...DEFAULT_RUBRIC_DIMENSIONS],
      scoring_scale: '1-5',
      expected_sections: expectedSections,
      scoring_spec_ref: scoringSpecRef,
    },
    constraints: {
      expected_sections: expectedSections,
      expect_structured: expectStructured,
      context_files: contextFiles,
      scoring_spec_ref: scoringSpecRef,
    },
    evidence: contextFiles.map((filePath, index) => ({
      evidence_id: `ctx-${index + 1}`,
      kind: 'context_file',
      source_ref: filePath,
      content: null,
      confidence: null,
    })),
    max_rounds: options.maxRounds ?? DEFAULT_CONFLICT_MAX_ROUNDS,
    tool_policy: options.toolPolicy || DEFAULT_TOOL_POLICY,
    sharing_policy: {
      ...DEFAULT_SHARING_POLICY,
      ...(options.sharingPolicy || {}),
    },
    success_condition: {
      type: 'validator_contract',
      description:
        options.successDescription ||
        `Produce a ${scenario.inputs?.expected_artifact_type || 'signed-off'} artifact that satisfies the scenario validator contract.`,
      validator: {
        artifact_type: scenario.inputs?.expected_artifact_type || '',
        expect_sections: expectedSections,
        expect_structured: expectStructured,
      },
    },
  };

  const validation = validateConflictDocument(packet, 'case');
  if (validation.errors.length > 0) {
    const details = validation.errors
      .map((error) => `${error.path}: ${error.message}`)
      .join('\n');
    throw new Error(`Generated case packet failed validation:\n${details}`);
  }

  return packet;
}

export async function loadCasePacket(filePath) {
  const resolved = path.resolve(filePath);
  const packet = JSON.parse(await readFile(resolved, 'utf8'));
  const validation = validateConflictDocument(packet, 'case');
  if (validation.errors.length > 0) {
    const details = validation.errors
      .map((error) => `${error.path}: ${error.message}`)
      .join('\n');
    throw new Error(`Case packet failed validation:\n${details}`);
  }
  return packet;
}

export async function buildCasePacket(options = {}) {
  const scenarioArg = typeof options.scenario === 'string' ? options.scenario.trim() : '';
  const scenarioDir = options.scenarioDir || DEFAULT_SCENARIO_DIR;

  if (!scenarioArg) {
    throw new Error('Missing required --scenario.');
  }

  const scenarioPath = resolveScenarioPath(scenarioArg, scenarioDir);
  const scenario = await loadBenchmarkScenario(scenarioPath);
  return buildCasePacketFromScenario(scenario, options);
}

export function parseCliArgs(argv) {
  const parsed = {
    scenario: '',
    scenarioDir: DEFAULT_SCENARIO_DIR,
    outPath: null,
    maxRounds: DEFAULT_CONFLICT_MAX_ROUNDS,
    toolPolicy: DEFAULT_TOOL_POLICY,
    format: 'json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case '--scenario':
        parsed.scenario = argv[index + 1] || '';
        index += 1;
        break;
      case '--scenario-dir':
        parsed.scenarioDir = argv[index + 1] || DEFAULT_SCENARIO_DIR;
        index += 1;
        break;
      case '--out':
        parsed.outPath = argv[index + 1] || null;
        index += 1;
        break;
      case '--max-rounds':
        parsed.maxRounds = Number(argv[index + 1] || '');
        index += 1;
        break;
      case '--tool-policy':
        parsed.toolPolicy = argv[index + 1] || DEFAULT_TOOL_POLICY;
        index += 1;
        break;
      case '--format':
        parsed.format = argv[index + 1] || 'json';
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

  if (!['json'].includes(parsed.format)) {
    throw new Error(`Unsupported format "${parsed.format}". Use json.`);
  }

  if (!Number.isInteger(parsed.maxRounds) || parsed.maxRounds <= 0) {
    throw new Error('--max-rounds must be a positive integer.');
  }

  if (!['none', 'symmetric'].includes(parsed.toolPolicy)) {
    throw new Error('Unsupported --tool-policy. Use none or symmetric.');
  }

  return parsed;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(
      'Usage: node scripts/build-case-packet.mjs --scenario scenario-id [--scenario-dir dir] [--out path] [--max-rounds 3] [--tool-policy none]',
    );
    return;
  }

  const packet = await buildCasePacket(args);
  const output = `${JSON.stringify(packet, null, 2)}\n`;

  if (args.outPath) {
    await writeFile(path.resolve(args.outPath), output, 'utf8');
    console.log(path.resolve(args.outPath));
    return;
  }

  process.stdout.write(output);
}

function resolveScenarioPath(scenarioArg, scenarioDir) {
  if (scenarioArg.endsWith('.json')) {
    return path.resolve(scenarioArg);
  }
  return path.resolve(scenarioDir, `${scenarioArg}.json`);
}

function matchesSchemaType(value, expectedType) {
  const candidates = Array.isArray(expectedType) ? expectedType : [expectedType];
  return candidates.some((type) => matchesSingleType(value, type));
}

function matchesSingleType(value, type) {
  switch (type) {
    case 'object':
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return false;
  }
}

function formatExpectedType(type) {
  return Array.isArray(type) ? type.join(' or ') : String(type);
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
