// Endpoint pour récupérer les données de Google Analytics et les intégrer au dashboard
// Property ID: 503555450

export async function GET({ request }) {
  // TODO: Connecter à la vraie API Google Analytics
  // Pour l'instant, on retourne des données de démonstration
  
  const gaData = {
    traffic: {
      total: 1247,
      today: 89,
      sources: [
        { name: 'Instagram', visits: 534, conversions: 23, revenue: 4600 },
        { name: 'TikTok', visits: 489, conversions: 18, revenue: 3600 },
        { name: 'Email', visits: 234, conversions: 34, revenue: 6800 },
        { name: 'Facebook', visits: 234, conversions: 12, revenue: 2400 },
        { name: 'YouTube', visits: 123, conversions: 8, revenue: 1600 }
      ]
    },
    performance: {
      conversionRate: 8.2,
      avgSessionDuration: 245,
      bounceRate: 42.3,
      topPages: [
        { page: '/offre-speciale', views: 856, conversions: 72 },
        { page: '/100k-masterclass', views: 324, conversions: 45 },
        { page: '/accueil', views: 567, conversions: 12 }
      ]
    },
    realTime: {
      activeUsers: 23,
      currentPage: '/offre-speciale'
    }
  };

  return new Response(JSON.stringify(gaData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

