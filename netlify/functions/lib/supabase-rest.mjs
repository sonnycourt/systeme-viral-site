const ALLOWED_TABLES = new Set([
  'sv_registrations',
  'sv_funnel_events',
  'sv_video_progress',
  'sv_conversions',
]);

export function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function headers(extra = {}) {
  const { key } = getSupabaseConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function validateTable(table) {
  return ALLOWED_TABLES.has(table) ? table : '';
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return {
    ok: response.ok,
    status: response.status,
    data,
    error: response.ok ? null : data,
  };
}

function missingConfig() {
  const { url, key } = getSupabaseConfig();
  return !url || !key;
}

export async function supabaseGet(path) {
  const { url } = getSupabaseConfig();
  if (missingConfig()) {
    return { ok: false, status: 500, data: null, error: 'Supabase non configuré' };
  }
  return parseResponse(await fetch(`${url}/rest/v1/${path}`, { headers: headers() }));
}

export async function supabasePost(table, body, { prefer = 'return=representation' } = {}) {
  const { url } = getSupabaseConfig();
  const safeTable = validateTable(table);
  if (!safeTable) return { ok: false, status: 400, data: null, error: 'Table invalide' };
  if (missingConfig()) {
    return { ok: false, status: 500, data: null, error: 'Supabase non configuré' };
  }
  return parseResponse(await fetch(`${url}/rest/v1/${safeTable}`, {
    method: 'POST',
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(body),
  }));
}

export async function supabaseUpsert(table, body, { onConflict, prefer = 'resolution=merge-duplicates,return=representation' } = {}) {
  const { url } = getSupabaseConfig();
  const safeTable = validateTable(table);
  if (!safeTable) return { ok: false, status: 400, data: null, error: 'Table invalide' };
  if (missingConfig()) {
    return { ok: false, status: 500, data: null, error: 'Supabase non configuré' };
  }
  const query = new URLSearchParams();
  if (onConflict) query.set('on_conflict', String(onConflict));
  return parseResponse(await fetch(`${url}/rest/v1/${safeTable}${query.size ? `?${query}` : ''}`, {
    method: 'POST',
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(body),
  }));
}

export async function supabasePatch(table, query, body, { prefer = 'return=representation' } = {}) {
  const { url } = getSupabaseConfig();
  const safeTable = validateTable(table);
  if (!safeTable) return { ok: false, status: 400, data: null, error: 'Table invalide' };
  if (missingConfig()) {
    return { ok: false, status: 500, data: null, error: 'Supabase non configuré' };
  }
  return parseResponse(await fetch(`${url}/rest/v1/${safeTable}?${query}`, {
    method: 'PATCH',
    headers: headers({ Prefer: prefer }),
    body: JSON.stringify(body),
  }));
}
