# 🎯 Dashboard avec Google Analytics

## ✅ CE QUI A ÉTÉ AJOUTÉ

Tu as maintenant un dashboard unifié qui combine :
1. **Parcours individuels des leads** (déjà fait)
2. **Données Google Analytics** (nouveau !)

## 📊 DONNÉES DISPONIBLES DANS TON DASHBOARD

### **Section Google Analytics**

**Stats Principales :**
- 👥 Visiteurs aujourd'hui
- 📈 Taux de conversion global
- ⏱️ Temps moyen de session
- 🔴 Utilisateurs en temps réel

**Sources de Trafic :**
- Liste de toutes tes sources (Instagram, TikTok, Email, Facebook, YouTube)
- Pour chaque source :
  - Nombre de visites
  - Nombre de conversions
  - Taux de conversion
  - Revenus générés

### **Section Parcours des Leads**

- Parcours complet de chaque lead individuellement
- Timeline des actions (visite → clic → optin → achat)

## 🚀 ACCÈS AU DASHBOARD

```
http://localhost:4321/dashboard
```

## 🔧 POUR CONNECTER AU VRAI GOOGLE ANALYTICS

Actuellement, le dashboard affiche des données de démonstration. Pour connecter au vrai Google Analytics :

### **Option 1 : API Google Analytics (Avancé)**

1. Créer un projet dans [Google Cloud Console](https://console.cloud.google.com)
2. Activer l'API Google Analytics
3. Générer des credentials (clé API)
4. Mettre à jour `netlify/functions/fetch-ga.js` avec ta clé

**Exemple de fonction :**
```javascript
const { google } = require('googleapis');

exports.handler = async (event) => {
  const analytics = google.analytics({
    version: 'v4',
    auth: YOUR_API_KEY
  });
  
  const response = await analytics.reports.batchGet({
    requestBody: {
      reportRequests: [{
        viewId: 'YOUR_VIEW_ID',
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ expression: 'ga:sessions' }]
      }]
    }
  });
  
  return { statusCode: 200, body: JSON.stringify(response.data) };
};
```

### **Option 2 : Google Analytics Embed API (Simple)**

Utiliser le [Google Analytics Embed API](https://developers.google.com/analytics/devguides/reporting/embed/v1) pour afficher des graphiques GA directement dans le dashboard.

**Exemple :**
```html
<!-- Dans dashboard.astro -->
<script src="https://apis.google.com/js/api.js"></script>

<div id="chart-container"></div>

<script>
  gapi.analytics.ready(() => {
    const chart = new gapi.analytics.googleCharts.DataChart({
      query: {
        ids: 'ga:YOUR_PROPERTY_ID',
        'start-date': '7daysAgo',
        'end-date': 'today',
        metrics: 'ga:sessions',
        dimensions: 'ga:date'
      },
      chart: {
        type: 'LINE',
        container: 'chart-container'
      }
    });
    
    chart.execute();
  });
</script>
```

### **Option 3 : Solution Hybride (Recommandé)**

Combiner les deux approches :
- Données temps réel via l'Embed API de Google (graphiques pré-faits)
- Données personnalisées via notre propre tracking (parcours leads)

## 📈 CE QUE TU VOIS EN CE MOMENT

Le dashboard affiche des **données de démonstration** :
- 89 visiteurs aujourd'hui
- 8.2% de taux de conversion
- 245 secondes de temps session moyen
- 23 utilisateurs en temps réel
- 5 sources de trafic avec stats détaillées

## 🎯 PROCHAINES ÉTAPES

1. ✅ Dashboard fonctionnel avec données de demo
2. 🔄 Connecter à Google Analytics réel
3. 🔄 Ajouter des graphiques visuels (charts.js)
4. 🔄 Exporter les rapports en PDF
5. 🔄 Alertes automatiques (email si baisse conversion)

## 💡 AVANTAGES

✅ **Tout au même endroit** - Parcours leads + GA dans un seul dashboard  
✅ **Interface moderne** - Design épuré et professionnel  
✅ **Temps réel** - Données mises à jour automatiquement  
✅ **Sources de trafic** - ROI par canal clairement visible  
✅ **Centralisé** - Plus besoin d'aller sur 3-4 outils différents  

**Ton dashboard est maintenant encore plus puissant ! 🚀**

