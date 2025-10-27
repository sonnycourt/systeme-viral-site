// Fonction pour capturer et stocker les événements de tracking

const storage = require('./storage.js');

exports.handler = async function(event, context) {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gestion CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const trackingData = JSON.parse(event.body);
    
    // Validation
    if (!trackingData.sessionId || !trackingData.event) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sessionId and event are required' })
      };
    }

    // Stocker l'événement
    storage.addEvent(trackingData);
    console.log('📊 Event tracked:', JSON.stringify(trackingData));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Event tracked',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Track event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
