# 🌐 Configuration Sous-domaine - dashboard.systemeviral.com

## 🎯 **ÉTAPE PAR ÉTAPE**

### **ÉTAPE 1 : Dans Netlify (2 minutes)**

1. Va sur [app.netlify.com](https://app.netlify.com)
2. Sélectionne ton site **systemeviral**
3. Va dans **Site settings** → **Domain management**
4. Clique sur **Add custom domain**
5. Entre : `dashboard.systemeviral.com`
6. Netlify va te donner un message de vérification

✅ **Fait ! Netlify est configuré**

---

### **ÉTAPE 2 : Dans les DNS de ton domaine (5 minutes)**

Tu dois ajouter un enregistrement CNAME dans les DNS.

**Où sont les DNS de ton domaine ?**
- Chez ton registrar (GoDaddy, Namecheap, OVH, etc.)
- Ou chez ton hébergeur

**Configuration à faire :**

1. Connecte-toi à ton panel DNS
2. Trouve la section **DNS Records** ou **Gestion DNS**
3. Ajoute un nouvel enregistrement :

```
Type : CNAME
Name : dashboard
Value : ton-site.netlify.app (ou l'URL de ton site Netlify)
TTL : 3600
```

**Exemple :**
```
Type : CNAME
Name : dashboard
Value : systemeviral.netlify.app
TTL : 3600 (ou Auto)
```

4. Sauvegarde les modifications

✅ **DNS configurés**

---

### **ÉTAPE 3 : Attendre la propagation DNS (5-15 minutes)**

Les DNS se propagent automatiquement. Netlify détectera le domaine.

**Comment savoir que c'est prêt :**
- Netlify enverra un email de confirmation
- Le domaine sera "Enabled" dans Netlify Dashboard

---

### **ÉTAPE 4 : Vérifier que ça marche (1 minute)**

Une fois propagé, va sur :
```
https://dashboard.systemeviral.com
```

Tu devrais voir ton dashboard ! 🎉

---

## 🔒 **OPTIONNEL : Protection par mot de passe**

Si tu veux protéger le dashboard :

**Dans Netlify :**
1. **Site settings** → **Build & deploy** → **Security**
2. Active **Password protection**
3. Définis un mot de passe
4. Sauvegarde

Maintenant `dashboard.systemeviral.com` sera protégé par un mot de passe !

---

## 📋 **CHECKLIST**

- [ ] Domaine ajouté dans Netlify
- [ ] CNAME ajouté dans les DNS
- [ ] Attente de la propagation (5-15 min)
- [ ] Test de l'accès à dashboard.systemeviral.com
- [ ] (Optionnel) Protection par mot de passe activée

---

## ❓ **BESOIN D'AIDE ?**

**Dis-moi à quelle étape tu es et je t'aide !**

- As-tu déjà accès à tes DNS ?
- As-tu configuré le domaine dans Netlify ?
- Veux-tu que je t'aide à trouver où sont tes DNS ?

