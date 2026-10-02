import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';

const DEFAULT_MAX_BYTES = 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 4;
const allowedV6 = new BlockList();
allowedV6.addSubnet('2000::', 3, 'ipv6');
const blockedV6 = new BlockList();
for (const [address, prefix] of [['2001::', 23], ['2001:db8::', 32], ['2002::', 16]]) {
  blockedV6.addSubnet(address, prefix, 'ipv6');
}

export function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 0 || b === 168 || (b === 88 && c === 99))) return false;
    if (a === 198 && ((b >= 18 && b <= 19) || (b === 51 && c === 100))) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    return true;
  }
  if (family === 6) return allowedV6.check(address, 'ipv6') && !blockedV6.check(address, 'ipv6');
  return false;
}

export function parsePublicUrl(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { throw new Error('invalid-url'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported-url-scheme');
  if (url.username || url.password) throw new Error('url-credentials-disallowed');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || (!isIP(host) &&
    (!host.includes('.') || /\.(?:localhost|local|internal|test|invalid|example|onion)$/.test(host)))) {
    throw new Error('non-public-host');
  }
  if (isIP(host) && !isPublicAddress(host)) throw new Error('non-public-address');
  url.hash = '';
  return url;
}

async function resolvePublicAddress(url, resolver) {
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) return { address: host, family: isIP(host) };
  const addresses = await resolver(host, { all: true, verbatim: true });
  if (!Array.isArray(addresses) || addresses.length === 0 ||
      addresses.some((item) => !isPublicAddress(item?.address))) {
    throw new Error('non-public-dns-result');
  }
  return addresses[0];
}

function requestOnce(url, address, { timeoutMs, maxBytes }) {
  return new Promise((resolve, reject) => {
    const signal = AbortSignal.timeout(timeoutMs);
    const client = url.protocol === 'https:' ? https : http;
    const request = client.request(url, {
      method: 'GET',
      signal,
      autoSelectFamily: false,
      lookup: (_hostname, lookupOptions, callback) => {
        const done = typeof lookupOptions === 'function' ? lookupOptions : callback;
        const all = typeof lookupOptions === 'object' && lookupOptions?.all;
        if (all) done(null, [{ address: address.address, family: address.family }]);
        else done(null, address.address, address.family);
      },
      headers: {
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
        'Accept-Encoding': 'identity',
        'User-Agent': 'ShipwrightResearchCollector/1.0',
      },
    }, (response) => {
      const status = response.statusCode || 0;
      const headers = response.headers;
      const contentType = String(headers['content-type'] || '').toLowerCase();
      const supported = /^(?:text\/html|application\/xhtml\+xml|text\/plain)(?:\s*;|\s*$)/.test(contentType);
      const encoding = String(headers['content-encoding'] || 'identity').toLowerCase();
      if (status < 200 || status >= 300 || !supported || encoding !== 'identity') {
        response.destroy();
        resolve({ status, headers, body: '', bytesRead: 0,
          ...(status >= 200 && status < 300 && !supported ? { error: 'unsupported-content-type' } :
            status >= 200 && status < 300 && encoding !== 'identity'
              ? { error: 'unsupported-content-encoding' } : {}) });
        return;
      }
      const declaredLength = Number(headers['content-length']);
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        response.destroy();
        resolve({ status, headers, body: '', bytesRead: 0, error: 'body-too-large' });
        return;
      }
      const chunks = [];
      let bytesRead = 0;
      response.on('data', (chunk) => {
        bytesRead += chunk.length;
        if (bytesRead > maxBytes) {
          response.destroy();
          resolve({ status, headers, body: '', bytesRead, error: 'body-too-large' });
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve({ status, headers,
        body: Buffer.concat(chunks).toString('utf8'), bytesRead }));
      response.on('error', reject);
    });
    request.on('error', reject);
    request.end();
  });
}

function withinDeadline(promise, deadlineAt) {
  const remaining = deadlineAt - Date.now();
  if (remaining <= 0) return Promise.reject(new Error('fetch-timeout'));
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('fetch-timeout')), remaining);
    }),
  ]).finally(() => clearTimeout(timer));
}

export async function fetchPublicSource(rawUrl, options = {}) {
  const timeoutMs = options.timeoutMs ?? 12000;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const resolver = options.resolver || lookup;
  const transport = options.transport || requestOnce;
  const requestedUrl = String(rawUrl);
  const redirects = [];
  let currentUrl = requestedUrl;
  const deadlineAt = Date.now() + timeoutMs;
  try {
    for (let hop = 0; hop <= maxRedirects; hop += 1) {
      const url = parsePublicUrl(currentUrl);
      const address = await withinDeadline(resolvePublicAddress(url, resolver), deadlineAt);
      const response = await withinDeadline(
        transport(url, address, { timeoutMs: Math.max(1, deadlineAt - Date.now()), maxBytes }),
        deadlineAt,
      );
      const status = response.status || 0;
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers?.location;
        if (!location) throw new Error('redirect-without-location');
        if (hop === maxRedirects) throw new Error('too-many-redirects');
        const next = new URL(String(location), url).toString();
        parsePublicUrl(next);
        redirects.push({ from: url.toString(), to: next, status });
        currentUrl = next;
        continue;
      }
      const finalUrl = url.toString();
      return {
        ok: status >= 200 && status < 300 && !response.error,
        status, requestedUrl, finalUrl, redirects,
        contentType: String(response.headers?.['content-type'] || ''),
        body: response.body || '', bytesRead: response.bytesRead || 0,
        maxBytes, ...(response.error ? { error: response.error } :
          status < 200 || status >= 300 ? { error: `http-status-${status}` } : {}),
      };
    }
    throw new Error('too-many-redirects');
  } catch (error) {
    return { ok: false, requestedUrl, finalUrl: currentUrl, redirects, maxBytes,
      error: error instanceof Error ? error.message : String(error) };
  }
}
