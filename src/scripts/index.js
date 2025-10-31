// Script pour la page d'accueil - Système Viral
// Extraction du JavaScript inline pour améliorer les performances

// Variables globales
let audioContext;
let openSoundStyle = "pop";
let selectedAvatar = null;
let selectedCountryCode = "33";

// Fonction helper pour récupérer les paramètres UTM
function getUTMParams() {
    if (window.UTMTracker && typeof window.UTMTracker.get === 'function') {
        return window.UTMTracker.get() || {};
    }
    return {};
}

// Configuration du son d'ouverture
function setOpenSoundStyle(style) {
    openSoundStyle = style;
}

// Gestion de l'audio context
function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext || audioContext.state === "closed")
        audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
}

// Fonction de lecture du son d'ouverture
function playOpenSound(style = openSoundStyle) {
    try {
        const ctx = ensureAudio();
        const now = ctx.currentTime;
        if (style === "pop") {
            const duration = 0.25;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(660, now + duration);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
            return;
        }
        if (style === "blip") {
            const duration = 0.18;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1500, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + duration);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
            return;
        }
        if (style === "shimmer") {
            const duration = 0.3;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(880, now);
            osc2.frequency.setValueAtTime(1760, now);
            osc2.detune.setValueAtTime(10, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(now);
            osc2.start(now + 0.02);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
            return;
        }
        if (style === "whoosh") {
            const duration = 0.25;
            const sampleRate = ctx.sampleRate;
            const frameCount = Math.floor(sampleRate * duration);
            const buffer = ctx.createBuffer(1, frameCount, sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++)
                data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.Q.value = 1;
            const gain = ctx.createGain();
            filter.frequency.setValueAtTime(500, now);
            filter.frequency.exponentialRampToValueAtTime(4000, now + duration);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.14, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            src.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            src.start(now);
            src.stop(now + duration);
            return;
        }
        playOpenSound("pop");
    } catch (e) {}
}

// Fonctions du modal
function openModal() {
    playOpenSound();
    document.getElementById("modalOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("active");
    document.body.style.overflow = "auto";
    // Reset form
    const form = document.getElementById("accessForm");
    if (form) form.reset();
    selectedAvatar = null;
    selectedCountryCode = "33";

    // Reset form steps
    const steps = ["step1", "step2", "step3", "successStep"];
    const progressSteps = ["progress1", "progress2", "progress3"];

    steps.forEach(step => {
        const element = document.getElementById(step);
        if (element) {
            element.classList.add("hidden");
        }
    });

    const step1 = document.getElementById("step1");
    const successStep = document.getElementById("successStep");
    if (step1) step1.classList.remove("hidden");
    if (successStep) successStep.classList.add("hidden");

    progressSteps.forEach(step => {
        const element = document.getElementById(step);
        if (element) {
            element.classList.remove("active");
        }
    });

    const progress1 = document.getElementById("progress1");
    if (progress1) progress1.classList.add("active");

    // Reset avatar selection
    document.querySelectorAll(".avatar-option").forEach((option) => {
        option.classList.remove("selected");
    });

    const avatarNextBtn = document.getElementById("avatarNextBtn");
    if (avatarNextBtn) avatarNextBtn.disabled = true;
}

// Fermeture du modal sur clic extérieur
document.addEventListener("DOMContentLoaded", function() {
    const modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
});

// Sélection d'avatar
function selectAvatar(avatar) {
    selectedAvatar = avatar;

    // Remove selected class from all avatars
    document.querySelectorAll(".avatar-option").forEach((option) => {
        option.classList.remove("selected");
    });

    // Add selected class to clicked avatar
    const avatarElement = document.getElementById(`avatar-${avatar}`);
    if (avatarElement) {
        avatarElement.classList.add("selected");
    }

    // Enable next button
    const avatarNextBtn = document.getElementById("avatarNextBtn");
    if (avatarNextBtn) avatarNextBtn.disabled = false;
}

// Navigation entre les étapes
function nextStep() {
    const currentStep = document.querySelector(".form-step.active");
    if (!currentStep) return;

    const currentStepId = currentStep.id;

    if (currentStepId === "step1") {
        handleStep1();
    } else if (currentStepId === "step2") {
        handleStep2();
    }
}

// Gestion de l'étape 1
async function handleStep1() {
    const firstName = document.getElementById("firstName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();

    if (!firstName || !email) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Veuillez entrer un email valide");
        return;
    }

    // Sauvegarder le prénom dans localStorage
    localStorage.setItem('userFirstName', firstName);

    try {
        // Récupérer les paramètres UTM
        const utmParams = getUTMParams();
        
        // Send to MailerLite - Step 1
        const response = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: firstName,
                email: email,
                step: "1",
                utm_source: utmParams.utm_source || null,
                utm_content: utmParams.utm_content || null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("MailerLite Step 1 Error:", data);
            // Continue anyway to not block the user
        }

        console.log("Step 1 completed:", data);

        // Move to step 2
        moveToStep("step1", "step2", "progress2");
    } catch (error) {
        console.error("Error in step 1:", error);
        // Continue to step 2 even if API fails
        moveToStep("step1", "step2", "progress2");
    }
}

// Gestion de l'étape 2
async function handleStep2() {
    if (!selectedAvatar) {
        alert("Veuillez sélectionner un profil");
        return;
    }

    try {
        const userData = getUserData();
        // Récupérer les paramètres UTM
        const utmParams = getUTMParams();
        
        // Send to MailerLite - Step 2
        const response = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userData.email,
                avatar: selectedAvatar,
                step: "2",
                utm_source: utmParams.utm_source || null,
                utm_content: utmParams.utm_content || null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("MailerLite Step 2 Error:", data);
            // Continue anyway to not block the user
        }

        console.log("Step 2 completed:", data);

        // Move to step 3
        moveToStep("step2", "step3", "progress3");

        // Initialize phone input when step 3 is shown
        setTimeout(function () {
            initPhoneInput();
        }, 100);
    } catch (error) {
        console.error("Error in step 2:", error);
        // Continue to step 3 even if API fails
        moveToStep("step2", "step3", "progress3");

        setTimeout(function () {
            initPhoneInput();
        }, 100);
    }
}

// Fonction utilitaire pour changer d'étape
function moveToStep(fromStep, toStep, progressStep) {
    const fromElement = document.getElementById(fromStep);
    const toElement = document.getElementById(toStep);
    const progressElement = document.getElementById(progressStep);

    if (fromElement) {
        fromElement.classList.add("hidden");
        fromElement.classList.remove("active");
    }

    if (toElement) {
        toElement.classList.remove("hidden");
        toElement.classList.add("active");
    }

    if (progressElement) {
        progressElement.classList.add("active");
    }
}

// Récupération des données utilisateur
function getUserData() {
    return {
        firstName: document.getElementById("firstName")?.value || "",
        email: document.getElementById("email")?.value || "",
        avatar: selectedAvatar || "",
    };
}

// Initialisation du téléphone input
function initPhoneInput() {
    const phoneInput = document.getElementById("phone");
    if (phoneInput && typeof window.intlTelInput !== "undefined") {
        window.iti = window.intlTelInput(phoneInput, {
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("https://ipapi.co/json/")
                    .then((res) => res.json())
                    .then((data) => callback(data.country_code))
                    .catch(() => callback("fr"));
            },
            preferredCountries: ["fr", "ch", "be", "ca"],
            separateDialCode: true,
            utilsScript:
                "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        });
    }
}

// Soumission du formulaire
async function handleSubmit(event) {
    event.preventDefault();

    const btnText = document.getElementById("btnText");
    const loader = document.getElementById("loader");
    const submitBtn = document.getElementById("submitBtn");

    // Validate phone number
    const phoneInput = document.getElementById("phone");
    if (!phoneInput || !phoneInput.value.trim()) {
        alert("Veuillez entrer votre numéro de téléphone");
        return;
    }

    if (window.iti && !window.iti.isValidNumber()) {
        alert("Veuillez entrer un numéro de téléphone valide");
        return;
    }

    // Show loading
    if (btnText) btnText.style.display = "none";
    if (loader) loader.classList.remove("hidden");
    if (submitBtn) submitBtn.disabled = true;

    // Get formatted phone number
    let phoneNumber = "";
    if (window.iti) {
        phoneNumber = window.iti.getNumber(); // Get full international number like +41789482376
    } else {
        phoneNumber = phoneInput.value.trim();
    }

    console.log("Submitting with phone:", phoneNumber);

    try {
        // Récupérer les paramètres UTM
        const utmParams = getUTMParams();
        
        // Send to MailerLite - Step 3 (Final)
        const response = await fetch("/.netlify/functions/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: getUserData().email,
                phone: phoneNumber,
                step: "3",
                utm_source: utmParams.utm_source || null,
                utm_content: utmParams.utm_content || null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("MailerLite Step 3 Error:", data);
            // Continue with success flow even if API fails
        }

        console.log("Step 3 completed:", data);

        // Show success
        showSuccess();
    } catch (error) {
        console.error("Error in step 3:", error);
        // Show success anyway and redirect
        showSuccess();
    }
}

// Affichage du succès
function showSuccess() {
    const step3 = document.getElementById("step3");
    const successStep = document.getElementById("successStep");

    if (step3) step3.classList.add("hidden");
    if (successStep) successStep.classList.remove("hidden");

    // Redirect to 100k-masterclass after success message
    setTimeout(() => {
        window.location.href = "/100k-masterclass";
    }, 2500);
}

// Animation des nombres
function animateValue(element, start, end, duration) {
    const startTimestamp = Date.now();
    const step = () => {
        const timestamp = Date.now();
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);

        if (element.textContent.includes("€")) {
            element.textContent = value.toLocaleString("fr-FR") + "k€";
        } else {
            element.textContent = value;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Parallax on scroll
window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector(".gradient-bg");
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Intersection observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll(".stat-number");
            statNumbers.forEach((stat) => {
                if (stat.textContent === "+100k€") {
                    animateValue(stat, 0, 100, 2000);
                }
            });
            observer.unobserve(entry.target);
        }
    });
});

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function() {
    // Observer les éléments de statistiques
    document.querySelectorAll(".stats").forEach((section) => {
        observer.observe(section);
    });

    // Expose functions globally for inline onclick handlers
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.nextStep = nextStep;
    window.selectAvatar = selectAvatar;
    window.handleSubmit = handleSubmit;
    window.setOpenSoundStyle = setOpenSoundStyle;
});

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal,
        nextStep,
        selectAvatar,
        handleSubmit,
        setOpenSoundStyle
    };
}
