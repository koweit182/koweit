/* ==============================================
   KOWEÏT MARKETPLACE - LISTINGS PAGE
   Scripts pour la page des annonces
   ============================================== */

let currentPage = 1;
let currentFilters = {};
let currentView = 'grid';

document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    loadListings();
    setupEventListeners();
});

// Initialiser les filtres depuis l'URL
function initializeFilters() {
    const params = App.getUrlParams();
    
    if (params.cat) {
        document.getElementById('filter-category').value = params.cat;
        currentFilters.category = params.cat;
    }
    
    if (params.commune) {
        document.getElementById('filter-commune').value = params.commune;
        currentFilters.commune = params.commune;
    }
    
    if (params.sort) {
        document.getElementById('filter-sort').value = params.sort;
        currentFilters.sort = params.sort;
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Recherche
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filtres
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-commune').addEventListener('change', applyFilters);
    document.getElementById('filter-price').addEventListener('change', applyFilters);
    document.getElementById('filter-sort').addEventListener('change', applyFilters);
    
    // Réinitialiser les filtres
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Vue (grille/liste)
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            toggleView(view);
        });
    });
}

// Effectuer une recherche
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    currentFilters.query = query;
    currentPage = 1;
    loadListings();
}

// Appliquer les filtres
function applyFilters() {
    const category = document.getElementById('filter-category').value;
    const commune = document.getElementById('filter-commune').value;
    const maxPrice = document.getElementById('filter-price').value;
    const sort = document.getElementById('filter-sort').value;
    
    currentFilters = {
        ...currentFilters,
        category: category,
        commune: commune,
        maxPrice: maxPrice,
        sort: sort
    };
    
    currentPage = 1;
    loadListings();
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-commune').value = '';
    document.getElementById('filter-price').value = '';
    document.getElementById('filter-sort').value = 'recent';
    
    currentFilters = {};
    currentPage = 1;
    loadListings();
}

// Changer la vue (grille/liste)
function toggleView(view) {
    currentView = view;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Mettre à jour la grille
    const grid = document.getElementById('all-listings');
    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// Charger les annonces
function loadListings() {
    const container = document.getElementById('all-listings');
    App.showLoader(container);
    
    // Rechercher les annonces avec les filtres
    const query = currentFilters.query || '';
    const allListings = StorageManager.searchListings(query, currentFilters);
    
    // Mettre à jour le compteur
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `(${allListings.length})`;
    }
    
    // Vérifier si des résultats existent
    if (allListings.length === 0) {
        App.showEmptyMessage(container, 'Aucune annonce ne correspond à vos critères');
        
        // Vider la pagination
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        return;
    }
    
    // Paginer les résultats
    const paginatedData = App.paginate(allListings, currentPage, 12);
    
    // Afficher les annonces
    container.innerHTML = '';
    paginatedData.items.forEach(listing => {
        const card = App.createListingCard(listing);
        container.appendChild(card);
    });
    
    // Créer la pagination
    const paginationContainer = document.getElementById('pagination');
    if (paginationContainer && paginatedData.totalPages > 1) {
        paginationContainer.innerHTML = '';
        const pagination = App.createPagination(
            paginatedData.totalPages,
            currentPage,
            (page) => {
                currentPage = page;
                loadListings();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        );
        paginationContainer.appendChild(pagination);
    } else if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}
