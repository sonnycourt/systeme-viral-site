import { supabaseGet } from './lib/supabase-rest.mjs';

const HOURLY_THRESHOLDS = [
  { hours: 0, places: 15 },
  { hours: 24, places: 12 },
  { hours: 48, places: 8 },
  { hours: 72, places: 6 },
  { hours: 96, places: 4 },
  { hours: 120, places: 3 },
  { hours: 144, places: 2 },
  { hours: 168, places: 0 },
];

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: HEADERS });
}

function validToken(value) {
  return /^sv_[A-Za-z0-9_-]{6,156}$/.test(String(value || '').trim());
}

function calculatePlacesRemaining(startTime) {
  const elapsedHours = Math.max(0, (Date.now() / 1000 - startTime) / 3600);
  if (elapsedHours >= 168) return 0;
  let lower = HOURLY_THRESHOLDS[0];
  let upper = HOURLY_THRESHOLDS[1];
  for (let index = 0; index < HOURLY_THRESHOLDS.length - 1; index += 1) {
    if (elapsedHours >= HOURLY_THRESHOLDS[index].hours && elapsedHours < HOURLY_THRESHOLDS[index + 1].hours) {
      lower = HOURLY_THRESHOLDS[index];
      upper = HOURLY_THRESHOLDS[index + 1];
      break;
    }
  }
  const progress = (elapsedHours - lower.hours) / (upper.hours - lower.hours);
  return Math.max(0, Math.round(lower.places + (upper.places - lower.places) * progress));
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: HEADERS });
  if (request.method !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const token = new URL(request.url).searchParams.get('token')?.trim();
    if (!validToken(token)) return jsonResponse(200, { valid: false, error: 'Token invalide' });

    const result = await supabaseGet(
      `sv_registrations?token=eq.${encodeURIComponent(token)}&select=offer_started_at,first_optin_at&limit=1`,
    );
    if (!result.ok) return jsonResponse(500, { valid: false, error: 'Erreur de lecture' });
    const registration = Array.isArray(result.data) ? result.data[0] : null;
    if (!registration) return jsonResponse(200, { valid: false, error: 'Token non trouvé' });

    const startDate = registration.offer_started_at || registration.first_optin_at;
    const startTime = Math.floor(Date.parse(startDate) / 1000);
    if (!Number.isFinite(startTime)) return jsonResponse(200, { valid: false, error: 'Date invalide' });
    return jsonResponse(200, {
      valid: true,
      placesRemaining: calculatePlacesRemaining(startTime),
      startTime,
    });
  } catch (error) {
    console.error('check-places-sv error:', error?.message || error);
    return jsonResponse(500, { valid: false, error: 'Erreur serveur' });
  }
};
