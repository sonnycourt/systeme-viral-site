# 🎯 Configuration Google Analytics - Step by Step

## **ÉTAPE 1 : Trouver ton Property ID** (2 minutes)

### **Dans Google Analytics :**

1. Va sur [analytics.google.com](https://analytics.google.com)
2. Connecte-toi
3. Clique sur **⚙️ Admin** (en bas à gauche)
4. Dans **Property Settings**, tu verras **Property ID**
5. **Copie ce numéro** (exemple : `123456789`)

---

## **ÉTAPE 2 : Activer Embed API** (30 secondes)

1. Dans Admin → **Property Settings**
2. Scroll vers le bas
3. Trouve **Google Analytics Embed API**
4. Clique **Enable**

✅ Fait !

---

## **ÉTAPE 3 : Connecter au Dashboard** (5 minutes)

### **Une fois que tu as ton Property ID :**

Je vais te donner le code exact à ajouter au dashboard.

**Important :** Remplace `YOUR_PROPERTY_ID` par ton vrai Property ID (ex : `123456789`)

### **Ce qui va être ajouté :**

```html
<!-- Dans le <head> du dashboard -->
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://www.gstatic.com/charts/loader.js"></script>

<!-- Un script qui charge les vraies données GA -->
<script>
  // Configuration avec ton Property ID
  gapi.analytics.ready(() => {
    // Connecte à GA avec ton Property ID
    // Affiche les vraies données
  });
</script>
```

---

## **APRÈS : Ce que tu verras**

✅ Vraies visites de Google Analytics  
✅ Vraies sources de trafic  
✅ Vraies conversions  
✅ Données en temps réel  
✅ Tous les chiffres réels au lieu des démos  

---

## **❓ PROCHAINE ÉTAPE**

**Envoie-moi ton Property ID et je te donne le code exact à copier !** 🚀

Ou dis-moi si tu veux que je t'aide à le trouver dans Google Analytics.

