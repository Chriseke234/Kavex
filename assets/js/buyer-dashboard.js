/**
 * Kavex Buyer Dashboard Logic
 */

let supabase = window.kavexSupabase.supabase;
let currentUser = null;
let buyerProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const auth = await window.kavexAuth.requireAuth('buyer');
    if (!auth) return;
    
    currentUser = auth.user;
    buyerProfile = auth.profile;
    
    // 2. Initialize UI
    initDashboardUI();
    loadDashboardStats();
    
    // 3. Default Section
    switchSection('overview');
});

function initDashboardUI() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            switchSection(sectionId);
            
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    document.querySelector('#topbar-user-name').textContent = currentUser.user_metadata.full_name || "Buyer";
}

async function switchSection(id) {
    document.querySelectorAll('.section-container').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`#${id}-section`);
    if (target) target.classList.add('active');

    switch(id) {
        case 'overview':
            loadOverview();
            break;
        case 'orders':
            loadMyOrders();
            break;
        case 'rfq':
            loadRFQs();
            break;
        case 'saved':
            loadSavedSellers();
            break;
        case 'invoices':
            loadInvoices();
            break;
    }
}

async function loadDashboardStats() {
    const { data: orders } = await supabase.from('orders').select('total_amount').eq('buyer_id', currentUser.id);
    const { count: activeRfqs } = await supabase.from('rfq_requests').select('*', { count: 'exact', head: true }).eq('buyer_id', currentUser.id);
    
    if (orders) {
        document.querySelector('#stat-total-orders').textContent = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        document.querySelector('#stat-total-spent').textContent = `₦${totalSpent.toLocaleString()}`;
    }
    if (activeRfqs !== null) {
        document.querySelector('#stat-active-rfqs').textContent = activeRfqs;
    }
}

/**
 * SECTION: OVERVIEW
 */
async function loadOverview() {
    // Load recent orders snippet
    const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(3);

    const list = document.querySelector('#recent-orders-list');
    if (list && recent) {
        list.innerHTML = recent.map(o => `
            <div class="flex justify-between items-center fs-sm p-1 border-bottom">
                <span class="fw-bold">#${o.order_ref}</span>
                <span class="status-pill status-pending btn-xs">${o.status}</span>
                <span>₦${o.total_amount?.toLocaleString()}</span>
            </div>
        `).join('') || '<p class="text-muted fs-xs">No recent orders.</p>';
    }

    // Load recommendations (Mocking products)
    const recGrid = document.querySelector('#recommended-products');
    if (recGrid) {
        recGrid.innerHTML = `
            <div class="card p-1 fs-xs">
                <img src="https://picsum.photos/100/100?1" class="w-full rounded mb-0-5">
                <div class="fw-bold">Raw Ginger</div>
                <div class="text-orange">₦8,500 / unit</div>
            </div>
            <div class="card p-1 fs-xs">
                <img src="https://picsum.photos/100/100?2" class="w-full rounded mb-0-5">
                <div class="fw-bold">Cocoa Beans</div>
                <div class="text-orange">₦12,000 / unit</div>
            </div>
        `;
    }
}

/**
 * SECTION: MY ORDERS
 */
async function loadMyOrders() {
    const { data: orders } = await supabase
        .from('orders')
        .select('*, seller:seller_profiles(*)')
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false });

    const container = document.querySelector('#orders-grid');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `<div class="p-3 text-center card">No orders found. Check the marketplace to get started.</div>`;
        return;
    }

    container.innerHTML = orders.map(o => `
        <div class="card p-2 flex justify-between items-center">
            <div>
                <div class="fs-xs text-muted mb-0-5">REF: ${o.order_ref} | ${new Date(o.created_at).toLocaleDateString()}</div>
                <div class="fw-bold fs-md">${o.seller?.store_name || 'Seller'}</div>
                <div class="fs-sm text-muted">Mixed Bulk Items</div>
            </div>
            <div class="text-right">
                <div class="fw-bold fs-lg">₦${o.total_amount?.toLocaleString()}</div>
                <span class="status-pill status-${o.status === 'shipped' ? 'verified' : 'pending'}">${o.status}</span>
                <div class="mt-1 flex gap-0-5">
                    <button class="btn btn-ghost btn-xs">Track</button>
                    ${o.status === 'shipped' ? 
                        `<button class="btn btn-primary btn-xs" onclick="openConfirmModal('${o.id}')">Confirm Receipt</button>` : 
                        `<button class="btn btn-primary btn-xs" disabled>Confirm Receipt</button>`}
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * SECTION: RFQ MANAGER
 */
async function loadRFQs() {
    const { data: rfqs } = await supabase
        .from('rfq_requests')
        .select('*')
        .eq('buyer_id', currentUser.id);

    const tbody = document.querySelector('#rfq-table-body');
    if (!tbody) return;

    if (!rfqs || rfqs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-2">No active RFQs. Create one to get quotes from verified sellers.</td></tr>`;
        return;
    }

    tbody.innerHTML = rfqs.map(r => `
        <tr>
            <td>#${r.id.slice(0,8)}</td>
            <td class="fw-bold">${r.product_name}</td>
            <td>${r.quantity}</td>
            <td>0 Responses</td>
            <td><span class="status-pill status-pending">Open</span></td>
            <td><button class="btn btn-ghost btn-xs">View Quotes</button></td>
        </tr>
    `).join('');
}

/**
 * RFQ PANEL
 */
window.openRFQPanel = () => document.getElementById('rfq-panel').classList.add('open');
window.closeRFQPanel = () => document.getElementById('rfq-panel').classList.remove('open');

document.getElementById('rfq-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Broadcasting...';

    try {
        const { error } = await supabase.from('rfq_requests').insert([{
            buyer_id: currentUser.id,
            product_name: formData.get('product_name'),
            quantity: formData.get('quantity'),
            target_price: formData.get('target_price'),
            deadline: formData.get('deadline'),
            requirements: formData.get('requirements'),
            status: 'open'
        }]);

        if (error) throw error;
        alert("RFQ Published! Verified sellers will start quoting soon.");
        e.target.reset();
        closeRFQPanel();
        loadRFQs();
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Broadcast RFQ';
    }
});

/**
 * ESCROW CONFIRMATION
 */
let activeOrderId = null;
window.openConfirmModal = (id) => {
    activeOrderId = id;
    document.getElementById('confirm-modal').style.display = 'flex';
};
window.closeConfirmModal = () => {
    document.getElementById('confirm-modal').style.display = 'none';
};

/**
 * SECTION: INVOICES
 */
async function loadInvoices() {
    const { data: invoices } = await supabase
        .from('orders')
        .select('*, seller:seller_profiles(store_name)')
        .eq('buyer_id', currentUser.id)
        .eq('status', 'delivered');

    const tbody = document.querySelector('#invoices-table-body');
    if (!tbody) return;

    if (!invoices || invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-2">No invoices available. Invoices are generated for delivered orders.</td></tr>`;
        return;
    }

    tbody.innerHTML = invoices.map(i => `
        <tr>
            <td>#${i.order_ref}</td>
            <td>${new Date(i.created_at).toLocaleDateString()}</td>
            <td class="fw-bold">₦${i.total_amount?.toLocaleString()}</td>
            <td>${i.seller?.store_name}</td>
            <td><button class="btn btn-ghost btn-xs">Download PDF</button></td>
        </tr>
    `).join('');
}

/**
 * SECTION: SAVED SELLERS
 */
async function loadSavedSellers() {
    // Placeholder for saved sellers logic
    const grid = document.querySelector('#saved-sellers-grid');
    if (grid) grid.innerHTML = '<p class="text-muted p-2">You haven\'t saved any sellers yet.</p>';
}

document.getElementById('final-confirm-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('final-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        // 1. Update Order
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'delivered', escrow_status: 'released' })
            .eq('id', activeOrderId);

        if (orderError) throw orderError;

        // 2. Fetch order to get seller and amount for payout
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', activeOrderId)
            .single();

        // 3. Create Payout entry for seller
        await supabase
            .from('payouts')
            .insert([{
                seller_id: order.seller_id,
                amount: order.total_amount,
                status: 'available',
                order_id: order.id
            }]);

        alert("Payment released successfully!");
        closeConfirmModal();
        loadMyOrders();
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Release Escrow';
    }
});
