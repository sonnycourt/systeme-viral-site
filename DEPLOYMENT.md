# 🚀 Guide de Déploiement - systemeviral.com

## 🌐 Configuration du Nom de Domaine

### 1. Configuration DNS sur Namecheap

Connecte-toi à ton compte Namecheap et configure les DNS :

```
Type: A Record
Host: @
Value: [IP de ton serveur ou 192.0.2.1 pour Netlify]
TTL: Automatic

Type: CNAME
Host: www
Value: systemeviral.com
TTL: Automatic
```

### 2. Options de Déploiement

#### Option A: Netlify (Recommandé)
1. **Connecte ton repo GitHub** sur [netlify.com](https://netlify.com)
2. **Configure le build** :
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Configure le domaine** :
   - Ajoute `systemeviral.com` comme domaine personnalisé
   - Netlify gère automatiquement les certificats SSL

#### Option B: Vercel
1. **Connecte ton repo GitHub** sur [vercel.com](https://vercel.com)
2. **Configure le build** :
   - Framework preset: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Configure le domaine** :
   - Ajoute `systemeviral.com` comme domaine personnalisé

#### Option C: Serveur Personnel
1. **Build le projet** : `npm run build`
2. **Uploade le contenu** du dossier `dist/` sur ton serveur
3. **Configure le serveur web** (Apache/Nginx)
4. **Configure SSL** avec Let's Encrypt

### 3. Configuration SSL/HTTPS

#### Avec Netlify/Vercel
- SSL automatique et gratuit
- Redirection automatique HTTP → HTTPS

#### Avec Serveur Personnel
```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Génération du certificat
sudo certbot --nginx -d systemeviral.com -d www.systemeviral.com
```

### 4. Configuration du Serveur Web

#### Nginx (exemple)
```nginx
server {
    listen 80;
    server_name systemeviral.com www.systemeviral.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name systemeviral.com www.systemeviral.com;
    
    ssl_certificate /etc/letsencrypt/live/systemeviral.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/systemeviral.com/privkey.pem;
    
    root /var/www/systemeviral.com;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📋 Checklist de Déploiement

- [ ] Build du projet réussi (`npm run build`)
- [ ] Configuration DNS sur Namecheap
- [ ] Déploiement sur la plateforme choisie
- [ ] Configuration du domaine personnalisé
- [ ] Test du site en production
- [ ] Vérification SSL/HTTPS
- [ ] Test sur mobile et desktop
- [ ] Vérification des performances

## 🔧 Commandes Utiles

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Script de déploiement
./scripts/deploy.sh
```

## 📱 Test Post-Déploiement

1. **Vérification des pages** :
   - Accueil : https://systemeviral.com
   - Formation : https://systemeviral.com/formation
   - Programme : https://systemeviral.com/programme
   - Témoignages : https://systemeviral.com/temoignages
   - Contact : https://systemeviral.com/contact

2. **Tests de performance** :
   - [PageSpeed Insights](https://pagespeed.web.dev/)
   - [GTmetrix](https://gtmetrix.com/)
   - [WebPageTest](https://www.webpagetest.org/)

3. **Tests de compatibilité** :
   - Chrome, Firefox, Safari, Edge
   - Mobile (iOS/Android)
   - Tablettes

## 🚨 Dépannage

### Problème : Site ne se charge pas
- Vérifie la configuration DNS
- Vérifie que le serveur est accessible
- Vérifie les logs du serveur

### Problème : Erreur SSL
- Vérifie la validité du certificat
- Vérifie la configuration du serveur web
- Regénère le certificat si nécessaire

### Problème : Pages 404
- Vérifie la configuration des redirections
- Vérifie que tous les fichiers sont uploadés
- Vérifie la configuration du serveur web

## 📞 Support

En cas de problème :
1. Vérifie les logs du serveur
2. Consulte la documentation de ta plateforme
3. Contacte le support de ta plateforme
4. Vérifie la configuration DNS sur Namecheap
