/**
 * Kavex Checkout Logic
 * Handles cart data, currency switching, shipping calcs, and Payment trigger
 */

let supabase = window.kavexSupabase.supabase;
let currentUser = null;
let currentCurrency = 'NGN';
let exchangeRates = { NGN: 1, USD: 0.00065, EUR: 0.0006, GBP: 0.0005 }; // Mock rates
let cartItems = [];
let shippingCost = 2500;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth & Data Init
    const auth = await window.kavexAuth.requireAuth('buyer');
    if (!auth) return;
    
    currentUser = auth.user;
    loadBuyerProfile();
    loadCart();

    // 2. UI listeners
    document.querySelector('#currency-selector').addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        renderTotals();
        renderLineItems();
    });

    document.querySelectorAll('.delivery-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            shippingCost = parseInt(opt.dataset.cost);
            renderTotals();
        });
    });

    document.querySelector('#pay-btn').addEventListener('click', startPayment);
});

async function loadBuyerProfile() {
    document.querySelector('#buyer-name').value = currentUser.user_metadata.full_name || "";
    document.querySelector('#buyer-phone').value = currentUser.user_metadata.phone || "";
    
    const { data } = await supabase.from('profiles').select('address').eq('id', currentUser.id).single();
    if (data?.address) document.querySelector('#buyer-address').value = data.address;
}

function loadCart() {
    // In a real app, this comes from localStorage or DB
    // Mocking a single large B2B item for now
    cartItems = [
        { id: 'p1', name: 'Raw Cashew Nuts (Premium)', qty: 50, price: 8500, image: 'https://picsum.photos/100/100?1' }
    ];
    renderLineItems();
    renderTotals();
}

function renderLineItems() {
    const container = document.querySelector('#line-items-container');
    container.innerHTML = cartItems.map(item => {
        const convertedPrice = item.price * exchangeRates[currentCurrency];
        return `
            <div class="line-item">
                <img src="${item.image}" class="rounded">
                <div>
                    <div class="fw-bold">${item.name}</div>
                    <div class="fs-sm text-muted">QTY: ${item.qty} units</div>
                </div>
                <div class="text-right">
                    <div class="fw-bold">${formatCurrency(convertedPrice * item.qty)}</div>
                    <div class="fs-xs text-muted">${formatCurrency(convertedPrice)} / unit</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTotals() {
    const subtotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const fee = subtotal * 0.025;
    const total = subtotal + fee + shippingCost;

    document.querySelector('#summary-subtotal').textContent = formatCurrency(subtotal * exchangeRates[currentCurrency]);
    document.querySelector('#summary-shipping').textContent = formatCurrency(shippingCost * exchangeRates[currentCurrency]);
    document.querySelector('#summary-fee').textContent = formatCurrency(fee * exchangeRates[currentCurrency]);
    document.querySelector('#summary-total').textContent = formatCurrency(total * exchangeRates[currentCurrency]);
}

function formatCurrency(val) {
    const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
    return symbols[currentCurrency] + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function startPayment() {
    const payBtn = document.querySelector('#pay-btn');
    payBtn.disabled = true;
    payBtn.textContent = 'Initializing Secure Payment...';

    const subtotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const fee = subtotal * 0.025;
    const total = subtotal + fee + shippingCost;

    const orderData = {
        buyer_id: currentUser.id,
        items: cartItems,
        total_amount: total,
        currency: currentCurrency,
        shipping_method: document.querySelector('.delivery-option.active').dataset.label,
        shipping_address: document.querySelector('#buyer-address').value,
        status: 'pending'
    };

    try {
        // Hand off to Flutterwave Engine
        await window.kavexFLW.initializePayment(orderData);
    } catch (err) {
        alert("Payment Error: " + err.message);
        payBtn.disabled = false;
        payBtn.textContent = 'Pay Securely';
    }
}
