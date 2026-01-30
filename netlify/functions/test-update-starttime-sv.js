import { getStore } from '@netlify/blobs';

export default async (request, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const hoursAgo = parseInt(url.searchParams.get('hoursAgo') || '0');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token manquant' }), { status: 400, headers });
  }

  const store = getStore('sv-places-tokens');
  const newStartTime = Math.floor(Date.now() / 1000) - (hoursAgo * 3600);

  await store.set(token, JSON.stringify({ startTime: newStartTime }));

  return new Response(JSON.stringify({
    success: true,
    token,
    hoursAgo,
    newStartTime
  }), { status: 200, headers });
};
