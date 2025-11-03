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
    const { answers, score } = JSON.parse(event.body);
    console.log('📊 Answers received:', answers);
    console.log('📈 Score received:', score);

    if (!answers || !Array.isArray(answers)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Answers array is required' }),
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

    console.log('🤖 Calling OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Génère mes recommandations personnalisées basées sur mes réponses au questionnaire.'
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const recommendations = completion.choices[0].message.content;
    console.log('✅ Recommendations generated successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recommendations: recommendations,
        success: true
      }),
    };

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
