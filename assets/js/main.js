document.addEventListener('DOMContentLoaded', () => {
    initCurrencySwitcher();
    initMobileMenu();
    if (window.kavexAuth) {
        initAuthSession();
    }
});

/**
 * Currency Switcher Logic
 */
async function initCurrencySwitcher() {
    const currencySelect = document.querySelector('#currency-select');
    if (!currencySelect) return;

    // Initial load
    updatePrices(currencySelect.value);

    currencySelect.addEventListener('change', (e) => {
        updatePrices(e.target.value);
    });
}

window.updatePrices = updatePrices;

async function updatePrices(targetCurrency) {
    const prices = document.querySelectorAll('.price-display');
    if (prices.length === 0) return;

    const rates = await getExchangeRates();
    if (!rates) return;

    const rate = rates[targetCurrency] || 1;
    const symbols = {
        'NGN': '₦',
        'USD': '$',
        'GBP': '£',
        'EUR': '€'
    };

    prices.forEach(el => {
        const basePriceNgn = parseFloat(el.getAttribute('data-price-ngn'));
        if (isNaN(basePriceNgn)) return;

        const convertedPrice = basePriceNgn * rate;
        
        // Format based on currency
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        // Use custom symbol placement if needed, but Intl works well
        el.textContent = formatter.format(convertedPrice);
    });
}

async function getExchangeRates() {
    const CACHE_KEY = 'kavex_rates';
    const CACHE_TIME_KEY = 'kavex_rates_timestamp';
    const ONE_HOUR = 60 * 60 * 1000;

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cachedData && cachedTime && (now - cachedTime < ONE_HOUR)) {
        return JSON.parse(cachedData);
    }

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/NGN');
        const data = await response.json();
        
        if (data && data.rates) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data.rates));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            return data.rates;
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }

    return null;
}

/**
 * Initialize Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('SW registration failed:', err);
        });
    });
}

/**
 * Mobile Menu Logic
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('#mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (!menuBtn) return;

    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        
        // Simple toggle for now, CSS handles the rest
        navLinks.classList.toggle('active');
        navActions.classList.toggle('active');
    });
}

/**
 * Auth Session Persistence
 */
async function initAuthSession() {
    if (!window.kavexAuth) return;
    
    const data = await window.kavexAuth.getCurrentUser();
    if (data && data.user && data.profile) {
        updateNavbarLoggedIn(data.profile);
    }

    // Listen for auth changes
    window.kavexAuth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            // Re-fetch user to ensure we have the profile role
            window.location.reload(); 
        } else if (event === 'SIGNED_OUT') {
            window.location.href = '/index.html';
        }
    });
}

function updateNavbarLoggedIn(profile) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // Get initials for avatar
    const initials = profile.full_name
        .split(' ')
        .filter(n => n.length > 0)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const dashboardUrl = profile.role === 'seller' ? '/pages/seller/dashboard.html' : 
                         profile.role === 'buyer' ? '/pages/buyer/dashboard.html' : 
                         '/pages/admin/dashboard.html';

    navActions.innerHTML = `
        <div class="currency-switcher">
            <select id="currency-select" aria-label="Switch Currency">
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
            </select>
        </div>
        <div class="user-menu-dropdown">
            <button class="avatar-btn" id="user-menu-btn" title="User Menu">${initials}</button>
            <div class="dropdown-content" id="user-dropdown">
                <div class="dropdown-header">
                    <strong>${profile.full_name}</strong>
                    <span class="fs-xs text-muted" style="text-transform: uppercase;">${profile.role}</span>
                </div>
                <hr>
                <a href="${dashboardUrl}">Dashboard</a>
                <a href="/pages/profile.html">My Profile</a>
                <a href="#" onclick="window.kavexAuth.signOut()">Sign Out</a>
            </div>
        </div>
    `;

    // Dropdown toggle logic
    const btn = document.querySelector('#user-menu-btn');
    const dropdown = document.querySelector('#user-dropdown');
    if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
    }
}

