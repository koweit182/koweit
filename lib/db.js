// lib/db.js - Connexion MongoDB
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // Utiliser le cache si disponible
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Vérifier l'URI MongoDB
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI non défini dans les variables d\'environnement');
  }

  // Créer une nouvelle connexion
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('koweit_marketplace');

  // Mettre en cache
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Collections
async function getCollection(name) {
  const { db } = await connectToDatabase();
  return db.collection(name);
}

module.exports = {
  connectToDatabase,
  getCollection
};
