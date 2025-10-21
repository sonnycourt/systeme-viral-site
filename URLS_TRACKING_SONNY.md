# 🎯 SYSTÈME VIRAL - URLs de Tracking

## 📱 **URLs Prêtes à Utiliser**

### **Instagram (Posts/Stories)**
```
https://systemeviral.com/offre-speciale?utm_source=instagram&utm_medium=organic&utm_campaign=systeme_viral_100k
```

### **Facebook (Posts/Ads)**
```
https://systemeviral.com/offre-speciale?utm_source=facebook&utm_medium=organic&utm_campaign=systeme_viral_100k
```

### **TikTok (Vidéos)**
```
https://systemeviral.com/offre-speciale?utm_source=tiktok&utm_medium=organic&utm_campaign=systeme_viral_100k
```

### **YouTube (Vidéos/Description)**
```
https://systemeviral.com/offre-speciale?utm_source=youtube&utm_medium=organic&utm_campaign=systeme_viral_100k
```

### **Email (Newsletter)**
```
https://systemeviral.com/offre-speciale?utm_source=email&utm_medium=newsletter&utm_campaign=systeme_viral_100k
```

### **Google Ads (Si tu en fais)**
```
https://systemeviral.com/offre-speciale?utm_source=google&utm_medium=cpc&utm_campaign=systeme_viral_100k
```

## 🎯 **URLs Spéciales par Contenu**

### **Instagram - Post Principal**
```
https://systemeviral.com/offre-speciale?utm_source=instagram&utm_medium=organic&utm_campaign=formation_100k&utm_content=post_principal
```

### **Instagram - Story**
```
https://systemeviral.com/offre-speciale?utm_source=instagram&utm_medium=organic&utm_campaign=formation_100k&utm_content=story
```

### **Facebook - Post Viral**
```
https://systemeviral.com/offre-speciale?utm_source=facebook&utm_medium=organic&utm_campaign=formation_100k&utm_content=post_viral
```

### **TikTok - Vidéo Trending**
```
https://systemeviral.com/offre-speciale?utm_source=tiktok&utm_medium=organic&utm_campaign=formation_100k&utm_content=video_trending
```

### **YouTube - Description Vidéo**
```
https://systemeviral.com/offre-speciale?utm_source=youtube&utm_medium=organic&utm_campaign=formation_100k&utm_content=description_video
```

## 📧 **Configuration MailerLite**

### **Champs Cachés à Ajouter :**
```
utm_source: {valeur depuis URL}
utm_medium: {valeur depuis URL}
utm_campaign: {valeur depuis URL}
session_id: {valeur depuis tracking}
landing_page: {valeur depuis tracking}
```

### **Code à Ajouter dans ton Optin :**
```html
<input type="hidden" name="utm_source" id="utm_source" value="">
<input type="hidden" name="utm_medium" id="utm_medium" value="">
<input type="hidden" name="utm_campaign" id="utm_campaign" value="">
<input type="hidden" name="session_id" id="session_id" value="">
```

### **JavaScript pour Remplir Automatiquement :**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (window.getViralTrackingData) {
        const data = window.getViralTrackingData();
        document.getElementById('utm_source').value = data.utm_source;
        document.getElementById('utm_medium').value = data.utm_medium;
        document.getElementById('utm_campaign').value = data.utm_campaign;
        document.getElementById('session_id').value = data.session_id;
    }
});
```

## 📊 **Comment Lire tes Rapports**

### **Google Analytics 4 :**
1. Va dans **Acquisition** → **Traffic acquisition**
2. Regarde la colonne **Source/medium**
3. Tu verras : `instagram / organic`, `facebook / organic`, etc.

### **MailerLite :**
1. Va dans **Subscribers** → **Segments**
2. Crée des segments par `utm_source`
3. Tu verras combien d'abonnés viennent de chaque source

### **Dashboard Simple :**
```
📊 PERFORMANCE PAR SOURCE
┌─────────────┬──────────┬─────────────┬─────────┐
│ Source      │ Visiteurs│ Conversions │ Revenus │
├─────────────┼──────────┼─────────────┼─────────┤
│ Instagram   │ 45       │ 12 (27%)    │ 2,400€  │
│ Email       │ 89       │ 23 (26%)    │ 4,600€  │
│ Facebook    │ 23       │ 6 (26%)     │ 1,200€  │
│ TikTok      │ 67       │ 15 (22%)    │ 3,000€  │
│ YouTube     │ 34       │ 8 (24%)     │ 1,600€  │
└─────────────┴──────────┴─────────────┴─────────┘
```

## 🚀 **Instructions d'Utilisation**

1. **Copie** l'URL correspondant à ton canal
2. **Utilise-la** dans tes posts/vidéos/emails
3. **Regarde** tes rapports dans Google Analytics
4. **Optimise** selon les résultats

## ⚡ **Avantages**

- ✅ **Tracking automatique** de toutes les sources
- ✅ **Attribution multi-touch** (premier contact + dernier contact)
- ✅ **ROI précis** par canal
- ✅ **Décisions data-driven** pour tes campagnes
- ✅ **Setup en 5 minutes** - utilisation automatique

**Ton système de tracking est maintenant opérationnel ! 🎯**
