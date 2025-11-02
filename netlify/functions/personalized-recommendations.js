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
    // IMPORTANT: Avec response_format json_object, le système prompt DOIT mentionner JSON
    const systemPrompt = `Tu es un expert en marketing viral et en création de contenu. Tu analyses le profil d'un utilisateur basé sur ses réponses à un calculateur de probabilité de succès et tu génères un paragraphe de recommandations personnalisées qui le mène naturellement vers l'inscription au Système Viral 100K™.

Tu DOIS toujours répondre en JSON valide avec cette structure exacte:
{
  "recommendation": "Ton paragraphe personnalisé ici"
}

CONTEXTE DU PROFIL:
- Temps disponible: ${responseContext.temps}/3
- Motivation: ${responseContext.motivation}/3  
- Compétences digitales: ${responseContext.competences}/3
- Audace: ${responseContext.audace}/3
- Persévérance: ${responseContext.perseverance}/3
- Score de probabilité: ${responseContext.score}%

EXEMPLE DE FORMAT ATTENDU (en JSON):
{
  "recommendation": "Ton profil révèle une motivation exceptionnelle qui compense largement ton niveau technique débutant. Cette détermination est ton plus grand atout pour réussir avec le Système Viral 100K™. La formation te donnera exactement les outils techniques dont tu as besoin pour transformer cette motivation en résultats concrets."
}

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

IMPORTANT: Tu dois OBLIGATOIREMENT répondre en JSON valide avec la structure {"recommendation": "..."}`;

    console.log('📝 Préparation appel OpenAI avec contexte:', responseContext);
    
    // Appel à l'API OpenAI avec format de réponse JSON
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Génère des recommandations personnalisées pour ce profil en JSON: ${JSON.stringify(responseContext)}` }
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
      
      console.log('✅ Réponse OpenAI reçue, status:', completion.choices ? 'OK' : 'ERREUR');
      console.log('📊 Usage:', completion.usage);
    } catch (openaiError) {
      console.error('❌ ERREUR OpenAI API:', openaiError);
      console.error('❌ Message:', openaiError.message);
      console.error('❌ Stack:', openaiError.stack);
      throw new Error(`Erreur OpenAI: ${openaiError.message}`);
    }

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ Réponse brute OpenAI:', response);

    // Parser la réponse JSON
    let parsed;
    let finalRecommendation;
    
    try {
      // Nettoyer la réponse pour extraire le JSON
      let cleanedResponse = response.trim();
      
      // Si la réponse contient du markdown code block, l'extraire
      const jsonMatch = cleanedResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[1];
      }
      
      // Si la réponse commence par du texte avant le JSON, extraire juste le JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      parsed = JSON.parse(cleanedResponse);
      console.log('✅ JSON parsé avec succès:', parsed);
      
      if (parsed.recommendation && parsed.recommendation.trim().length > 0) {
        finalRecommendation = parsed.recommendation.trim();
        console.log('✅ Recommandation extraite:', finalRecommendation);
      } else {
        throw new Error('Recommandation vide dans le JSON');
      }
    } catch (e) {
      console.error('❌ Erreur parsing JSON:', e);
      console.error('Réponse originale OpenAI:', response);
      
      // Essayer d'extraire juste le texte de recommandation même sans JSON valide
      const recommendationMatch = response.match(/"recommendation"\s*:\s*"([^"]+(?:\\.|[^"\\])*)"|\"recommendation\"\s*:\s*\"([^\"]+)\"/);
      if (recommendationMatch) {
        finalRecommendation = recommendationMatch[1] || recommendationMatch[2];
        console.log('✅ Recommandation extraite via regex:', finalRecommendation);
      } else {
        // Si vraiment aucune recommandation ne peut être extraite, créer une personnalisée basée sur le score
        console.error('⚠️ Impossible d\'extraire la recommandation, génération basée sur le score');
        
        // Générer une recommandation personnalisée basée sur le score et les réponses
        const scoreLevel = score >= 80 ? 'excellent' : score >= 60 ? 'très bon' : score >= 40 ? 'bon' : 'correct';
        const tempsLevel = responseContext.temps >= 2 ? 'excellent' : responseContext.temps >= 1 ? 'bon' : 'limité';
        const motivationLevel = responseContext.motivation >= 3 ? 'exceptionnelle' : responseContext.motivation >= 2 ? 'forte' : 'modérée';
        
        finalRecommendation = `Ton profil révèle un potentiel ${scoreLevel} (${score}%) pour réussir avec le Système Viral 100K™. Avec ${motivationLevel} motivation et un temps disponible ${tempsLevel}, tu as les bases solides pour transformer ce potentiel en résultats concrets. La formation te donnera exactement la méthode et les outils adaptés à ton profil pour accélérer ta progression vers la liberté financière.`;
        
        console.log('✅ Recommandation générée dynamiquement:', finalRecommendation);
      }
    }
    
    // S'assurer qu'on a bien une recommandation
    if (!finalRecommendation || finalRecommendation.trim().length === 0) {
      finalRecommendation = "Ton profil montre un potentiel intéressant pour réussir avec le Système Viral 100K™.";
    }
    
    console.log('✅ Recommandation finale envoyée:', finalRecommendation);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendation: finalRecommendation,
        usage: completion.usage,
      }),
    };

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE recommandations personnalisées:', error);
    console.error('❌ Type erreur:', error.constructor.name);
    console.error('❌ Message erreur:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // NE PAS retourner le fallback - laisser l'erreur remonter pour qu'on puisse la voir
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: true,
        message: error.message || 'Erreur inconnue lors de la génération des recommandations',
        recommendation: null,
      }),
    };
  }
};
