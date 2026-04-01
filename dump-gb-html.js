const fs = require('fs');

const htmlContent = `
<main id="main-content">
    <!-- SECTION 1: HERO -->
    <section class="gb-hero section">
        <div class="gb-hero-pattern"></div>
        <div class="container gb-grid-2">
            <!-- Left Side -->
            <div>
                <div class="gb-hero-pill">🌍 Trusted by 500+ International Buyers</div>
                <h1>Source Authentic African Products. Direct. Verified. Escrow-Safe.</h1>
                <p>Connect with KYB-verified Nigerian exporters. Pay via bank wire, card, or SWIFT. Funds held in escrow until you confirm quality.</p>
                <div class="gb-hero-ctas">
                    <a href="/pages/auth/register-buyer.html" class="gb-btn-primary">Create Free Buyer Account</a>
                    <a href="/pages/marketplace/products.html" class="gb-btn-outline">Browse Marketplace</a>
                </div>
                <div class="gb-hero-stats">
                    <div class="gb-stat-item">
                        <span class="gb-stat-num">500+</span>
                        <span class="gb-stat-label">Global Buyers</span>
                    </div>
                    <div class="gb-stat-item">
                        <span class="gb-stat-num">30+</span>
                        <span class="gb-stat-label">Source Countries</span>
                    </div>
                    <div class="gb-stat-item">
                        <span class="gb-stat-num">100%</span>
                        <span class="gb-stat-label">Escrow Protected</span>
                    </div>
                    <div class="gb-stat-item">
                        <span class="gb-stat-num">24h</span>
                        <span class="gb-stat-label">Quote Turnaround</span>
                    </div>
                </div>
            </div>
            <!-- Right Side -->
            <div class="gb-hero-cards">
                <div class="gb-buyer-card gb-card-top">
                    <span class="gb-card-flag">🇬🇧</span>
                    <span class="gb-card-name">James Millers</span>
                    <span class="gb-card-company">Cosmetix Lab UK</span>
                    <span class="gb-card-product">Shea Butter</span>
                </div>
                <div class="gb-buyer-card gb-card-mid">
                    <span class="gb-card-flag">🇻🇳</span>
                    <span class="gb-card-name">Tan Nguyen</span>
                    <span class="gb-card-company">Pacific Agro Vietnam</span>
                    <span class="gb-card-product">Cashew Nuts</span>
                </div>
                <div class="gb-buyer-card gb-card-bottom">
                    <span class="gb-card-flag">🇩🇪</span>
                    <span class="gb-card-name">Helga Schmidt</span>
                    <span class="gb-card-company">Kulinaria Imports</span>
                    <span class="gb-card-product">Dried Ginger</span>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 2: TRUST PILLARS -->
    <section class="gb-trust-pillars section">
        <div class="container">
            <h2 class="gb-section-title">Built for International Trade</h2>
            <p class="gb-section-subtitle">Every feature designed for cross-border confidence</p>
            <div class="gb-trust-grid">
                <div class="gb-trust-card">
                    <div class="gb-trust-icon" style="background:#EFF6FF; color:#0F4C81;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                    </div>
                    <h3>Verified Suppliers</h3>
                    <p>Mandatory KYB vetting and physical factory audits for all sellers.</p>
                </div>
                <div class="gb-trust-card">
                    <div class="gb-trust-icon" style="background:#FFF7ED; color:#EA580C;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h3>Escrow Protection</h3>
                    <p>Payments held securely until you confirm quality and receipt.</p>
                </div>
                <div class="gb-trust-card">
                    <div class="gb-trust-icon" style="background:#F0FDF4; color:#1D9E75;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 1L2 8l7 4"></path><path d="M22 1l-7 20-4-7"></path></svg>
                    </div>
                    <h3>Global Logistics</h3>
                    <p>Integrated shipping with DHL, Maersk, and local air freight partners.</p>
                </div>
                <div class="gb-trust-card">
                    <div class="gb-trust-icon" style="background:#FDF2F8; color:#7C3AED;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <h3>Trade Documentation</h3>
                    <p>Automated Bill of Lading, Certificates of Origin, and NXP forms.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 3: EXPORT CATEGORIES -->
    <section class="gb-categories section">
        <div class="container">
            <h2 class="gb-section-title">Premium Nigerian Exports</h2>
            <p class="gb-section-subtitle">Sourced directly from verified Nigerian producers</p>
            <div class="gb-cat-grid">
                <a href="#" class="gb-cat-card">
                    <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=200" class="gb-cat-img" alt="Agriculture">
                    <div class="gb-cat-content">
                        <h3 class="gb-cat-title">Agriculture & Food</h3>
                        <ul class="gb-cat-items">
                            <li>Sesame Seeds</li>
                            <li>Dried Hibiscus</li>
                            <li>Cocoa Beans</li>
                        </ul>
                        <span class="gb-cat-link">Browse Suppliers &rarr;</span>
                    </div>
                </a>
                <a href="#" class="gb-cat-card">
                    <img src="https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&q=80&w=200" class="gb-cat-img" alt="Textiles">
                    <div class="gb-cat-content">
                        <h3 class="gb-cat-title">Fashion & Textiles</h3>
                        <ul class="gb-cat-items">
                            <li>Adire & Aso Oke</li>
                            <li>Leather Bags</li>
                            <li>Organic Fabrics</li>
                        </ul>
                        <span class="gb-cat-link">Browse Suppliers &rarr;</span>
                    </div>
                </a>
                <a href="#" class="gb-cat-card">
                    <img src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=200" class="gb-cat-img" alt="Beauty">
                    <div class="gb-cat-content">
                        <h3 class="gb-cat-title">Beauty & Wellness</h3>
                        <ul class="gb-cat-items">
                            <li>Raw Shea Butter</li>
                            <li>Black Soap</li>
                            <li>Oils & Extracts</li>
                        </ul>
                        <span class="gb-cat-link">Browse Suppliers &rarr;</span>
                    </div>
                </a>
                <a href="#" class="gb-cat-card">
                    <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200" class="gb-cat-img" alt="Minerals">
                    <div class="gb-cat-content">
                        <h3 class="gb-cat-title">Industrial Materials</h3>
                        <ul class="gb-cat-items">
                            <li>Solid Minerals</li>
                            <li>Scrap Metals</li>
                            <li>Rubber & Resins</li>
                        </ul>
                        <span class="gb-cat-link">Browse Suppliers &rarr;</span>
                    </div>
                </a>
                <a href="#" class="gb-cat-card">
                    <img src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=200" class="gb-cat-img" alt="Crafts">
                    <div class="gb-cat-content">
                        <h3 class="gb-cat-title">Arts & Crafts</h3>
                        <ul class="gb-cat-items">
                            <li>Woven Baskets</li>
                            <li>Wooden Carvings</li>
                            <li>Pottery & Ceramics</li>
                        </ul>
                        <span class="gb-cat-link">Browse Suppliers &rarr;</span>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- SECTION 4: HOW IT WORKS -->
    <section class="gb-how section">
        <div class="container">
            <h2 class="gb-section-title">6 Steps to Your First Order</h2>
            <div class="gb-steps-wrapper">
                <div class="gb-steps-line"></div>
                <div class="gb-step">
                    <div class="gb-step-num">1</div>
                    <h4 class="gb-step-title">Submit RFQ</h4>
                    <p class="gb-step-desc">Detail your sourcing needs.</p>
                </div>
                <div class="gb-step">
                    <div class="gb-step-num">2</div>
                    <h4 class="gb-step-title">Verify Quote</h4>
                    <p class="gb-step-desc">Review proposals and supplier KYB.</p>
                </div>
                <div class="gb-step">
                    <div class="gb-step-num">3</div>
                    <h4 class="gb-step-title">Secure Escrow</h4>
                    <p class="gb-step-desc">Fund your Kavex escrow wallet.</p>
                </div>
                <div class="gb-step">
                    <div class="gb-step-num">4</div>
                    <h4 class="gb-step-title">Seller Ships</h4>
                    <p class="gb-step-desc">Real-time DHL tracking to port.</p>
                </div>
                <div class="gb-step">
                    <div class="gb-step-num">5</div>
                    <h4 class="gb-step-title">Confirm Quality</h4>
                    <p class="gb-step-desc">Review goods and approve transfer.</p>
                </div>
                <div class="gb-step">
                    <div class="gb-step-num">6</div>
                    <h4 class="gb-step-title">Scale Sourcing</h4>
                    <p class="gb-step-desc">Reorder seamlessly with history.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 5: TESTIMONIALS -->
    <section class="gb-testimonials section">
        <div class="container">
            <h2 class="gb-section-title white">Trusted by global importers</h2>
            <div class="gb-testi-grid">
                <div class="gb-testi-card">
                    <div class="gb-testi-stars">★★★★★</div>
                    <p class="gb-testi-quote">"Sourcing raw shea butter used to be a documentation nightmare. Kavex handled the certification chain perfectly for our UK distribution."</p>
                    <div class="gb-testi-author">
                        <span class="gb-testi-flag">🇬🇧</span>
                        <div>
                            <p class="gb-author-name">James Millers</p>
                            <p class="gb-author-company">Cosmetix Lab UK</p>
                        </div>
                    </div>
                </div>
                <div class="gb-testi-card">
                    <div class="gb-testi-stars">★★★★★</div>
                    <p class="gb-testi-quote">"The ability to pay via bank wire and have funds held in escrow gave our legal team the confidence to source high-volume cashew nuts direct from Lagos."</p>
                    <div class="gb-testi-author">
                        <span class="gb-testi-flag">🇻🇳</span>
                        <div>
                            <p class="gb-author-name">Tan Nguyen</p>
                            <p class="gb-author-company">Pacific Agro Vietnam</p>
                        </div>
                    </div>
                </div>
                <div class="gb-testi-card">
                    <div class="gb-testi-stars">★★★★★</div>
                    <p class="gb-testi-quote">"Excellent shipping times. We received Grade-A ginger samples in Germany within 3 days using their integrated DHL express panel."</p>
                    <div class="gb-testi-author">
                        <span class="gb-testi-flag">🇩🇪</span>
                        <div>
                            <p class="gb-author-name">Helga Schmidt</p>
                            <p class="gb-author-company">Kulinaria Imports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 6: FINAL CTA -->
    <section class="gb-final-cta section">
        <div class="container">
            <h2>Ready to source from the heart of Africa?</h2>
            <p>Join free. No subscription. Pay only on transactions.</p>
            <div class="gb-cta-buttons">
                <a href="/pages/auth/register-buyer.html" class="gb-btn-white">Get Started Free</a>
                <a href="/pages/marketplace/products.html" class="gb-btn-outline-white">Browse Marketplace</a>
            </div>
        </div>
    </section>
</main>
`;

const file = 'c:/Users/CHRIS/Kavex/pages/marketplace/global-buyers.html';
let content = fs.readFileSync(file, 'utf8');

// The main block has id="main-content"
const startIndex = content.indexOf('<main id="main-content">');
const endIndex = content.indexOf('</main>', startIndex) + 7;

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + htmlContent.trim() + content.substring(endIndex);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log("Updated global-buyers.html successfully.");
} else {
    console.log("Could not find main tag.");
}
