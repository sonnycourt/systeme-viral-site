const https = require("https");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const {
      prenom,
      email,
      telephone,
      profil,
      objectif,
      motivation,
      thematique,
      raison,
      utm = {},
    } = JSON.parse(event.body || "{}");

    if (
      !prenom ||
      !email ||
      !telephone ||
      !profil ||
      !objectif ||
      !motivation ||
      !thematique ||
      !raison
    ) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const API_KEY = process.env.MAILERLITE_API_KEY;
    const PRIMARY_GROUP = process.env.MAILERLITE_POSTULER_GROUP_ID || process.env.MAILERLITE_GROUP_ID;
    const FALLBACK_GROUP = "170965820846901124";
    const groupId = PRIMARY_GROUP || FALLBACK_GROUP;

    if (!API_KEY || !groupId) {
      console.error("[postuler-submit] Missing MailerLite configuration");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    const requestData = {
      email,
      fields: {
        name: prenom,
        phone: telephone,
        // Champs personnalisés - à créer dans MailerLite si nécessaire
        prenom_custom: prenom,
        profil_custom: profil,
        objectif_custom: objectif,
        motivation_custom: motivation,
        thematique_custom: thematique,
        raison_custom: raison,
        ...(utm?.utm_source ? { utm_source: utm.utm_source } : {}),
        ...(utm?.utm_content ? { utm_content: utm.utm_content } : {}),
      },
      groups: [groupId],
      tags: [objectif, motivation, raison, "has_phone"],
    };

    console.log("[postuler-submit] Sending data to MailerLite:", JSON.stringify(requestData, null, 2));

    const payload = JSON.stringify(requestData);

    const options = {
      hostname: "connect.mailerlite.com",
      port: 443,
      path: "/api/subscribers",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const responseBody = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: data ? JSON.parse(data) : null });
          } else {
            reject({
              statusCode: res.statusCode || 500,
              body: data ? JSON.parse(data) : { error: "MailerLite error" },
              raw: data,
            });
          }
        });
      });

      req.on("error", (error) => {
        reject({ statusCode: 500, body: { error: error.message } });
      });

      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: responseBody }),
    };
  } catch (error) {
    console.error("[postuler-submit] Error:", error);
    console.error("[postuler-submit] Raw error:", error?.raw);
    const statusCode = error?.statusCode || 500;
    const body = error?.body
      ? error.body
      : { error: "Internal server error", details: error.message || "unknown" };

    return {
      statusCode,
      headers,
      body: JSON.stringify(body),
    };
  }
};

