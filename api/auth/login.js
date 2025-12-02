// api/auth/login.js - API connexion (envoi OTP)
const { getCollection } = require('../../lib/db');
const { generateOTP, isValidEmail, formatPhone } = require('../../lib/auth');
const { sendOTPEmail } = require('../../lib/email');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { identifier, method } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Email ou téléphone requis'
      });
    }

    if (!method || !['email', 'sms'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: 'Méthode invalide'
      });
    }

    // Si c'est un téléphone, le formater
    const isEmail = isValidEmail(identifier);
    const searchValue = isEmail ? identifier.toLowerCase() : formatPhone(identifier);
    const searchField = isEmail ? 'email' : 'phone';

    // Chercher l'utilisateur
    const users = await getCollection('users');
    const user = await users.findOne({
      [searchField]: searchValue
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: 'Compte bloqué'
      });
    }

    // Générer l'OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder l'OTP
    const otps = await getCollection('otps');
    await otps.insertOne({
      code,
      userId: user._id,
      method,
      type: 'LOGIN',
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // Envoyer l'OTP
    if (method === 'email') {
      const emailResult = await sendOTPEmail(user.email, code, user.fullName);
      
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'envoi de l\'email'
        });
      }
    } else {
      // SMS non implémenté pour l'instant
      return res.status(501).json({
        success: false,
        error: 'L\'envoi par SMS n\'est pas encore disponible. Utilisez l\'email.'
      });
    }

    return res.status(200).json({
      success: true,
      userId: user._id.toString(),
      message: `Code envoyé par ${method}`
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};
