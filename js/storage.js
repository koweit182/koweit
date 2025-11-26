/* ==============================================
   KOWEÏT MARKETPLACE - STORAGE MANAGER
   Gestion du stockage local (localStorage)
   ============================================== */

const StorageManager = {
    // Clés de stockage
    KEYS: {
        LISTINGS: 'koweit_listings',
        USERS: 'koweit_users',
        CURRENT_USER: 'koweit_current_user'
    },

    // === LISTINGS ===
    
    // Récupérer toutes les annonces
    getAllListings() {
        const listings = localStorage.getItem(this.KEYS.LISTINGS);
        return listings ? JSON.parse(listings) : [];
    },

    // Récupérer une annonce par ID
    getListingById(id) {
        const listings = this.getAllListings();
        return listings.find(listing => listing.id === id);
    },

    // Ajouter une nouvelle annonce
    addListing(listing) {
        const listings = this.getAllListings();
        
        // Générer un ID unique
        listing.id = 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        listing.createdAt = new Date().toISOString();
        listing.views = 0;
        
        listings.unshift(listing);
        localStorage.setItem(this.KEYS.LISTINGS, JSON.stringify(listings));
        
        return listing;
    },

    // Mettre à jour une annonce
    updateListing(id, updatedData) {
        const listings = this.getAllListings();
        const index = listings.findIndex(listing => listing.id === id);
        
        if (index !== -1) {
            listings[index] = { ...listings[index], ...updatedData };
            localStorage.setItem(this.KEYS.LISTINGS, JSON.stringify(listings));
            return listings[index];
        }
        
        return null;
    },

    // Supprimer une annonce
    deleteListing(id) {
        const listings = this.getAllListings();
        const filtered = listings.filter(listing => listing.id !== id);
        localStorage.setItem(this.KEYS.LISTINGS, JSON.stringify(filtered));
        return true;
    },

    // Incrémenter les vues d'une annonce
    incrementViews(id) {
        const listing = this.getListingById(id);
        if (listing) {
            listing.views = (listing.views || 0) + 1;
            this.updateListing(id, listing);
        }
    },

    // Rechercher des annonces
    searchListings(query, filters = {}) {
        let listings = this.getAllListings();
        
        // Filtrer par recherche textuelle
        if (query && query.trim() !== '') {
            const searchTerm = query.toLowerCase();
            listings = listings.filter(listing => 
                listing.title.toLowerCase().includes(searchTerm) ||
                listing.description.toLowerCase().includes(searchTerm) ||
                listing.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtrer par catégorie
        if (filters.category) {
            listings = listings.filter(listing => 
                listing.category === filters.category
            );
        }
        
        // Filtrer par commune
        if (filters.commune) {
            listings = listings.filter(listing => 
                listing.commune.toLowerCase() === filters.commune.toLowerCase()
            );
        }
        
        // Filtrer par prix maximum
        if (filters.maxPrice) {
            listings = listings.filter(listing => 
                listing.price <= parseFloat(filters.maxPrice)
            );
        }
        
        // Trier les résultats
        if (filters.sort) {
            switch (filters.sort) {
                case 'price-asc':
                    listings.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    listings.sort((a, b) => b.price - a.price);
                    break;
                case 'popular':
                    listings.sort((a, b) => (b.views || 0) - (a.views || 0));
                    break;
                case 'recent':
                default:
                    listings.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
            }
        }
        
        return listings;
    },

    // Récupérer les annonces par catégorie
    getListingsByCategory(category) {
        const listings = this.getAllListings();
        return listings.filter(listing => listing.category === category);
    },

    // Récupérer les annonces d'un vendeur
    getListingsBySeller(sellerWhatsapp) {
        const listings = this.getAllListings();
        return listings.filter(listing => listing.whatsapp === sellerWhatsapp);
    },

    // Récupérer les annonces récentes
    getRecentListings(limit = 8) {
        const listings = this.getAllListings();
        return listings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    },

    // Récupérer les annonces populaires
    getPopularListings(limit = 8) {
        const listings = this.getAllListings();
        return listings
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    },

    // Compter les annonces par catégorie
    countByCategory(category) {
        const listings = this.getAllListings();
        return listings.filter(listing => listing.category === category).length;
    },

    // === USERS ===
    
    // Récupérer tous les utilisateurs
    getAllUsers() {
        const users = localStorage.getItem(this.KEYS.USERS);
        return users ? JSON.parse(users) : [];
    },

    // Récupérer un utilisateur par WhatsApp
    getUserByWhatsapp(whatsapp) {
        const users = this.getAllUsers();
        return users.find(user => user.whatsapp === whatsapp);
    },

    // Ajouter un nouvel utilisateur
    addUser(user) {
        const users = this.getAllUsers();
        
        // Vérifier si l'utilisateur existe déjà
        const existing = this.getUserByWhatsapp(user.whatsapp);
        if (existing) {
            return { error: 'Cet utilisateur existe déjà' };
        }
        
        user.id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        user.createdAt = new Date().toISOString();
        
        users.push(user);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        
        return user;
    },

    // Connexion utilisateur
    loginUser(whatsapp) {
        const user = this.getUserByWhatsapp(whatsapp);
        if (user) {
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        return null;
    },

    // Déconnexion
    logoutUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // Récupérer l'utilisateur connecté
    getCurrentUser() {
        const user = localStorage.getItem(this.KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    // Vérifier si un utilisateur est connecté
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // === DONNÉES DE DÉMONSTRATION ===
    
    // Initialiser avec des données de démonstration
    initDemoData() {
        // Vérifier si des données existent déjà
        if (this.getAllListings().length > 0) {
            return;
        }
        
        // Créer des annonces de démonstration
        const demoListings = [
            {
                title: 'iPhone 12 Pro Max 256GB',
                category: 'telephones',
                condition: 'NEW_PERFECT',
                description: 'iPhone 12 Pro Max en excellent état, 256GB, couleur bleu pacifique. Aucune rayure, batterie 95%. Vendu avec chargeur et écouteurs originaux.',
                price: 850,
                commune: 'gombe',
                quartier: 'Centre-ville',
                whatsapp: '+243 810 000 001',
                sellerName: 'Jean Mukendi',
                photos: ['https://images.unsplash.com/photo-1592286927505-f30488209b6f?w=400&h=300&fit=crop']
            },
            {
                title: 'Canapé 5 places en cuir',
                category: 'meubles',
                condition: 'USED_GOOD',
                description: 'Magnifique canapé d\'angle 5 places en cuir véritable, couleur marron. Très confortable, légèrement utilisé. Idéal pour salon spacieux.',
                price: 450,
                commune: 'ngaliema',
                quartier: 'Joli-Parc',
                whatsapp: '+243 820 000 002',
                sellerName: 'Marie Kalala',
                photos: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop']
            },
            {
                title: 'Lot de vêtements friperie qualité',
                category: 'friperie',
                condition: 'USED_GOOD',
                description: '30 pièces de vêtements de qualité : jeans, chemises, t-shirts de marques européennes. Excellent état, tailles variées.',
                price: 75,
                commune: 'kalamu',
                quartier: 'Matonge',
                whatsapp: '+243 830 000 003',
                sellerName: 'Paul Nsimba',
                photos: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop']
            },
            {
                title: 'Toyota RAV4 2015',
                category: 'voitures',
                condition: 'USED_GOOD',
                description: 'Toyota RAV4 modèle 2015, 85000 km, essence, automatique. Très bien entretenue, révisions à jour. Pneus neufs, climatisation parfaite.',
                price: 18500,
                commune: 'limete',
                quartier: 'Kingasani',
                whatsapp: '+243 840 000 004',
                sellerName: 'André Tshisekedi',
                photos: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop']
            },
            {
                title: 'Réfrigérateur Samsung 400L',
                category: 'electromenagers',
                condition: 'USED',
                description: 'Réfrigérateur Samsung double porte 400 litres, économique en énergie. Utilisé 2 ans seulement. Fonctionne parfaitement.',
                price: 320,
                commune: 'lemba',
                quartier: 'Lemba Terminus',
                whatsapp: '+243 850 000 005',
                sellerName: 'Sophie Mbala',
                photos: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop']
            },
            {
                title: 'MacBook Pro 13" 2020',
                category: 'electronique',
                condition: 'NEW_PERFECT',
                description: 'MacBook Pro 13 pouces, processeur M1, 8GB RAM, 256GB SSD. Comme neuf, utilisé pour études uniquement. Garantie Apple active.',
                price: 1200,
                commune: 'gombe',
                quartier: 'Gombe',
                whatsapp: '+243 860 000 006',
                sellerName: 'David Kabila',
                photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop']
            },
            {
                title: 'Samsung Galaxy S21 Ultra',
                category: 'telephones',
                condition: 'BRAND_NEW',
                description: 'Galaxy S21 Ultra 128GB, noir phantom. État impeccable, jamais tombé. Écran 120Hz, triple caméra. Accessoires complets inclus.',
                price: 680,
                commune: 'masina',
                quartier: 'Kimbanseke',
                whatsapp: '+243 870 000 007',
                sellerName: 'Grace Nzuzi',
                photos: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop']
            },
            {
                title: 'Table à manger 6 personnes',
                category: 'meubles',
                condition: 'NEW_PERFECT',
                description: 'Belle table à manger en bois massif avec 6 chaises rembourrées. Design moderne et élégant. Parfait état.',
                price: 280,
                commune: 'matete',
                quartier: 'Matete',
                whatsapp: '+243 880 000 008',
                sellerName: 'Robert Lumumba',
                photos: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop']
            }
        ];
        
        // Ajouter chaque annonce
        demoListings.forEach(listing => {
            this.addListing(listing);
        });
        
        console.log('✅ Données de démonstration initialisées');
    },

    // Réinitialiser toutes les données
    clearAllData() {
        localStorage.removeItem(this.KEYS.LISTINGS);
        localStorage.removeItem(this.KEYS.USERS);
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        console.log('🗑️ Toutes les données ont été supprimées');
    }
};

// Initialiser les données de démonstration au chargement
// DÉSACTIVÉ EN PHASE DE TEST - Les utilisateurs ajouteront leurs propres annonces
// Pour activer les données de démo : décommentez la ligne ci-dessous
// document.addEventListener('DOMContentLoaded', () => {
//     StorageManager.initDemoData();
// });
