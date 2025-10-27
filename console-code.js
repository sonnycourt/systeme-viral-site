// Code console pour voir Phase 2 en local
// Copie-colle tout ça dans la console du navigateur

const now = new Date("2025-11-21T21:00:00");
const transitionDate = new Date("2025-11-20T21:00:00").getTime();
const phase2EndDate = new Date("2025-12-04T22:00:00").getTime();

const hoursElapsed = (now.getTime() - transitionDate) / (1000 * 60 * 60);
const phase2TotalHours = (phase2EndDate - transitionDate) / (1000 * 60 * 60);
const progress = hoursElapsed / phase2TotalHours;
const adjustedProgress = Math.pow(progress, 0.76);
const places = Math.floor(200 * (1 - adjustedProgress));

console.log("🎫 Places Phase 2:", places);

// Modifier le HTML pour afficher comme voulu
const scarcityText = document.getElementById("scarcityText");
if (scarcityText) {
    scarcityText.classList.add("sold-out");
    scarcityText.innerHTML = '<span style="color: #ff3d3d;">0</span> places disponibles sur 200';
}

const exceptionalOffer = document.getElementById("exceptionalOffer");
const exceptionalPlaces = document.getElementById("exceptionalPlaces");
if (exceptionalOffer) exceptionalOffer.style.display = "inline-block";
if (exceptionalPlaces) exceptionalPlaces.textContent = places;

console.log("✅ Affiché !");

