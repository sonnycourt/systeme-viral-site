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

    const systemPrompt = `Tu es un expert en marketing digital et en système viral pour entrepreneurs. Tu dois analyser le profil d'un utilisateur qui vient de répondre à un questionnaire sur sa compatibilité avec le "Système Viral 100K™".

Voici les réponses de l'utilisateur:

${userProfile}

Sur la base de ces réponses, génère 3 recommandations personnalisées et actionnables pour maximiser ses chances de succès avec le système viral. Chaque recommandation doit être:

1. **Spécifique** : Dire exactement quoi faire
2. **Actionnable** : Pouvoir être mise en œuvre immédiatement
3. **Personnalisée** : Adaptée à son profil et à ses réponses
4. **Optimiste** : Encourager et motiver

Structure ta réponse comme suit:
- Commence par une introduction personnalisée de 2-3 phrases
- Liste ensuite les 3 recommandations numérotées
- Chaque recommandation doit faire 2-3 phrases maximum
- Termine par une conclusion motivante

Utilise un ton professionnel mais accessible, encourageant et direct.`;

    // Helper: fallback local recommendations if API not available
    const buildLocalRecommendations = (answers, score) => {
      const q1 = answers[0] ?? 0; // temps dispo
      const q2 = answers[1] ?? 0; // motivation
      const q3 = answers[2] ?? 0; // IA/digital
      const q4 = answers[3] ?? 0; // inconfort/risque
      const q5 = answers[4] ?? 0; // constance

      const tips = [];

      // Constance / discipline
      if (q5 <= 1) {
        tips.push("Planifie 3 créneaux fixes de 45 min cette semaine (ex: lun/mer/ven, 19h00). Prépare tes scripts la veille et fais une seule prise. L'objectif: publier 3 vidéos, peu importe la perfection.");
      } else if (q5 === 2) {
        tips.push("Passe à un rythme 4x/semaine en batch: écris 4 hooks le lundi, tourne le mardi, monte le mercredi, publie du jeudi au dimanche. Garde des templates réutilisables.");
      } else {
        tips.push("Exploite ta discipline: crée un pipeline hebdo (idéation>scripts>tournage>montage>publication) et mesure 2 KPI clés: taux de rétention à 3s et CTR de la miniature.");
      }

      // Temps disponible
      if (q1 === 0) {
        tips.push("Utilise des formats ultra-courts (20–30s) avec structure hook > 1 idée > CTA. Tourne en mode selfie, lumière naturelle, sans coupe complexe pour rester sous 15 min/montage.");
      } else if (q1 === 1) {
        tips.push("Optimise avec un template CapCut prêt-à-l'emploi (intro, sous-titres auto, fin). Objectif: 2 vidéos/jour en 30–45 min au total.");
      } else {
        tips.push("Passe au tournage par lot (8 scripts/tournage). Délègue le sous-titrage à un outil IA et garde ton temps sur les 10 premières secondes (impact maximum).");
      }

      // Compétences IA/digital
      if (q3 <= 1) {
        tips.push("Crée un pack d'IA minimal: ChatGPT pour scripts (prompt: 'Donne-moi 10 hooks polarisants sur [thématique]'), CapCut pour montage, Submagic pour sous-titres.");
      } else {
        tips.push("Mets en place un système d'analyse: tracke les patterns des 10% de vidéos top performance (hook, angle, gestures, rythme) et réplique-les chaque semaine.");
      }

      // Audace / passage à l'action
      if (q4 <= 1) {
        tips.push("Ajoute un élément polarisant par vidéo: une opinion tranchée, une comparaison choc ou un chiffre précis. Le but est d'augmenter l'arrêt de scroll et les commentaires.");
      } else {
        tips.push("Teste 3 hooks agressifs par idée (A/B/C) et choisis le meilleur après 30 minutes. Publie la version gagnante en premier, recycle les autres en stories.");
      }

      // Motivation
      if (q2 <= 1) {
        tips.push("Installe une 'preuve de travail': un tracker visible (mur, Notion, Google Sheet). Coche chaque publication; objectif: 20 vidéos ce mois-ci.");
      } else {
        tips.push("Fixe un objectif de résultat: 1 vidéo à >50k vues ce mois-ci. Reverse-engineer 5 créateurs de ta niche et copie la structure de leur meilleur contenu.");
      }

      const intro = `Ton score (${score}%) montre un potentiel ${score >= 70 ? 'élevé' : score >= 50 ? 'prometteur' : 'en construction'}. Voici un plan court, concret et actionnable pour accélérer dès cette semaine.`;
      const formatted = `\n${intro}\n\n1) ${tips[0]}\n\n2) ${tips[1]}\n\n3) ${tips[2]}`;
      return formatted;
    };

    try {
      console.log('🤖 Calling OpenAI...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Génère mes recommandations personnalisées basées sur mes réponses au questionnaire.' }
        ],
        max_tokens: 800,
        temperature: 0.7,
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
