import { randomUUID } from 'node:crypto';
import { supabaseGet, supabasePatch, supabasePost, supabaseUpsert } from './lib/supabase-rest.mjs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

function clean(value, max = 240) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function cleanEmail(value) {
  const email = clean(value, 320).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function cleanToken(value) {
  const token = clean(value, 160);
  return /^sv_[A-Za-z0-9_-]{6,156}$/.test(token) ? token : '';
}

function newToken() {
  return `sv_${Date.now()}_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

function validIso(value) {
  const timestamp = Date.parse(String(value || ''));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : '';
}

function attributionFrom(body) {
  const attribution = body?.attribution && typeof body.attribution === 'object'
    ? body.attribution
    : body;
  const utmSource = clean(attribution.utm_source, 120) || null;
  const fbclid = clean(attribution.fbclid, 300) || null;
  const gclid = clean(attribution.gclid, 300) || null;
  const ttclid = clean(attribution.ttclid, 300) || null;
  let trafficSource = clean(attribution.traffic_source, 80) || null;
  if (!trafficSource) {
    if (fbclid || /facebook|instagram|meta/i.test(utmSource || '')) trafficSource = 'meta_ad';
    else if (ttclid || /tiktok/i.test(utmSource || '')) trafficSource = 'tiktok_ad';
    else if (gclid || /google/i.test(utmSource || '')) trafficSource = 'google_ad';
    else trafficSource = utmSource || 'direct';
  }
  return {
    visitor_id: clean(attribution.visitor_id, 120) || null,
    session_id: clean(attribution.session_id, 120) || null,
    landing_page: clean(attribution.landing_page, 500) || null,
    referrer: clean(attribution.referrer, 500) || null,
    traffic_source: trafficSource,
    utm_source: utmSource,
    utm_medium: clean(attribution.utm_medium, 120) || null,
    utm_campaign: clean(attribution.utm_campaign, 180) || null,
    utm_term: clean(attribution.utm_term, 180) || null,
    utm_content: clean(attribution.utm_content, 240) || null,
    fbclid,
    meta_fbc: clean(attribution.meta_fbc, 300) || null,
    meta_fbp: clean(attribution.meta_fbp, 300) || null,
    gclid,
    ttclid,
  };
}

function compact(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null && value !== undefined && value !== ''));
}

async function getSubscriberByEmail(email, apiKey) {
  try {
    const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (response.status === 404) return { exists: false, data: null };
    if (!response.ok) return { exists: false, data: null };
    const data = await response.json();
    return { exists: true, data: data.data };
  } catch (error) {
    console.error('subscribe MailerLite lookup failed:', error?.message || error);
    return { exists: false, data: null };
  }
}

async function postToMailerLite(path, data, apiKey) {
  const response = await fetch(`https://connect.mailerlite.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
  return { status: response.status, data: await response.json().catch(() => ({})) };
}

async function registrationByEmail(email) {
  const result = await supabaseGet(
    `sv_registrations?email=eq.${encodeURIComponent(email)}&select=*&order=created_at.asc&limit=1`,
  );
  return result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
}

async function registrationByToken(token) {
  if (!token) return null;
  const result = await supabaseGet(
    `sv_registrations?token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
  );
  return result.ok && Array.isArray(result.data) ? result.data[0] || null : null;
}

async function recordEvent(token, eventName, { visitorId, sessionId, pagePath, metadata = {}, dedupeKey = null } = {}) {
  const result = await supabasePost('sv_funnel_events', {
    token,
    visitor_id: visitorId || null,
    session_id: sessionId || null,
    event_name: eventName,
    page_path: pagePath || null,
    metadata,
    dedupe_key: dedupeKey,
  }, { prefer: 'return=minimal' });
  if (!result.ok && result.status !== 409) {
    console.error('subscribe event insert failed:', result.status);
  }
}

async function linkAnonymousEvents(token, visitorId) {
  if (!visitorId) return;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const result = await supabasePatch(
    'sv_funnel_events',
    `token=is.null&visitor_id=eq.${encodeURIComponent(visitorId)}&occurred_at=gte.${encodeURIComponent(since)}`,
    { token },
    { prefer: 'return=minimal' },
  );
  if (!result.ok) console.error('subscribe anonymous event linking failed:', result.status);
}

async function savePhone({ email, token, phone, country, attribution, step, apiKey }) {
  const row = (await registrationByToken(token)) || (await registrationByEmail(email));
  const nowIso = new Date().toISOString();
  if (row) {
    const updated = await supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(row.token)}`, compact({
      telephone: phone,
      pays: country,
      statut: row.statut === 'purchased' ? 'purchased' : 'registered',
      phone_added_at: row.phone_added_at || nowIso,
      last_event_at: nowIso,
      visitor_id: row.visitor_id || attribution.visitor_id,
      session_id: attribution.session_id || row.session_id,
    }));
    if (!updated.ok) return jsonResponse(500, { error: 'Impossible de sauvegarder le téléphone' });
    await recordEvent(row.token, 'phone_captured', {
      visitorId: attribution.visitor_id,
      sessionId: attribution.session_id,
      pagePath: '/inscription',
      metadata: compact({ country }),
      dedupeKey: 'phone_captured',
    });
    token = row.token;
  }

  const mailerLite = await postToMailerLite('/api/subscribers', {
    email,
    fields: compact({
      phone,
      step,
      utm_source: attribution.utm_source,
      utm_content: attribution.utm_content,
    }),
  }, apiKey);
  if (mailerLite.status < 200 || mailerLite.status >= 300) {
    console.error('subscribe MailerLite phone update failed:', mailerLite.status);
    return jsonResponse(502, { error: 'Le téléphone a été sauvegardé, mais la synchronisation email a échoué' });
  }

  if (token) {
    await supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(token)}`, {
      mailerlite_synced_at: new Date().toISOString(),
    }, { prefer: 'return=minimal' });
  }
  return jsonResponse(200, {
    success: true,
    step,
    uniqueTokenSV: token || null,
    redirect: '/100k-masterclass',
  });
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: CORS_HEADERS });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const body = await request.json().catch(() => ({}));
    const email = cleanEmail(body.email);
    const step = clean(body.step, 2);
    if (!email || !step) return jsonResponse(400, { error: 'Email ou étape invalide' });

    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID_EVERGREEN_2026;
    if (!apiKey || !groupId) return jsonResponse(500, { error: 'Configuration MailerLite manquante' });

    const attribution = attributionFrom(body);
    const requestedToken = cleanToken(body.uniqueTokenSV);

    if (step === '1') {
      const existingRegistration = await registrationByEmail(email);
      const existingSubscriber = await getSubscriberByEmail(email, apiKey);
      const fields = existingSubscriber.data?.fields || {};
      const legacyToken = cleanToken(fields.unique_token_sv);
      const token = existingRegistration?.token || legacyToken || requestedToken || newToken();
      const firstOptinAt = existingRegistration?.first_optin_at
        || validIso(fields.first_optin_date)
        || new Date().toISOString();
      const offerExpiresAt = existingRegistration?.offer_expires_at
        || new Date(Date.parse(firstOptinAt) + 7 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      const registrationPayload = compact({
        token,
        email,
        prenom: clean(body.name, 120),
        statut: existingRegistration?.statut || 'partial',
        ...attribution,
        first_optin_at: firstOptinAt,
        offer_started_at: existingRegistration?.offer_started_at || firstOptinAt,
        offer_expires_at: offerExpiresAt,
        last_event_at: nowIso,
      });
      const saved = existingRegistration
        ? await supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(token)}`, registrationPayload)
        : await supabaseUpsert('sv_registrations', registrationPayload, { onConflict: 'token' });
      if (!saved.ok) {
        console.error('subscribe registration save failed:', saved.status);
        return jsonResponse(500, { error: "Impossible d'enregistrer l'inscription" });
      }

      await linkAnonymousEvents(token, attribution.visitor_id);
      await recordEvent(token, 'lead_captured', {
        visitorId: attribution.visitor_id,
        sessionId: attribution.session_id,
        pagePath: '/inscription',
        metadata: compact({ traffic_source: attribution.traffic_source }),
        dedupeKey: 'lead_captured',
      });

      const mailerLite = await postToMailerLite('/api/subscribers', {
        email,
        fields: compact({
          name: clean(body.name, 120),
          step: '1',
          unique_token_sv: token,
          first_optin_date: firstOptinAt,
          utm_source: attribution.utm_source,
          utm_content: attribution.utm_content,
        }),
        groups: [groupId],
      }, apiKey);
      if (mailerLite.status < 200 || mailerLite.status >= 300) {
        console.error('subscribe MailerLite lead sync failed:', mailerLite.status);
        return jsonResponse(502, { error: "L'inscription a été sauvegardée, mais la synchronisation email a échoué" });
      }
      await supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(token)}`, {
        mailerlite_synced_at: new Date().toISOString(),
      }, { prefer: 'return=minimal' });

      return jsonResponse(200, {
        success: true,
        step: '1',
        uniqueTokenSV: token,
        isReturning: Boolean(existingRegistration || existingSubscriber.exists),
        firstOptinDate: firstOptinAt,
      });
    }

    const phone = clean(body.phone, 60);
    const country = clean(body.country, 8).toUpperCase() || null;
    if ((step === '2' && phone) || step === '3') {
      if (!phone) return jsonResponse(400, { error: 'Téléphone manquant' });
      return savePhone({ email, token: requestedToken, phone, country, attribution, step, apiKey });
    }

    if (step === '2') {
      const avatar = clean(body.avatar, 40);
      if (!avatar) return jsonResponse(400, { error: 'Profil manquant' });
      const tag = avatar === 'entrepreneur' ? 'entrepreneur' : avatar === 'influenceur' ? 'influenceur' : 'employe';
      const mailerLite = await postToMailerLite('/api/subscribers', {
        email,
        fields: compact({
          avatar,
          tag,
          step: '2',
          utm_source: attribution.utm_source,
          utm_content: attribution.utm_content,
        }),
      }, apiKey);
      if (mailerLite.status < 200 || mailerLite.status >= 300) {
        return jsonResponse(502, { error: 'Impossible de sauvegarder le profil' });
      }
      return jsonResponse(200, { success: true, step: '2' });
    }

    return jsonResponse(400, { error: 'Étape invalide' });
  } catch (error) {
    console.error('subscribe error:', error?.message || error);
    return jsonResponse(500, { error: 'Erreur serveur' });
  }
};
