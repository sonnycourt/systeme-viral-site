# 🍪 Configuration du système de cookies - Système Viral

## ✅ Système implémenté

Le système de cookies complet a été implémenté avec succès sur `systemeviral.com` :

### 📁 Fichiers créés :
- `src/components/CookieConsent.astro` - Bannière et modale de consentement
- `src/scripts/cookie-consent.js` - Logique de gestion des cookies
- `src/styles/cookie-consent.css` - Styles adaptés au thème Système Viral
- `src/components/GAConsentMode.astro` - Google Analytics avec Consent Mode
- `src/pages/confidentialite.astro` - Page politique de confidentialité
- `src/pages/cgu.astro` - Page conditions d'utilisation
- `src/pages/cgv.astro` - Page conditions générales de vente

### 🎨 Adaptations pour Système Viral :
- **Couleurs** : Vert `#00DC82` au lieu du bleu
- **Thème** : Adapté au design existant
- **Contenu** : Textes adaptés à Système Viral
- **Liens** : Pointent vers les bonnes pages

## 🔧 Configuration requise

### 1. Google Analytics
**IMPORTANT** : Créer une nouvelle propriété pour éviter les conflits avec `sonnycourt.com`

1. Aller sur [Google Analytics](https://analytics.google.com)
2. Créer une **nouvelle propriété** pour `systemeviral.com`
3. Récupérer le **nouveau Measurement ID** (format: `G-XXXXXXXXXX`)
4. Créer un fichier `.env` avec :
   ```
   PUBLIC_GA_MEASUREMENT_ID=G-TON_NOUVEAU_ID
   ```

### 2. Google Tag Manager (optionnel)
1. Créer un **nouveau container** pour `systemeviral.com`
2. Récupérer le **Container ID** (format: `GTM-XXXXXXX`)
3. Ajouter dans `.env` :
   ```
   PUBLIC_GTM_ID=GTM-TON_NOUVEAU_ID
   ```

### 3. Facebook Pixel (optionnel)
1. Créer un **nouveau pixel** pour `systemeviral.com`
2. Récupérer le **Pixel ID**
3. Ajouter dans `.env` :
   ```
   PUBLIC_FACEBOOK_PIXEL_ID=TON_NOUVEAU_ID
   ```

### 4. LinkedIn Insight Tag (optionnel)
1. Créer un **nouveau Partner ID** pour `systemeviral.com`
2. Ajouter dans `.env` :
   ```
   PUBLIC_LINKEDIN_INSIGHT_ID=TON_NOUVEAU_ID
   ```

## 🚀 Fonctionnalités

### ✨ Bannière de consentement
- Apparaît en bas de page pour les nouveaux visiteurs
- Boutons "Accepter tous" et "Gérer en détail"
- Design responsive et accessible

### ⚙️ Modale de préférences
- 3 catégories : Nécessaires, Statistiques, Marketing
- Switches pour activer/désactiver
- Boutons "Refuser", "Enregistrer", "Accepter tous"

### 🍪 Gestion des cookies
- **Stockage** : Cookie `cookieConsent` valable 12 mois
- **Catégories** : `necessary`, `statistics`, `marketing`
- **Scripts différés** : Activation conditionnelle selon le consentement

### 📊 Google Analytics Consent Mode
- **Par défaut** : Tous les cookies refusés
- **Après acceptation** : Activation complète
- **Événements** : `cookie_accept`, `cookie_refuse`

## 🔒 Conformité RGPD

### ✅ Obligations respectées :
- **Consentement explicite** avant activation des cookies
- **Granularité** : Choix par catégorie
- **Transparence** : Information claire sur l'usage
- **Révocabilité** : Possibilité de modifier les choix
- **Droit d'accès** : Page de confidentialité détaillée

### 📋 Pages légales créées :
- **Politique de confidentialité** : `/confidentialite`
- **Conditions d'utilisation** : `/cgu`
- **Conditions générales de vente** : `/cgv`

## 🎯 Utilisation

### Pour les développeurs :
1. Le système se charge automatiquement via `Layout.astro`
2. Aucune configuration supplémentaire nécessaire
3. Les scripts avec `data-cookie-category` sont gérés automatiquement

### Exemple d'utilisation :
```html
<!-- Script qui ne se charge qu'avec le consentement statistiques -->
<script type="text/plain" data-cookie-category="statistics">
  // Code Google Analytics
</script>

<!-- Script qui ne se charge qu'avec le consentement marketing -->
<script type="text/plain" data-cookie-category="marketing">
  // Code Facebook Pixel
</script>
```

## 🚨 Points d'attention

### ⚠️ Séparation des données :
- **Nouveau GA ID** obligatoire pour éviter les conflits
- **Nouveaux IDs** pour tous les services de tracking
- **Domaines séparés** dans les configurations

### 🔧 Maintenance :
- Vérifier régulièrement la conformité RGPD
- Mettre à jour les pages légales si nécessaire
- Tester le système sur différents navigateurs

## 📞 Support

Pour toute question sur l'implémentation :
- **Email** : support@systemeviral.com
- **Documentation** : Ce fichier et les commentaires dans le code

---

**🎉 Le système de cookies est maintenant opérationnel sur systemeviral.com !**
