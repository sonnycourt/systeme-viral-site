import { supabaseGet, supabasePatch, supabasePost, supabaseUpsert } from './lib/supabase-rest.mjs';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'popup_open',
  'lead_submit',
  'lead_captured',
  'phone_captured',
  'vsl_viewed',
  'vsl_started',
  'vsl_progress',
  'vsl_completed',
  'offer_revealed',
  'offer_clicked',
  'offer_viewed',
  'sales_scroll',
  'checkout_clicked',
  'checkout_viewed',
  'purchase_completed',
  'refund_completed',
]);

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

function clean(value, max = 240) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function cleanToken(value) {
  const token = clean(value, 160);
  return /^sv_[A-Za-z0-9_-]{6,156}$/.test(token) ? token : '';
}

function positiveInt(value, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(0, Math.floor(parsed))) : 0;
}

function sanitizeMeta(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const result = {};
  for (const [key, limit] of Object.entries({
    page_title: 180,
    referrer: 500,
    button_id: 100,
    section: 80,
    checkout_host: 160,
    traffic_source: 80,
    utm_source: 120,
    utm_medium: 120,
    utm_campaign: 180,
    utm_term: 180,
    utm_content: 240,
    fbclid: 300,
    gclid: 300,
    ttclid: 300,
  })) {
    const text = clean(source[key], limit);
    if (text) result[key] = text;
  }
  if (source.percent != null) result.percent = positiveInt(source.percent, 100);
  if (source.seconds != null) result.seconds = positiveInt(source.seconds, 86400);
  if (source.duration != null) result.duration = positiveInt(source.duration, 86400);
  if (source.milestone != null) result.milestone = positiveInt(source.milestone, 100);
  return result;
}

function timestampFromToken(token) {
  const raw = Number(token.split('_')[1]);
  if (Number.isFinite(raw) && raw >= 1_700_000_000_000 && raw <= Date.now() + 86_400_000) {
    return new Date(raw).toISOString();
  }
  return new Date().toISOString();
}

function dedupeKey(eventName, value, meta, sessionId, pagePath) {
  if (eventName === 'vsl_progress') return `vsl_progress_${positiveInt(meta.milestone || meta.percent, 100)}`;
  if (eventName === 'sales_scroll') return `sales_scroll_${positiveInt(meta.percent, 100)}`;
  if (eventName === 'vsl_started' || eventName === 'vsl_completed' || eventName === 'offer_revealed') return eventName;
  if (eventName === 'page_view' && sessionId) return `page_view_${sessionId}_${pagePath}`.slice(0, 240);
  if (eventName === 'checkout_clicked' && value) return `checkout_clicked_${sessionId || 'session'}_${clean(value, 80)}`.slice(0, 240);
  return null;
}

async function ensureRegistration(token) {
  const found = await supabaseGet(`sv_registrations?token=eq.${encodeURIComponent(token)}&select=*&limit=1`);
  if (found.ok && Array.isArray(found.data) && found.data[0]) return found.data[0];

  const firstOptinAt = timestampFromToken(token);
  const created = await supabaseUpsert('sv_registrations', {
    token,
    first_optin_at: firstOptinAt,
    offer_started_at: firstOptinAt,
    offer_expires_at: new Date(Date.parse(firstOptinAt) + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'token' });
  return created.ok && Array.isArray(created.data) ? created.data[0] || null : null;
}

function registrationPatch(eventName, meta, row) {
  const nowIso = new Date().toISOString();
  const patch = { last_event_at: nowIso };
  const seconds = positiveInt(meta.seconds, 86400);
  const percent = positiveInt(meta.percent, 100);
  if (eventName === 'vsl_viewed') {
    patch.vsl_first_view_at = row.vsl_first_view_at || nowIso;
    patch.vsl_last_view_at = nowIso;
  }
  if (eventName === 'vsl_started') {
    patch.vsl_started_at = row.vsl_started_at || nowIso;
    patch.vsl_first_view_at = row.vsl_first_view_at || nowIso;
    patch.vsl_last_view_at = nowIso;
  }
  if (eventName === 'vsl_progress') {
    patch.vsl_max_seconds = Math.max(positiveInt(row.vsl_max_seconds), seconds);
    patch.vsl_max_percent = Math.max(positiveInt(row.vsl_max_percent, 100), percent);
    patch.vsl_last_view_at = nowIso;
  }
  if (eventName === 'vsl_completed') {
    patch.vsl_completed_at = row.vsl_completed_at || nowIso;
    patch.vsl_max_percent = 100;
    patch.vsl_max_seconds = Math.max(positiveInt(row.vsl_max_seconds), seconds);
    patch.vsl_last_view_at = nowIso;
  }
  if (eventName === 'offer_revealed' || eventName === 'offer_viewed') {
    patch.offer_viewed_at = row.offer_viewed_at || nowIso;
  }
  if (eventName === 'offer_clicked') patch.offer_clicked_at = row.offer_clicked_at || nowIso;
  if (eventName === 'checkout_clicked') patch.checkout_clicked_at = row.checkout_clicked_at || nowIso;
  if (eventName === 'checkout_viewed') patch.checkout_viewed_at = row.checkout_viewed_at || nowIso;
  if (eventName === 'purchase_completed') {
    patch.statut = 'purchased';
    patch.purchase_status = 'paid';
    patch.purchased_at = row.purchased_at || nowIso;
  }
  if (eventName === 'refund_completed') {
    patch.statut = 'refunded';
    patch.purchase_status = 'refunded';
  }
  return patch;
}

async function updateVideo(token, sessionId, eventName, meta) {
  if (!['vsl_started', 'vsl_progress', 'vsl_completed'].includes(eventName)) return;
  const existing = await supabaseGet(
    `sv_video_progress?token=eq.${encodeURIComponent(token)}&video_id=eq.sv-freegift-vsl&select=*&limit=1`,
  );
  const row = existing.ok && Array.isArray(existing.data) ? existing.data[0] || {} : {};
  const nowIso = new Date().toISOString();
  const seconds = positiveInt(meta.seconds, 86400);
  const percent = eventName === 'vsl_completed' ? 100 : positiveInt(meta.percent, 100);
  const result = await supabaseUpsert('sv_video_progress', {
    token,
    video_id: 'sv-freegift-vsl',
    session_id: sessionId || row.session_id || null,
    first_play_at: row.first_play_at || (eventName === 'vsl_started' ? nowIso : null),
    last_signal_at: nowIso,
    max_seconds: Math.max(positiveInt(row.max_seconds), seconds),
    max_percent: Math.max(positiveInt(row.max_percent, 100), percent),
    completed_at: row.completed_at || (eventName === 'vsl_completed' ? nowIso : null),
  }, { onConflict: 'token,video_id' });
  if (!result.ok) console.error('sv-track video update failed:', result.status);
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: HEADERS });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const body = await request.json().catch(() => ({}));
    const eventName = clean(body.event, 64);
    if (!ALLOWED_EVENTS.has(eventName)) return jsonResponse(400, { error: 'Événement invalide' });

    const token = cleanToken(body.token);
    const visitorId = clean(body.visitor_id, 120);
    const sessionId = clean(body.session_id, 120);
    const pagePath = clean(body.page_path, 500);
    if (!token && !visitorId) return jsonResponse(400, { error: 'Visiteur manquant' });
    const meta = sanitizeMeta(body.meta);
    const eventValue = body.value == null ? null : clean(body.value, 500);

    let registration = null;
    if (token) {
      registration = await ensureRegistration(token);
      if (!registration) return jsonResponse(500, { error: 'Impossible de préparer le suivi' });
      const patch = registrationPatch(eventName, meta, registration);
      if (!registration.visitor_id && visitorId) patch.visitor_id = visitorId;
      if (sessionId) patch.session_id = sessionId;
      const updated = await supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(token)}`, patch);
      if (!updated.ok) return jsonResponse(500, { error: 'Impossible de mettre à jour le suivi' });
      await updateVideo(token, sessionId, eventName, meta);
    }

    const inserted = await supabasePost('sv_funnel_events', {
      token: token || null,
      visitor_id: visitorId || registration?.visitor_id || null,
      session_id: sessionId || null,
      event_name: eventName,
      event_value: eventValue,
      page_path: pagePath || null,
      metadata: meta,
      dedupe_key: token ? dedupeKey(eventName, eventValue, meta, sessionId, pagePath) : null,
    }, { prefer: 'return=minimal' });
    if (!inserted.ok && inserted.status !== 409) {
      console.error('sv-track event insert failed:', inserted.status);
      return jsonResponse(500, { error: "Impossible d'enregistrer l'événement" });
    }
    return jsonResponse(200, { ok: true, duplicate: inserted.status === 409 });
  } catch (error) {
    console.error('sv-track error:', error?.message || error);
    return jsonResponse(500, { error: 'Erreur serveur' });
  }
};
