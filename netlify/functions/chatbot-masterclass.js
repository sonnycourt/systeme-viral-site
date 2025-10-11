const OpenAI = require('openai');
const { MASTERCLASS_INSTRUCTIONS, getCachedResponse, getFallbackResponse } = require('./chatbot-masterclass-instructions');

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  console.log('🎬 MASTERCLASS CHATBOT CALLED');
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
    const { message, conversationHistory = [] } = JSON.parse(event.body);
    console.log('💬 Question reçue:', message);

    if (!message || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Vérifier le cache pour réponses rapides
    const cachedResponse = getCachedResponse(message);
    if (cachedResponse) {
      console.log('✅ Réponse depuis le cache');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: cachedResponse,
          cached: true,
          author: 'Animateur',
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }),
      };
    }

    // Utiliser le system prompt depuis le fichier d'instructions
    const systemPrompt = MASTERCLASS_INSTRUCTIONS.systemPrompt;

    // Préparer les messages pour l'API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-MASTERCLASS_INSTRUCTIONS.config.maxContextMessages),
      { role: 'user', content: message }
    ];

    // Appel à l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: MASTERCLASS_INSTRUCTIONS.config.model,
      messages: messages,
      max_tokens: MASTERCLASS_INSTRUCTIONS.config.maxTokens,
      temperature: MASTERCLASS_INSTRUCTIONS.config.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ Réponse de l\'IA générée');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: response.trim(),
        author: 'Animateur',
        usage: completion.usage,
      }),
    };

  } catch (error) {
    console.error('Masterclass chatbot error:', error);

    // Fallback response
    const fallbackResponse = getFallbackResponse();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackResponse,
        author: 'Animateur',
        error: true,
      }),
    };
  }
};

