/* ==============================================
   KOWEÏT MARKETPLACE - AUTH.JS (AMÉLIORÉ)
   Système d'authentification avec inscription complète
   ============================================== */

const AuthManager = {
    // Configuration
    OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
    
    // Générer un OTP à 6 chiffres
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    // Enregistrer un nouvel utilisateur
    register(userData) {
        try {
            // Validation
            if (!userData.fullName || userData.fullName.trim().length < 2) {
                return { success: false, error: 'Nom complet requis (minimum 2 caractères)' };
            }
            
            if (!this.validateEmail(userData.email)) {
                return { success: false, error: 'Email invalide' };
            }
            
            if (!this.validatePhone(userData.phone)) {
                return { success: false, error: 'Numéro de téléphone invalide' };
            }
            
            if (!userData.age18Plus) {
                return { success: false, error: 'Vous devez avoir 18 ans ou plus' };
            }
            
            if (!userData.accountType) {
                return { success: false, error: 'Type de compte requis' };
            }
            
            // Vérifier si l'email existe déjà
            const users = this.getAllUsers();
            const existingEmail = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
            
            if (existingEmail) {
                return { success: false, error: 'Cet email est déjà utilisé' };
            }
            
            // Vérifier si le téléphone existe déjà
            const existingPhone = users.find(u => u.phone === userData.phone);
            
            if (existingPhone) {
                return { success: false, error: 'Ce numéro de téléphone est déjà utilisé' };
            }
            
            // Créer le nouvel utilisateur
            const user = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                fullName: userData.fullName.trim(),
                email: userData.email.toLowerCase().trim(),
                phone: userData.phone.trim(),
                profileImage: userData.profileImage || null,
                accountType: userData.accountType,
                age18Plus: true,
                isVerified: false,
                isAdmin: false,
                isBanned: false,
                createdAt: new Date().toISOString(),
                listingsCount: 0,
                totalViews: 0
            };
            
            // Sauvegarder
            users.push(user);
            localStorage.setItem('koweit_users', JSON.stringify(users));
            
            return { success: true, user };
        } catch (error) {
            console.error('Erreur inscription:', error);
            return { success: false, error: 'Erreur lors de l\'inscription' };
        }
    },
    
    // Envoyer OTP (simulation - dans la vraie version, cela appellerait une API)
    sendOTP(identifier, method) {
        try {
            // Trouver l'utilisateur
            const users = this.getAllUsers();
            const user = users.find(u => 
                u.email === identifier || u.phone === identifier
            );
            
            if (!user) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }
            
            if (user.isBanned) {
                return { success: false, error: 'Compte bloqué' };
            }
            
            // Générer OTP
            const otp = this.generateOTP();
            const expiresAt = Date.now() + this.OTP_EXPIRY;
            
            // Stocker l'OTP
            const otpData = {
                code: otp,
                userId: user.id,
                method: method,
                expiresAt: expiresAt,
                used: false,
                createdAt: Date.now()
            };
            
            const otps = JSON.parse(localStorage.getItem('koweit_otps') || '[]');
            otps.push(otpData);
            localStorage.setItem('koweit_otps', JSON.stringify(otps));
            
            // En production, envoyer réellement l'OTP par email ou SMS
            // Pour le MVP, on affiche le code (à retirer en production)
            console.log('🔐 CODE OTP:', otp, '(valide 10 min)');
            
            // Simuler l'envoi
            if (method === 'email') {
                alert(`✅ Code envoyé par email à ${user.email}\n\n🔐 Code: ${otp}\n(En production, ce code sera envoyé par email)`);
            } else {
                alert(`✅ Code envoyé par SMS au ${user.phone}\n\n🔐 Code: ${otp}\n(En production, ce code sera envoyé par SMS)`);
            }
            
            return { 
                success: true, 
                userId: user.id,
                message: `Code envoyé par ${method}`,
                // À RETIRER EN PRODUCTION :
                debugOTP: otp
            };
        } catch (error) {
            console.error('Erreur envoi OTP:', error);
            return { success: false, error: 'Erreur lors de l\'envoi du code' };
        }
    },
    
    // Vérifier OTP et connecter
    verifyOTP(userId, code) {
        try {
            const otps = JSON.parse(localStorage.getItem('koweit_otps') || '[]');
            
            // Trouver l'OTP valide
            const validOTP = otps.find(otp => 
                otp.userId === userId &&
                otp.code === code &&
                !otp.used &&
                otp.expiresAt > Date.now()
            );
            
            if (!validOTP) {
                return { success: false, error: 'Code invalide ou expiré' };
            }
            
            // Marquer l'OTP comme utilisé
            validOTP.used = true;
            localStorage.setItem('koweit_otps', JSON.stringify(otps));
            
            // Récupérer l'utilisateur
            const users = this.getAllUsers();
            const user = users.find(u => u.id === userId);
            
            if (!user) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }
            
            // Marquer comme vérifié
            user.isVerified = true;
            localStorage.setItem('koweit_users', JSON.stringify(users));
            
            // Créer la session
            const session = {
                userId: user.id,
                token: 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                createdAt: Date.now(),
                expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 jours
            };
            
            localStorage.setItem('koweit_session', JSON.stringify(session));
            localStorage.setItem('koweit_current_user', JSON.stringify(user));
            
            return { success: true, user, token: session.token };
        } catch (error) {
            console.error('Erreur vérification OTP:', error);
            return { success: false, error: 'Erreur lors de la vérification' };
        }
    },
    
    // Déconnexion
    logout() {
        localStorage.removeItem('koweit_session');
        localStorage.removeItem('koweit_current_user');
        return { success: true };
    },
    
    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        const session = JSON.parse(localStorage.getItem('koweit_session') || 'null');
        
        if (!session) return false;
        
        // Vérifier si la session a expiré
        if (session.expiresAt < Date.now()) {
            this.logout();
            return false;
        }
        
        return true;
    },
    
    // Obtenir l'utilisateur connecté
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        return JSON.parse(localStorage.getItem('koweit_current_user') || 'null');
    },
    
    // Récupération de compte (mot de passe oublié)
    resetPassword(identifier, method) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u => 
                u.email === identifier || u.phone === identifier
            );
            
            if (!user) {
                return { success: false, error: 'Utilisateur non trouvé' };
            }
            
            // Générer un lien/code de récupération
            const resetCode = this.generateOTP();
            const resetData = {
                code: resetCode,
                userId: user.id,
                method: method,
                expiresAt: Date.now() + (60 * 60 * 1000), // 1 heure
                used: false,
                type: 'reset'
            };
            
            const resets = JSON.parse(localStorage.getItem('koweit_resets') || '[]');
            resets.push(resetData);
            localStorage.setItem('koweit_resets', JSON.stringify(resets));
            
            // Simuler l'envoi
            if (method === 'email') {
                alert(`✅ Lien de récupération envoyé à ${user.email}\n\n🔐 Code: ${resetCode}\n(Valide 1 heure)`);
            } else {
                alert(`✅ Code de récupération envoyé au ${user.phone}\n\n🔐 Code: ${resetCode}\n(Valide 1 heure)`);
            }
            
            return { 
                success: true, 
                userId: user.id,
                debugCode: resetCode 
            };
        } catch (error) {
            console.error('Erreur reset:', error);
            return { success: false, error: 'Erreur lors de la récupération' };
        }
    },
    
    // Utilitaires
    getAllUsers() {
        return JSON.parse(localStorage.getItem('koweit_users') || '[]');
    },
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePhone(phone) {
        // Format accepté: +243XXXXXXXXX ou 0XXXXXXXXX
        const re = /^(\+243|0)[0-9]{9}$/;
        return re.test(phone.replace(/\s/g, ''));
    },
    
    // Nettoyer les OTPs expirés
    cleanupExpiredOTPs() {
        const otps = JSON.parse(localStorage.getItem('koweit_otps') || '[]');
        const validOTPs = otps.filter(otp => otp.expiresAt > Date.now());
        localStorage.setItem('koweit_otps', JSON.stringify(validOTPs));
    }
};

// Nettoyer les OTPs expirés au chargement
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.cleanupExpiredOTPs();
});

// Export
window.AuthManager = AuthManager;
