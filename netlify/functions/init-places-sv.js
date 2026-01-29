// Enregistre un token + startTime dans Blobs (pour backfill depuis le front si token pas encore en base)
// POST body: { token, startTime? } — startTime = timestamp Unix secondes. Si absent, utilise now.
// Ne fait rien si le token existe déjà (préserve la date d'inscription).

import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }
  if (event.httpMethod !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const { token, startTime: startTimeParam } = body;
    if (!token || !String(token).startsWith('sv_')) {
      return new Response(JSON.stringify({ error: 'Token invalide ou manquant' }), { status: 400, headers });
    }

    const store = getStore('sv-places-tokens');
    const existing = await store.get(token);
    if (existing) {
      return new Response(JSON.stringify({ success: true, alreadyExists: true }), { status: 200, headers });
    }

    const startTime = typeof startTimeParam === 'number' && startTimeParam > 0
      ? Math.floor(startTimeParam)
      : Math.floor(Date.now() / 1000);
    await store.set(token, JSON.stringify({ startTime }));
    return new Response(JSON.stringify({ success: true, startTime }), { status: 200, headers });
  } catch (err) {
    console.error('init-places-sv error:', err);
    return new Response(JSON.stringify({ valid: false, error: 'Erreur serveur' }), { status: 500, headers });
  }
}
