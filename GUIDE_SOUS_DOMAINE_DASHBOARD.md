# 🌐 Sous-domaine Dashboard - Système Viral

## 🎯 Configurer un sous-domaine pour le dashboard

Tu veux accéder au dashboard via **dashboard.systemeviral.com** au lieu de **systemeviral.com/dashboard** ?

## ✅ Configuration sur Netlify

### **Option 1 : Sous-domaine dédié (Recommandé)**

**Avantages :**
- ✅ URL plus propre : `dashboard.systemeviral.com`
- ✅ Séparation totale avec le site principal
- ✅ Possible de protéger par mot de passe facilement
- ✅ Plus professionnel

**Configuration :**

1. **Dans Netlify Dashboard :**
   - Va dans ton site `systemeviral.com`
   - **Site settings** → **Domain management** → **Add custom domain**
   - Ajoute : `dashboard.systemeviral.com`

2. **Dans les DNS de ton domaine (chez ton registrar) :**
   ```
   Type: CNAME
   Name: dashboard
   Value: your-site.netlify.app
   TTL: 3600
   ```

3. **Mettre à jour `netlify.toml` :**
   ```toml
   [[redirects]]
     from = "https://dashboard.systemeviral.com/*"
     to = "/dashboard/:splat"
     status = 200
     force = true
   ```

### **Option 2 : Page à la racine (Plus simple)**

**Avantages :**
- ✅ Déjà configuré
- ✅ Aucune configuration DNS supplémentaire
- ✅ Accès direct : `systemeviral.com/dashboard`

**Inconvénients :**
- ❌ URL moins "premium"
- ❌ Visible dans la navigation du site

### **Option 3 : Protection par mot de passe (Sécurité)**

Quelle que soit l'option choisie, tu peux protéger le dashboard :

1. **Dans Netlify Dashboard :**
   - **Site settings** → **Build & deploy** → **Security**
   - **Password protection** → **Enable**
   - Définir un mot de passe

2. **Ou avec htaccess (plus avancé) :**
   Créer un fichier `public/_headers` :
   ```
   /dashboard/*
     Basic-Auth: username:passwordhash
   ```

## 🔒 Sécurité recommandée

Si tu choisis le sous-domaine, voici les options de sécurité :

### **1. Protection par mot de passe Netlify (Simple)**
- Configuré en 2 clics
- Gestion des accès
- Support multi-utilisateurs

### **2. Netlify Identity (Recommandé)**
Pour un vrai système d'authentification :

1. Activer Netlify Identity dans les settings
2. Ajouter à `src/pages/dashboard.astro` :
   ```html
   <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
   <script>
   netlifyIdentity.init();
   
   netlifyIdentity.on('login', () => {
       window.location.reload();
   });
   </script>
   ```

3. Ajouter le bouton de connexion :
   ```html
   <div id="netlify-identity-widget"></div>
   ```

## 🎯 Recommandation

**Pour toi, je recommande :**

1. **Court terme :** Garder `systemeviral.com/dashboard` 
   - Simple
   - Fonctionne immédiatement
   - Protection par mot de passe possible

2. **Long terme :** Migrer vers `dashboard.systemeviral.com`
   - Plus professionnel
   - Accès restreint facile
   - Impressionnant pour les clients/potentiels

## 📝 Checklist Configuration

Si tu veux le sous-domaine maintenant :

- [ ] Ajouter le domaine dans Netlify
- [ ] Configurer le CNAME dans les DNS
- [ ] Attendre la propagation DNS (5-15 minutes)
- [ ] Activer SSL automatique sur Netlify
- [ ] Ajouter protection par mot de passe
- [ ] Tester l'accès

## ❓ **QUE VEUX-TU FAIRE ?**

1. **Garder** `/dashboard` sur le site principal (pratique)
2. **Configurer** le sous-domaine maintenant (premium)
3. **Ajouter** une protection par mot de passe (sécurisé)

Dis-moi ce que tu préfères et je t'aide à configurer ! 🚀

