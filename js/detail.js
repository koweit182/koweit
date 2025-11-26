/* ==============================================
   KOWEÏT MARKETPLACE - DETAIL PAGE
   Scripts pour la page de détail
   ============================================== */

let currentListing = null;

document.addEventListener('DOMContentLoaded', () => {
    loadListingDetail();
});

// Charger les détails de l'annonce
function loadListingDetail() {
    const params = App.getUrlParams();
    const listingId = params.id;
    
    if (!listingId) {
        window.location.href = 'annonces.html';
        return;
    }
    
    // Récupérer l'annonce
    const listing = StorageManager.getListingById(listingId);
    
    if (!listing) {
        alert('Annonce introuvable');
        window.location.href = 'annonces.html';
        return;
    }
    
    currentListing = listing;
    
    // Incrémenter le compteur de vues
    StorageManager.incrementViews(listingId);
    
    // Afficher l'annonce
    displayListing(listing);
    
    // Charger les autres annonces du vendeur
    loadSellerListings(listing.whatsapp, listingId);
}

// Afficher l'annonce
function displayListing(listing) {
    const container = document.getElementById('listing-detail');
    
    // Créer la galerie de photos
    const photos = listing.photos && listing.photos.length > 0 
        ? listing.photos 
        : ['https://via.placeholder.com/800x600/CCCCCC/666666?text=Pas+d\'image'];
    
    let thumbnailsHtml = '';
    if (photos.length > 1) {
        thumbnailsHtml = `
            <div class="listing-thumbnails">
                ${photos.map((photo, index) => `
                    <img src="${photo}" 
                         class="thumbnail ${index === 0 ? 'active' : ''}" 
                         onclick="changeMainImage('${photo}')"
                         onerror="this.src='https://via.placeholder.com/80x80/CCCCCC/666666'">
                `).join('')}
            </div>
        `;
    }
    
    // Générer le message WhatsApp
    const whatsappMessage = `Bonjour, je suis intéressé(e) par votre annonce: ${listing.title}`;
    const whatsappLink = App.getWhatsAppLink(listing.whatsapp, whatsappMessage);
    
    container.innerHTML = `
        <div class="listing-gallery">
            <img id="main-image" 
                 src="${photos[0]}" 
                 alt="${listing.title}" 
                 class="listing-main-image"
                 onerror="this.src='https://via.placeholder.com/800x600/CCCCCC/666666?text=Image+indisponible'">
            ${thumbnailsHtml}
        </div>
        
        <div class="listing-info">
            <div class="listing-detail-header">
                <span class="listing-badge">${App.getCategoryIcon(listing.category)} ${App.getCategoryName(listing.category)}</span>
                <h1 class="listing-detail-title">${listing.title}</h1>
                <p class="listing-detail-price">${App.formatPrice(listing.price)}</p>
                <div class="listing-detail-meta">
                    <span>📍 ${listing.commune}, ${listing.quartier}</span>
                    <span>📅 ${App.formatDate(listing.createdAt)}</span>
                    <span>👁️ ${listing.views || 0} vues</span>
                </div>
            </div>
            
            <div class="listing-detail-section">
                <h3>Description</h3>
                <p class="listing-description">${listing.description}</p>
            </div>
            
            <div class="listing-detail-section">
                <h3>Vendeur</h3>
                <div class="seller-info">
                    <div class="seller-avatar">👤</div>
                    <div class="seller-details">
                        <h4>${listing.sellerName}</h4>
                        <p>📍 ${listing.commune}</p>
                        <p>📱 ${listing.whatsapp}</p>
                    </div>
                </div>
            </div>
            
            <a href="${whatsappLink}" 
               target="_blank" 
               class="btn btn-primary btn-large contact-btn">
                <span>💬</span> Contacter sur WhatsApp
            </a>
        </div>
    `;
}

// Changer l'image principale
window.changeMainImage = function(photoUrl) {
    const mainImage = document.getElementById('main-image');
    mainImage.src = photoUrl;
    
    // Mettre à jour les miniatures actives
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === photoUrl) {
            thumb.classList.add('active');
        }
    });
};

// Charger les autres annonces du vendeur
function loadSellerListings(whatsapp, excludeId) {
    const container = document.getElementById('seller-listings');
    if (!container) return;
    
    const listings = StorageManager.getListingsBySeller(whatsapp)
        .filter(listing => listing.id !== excludeId)
        .slice(0, 4); // Maximum 4 annonces
    
    if (listings.length === 0) {
        container.innerHTML = '<p class="empty-message">Ce vendeur n\'a pas d\'autres annonces</p>';
        return;
    }
    
    container.innerHTML = '';
    listings.forEach(listing => {
        const card = App.createListingCard(listing);
        container.appendChild(card);
    });
}
