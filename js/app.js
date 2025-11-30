/* ==============================================
   KOWEÏT MARKETPLACE - APP.JS
   Fonctions utilitaires et helpers
   ============================================== */

const App = {
    // Formater le prix en USD
    formatPrice(price) {
        if (price === 0) {
            return 'Échange / Troc';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    },

    // Formater une date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return "Aujourd'hui";
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    },

    // Obtenir l'icône d'une catégorie
    getCategoryIcon(category) {
        const icons = {
            'telephones': '📱',
            'meubles': '🛋️',
            'friperie': '👕',
            'voitures': '🚗',
            'electromenagers': '🔌',
            'immobilier': '🏠',
            'electronique': '💻',
            'autres': '📦'
        };
        return icons[category] || '📦';
    },

    // Obtenir le nom d'une catégorie
    getCategoryName(category) {
        const names = {
            'telephones': 'Téléphones',
            'meubles': 'Meubles',
            'friperie': 'Friperie',
            'voitures': 'Voitures',
            'electromenagers': 'Électroménagers',
            'immobilier': 'Immobilier',
            'electronique': 'Électronique',
            'autres': 'Autres'
        };
        return names[category] || 'Autres';
    },

    // Créer une carte d'annonce
    createListingCard(listing) {
        const card = document.createElement('a');
        card.href = `detail.html?id=${listing.id}`;
        card.className = 'listing-card';
        
        const imageUrl = listing.photos && listing.photos.length > 0 
            ? listing.photos[0] 
            : 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Pas+d\'image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${listing.title}" class="listing-image" onerror="this.src='https://via.placeholder.com/400x300/CCCCCC/666666?text=Image+indisponible'">
            <div class="listing-content">
                ${listing.views > 10 ? '<span class="listing-badge">Populaire</span>' : ''}
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-price">${this.formatPrice(listing.price)}</p>
                <p class="listing-location">📍 ${listing.commune}, ${listing.quartier}</p>
                <div class="listing-meta">
                    <span>${this.formatDate(listing.createdAt)}</span>
                    <span>👁️ ${listing.views || 0}</span>
                </div>
            </div>
        `;
        
        return card;
    },

    // Afficher un message d'erreur
    showError(message, container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
        }
        
        setTimeout(() => errorDiv.remove(), 5000);
    },

    // Afficher un message de succès
    showSuccess(message, container) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        if (container) {
            container.insertBefore(successDiv, container.firstChild);
        }
        
        setTimeout(() => successDiv.remove(), 5000);
    },

    // Générer un lien WhatsApp
    getWhatsAppLink(phone, message = '') {
        // Nettoyer le numéro de téléphone
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    },

    // Valider un numéro de téléphone congolais
    validatePhoneNumber(phone) {
        // Format accepté: +243 XXX XXX XXX ou 0XXX XXX XXX
        const regex = /^(\+243|0)[0-9]{9}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return regex.test(cleanPhone);
    },

    // Compresser une image
    async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Redimensionner si nécessaire
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                
                img.onerror = reject;
            };
            
            reader.onerror = reject;
        });
    },

    // Obtenir les paramètres d'URL
    getUrlParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    },

    // Mettre à jour l'URL sans recharger la page
    updateUrl(params) {
        const url = new URL(window.location);
        
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        
        window.history.pushState({}, '', url);
    },

    // Pagination
    paginate(items, page = 1, perPage = 12) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        
        return {
            items: items.slice(start, end),
            totalPages: Math.ceil(items.length / perPage),
            currentPage: page,
            totalItems: items.length
        };
    },

    // Créer des boutons de pagination
    createPagination(totalPages, currentPage, callback) {
        const container = document.createElement('div');
        container.className = 'pagination';
        
        // Bouton précédent
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Précédent';
            prevBtn.onclick = () => callback(currentPage - 1);
            container.appendChild(prevBtn);
        }
        
        // Numéros de page
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === currentPage ? 'active' : '';
            pageBtn.onclick = () => callback(i);
            container.appendChild(pageBtn);
        }
        
        // Bouton suivant
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Suivant →';
            nextBtn.onclick = () => callback(currentPage + 1);
            container.appendChild(nextBtn);
        }
        
        return container;
    },

    // Débounce (retarder l'exécution d'une fonction)
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Loader
    showLoader(container) {
        container.innerHTML = '<div class="loading">Chargement...</div>';
    },

    // Message vide
    showEmptyMessage(container, message = 'Aucune annonce trouvée') {
        container.innerHTML = `<div class="empty-message">${message}</div>`;
    }
};

// Exports pour utilisation globale
window.App = App;
