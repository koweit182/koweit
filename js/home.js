/* ==============================================
   KOWEÏT MARKETPLACE - HOME PAGE
   Scripts pour la page d'accueil
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadCategoryCounts();
    loadRecentListings();
    loadPopularListings();
});

// Charger les compteurs de catégories
function loadCategoryCounts() {
    const categories = ['telephones', 'meubles', 'friperie', 'voitures', 'electromenagers', 'immobilier', 'electronique', 'autres'];
    
    categories.forEach(category => {
        const count = StorageManager.countByCategory(category);
        const countElement = document.getElementById(`count-${category}`);
        
        if (countElement) {
            countElement.textContent = `${count} annonce${count > 1 ? 's' : ''}`;
        }
    });
}

// Charger les annonces récentes
function loadRecentListings() {
    const container = document.getElementById('recent-listings');
    if (!container) return;
    
    const listings = StorageManager.getRecentListings(8);
    
    if (listings.length === 0) {
        App.showEmptyMessage(container, 'Aucune annonce pour le moment. Soyez le premier à publier !');
        return;
    }
    
    container.innerHTML = '';
    
    listings.forEach(listing => {
        const card = App.createListingCard(listing);
        container.appendChild(card);
    });
}

// Charger les annonces populaires
function loadPopularListings() {
    const container = document.getElementById('popular-listings');
    if (!container) return;
    
    const listings = StorageManager.getPopularListings(8);
    
    if (listings.length === 0) {
        App.showEmptyMessage(container, 'Aucune annonce populaire pour le moment');
        return;
    }
    
    container.innerHTML = '';
    
    listings.forEach(listing => {
        const card = App.createListingCard(listing);
        container.appendChild(card);
    });
}
