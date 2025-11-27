// api/auth/verify.js - API vérification OTP
const { ObjectId } = require('mongodb');
const { getCollection } = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

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
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        error: 'UserId et code requis'
      });
    }

    // Chercher l'OTP
    const otps = await getCollection('otps');
    const otp = await otps.findOne({
      userId: new ObjectId(userId),
      code: code.toString(),
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'Code invalide ou expiré'
      });
    }

    // Marquer l'OTP comme utilisé
    await otps.updateOne(
      { _id: otp._id },
      { $set: { used: true } }
    );

    // Récupérer l'utilisateur
    const users = await getCollection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Marquer comme vérifié
    await users.updateOne(
      { _id: user._id },
      { $set: { isVerified: true } }
    );

    // Générer le token JWT
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        accountType: user.accountType,
        isAdmin: user.isAdmin || false
      }
    });

  } catch (error) {
    console.error('Erreur vérification:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};
