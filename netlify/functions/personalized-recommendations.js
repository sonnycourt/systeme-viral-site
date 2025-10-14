const OpenAI = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  console.log('🎯 PERSONALIZED RECOMMENDATIONS FUNCTION CALLED');
  console.log('📨 HTTP Method:', event.httpMethod);

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { answers, score, userProfile } = JSON.parse(event.body);
    console.log('📊 Score reçu:', score);
    console.log('📝 Réponses:', answers);

    if (!answers || !Array.isArray(answers)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Réponses requises' }),
      };
    }

    // Préparer le contexte des réponses
    const responseContext = {
      temps: answers[0] || 0, // 0-3
      motivation: answers[1] || 0, // 0-3
      competences: answers[2] || 0, // 0-3
      audace: answers[3] || 0, // 0-3
      perseverance: answers[4] || 0, // 0-3
      score: score || 0
    };

    // Créer le prompt personnalisé
    const systemPrompt = `Tu es un expert en marketing viral et en création de contenu. Tu analyses le profil d'un utilisateur basé sur ses réponses à un calculateur de probabilité de succès et tu génères un paragraphe de recommandations personnalisées qui le mène naturellement vers l'inscription au Système Viral 100K™.

CONTEXTE DU PROFIL:
- Temps disponible: ${responseContext.temps}/3
- Motivation: ${responseContext.motivation}/3  
- Compétences digitales: ${responseContext.competences}/3
- Audace: ${responseContext.audace}/3
- Persévérance: ${responseContext.perseverance}/3
- Score de probabilité: ${responseContext.score}%

Génère un paragraphe personnalisé au format JSON:
{
  "recommendation": "Paragraphe personnalisé qui analyse son profil et le guide vers l'inscription"
}

EXEMPLE DE FORMAT ATTENDU:
"Ton profil révèle une motivation exceptionnelle qui compense largement ton niveau technique débutant. Cette détermination est ton plus grand atout pour réussir avec le Système Viral 100K™. La formation te donnera exactement les outils techniques dont tu as besoin pour transformer cette motivation en résultats concrets."

Le paragraphe doit:
- Analyser ses forces et faiblesses spécifiques
- Proposer des actions concrètes adaptées à son profil
- Créer une connexion émotionnelle
- Mener naturellement vers l'inscription au Système Viral 100K™
- Être motivant et encourageant
- Faire 3-4 phrases maximum
- Utiliser un ton personnel et direct
- Utiliser le TUTOIEMENT (tu, ton, ta, tes)
- COMMENCER DIRECTEMENT par l'analyse (pas de "Bonjour", "Salut", "Hello", etc.)
- Être une vraie recommandation professionnelle, pas une conversation

Réponds UNIQUEMENT en JSON valide.`;

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Génère des recommandations personnalisées pour ce profil: ${JSON.stringify(responseContext)}` }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ Recommandations générées');

    // Parser la réponse JSON
    let parsed;
    try {
      parsed = JSON.parse(response.trim());
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      // Fallback si le JSON n'est pas valide
      parsed = {
        recommendation: "Basé sur ton profil, tu as un potentiel réel pour réussir avec le Système Viral 100K™. Ta motivation et ton engagement sont tes plus grands atouts. La formation te donnera la méthode et les outils pour transformer ce potentiel en résultats concrets et durables."
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendation: parsed.recommendation || "Ton profil montre un potentiel intéressant pour réussir avec le Système Viral 100K™.",
        usage: completion.usage,
      }),
    };

  } catch (error) {
    console.error('Erreur recommandations personnalisées:', error);

    // Fallback response
    const fallbackRecommendation = "Basé sur ton profil, tu as un potentiel réel pour réussir avec le Système Viral 100K™. Ta motivation et ton engagement sont tes plus grands atouts. La formation te donnera la méthode et les outils pour transformer ce potentiel en résultats concrets et durables.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendation: fallbackRecommendation,
        error: true,
      }),
    };
  }
};
