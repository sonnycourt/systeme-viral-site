import { supabaseGet, supabaseUpsert } from './lib/supabase-rest.mjs';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: HEADERS });
}

function validToken(value) {
  return /^sv_[A-Za-z0-9_-]{6,156}$/.test(String(value || '').trim());
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: HEADERS });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    if (!validToken(token)) return jsonResponse(400, { error: 'Token invalide ou manquant' });

    const existing = await supabaseGet(
      `sv_registrations?token=eq.${encodeURIComponent(token)}&select=token,offer_started_at,first_optin_at&limit=1`,
    );
    const row = existing.ok && Array.isArray(existing.data) ? existing.data[0] : null;
    if (row) {
      const startTime = Math.floor(Date.parse(row.offer_started_at || row.first_optin_at) / 1000);
      return jsonResponse(200, { success: true, alreadyExists: true, startTime });
    }

    const requested = Number(body.startTime);
    const startTime = Number.isFinite(requested) && requested > 0
      ? Math.floor(requested)
      : Math.floor(Date.now() / 1000);
    const firstOptinAt = new Date(startTime * 1000).toISOString();
    const saved = await supabaseUpsert('sv_registrations', {
      token,
      first_optin_at: firstOptinAt,
      offer_started_at: firstOptinAt,
      offer_expires_at: new Date((startTime + 7 * 24 * 60 * 60) * 1000).toISOString(),
      last_event_at: new Date().toISOString(),
    }, { onConflict: 'token' });
    if (!saved.ok) return jsonResponse(500, { error: "Impossible d'initialiser le token" });
    return jsonResponse(200, { success: true, startTime });
  } catch (error) {
    console.error('init-places-sv error:', error?.message || error);
    return jsonResponse(500, { error: 'Erreur serveur' });
  }
};
