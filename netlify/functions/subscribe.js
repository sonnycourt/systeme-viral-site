import fetch from 'node-fetch';

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

    // Configuration de l'API MailerLite
    const mailerliteHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json'
    };

    let response;
    let tags = ['source-systeme-viral-site'];

    // Gestion des différentes étapes
    switch(step) {
      case '1':
        // Étape 1 : Créer le contact avec prénom et email
        if (!name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name is required for step 1' })
          };
        }

        const subscriberDataStep1 = {
          email: email,
          fields: {
            name: name,
            step: '1'
          },
          groups: [GROUP_ID],
          tags: ['etape-1', 'inscription-commencee']
        };

        console.log('Step 1 - Creating subscriber:', subscriberDataStep1);

        response = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
          method: 'POST',
          headers: mailerliteHeaders,
          body: JSON.stringify(subscriberDataStep1)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('MailerLite Step 1 Error:', errorData);
          return {
            statusCode: response.status,
            headers,
            body: JSON.stringify({ error: 'Failed to create subscriber in step 1' })
          };
        }

        break;

      case '2':
        // Étape 2 : Mettre à jour avec l'avatar sélectionné
        if (!avatar) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Avatar is required for step 2' })
          };
        }

        // Déterminer le tag selon l'avatar
        const avatarTag = avatar === 'entrepreneur' ? 'entrepreneur' :
                          avatar === 'influenceur' ? 'influenceur' : 'employe';

        const updateDataStep2 = {
          fields: {
            avatar: avatar,
            step: '2'
          },
          tags: ['etape-2', avatarTag, 'avatar-selectionne']
        };

        console.log('Step 2 - Updating subscriber:', updateDataStep2);

        response = await fetch(`https://api.mailerlite.com/api/v2/subscribers/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: mailerliteHeaders,
          body: JSON.stringify(updateDataStep2)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('MailerLite Step 2 Error:', errorData);
          return {
            statusCode: response.status,
            headers,
            body: JSON.stringify({ error: 'Failed to update subscriber in step 2' })
          };
        }

        break;

      case '3':
        // Étape 3 : Finaliser avec le numéro de téléphone et redirection
        if (!phone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Phone is required for step 3' })
          };
        }

        const updateDataStep3 = {
          fields: {
            phone: phone,
            step: '3'
          },
          tags: ['etape-3', 'inscription-complete']
        };

        console.log('Step 3 - Finalizing subscriber:', updateDataStep3);

        response = await fetch(`https://api.mailerlite.com/api/v2/subscribers/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: mailerliteHeaders,
          body: JSON.stringify(updateDataStep3)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('MailerLite Step 3 Error:', errorData);
          return {
            statusCode: response.status,
            headers,
            body: JSON.stringify({ error: 'Failed to finalize subscriber in step 3' })
          };
        }

        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid step' })
        };
    }

    const responseData = await response.json();
    console.log(`Step ${step} completed successfully for ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        step: step,
        message: `Step ${step} completed successfully`,
        redirect: step === '3' ? 'https://systemeviral.com/100k-masterclass' : null
      })
    };

  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
