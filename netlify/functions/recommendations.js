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

    const systemPrompt = `Tu es un expert en acquisition pour créateurs. À partir des réponses ci-dessous, rédige UNE SEULE recommandation personnalisée sous forme d’un court paragraphe (60–100 mots), sans listes, claire et concrète.

Contraintes:
- Personnalise selon chaque réponse (temps dispo, motivation, niveau IA, audace, constance)
- Donne 2–3 actions très précises à démarrer cette semaine
- Ton: direct, motivant, orienté résultats
- Termine par un appel à l’action explicite vers la formation (ex: « Clique sur \'Commencer la formation\' pour lancer ton système dès aujourd’hui. »)
- Pas d’emojis, pas de listes, pas de titre

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
      // Intro personnalisée courte
      parts.push(`Avec un score de ${score}%, tu as un potentiel ${score >= 70 ? 'élevé' : score >= 50 ? 'prometteur' : 'à structurer'} si tu passes à l’action dès cette semaine.`);

      // Temps disponible
      if (q1 === 0) parts.push("Travaille en ultra-court: 20–30 secondes par vidéo, structure hook > une idée > appel clair.");
      if (q1 === 1) parts.push("Prépare un template de montage unique pour publier rapidement 2 formats par jour.");
      if (q1 >= 2) parts.push("Tourne en lot (6–8 scripts à la suite) et concentre ton effort sur les 10 premières secondes.");

      // Motivation
      if (q2 <= 1) parts.push("Installe un tracker visible et vise 20 publications ce mois-ci, sans viser la perfection.");
      if (q2 >= 2) parts.push("Fixe un objectif résultat (1 vidéo >50k vues) et décortique 5 leaders de ta niche pour répliquer leurs patterns.");

      // IA/digital
      if (q3 <= 1) parts.push("Pack minimal: ChatGPT pour scripts, CapCut pour montage, sous-titres auto.");
      if (q3 >= 2) parts.push("Mets en place un mini tableau d’analyse: note hook, angle, rythme et rétention pour chaque vidéo.");

      // Audace
      if (q4 <= 1) parts.push("Ajoute un élément polarisant par vidéo (opinion tranchée, comparaison choc ou chiffre précis).");
      if (q4 >= 2) parts.push("Teste 3 hooks par idée et publie la variante qui arrête le plus le scroll.");

      // Constance
      if (q5 <= 1) parts.push("Planifie 3 créneaux fixes de 45 min (lun/mer/ven) et publie quoi qu’il arrive.");
      if (q5 === 2) parts.push("Passe à un pipeline hebdo simple: idéation lundi, tournage mardi, montage mercredi, publications échelonnées.");
      if (q5 >= 3) parts.push("Capitalise sur ta discipline en mesurant chaque semaine rétention 3s et taux de complétion.");

      // CTA
      parts.push("Clique sur ‘Commencer la formation’ pour déployer le système étape par étape dès aujourd’hui.");

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
