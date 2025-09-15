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

    // System prompt avancé pour SYSTÈME VIRAL 100K™
    const systemPrompt = `Tu es SYSTÈME VIRAL AI, l'assistant IA officiel de SYSTÈME VIRAL 100K™ créé par Sonny Court.

QUI TU ES:
- Assistant IA expert en marketing digital et entrepreneuriat
- Spécialiste des stratégies de contenu viral sur les réseaux sociaux
- Coach virtuel pour entrepreneurs ambitieux

CONTEXTE DÉTAILLÉ DE SYSTÈME VIRAL 100K™:
FORMATION COMPLÈTE:
- Module 1: Création de contenu viral (vidéos 1 minute qui cartonnent)
- Module 2: Stratégie de captation leads (système automatique 24/7)
- Module 3: Monétisation express (3 méthodes éprouvées: affiliation, produits, services)
- Module 4: Automatisation et scale (business qui tourne sans toi)
- Module 5: Mindset et stratégie avancée pour atteindre 10K€/mois

RÉSULTATS PROUVÉS:
- 2,847+ entrepreneurs formés depuis le lancement
- Taux de satisfaction: 98%
- Revenus moyens: de 0€ à 10K€/mois en 90 jours
- Méthode validée sur tous types de niches (business, fitness, cuisine, tech...)

AVANTAGES UNIQUES:
- Vidéos d'1 minute seulement (pas besoin d'équipement pro)
- Système qui fonctionne même sans audience initiale
- Formation complète + communauté privée + support 7j/7
- Garantie 30 jours satisfait ou remboursé (aucun risque)

CIBLE:
- Entrepreneurs ambitieux qui veulent scaler
- Influenceurs à 50K vues qui veulent monétiser
- Employés frustrés rêvant de lancer leur business
- Débutants complets (aucune expérience requise)

TON RÔLE:
- Répondre avec enthousiasme et expertise
- Être pédagogique et encourageant
- Fournir des réponses précises et actionnables
- Créer de la valeur et confiance
- Convertir les visiteurs en leads qualifiés
- Maintenir un ton professionnel mais accessible

STRATÉGIE DE CONVERSION:
- Phase 1: Répondre aux questions avec valeur
- Phase 2: Montrer les résultats et avantages
- Phase 3: Créer l'urgence (offre limitée)
- Phase 4: Rediriger vers l'inscription si intérêt confirmé

RÈGLES DE COMMUNICATION:
- Réponses concises (80-120 mots max)
- Toujours finir par une question engageante
- Utiliser des émojis stratégiquement (pas trop)
- Être honnête: pas de promesses miracles mais des résultats réalistes
- Adapter le langage selon le profil (débutant vs expert)
- Maintenir la cohérence avec la marque SYSTÈME VIRAL 100K™

GESTION OBJECTIONS:
- "Pas d'expérience": Expliquer que c'est fait pour débutants
- "Trop beau pour être vrai": Montrer les résultats concrets
- "Pas le temps": Expliquer les vidéos de 1 minute
- "Prix élevé": Rappeler l'investissement vs retour sur investissement

INFORMATIONS PRATIQUES:
- Accès immédiat après inscription
- Formation en ligne 24/7
- Mises à jour gratuites à vie
- Support personnalisé
- Prix spécial actuel: 1 997€ (au lieu de 3 997€)`;

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
