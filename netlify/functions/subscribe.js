// Format Netlify Functions v2 complet
import { getStore } from '@netlify/blobs';

// Enregistrer le token dans Netlify Blobs pour la scarcity
async function registerTokenInBlobs(token, startTime) {
  try {
    const store = getStore('sv-places-tokens');
    const existing = await store.get(token);
    if (existing) {
      console.log('Token already in Blobs, keeping original startTime:', token);
      return;
    }
    await store.set(token, JSON.stringify({ startTime }));
    console.log('Token registered in Blobs:', token, 'startTime:', startTime);
  } catch (err) {
    console.error('registerTokenInBlobs error:', err);
  }
}

// Fonction helper pour récupérer un subscriber par email
async function getSubscriberByEmail(email, apiKey) {
  try {
    const response = await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      return { exists: true, data: data.data };
    } else if (response.status === 404) {
      return { exists: false, data: null };
    } else {
      console.error(`Error fetching subscriber: ${response.status}`);
      return { exists: false, data: null };
    }
  } catch (error) {
    console.error('Error in getSubscriberByEmail:', error);
    return { exists: false, data: null };
  }
}

// Fonction helper pour faire une requête POST à MailerLite
async function postToMailerLite(path, data, apiKey) {
  const response = await fetch(`https://connect.mailerlite.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return {
    status: response.status,
    data: await response.json().catch(() => ({}))
  };
}

export default async (request, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  // Vérifier POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email, name, avatar, phone, step, utm_source, utm_content, uniqueTokenSV } = body;

    // Validation
    if (!email || !step) {
      return new Response(JSON.stringify({ error: 'Email and step are required' }), { status: 400, headers });
    }

    // Variables d'environnement
    const API_KEY = process.env.MAILERLITE_API_KEY;
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID_EVERGREEN_2026;

    if (!API_KEY || !GROUP_ID) {
      console.error('Missing MailerLite configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers });
    }

    console.log(`Processing step ${step} for email: ${email}`);

    // STEP 1 : Inscription initiale
    if (step === '1') {
      const existingSubscriber = await getSubscriberByEmail(email, API_KEY);
      
      let tokenToUse = uniqueTokenSV;
      let firstOptinDate = new Date().toISOString();
      
      if (existingSubscriber.exists) {
        console.log(`Subscriber already exists for ${email}, preserving original token`);
        const fields = existingSubscriber.data?.fields || {};
        const originalToken = fields.unique_token_sv;
        const originalFirstOptinDate = fields.first_optin_date;
        
        if (originalToken) {
          tokenToUse = originalToken;
          console.log(`Using original token: ${originalToken}`);
        }
        if (originalFirstOptinDate) {
          firstOptinDate = originalFirstOptinDate;
          console.log(`Preserving original first_optin_date: ${originalFirstOptinDate}`);
        }
      } else {
        console.log(`New subscriber for ${email}, using new token: ${uniqueTokenSV}`);
      }
      
      const requestData = {
        email: email,
        fields: {
          name: name,
          step: '1',
          unique_token_sv: tokenToUse,
          first_optin_date: firstOptinDate,
          ...(utm_source && { utm_source }),
          ...(utm_content && { utm_content })
        },
        groups: [GROUP_ID]
      };

      console.log('Step 1 - POST request with data:', JSON.stringify(requestData, null, 2));
      
      const result = await postToMailerLite('/api/subscribers', requestData, API_KEY);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`Step 1 completed successfully for ${email}`);
        
        // Enregistrer le token dans Blobs
        const startTime = firstOptinDate
          ? Math.floor(new Date(firstOptinDate).getTime() / 1000)
          : Math.floor(Date.now() / 1000);
        
        await registerTokenInBlobs(tokenToUse, startTime);
        
        return new Response(JSON.stringify({
          success: true,
          step: '1',
          message: 'Step 1 completed successfully',
          uniqueTokenSV: tokenToUse,
          isReturning: existingSubscriber.exists,
          firstOptinDate: firstOptinDate
        }), { status: 200, headers });
      } else {
        console.error(`MailerLite Step 1 Error (${result.status}):`, result.data);
        return new Response(JSON.stringify({
          error: 'Failed to process step 1',
          details: result.data
        }), { status: result.status || 500, headers });
      }
    }

    // STEP 2 : Avatar
    if (step === '2') {
      if (!avatar) {
        return new Response(JSON.stringify({ error: 'Avatar is required for step 2' }), { status: 400, headers });
      }

      const avatarTag = avatar === 'entrepreneur' ? 'entrepreneur' :
                        avatar === 'influenceur' ? 'influenceur' : 'employe';

      const requestData = {
        email: email,
        fields: {
          avatar: avatar,
          tag: avatarTag,
          step: '2',
          ...(utm_source && { utm_source }),
          ...(utm_content && { utm_content })
        }
      };

      console.log('Step 2 - POST request with data:', JSON.stringify(requestData, null, 2));
      
      const result = await postToMailerLite('/api/subscribers', requestData, API_KEY);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`Step 2 completed successfully for ${email}`);
        return new Response(JSON.stringify({
          success: true,
          step: '2',
          message: 'Step 2 completed successfully'
        }), { status: 200, headers });
      } else {
        console.error(`MailerLite Step 2 Error (${result.status}):`, result.data);
        return new Response(JSON.stringify({
          error: 'Failed to process step 2',
          details: result.data
        }), { status: result.status || 500, headers });
      }
    }

    // STEP 3 : Téléphone + redirection
    if (step === '3') {
      if (!phone) {
        return new Response(JSON.stringify({ error: 'Phone is required for step 3' }), { status: 400, headers });
      }

      const requestData = {
        email: email,
        fields: {
          phone: phone,
          step: '3',
          ...(utm_source && { utm_source }),
          ...(utm_content && { utm_content })
        }
      };

      console.log('Step 3 - POST request with data:', JSON.stringify(requestData, null, 2));
      
      const result = await postToMailerLite('/api/subscribers', requestData, API_KEY);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`Step 3 completed successfully for ${email}`);
        return new Response(JSON.stringify({
          success: true,
          step: '3',
          message: 'Step 3 completed successfully',
          redirect: '/100k-masterclass'
        }), { status: 200, headers });
      } else {
        console.error(`MailerLite Step 3 Error (${result.status}):`, result.data);
        return new Response(JSON.stringify({
          error: 'Failed to process step 3',
          details: result.data
        }), { status: result.status || 500, headers });
      }
    }

    // Step invalide
    return new Response(JSON.stringify({ error: 'Invalid step' }), { status: 400, headers });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500, headers });
  }
};
