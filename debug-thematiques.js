const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4321/formation/ressources/thematiques-rentables');
    await page.waitForTimeout(3000); // Attendre que le JS s'exécute
    
    // Compter les cartes
    const cardCount = await page.$$eval('.card', cards => cards.length);
    console.log('Nombre de cartes trouvées:', cardCount);
    
    // Vérifier s'il y a des erreurs console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    if (errors.length > 0) {
      console.log('Erreurs JavaScript:', errors);
    }
    
    // Vérifier si les données thematiques sont présentes
    const thematiquesCount = await page.evaluate(() => {
      return window.thematiquesData ? window.thematiquesData.length : 'Non défini';
    });
    console.log('Données thematiques:', thematiquesCount);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  await browser.close();
})();
