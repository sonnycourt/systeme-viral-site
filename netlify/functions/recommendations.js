const OpenAI = require('openai');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  console.log('🚀 RECOMMENDATIONS FUNCTION CALLED');
  console.log('📨 HTTP Method:', event.httpMethod);

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('📥 Parsing request body...');
    console.log('📦 Raw body:', event.body);
    
    // Vérifier que le body existe
    if (!event.body) {
      console.error('❌ No body in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
      };
    }

    const { answers, score } = parsedBody;
    console.log('📊 Answers received:', answers);
    console.log('📈 Score received:', score);

    if (!answers || !Array.isArray(answers)) {
      console.error('❌ Answers is not an array:', typeof answers);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Answers must be an array' }),
      };
    }

    // Vérifier que OPENAI_API_KEY est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured on server' }),
      };
    }

    // Convertir les indices des réponses en texte lisible
    const questions = [
      {
        question: "Combien de temps peux-tu consacrer chaque jour à ton système viral ?",
        options: [
          "Moins de 30 minutes",
          "30 min à 1h",
          "1 à 2h",
          "Plus de 2h"
        ]
      },
      {
        question: "Quelle est ta motivation à atteindre la liberté financière ?",
        options: [
          "Curiosité ou simple envie",
          "Assez motivé, mais pas encore à fond",
          "Très motivé, je suis prêt à m'impliquer",
          "C'est une priorité absolue dans ma vie"
        ]
      },
      {
        question: "Quel est ton niveau de familiarité avec l'IA et les outils digitaux ?",
        options: [
          "Débutant complet",
          "J'utilise parfois des outils IA",
          "À l'aise avec les outils digitaux",
          "Je maîtrise déjà plusieurs outils IA"
        ]
      },
      {
        question: "Comment réagis-tu face à l'inconfort, au risque et à l'incertitude ?",
        options: [
          "Je préfère rester prudent",
          "Je teste parfois de nouvelles choses",
          "Je suis prêt à sortir de ma zone de confort",
          "J'avance même quand j'ai peur"
        ]
      },
      {
        question: "Comment décrirais-tu ta capacité à rester constant sur plusieurs semaines ?",
        options: [
          "J'abandonne vite si je ne vois pas de résultats",
          "Je tiens quelques jours, puis je relâche",
          "Je suis régulier la plupart du temps",
          "Je suis discipliné, peu importe les résultats"
        ]
      }
    ];

    // Construire le prompt pour OpenAI
    let userProfile = "";
    answers.forEach((answerIndex, questionIndex) => {
      const question = questions[questionIndex];
      const answer = question.options[answerIndex];
      userProfile += `Question ${questionIndex + 1}: ${question.question}\n`;
      userProfile += `Réponse: ${answer}\n\n`;
    });

    userProfile += `Score total: ${score}%\n`;

    const systemPrompt = `Tu es un expert en conversion pour une formation sur le système viral pour entrepreneurs. À partir du profil ci-dessous, rédige UNE SEULE réponse personnalisée (60–100 mots) qui aide le prospect à prendre sa décision d'investir dans la formation.

Objectif: UNIQUEMENT CONVAINCRE et RASSURER pour pousser à l'inscription. PAS de conseils pratiques techniques.

Structure:
1. Analyse son profil (temps disponible, motivation, niveau, audace, constance) et valide si la formation lui convient
2. Rassure sur ses doutes ou faibles (ex: "Même avec peu de temps disponible, cette formation est faite pour toi", "Tu n'as pas besoin d'être expert...")
3. Explique pourquoi cette formation répond spécifiquement à SON profil selon ses réponses
4. Termine TOUJOURS par un appel à l'action avec un lien HTML cliquable vers l'inscription

Obligatoire - Fin de la réponse:
Tu DOIS terminer par une phrase incitative suivie d'un lien HTML cliquable. Format exact:
"Clique ici pour t'inscrire maintenant : <a href=\"https://systemeviral.spiffy.co/checkout/systeme-viral#pop\" target=\"_blank\" style=\"color: #00d4aa; text-decoration: underline; font-weight: bold;\">COMMENCER LA FORMATION →</a>"

Ton: Bienveillant, rassurant, convaincant. Évite le jargon technique. Focus sur "dois-je investir ?" pas "comment faire".

Interdictions STRICTES:
- AUCUN conseil pratique (pas de "tourne en 20 secondes", "utilise ChatGPT", etc.)
- PAS de techniques concrètes de création
- PAS de "système", "méthode", "cadre structuré", "résultats", "accélérer"
- Focus UNIQUEMENT sur: pourquoi cette formation est faite pour LUI et pourquoi investir maintenant

Profil:
${userProfile}`;

    // Helper: fallback local recommendations if API not available
    const buildLocalRecommendations = (answers, score) => {
      const q1 = answers[0] ?? 0; // temps dispo
      const q2 = answers[1] ?? 0; // motivation
      const q3 = answers[2] ?? 0; // IA/digital
      const q4 = answers[3] ?? 0; // inconfort/risque
      const q5 = answers[4] ?? 0; // constance

      const parts = [];

      // Analyse du profil et validation pure
      if (score >= 70) {
        parts.push(`Avec ${score}% de probabilité de succès, tu fais partie des profils les plus prometteurs. Cette formation est parfaitement adaptée à ton profil et tu as toutes les chances de réussir avec elle.`);
      } else if (score >= 50) {
        parts.push(`Ton score de ${score}% montre que tu as déjà de bonnes bases. Cette formation est faite pour quelqu'un comme toi qui a le potentiel mais cherche la bonne direction.`);
      } else {
        parts.push(`Avec ${score}% de probabilité, cette formation est justement ce dont tu as besoin. Elle est conçue pour tous les profils, même ceux qui démarrent de plus loin.`);
      }

      // Rassurer selon les faiblesses - UNIQUEMENT rassurance, pas de conseils
      if (q1 === 0) parts.push("Même avec peu de temps disponible, cette formation est faite pour toi. Tu n'as pas besoin d'y consacrer beaucoup d'heures pour réussir.");
      if (q3 <= 1) parts.push("Tu n'as pas besoin d'être expert en IA ou en numérique. Cette formation est conçue pour les débutants complets.");
      if (q4 <= 1) parts.push("Tu préfères la prudence ? C'est parfaitement normal. Cette formation est faite pour les personnes prudentes qui veulent avancer à leur rythme.");
      if (q5 <= 1) parts.push("Si tu as du mal à rester constant, ne t'inquiète pas. Cette formation est faite pour les personnes comme toi qui veulent construire des habitudes solides.");
      if (q2 <= 1) parts.push("Ta motivation modérée est tout à fait normale. Cette formation est conçue pour transformer cette motivation en engagement durable.");

      // Expliquer pourquoi cette formation convient spécifiquement à SON profil
      if (q2 >= 3 && q5 >= 2) parts.push("Avec ta motivation élevée et ta bonne discipline naturelle, cette formation est idéale pour toi car elle valorise exactement ces qualités.");
      if (q1 >= 2) parts.push("Avec le temps que tu peux consacrer, cette formation est parfaite car elle est conçue pour les personnes disponibles comme toi.");

      // CTA avec lien cliquable
      parts.push("Cette formation est faite pour quelqu'un comme toi. Clique ici pour t'inscrire maintenant : <a href=\"https://systemeviral.spiffy.co/checkout/systeme-viral#pop\" target=\"_blank\" style=\"color: #00d4aa; text-decoration: underline; font-weight: bold;\">COMMENCER LA FORMATION →</a>");

      return parts.join(' ');
    };

    try {
      console.log('🤖 Calling OpenAI...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Génère mes recommandations personnalisées basées sur mes réponses au questionnaire.' }
        ],
        max_tokens: 220,
        temperature: 0.5,
      });

      const recommendations = completion.choices[0].message.content;
      console.log('✅ Recommendations generated successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ recommendations, success: true }),
      };
    } catch (aiError) {
      // Fallback sur quota/rate limit ou toute erreur API
      const msg = (aiError && aiError.message) ? aiError.message : '';
      const isRateLimit = (aiError && (aiError.status === 429 || /quota|rate/i.test(msg)));
      console.error('⚠️ OpenAI error, using fallback:', msg);

      const fallback = buildLocalRecommendations(answers, score);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ recommendations: fallback, success: false, reason: isRateLimit ? 'rate_limit' : 'fallback' }),
      };
    }

  } catch (error) {
    console.error('❌ Error in recommendations function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erreur lors de la génération des recommandations',
        details: error.message
      }),
    };
  }
};
