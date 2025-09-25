// Serverless function to call Anthropic Messages API securely
// Expects POST { thematique: string }

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { thematique } = JSON.parse(event.body || '{}');
    if (!thematique || typeof thematique !== 'string' || !thematique.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Paramètre "thematique" requis' }),
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Clé API Anthropic manquante côté serveur' }),
      };
    }

    const prompt = `Tu es un expert en stratégie de contenu viral et monétisation sur les réseaux sociaux. Analyse cette thématique de contenu : "${thematique}"

Donne-moi une analyse complète au format JSON avec cette structure exacte :
{
  "viral_rating": (nombre entre 1-5),
  "viral_text": "description courte du potentiel viral",
  "finance_rating": (nombre entre 1-5),
  "finance_text": "description courte du potentiel financier",
  "difficulty_rating": (nombre entre 1-5),
  "difficulty_text": "description courte de la difficulté",
  "insights": ["conseil personnalisé 1", "conseil personnalisé 2", "conseil personnalisé 3", "conseil personnalisé 4"],
  "monetization_methods": ["méthode 1", "méthode 2", "méthode 3", "méthode 4", "méthode 5", "méthode 6"]
}

Réponds uniquement en JSON valide.`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1500,
        temperature: 0.7,
        system: 'Tu es un expert en stratégie de contenu viral et monétisation. Réponds uniquement en JSON valide.',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Erreur API Anthropic', status: resp.status, details: text.slice(0, 500) }),
      };
    }

    const data = await resp.json();
    const text = data?.content?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch (e) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Réponse Anthropic non JSON', raw: text.slice(0, 2000) }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ analysis: parsed }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur', message: String(error && error.message || error) }),
    };
  }
};


