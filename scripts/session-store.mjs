#!/usr/bin/env node

/**
 * File-backed decision session store for Shipwright.
 *
 * V1 storage layout:
 *   benchmarks/results/sessions/<session-id>/session.json
 *   benchmarks/results/sessions/<session-id>/events.jsonl
 *
 * This module is intentionally narrow. It owns persistence only:
 * - create/load/update session records
 * - append session events
 * - link artifacts into the session record
 *
 * Higher-level orchestration belongs in a controller layer.
 */

import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildRunId } from './path-ids.mjs';

const DEFAULT_SESSIONS_ROOT = path.resolve('benchmarks', 'results', 'sessions');
const SESSION_FILENAME = 'session.json';
const EVENTS_FILENAME = 'events.jsonl';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create and persist a new session record.
 *
 * @param {object} input
 * @param {string} input.question
 * @param {string} input.scenario_id
 * @param {string} input.scenario_class
 * @param {boolean} [input.scenario_class_provisional]
 * @param {object} [input.provider_availability]
 * @param {string} [input.stage]
 * @param {string} [input.ux_state]
 * @param {string|null} [input.ux_substate]
 * @param {string|null} [input.recommended_next_mode]
 * @param {boolean} [input.requires_user_confirmation]
 * @param {object|null} [input.recommended_provider_roles]
 * @param {string} [input.explanation]
 * @param {string|null} [input.follow_up_artifact]
 * @param {string|null} [input.follow_up_action]
 * @param {string} [input.status]
 * @param {string} [input.session_id]
 * @param {string} [input.sessions_root]
 */
export async function createSession(input = {}) {
  validateRequiredString(input.question, 'question');
  validateRequiredString(input.scenario_id, 'scenario_id');
  validateRequiredString(input.scenario_class, 'scenario_class');

  const sessionId = input.session_id || generateSessionId(input.scenario_id);
  const sessionsRoot = resolveSessionsRoot(input.sessions_root);
  const sessionDir = path.join(sessionsRoot, sessionId);
  const now = new Date().toISOString();

  const session = {
    session_id: sessionId,
    created_at: now,
    updated_at: now,
    question: input.question,
    scenario_id: input.scenario_id,
    scenario_class: input.scenario_class,
    scenario_class_provisional: Boolean(input.scenario_class_provisional),
    provider_availability: normalizeObject(input.provider_availability),
    stage: input.stage || 'pre_run',
    ux_state: input.ux_state || null,
    ux_substate: input.ux_substate || null,
    recommended_next_mode: input.recommended_next_mode || null,
    requires_user_confirmation: Boolean(input.requires_user_confirmation),
    recommended_provider_roles: normalizeObject(input.recommended_provider_roles),
    explanation: input.explanation || '',
    follow_up_artifact: input.follow_up_artifact || null,
    follow_up_action: input.follow_up_action || null,
    status: input.status || 'running',
    fast_run_id: input.fast_run_id || null,
    rigor_run_id: input.rigor_run_id || null,
    fast_run_path: input.fast_run_path || null,
    rigor_run_path: input.rigor_run_path || null,
    artifacts: normalizeObject(input.artifacts),
  };

  await mkdir(sessionDir, { recursive: true });
  await writeJson(getSessionFilePath(sessionId, sessionsRoot), session);

  const initialEvent = {
    type: 'session_created',
    timestamp: now,
    session_id: sessionId,
    scenario_id: input.scenario_id,
    scenario_class: input.scenario_class,
  };
  await appendSessionEvent(sessionId, initialEvent, sessionsRoot);

  return session;
}

/**
 * Load a persisted session by id.
 *
 * @param {string} sessionId
 * @param {string} [sessionsRoot]
 */
export async function getSession(sessionId, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  const filePath = getSessionFilePath(sessionId, resolveSessionsRoot(sessionsRoot));

  if (!existsSync(filePath)) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return JSON.parse(await readFile(filePath, 'utf8'));
}

/**
 * Merge a patch into an existing session and persist it.
 *
 * @param {string} sessionId
 * @param {object} patch
 * @param {string} [sessionsRoot]
 */
export async function updateSession(sessionId, patch = {}, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('patch must be an object');
  }

  const current = await getSession(sessionId, sessionsRoot);
  const next = {
    ...current,
    ...patch,
    artifacts: patch.artifacts
      ? { ...(current.artifacts || {}), ...patch.artifacts }
      : (current.artifacts || {}),
    provider_availability: patch.provider_availability
      ? { ...(current.provider_availability || {}), ...patch.provider_availability }
      : (current.provider_availability || {}),
    recommended_provider_roles: patch.recommended_provider_roles
      ? { ...(current.recommended_provider_roles || {}), ...patch.recommended_provider_roles }
      : (current.recommended_provider_roles || null),
    updated_at: new Date().toISOString(),
  };

  await writeJson(getSessionFilePath(sessionId, resolveSessionsRoot(sessionsRoot)), next);
  return next;
}

/**
 * Append a single JSONL event to the session event log.
 *
 * @param {string} sessionId
 * @param {object} event
 * @param {string} [sessionsRoot]
 */
export async function appendSessionEvent(sessionId, event = {}, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new Error('event must be an object');
  }

  const root = resolveSessionsRoot(sessionsRoot);
  const sessionDir = path.join(root, sessionId);
  await mkdir(sessionDir, { recursive: true });

  const record = {
    timestamp: event.timestamp || new Date().toISOString(),
    session_id: sessionId,
    ...event,
  };

  await appendFile(
    getEventsFilePath(sessionId, root),
    JSON.stringify(record) + '\n',
    'utf8',
  );

  return record;
}

/**
 * Link or update a single artifact reference on the session record.
 *
 * @param {string} sessionId
 * @param {string} artifactType
 * @param {any} artifactRef
 * @param {string} [sessionsRoot]
 */
export async function linkArtifact(sessionId, artifactType, artifactRef, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  validateRequiredString(artifactType, 'artifactType');

  return updateSession(sessionId, {
    artifacts: {
      [artifactType]: artifactRef,
    },
  }, sessionsRoot);
}

/**
 * Load session events as parsed JSON records.
 *
 * @param {string} sessionId
 * @param {string} [sessionsRoot]
 */
export async function getSessionEvents(sessionId, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  const filePath = getEventsFilePath(sessionId, resolveSessionsRoot(sessionsRoot));

  if (!existsSync(filePath)) {
    return [];
  }

  const raw = await readFile(filePath, 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Resolve the session directory path for a session id.
 *
 * @param {string} sessionId
 * @param {string} [sessionsRoot]
 */
export function getSessionDirectory(sessionId, sessionsRoot) {
  validateRequiredString(sessionId, 'sessionId');
  return path.join(resolveSessionsRoot(sessionsRoot), sessionId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveSessionsRoot(explicitRoot) {
  return path.resolve(explicitRoot || DEFAULT_SESSIONS_ROOT);
}

function getSessionFilePath(sessionId, sessionsRoot) {
  return path.join(resolveSessionsRoot(sessionsRoot), sessionId, SESSION_FILENAME);
}

function getEventsFilePath(sessionId, sessionsRoot) {
  return path.join(resolveSessionsRoot(sessionsRoot), sessionId, EVENTS_FILENAME);
}

function normalizeObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

function validateRequiredString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
}

function generateSessionId(scenarioId) {
  return buildRunId('sess', scenarioId);
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const isMain = process.argv[1]
  && (process.argv[1].endsWith('session-store.mjs') || process.argv[1].endsWith('session-store'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    if (args.command === 'get') {
      const session = await getSession(args.sessionId, args.sessionsRoot);
      const events = await getSessionEvents(args.sessionId, args.sessionsRoot);
      process.stdout.write(JSON.stringify({ session, events }, null, 2) + '\n');
    } else {
      const session = await createSession({
        question: args.question,
        scenario_id: args.scenarioId,
        scenario_class: args.scenarioClass,
        scenario_class_provisional: args.provisional,
        sessions_root: args.sessionsRoot,
      });
      process.stdout.write(JSON.stringify(session, null, 2) + '\n');
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const parsed = {
    command: 'create',
    question: '',
    scenarioId: '',
    scenarioClass: 'unclassified',
    provisional: false,
    sessionId: '',
    sessionsRoot: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case 'create':
      case 'get':
        parsed.command = token;
        break;
      case '--question':
        parsed.question = argv[i + 1] || '';
        i += 1;
        break;
      case '--scenario-id':
        parsed.scenarioId = argv[i + 1] || '';
        i += 1;
        break;
      case '--scenario-class':
        parsed.scenarioClass = argv[i + 1] || 'unclassified';
        i += 1;
        break;
      case '--provisional':
        parsed.provisional = true;
        break;
      case '--session-id':
        parsed.sessionId = argv[i + 1] || '';
        i += 1;
        break;
      case '--sessions-root':
        parsed.sessionsRoot = argv[i + 1] || null;
        i += 1;
        break;
      default:
        break;
    }
  }

  return parsed;
}
