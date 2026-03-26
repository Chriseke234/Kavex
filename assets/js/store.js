/**
 * Kavex Dynamic Store Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const slug = getStoreSlug();
    if (!slug) {
        window.location.href = '/pages/marketplace/products.html';
        return;
    }
    loadStoreData(slug);
});

function getStoreSlug() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    return params.get('slug');
}

async function loadStoreData(slug) {
    try {
        // 1. Fetch Seller Profile
        const { data: seller, error: sError } = await supabase
            .from('seller_profiles')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url, kyb_status, created_at)
            `)
            .eq('store_slug', slug)
            .single();

        if (sError || !seller) throw new Error("Store not found");

        renderStoreHeader(seller);
        renderStoreAbout(seller);

        // 2. Fetch Products
        const { data: products, error: pError } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', seller.id)
            .eq('status', 'active');

        if (!pError) renderProducts(products, seller.currency || 'NGN');

        // 3. Fetch Reviews
        const { data: reviews, error: rError } = await supabase
            .from('reviews')
            .select(`
                *,
                buyer:buyer_id (full_name, company_name)
            `)
            .eq('seller_id', seller.id)
            .order('created_at', { ascending: false });

        if (!rError) renderReviews(reviews);

    } catch (err) {
        console.error(err);
        document.querySelector('main').innerHTML = `<div class="container py-10 text-center"><h2>${err.message}</h2><a href="/pages/marketplace/products.html" class="btn btn-primary mt-2">Back to Marketplace</a></div>`;
    }
}

function renderStoreHeader(seller) {
    document.title = `${seller.store_name} | Kavex Store`;
    document.getElementById('store-name').textContent = seller.store_name;
    document.getElementById('store-logo').src = seller.profiles.avatar_url || 'https://via.placeholder.com/120';
    
    if (seller.profiles.kyb_status === 'approved') {
        document.getElementById('verified-badge').classList.remove('hidden');
    }

    document.getElementById('store-location').textContent = `📍 Nigeria`;
    document.getElementById('store-rating').textContent = `⭐ ${seller.rating_avg.toFixed(1)} (${seller.reviews_count} Reviews)`;

    // WhatsApp Link
    const whatsappBtn = document.getElementById('btn-primary');
    whatsappBtn.onclick = () => {
        const phone = seller.profiles.phone || '+2348000000000';
        const msg = encodeURIComponent(`Hi, I'm interested in sourcing from your Kavex store: ${seller.store_name}`);
        window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${msg}`, '_blank');
    };
}

function renderStoreAbout(seller) {
    document.getElementById('store-desc').textContent = seller.description || "No description provided.";
    document.getElementById('kyb-status').textContent = seller.profiles.kyb_status.charAt(0).toUpperCase() + seller.profiles.kyb_status.slice(1);
    const date = new Date(seller.profiles.created_at);
    document.getElementById('joined-date').textContent = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function renderProducts(products, currency) {
    const grid = document.getElementById('store-products-grid');
    const count = document.getElementById('product-count');
    
    count.textContent = `${products.length} items`;
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="text-muted">No products listed in this store yet.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card card';
        card.onclick = () => window.location.href = `/pages/marketplace/product-detail.html?id=${p.id}`;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${p.title}">
            </div>
            <div class="product-info p-1-5">
                <span class="fs-xs text-muted">${p.category}</span>
                <h4 class="mb-0-5">${p.title}</h4>
                <div class="pricing mt-1">
                    <span class="price-val">${currency} ${p.price_range || 'Contact'}</span>
                    <span class="price-unit">/${p.unit || 'unit'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderReviews(reviews) {
    const box = document.getElementById('store-reviews');
    if (reviews.length === 0) return;

    box.innerHTML = '';
    reviews.forEach(r => {
        const div = document.createElement('div');
        div.className = 'review-item border-bottom pb-1-5 mb-1-5';
        div.innerHTML = `
            <div class="flex justify-between items-center mb-0-5">
                <div class="stars">${'⭐'.repeat(r.rating)}</div>
                <span class="fs-xs text-muted">${new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p class="fs-sm mb-1">${r.comment}</p>
            <div class="fs-xs font-bold">${r.buyer?.full_name || 'Verified Buyer'}</div>
            <div class="fs-xs text-muted">${r.buyer?.company_name || ''}</div>
        `;
        box.appendChild(div);
    });
}
