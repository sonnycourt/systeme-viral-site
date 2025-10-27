// API endpoint pour récupérer les parcours
// En dev local, on lit depuis localStorage
// En production, on lit depuis Netlify functions

export async function GET({ request }) {
  // En dev local, lire depuis localStorage côté client
  // Pour les démos, on retourne des données de test
  
  const demoData = {
    journeys: [
      {
        email: 'lead1@example.com',
        sessionId: 'session_123',
        source: 'instagram',
        medium: 'organic',
        campaign: 'systeme_viral_100k',
        steps: [
          {
            action: 'visit',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            page: '/offre-speciale'
          },
          {
            action: 'cta_click',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            element: 'CTA Principal'
          },
          {
            action: 'optin',
            timestamp: new Date(Date.now() - 2400000).toISOString(),
            email: 'lead1@example.com'
          },
          {
            action: 'purchase',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            amount: 497
          }
        ]
      },
      {
        email: 'lead2@example.com',
        sessionId: 'session_456',
        source: 'tiktok',
        medium: 'organic',
        campaign: 'systeme_viral_100k',
        steps: [
          {
            action: 'visit',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            page: '/offre-speciale'
          },
          {
            action: 'scroll_depth',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
            percent: 75
          },
          {
            action: 'cta_click',
            timestamp: new Date(Date.now() - 6800000).toISOString(),
            element: 'Form Optin'
          }
        ]
      }
    ]
  };

  return new Response(JSON.stringify(demoData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
