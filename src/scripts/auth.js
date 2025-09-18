// Système d'authentification global pour Système Viral
// Utilise sessionStorage pour une authentification par session

class AuthManager {
    constructor() {
        this.AUTH_KEY = "systeme_viral_auth";
        this.PASSWORD = "Viral100k!";
        this.authenticated = false;
    }

    // Vérifier si l'utilisateur est authentifié
    isAuthenticated() {
        return sessionStorage.getItem(this.AUTH_KEY) === "true";
    }

    // Authentifier l'utilisateur
    authenticate(password) {
        if (password === this.PASSWORD) {
            sessionStorage.setItem(this.AUTH_KEY, "true");
            this.authenticated = true;
            return true;
        }
        return false;
    }

    // Déconnecter l'utilisateur
    logout() {
        sessionStorage.removeItem(this.AUTH_KEY);
        this.authenticated = false;
    }

    // Initialiser la protection d'une page
    protectPage(options = {}) {
        const {
            redirectUrl = null,
            hideElement = '.thematiques-page',
            modalId = 'password-modal'
        } = options;

        // Si déjà authentifié, rien à faire
        if (this.isAuthenticated()) {
            console.log("Utilisateur déjà authentifié");
            return;
        }

        // Cacher le contenu principal
        const mainContent = document.querySelector(hideElement);
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        // Afficher le modal
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Focus sur l'input
        setTimeout(() => {
            const input = document.getElementById('password-input');
            if (input) input.focus();
        }, 100);

        this.setupEventListeners();
    }

    // Configurer les event listeners
    setupEventListeners() {
        // Bouton de soumission
        const submitBtn = document.getElementById('password-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.validatePassword();
            });
        }

        // Input - validation à l'appui d'Enter
        const input = document.getElementById('password-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.validatePassword();
                }
            });
        }
    }

    // Valider le mot de passe
    validatePassword() {
        const input = document.getElementById('password-input');
        const password = input.value.trim();

        if (!password) {
            this.showError("Veuillez entrer un mot de passe");
            return false;
        }

        if (!this.authenticate(password)) {
            this.showError("Mot de passe incorrect");
            input.value = '';
            input.focus();
            return false;
        }

        // Authentification réussie
        this.hidePasswordModal();
        return true;
    }

    // Afficher une erreur
    showError(message) {
        const error = document.getElementById('password-error');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
            setTimeout(() => {
                error.style.display = 'none';
            }, 3000);
        }
    }

    // Cacher le modal
    hidePasswordModal() {
        const modal = document.getElementById('password-modal');
        const mainContent = document.querySelector('.thematiques-page');

        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }

        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '0';
            setTimeout(() => {
                mainContent.style.opacity = '1';
                mainContent.style.transition = 'opacity 0.5s ease';
            }, 100);
        }

        console.log("Authentification réussie - Accès accordé");
    }
}

// Instance globale
window.authManager = new AuthManager();

// Fonction d'initialisation rapide pour les pages
window.initAuthProtection = function(options) {
    setTimeout(() => {
        window.authManager.protectPage(options);
    }, 100);
};
