const OpenAI = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
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
    const { message, conversationHistory = [] } = JSON.parse(event.body);

    if (!message || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // System prompt pour SYSTÈME VIRAL 100K™
    const systemPrompt = `Tu es l'assistant IA officiel de SYSTÈME VIRAL 100K™.

CONTEXTE:
- SYSTÈME VIRAL 100K™ est une formation complète pour générer 10K€/mois avec des vidéos d'1 minute
- Méthodologie éprouvée par +2800 entrepreneurs
- Formation complète : stratégie, création de contenu, captation leads, monétisation
- Garantie 30 jours satisfait ou remboursé

TON RÔLE:
- Répondre de manière professionnelle et pédagogique
- Être encourageant et motivant
- Fournir des réponses précises sur la formation
- Convertir les visiteurs en leads qualifiés
- Maintenir un ton expert mais accessible

INFORMATIONS CLÉS À COMMUNIQUER:
- Formation complète accessible immédiatement
- Méthode validée par des résultats concrets
- Support personnalisé et communauté
- Prix spécial limité dans le temps

RÈGLES:
- Réponses concises (max 150 mots)
- Toujours finir par une question pour engager la conversation
- Être honnête sur les résultats (pas de promesses miracles)
- Rediriger vers l'inscription si intérêt confirmé`;

    // Préparer les messages pour l'API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Garder les 10 derniers messages pour le contexte
      { role: 'user', content: message }
    ];

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response.trim(),
        usage: completion.usage,
      }),
    };

  } catch (error) {
    console.error('Chatbot error:', error);

    // Fallback response en cas d'erreur
    const fallbackResponses = [
      "Désolé, je rencontre un petit problème technique. Pouvez-vous reposer votre question ? Notre équipe peut aussi vous aider directement.",
      "Je suis temporairement indisponible. La formation SYSTÈME VIRAL 100K™ est disponible 24/7 sur notre plateforme. Souhaitez-vous que je vous guide vers l'inscription ?",
      "Excusez-moi pour ce contretemps. Notre méthode a aidé plus de 2800 entrepreneurs. Que souhaitez-vous savoir sur notre formation ?"
    ];

    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackResponse,
        error: true,
      }),
    };
  }
};
