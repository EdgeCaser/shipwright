#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ARTIFACT_COMMENT_RE = /<!--\s*shipwright:artifact\s*([\s\S]*?)-->/;

const SCHEMA_FILE_BY_TYPE = Object.freeze({
  prd: 'prd.schema.json',
  strategy: 'strategy.schema.json',
  'challenge-report': 'challenge-report.schema.json',
});

const schemaCache = new Map();

export function extractStructuredArtifact(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return {
      artifact: null,
      raw: null,
      error: null,
      startLine: 1,
    };
  }

  const match = ARTIFACT_COMMENT_RE.exec(text);
  if (!match) {
    return {
      artifact: null,
      raw: null,
      error: null,
      startLine: 1,
    };
  }

  const raw = (match[1] || '').trim();
  const startLine = text.slice(0, match.index).split('\n').length;

  try {
    return {
      artifact: JSON.parse(raw),
      raw,
      error: null,
      startLine,
    };
  } catch (error) {
    return {
      artifact: null,
      raw,
      error: error instanceof Error ? error.message : String(error),
      startLine,
    };
  }
}

export function getStructuredArtifactOutputPath(markdownPath) {
  const resolved = path.resolve(markdownPath);
  const dir = path.dirname(resolved);
  const name = path.basename(resolved, path.extname(resolved));
  return path.join(dir, `${name}.json`);
}

export function loadArtifactSchema(artifactType) {
  if (!artifactType || !SCHEMA_FILE_BY_TYPE[artifactType]) {
    throw new Error(`Unsupported artifact type: ${artifactType || 'unknown'}`);
  }

  if (schemaCache.has(artifactType)) {
    return schemaCache.get(artifactType);
  }

  const schemaPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'schemas',
    'artifacts',
    SCHEMA_FILE_BY_TYPE[artifactType],
  );
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  schemaCache.set(artifactType, schema);
  return schema;
}

export function validateStructuredArtifact(artifact, options = {}) {
  const errors = [];
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    return {
      artifactType: null,
      schema: null,
      errors: [{ path: '$', message: 'Structured artifact must be a JSON object.' }],
    };
  }

  const artifactType = options.artifactType || artifact.artifact_type || null;
  if (!artifactType) {
    return {
      artifactType: null,
      schema: null,
      errors: [{ path: '$.artifact_type', message: 'Structured artifact is missing artifact_type.' }],
    };
  }

  let schema;
  try {
    schema = loadArtifactSchema(artifactType);
  } catch (error) {
    return {
      artifactType,
      schema: null,
      errors: [{ path: '$.artifact_type', message: error instanceof Error ? error.message : String(error) }],
    };
  }

  validateValueAgainstSchema(artifact, schema, '$', errors);
  return { artifactType, schema, errors };
}

function validateValueAgainstSchema(value, schema, currentPath, errors) {
  if (!schema || typeof schema !== 'object') return;

  if ('type' in schema && !matchesSchemaType(value, schema.type)) {
    errors.push({
      path: currentPath,
      message: `Expected ${formatExpectedType(schema.type)}.`,
    });
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({
      path: currentPath,
      message: `Expected one of: ${schema.enum.join(', ')}.`,
    });
    return;
  }

  if (schema.type === 'object') {
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

    for (const [key, childSchema] of Object.entries(properties)) {
      if (!(key in value)) continue;
      validateValueAgainstSchema(value[key], childSchema, `${currentPath}.${key}`, errors);
    }
    return;
  }

  if (schema.type === 'array') {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({
        path: currentPath,
        message: `Expected at least ${schema.minItems} item(s).`,
      });
    }

    if (schema.items) {
      value.forEach((item, index) => {
        validateValueAgainstSchema(item, schema.items, `${currentPath}[${index}]`, errors);
      });
    }
  }
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

async function main(argv = process.argv.slice(2)) {
  const filePath = argv.find((arg) => !arg.startsWith('--'));
  if (!filePath) {
    console.error('Usage: node scripts/extract-structured-artifact.mjs <path-to-markdown> [--out path/to/output.json] [--artifact-type prd] [--validate]');
    process.exitCode = 1;
    return;
  }

  const outFlag = argv.findIndex((arg) => arg === '--out');
  const artifactTypeFlag = argv.findIndex((arg) => arg === '--artifact-type');
  const validate = argv.includes('--validate');

  const outputPath = outFlag !== -1 && argv[outFlag + 1]
    ? path.resolve(argv[outFlag + 1])
    : getStructuredArtifactOutputPath(filePath);
  const artifactType = artifactTypeFlag !== -1 && argv[artifactTypeFlag + 1]
    ? argv[artifactTypeFlag + 1]
    : undefined;

  let markdown;
  try {
    markdown = await readFile(path.resolve(filePath), 'utf8');
  } catch (error) {
    console.error(`Cannot read file: ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  const extracted = extractStructuredArtifact(markdown);
  if (extracted.error) {
    console.error(`Invalid structured artifact JSON at line ${extracted.startLine}: ${extracted.error}`);
    process.exitCode = 1;
    return;
  }

  if (!extracted.artifact) {
    console.error('No structured artifact block found.');
    process.exitCode = 1;
    return;
  }

  if (validate) {
    const result = validateStructuredArtifact(extracted.artifact, { artifactType });
    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.error(`${error.path}: ${error.message}`);
      }
      process.exitCode = 1;
      return;
    }
  }

  await writeFile(outputPath, `${JSON.stringify(extracted.artifact, null, 2)}\n`, 'utf8');
  console.log(outputPath);
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
