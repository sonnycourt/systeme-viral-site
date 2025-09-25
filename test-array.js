const thematiques = [
    {
        id: 1,
        title: "Test Finance",
        description: "Test description finance",
        virality: 4,
        financial: 5,
        monetization: ["Formations", "Mentorat"],
        difficulty: 3,
        difficultyText: "Test",
    },
    {
        id: 2,
        title: "Test Gaming", 
        description: "Test description gaming",
        virality: 5,
        financial: 3,
        monetization: ["Streaming", "Affiliation"],
        difficulty: 2,
        difficultyText: "Test gaming",
    },
    {
        id: 3,
        title: "Test Cuisine",
        description: "Test description cuisine", 
        virality: 4,
        financial: 4,
        monetization: ["Livres", "Affiliation"],
        difficulty: 2,
        difficultyText: "Test cuisine",
    }
];

console.log("Array length:", thematiques.length);
console.log("First item:", thematiques[0]);
