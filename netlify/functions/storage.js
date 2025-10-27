// Module de stockage partagé pour les événements de tracking
// Ce stockage est temporaire et sera perdu au redémarrage
// Pour la production, utiliser Supabase ou une vraie DB

let events = [];

function addEvent(event) {
  events.push({
    ...event,
    receivedAt: new Date().toISOString()
  });
  
  // Garder seulement les 1000 derniers événements
  if (events.length > 1000) {
    events = events.slice(-1000);
  }
  
  console.log(`Event stored. Total events: ${events.length}`);
}

function getAllEvents() {
  return events;
}

function getEventsBySession(sessionId) {
  return events.filter(e => e.sessionId === sessionId);
}

function clearEvents() {
  events = [];
  console.log('Storage cleared');
}

module.exports = {
  addEvent,
  getAllEvents,
  getEventsBySession,
  clearEvents
};

