#!/usr/bin/env node

/**
 * Decision session service interface for Shipwright.
 *
 * This is the app-facing boundary above the controller layer. It exposes
 * session actions and a small request dispatcher so product surfaces can talk
 * to Shipwright in terms of sessions and verbs rather than scripts and flags.
 */

import {
  startDecisionSession,
  getDecisionSession,
  confirmNextStep,
  declineNextStep,
  retrySessionStep,
  runFollowUpAction,
} from './decision-session-controller.mjs';

export const SESSION_SERVICE_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'invalid_request',
  INVALID_ACTION: 'invalid_action',
  SESSION_NOT_FOUND: 'session_not_found',
  EXECUTION_FAILED: 'execution_failed',
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  INTERNAL_ERROR: 'internal_error',
});

/**
 * Create an app-facing service object for decision sessions.
 *
 * @param {object} [defaults]
 * @returns {object}
 */
export function createDecisionSessionService(defaults = {}) {
  return {
    startSession(input = {}) {
      return invoke(() => startDecisionSession({
        ...defaults,
        ...input,
      }), 201);
    },

    getSession(sessionId, options = {}) {
      return invoke(() => getDecisionSession(
        sessionId,
        options.sessions_root || defaults.sessions_root,
      ));
    },

    confirmNextStep(sessionId, options = {}) {
      return invoke(() => confirmNextStep(sessionId, {
        ...defaults,
        ...options,
      }));
    },

    declineNextStep(sessionId, options = {}) {
      return invoke(() => declineNextStep(sessionId, {
        ...defaults,
        ...options,
      }));
    },

    retrySessionStep(sessionId, options = {}) {
      return invoke(() => retrySessionStep(sessionId, {
        ...defaults,
        ...options,
      }));
    },

    runFollowUp(sessionId, action, options = {}) {
      return invoke(() => runFollowUpAction(sessionId, action, {
        ...defaults,
        ...options,
      }));
    },

    handleRequest(request = {}) {
      return handleDecisionSessionRequest(request, defaults);
    },
  };
}

/**
 * Handle a session-service style request using HTTP-like method/path semantics.
 *
 * Supported requests:
 * - POST /decision-sessions
 * - GET /decision-sessions/:id
 * - POST /decision-sessions/:id/confirm
 * - POST /decision-sessions/:id/decline
 * - POST /decision-sessions/:id/retry
 * - POST /decision-sessions/:id/follow-up
 *
 * @param {object} request
 * @param {string} request.method
 * @param {string} request.path
 * @param {object} [request.body]
 * @param {object} [defaults]
 * @returns {Promise<object>}
 */
export async function handleDecisionSessionRequest(request = {}, defaults = {}) {
  const method = String(request.method || '').toUpperCase();
  const path = String(request.path || '');
  const body = request.body && typeof request.body === 'object' ? request.body : {};
  const service = createDecisionSessionService(defaults);

  if (!method || !path) {
    return errorResponse(
      SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST,
      'method and path are required.',
      400,
    );
  }

  const match = path.match(/^\/decision-sessions(?:\/([^/]+)(?:\/([^/]+))?)?$/);
  if (!match) {
    return errorResponse(
      SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST,
      `Unsupported path: ${path}`,
      404,
    );
  }

  const sessionId = match[1] || null;
  const action = match[2] || null;

  if (method === 'POST' && !sessionId && !action) {
    return service.startSession(body);
  }

  if (!sessionId) {
    return errorResponse(
      SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST,
      `Session id is required for ${method} ${path}.`,
      400,
    );
  }

  if (method === 'GET' && !action) {
    return service.getSession(sessionId, body);
  }

  if (method !== 'POST') {
    return errorResponse(
      SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST,
      `Unsupported method for ${path}: ${method}`,
      405,
    );
  }

  switch (action) {
    case 'confirm':
      return service.confirmNextStep(sessionId, body);
    case 'decline':
      return service.declineNextStep(sessionId, body);
    case 'retry':
      return service.retrySessionStep(sessionId, body);
    case 'follow-up':
      return service.runFollowUp(sessionId, body.action, body);
    default:
      return errorResponse(
        SESSION_SERVICE_ERROR_CODES.INVALID_ACTION,
        `Unsupported session action: ${action}`,
        404,
      );
  }
}

async function invoke(fn, successStatus = 200) {
  try {
    const data = await fn();
    return {
      ok: true,
      status: successStatus,
      data,
      error: null,
    };
  } catch (error) {
    return normalizeError(error);
  }
}

function normalizeError(error) {
  const message = error?.message || 'Unknown error.';
  const lower = message.toLowerCase();

  if (lower.includes('session not found')) {
    return errorResponse(SESSION_SERVICE_ERROR_CODES.SESSION_NOT_FOUND, message, 404);
  }

  if (
    lower.includes('not awaiting') ||
    lower.includes('does not require confirmation') ||
    lower.includes('only valid') ||
    lower.includes('unsupported confirmation target') ||
    lower.includes('action is required')
  ) {
    return errorResponse(SESSION_SERVICE_ERROR_CODES.INVALID_ACTION, message, 409);
  }

  if (
    lower.includes('provider') && (
      lower.includes('requires three distinct providers')
      || lower.includes('three providers')
      || lower.includes('temporarily unavailable')
      || lower.includes('limited availability')
    )
  ) {
    return errorResponse(SESSION_SERVICE_ERROR_CODES.PROVIDER_UNAVAILABLE, message, 503);
  }

  if (
    lower.includes('failed')
    || lower.includes('json parse failed')
    || lower.includes('schema validation failed')
  ) {
    return errorResponse(SESSION_SERVICE_ERROR_CODES.EXECUTION_FAILED, message, 502);
  }

  if (lower.includes('required') || lower.includes('unknown')) {
    return errorResponse(SESSION_SERVICE_ERROR_CODES.INVALID_REQUEST, message, 400);
  }

  return errorResponse(SESSION_SERVICE_ERROR_CODES.INTERNAL_ERROR, message, 500);
}

function errorResponse(code, message, status) {
  return {
    ok: false,
    status,
    data: null,
    error: {
      code,
      message,
    },
  };
}

const isMain = process.argv[1]
  && (process.argv[1].endsWith('decision-session-service.mjs') || process.argv[1].endsWith('decision-session-service'));

if (isMain) {
  const args = parseCliArgs(process.argv.slice(2));

  try {
    const response = await handleDecisionSessionRequest({
      method: args.method,
      path: args.path,
      body: args.body,
    }, {
      sessions_root: args.sessionsRoot,
      timeout_ms: args.timeoutMs,
    });

    process.stdout.write(JSON.stringify(response, null, 2) + '\n');
    if (!response.ok) {
      process.exit(1);
    }
  } catch (error) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

function parseCliArgs(argv) {
  const parsed = {
    method: 'GET',
    path: '',
    body: {},
    sessionsRoot: null,
    timeoutMs: 120_000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--method':
        parsed.method = argv[i + 1] || 'GET';
        i += 1;
        break;
      case '--path':
        parsed.path = argv[i + 1] || '';
        i += 1;
        break;
      case '--body':
        parsed.body = parseJsonArg(argv[i + 1] || '{}');
        i += 1;
        break;
      case '--sessions-root':
        parsed.sessionsRoot = argv[i + 1] || null;
        i += 1;
        break;
      case '--timeout-ms':
        parsed.timeoutMs = Number(argv[i + 1]) || 120_000;
        i += 1;
        break;
      default:
        if (token.startsWith('--')) {
          throw new Error(`Unknown flag: ${token}`);
        }
        break;
    }
  }

  return parsed;
}

function parseJsonArg(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON for --body: ${error.message}`);
  }
}
