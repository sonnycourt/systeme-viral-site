# 🎯 Dashboard Tracking - Système Viral

## 📋 **CE QUI A ÉTÉ CRÉÉ**

Tu as maintenant un dashboard interne pour suivre le parcours complet de chaque lead individuellement !

### **Fichiers créés :**
1. ✅ `netlify/functions/track-event.js` - Capture les événements de tracking
2. ✅ `netlify/functions/get-journeys.js` - Récupère les parcours des leads
3. ✅ `src/pages/dashboard.astro` - Page de visualisation
4. ✅ Script de tracking mis à jour pour envoyer les données au dashboard

## 🚀 **COMMENT ÇA MARCHE**

### **1. Collecte Automatique**
- Chaque visite, clic, scroll est automatiquement envoyé au backend
- Les données incluent : UTM source, medium, campaign, timestamp, etc.

### **2. Stockage des Données**
- Les événements sont stockés en mémoire (pour le moment)
- ⚠️ **Limitation** : Les données sont perdues quand les fonctions serverless se redémarrent
- **Solution** : Voir "Amélioration" ci-dessous

### **3. Visualisation**
- Accède à ton dashboard : `http://localhost:4321/dashboard`
- Tu verras tous tes leads avec leur parcours complet

## 🎯 **UTILISATION**

### **Accéder au Dashboard**
```
http://localhost:4321/dashboard
```

### **Ce que tu verras :**
```
📊 Dashboard - Parcours des Leads

[Statistiques]
Total Leads: 45
Optins: 23
Achats: 12
Taux Conversion: 52%

[Parcours du Lead]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 jean.dupont@gmail.com
🔗 Source: instagram

🌐 Visite sur /offre-speciale
👆 Clic sur CTA Principal
✅ Opt-in : jean.dupont@gmail.com
💰 Achat : 497€
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 **AMÉLIORATION (Stockage Persistant)**

### **Option 1 : Supabase (Recommandé - GRATUIT)**

Supabase est une alternative à Firebase, 100% gratuite pour commencer.

#### **Configuration :**
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et la clé API
4. Créer une table `tracking_events` :

```sql
CREATE TABLE tracking_events (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  data JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Mise à jour des fonctions :**
Je peux t'aider à les mettre à jour pour utiliser Supabase si tu veux.

### **Option 2 : Airtable (Simple - GRATUIT)**

Airtable fonctionne comme un Google Sheets mais avec des super-pouvoirs.

#### **Configuration :**
1. Créer un compte sur [airtable.com](https://airtable.com)
2. Créer une base "Système Viral Tracking"
3. Créer les colonnes : session_id, event, data, utm_source, utm_medium, timestamp
4. Récupérer l'API Key et la Base ID
5. Mettre à jour les fonctions Netlify pour utiliser l'API Airtable

### **Option 3 : MongoDB Atlas (GRATUIT)**

1. Créer un compte sur [mongodb.com/atlas](https://mongodb.com/atlas)
2. Créer un cluster gratuit
3. Récupérer la connection string
4. Utiliser le driver MongoDB dans les fonctions Netlify

## 🎨 **DASHBOARD - FONCTIONNALITÉS**

### **Stats en Temps Réel**
- Total des leads
- Nombre d'optins
- Nombre d'achats
- Taux de conversion

### **Parcours Complets**
Chaque lead affiche :
- 📧 Email (si renseigné)
- 🔗 Source de trafic (Instagram, Facebook, etc.)
- 📝 Toutes les étapes (visite, clic, optin, achat)
- ⏰ Horodatage de chaque action

### **Rafraîchissement Automatique**
- Le dashboard se met à jour toutes les 30 secondes
- Bouton de rafraîchissement manuel

## 📊 **EXEMPLE DE DONNÉES CAPTURÉES**

```javascript
{
  sessionId: 'session_123456789',
  email: 'lead@example.com',
  source: 'instagram',
  medium: 'organic',
  campaign: 'systeme_viral_100k',
  steps: [
    {
      action: 'visit',
      timestamp: '2024-01-15T14:23:00Z',
      page: '/offre-speciale'
    },
    {
      action: 'cta_click',
      timestamp: '2024-01-15T14:35:00Z',
      element: 'CTA Principal'
    },
    {
      action: 'optin',
      timestamp: '2024-01-15T14:42:00Z',
      email: 'lead@example.com'
    },
    {
      action: 'purchase',
      timestamp: '2024-01-16T11:32:00Z',
      amount: 497,
      currency: 'EUR'
    }
  ]
}
```

## 🎯 **SUIVRE LES CONVERSIONS**

### **Pour tracker un optin manuellement :**
```javascript
// Dans ton code JavaScript
window.viralTracking.trackOptin('lead@example.com', {
  formData: { name: 'John' }
});
```

### **Pour tracker un achat manuellement :**
```javascript
window.viralTracking.trackPurchase(497, 'EUR', 'lead@example.com');
```

## 🚀 **PROCHAINES ÉTAPES**

1. ✅ Dashboard créé et fonctionnel
2. 🔄 Choisir un système de stockage persistant (Supabase recommandé)
3. 🔄 Mettre à jour les fonctions pour utiliser le stockage
4. 🔄 Tester avec de vrais leads
5. 🔄 Optimiser les stats selon tes besoins

## 💡 **AVANTAGES**

✅ **100% interne** - Pas besoin de Zapier ou services externes  
✅ **Données individuelles** - Voir le parcours complet de chaque lead  
✅ **Interface simple** - Dashboard clair et intuitive  
✅ **Temps réel** - Stats mises à jour automatiquement  
✅ **Pas de dépendances** - Fonctionne avec ton setup actuel  

## ❓ **QUESTIONS ?**

Tu veux que je t'aide à :
- Configurer Supabase pour le stockage persistant ?
- Ajouter d'autres métriques au dashboard ?
- Créer des rapports automatiques par email ?
- Intégrer avec MailerLite pour mieux tracker les optins ?

**Ton dashboard est prêt ! 🎯**

