# 📊 Configuration Google Analytics 4 - SYSTÈME VIRAL

## 🎯 **Étapes de Configuration**

### **1. Créer un Compte Google Analytics 4**

1. Va sur [analytics.google.com](https://analytics.google.com)
2. Clique sur **"Commencer la mesure"**
3. **Nom du compte** : "Système Viral"
4. **Nom de la propriété** : "Site Système Viral"
5. **URL du site web** : `https://systemeviral.com`
6. **Secteur d'activité** : "Éducation"
7. **Taille de l'entreprise** : "1-10 employés"

### **2. Obtenir l'ID de Mesure**

1. Dans GA4, va dans **Administration** (⚙️)
2. Clique sur **"Flux de données"**
3. Clique sur **"Ajouter un flux"** → **"Web"**
4. **Nom du flux** : "Site Système Viral"
5. **URL du site web** : `https://systemeviral.com`
6. **Copie l'ID de mesure** (format : G-XXXXXXXXXX)

### **3. Remplacer l'ID dans le Code**

Dans le fichier `offre-speciale.astro`, remplace `GA_MEASUREMENT_ID` par ton vrai ID :

```html
<!-- AVANT -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    gtag('config', 'GA_MEASUREMENT_ID', {

<!-- APRÈS -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    gtag('config', 'G-XXXXXXXXXX', {
```

### **4. Configuration des Événements Personnalisés**

Dans GA4, va dans **Événements** → **Créer un événement** :

#### **Événement : optin_conversion**
- **Nom** : `optin_conversion`
- **Conditions** : `event_name = form_submit`
- **Paramètres** :
  - `utm_source` : Source du trafic
  - `utm_medium` : Medium du trafic
  - `utm_campaign` : Campagne

#### **Événement : purchase_conversion**
- **Nom** : `purchase_conversion`
- **Conditions** : `event_name = purchase`
- **Paramètres** :
  - `value` : Montant de la vente
  - `currency` : EUR
  - `utm_source` : Source du trafic

### **5. Configuration des Conversions**

Dans **Événements** → **Marquer comme conversion** :

1. ✅ `optin_conversion` (Optin)
2. ✅ `purchase_conversion` (Achat)
3. ✅ `cta_click` (Clic sur CTA)
4. ✅ `scroll_depth` (Scroll 75%+)

### **6. Rapports Personnalisés**

#### **Rapport "Sources de Trafic"**
1. Va dans **Exploration** → **Créer un rapport**
2. **Dimensions** : `Source`, `Medium`
3. **Métriques** : `Utilisateurs`, `Conversions`, `Revenus`
4. **Filtres** : `Page = /offre-speciale`

#### **Rapport "Parcours Utilisateur"**
1. Va dans **Exploration** → **Parcours**
2. **Point de départ** : `Page = /offre-speciale`
3. **Événements** : `optin_conversion`, `purchase_conversion`

## 📈 **Métriques à Surveiller**

### **Acquisition**
- **Utilisateurs par source** : Instagram, Facebook, TikTok, YouTube, Email
- **Taux de conversion par source** : Optin / Visiteurs
- **Revenus par source** : € générés par canal

### **Comportement**
- **Temps sur page** : Engagement
- **Scroll depth** : Intérêt pour le contenu
- **Clics CTA** : Actions des utilisateurs

### **Conversions**
- **Taux d'optin** : Visiteurs → Abonnés
- **Taux d'achat** : Abonnés → Clients
- **ROI par source** : Revenus / Coût

## 🎯 **Dashboard Recommandé**

### **Vue d'Ensemble Quotidienne**
```
📊 PERFORMANCE JOUR
┌─────────────┬──────────┬─────────────┬─────────┐
│ Source      │ Visiteurs│ Optins      │ Revenus │
├─────────────┼──────────┼─────────────┼─────────┤
│ Instagram   │ 45       │ 12 (27%)    │ 2,400€  │
│ Email       │ 89       │ 23 (26%)    │ 4,600€  │
│ Facebook    │ 23       │ 6 (26%)     │ 1,200€  │
│ TikTok      │ 67       │ 15 (22%)    │ 3,000€  │
│ YouTube     │ 34       │ 8 (24%)     │ 1,600€  │
└─────────────┴──────────┴─────────────┴─────────┘
```

### **Alertes à Configurer**
- **Baisse de trafic** : -20% vs hier
- **Baisse de conversions** : -15% vs hier
- **Nouvelle source** : Nouveau utm_source

## 🚀 **Optimisations Automatiques**

### **Si Instagram performe bien** :
- Augmenter les posts Instagram
- Créer plus de contenu pour Instagram
- Investir dans les stories Instagram

### **Si Email convertit bien** :
- Envoyer plus d'emails
- Améliorer les séquences email
- A/B tester les sujets

### **Si TikTok génère du trafic** :
- Créer plus de vidéos TikTok
- Optimiser les hashtags TikTok
- Collaborer avec des influenceurs TikTok

## ⚡ **Résumé des Actions**

1. ✅ **Créer compte GA4**
2. ✅ **Récupérer l'ID de mesure**
3. ✅ **Remplacer dans le code**
4. ✅ **Configurer les événements**
5. ✅ **Marquer les conversions**
6. ✅ **Créer les rapports**
7. ✅ **Surveiller les métriques**

**Ton tracking est maintenant 100% opérationnel ! 🎯**
