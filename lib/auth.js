// lib/auth.js - Utilitaires d'authentification
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_temporaire_a_changer';
const JWT_EXPIRY = '30d'; // 30 jours

/**
 * Générer un OTP à 6 chiffres
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hasher un mot de passe
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Vérifier un mot de passe
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Générer un token JWT
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Vérifier un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware pour vérifier l'authentification
 */
function requireAuth(handler) {
  return async (req, res) => {
    try {
      // Récupérer le token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Token manquant'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide'
        });
      }

      // Ajouter userId à la requête
      req.userId = decoded.userId;

      // Appeler le handler
      return await handler(req, res);
    } catch (error) {
      console.error('Erreur auth:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  };
}

/**
 * Valider un email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valider un téléphone congolais
 */
function isValidPhone(phone) {
  // Format: +243XXXXXXXXX ou 0XXXXXXXXX
  const re = /^(\+243|0)[0-9]{9}$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Formater un numéro de téléphone
 */
function formatPhone(phone) {
  // Retirer les espaces
  let formatted = phone.replace(/\s/g, '');
  
  // Convertir 0XXXXXXXXX en +243XXXXXXXXX
  if (formatted.startsWith('0')) {
    formatted = '+243' + formatted.substring(1);
  }
  
  // S'assurer que ça commence par +243
  if (!formatted.startsWith('+243')) {
    formatted = '+243' + formatted;
  }
  
  return formatted;
}

module.exports = {
  generateOTP,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  isValidEmail,
  isValidPhone,
  formatPhone
};
