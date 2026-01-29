const https = require('https');

// Enregistrer le token dans Netlify Blobs pour la scarcity (source de vérité par token, comme sonnycourt manifest)
async function registerTokenInBlobs(token, startTime) {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('sv-places-tokens');
  const existing = await store.get(token);
  if (existing) {
    console.log('Token already in Blobs, keeping original startTime:', token);
    return;
  }
  await store.set(token, JSON.stringify({ startTime }));
  console.log('Token registered in Blobs:', token, 'startTime:', startTime);
}

// Fonction helper pour récupérer un subscriber par email
function getSubscriberByEmail(email, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'connect.mailerlite.com',
      port: 443,
      path: `/api/subscribers/${encodeURIComponent(email)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const subscriber = JSON.parse(data);
            resolve({ exists: true, data: subscriber.data });
          } catch (e) {
            resolve({ exists: false, data: null });
          }
        } else if (res.statusCode === 404) {
          // Subscriber n'existe pas
          resolve({ exists: false, data: null });
        } else {
          console.error(`Error fetching subscriber: ${res.statusCode}`, data);
          resolve({ exists: false, data: null });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error in getSubscriberByEmail:', error);
      resolve({ exists: false, data: null });
    });

    req.end();
  });
}

export async function handler(event, context) {
  // Headers CORS pour toutes les réponses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gestion des requêtes OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Vérifier que c'est une requête POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, name, avatar, phone, step, utm_source, utm_content, uniqueTokenSV } = JSON.parse(event.body);

    // Validation de base
    if (!email || !step) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and step are required' })
      };
    }

    // Récupération des variables d'environnement
    const API_KEY = process.env.MAILERLITE_API_KEY;
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID_EVERGREEN_2026;

    if (!API_KEY || !GROUP_ID) {
      console.error('Missing MailerLite configuration');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log(`Processing step ${step} for email: ${email}`);

    // Pour le step 1, vérifier si le subscriber existe déjà
    if (step === '1') {
      const existingSubscriber = await getSubscriberByEmail(email, API_KEY);
      
      let tokenToUse = uniqueTokenSV;
      let firstOptinDate = new Date().toISOString();
      
      if (existingSubscriber.exists) {
        console.log(`Subscriber already exists for ${email}, preserving original token`);
        
        // Récupérer le token original s'il existe
        const fields = existingSubscriber.data?.fields || {};
        const originalToken = fields.unique_token_sv;
        const originalFirstOptinDate = fields.first_optin_date;
        
        if (originalToken) {
          tokenToUse = originalToken;
          console.log(`Using original token: ${originalToken}`);
        } else {
          console.log(`No original token found, using new token: ${uniqueTokenSV}`);
        }
        
        if (originalFirstOptinDate) {
          firstOptinDate = originalFirstOptinDate;
          console.log(`Preserving original first_optin_date: ${originalFirstOptinDate}`);
        }
      } else {
        console.log(`New subscriber for ${email}, using new token: ${uniqueTokenSV}`);
      }
      
      // Créer la requête avec le token approprié
      const requestData = {
        email: email,
        fields: {
          name: name,
          step: '1',
          unique_token_sv: tokenToUse,
          first_optin_date: firstOptinDate,
          ...(utm_source && { utm_source: utm_source }),
          ...(utm_content && { utm_content: utm_content })
        },
        groups: [GROUP_ID]
      };

      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(requestData);
        
        const options = {
          hostname: 'connect.mailerlite.com',
          port: 443,
          path: '/api/subscribers',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        console.log('Step 1 - POST request with data:', JSON.stringify(requestData, null, 2));

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            console.log(`MailerLite API Response Status: ${res.statusCode}`);
            console.log(`MailerLite API Response Body: ${data}`);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`Step 1 completed successfully for ${email}`);
              // Enregistrer le token dans Blobs pour la scarcity (comme sonnycourt manifest)
              const startTime = firstOptinDate
                ? Math.floor(new Date(firstOptinDate).getTime() / 1000)
                : Math.floor(Date.now() / 1000);
              registerTokenInBlobs(tokenToUse, startTime)
                .then(() => {
                  resolve({
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                      success: true,
                      step: '1',
                      message: 'Step 1 completed successfully',
                      uniqueTokenSV: tokenToUse,
                      isReturning: existingSubscriber.exists,
                      firstOptinDate: firstOptinDate
                    })
                  });
                })
                .catch((err) => {
                  console.error('Blobs register error (non-blocking):', err);
                  resolve({
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                      success: true,
                      step: '1',
                      message: 'Step 1 completed successfully',
                      uniqueTokenSV: tokenToUse,
                      isReturning: existingSubscriber.exists,
                      firstOptinDate: firstOptinDate
                    })
                  });
                });
            } else {
              console.error(`MailerLite Step 1 Error (${res.statusCode}):`, data);
              resolve({
                statusCode: res.statusCode || 500,
                headers,
                body: JSON.stringify({
                  error: 'Failed to process step 1',
                  details: data
                })
              });
            }
          });
        });

        req.on('error', (error) => {
          console.error('Request error:', error);
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Request failed', details: error.message })
          });
        });

        req.write(postData);
        req.end();
      });
    }

    return new Promise((resolve, reject) => {
      // Gestion des étapes 2 et 3
      let requestData;
      const requestPath = '/api/subscribers';
      const requestMethod = 'POST';

      switch(step) {
        case '1':
          // Cette case ne devrait jamais être atteinte car traitée ci-dessus
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Step 1 should be handled above' })
          });
          return;

        case '2':
          // Étape 2 : Mettre à jour avec l'avatar sélectionné
          if (!avatar) {
            resolve({
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Avatar is required for step 2' })
            });
            return;
          }

          // Déterminer le tag selon l'avatar
          const avatarTag = avatar === 'entrepreneur' ? 'entrepreneur' :
                            avatar === 'influenceur' ? 'influenceur' : 'employe';

          requestData = {
            email: email,
            fields: {
              avatar: avatar,
              tag: avatarTag,
              step: '2',
              // Mettre à jour les paramètres UTM s'ils sont fournis
              ...(utm_source && { utm_source: utm_source }),
              ...(utm_content && { utm_content: utm_content })
            }
          };
          break;

        case '3':
          // Étape 3 : Finaliser avec le numéro de téléphone et redirection
          if (!phone) {
            resolve({
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Phone is required for step 3' })
            });
            return;
          }

          requestData = {
            email: email,
            fields: {
              phone: phone,
              step: '3',
              // Finaliser avec les paramètres UTM s'ils sont fournis
              ...(utm_source && { utm_source: utm_source }),
              ...(utm_content && { utm_content: utm_content })
            }
          };
          break;

        default:
          resolve({
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid step' })
          });
          return;
      }

      console.log(`Step ${step} - ${requestMethod} request to:`, requestPath);
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      // Préparer les données pour la requête
      const postData = JSON.stringify(requestData);

      const options = {
        hostname: 'connect.mailerlite.com',
        port: 443,
        path: requestPath,
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        console.log(`MailerLite API Response Status: ${res.statusCode}`);

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`MailerLite API Response Body: ${data}`);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`Step ${step} completed successfully for ${email}`);
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                step: step,
                message: `Step ${step} completed successfully`,
                redirect: step === '3' ? '/100k-masterclass' : null,
                uniqueTokenSV: step === '1' ? uniqueTokenSV : undefined
              })
            });
          } else {
            console.error(`MailerLite Step ${step} Error (${res.statusCode}):`, data);
            resolve({
              statusCode: res.statusCode || 500,
              headers,
              body: JSON.stringify({
                error: `Failed to process step ${step}`,
                details: data
              })
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Request failed', details: error.message })
        });
      });

      // Envoyer les données
      req.write(postData);
      req.end();
    });

  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
