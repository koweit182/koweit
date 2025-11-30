// api/users/me.js - API profil utilisateur
const { ObjectId } = require('mongodb');
const { getCollection } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer l'utilisateur
    const users = await getCollection('users');
    const user = await users.findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        accountType: user.accountType,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt,
        listingsCount: user.listingsCount || 0
      }
    });

  } catch (error) {
    console.error('Erreur profil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
}

module.exports = requireAuth(handler);
