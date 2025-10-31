// Script de tracking UTM pour MailerLite
// Capture les paramètres UTM depuis l'URL et détecte automatiquement la source si pas de UTM

(function() {
    'use strict';

    // Détecter la source depuis le referrer si pas de UTM
    function detectSourceFromReferrer() {
        const referrer = document.referrer.toLowerCase();
        
        if (!referrer) return 'direct';
        
        // Détection par domaine
        if (referrer.includes('tiktok.com')) return 'tiktok';
        if (referrer.includes('instagram.com')) return 'instagram';
        if (referrer.includes('youtube.com') || referrer.includes('youtu.be')) return 'youtube';
        if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return 'facebook';
        if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'twitter';
        if (referrer.includes('linkedin.com')) return 'linkedin';
        if (referrer.includes('snapchat.com')) return 'snapchat';
        if (referrer.includes('pinterest.com')) return 'pinterest';
        
        // Si c'est un moteur de recherche
        if (referrer.includes('google.com') || referrer.includes('bing.com') || 
            referrer.includes('yahoo.com') || referrer.includes('duckduckgo.com')) {
            return 'organic';
        }
        
        return 'other';
    }

    // Extraire les paramètres UTM depuis l'URL
    function extractUTMParams() {
        const params = new URLSearchParams(window.location.search);
        const utmParams = {
            utm_source: params.get('utm_source') || null,
            utm_content: params.get('utm_content') || null,
        };

        // Si pas de utm_source mais qu'on a un referrer, détecter automatiquement
        if (!utmParams.utm_source) {
            utmParams.utm_source = detectSourceFromReferrer();
        }

        // Normaliser le utm_source pour les réseaux sociaux communs
        if (utmParams.utm_source) {
            const source = utmParams.utm_source.toLowerCase();
            if (source.includes('tiktok')) utmParams.utm_source = 'tiktok';
            else if (source.includes('instagram') || source.includes('ig')) utmParams.utm_source = 'instagram';
            else if (source.includes('youtube') || source.includes('yt')) utmParams.utm_source = 'youtube';
            else if (source.includes('facebook') || source.includes('fb')) utmParams.utm_source = 'facebook';
            else if (source.includes('twitter') || source.includes('x.com')) utmParams.utm_source = 'twitter';
            else if (source.includes('linkedin')) utmParams.utm_source = 'linkedin';
            else if (source.includes('snapchat')) utmParams.utm_source = 'snapchat';
            else if (source.includes('pinterest')) utmParams.utm_source = 'pinterest';
        }

        return utmParams;
    }

    // Stocker les paramètres UTM dans localStorage
    function storeUTMParams(utmParams) {
        // Vérifier si on a déjà des UTM stockés (pour garder le premier visiteur)
        const existing = localStorage.getItem('utm_params');
        let existingData = null;
        
        if (existing) {
            try {
                existingData = JSON.parse(existing);
            } catch (e) {
                console.warn('[UTM Tracker] Error parsing existing UTM data:', e);
            }
        }
        
        const utmData = {
            utm_source: utmParams.utm_source || (existingData && existingData.utm_source) || null,
            utm_content: utmParams.utm_content || (existingData && existingData.utm_content) || null,
            first_visit: existingData ? (existingData.first_visit || new Date().toISOString()) : new Date().toISOString(),
            last_update: new Date().toISOString()
        };
        
        localStorage.setItem('utm_params', JSON.stringify(utmData));
        console.log('[UTM Tracker] UTM parameters stored:', utmData);
        return utmData;
    }

    // Récupérer les paramètres UTM stockés
    function getUTMParams() {
        const stored = localStorage.getItem('utm_params');
        if (!stored) {
            console.log('[UTM Tracker] No UTM params found in localStorage');
            return {};
        }
        
        try {
            const data = JSON.parse(stored);
            // Retourner seulement utm_source et utm_content pour compatibilité
            const result = {
                utm_source: data.utm_source || null,
                utm_content: data.utm_content || null
            };
            console.log('[UTM Tracker] Retrieved UTM params:', result);
            return result;
        } catch (e) {
            console.warn('[UTM Tracker] Error parsing stored UTM data:', e);
            return {};
        }
    }

    // Initialisation : capturer les UTM au chargement de la page
    function initUTMTracking() {
        console.log('[UTM Tracker] Initializing UTM tracking...');
        console.log('[UTM Tracker] Current URL:', window.location.href);
        console.log('[UTM Tracker] URL Search:', window.location.search);
        
        // Extraire les UTM de l'URL actuelle
        const utmParams = extractUTMParams();
        console.log('[UTM Tracker] Extracted UTM params:', utmParams);
        
        // Si on a des UTM dans l'URL, toujours les stocker (même si on a déjà des données)
        // Cela permet de mettre à jour les paramètres si l'utilisateur arrive avec de nouveaux UTM
        if (utmParams.utm_source || utmParams.utm_content) {
            console.log('[UTM Tracker] Storing UTM params from URL:', utmParams);
            storeUTMParams(utmParams);
        } else {
            // Vérifier si on a déjà des UTM stockés (ne pas écraser)
            const existing = localStorage.getItem('utm_params');
            if (!existing) {
                // Si pas de UTM et pas de données existantes, détecter depuis le referrer
                const detectedSource = detectSourceFromReferrer();
                console.log('[UTM Tracker] No UTM in URL, detected source from referrer:', detectedSource);
                if (detectedSource !== 'direct' && detectedSource !== 'other') {
                    storeUTMParams({
                        utm_source: detectedSource
                    });
                }
            } else {
                console.log('[UTM Tracker] Using existing UTM params from localStorage');
            }
        }
    }

    // Exposer les fonctions publiques
    window.UTMTracker = {
        get: getUTMParams,
        store: storeUTMParams,
        extract: extractUTMParams,
        init: initUTMTracking
    };

    // Initialiser au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUTMTracking);
    } else {
        initUTMTracking();
    }
})();

