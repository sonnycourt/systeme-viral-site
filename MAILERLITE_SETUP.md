# Configuration MailerLite pour Système Viral

## 📋 Vue d'ensemble
L'optin du site envoie automatiquement les données à MailerLite à chaque étape du formulaire en 3 étapes.

## 🔒 Configuration SÉCURISÉE

### 🚫 RÈGLE D'OR DE SÉCURITÉ
**TES VRAIES CLÉS API NE DOIVENT JAMAIS ÊTRE DANS LE CODE !**

### ❌ INTERDIT :
- ❌ `.env.local` avec des vraies clés
- ❌ Code Git avec des vraies clés
- ❌ Variables hardcodées
- ❌ Logs qui affichent les vraies clés

### ✅ AUTORISÉ :
- ✅ Variables d'environnement Netlify (dashboard)
- ✅ `.env.local` avec des valeurs bidons pour dev
- ✅ `.env.example` pour le format

### 1. Configuration PRODUCTION (Netlify Dashboard)

Va dans ton **dashboard Netlify** → **Site settings** → **Environment variables** :

Ajoute ces deux variables :
```
MAILERLITE_API_KEY = ta_vraie_clé_api_mailerlite
MAILERLITE_GROUP_ID = 165545558631515349
```

### 2. Configuration DÉVELOPPEMENT LOCAL

```bash
# Copie le fichier exemple
cp .env.example .env.local

# Modifie .env.local avec des valeurs bidons
MAILERLITE_API_KEY=dev_key_placeholder
MAILERLITE_GROUP_ID=165545558631515349
```

### 3. Récupération de l'API Key MailerLite

1. Va sur [MailerLite](https://dashboard.mailerlite.com/)
2. Clique sur "Account" → "Integrations" → "Developer API"
3. Génère une nouvelle API Key
4. **⚠️ Mets-la UNIQUEMENT dans le dashboard Netlify**

### 4. Group ID
Le Group ID est déjà configuré : `165545558631515349`

## 📊 Données envoyées à chaque étape

### Étape 1 : Prénom + Email
- **Création du contact** dans MailerLite
- **Tags ajoutés** : `etape-1`, `inscription-commencee`
- **Champs** : `name`, `email`, `step: "1"`

### Étape 2 : Sélection Avatar
- **Mise à jour du contact** existant
- **Tags ajoutés** : `etape-2`, `avatar-selectionne`, `[avatar]`
- **Avatars disponibles** :
  - `entrepreneur` → Tag: `entrepreneur`
  - `influenceur` → Tag: `influenceur`
  - `employe` → Tag: `employe`
- **Champs** : `avatar`, `step: "2"`

### Étape 3 : Numéro de téléphone
- **Finalisation du contact**
- **Tags ajoutés** : `etape-3`, `inscription-complete`
- **Format téléphone** : `+41789482376` (international avec +)
- **Champs** : `phone`, `step: "3"`
- **Redirection** : `https://systemeviral.com/100k-masterclass`

## 🎯 Tracking UTM automatique

Le système capture automatiquement les paramètres UTM et détecte la source des visiteurs :

### Paramètres UTM capturés
- `utm_source` : Source du trafic (tiktok, instagram, youtube, facebook, etc.)
- `utm_content` : Contenu spécifique (si présent dans l'URL)

### Détection automatique
Si aucun paramètre UTM n'est présent dans l'URL, le système détecte automatiquement la source depuis le referrer :
- **TikTok** : `tiktok.com` → `utm_source: tiktok`
- **Instagram** : `instagram.com` → `utm_source: instagram`
- **YouTube** : `youtube.com` ou `youtu.be` → `utm_source: youtube`
- **Facebook** : `facebook.com` ou `fb.com` → `utm_source: facebook`
- **Twitter/X** : `twitter.com` ou `x.com` → `utm_source: twitter`
- **LinkedIn** : `linkedin.com` → `utm_source: linkedin`
- **Snapchat** : `snapchat.com` → `utm_source: snapchat`
- **Pinterest** : `pinterest.com` → `utm_source: pinterest`
- **Moteurs de recherche** : Google, Bing, Yahoo, DuckDuckGo → `utm_source: organic`
- **Autre referrer** : → `utm_source: other`
- **Accès direct** : → `utm_source: direct`

### Configuration des champs personnalisés dans MailerLite

**IMPORTANT** : Avant que le tracking UTM fonctionne, tu dois créer les champs personnalisés dans MailerLite :

1. **Va sur [MailerLite Dashboard](https://dashboard.mailerlite.com/)**
2. **Clique sur "Audience" → "Fields"**
3. **Crée les champs personnalisés suivants** :
   - `utm_source` (Type: Text)
   - `utm_content` (Type: Text)

4. **Assure-toi que les noms des champs correspondent exactement** :
   - `utm_source` (pas `utm_source_` ou autre variante)
   - `utm_content` (pas `utm_content_` ou autre variante)

### Stockage des UTM
Les paramètres UTM sont stockés dans le localStorage du navigateur dès la première visite avec UTM. Ils sont conservés même si l'utilisateur navigue sur plusieurs pages avant de s'inscrire.

### Utilisation dans MailerLite
Une fois les champs créés, chaque inscription inclura automatiquement :
- La source exacte du trafic (`utm_source`)
- Le contenu spécifique si présent dans l'URL (`utm_content`)

Tu peux ensuite créer des segments dans MailerLite basés sur `utm_source` pour voir d'où viennent tes meilleurs leads !

## 🎯 Segmentation des leads

Les leads sont automatiquement taggés selon leur progression :

- **Abandon étape 1** : Contact avec prénom + email uniquement
- **Abandon étape 2** : Contact avec prénom + email + avatar
- **Complétion** : Contact complet avec téléphone

## 📧 Utilisation pour l'email marketing

Tu peux maintenant créer des campagnes ciblées :

1. **Nourrir les abandons** : Email de relance pour ceux qui n'ont pas fini
2. **Segmentation par avatar** : Contenu spécifique selon le profil
3. **Lead scoring** : Plus ils avancent dans le tunnel, plus ils sont chauds

## 🚀 Déploiement SÉCURISÉ

### 1. Développement Local
```bash
cp .env.example .env.local
# Mets des valeurs bidons dans .env.local
npm run dev:netlify
```

### 2. Production Netlify
1. **Push ton code** sur Git (sans vraies clés !)
2. **Dashboard Netlify** → **Site settings** → **Environment variables**
3. **Ajoute tes vraies clés** :
   ```
   MAILERLITE_API_KEY = [ta_vraie_clé]
   MAILERLITE_GROUP_ID = 165545558631515349
   ```
4. **Redeploy** automatiquement

### ⚠️ VÉRIFICATIONS DE SÉCURITÉ

Avant de déployer, vérifie que :
- ✅ Pas de vraies clés dans `.env.local`
- ✅ `.env.local` est dans `.gitignore`
- ✅ Les vraies clés sont dans le dashboard Netlify uniquement
- ✅ Le code ne contient pas de variables hardcodées

## 🔍 Debug

Les appels API sont loggés dans la console. En cas d'erreur :
- L'utilisateur continue quand même le processus (pas de blocage)
- Vérifie les logs Netlify Functions
- Vérifie que l'API Key et le Group ID sont corrects

## 📞 Support

Si tu as des questions sur la configuration MailerLite, consulte :
- [Documentation MailerLite API](https://developers.mailerlite.com/)
- [Dashboard MailerLite](https://dashboard.mailerlite.com/)
