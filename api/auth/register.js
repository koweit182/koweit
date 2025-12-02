// api/auth/register.js - API d'inscription
const { getCollection } = require('../../lib/db');
const { isValidEmail, isValidPhone, formatPhone } = require('../../lib/auth');
const { sendWelcomeEmail } = require('../../lib/email');

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
    const { fullName, email, phone, accountType, profileImage, age18Plus } = req.body;

    // Validation
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nom complet requis (minimum 2 caractères)'
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email invalide'
      });
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Numéro de téléphone invalide'
      });
    }

    if (!accountType || !['INDIVIDUAL', 'BUSINESS'].includes(accountType)) {
      return res.status(400).json({
        success: false,
        error: 'Type de compte invalide'
      });
    }

    if (!age18Plus) {
      return res.status(400).json({
        success: false,
        error: 'Vous devez avoir 18 ans ou plus'
      });
    }

    // Formater le téléphone
    const formattedPhone = formatPhone(phone);

    // Vérifier les doublons
    const users = await getCollection('users');

    const existingEmail = await users.findOne({
      email: email.toLowerCase()
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    const existingPhone = await users.findOne({
      phone: formattedPhone
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: 'Ce numéro de téléphone est déjà utilisé'
      });
    }

    // Créer l'utilisateur
    const newUser = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: formattedPhone,
      profileImage: profileImage || null,
      accountType,
      age18Plus: true,
      isVerified: false,
      isAdmin: false,
      isBanned: false,
      createdAt: new Date(),
      listingsCount: 0,
      totalViews: 0
    };

    const result = await users.insertOne(newUser);

    // Envoyer l'email de bienvenue (async, ne pas attendre)
    sendWelcomeEmail(newUser.email, newUser.fullName).catch(err => {
      console.error('Erreur envoi email bienvenue:', err);
    });

    return res.status(201).json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        accountType: newUser.accountType
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};
