// js/back4app-auth.js - Authentification avec Back4App

// INSCRIPTION
async function registerUser(fullName, email, phone, accountType) {
  try {
    const user = new Parse.User();
    user.set('username', email);
    user.set('email', email);
    user.set('password', phone); // Utilise le téléphone comme mot de passe temporaire
    user.set('fullName', fullName);
    user.set('phone', phone);
    user.set('accountType', accountType);
    user.set('age18Plus', true);
    user.set('isVerified', false);
    
    await user.signUp();
    
    console.log('✅ Utilisateur créé:', user.id);
    
    // Générer OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sauvegarder OTP dans Parse
    const OTP = Parse.Object.extend('OTP');
    const otpObject = new OTP();
    otpObject.set('email', email);
    otpObject.set('code', otp);
    otpObject.set('expiresAt', new Date(Date.now() + 10 * 60 * 1000)); // 10 min
    await otpObject.save();
    
    return {
      success: true,
      message: 'Compte créé avec succès',
      otp: otp // En production, ceci serait envoyé par email
    };
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CONNEXION - Étape 1 : Générer et envoyer OTP
async function sendOTP(email) {
  try {
    // Vérifier si l'utilisateur existe
    const query = new Parse.Query(Parse.User);
    query.equalTo('email', email);
    const user = await query.first();
    
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé'
      };
    }
    
    // Générer OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Sauvegarder OTP dans Parse
    const OTP = Parse.Object.extend('OTP');
    const otpObject = new OTP();
    otpObject.set('email', email);
    otpObject.set('code', otp);
    otpObject.set('expiresAt', new Date(Date.now() + 10 * 60 * 1000));
    await otpObject.save();
    
    console.log('🔐 Code OTP généré:', otp);
    
    return {
      success: true,
      message: 'Code OTP envoyé',
      otp: otp // En production, ceci serait envoyé par email
    };
  } catch (error) {
    console.error('❌ Erreur envoi OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CONNEXION - Étape 2 : Vérifier OTP et connecter
async function verifyOTP(email, code) {
  try {
    // Chercher l'OTP
    const OTPQuery = new Parse.Query('OTP');
    OTPQuery.equalTo('email', email);
    OTPQuery.equalTo('code', code);
    OTPQuery.greaterThan('expiresAt', new Date());
    OTPQuery.descending('createdAt');
    
    const otpObject = await OTPQuery.first();
    
    if (!otpObject) {
      return {
        success: false,
        error: 'Code invalide ou expiré'
      };
    }
    
    // Connecter l'utilisateur
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('email', email);
    const user = await userQuery.first();
    
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non trouvé'
      };
    }
    
    // Connexion avec le téléphone comme mot de passe
    const phone = user.get('phone');
    await Parse.User.logIn(email, phone);
    
    // Supprimer l'OTP utilisé
    await otpObject.destroy();
    
    // Marquer comme vérifié
    user.set('isVerified', true);
    await user.save();
    
    return {
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        fullName: user.get('fullName'),
        email: user.get('email'),
        phone: user.get('phone'),
        accountType: user.get('accountType')
      }
    };
  } catch (error) {
    console.error('❌ Erreur vérification OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// DÉCONNEXION
async function logoutUser() {
  try {
    await Parse.User.logOut();
    return {
      success: true,
      message: 'Déconnexion réussie'
    };
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// UTILISATEUR ACTUEL
function getCurrentUser() {
  const user = Parse.User.current();
  if (user) {
    return {
      id: user.id,
      fullName: user.get('fullName'),
      email: user.get('email'),
      phone: user.get('phone'),
      accountType: user.get('accountType'),
      isVerified: user.get('isVerified')
    };
  }
  return null;
}

// VÉRIFIER SI CONNECTÉ
function isLoggedIn() {
  return Parse.User.current() !== null;
}
