/* ==========================================================================
   Kavex Navbar — Shared JavaScript
   Include via: <script src="/assets/js/navbar.js"></script>
   ========================================================================== */

(function () {
    'use strict';

    // ── DOM References ──
    const navbar = document.querySelector('.kv-navbar');
    const hamburger = document.querySelector('.kv-navbar__hamburger');
    const drawer = document.querySelector('.kv-navbar__drawer');

    if (!navbar) return;

    // ── Sticky Shadow on Scroll ──
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                if (window.scrollY > 10) {
                    navbar.classList.add('kv-navbar--scrolled');
                } else {
                    navbar.classList.remove('kv-navbar--scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();

    // ── Mobile Hamburger Toggle ──
    if (hamburger && drawer) {
        hamburger.addEventListener('click', function () {
            const isOpen = hamburger.classList.toggle('open');
            drawer.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close drawer when a link is clicked
        drawer.querySelectorAll('.kv-navbar__drawer-link').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                drawer.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close drawer on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                hamburger.classList.remove('open');
                drawer.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Active Link Detection ──
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.kv-navbar__link, .kv-navbar__drawer-link');

    navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (!href) return;

        // Normalize: strip trailing slashes and index.html
        const linkPath = href.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
        const pagePath = currentPath.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';

        if (linkPath === pagePath) {
            link.classList.add('active');
        }
    });

    // ── Currency Dropdown ──
    const currencySelect = document.querySelector('.kv-navbar__currency');
    if (currencySelect) {
        // Restore saved preference
        const saved = localStorage.getItem('kavex-currency');
        if (saved) {
            currencySelect.value = saved;
        }

        currencySelect.addEventListener('change', function () {
            localStorage.setItem('kavex-currency', this.value);
            // Fire custom event so other scripts can react
            window.dispatchEvent(new CustomEvent('kavex:currency-change', {
                detail: { currency: this.value }
            }));
        });
    }
})();
