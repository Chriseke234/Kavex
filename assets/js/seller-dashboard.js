/**
 * Kavex Seller Dashboard Logic
 * SPA Section Switching | Supabase Sync | Chart.js Integration
 */

let supabase = window.kavexSupabase.supabase;
let currentUser = null;
let sellerProfile = null;
let revenueChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const auth = await window.kavexAuth.requireAuth('seller');
    if (!auth) return;
    
    currentUser = auth.user;
    sellerProfile = auth.profile;
    
    // 2. Initialize UI
    initDashboardUI();
    loadStoreHeader();
    
    // 3. Load Default Section (Overview)
    switchSection('overview');
});

function initDashboardUI() {
    // Nav Click Listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            switchSection(sectionId);
            
            // UI active state
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Mobile Sidebar Toggle (Optional but good practice)
    const mobileBtn = document.querySelector('#mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            document.querySelector('#sidebar').classList.toggle('open');
        });
    }
}

async function loadStoreHeader() {
    if (!sellerProfile) return;
    document.querySelector('#sidebar-store-name').textContent = sellerProfile.store_name || "Official Store";
    document.querySelector('#topbar-user-name').textContent = currentUser.user_metadata.full_name || "Seller";
    
    // Fetch store logo if exists
    const { data: store } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    
    if (store && store.logo_url) {
        document.querySelector('#sidebar-store-logo').src = store.logo_url;
    }
}

async function switchSection(id) {
    // Hide all
    document.querySelectorAll('.section-container').forEach(s => s.classList.remove('active'));
    
    // Show target
    const target = document.querySelector(`#${id}-section`);
    if (target) target.classList.add('active');

    // Section-specific loaders
    switch(id) {
        case 'overview':
            loadOverviewData();
            break;
        case 'products':
            loadSellerProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'rfq':
            loadRFQs();
            break;
        case 'payouts':
            loadPayouts();
            break;
        case 'kyb':
            loadKYBStatus();
            break;
        case 'ai-listing':
            // Logic handled by seller-ai-generator.js
            break;
    }
}

/** 
 * SECTION: RFQs
 */
async function loadRFQs() {
    const { data: rfqs } = await supabase
        .from('rfq_requests')
        .select('*')
        .order('created_at', { ascending: false });

    const tbody = document.querySelector('#rfq-table-body');
    if (!tbody) return;

    if (!rfqs || rfqs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-2">No sourcing requests found currently.</td></tr>`;
        return;
    }

    tbody.innerHTML = rfqs.map(r => `
        <tr>
            <td>Buyer Business</td>
            <td class="fw-bold">${r.product_name}</td>
            <td>${r.quantity} units</td>
            <td>₦${r.target_price?.toLocaleString()}</td>
            <td>${new Date(r.deadline).toLocaleDateString()}</td>
            <td><button class="btn btn-primary btn-xs">Reply</button></td>
        </tr>
    `).join('');
}

/**
 * SECTION: PAYOUTS
 */
async function loadPayouts() {
    const { data: payouts } = await supabase
        .from('payouts')
        .select('*')
        .eq('seller_id', currentUser.id);

    const tbody = document.querySelector('#payout-table-body');
    if (!tbody) return;

    if (!payouts || payouts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-2">No payout history found.</td></tr>`;
        return;
    }

    tbody.innerHTML = payouts.map(p => `
        <tr>
            <td>${new Date(p.created_at).toLocaleDateString()}</td>
            <td>Bank Transfer</td>
            <td class="fw-bold">₦${p.amount.toLocaleString()}</td>
            <td><span class="status-pill status-${p.status}">${p.status}</span></td>
        </tr>
    `).join('');
}

/** 
 * SECTION: OVERVIEW & ANALYTICS
 */
async function loadOverviewData() {
    initRevenueChart();
}

async function loadAnalytics() {
    initCategoryChart();
    initTopProductsChart();
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Agriculture', 'Textiles', 'Electronics'],
            datasets: [{
                data: [45, 25, 30],
                backgroundColor: ['#FF6B00', '#0A0A0A', '#F8FAFC'],
                borderWidth: 0
            }]
        }
    });
}

function initTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Raw Ginger', 'Cocoa', 'Sesame'],
            datasets: [{
                label: 'Sales (₦)',
                data: [120000, 95000, 78000],
                backgroundColor: '#0A0A0A'
            }]
        },
        options: { indexAxis: 'y' }
    });
}

/**
 * SECTION: ORDERS
 */
async function loadOrders() {
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', currentUser.id)
        .order('created_at', { ascending: false });

    const tbody = document.querySelector('#orders-table-body');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-2">No orders found matching this criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td class="fw-bold">#${o.order_ref}</td>
            <td>Buyer Business</td>
            <td>Multiple Items</td>
            <td class="fw-bold">₦${o.total_amount?.toLocaleString()}</td>
            <td><span class="status-pill status-pending">${o.status}</span></td>
            <td><button class="btn btn-ghost btn-xs">View Detail</button></td>
        </tr>
    `).join('');
}

/**
 * SECTION: KYB
 */
async function loadKYBStatus() {
    const { data: profile } = await supabase
        .from('profiles')
        .select('kyb_status')
        .eq('id', currentUser.id)
        .single();
    
    const badge = document.querySelector('#kyb-badge');
    if (badge && profile) {
        badge.textContent = `Status: ${profile.kyb_status.toUpperCase()}`;
        badge.className = `status-pill status-${profile.kyb_status}`;
    }
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `Day ${i+1}`),
            datasets: [{
                label: 'Revenue (₦)',
                data: Array.from({length: 30}, () => Math.floor(Math.random() * 50000)),
                borderColor: '#FF6B00',
                backgroundColor: 'rgba(255, 107, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f1f1' } },
                x: { grid: { display: false } }
            }
        }
    });
}

/**
 * SECTION: PRODUCTS
 */
async function loadSellerProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', currentUser.id);

    const tbody = document.querySelector('#product-table-body');
    if (!tbody) return;

    if (error) {
        tbody.innerHTML = `<tr><td colspan="8">Error loading products: ${error.message}</td></tr>`;
        return;
    }

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center p-2">No products found. Start by adding one!</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.images?.[0] || 'https://picsum.photos/50/50'}" width="40" height="40" class="rounded"></td>
            <td class="fw-bold">${p.title}</td>
            <td>${p.category}</td>
            <td class="text-orange">₦${Number(p.base_price || 0).toLocaleString()}</td>
            <td>${p.moq} units</td>
            <td>${p.stock || 0}</td>
            <td><span class="status-pill ${p.status === 'active' ? 'status-verified' : 'status-pending'}">${p.status}</span></td>
            <td>
                <button class="btn btn-ghost btn-xs" onclick="editProduct('${p.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

/**
 * PRODUCT PANEL LOGIC
 */
window.openProductPanel = function() {
    switchSection('ai-listing');
}

window.closeProductPanel = function() {
    document.getElementById('product-panel').classList.remove('open');
}

window.addPricingTier = function() {
    const container = document.getElementById('pricing-tiers-container');
    const tierDiv = document.createElement('div');
    tierDiv.className = 'form-grid-2 mb-1';
    tierDiv.innerHTML = `
        <input type="number" placeholder="Min Qty" class="tier-min" required>
        <input type="number" placeholder="Price (₦)" class="tier-price" required>
    `;
    container.appendChild(tierDiv);
}
