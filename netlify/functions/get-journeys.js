// Get journeys - retourne les événements groupés par session
const storage = require('./storage.js');

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const events = storage.getAllEvents();
    const sessions = {};

    for (const ev of events) {
      if (!sessions[ev.sessionId]) {
        sessions[ev.sessionId] = {
          sessionId: ev.sessionId,
          source: ev.utm_source || 'direct',
          medium: ev.utm_medium || 'none',
          campaign: ev.utm_campaign || 'none',
          steps: [],
        };
      }
      sessions[ev.sessionId].steps.push({ ...ev });
    }

    const journeys = Object.values(sessions).map(j => ({
      ...j,
      steps: j.steps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ journeys }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error', details: err.message }) };
  }
};
