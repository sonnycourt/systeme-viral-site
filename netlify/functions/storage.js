// Module de stockage partagé pour les événements de tracking
// Stockage en mémoire (temporaire) côté Netlify Functions

let events = [];

function addEvent(event) {
  events.push({
    ...event,
    receivedAt: new Date().toISOString(),
  });
  if (events.length > 1000) {
    events = events.slice(-1000);
  }
}

function getAllEvents() {
  return events;
}

function clearEvents() {
  events = [];
}

module.exports = {
  addEvent,
  getAllEvents,
  clearEvents,
};

