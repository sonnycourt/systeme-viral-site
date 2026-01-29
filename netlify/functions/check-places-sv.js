// Fonction Netlify pour récupérer les places restantes à partir du token SV
// Utilise Netlify Blobs (sv-places-tokens) — même logique que sonnycourt manifest
// Paliers : 0h→15, 24h→12, 48h→8, 72h→6, 96h→4, 120h→3, 144h→2, 168h→0

import { getStore } from '@netlify/blobs';

const HOURLY_THRESHOLDS = [
  { hours: 0, places: 15 },
  { hours: 24, places: 12 },
  { hours: 48, places: 8 },
  { hours: 72, places: 6 },
  { hours: 96, places: 4 },
  { hours: 120, places: 3 },
  { hours: 144, places: 2 },
  { hours: 168, places: 0 }
];

function calculatePlacesRemaining(startTime) {
  const now = Math.floor(Date.now() / 1000);
  const elapsedSeconds = now - startTime;
  const elapsedHours = elapsedSeconds / 3600;

  if (elapsedHours >= 168) return 0;

  let lower = HOURLY_THRESHOLDS[0];
  let upper = HOURLY_THRESHOLDS[HOURLY_THRESHOLDS.length - 1];
  for (let i = 0; i < HOURLY_THRESHOLDS.length - 1; i++) {
    if (elapsedHours >= HOURLY_THRESHOLDS[i].hours && elapsedHours < HOURLY_THRESHOLDS[i + 1].hours) {
      lower = HOURLY_THRESHOLDS[i];
      upper = HOURLY_THRESHOLDS[i + 1];
      break;
    }
  }
  const hoursDiff = upper.hours - lower.hours;
  const placesDiff = upper.places - lower.places;
  const progress = hoursDiff ? (elapsedHours - lower.hours) / hoursDiff : 0;
  const interpolated = lower.places + placesDiff * progress;
  return Math.max(0, Math.round(interpolated));
}

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }
  if (event.httpMethod !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const token = event.queryStringParameters?.token || null;
    if (!token) {
      return new Response(JSON.stringify({ valid: false, error: 'Token manquant' }), { status: 200, headers });
    }

    const store = getStore('sv-places-tokens');
    const raw = await store.get(token);
    if (!raw) {
      return new Response(JSON.stringify({ valid: false, error: 'Token non trouvé' }), { status: 200, headers });
    }

    const data = JSON.parse(raw);
    const startTime = data.startTime;
    const placesRemaining = calculatePlacesRemaining(startTime);

    return new Response(JSON.stringify({
      valid: true,
      placesRemaining,
      startTime
    }), { status: 200, headers });
  } catch (err) {
    console.error('check-places-sv error:', err);
    return new Response(JSON.stringify({ valid: false, error: 'Erreur serveur' }), { status: 500, headers });
  }
}
