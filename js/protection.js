/* ==============================================
   KOWEÏT MARKETPLACE - PROTECTION.JS
   Protection des pages nécessitant une authentification
   ============================================== */

const PageProtection = {
    // Pages publiques (accessibles sans connexion)
    publicPages: [
        'login.html',
        'register.html',
        'verify-otp.html',
        'forgot-password.html'
    ],
    
    // Vérifier si l'utilisateur est sur une page publique
    isPublicPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.publicPages.includes(currentPage);
    },
    
    // Protéger la page actuelle
    protectPage() {
        // Si c'est une page publique, ne rien faire
        if (this.isPublicPage()) {
            return;
        }
        
        // Vérifier l'authentification
        if (!AuthManager.isAuthenticated()) {
            // Sauvegarder la page demandée
            sessionStorage.setItem('koweit_redirect_after_login', window.location.href);
            
            // Afficher un message
            const showMessage = sessionStorage.getItem('koweit_first_visit');
            if (!showMessage) {
                alert('🔒 Veuillez vous connecter pour accéder à KOWEÏT Marketplace');
                sessionStorage.setItem('koweit_first_visit', 'shown');
            }
            
            // Rediriger vers la page de connexion
            window.location.href = 'login.html';
        }
    },
    
    // Afficher les infos utilisateur dans le header
    displayUserInfo() {
        if (!AuthManager.isAuthenticated()) return;
        
        const user = AuthManager.getCurrentUser();
        if (!user) return;
        
        // Trouver le header
        const header = document.querySelector('.header');
        if (!header) return;
        
        // Chercher le menu de navigation
        let navMenu = header.querySelector('.nav-menu');
        if (!navMenu) {
            // Si pas de menu, en créer un
            const headerContent = header.querySelector('.header-content');
            navMenu = document.createElement('nav');
            navMenu.className = 'nav-menu';
            headerContent.appendChild(navMenu);
        }
        
        // Ajouter les infos utilisateur
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.style.cssText = 'display: flex; align-items: center; gap: 15px;';
        
        userInfo.innerHTML = `
            <a href="compte.html" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit;">
                ${user.profileImage 
                    ? `<img src="${user.profileImage}" alt="${user.fullName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-blue);">` 
                    : '<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-blue); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">' + user.fullName.charAt(0).toUpperCase() + '</div>'
                }
                <div>
                    <div style="font-weight: 600; color: var(--dark-blue);">${user.fullName}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-600);">${user.accountType === 'BUSINESS' ? '🏢 Entreprise' : '👤 Particulier'}</div>
                </div>
            </a>
            <button onclick="PageProtection.logout()" style="padding: 8px 15px; background: var(--error); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                🚪 Déconnexion
            </button>
        `;
        
        // Remplacer ou ajouter au menu
        const existingUserInfo = navMenu.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.replaceWith(userInfo);
        } else {
            navMenu.appendChild(userInfo);
        }
    },
    
    // Déconnexion
    logout() {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            AuthManager.logout();
            alert('✅ Vous êtes maintenant déconnecté');
            window.location.href = 'login.html';
        }
    },
    
    // Rediriger après connexion
    redirectAfterLogin() {
        const redirectUrl = sessionStorage.getItem('koweit_redirect_after_login');
        sessionStorage.removeItem('koweit_redirect_after_login');
        
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'index.html';
        }
    }
};

// Protection automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    PageProtection.protectPage();
    PageProtection.displayUserInfo();
});

// Export
window.PageProtection = PageProtection;
