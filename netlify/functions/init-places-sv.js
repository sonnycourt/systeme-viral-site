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
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const { token, startTime: startTimeParam } = body;
    if (!token || !String(token).startsWith('sv_')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token invalide ou manquant' })
      };
    }

    const store = getStore('sv-places-tokens');
    const existing = await store.get(token);
    if (existing) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, alreadyExists: true })
      };
    }

    const startTime = typeof startTimeParam === 'number' && startTimeParam > 0
      ? Math.floor(startTimeParam)
      : Math.floor(Date.now() / 1000);
    await store.set(token, JSON.stringify({ startTime }));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, startTime })
    };
  } catch (err) {
    console.error('init-places-sv error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ valid: false, error: 'Erreur serveur' })
    };
  }
}
