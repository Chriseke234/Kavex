/**
 * Kavex Admin Dashboard Logic
 */

let currentSection = 'dashboard';
let stats = { gmv: 0, sellers: 0, buyers: 0 };

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Strict Auth Check
    const data = await window.kavexAuth.requireAuth('admin');
    if (!data) return; 
    const user = data.profile;

    document.getElementById('admin-name').textContent = user.full_name || 'Administrator';

    // 2. Initialize UI
    initNavigation();
    loadDashboardData();
    initSettings();

    // 3. Sign Out
    document.getElementById('admin-signout').addEventListener('click', async () => {
        await window.kavexAuth.signOut();
    });
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Handle Hash Navigation
    if (window.location.hash) {
        const section = window.location.hash.substring(1);
        if (document.getElementById(`section-${section}`)) {
            switchSection(section);
        }
    }
}

function switchSection(sectionId) {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Update Content
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');

    // Update Title
    const titles = {
        dashboard: 'Dashboard Overview',
        'kyb-review': 'KYB Verification Queue',
        users: 'User Management',
        products: 'Product Approvals',
        settings: 'Platform Settings'
    };
    document.getElementById('section-title').textContent = titles[sectionId] || 'Admin';

    // Load Specific Data
    if (sectionId === 'kyb-review') loadKYBQueue();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'products') loadPendingProducts();
}

/**
 * DASHBOARD LOGIC
 */
async function loadDashboardData() {
    // Parallel fetches for speed
    const [
        { count: sellers },
        { count: buyers },
        { data: gmvData },
        { data: activities }
    ] = await Promise.all([
        window.kavexSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
        window.kavexSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        window.kavexSupabase.from('orders').select('total_amount').eq('status', 'delivered'),
        window.kavexSupabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(6)
    ]);

    // Update Stats
    document.getElementById('stat-sellers').textContent = sellers || 0;
    document.getElementById('stat-buyers').textContent = buyers || 0;
    
    const totalGMV = gmvData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    document.getElementById('stat-gmv').textContent = `₦${totalGMV.toLocaleString()}`;

    // Render Feed
    const feed = document.getElementById('activity-feed');
    feed.innerHTML = activities?.map(a => `
        <div class="activity-item">
            <strong>${a.title}</strong>: ${a.message}
            <div class="fs-xs text-muted">${new Date(a.created_at).toLocaleTimeString()}</div>
        </div>
    `).join('') || '<p class="text-muted">No recent activity.</p>';

    renderChart();
}

function renderChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Revenue (₦)',
                data: [120000, 190000, 300000, 250000],
                borderColor: '#001f3f',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0, 31, 63, 0.05)'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

/**
 * KYB REVIEW LOGIC
 */
async function loadKYBQueue() {
    const { data: sellers, error } = await window.kavexSupabase
        .from('profiles')
        .select('*, seller_profiles(*)')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

    const tbody = document.getElementById('kyb-table-body');
    tbody.innerHTML = sellers?.map(s => `
        <tr>
            <td>${s.full_name}</td>
            <td>${s.seller_profiles?.[0]?.store_name || 'N/A'}</td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
            <td>2 Documents</td>
            <td><span class="badge ${s.kyb_status === 'pending' ? 'badge-orange' : 'badge-green'}">${s.kyb_status}</span></td>
            <td><button class="btn btn-xs btn-outline" onclick="openKYBModal('${s.id}')">Review</button></td>
        </tr>
    `).join('') || '<tr><td colspan="6" class="text-center">No sellers found.</td></tr>';
}

window.openKYBModal = async (sellerId) => {
    const { data: seller } = await window.kavexSupabase
        .from('profiles')
        .select('*, seller_profiles(*)')
        .eq('id', sellerId)
        .single();

    document.getElementById('modal-seller-name').textContent = seller.full_name;
    document.getElementById('modal-store-name').textContent = seller.seller_profiles[0].store_name;
    document.getElementById('modal-cac').textContent = seller.seller_profiles[0].cac_number || 'Pending';
    document.getElementById('modal-phone').textContent = seller.phone;
    
    // Document Links
    const cacBtn = document.getElementById('view-cac');
    const idBtn = document.getElementById('view-id');
    
    if (seller.seller_profiles[0].cac_cert_url) {
        cacBtn.href = seller.seller_profiles[0].cac_cert_url;
        cacBtn.target = "_blank";
    } else {
        cacBtn.onclick = (e) => { e.preventDefault(); alert("No CAC certificate uploaded."); };
    }

    if (seller.seller_profiles[0].director_id_url) {
        idBtn.href = seller.seller_profiles[0].director_id_url;
        idBtn.target = "_blank";
    } else {
        idBtn.onclick = (e) => { e.preventDefault(); alert("No ID document uploaded."); };
    }

    const modal = document.getElementById('kyb-modal');
    modal.classList.remove('hidden');

    // Close Modal
    modal.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');

    // Action Buttons
    document.getElementById('btn-approve-kyb').onclick = () => kybAction(sellerId, 'approve');
    document.getElementById('btn-reject-kyb').onclick = () => kybAction(sellerId, 'reject');
};

async function kybAction(sellerId, action) {
    try {
        const kyb_status = action === 'approve' ? 'approved' : 'rejected';
        const { error } = await window.kavexSupabase
            .from('profiles')
            .update({ kyb_status })
            .eq('id', sellerId);

        if (error) throw error;
        
        alert(`Seller ${action}d successfully.`);
        document.getElementById('kyb-modal').classList.add('hidden');
        loadKYBQueue();
    } catch (err) {
        alert(err.message);
    }
}

/**
 * PRODUCT APPROVALS
 */
async function loadPendingProducts() {
    const { data: products } = await window.kavexSupabase
        .from('products')
        .select('*, seller_profiles(store_name)')
        .eq('is_approved', false);

    const container = document.getElementById('product-list');
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-muted p-4">No products pending approval.</p>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="card p-1-5">
            <img src="${p.images?.[0] || 'https://via.placeholder.com/200'}" class="rounded mb-1 w-full aspect-square object-cover">
            <h5 class="mb-0-5 truncate">${p.name}</h5>
            <p class="fs-xs text-muted mb-1">${p.seller_profiles?.store_name}</p>
            <div class="flex gap-0-5">
                <button class="btn btn-xs btn-primary flex-1" onclick="approveProduct('${p.id}')">Approve</button>
                <button class="btn btn-xs btn-outline-red" onclick="rejectProduct('${p.id}')">✕</button>
            </div>
        </div>
    `).join('');
}

window.approveProduct = async (id) => {
    const { error } = await window.kavexSupabase.from('products').update({ is_approved: true }).eq('id', id);
    if (error) alert(error.message);
    else loadPendingProducts();
};

window.rejectProduct = async (id) => {
    if (!confirm("Are you sure you want to reject this product?")) return;
    const { error } = await window.kavexSupabase.from('products').delete().eq('id', id);
    if (error) alert(error.message);
    else loadPendingProducts();
};

/**
 * USERS LOGIC
 */
async function loadUsers() {
    const { data: users } = await window.kavexSupabase.from('profiles').select('*').limit(50);
    renderUserTable(users);

    // Add search listener once
    const searchInput = document.getElementById('user-search');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.dataset.listener = 'true';
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = users.filter(u => 
                u.full_name?.toLowerCase().includes(term) || 
                u.email?.toLowerCase().includes(term)
            );
            renderUserTable(filtered);
        });
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = users?.map(u => `
        <tr>
            <td>${u.full_name}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.role === 'seller' ? 'badge-navy' : 'badge-gray'}">${u.role}</span></td>
            <td>${new Date(u.created_at).toLocaleDateString()}</td>
            <td>Active</td>
            <td><button class="btn btn-xs btn-outline-red">Suspend</button></td>
        </tr>
    `).join('') || '';
}

/**
 * SETTINGS LOGIC
 */
async function initSettings() {
    const { data: settings } = await window.kavexSupabase.from('platform_settings').select('*').single();
    if (!settings) return;

    document.getElementById('setting-commission').value = settings.commission_rate;
    document.getElementById('commission-val').textContent = `${settings.commission_rate}%`;
    document.getElementById('setting-announcement').value = settings.announcement_banner || '';
    document.getElementById('setting-announcement-active').checked = settings.is_announcement_active;
    document.getElementById('setting-maintenance').checked = settings.is_maintenance_mode;

    document.getElementById('setting-commission').addEventListener('input', (e) => {
        document.getElementById('commission-val').textContent = `${e.target.value}%`;
    });

    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        const updates = {
            commission_rate: parseFloat(document.getElementById('setting-commission').value),
            announcement_banner: document.getElementById('setting-announcement').value,
            is_announcement_active: document.getElementById('setting-announcement-active').checked,
            is_maintenance_mode: document.getElementById('setting-maintenance').checked,
            updated_at: new Date()
        };

        const { error } = await window.kavexSupabase.from('platform_settings').update(updates).eq('id', settings.id);
        if (error) alert(error.message);
        else alert("Platform settings updated!");
    });
}
