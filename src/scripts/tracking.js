// SYSTÈME VIRAL - Tracking Avancé
// Capture des UTM parameters et attribution multi-touch

class ViralTracking {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userJourney = [];
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        // Capture des UTM parameters
        this.captureUTMParameters();
        
        // Tracking des interactions
        this.trackInteractions();
        
        // Stockage persistant
        this.saveToLocalStorage();
        
        // Envoi vers Google Analytics - attendre que gtag soit prêt
        this.waitForGtagAndSend();
    }

    waitForGtagAndSend() {
        const checkGtag = () => {
            if (typeof gtag !== 'undefined' && window.dataLayer && window.dataLayer.push) {
                // gtag est prêt, on peut envoyer l'événement
                this.sendToGA4();
            } else {
                // gtag n'est pas encore prêt, on réessaie après un court délai
                setTimeout(checkGtag, 100);
            }
        };
        checkGtag();
    }

    captureUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmData = {
            source: urlParams.get('utm_source') || 'direct',
            medium: urlParams.get('utm_medium') || 'none',
            campaign: urlParams.get('utm_campaign') || 'none',
            term: urlParams.get('utm_term') || '',
            content: urlParams.get('utm_content') || '',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            sessionId: this.sessionId
        };

        // Ajout au parcours utilisateur
        this.userJourney.push({
            step: 'landing',
            action: 'visit',
            data: utmData
        });

        console.log('🎯 UTM Captured:', utmData);
    }

    trackInteractions() {
        // Tracking des clics sur les CTA
        document.addEventListener('click', (e) => {
            // Tracking des clics sur les avatars
            if (e.target.closest('[data-avatar]')) {
                const avatarElement = e.target.closest('[data-avatar]');
                this.trackEvent('avatar_click', {
                    avatar: avatarElement.getAttribute('data-avatar')
                });
            }
            
            if (e.target.matches('a[href*="mailerlite"], button[data-cta], .cta-button')) {
                this.trackEvent('cta_click', {
                    element: e.target.textContent || e.target.getAttribute('data-cta'),
                    href: e.target.href || 'button'
                });
            }
        });

        // Tracking du scroll
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.trackEvent('scroll_depth', { percent: scrollPercent });
            }
        });

        // Tracking du temps sur page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('time_on_page', { seconds: timeOnPage });
        });
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname,
            utm_source: this.getUTMSource(),
            utm_medium: this.getUTMMedium(),
            utm_campaign: this.getUTMCampaign()
        };

        this.userJourney.push(event);
        console.log('📊 Event Tracked:', event);

        // Envoi immédiat vers GA4
        this.sendEventToGA4(eventName, eventData);
        
        // Envoi vers notre dashboard interne
        this.sendToInternalDashboard(event);
    }
    
    sendToInternalDashboard(event) {
        // En dev local, on stocke dans localStorage
        const storedEvents = JSON.parse(localStorage.getItem('dashboard_events') || '[]');
        storedEvents.push(event);
        localStorage.setItem('dashboard_events', JSON.stringify(storedEvents));
        
        // Envoi au dashboard (que ce soit local ou production)
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('localhost');
        const dashboardUrl = isLocal 
            ? 'http://localhost:4321' 
            : 'https://dashboard.systemeviral.com';
        
        fetch(`${dashboardUrl}/.netlify/functions/track-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        }).catch(err => {
            console.log('Dashboard tracking error (non-bloquant):', err);
        });
    }

    sendToGA4() {
        // Utilise le système GA existant avec consentement
        if (typeof gtag !== 'undefined') {
            // Envoie les UTM parameters comme événements personnalisés
            gtag('event', 'utm_capture', {
                utm_source: this.getUTMSource(),
                utm_medium: this.getUTMMedium(),
                utm_campaign: this.getUTMCampaign(),
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    sendEventToGA4(eventName, eventData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'engagement',
                event_label: eventData.element || eventData.percent || 'unknown',
                value: eventData.seconds || 0,
                utm_source: this.getUTMSource(),
                utm_medium: this.getUTMMedium(),
                utm_campaign: this.getUTMCampaign(),
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    getUTMSource() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('utm_source') || 'direct';
    }

    getUTMMedium() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('utm_medium') || 'none';
    }

    getUTMCampaign() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('utm_campaign') || 'none';
    }

    saveToLocalStorage() {
        const trackingData = {
            sessionId: this.sessionId,
            userJourney: this.userJourney,
            utmSource: this.getUTMSource(),
            utmMedium: this.getUTMMedium(),
            utmCampaign: this.getUTMCampaign(),
            firstVisit: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };

        localStorage.setItem('viral_tracking', JSON.stringify(trackingData));
    }

    // Méthode pour récupérer les données (pour l'optin)
    getTrackingData() {
        return {
            utm_source: this.getUTMSource(),
            utm_medium: this.getUTMMedium(),
            utm_campaign: this.getUTMCampaign(),
            session_id: this.sessionId,
            landing_page: window.location.pathname
        };
    }
    
    // Méthode pour tracker un optin
    trackOptin(email, formData = {}) {
        this.trackEvent('optin', {
            email: email,
            formData: formData
        });
    }
    
    // Méthode pour tracker un achat
    trackPurchase(amount, currency = 'EUR', email = null) {
        this.trackEvent('purchase', {
            amount: amount,
            currency: currency,
            email: email
        });
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.viralTracking = new ViralTracking();
    
    // Exposer les données pour l'optin
    window.getViralTrackingData = () => {
        return window.viralTracking.getTrackingData();
    };
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViralTracking;
}
