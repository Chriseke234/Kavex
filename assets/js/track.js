/**
 * Kavex Order Tracking Logic
 */

let supabase = window.kavexSupabase.supabase;
let currentOrder = null;
let timerId = null;

const STEPS = [
    { id: 'confirmed', title: 'Order Placed', desc: 'Order confirmed and payment received in escrow' },
    { id: 'held', title: 'Payment Secured', desc: 'Funds held safely, seller notified' },
    { id: 'processing', title: 'Processing', desc: 'Seller preparing your order' },
    { id: 'shipped', title: 'Handed to Carrier', desc: 'Picked up by logistics partner' },
    { id: 'in-transit', title: 'In Transit', desc: 'Your order is on its way' },
    { id: 'delivered', title: 'Delivered', desc: 'Awaiting your confirmation' }
];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        document.getElementById('track-input').value = ref;
        searchOrder();
    }
});

async function searchOrder() {
    const ref = document.getElementById('track-input').value.trim();
    if (!ref) return;

    // Reset UI
    document.getElementById('track-content').style.display = 'none';
    document.getElementById('track-error').style.display = 'none';
    if (timerId) clearInterval(timerId);

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .or(`order_ref.eq.${ref},id.eq.${ref}`)
        .single();

    if (error || !order) {
        document.getElementById('track-error').style.display = 'block';
        return;
    }

    currentOrder = order;
    renderTracking();
}

function renderTracking() {
    document.getElementById('track-content').style.display = 'block';
    document.getElementById('order-ref-badge').textContent = `#${currentOrder.order_ref}`;
    document.getElementById('carrier-name').textContent = currentOrder.shipping_method || "Standard Courier";
    document.getElementById('tracking-num').textContent = currentOrder.flw_ref?.slice(0, 12) || "Pending...";

    const container = document.getElementById('timeline-container');
    const currentIndex = STEPS.findIndex(s => s.id === currentOrder.status);
    
    // Status fallback: if not found, assume step 0 if confirmed
    const activeIdx = currentIndex === -1 ? (currentOrder.status === 'confirmed' ? 0 : 1) : currentIndex;

    container.innerHTML = STEPS.map((s, i) => {
        let statusClass = '';
        let circleContent = '';

        if (i < activeIdx) {
            statusClass = 'completed';
            circleContent = '✓';
        } else if (i === activeIdx) {
            statusClass = 'active';
            circleContent = '<div class="pulse-navy"></div>';
        }

        return `
            <div class="stepper-item ${statusClass}">
                <div class="step-circle">${circleContent}</div>
                <div class="step-content">
                    <div class="step-title">${s.title}</div>
                    ${i <= activeIdx ? `<div class="step-time">Updated: ${new Date(currentOrder.updated_at).toLocaleDateString()}</div>` : ''}
                    <div class="step-desc">${s.desc}</div>
                </div>
            </div>
        `;
    }).join('');

    // Show Confirm button if delivered or shipped
    if (['shipped', 'in-transit', 'delivered'].includes(currentOrder.status)) {
        document.getElementById('confirm-btn').style.display = 'block';
    }

    startCountdown();
}

function startCountdown() {
    const target = new Date(currentOrder.created_at);
    target.setDate(target.getDate() + 7); // Mock 7 day delivery

    function update() {
        const now = new Date();
        const diff = target - now;
        
        if (diff < 0) {
            document.getElementById('countdown').textContent = "Arriving Soon";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('countdown').textContent = `${d}d : ${h}h : ${m}m`;
    }

    update();
    timerId = setInterval(update, 60000);
}

/**
 * DISPUTE LOGIC
 */
window.openDisputeModal = () => document.getElementById('dispute-modal').style.display = 'flex';
window.closeDisputeModal = () => document.getElementById('dispute-modal').style.display = 'none';

document.getElementById('dispute-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const { error } = await supabase.from('disputes').insert([{
            order_id: currentOrder.id,
            buyer_id: currentOrder.buyer_id,
            issue_type: formData.get('issue_type'),
            description: formData.get('description'),
            status: 'open'
        }]);

        if (error) throw error;
        alert("Issue reported. Kavex support will review and contact you within 24 hours.");
        closeDisputeModal();
    } catch (err) {
        alert("Error: " + err.message);
    }
});

/**
 * ESCROW RE-USE (Confirm Receipt)
 */
window.closeConfirmModal = () => {
    document.getElementById('confirm-modal').style.display = 'none';
};

document.getElementById('confirm-btn')?.addEventListener('click', () => {
    document.getElementById('confirm-modal').style.display = 'flex';
});

document.getElementById('final-confirm-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('final-confirm-btn');
    btn.disabled = true;
    
    try {
        await supabase.from('orders').update({
            status: 'delivered',
            escrow_status: 'released'
        }).eq('id', currentOrder.id);
        
        alert("Thank you! Escrow funds have been released to the seller.");
        location.reload();
    } catch (e) {
        alert("Error: " + e.message);
        btn.disabled = false;
    }
});
