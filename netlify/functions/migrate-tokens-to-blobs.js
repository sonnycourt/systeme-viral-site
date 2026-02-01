// Fonction pour migrer les anciens tokens vers Blobs
// Appeler avec POST body: { tokens: [{ token: "sv_xxx", firstOptinDate: "2026-01-27T18:24:00.000Z" }, ...] }
// Ou GET avec ?token=sv_xxx&date=2026-01-27T18:24:00.000Z pour un seul token

import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  const store = getStore('sv-places-tokens');

  // GET : migrer un seul token
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const dateStr = url.searchParams.get('date');

    if (!token || !token.startsWith('sv_')) {
      return new Response(JSON.stringify({ error: 'Token manquant ou invalide' }), { status: 400, headers });
    }

    if (!dateStr) {
      return new Response(JSON.stringify({ error: 'Date manquante (format ISO: 2026-01-27T18:24:00.000Z)' }), { status: 400, headers });
    }

    const startTime = Math.floor(new Date(dateStr).getTime() / 1000);
    
    if (isNaN(startTime)) {
      return new Response(JSON.stringify({ error: 'Date invalide' }), { status: 400, headers });
    }

    // Forcer l'écriture (écrase si existe)
    await store.set(token, JSON.stringify({ startTime }));

    return new Response(JSON.stringify({
      success: true,
      token,
      startTime,
      dateStr,
      message: 'Token migré avec succès'
    }), { status: 200, headers });
  }

  // POST : migrer plusieurs tokens
  if (request.method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}));
      const { tokens } = body;

      if (!tokens || !Array.isArray(tokens)) {
        return new Response(JSON.stringify({ error: 'tokens array required' }), { status: 400, headers });
      }

      const results = [];

      for (const item of tokens) {
        const { token, firstOptinDate } = item;
        
        if (!token || !token.startsWith('sv_') || !firstOptinDate) {
          results.push({ token, success: false, error: 'Invalid token or date' });
          continue;
        }

        const startTime = Math.floor(new Date(firstOptinDate).getTime() / 1000);
        
        if (isNaN(startTime)) {
          results.push({ token, success: false, error: 'Invalid date format' });
          continue;
        }

        await store.set(token, JSON.stringify({ startTime }));
        results.push({ token, success: true, startTime });
      }

      return new Response(JSON.stringify({
        success: true,
        migrated: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }), { status: 200, headers });

    } catch (error) {
      console.error('Migration error:', error);
      return new Response(JSON.stringify({ error: 'Migration failed', details: error.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
};
