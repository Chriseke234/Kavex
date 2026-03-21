const PRICING_TIERS = [
    { min: 1, max: 9, price: 8500 },
    { min: 10, max: 49, price: 7200 },
    { min: 50, max: 199, price: 6100 },
    { min: 200, max: Infinity, price: 5000 }
];

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initTabs();
    initPricingInteraction();
});

function initGallery() {
    const mainImg = document.querySelector('#main-product-img');
    const thumbs = document.querySelectorAll('.thumb');
    const counter = document.querySelector('#img-counter');

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            // Update active state
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            // Update main image
            const newSrc = thumb.querySelector('img').src;
            mainImg.src = newSrc;

            // Update counter
            if (counter) counter.textContent = `${index + 1} of ${thumbs.length}`;
        });
    });
}

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${target}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function initPricingInteraction() {
    const qtyInput = document.querySelector('#order-qty');
    if (!qtyInput) return;

    qtyInput.addEventListener('input', (e) => {
        const qty = parseInt(e.target.value) || 0;
        updatePricingUI(qty);
    });

    // Initial run
    updatePricingUI(parseInt(qtyInput.value));
}

function updatePricingUI(qty) {
    const totalEl = document.querySelector('#live-total');
    const tierRows = document.querySelectorAll('.pricing-table tbody tr');
    
    let activePrice = PRICING_TIERS[0].price;

    tierRows.forEach((row, index) => {
        const tier = PRICING_TIERS[index];
        row.classList.remove('active-tier');

        if (qty >= tier.min && qty <= tier.max) {
            row.classList.add('active-tier');
            activePrice = tier.price;
        }
    });

    // Handle out of bounds (above max tier)
    if (qty > PRICING_TIERS[PRICING_TIERS.length - 1].min) {
        tierRows[tierRows.length - 1].classList.add('active-tier');
        activePrice = PRICING_TIERS[PRICING_TIERS.length - 1].price;
    }

    const total = qty * activePrice;
    
    // Check if window.updatePrices (global currency logic) exists and handle conversion if needed
    // For now, update NGN display
    const unitLabel = qty === 1 ? 'unit' : 'units';
    if (totalEl) {
        totalEl.innerHTML = `Total: <span class="price-display" data-price-ngn="${total}">₦${total.toLocaleString()}</span> for ${qty} ${unitLabel}`;
        
        // Trigger currency update if a non-NGN currency is selected
        const currentCurrency = document.querySelector('#currency-select')?.value || 'NGN';
        if (window.updatePrices && currentCurrency !== 'NGN') {
            window.updatePrices(currentCurrency);
        }
    }
}

// Global RFQ handler placeholder
function submitMiniRfq() {
    alert("In a real app, this would send an RFQ to the seller via Supabase.");
}
