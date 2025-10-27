// Fonction pour récupérer les parcours des leads

const storage = require('./storage.js');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Récupérer les données du storage
    const events = storage.getAllEvents();
    
    // Grouper par sessionId pour créer les parcours
    const sessions = {};
    
    events.forEach(event => {
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = {
          sessionId: event.sessionId,
          email: event.data?.email || null,
          source: event.utm_source || 'direct',
          medium: event.utm_medium || 'none',
          campaign: event.utm_campaign || 'none',
          steps: []
        };
      }
      
      sessions[event.sessionId].steps.push({
        action: event.event,
        timestamp: event.timestamp,
        page: event.page,
        ...event.data
      });
    });
    
    // Convertir en array et trier par timestamp
    const journeys = Object.values(sessions).map(journey => ({
      ...journey,
      steps: journey.steps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }));
    
    journeys.sort((a, b) => {
      const aLatest = new Date(Math.max(...a.steps.map(s => new Date(s.timestamp))));
      const bLatest = new Date(Math.max(...b.steps.map(s => new Date(s.timestamp))));
      return bLatest - aLatest;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ journeys })
    };

  } catch (error) {
    console.error('Get journeys error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
