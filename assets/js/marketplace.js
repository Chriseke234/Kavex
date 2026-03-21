const PRODUCTS = [
    {
        id: 1,
        title: "Premium Grade A Dried Ginger (Split)",
        category: "Agriculture & Food",
        price: 850000,
        originalPrice: 950000,
        moq: 50,
        unit: "ton",
        seller: "Abuja Farm Hub",
        location: "Abuja",
        isVerified: true,
        rating: 4.8,
        reviews: 124,
        image: "https://picsum.photos/seed/ginger/300/200",
        tags: ["export", "organic"]
    },
    {
        id: 2,
        title: "Organic Raw Cashew Nuts (High KOR)",
        category: "Agriculture & Food",
        price: 1200000,
        originalPrice: 1350000,
        moq: 100,
        unit: "ton",
        seller: "Ogbomosho Cashew Ltd",
        location: "Oyo",
        isVerified: true,
        rating: 4.9,
        reviews: 89,
        image: "https://picsum.photos/seed/cashew/300/200",
        tags: ["bulk", "nut"]
    },
    {
        id: 3,
        title: "Refined Palm Oil (Low FFA)",
        category: "Agriculture & Food",
        price: 15000,
        originalPrice: 18000,
        moq: 200,
        unit: "litre",
        seller: "Owerri Oil Palms",
        location: "Imo",
        isVerified: true,
        rating: 4.7,
        reviews: 56,
        image: "https://picsum.photos/seed/palmoil/300/200",
        tags: ["cooking", "industrial"]
    },
    {
        id: 4,
        title: "Traditional Hand-Woven Ankara Fabric (Premium)",
        category: "Textiles & Fashion",
        price: 2500,
        originalPrice: 3200,
        moq: 10,
        unit: "yard",
        seller: "Olu & Associates",
        location: "Lagos",
        isVerified: true,
        rating: 5.0,
        reviews: 210,
        image: "https://picsum.photos/seed/ankara/300/200",
        tags: ["handmade", "fashion"]
    },
    {
        id: 5,
        title: "Raw Unrefined Shea Butter (Export Quality)",
        category: "Beauty & Wellness",
        price: 4500,
        originalPrice: 5500,
        moq: 50,
        unit: "kg",
        seller: "Niger Shea Collective",
        location: "Niger",
        isVerified: true,
        rating: 4.6,
        reviews: 43,
        image: "https://picsum.photos/seed/shea/300/200",
        tags: ["skincare", "natural"]
    },
    {
        id: 6,
        title: "Premium Cocoa Beans (Fermented)",
        category: "Agriculture & Food",
        price: 2800000,
        originalPrice: 3100000,
        moq: 500,
        unit: "ton",
        seller: "Akure Cocoa Exp",
        location: "Ondo",
        isVerified: true,
        rating: 4.8,
        reviews: 156,
        image: "https://picsum.photos/seed/cocoa/300/200",
        tags: ["chocolate", "commodity"]
    },
    {
        id: 7,
        title: "Dried Hibiscus Flowers (Sifted)",
        category: "Agriculture & Food",
        price: 3200,
        originalPrice: 4000,
        moq: 100,
        unit: "kg",
        seller: "Kano Hibiscus Hub",
        location: "Kano",
        isVerified: true,
        rating: 4.7,
        reviews: 78,
        image: "https://picsum.photos/seed/hibiscus/300/200",
        tags: ["tea", "export"]
    },
    {
        id: 8,
        title: "Handmade Leather Sandals (Oyo-Style)",
        category: "Textiles & Fashion",
        price: 7500,
        originalPrice: 9000,
        moq: 50,
        unit: "pair",
        seller: "Ibadan Leatherworks",
        location: "Oyo",
        isVerified: false,
        rating: 4.5,
        reviews: 32,
        image: "https://picsum.photos/seed/leather/300/200",
        tags: ["footwear", "craft"]
    },
    {
        id: 9,
        title: "Whole Bitter Kola (Garcina Kola)",
        category: "Raw Materials",
        price: 12000,
        originalPrice: 15000,
        moq: 20,
        unit: "kg",
        seller: "Edo Forest Resources",
        location: "Edo",
        isVerified: true,
        rating: 4.4,
        reviews: 19,
        image: "https://picsum.photos/seed/bitterkola/300/200",
        tags: ["medicinal", "herbal"]
    },
    {
        id: 10,
        title: "Dried Red Chili Pepper (Habanero)",
        category: "Agriculture & Food",
        price: 5500,
        originalPrice: 6500,
        moq: 50,
        unit: "kg",
        seller: "Kaduna Spice Co",
        location: "Kaduna",
        isVerified: true,
        rating: 4.8,
        reviews: 67,
        image: "https://picsum.photos/seed/pepper/300/200",
        tags: ["spice", "hot"]
    },
    {
        id: 11,
        title: "Large White Sesame Seeds (99% Purity)",
        category: "Agriculture & Food",
        price: 1400000,
        originalPrice: 1600000,
        moq: 100,
        unit: "ton",
        seller: "Benue Agri-Group",
        location: "Benue",
        isVerified: true,
        rating: 4.9,
        reviews: 112,
        image: "https://picsum.photos/seed/sesame/300/200",
        tags: ["oilseed", "export"]
    },
    {
        id: 12,
        title: "Roasted Groundnuts (Bottled)",
        category: "Agriculture & Food",
        price: 1800,
        originalPrice: 2200,
        moq: 120,
        unit: "bottle",
        seller: "Kwara Foods",
        location: "Kwara",
        isVerified: false,
        rating: 4.6,
        reviews: 45,
        image: "https://picsum.photos/seed/groundnut/300/200",
        tags: ["snack", "wholesale"]
    }
];

let currentView = 'grid';
let activeFilters = {
    search: '',
    categories: [],
    minPrice: 0,
    maxPrice: Infinity,
    moq: 'Any',
    locations: [],
    verifiedOnly: false,
    sort: 'relevance'
};

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(PRODUCTS);
    initMarketplaceListeners();
});

function initMarketplaceListeners() {
    // View Toggles
    document.querySelector('#grid-view-btn').addEventListener('click', () => toggleView('grid'));
    document.querySelector('#list-view-btn').addEventListener('click', () => toggleView('list'));

    // Sort Dropdown
    document.querySelector('#sort-select').addEventListener('change', (e) => {
        activeFilters.sort = e.target.value;
        applyFilters();
    });

    // Search Listeners
    document.querySelector('#search-btn')?.addEventListener('click', applyFilters);
    document.querySelector('#search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    // Apply Filter Button
    document.querySelector('#apply-filters-btn').addEventListener('click', applyFilters);

    // Live filtering
    document.querySelectorAll('input[name="category"], input[name="location"], #verified-only').forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    document.querySelectorAll('#min-price, #max-price, #moq-select').forEach(input => {
        input.addEventListener('input', applyFilters);
    });

    // Reset Filters Link
    document.querySelector('#reset-filters').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#filter-form').reset();
        activeFilters = {
            search: '',
            categories: [],
            minPrice: 0,
            maxPrice: Infinity,
            moq: 'Any',
            locations: [],
            verifiedOnly: false,
            sort: 'relevance'
        };
        applyFilters();
    });
}

function toggleView(view) {
    currentView = view;
    const container = document.querySelector('#products-container');
    const gridBtn = document.querySelector('#grid-view-btn');
    const listBtn = document.querySelector('#list-view-btn');

    if (view === 'grid') {
        container.className = 'products-grid';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        container.className = 'products-list';
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    }
    applyFilters(); // Re-render in new view
}

function applyFilters() {
    const searchVal = document.querySelector('#search-input').value.toLowerCase();
    const verifiedOnly = document.querySelector('#verified-only').checked;
    const moqVal = document.querySelector('#moq-select').value;
    const minP = parseFloat(document.querySelector('#min-price').value) || 0;
    const maxP = parseFloat(document.querySelector('#max-price').value) || Infinity;

    // Get checked categories
    const categoryChecks = document.querySelectorAll('input[name="category"]:checked');
    const categories = Array.from(categoryChecks).map(c => c.value);

    // Get checked locations
    const locationChecks = document.querySelectorAll('input[name="location"]:checked');
    const locations = Array.from(locationChecks).map(l => l.value);

    const filtered = PRODUCTS.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchVal) || p.seller.toLowerCase().includes(searchVal);
        const matchesCategory = categories.length === 0 || categories.includes(p.category);
        const matchesVerified = !verifiedOnly || p.isVerified;
        const matchesPrice = p.price >= minP && p.price <= maxP;
        const matchesLocation = locations.length === 0 || locations.includes(p.location);
        
        let matchesMoq = true;
        if (moqVal !== 'Any') {
            const minMoq = parseInt(moqVal.replace('+', ''));
            matchesMoq = p.moq >= minMoq;
        }

        return matchesSearch && matchesCategory && matchesVerified && matchesPrice && matchesLocation && matchesMoq;
    });

    // Sort
    const sorted = sortData(filtered, activeFilters.sort);

    renderProducts(sorted);
}

function sortData(data, criteria) {
    const sorted = [...data];
    if (criteria === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
    } else if (criteria === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
    } else if (criteria === 'newest') {
        sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
}

function renderProducts(products) {
    const container = document.querySelector('#products-container');
    const countEl = document.querySelector('#results-count');
    countEl.textContent = `Showing ${products.length} products`;

    if (products.length === 0) {
        container.innerHTML = '<div class="no-results">No products found matching your filters.</div>';
        return;
    }

    container.innerHTML = products.map(p => {
        const discount = Math.round((1 - p.price / p.originalPrice) * 100);
        
        if (currentView === 'grid') {
            return `
                <div class="product-card">
                    <button class="wishlist-btn" aria-label="Add to Wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
                    </button>
                    <a href="/pages/marketplace/product-detail.html?id=${p.id}" class="product-link">
                        <div class="product-img-wrapper">
                            <img src="${p.image}" alt="${p.title}">
                        </div>
                        <div class="product-info">
                            <span class="cat-badge">${p.category}</span>
                            <h3 class="product-title">${p.title}</h3>
                            <div class="seller-info">
                                <span>${p.seller}</span>
                                ${p.isVerified ? '<svg class="verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"></path></svg>' : ''}
                                <span>• ${p.location}</span>
                            </div>
                            <div class="price-row">
                                <span class="current-price price-display" data-price-ngn="${p.price}">₦${p.price.toLocaleString()}</span>
                                <span class="original-price">₦${p.originalPrice.toLocaleString()}</span>
                                <span class="discount-percentage">-${discount}%</span>
                                <span class="moq-info">MOQ: ${p.moq} ${p.unit}s</span>
                            </div>
                            <div class="rating-row">
                                <span class="stars">★★★★★</span>
                                <span class="reviews-count">(${p.reviews})</span>
                            </div>
                        </div>
                    </a>
                    <div class="product-actions" style="padding: 0 1rem 1rem;">
                        <button class="btn btn-ghost btn-sm">Request Quote</button>
                        <a href="/pages/marketplace/product-detail.html?id=${p.id}" class="btn btn-primary btn-sm" style="text-align: center; display: flex; align-items: center; justify-content: center;">View Product</a>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="product-card">
                    <button class="wishlist-btn" aria-label="Add to Wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
                    </button>
                    <div class="product-img-wrapper">
                        <img src="${p.image}" alt="${p.title}">
                    </div>
                    <div class="product-info">
                        <div class="info-main">
                            <span class="cat-badge">${p.category}</span>
                            <h3 class="product-title" style="height: auto; -webkit-line-clamp: 1;">${p.title}</h3>
                            <div class="seller-info">
                                <span>${p.seller}</span>
                                ${p.isVerified ? '<svg class="verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"></path></svg>' : ''}
                                <span>• ${p.location}</span>
                            </div>
                            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1rem;">Export quality Nigerian ${p.title.toLowerCase()}. Reliable supply chain, consistent grade, and competitive bulk pricing.</p>
                            <div class="rating-row">
                                <span class="stars">★★★★★</span>
                                <span class="reviews-count">(${p.reviews} reviews)</span>
                            </div>
                        </div>
                        <div class="info-side">
                            <div class="price-row">
                                <div class="current-price price-display" data-price-ngn="${p.price}">₦${p.price.toLocaleString()}</div>
                                <span class="original-price">₦${p.originalPrice.toLocaleString()}</span>
                                <span class="moq-info">MOQ: ${p.moq} units</span>
                            </div>
                            <div class="product-actions" style="grid-template-columns: 1fr;">
                                <button class="btn btn-primary btn-sm">View Product</button>
                                <button class="btn btn-ghost btn-sm">Request Quote</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // Re-initialize currency switcher for new elements if existing
    if (window.updatePrices) window.updatePrices(document.querySelector('#currency-select').value);
}
