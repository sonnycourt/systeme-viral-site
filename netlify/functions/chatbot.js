const OpenAI = require('openai');
const { SYSTEM_INSTRUCTIONS, getCachedResponse, getFallbackResponse } = require('./chatbot-instructions');

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

    // Vérifier d'abord le cache pour les questions fréquentes - TEST SIMPLE
    console.log('🔍 MESSAGE RECU:', message);

    // Test direct pour les questions de prix
    const lowerMessage = message.toLowerCase();
    console.log('📝 Message en minuscules:', lowerMessage);

    if (lowerMessage.includes('prix') ||
        lowerMessage.includes('combien') ||
        lowerMessage.includes('coût') ||
        lowerMessage.includes('cout') ||
        lowerMessage.includes('tarif') ||
        lowerMessage.includes('€') ||
        lowerMessage.includes('coute')) {

      console.log('✅ DETECTED PRICE QUESTION - RETURNING CACHE');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "Le prix spécial actuel est de 1 997€ pour la formation complète SYSTÈME VIRAL 100K™ (au lieu de 3 997€). C'est un investissement qui peut transformer votre business ! 💰",
          cached: true,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }),
      };
    }

    console.log('❌ Not a price question, continuing...');

    // Ancienne logique de cache si besoin
    const cachedResponse = getCachedResponse(message);
    if (cachedResponse) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: cachedResponse,
          cached: true,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }),
      };
    }

    // Utiliser le system prompt depuis le fichier d'instructions
    const systemPrompt = SYSTEM_INSTRUCTIONS.systemPrompt;

    // Préparer les messages pour l'API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-SYSTEM_INSTRUCTIONS.config.maxContextMessages), // Garder les derniers messages pour le contexte
      { role: 'user', content: message }
    ];

    // Appel à l'API OpenAI avec configuration depuis le fichier d'instructions
    const completion = await openai.chat.completions.create({
      model: SYSTEM_INSTRUCTIONS.config.model,
      messages: messages,
      max_tokens: SYSTEM_INSTRUCTIONS.config.maxTokens,
      temperature: SYSTEM_INSTRUCTIONS.config.temperature,
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

    // Fallback response depuis le fichier d'instructions
    const fallbackResponse = getFallbackResponse();

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
