import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import test from 'node:test';
import { fetchPublicSource, isPublicAddress, parsePublicUrl } from '../scripts/public-source-fetch.mjs';

test('rejects private, mapped, reserved, and non-web destinations', () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1',
    '198.51.100.1', '::1', 'fc00::1', '::ffff:127.0.0.1', '2001:db8::1']) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2001:4860:4860::8888'), true);
  for (const url of ['file:///etc/passwd', 'http://localhost/', 'http://127.0.0.1/',
    'http://2130706433/', 'http://user:pass@example.com/']) {
    assert.throws(() => parsePublicUrl(url), url);
  }
});

test('validates every DNS answer and each redirect before another request', async () => {
  const calls = [];
  const result = await fetchPublicSource('https://example.com/start', {
    resolver: async (host) => host === 'example.com'
      ? [{ address: '8.8.8.8', family: 4 }]
      : [{ address: '10.0.0.2', family: 4 }],
    transport: async (url) => {
      calls.push(url.toString());
      return { status: 302, headers: { location: 'https://private.example.net/secret' } };
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'non-public-dns-result');
  assert.deepEqual(calls, ['https://example.com/start']);

  const rebinding = await fetchPublicSource('https://public.example.net/', {
    resolver: async () => [{ address: '8.8.8.8', family: 4 }, { address: '127.0.0.1', family: 4 }],
    transport: async () => { throw new Error('must not connect'); },
  });
  assert.equal(rebinding.error, 'non-public-dns-result');
});

test('redirected public HTML retains requested and final URL with bounded body metadata', async () => {
  const result = await fetchPublicSource('http://example.com/first', {
    resolver: async () => [{ address: '8.8.8.8', family: 4 }],
    transport: async (url, address) => {
      assert.equal(address.address, '8.8.8.8');
      return url.pathname === '/first'
        ? { status: 301, headers: { location: '/final' } }
        : { status: 200, headers: { 'content-type': 'text/html' }, body: '<p>Source text</p>', bytesRead: 18 };
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.requestedUrl, 'http://example.com/first');
  assert.equal(result.finalUrl, 'http://example.com/final');
  assert.equal(result.redirects.length, 1);
  assert.equal(result.bytesRead, 18);
});

test('DNS resolution is inside the total capture deadline', async () => {
  const result = await fetchPublicSource('https://example.com/', {
    timeoutMs: 10,
    resolver: () => new Promise(() => {}),
    transport: async () => { throw new Error('must not connect'); },
  });
  assert.equal(result.error, 'fetch-timeout');
});

test('native request lookup honors the all-address callback shape', { concurrency: false }, async (t) => {
  const original = http.request;
  http.request = (_url, options, callback) => {
    const request = new EventEmitter();
    request.end = () => {
      options.lookup('example.com', { all: true }, (error, addresses) => {
        assert.equal(error, null);
        assert.deepEqual(addresses, [{ address: '8.8.8.8', family: 4 }]);
        const response = new EventEmitter();
        response.statusCode = 200;
        response.headers = { 'content-type': 'text/plain' };
        callback(response);
        queueMicrotask(() => { response.emit('data', Buffer.from('Public source text')); response.emit('end'); });
      });
    };
    return request;
  };
  t.after(() => { http.request = original; });
  const result = await fetchPublicSource('http://example.com/', {
    resolver: async () => [{ address: '8.8.8.8', family: 4 }],
  });
  assert.equal(result.ok, true);
  assert.equal(result.body, 'Public source text');
});
