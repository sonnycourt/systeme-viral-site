#!/bin/bash

echo "🚀 Déploiement de Système Viral..."

# Build du projet
echo "📦 Build du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    
    # Vérification du dossier dist
    if [ -d "dist" ]; then
        echo "📁 Dossier dist créé avec succès"
        echo "📊 Taille du build: $(du -sh dist | cut -f1)"
        
        echo ""
        echo "🌐 Options de déploiement:"
        echo "1. Netlify: Connecte ton repo GitHub et configure le build"
        echo "2. Vercel: Connecte ton repo GitHub et configure le build"
        echo "3. Serveur personnel: Uploade le contenu de dist/ sur ton serveur"
        echo ""
        echo "📋 Commandes utiles:"
        echo "- npm run preview  # Prévisualiser le build localement"
        echo "- npm run dev      # Relancer le serveur de développement"
        
    else
        echo "❌ Erreur: Le dossier dist n'a pas été créé"
        exit 1
    fi
else
    echo "❌ Erreur lors du build"
    exit 1
fi
