/* ==============================================
   KOWEÏT MARKETPLACE - ACCOUNT PAGE
   Scripts pour la page de compte
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupAuthTabs();
    setupAuthForms();
});

// Vérifier le statut de connexion
function checkAuthStatus() {
    const currentUser = StorageManager.getCurrentUser();
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (currentUser) {
        // Utilisateur connecté - afficher le dashboard
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        
        loadUserDashboard(currentUser);
    } else {
        // Pas connecté - afficher les formulaires d'auth
        authContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
    }
}

// Configurer les onglets d'authentification
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Mettre à jour les onglets actifs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Afficher le bon formulaire
            if (targetTab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });
}

// Configurer les formulaires d'authentification
function setupAuthForms() {
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    // Formulaire d'inscription
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });
}

// Gérer la connexion
function handleLogin() {
    const whatsapp = document.getElementById('login-whatsapp').value.trim();
    
    if (!App.validatePhoneNumber(whatsapp)) {
        alert('Veuillez entrer un numéro WhatsApp valide');
        return;
    }
    
    const user = StorageManager.loginUser(whatsapp);
    
    if (user) {
        alert('✅ Connexion réussie !');
        window.location.reload();
    } else {
        alert('❌ Aucun compte trouvé avec ce numéro. Veuillez vous inscrire.');
    }
}

// Gérer l'inscription
function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const whatsapp = document.getElementById('register-whatsapp').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const commune = document.getElementById('register-commune').value;
    
    // Validation
    if (!name || !whatsapp || !commune) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (!App.validatePhoneNumber(whatsapp)) {
        alert('Veuillez entrer un numéro WhatsApp valide');
        return;
    }
    
    if (email && !email.includes('@')) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }
    
    // Créer l'utilisateur
    const userData = {
        name: name,
        whatsapp: whatsapp,
        email: email || null,
        commune: commune
    };
    
    const result = StorageManager.addUser(userData);
    
    if (result.error) {
        alert('❌ ' + result.error);
        return;
    }
    
    // Se connecter automatiquement
    StorageManager.loginUser(whatsapp);
    alert('✅ Compte créé avec succès !');
    window.location.reload();
}

// Charger le dashboard utilisateur
function loadUserDashboard(user) {
    // Afficher les informations utilisateur
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-location').textContent = `📍 ${user.commune}`;
    document.getElementById('user-whatsapp').textContent = `📱 ${user.whatsapp}`;
    
    // Charger les annonces de l'utilisateur
    const userListings = StorageManager.getListingsBySeller(user.whatsapp);
    
    // Mettre à jour les statistiques
    document.getElementById('total-listings').textContent = userListings.length;
    
    const totalViews = userListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
    document.getElementById('total-views').textContent = totalViews;
    
    // Afficher les annonces
    const listingsContainer = document.getElementById('user-listings');
    
    if (userListings.length === 0) {
        listingsContainer.innerHTML = '<p class="empty-message">Vous n\'avez pas encore publié d\'annonce</p>';
    } else {
        listingsContainer.innerHTML = '';
        userListings.forEach(listing => {
            const card = createUserListingCard(listing);
            listingsContainer.appendChild(card);
        });
    }
    
    // Bouton de déconnexion
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Créer une carte d'annonce avec options de gestion
function createUserListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    const imageUrl = listing.photos && listing.photos.length > 0 
        ? listing.photos[0] 
        : 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Pas+d\'image';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${listing.title}" class="listing-image" onerror="this.src='https://via.placeholder.com/400x300/CCCCCC/666666'">
        <div class="listing-content">
            <h3 class="listing-title">${listing.title}</h3>
            <p class="listing-price">${App.formatPrice(listing.price)}</p>
            <p class="listing-location">📍 ${listing.commune}, ${listing.quartier}</p>
            <div class="listing-meta">
                <span>${App.formatDate(listing.createdAt)}</span>
                <span>👁️ ${listing.views || 0}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <a href="detail.html?id=${listing.id}" class="btn btn-primary" style="flex: 1; text-align: center;">Voir</a>
                <button onclick="deleteListing('${listing.id}')" class="btn btn-secondary" style="flex: 1;">Supprimer</button>
            </div>
        </div>
    `;
    
    return card;
}

// Supprimer une annonce
window.deleteListing = function(listingId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
        StorageManager.deleteListing(listingId);
        alert('✅ Annonce supprimée');
        window.location.reload();
    }
};

// Gérer la déconnexion
function handleLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        StorageManager.logoutUser();
        window.location.reload();
    }
}
