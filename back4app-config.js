// js/back4app-config.js - Configuration Back4App
// Remplacez les valeurs ci-dessous par vos vraies clés

const BACK4APP_CONFIG = {
  applicationId: 'vEKWyFWW440jIrgPr1I44YyclHVJcoCjwesu6po7',
  javascriptKey: 'E5vOaCeeDZsOA8PR0SybGoqhtqN4jnyEs1B0tfLZ',
  serverURL: 'https://parseapi.back4app.com'
};

// Initialiser Parse
Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
Parse.serverURL = BACK4APP_CONFIG.serverURL;

console.log('✅ Back4App connecté !');
