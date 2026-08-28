(function () {
  'use strict';

  var STORAGE = {
    visitor: 'sv_visitor_id',
    session: 'sv_session_id',
    token: 'unique_token_sv',
    attribution: 'sv_attribution',
  };
  var FUNNEL_ROUTES = ['/inscription', '/100k-masterclass', '/offre-speciale', '/offre-speciale-promo', '/direct-checkout'];

  function safeStorage(storage, action, key, value) {
    try {
      if (action === 'get') return storage.getItem(key);
      storage.setItem(key, value);
    } catch (_) {}
    return null;
  }

  function id(prefix) {
    var random = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return prefix + '_' + random.slice(0, 24);
  }

  function getOrCreate(storage, key, prefix) {
    var current = safeStorage(storage, 'get', key);
    if (current) return current;
    current = id(prefix);
    safeStorage(storage, 'set', key, current);
    return current;
  }

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function parseJson(value) {
    try { return value ? JSON.parse(value) : {}; } catch (_) { return {}; }
  }

  function detectTrafficSource(values) {
    var source = String(values.utm_source || '').toLowerCase();
    if (values.fbclid || /facebook|instagram|meta/.test(source)) return 'meta_ad';
    if (values.ttclid || /tiktok/.test(source)) return 'tiktok_ad';
    if (values.gclid || /google/.test(source)) return 'google_ad';
    if (source) return source;
    var referrer = document.referrer.toLowerCase();
    if (/facebook|instagram/.test(referrer)) return 'meta_organic';
    if (/tiktok/.test(referrer)) return 'tiktok_organic';
    if (/google|bing|duckduckgo/.test(referrer)) return 'organic_search';
    return referrer ? 'referral' : 'direct';
  }

  function captureAttribution() {
    var previous = parseJson(safeStorage(localStorage, 'get', STORAGE.attribution));
    var params = new URLSearchParams(window.location.search);
    var next = Object.assign({}, previous);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid'].forEach(function (key) {
      var value = params.get(key);
      if (value) next[key] = value.slice(0, 300);
    });
    if (!next.landing_page) next.landing_page = window.location.pathname + window.location.search;
    if (!next.referrer && document.referrer) next.referrer = document.referrer;
    next.meta_fbp = cookie('_fbp') || next.meta_fbp || '';
    next.meta_fbc = cookie('_fbc') || next.meta_fbc || '';
    if (!next.meta_fbc && next.fbclid) next.meta_fbc = 'fb.1.' + Date.now() + '.' + next.fbclid;
    next.traffic_source = detectTrafficSource(next);
    safeStorage(localStorage, 'set', STORAGE.attribution, JSON.stringify(next));
    return next;
  }

  function validToken(value) {
    return /^sv_[A-Za-z0-9_-]{6,156}$/.test(String(value || ''));
  }

  var visitorId = getOrCreate(localStorage, STORAGE.visitor, 'svv');
  var sessionId = getOrCreate(sessionStorage, STORAGE.session, 'svs');
  var urlToken = new URLSearchParams(window.location.search).get('token');
  if (validToken(urlToken)) safeStorage(localStorage, 'set', STORAGE.token, urlToken);
  var attribution = captureAttribution();

  function getToken() {
    var token = safeStorage(localStorage, 'get', STORAGE.token);
    return validToken(token) ? token : '';
  }

  function setToken(token) {
    if (!validToken(token)) return false;
    safeStorage(localStorage, 'set', STORAGE.token, token);
    return true;
  }

  function context() {
    attribution = captureAttribution();
    return Object.assign({
      token: getToken(),
      visitor_id: visitorId,
      session_id: sessionId,
    }, attribution);
  }

  function track(eventName, value, meta) {
    var current = context();
    var payload = {
      event: eventName,
      value: value == null ? null : String(value).slice(0, 500),
      token: current.token || null,
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: window.location.pathname,
      meta: Object.assign({
        page_title: document.title,
        referrer: document.referrer || '',
        traffic_source: current.traffic_source || '',
        utm_source: current.utm_source || '',
        utm_medium: current.utm_medium || '',
        utm_campaign: current.utm_campaign || '',
        utm_term: current.utm_term || '',
        utm_content: current.utm_content || '',
        fbclid: current.fbclid || '',
        gclid: current.gclid || '',
        ttclid: current.ttclid || '',
      }, meta || {}),
    };
    fetch('/.netlify/functions/sv-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {});
  }

  function enrichCheckoutLink(link) {
    try {
      var href = link.getAttribute('href') || '';
      if (!href || href.indexOf('systemeviral.spiffy.co') === -1) return;
      var url = new URL(href, window.location.href);
      var current = context();
      if (current.token) url.searchParams.set('sv_token', current.token);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid'].forEach(function (key) {
        if (current[key] && !url.searchParams.has(key)) url.searchParams.set(key, current[key]);
      });
      link.setAttribute('href', url.toString());
    } catch (_) {}
  }

  function initializePageTracking() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    if (FUNNEL_ROUTES.indexOf(path) !== -1) track('page_view');
    if (path === '/100k-masterclass') track('vsl_viewed');
    if (path === '/offre-speciale' || path === '/offre-speciale-promo') track('offer_viewed');
    if (path === '/direct-checkout') track('checkout_viewed');

    document.querySelectorAll('a[href*="systemeviral.spiffy.co"]').forEach(enrichCheckoutLink);
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[href*="systemeviral.spiffy.co"]') : null;
      if (!link) return;
      enrichCheckoutLink(link);
      var url;
      try { url = new URL(link.href); } catch (_) { return; }
      track('checkout_clicked', link.id || link.className || 'spiffy', {
        button_id: link.id || '',
        checkout_host: url.hostname,
      });
    }, true);

    if (path === '/offre-speciale' || path === '/offre-speciale-promo') {
      var sent = {};
      window.addEventListener('scroll', function () {
        var scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        var percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
        [25, 50, 75, 90].forEach(function (milestone) {
          if (percent >= milestone && !sent[milestone]) {
            sent[milestone] = true;
            track('sales_scroll', milestone, { percent: milestone });
          }
        });
      }, { passive: true });
    }
  }

  window.SVTracking = {
    context: context,
    enrichCheckoutLink: enrichCheckoutLink,
    getToken: getToken,
    setToken: setToken,
    track: track,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePageTracking);
  else initializePageTracking();
})();
