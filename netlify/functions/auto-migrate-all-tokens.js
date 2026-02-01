// Fonction qui récupère TOUS les subscribers de MailerLite et migre leurs tokens vers Blobs
// Un seul appel GET et c'est fait : /.netlify/functions/auto-migrate-all-tokens

import { getStore } from '@netlify/blobs';

async function getAllSubscribersFromMailerLite(apiKey, groupId) {
  const subscribers = [];
  let cursor = null;
  
  do {
    const url = cursor 
      ? `https://connect.mailerlite.com/api/subscribers?filter[groups]=${groupId}&limit=100&cursor=${cursor}`
      : `https://connect.mailerlite.com/api/subscribers?filter[groups]=${groupId}&limit=100`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('MailerLite API error:', response.status);
      break;
    }
    
    const data = await response.json();
    subscribers.push(...(data.data || []));
    
    // Pagination
    cursor = data.meta?.next_cursor || null;
    
  } while (cursor);
  
  return subscribers;
}

export default async (request, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'GET only' }), { status: 405, headers });
  }

  const API_KEY = process.env.MAILERLITE_API_KEY;
  const GROUP_ID = process.env.MAILERLITE_GROUP_ID_EVERGREEN_2026;

  if (!API_KEY || !GROUP_ID) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500, headers });
  }

  try {
    console.log('Fetching all subscribers from MailerLite...');
    const subscribers = await getAllSubscribersFromMailerLite(API_KEY, GROUP_ID);
    console.log(`Found ${subscribers.length} subscribers`);

    const store = getStore('sv-places-tokens');
    const results = { migrated: 0, skipped: 0, errors: 0, details: [] };

    for (const sub of subscribers) {
      const fields = sub.fields || {};
      const token = fields.unique_token_sv;
      const firstOptinDate = fields.first_optin_date;

      if (!token || !token.startsWith('sv_')) {
        results.skipped++;
        results.details.push({ email: sub.email, status: 'skipped', reason: 'no token' });
        continue;
      }

      if (!firstOptinDate) {
        results.skipped++;
        results.details.push({ email: sub.email, token, status: 'skipped', reason: 'no date' });
        continue;
      }

      const startTime = Math.floor(new Date(firstOptinDate).getTime() / 1000);
      
      if (isNaN(startTime) || startTime <= 0) {
        results.errors++;
        results.details.push({ email: sub.email, token, status: 'error', reason: 'invalid date' });
        continue;
      }

      // Vérifier si existe déjà
      const existing = await store.get(token);
      if (existing) {
        results.skipped++;
        results.details.push({ email: sub.email, token, status: 'skipped', reason: 'already in Blobs' });
        continue;
      }

      // Migrer
      await store.set(token, JSON.stringify({ startTime }));
      results.migrated++;
      results.details.push({ email: sub.email, token, startTime, status: 'migrated' });
    }

    console.log(`Migration complete: ${results.migrated} migrated, ${results.skipped} skipped, ${results.errors} errors`);

    return new Response(JSON.stringify({
      success: true,
      totalSubscribers: subscribers.length,
      migrated: results.migrated,
      skipped: results.skipped,
      errors: results.errors,
      details: results.details
    }), { status: 200, headers });

  } catch (error) {
    console.error('Auto-migration error:', error);
    return new Response(JSON.stringify({ error: 'Migration failed', details: error.message }), { status: 500, headers });
  }
};
