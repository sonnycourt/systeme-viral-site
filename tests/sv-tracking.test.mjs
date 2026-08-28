import test from 'node:test';
import assert from 'node:assert/strict';

import checkPlaces from '../netlify/functions/check-places-sv.js';
import initPlaces from '../netlify/functions/init-places-sv.js';
import track from '../netlify/functions/sv-track.js';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

test('check-places-sv lit la date depuis Supabase', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => json([{ offer_started_at: new Date().toISOString(), first_optin_at: new Date().toISOString() }]);
  try {
    const response = await checkPlaces(new Request('https://systemeviral.com/.netlify/functions/check-places-sv?token=sv_1769790367353_testtoken'));
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.valid, true);
    assert.equal(body.placesRemaining, 15);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('init-places-sv crée un token absent dans Supabase', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || 'GET' });
    return calls.length === 1 ? json([]) : json([{ token: 'sv_1769790367353_testtoken' }], 201);
  };
  try {
    const response = await initPlaces(new Request('https://systemeviral.com/.netlify/functions/init-places-sv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'sv_1769790367353_testtoken', startTime: 1769790367 }),
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(calls.map((call) => call.method), ['GET', 'POST']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sv-track journalise un événement anonyme sans exposer Supabase au navigateur', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let requestOptions;
  globalThis.fetch = async (_url, options) => {
    requestOptions = options;
    return json(null, 201);
  };
  try {
    const response = await track(new Request('https://systemeviral.com/.netlify/functions/sv-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'page_view',
        visitor_id: 'svv_testvisitor',
        session_id: 'svs_testsession',
        page_path: '/inscription',
      }),
    }));
    assert.equal(response.status, 200);
    assert.equal(requestOptions.method, 'POST');
    assert.equal(requestOptions.headers.Authorization, 'Bearer test-service-key');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sv-track met à jour le résumé d’un lead connu puis journalise le clic', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const methods = [];
  globalThis.fetch = async (_url, options = {}) => {
    methods.push(options.method || 'GET');
    if (methods.length === 1) return json([{ token: 'sv_1769790367353_testtoken', visitor_id: null }]);
    if (methods.length === 2) return json([{ token: 'sv_1769790367353_testtoken' }]);
    return json(null, 201);
  };
  try {
    const response = await track(new Request('https://systemeviral.com/.netlify/functions/sv-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'offer_clicked',
        token: 'sv_1769790367353_testtoken',
        visitor_id: 'svv_testvisitor',
        session_id: 'svs_testsession',
        page_path: '/100k-masterclass',
      }),
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(methods, ['GET', 'PATCH', 'POST']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
