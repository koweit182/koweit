// server.js - Point d'entrée pour Render
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir les fichiers statiques (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Import routes API
let registerRoute, loginRoute, verifyRoute, resetRoute, meRoute;

try {
  registerRoute = require('./api/auth/register');
  loginRoute = require('./api/auth/login');
  verifyRoute = require('./api/auth/verify');
  resetRoute = require('./api/auth/reset');
  meRoute = require('./api/users/me');
} catch (err) {
  console.error('⚠️ Warning: Could not load API routes:', err.message);
}

// API Routes (si disponibles)
if (registerRoute) app.post('/api/auth/register', registerRoute);
if (loginRoute) app.post('/api/auth/login', loginRoute);
if (verifyRoute) app.post('/api/auth/verify', verifyRoute);
if (resetRoute) app.post('/api/auth/reset', resetRoute);
if (meRoute) app.get('/api/users/me', meRoute);

// Route catch-all pour servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KOWEÏT Marketplace server running on port ${PORT}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_FROM_EMAIL || 'Not configured'}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 Server ready at http://localhost:${PORT}`);
});
