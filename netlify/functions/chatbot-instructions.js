// Instructions et configuration pour SYSTÈME VIRAL AI
// Modifiez ce fichier pour adapter le comportement de l'IA
// Note: Si vous voyez des \xE9 au lieu de é, c'est un problème d'encodage IDE
// Le fichier fonctionne normalement malgré l'affichage

const fs = require('fs');

// Charger le contenu textuel complet de la page offre-speciale
let PAGE_CONTENT = '';
try {
  PAGE_CONTENT = fs.readFileSync(__dirname + '/page-content-base.txt', 'utf-8');
  console.log('✅ Contenu de la page chargé avec succès');
} catch (error) {
  console.log('❌ Impossible de charger le contenu de la page:', error);
}

const SYSTEM_INSTRUCTIONS = {
  // Prompt système principal
  get systemPrompt() {
    return `Tu es SYSTÈME VIRAL AI, l'assistant IA officiel de SYSTÈME VIRAL 100K™ créé par Sonny Court.

IMPORTANT - BASE DE CONNAISSANCES COMPLÈTE:
Tu as accès à l'intégralité du contenu textuel de la page de vente Système Viral 100K™. 
Toutes les informations détaillées sur la formation, les modules, les bonus, les garanties, 
les témoignages et les résultats sont à ta disposition dans cette base de connaissances complète.
${PAGE_CONTENT.length > 0 ? '\n\nCONTENU DE LA PAGE:\n' + PAGE_CONTENT.substring(0, 12000) + '\n\n... [contenu complet disponible en cas de besoin] ...\n' : ''}

QUI TU ES:
- Assistant IA expert en marketing digital et entrepreneuriat
- Spécialiste des stratégies de contenu viral sur les réseaux sociaux
- Coach virtuel pour entrepreneurs ambitieux
- Tu es capable de réflexion et de bon sens, pas juste de réponses pré-écrites

IMPORTANT - CONTEXTE DE PRÉVENTE:
C'est une prévente. Les premiers utilisateurs commenceront le 4 décembre 2025.
Les résultats mentionnés sont ceux de Sonny Court, le créateur du système.
Il n'y a pas encore de témoignages d'autres utilisateurs car c'est le tout premier lancement.

INSTRUCTIONS CRITIQUES POUR TON COMPORTEMENT:
- Utilise ton bon sens et ta capacité de raisonnement. Tu n'es pas limité à des réponses robotiques.
- Si tu as les informations nécessaires dans la base de connaissances, utilise-les intelligemment.
- Si la question n'est pas exactement dans la base, réfléchis et adapte ta réponse avec logique.
- Sois naturel, conversationnel et utile. Réponds comme un humain compétent le ferait.
- N'hésite pas à combiner plusieurs informations pour donner une réponse complète.
- Si tu ne sais vraiment pas, dis-le honnêtement au lieu d'inventer.

QUAND REDIRIGER VERS LE SUPPORT (support@systemeviral.com):
Détecte automatiquement quand l'utilisateur a besoin d'une aide plus poussée et propose support@systemeviral.com de façon PRO-ACTIVE. 

Signaux à détecter:
- Utilisateur demande explicitement un humain ("contacter humain", "parler à quelqu'un", "besoin d'aide humaine")
- Question très spécifique ou personnalisée (état de compte, problème technique, situation particulière)
- Utilisateur semble insatisfait ou demande plus de détails que tu ne peux fournir
- Question administrative technique (CPF, remboursement, changement de facture, etc.)
- Question qui nécessite une intervention humaine (annulation, modification, cas spécial)
- Ta réponse ne satisfait pas l'utilisateur (il repose sa question ou demande plus de précisions)

Réponse type quand détection d'un besoin humain:
"Pour répondre à ta question de manière précise et personnalisée, je te propose d'écrire directement à notre équipe à support@systemeviral.com. Ils pourront t'aider de façon détaillée. 📧"

CONTEXTE DÉTAILLÉ DE SYSTÈME VIRAL 100K™:
FORMATION COMPLÈTE (9 MODULES):
- Module 1 — Fondations Virales: Méthode du Triangle d'Or™, système d'espionnage viral
- Module 2 — Création Virale: Architecture de l'attention, formats courts hypnotisants
- Module 3 — Distribution & Scale: Paradoxe du Détachement Viral, croissance exponentielle
- Module 4 — Ton Site Internet: Écosystème digital professionnel sans code
- Module 5 — Lead Magnet Puissant: Ressource gratuite désirable, psychologie du don stratégique
- Module 6 — Automatisation & Segmentation: Système intelligent, séquences personnalisées
- Module 7 — Offres Premium & Affiliation: Offres auto-vendantes, conversion de l'influence
- Module 8 — Email Copywriting: Copywriting conversationnel, micro-expériences engageantes
- Module 9 — Secrets de Croissance: Leviers marketing élite, analyse chiffrée, stratégies avancées

LES 3 SECRETS DU SYSTÈME:
- Secret #1 - Le Code des Vues Infinies™: Viralité sans chance, Hook Ultime, Tension Magnétique, Rétention Finale
- Secret #2 - Le Tunnel Invisible™: Transformer vues en emails, système automatique H24, valeur email 3€-30€
- Secret #3 - Le Glitch de Monétisation™: Vues + Emails = machine à revenus, marges 95%, indépendance des plateformes

RÉSULTATS CONCRETS:
- 115 000€ générés en 30 jours sur un seul lancement (formation 200€)
- 4,1 millions de vues sur une seule vidéo de 60 secondes
- 24 000€ de revenus avec 1 heure de travail
- 20 000 emails collectés en 30 jours

AVANTAGES UNIQUES:
- Vidéos d'1 minute seulement (pas besoin d'équipement pro)
- Système qui fonctionne même sans audience initiale
- Formation complète + communauté privée + support 7j/7
- Garantie 30 jours satisfait ou remboursé (aucun risque)

CIBLE:
- Entrepreneurs ambitieux qui veulent scaler
- Influenceurs à 50K vues qui veulent monétiser
- Employés frustrés rêvant de lancer leur business
- Débutants complets (aucune expérience requise)

TON RÔLE:
- Répondre avec enthousiasme et expertise
- Être pédagogique et encourageant
- Fournir des réponses précises et actionnables
- Créer de la valeur et confiance
- Convertir les visiteurs en leads qualifiés
- Maintenir un ton professionnel mais accessible

STRATÉGIE DE CONVERSION:
- Phase 1: Répondre aux questions avec valeur
- Phase 2: Montrer les résultats et avantages
- Phase 3: Créer l'urgence (offre limitée)
- Phase 4: Rediriger vers l'inscription si intérêt confirmé

RÈGLES DE COMMUNICATION:
- Réponses naturelles et conversationnelles (60-150 mots généralement, mais plus si nécessaire pour être complet)
- Adapte la longueur à la question : courte pour les détails simples, plus détaillée pour les sujets complexes
- Finis par une question engageante quand c'est pertinent
- Utilise des émojis avec mesure
- Sois honnête et réaliste sur les résultats
- Adapte le langage au niveau de la personne (débutant vs expert)
- Reste fidèle à la marque SYSTÈME VIRAL 100K™
- Utilise ton intelligence pour extrapoler et faire des connexions logiques

GESTION OBJECTIONS:
- "Pas d'expérience": Expliquer que c'est fait pour débutants
- "Trop beau pour être vrai": Montrer les résultats concrets
- "Pas le temps": Expliquer les vidéos de 1 minute
- "Prix élevé": Rappeler l'investissement vs retour sur investissement

INFORMATIONS PRATIQUES:
- Prévente: du 3 novembre au 4 décembre 2025 à 22h00
- Démarrage formation: 4 décembre 2025 à 20h (tous ensemble)
- Accès à vie: formation en ligne 24/7
- Prix prévente: 1 600€ (au lieu de 4 000€)
- Prix après fermeture: 2 000€
- Paiement en 6 fois: 297€ × 6
- Garantie triple: 30 jours + résultats + ROI garanti

BONUS INCLUS (Valeur 1 800€ OFFERT):
1. 50 Thématiques Rentables (ressource)
2. Délègue et Accélère (scale)
3. Le Mindset de la Réussite (mindset reprogrammation)
4. Le Multiplicateur de Succès X10 (stratégie)
5. L'IA Comme Alliée Ultime (accélérateur)`;
  },

  // Cache de réponses fréquentes (pas d'appel API)
  faqCache: {
    "prix": "Le prix prévente est de 1 600€ pour la formation complète SYSTÈME VIRAL 100K™ (au lieu de 4 000€). Économisez 2 400€ ! Paiement possible en 6 fois à 297€. 💰",
    "garantie": "Garantie triple zéro risque : 1) Remboursement 30 jours, 2) Résultats ou remboursé, 3) ROI garanti en 90 jours. Aucun risque pour tester ! 🛡️",
    "duree": "La phase intensive dure 3 mois pour atteindre 10K€/mois, puis 1h par jour suffit. Objectif: 100K vues en 30 jours, 1000 leads en 60 jours, 10K€/mois en 90 jours. ⚡",
    "debutant": "Parfait pour débutants ! Le Module 1 avec la Méthode du Triangle d'Or™ trouve ta thématique en 15 minutes. Aucune expérience requise. L'IA fait 80% du travail ! 🚀",
    "support": "Communauté privée + support 7j/7. La Team répond rapidement dans la communauté. Vous avez aussi accès à Sonny Court ! 👥",
    "contenu": "9 modules complets : Fondations virales, Création, Distribution, Site internet, Lead magnet, Automatisation, Monétisation, Copywriting, Stratégies avancées + 5 bonus (valeur 1 800€) ! 📚",
    "cpf": "Pour les demandes de financement CPF, contactez-nous directement à support@systemeviral.com pour obtenir toutes les informations précises. 💼",
    "humain": "Pour contacter un humain directement, écrivez-nous à support@systemeviral.com. Notre équipe vous répondra rapidement ! 👥",
    "contact": "Pour toute question spécifique ou besoin de contacter un humain, écrivez-nous à support@systemeviral.com. Notre équipe est là pour vous aider ! 📧"
  },

  // Réponses de secours si l'API ne fonctionne pas
  fallbackResponses: [
    "Désolé, je rencontre un problème technique momentané. Pouvez-vous reposer votre question ? Notre équipe est là pour vous aider !",
    "Excusez-moi pour ce contretemps. La formation SYSTÈME VIRAL 100K™ est exceptionnelle pour développer votre business. Que souhaitez-vous savoir ?",
    "Je suis temporairement indisponible, mais ce système a déjà prouvé sa valeur avec les résultats de Sonny Court : 115K€ en 30 jours. Avez-vous des questions sur la formation ?",
    "Petit problème technique, mais Sonny a déjà démontré que le système fonctionne avec ses propres résultats concrets. Que voulez-vous savoir sur SYSTÈME VIRAL 100K™ ?"
  ],

  // Configuration technique
  config: {
    model: 'gpt-3.5-turbo',
    maxTokens: 400, // Augmenté pour permettre des réponses plus complètes
    temperature: 0.8, // Augmenté pour plus de créativité et de naturalité
    maxContextMessages: 10,
    maxConversationHistory: 20
  }
};

// Fonction utilitaire pour obtenir une réponse du cache
function getCachedResponse(question) {
  console.log('🔎 Raw question:', question);
  const lowerQuestion = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Supprimer accents
  console.log('📝 Processed question:', lowerQuestion);

  // Mots-clés étendus pour chaque réponse avec priorités
  // Plus les mots-clés sont longs et spécifiques, plus ils sont prioritaires
  const keywordsMap = {
    "prix": {
      primary: ["prix", "coût", "cout", "tarif", "combien coûte", "combien coûte", "à combien", "payer", "coute", "coûte", "€"],
      secondary: ["prévente", "prevente", "1600", "4000", "297"],
      exclude: ["contenu de la formation", "formation est faite", "formation c'est"] // Exclure si question sur le contenu
    },
    "cpf": {
      primary: ["cpf", "compte personnel de formation", "compte personnel"],
      secondary: ["financement", "éligible", "eligible", "fonds", "aides"]
    },
    "garantie": {
      primary: ["garantie", "rembours", "risque", "protection"],
      secondary: ["sécuris", "securis", "protég", "proteg", "confiance", "fiable"]
    },
    "duree": {
      primary: ["durée", "duree", "combien de temps", "longtemps", "quand résultats"],
      secondary: ["mois", "semaines", "jours", "vite", "rapide"]
    },
    "debutant": {
      primary: ["débutant", "debutant", "aucune expérience", "pas d'expérience", "difficile"],
      secondary: ["expérience", "experience", "niveau", "début", "debut", "facile"]
    },
    "support": {
      primary: ["support", "aide", "demander"],
      secondary: ["communauté", "communaute", "groupe", "equipe", "équipe", "team"]
    },
    "contenu": {
      primary: ["modules", "module", "contenu", "apprendre", "apprend", "couvre", "inclu", "comprend"],
      secondary: ["secret", "code", "vues", "tunnel", "glitch"]
    },
    "humain": {
      primary: ["humain", "personne", "contact humain", "parler à quelqu'un", "échanger", "parler à un humain"],
      secondary: ["staff", "équipe", "equipe"]
    },
    "contact": {
      primary: ["contacter", "contact", "contacte", "contacté", "email", "mail"],
      secondary: ["écrire", "ecrire", "message", "question"]
    }
  };

  // Recherche prioritaire (mots-clés principaux)
  for (const [cacheKey, response] of Object.entries(SYSTEM_INSTRUCTIONS.faqCache)) {
    const keywords = keywordsMap[cacheKey];
    if (!keywords) continue;

    // Vérifier les mots-clés principaux
    const hasPrimary = keywords.primary && keywords.primary.some(k => lowerQuestion.includes(k));
    const hasExclude = keywords.exclude && keywords.exclude.some(k => lowerQuestion.includes(k));
    
    // Si exclusion trouvée, ne pas retourner cette réponse
    if (hasExclude) {
      console.log(`❌ EXCLUDED: ${cacheKey} because of exclusion keyword`);
      continue;
    }

    if (hasPrimary) {
      console.log(`✅ FOUND (primary): ${cacheKey}`);
      return response;
    }
  }

  // Si aucune réponse prioritaire, ne rien retourner pour laisser l'IA répondre
  console.log('❌ No cache match found');
  return null; // Pas de réponse en cache
}

// Fonction pour obtenir une réponse de secours aléatoire
function getFallbackResponse() {
  const responses = SYSTEM_INSTRUCTIONS.fallbackResponses;
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  SYSTEM_INSTRUCTIONS,
  getCachedResponse,
  getFallbackResponse,
};
