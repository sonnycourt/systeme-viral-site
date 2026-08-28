import crypto from 'node:crypto';
import { supabaseGet, supabasePatch, supabasePost, supabaseUpsert } from './lib/supabase-rest.mjs';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function clean(value, max = 320) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function verifySignature(rawBody, headers) {
  const secretRaw = process.env.SPIFFY_SIGNING_SECRET;
  if (!secretRaw) return 'no_secret';
  const id = headers.get('webhook-id') || headers.get('svix-id');
  const timestamp = headers.get('webhook-timestamp') || headers.get('svix-timestamp');
  const signature = headers.get('webhook-signature') || headers.get('svix-signature');
  if (!id || !timestamp || !signature) return 'no_headers';
  try {
    const key = Buffer.from(secretRaw.replace(/^whsec_/, ''), 'base64');
    const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64');
    const valid = signature.split(' ').map((part) => part.split(',').pop()).some((provided) => (
      provided
      && provided.length === expected.length
      && crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    ));
    return valid ? 'ok' : 'invalid';
  } catch {
    return 'invalid';
  }
}

function findEmail(value, depth = 0) {
  if (!value || depth > 7) return '';
  if (typeof value === 'string') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? value.trim().toLowerCase() : '';
  if (typeof value !== 'object') return '';
  for (const key of ['email', 'customer_email', 'buyer_email']) {
    if (typeof value[key] === 'string' && value[key].includes('@')) return value[key].trim().toLowerCase();
  }
  for (const child of Object.values(value)) {
    const found = findEmail(child, depth + 1);
    if (found) return found;
  }
  return '';
}

function findFirstKey(value, keys, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 7) return '';
  for (const key of keys) {
    if (value[key] != null && clean(value[key])) return clean(value[key], 500);
  }
  for (const child of Object.values(value)) {
    const found = findFirstKey(child, keys, depth + 1);
    if (found) return found;
  }
  return '';
}

function findToken(value, depth = 0) {
  if (!value || depth > 7) return '';
  if (typeof value === 'string') {
    const match = value.match(/sv_[A-Za-z0-9_-]{6,156}/);
    return match ? match[0] : '';
  }
  if (typeof value !== 'object') return '';
  for (const key of ['sv_token', 'unique_token_sv']) {
    const token = clean(value[key], 160);
    if (/^sv_[A-Za-z0-9_-]{6,156}$/.test(token)) return token;
  }
  for (const child of Object.values(value)) {
    const found = findToken(child, depth + 1);
    if (found) return found;
  }
  return '';
}

function findNumber(value, keys, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 7) return null;
  for (const key of keys) {
    const parsed = Number(value[key]);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  for (const child of Object.values(value)) {
    const found = findNumber(child, keys, depth + 1);
    if (found != null) return found;
  }
  return null;
}

function amountMinor(body, refund = false) {
  const minorKeys = refund
    ? ['refund_amount_cents', 'refunded_cents', 'amount_refunded_cents']
    : ['total_cents', 'amount_cents', 'amount_total_cents', 'grand_total_cents'];
  const minor = findNumber(body, minorKeys);
  if (minor != null) return Math.round(minor);
  const majorKeys = refund
    ? ['refund_amount', 'refunded_amount', 'amount_refunded']
    : ['grand_total', 'amount_total', 'total', 'amount'];
  const major = findNumber(body, majorKeys);
  if (major == null) return 0;
  return Math.round(major > 10_000 ? major : major * 100);
}

function eventKind(body) {
  const raw = clean(body?.event || body?.type || body?.event_type || body?.data?.event, 160).toLowerCase();
  if (raw.includes('refund')) return 'refund';
  if (raw.includes('order') || raw.includes('purchase') || raw.includes('payment') || raw.includes('success')) return 'sale';
  return 'ignored';
}

async function findRegistration(token, email) {
  if (token) {
    const result = await supabaseGet(`sv_registrations?token=eq.${encodeURIComponent(token)}&select=*&limit=1`);
    if (result.ok && Array.isArray(result.data) && result.data[0]) return result.data[0];
  }
  if (email) {
    const result = await supabaseGet(`sv_registrations?email=eq.${encodeURIComponent(email)}&select=*&order=created_at.desc&limit=1`);
    if (result.ok && Array.isArray(result.data) && result.data[0]) return result.data[0];
  }
  return null;
}

async function refreshRegistrationTotals(token, kind, promoCode, purchasedAt) {
  const totals = await supabaseGet(
    `sv_conversions?token=eq.${encodeURIComponent(token)}&select=gross_minor,refunded_minor,net_minor,status,purchased_at,promo_code`,
  );
  const rows = totals.ok && Array.isArray(totals.data) ? totals.data : [];
  const gross = rows.reduce((sum, row) => sum + Number(row.gross_minor || 0), 0);
  const refunded = rows.reduce((sum, row) => sum + Number(row.refunded_minor || 0), 0);
  const net = rows.reduce((sum, row) => sum + Number(row.net_minor || 0), 0);
  const patch = {
    statut: kind === 'refund' && net <= 0 ? 'refunded' : 'purchased',
    purchase_status: kind === 'refund' && net <= 0 ? 'refunded' : 'paid',
    purchase_currency: 'EUR',
    purchase_gross_minor: gross,
    purchase_refunded_minor: refunded,
    purchase_net_minor: net,
    purchase_promo_code: promoCode || rows.find((row) => row.promo_code)?.promo_code || null,
    purchased_at: rows.map((row) => row.purchased_at).filter(Boolean).sort()[0] || purchasedAt,
    last_event_at: new Date().toISOString(),
  };
  return supabasePatch('sv_registrations', `token=eq.${encodeURIComponent(token)}`, patch);
}

export default async (request) => {
  if (request.method === 'OPTIONS') return jsonResponse(200, { ok: true });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const rawBody = await request.text();
    const signature = verifySignature(rawBody, request.headers);
    if (signature === 'invalid') return jsonResponse(401, { error: 'invalid_signature' });
    if (signature !== 'ok') console.warn(`sv-spiffy-webhook signature=${signature}`);

    let body = {};
    try { body = JSON.parse(rawBody); } catch { return jsonResponse(400, { error: 'invalid_json' }); }
    const kind = eventKind(body);
    if (kind === 'ignored') return jsonResponse(200, { ok: true, type: 'ignored' });

    const email = findEmail(body);
    const payloadToken = findToken(body);
    const registration = await findRegistration(payloadToken, email);
    const token = registration?.token || payloadToken || null;
    const orderId = findFirstKey(body, ['order_id', 'orderId', 'order_uuid', 'transaction_id', 'transactionId', 'payment_id'])
      || request.headers.get('webhook-id')
      || crypto.createHash('sha256').update(rawBody).digest('hex').slice(0, 40);
    const promoCode = findFirstKey(body, ['promo_code', 'coupon_code', 'discount_code', 'code']) || null;
    const currency = (findFirstKey(body, ['currency', 'currency_code']) || 'EUR').toUpperCase().slice(0, 3);
    const purchasedAtRaw = findFirstKey(body, ['purchased_at', 'paid_at', 'created_at', 'order_date']);
    const purchasedAt = Number.isFinite(Date.parse(purchasedAtRaw)) ? new Date(purchasedAtRaw).toISOString() : new Date().toISOString();

    const previous = await supabaseGet(
      `sv_conversions?external_order_id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
    );
    const old = previous.ok && Array.isArray(previous.data) ? previous.data[0] || {} : {};
    const incoming = amountMinor(body, kind === 'refund');
    const grossMinor = kind === 'sale' ? Math.max(Number(old.gross_minor || 0), incoming) : Number(old.gross_minor || 0);
    const refundedMinor = kind === 'refund' ? Math.max(Number(old.refunded_minor || 0), incoming || grossMinor) : Number(old.refunded_minor || 0);
    const netMinor = Math.max(0, grossMinor - refundedMinor);
    const saved = await supabaseUpsert('sv_conversions', {
      external_order_id: orderId,
      token,
      email: email || registration?.email || null,
      provider: 'spiffy',
      status: kind === 'refund' ? 'refunded' : 'paid',
      currency,
      gross_minor: grossMinor,
      refunded_minor: refundedMinor,
      net_minor: netMinor,
      promo_code: promoCode,
      purchased_at: old.purchased_at || purchasedAt,
      metadata: {
        event_type: clean(body?.event || body?.type, 160),
        checkout_id: findFirstKey(body, ['checkout_id', 'checkoutId', 'checkout_uuid', 'offer_id']) || null,
      },
    }, { onConflict: 'external_order_id' });
    if (!saved.ok) {
      console.error('sv-spiffy-webhook conversion save failed:', saved.status);
      return jsonResponse(200, { ok: false, error: 'save_failed' });
    }

    if (registration?.token) {
      await refreshRegistrationTotals(registration.token, kind, promoCode, purchasedAt);
      const eventName = kind === 'refund' ? 'refund_completed' : 'purchase_completed';
      const event = await supabasePost('sv_funnel_events', {
        token: registration.token,
        visitor_id: registration.visitor_id || null,
        session_id: null,
        event_name: eventName,
        event_value: String(kind === 'refund' ? refundedMinor : grossMinor),
        page_path: '/spiffy-webhook',
        metadata: { order_id: orderId, currency, promo_code: promoCode },
        dedupe_key: `${eventName}_${orderId}`.slice(0, 240),
      }, { prefer: 'return=minimal' });
      if (!event.ok && event.status !== 409) console.error('sv-spiffy-webhook event save failed:', event.status);
    }

    return jsonResponse(200, {
      ok: true,
      type: kind,
      matched: Boolean(registration),
      order_id: orderId,
    });
  } catch (error) {
    console.error('sv-spiffy-webhook error:', error?.message || error);
    return jsonResponse(200, { ok: false });
  }
};
