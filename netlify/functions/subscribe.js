const https = require('https');

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
    const { email, name, avatar, phone, step } = JSON.parse(event.body);

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
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID;

    if (!API_KEY || !GROUP_ID) {
      console.error('Missing MailerLite configuration');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log(`Processing step ${step} for email: ${email}`);

    return new Promise((resolve, reject) => {
      // Gestion des différentes étapes
      let requestData;
      // Use MailerLite (new) API: https://connect.mailerlite.com/api
      // We will always POST to /api/subscribers (upsert by email)
      const requestPath = '/api/subscribers';
      const requestMethod = 'POST';

      switch(step) {
        case '1':
          // Étape 1 : Créer le contact avec prénom et email
          if (!name) {
            resolve({
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Name is required for step 1' })
            });
            return;
          }

          requestData = {
            email: email,
            fields: {
              name: name,
              step: '1'
            },
            // Add to group on first step
            groups: [GROUP_ID]
          };
          break;

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
              step: '2'
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
              step: '3'
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
                redirect: step === '3' ? '/100k-masterclass' : null
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
