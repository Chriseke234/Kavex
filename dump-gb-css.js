const fs = require('fs');

const css = `
.gb-hero { background-color: #0A2540; min-height: 580px; display: flex; align-items: center; position: relative; overflow: hidden; }
.gb-hero-pattern { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' stroke='%23ffffff' stroke-opacity='0.05' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E"); pointer-events: none; z-index: 1; }
.gb-hero-pill { display: inline-block; background: rgba(234, 88, 12, 0.15); color: #EA580C; font-size: 12px; border-radius: 20px; padding: 6px 14px; margin-bottom: 24px; font-family: 'DM Sans', sans-serif; font-weight: 600; }
.gb-hero h1 { font-family: 'DM Sans', sans-serif; font-size: 50px; font-weight: 700; color: #FFFFFF; line-height: 1.15; margin: 0 0 16px 0; }
.gb-hero p { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 17px; color: #94A3B8; margin: 0; max-width: 90%; line-height: 1.6; }
.gb-hero-ctas { display: flex; gap: 14px; margin-top: 36px; }
.gb-btn-primary { background: #EA580C; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none; transition: all 0.2s ease; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.gb-btn-primary:hover { background: #C84B0A; box-shadow: 0 8px 24px rgba(234, 88, 12, 0.4); }
.gb-btn-outline { background: transparent; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; border: 1.5px solid rgba(255, 255, 255, 0.35); text-decoration: none; transition: all 0.2s ease; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.gb-btn-outline:hover { background: rgba(255, 255, 255, 0.08); }
.gb-hero-stats { display: flex; gap: 24px; margin-top: 40px; }
.gb-stat-item { display: flex; flex-direction: column; padding-right: 24px; border-right: 1px solid rgba(255, 255, 255, 0.2); }
.gb-stat-item:last-child { border-right: none; padding-right: 0; }
.gb-stat-num { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 700; color: #FFFFFF; line-height: 1.2; }
.gb-stat-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #64748B; margin-top: 4px; }
.gb-hero-cards { position: relative; width: 100%; height: 480px; display: flex; align-items: center; justify-content: center; }
@keyframes subtle-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.gb-buyer-card { position: absolute; width: 280px; background: #FFFFFF; border-radius: 14px; padding: 16px 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; z-index: 2; }
.gb-card-top { transform: rotate(-3deg) translate(-15px, -80px); z-index: 1; opacity: 0.9; }
.gb-card-mid { z-index: 3; animation: subtle-float 3s ease-in-out infinite; }
.gb-card-bottom { transform: rotate(3deg) translate(20px, 80px); z-index: 1; opacity: 0.9; }
.gb-card-flag { font-size: 28px; margin-bottom: 8px; line-height: 1; }
.gb-card-name { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; color: #0A2540; margin-bottom: 2px; }
.gb-card-company { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #6B7280; margin-bottom: 8px; }
.gb-card-product { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; color: #EA580C; }

.gb-trust-pillars { background-color: #FFFFFF; padding: 80px 0; }
.gb-section-title { font-family: 'DM Sans', sans-serif; font-size: 36px; font-weight: 700; color: #111827; text-align: center; margin: 0 0 8px 0; }
.gb-section-title.white { color: #FFFFFF; }
.gb-section-subtitle { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #6B7280; text-align: center; margin: 0 0 48px 0; }
.gb-section-subtitle.white { color: #FFFFFF; }
.gb-trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.gb-trust-card { background: #FFFFFF; border: 1.5px solid #E8EAED; border-radius: 16px; padding: 32px 24px; text-align: center; transition: all 0.25s ease; }
.gb-trust-card:hover { border-color: #0F4C81; cursor: pointer; }
.gb-trust-icon { width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; }
.gb-trust-card h3 { font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 600; color: #111827; margin: 0 0 8px 0; }
.gb-trust-card p { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0; }

.gb-categories { background-color: #F8FAFC; padding: 80px 0; }
.gb-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
.gb-cat-card { background: #FFFFFF; border-radius: 12px; overflow: hidden; transition: all 0.2s ease; display: flex; flex-direction: column; text-decoration: none; border: 1px solid #E2E8F0; }
.gb-cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
.gb-cat-img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px 12px 0 0; }
.gb-cat-content { padding: 14px; flex: 1; display: flex; flex-direction: column; }
.gb-cat-title { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px 0; }
.gb-cat-items { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #6B7280; margin: 0 0 16px 0; padding-left: 16px; flex: 1; }
.gb-cat-items li { margin-bottom: 4px; }
.gb-cat-link { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600; color: #EA580C; text-decoration: none; margin-top: auto; }
.gb-cat-card:hover .gb-cat-link { text-decoration: underline; }

.gb-how { background-color: #FFFFFF; padding: 80px 0; }
.gb-steps-wrapper { display: flex; justify-content: space-between; align-items: flex-start; position: relative; margin-top: 48px; }
.gb-steps-line { position: absolute; top: 20px; left: 40px; right: 40px; height: 2px; border-top: 2px dashed #E2E8F0; z-index: 1; }
.gb-step { position: relative; z-index: 2; background: transparent; width: 14%; display: flex; flex-direction: column; align-items: center; text-align: center; }
.gb-step-num { width: 40px; height: 40px; background: #0F4C81; color: #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.gb-step-title { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px 0; }
.gb-step-desc { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #6B7280; margin: 0; line-height: 1.5; }

.gb-testimonials { background-color: #0A2540; padding: 80px 0; }
.gb-testimonials .gb-section-title { color: #FFFFFF; margin-bottom: 48px; }
.gb-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.gb-testi-card { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 28px; }
.gb-testi-stars { color: #EA580C; font-size: 16px; letter-spacing: 2px; margin-bottom: 16px; }
.gb-testi-quote { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-style: italic; color: #FFFFFF; line-height: 1.7; margin: 0 0 24px 0; }
.gb-testi-author { display: flex; align-items: center; gap: 12px; }
.gb-testi-flag { font-size: 24px; }
.gb-author-name { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF; margin: 0 0 2px 0; }
.gb-author-company { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #94A3B8; margin: 0; }

.gb-final-cta { background-color: #EA580C; padding: 64px 0; text-align: center; }
.gb-final-cta h2 { font-family: 'DM Sans', sans-serif; font-size: 38px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0; }
.gb-final-cta p { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; color: #FFFFFF; margin: 0 0 32px 0; }
.gb-cta-buttons { display: flex; justify-content: center; gap: 16px; }
.gb-btn-white { background: #FFFFFF; color: #EA580C; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none; transition: all 0.2s ease; border: 1.5px solid #FFFFFF; display: inline-flex; align-items: center; justify-content: center; }
.gb-btn-white:hover { background: rgba(255, 255, 255, 0.9); }
.gb-btn-outline-white { background: transparent; color: #FFFFFF; border: 1.5px solid #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
.gb-btn-outline-white:hover { background: rgba(255, 255, 255, 0.1); }

.gb-grid-2 { display: grid; grid-template-columns: 55% 45%; gap: 40px; width: 100%; position: relative; z-index: 2; align-items: center; }

@media (max-width: 1024px) { .gb-grid-2 { grid-template-columns: 50% 50%; } .gb-cat-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (max-width: 768px) {
    .gb-grid-2 { grid-template-columns: 1fr; }
    .gb-hero-cards { display: none; }
    .gb-hero { padding: 40px 0; min-height: auto; }
    .gb-stat-item { padding-right: 12px; border-right: none;}
    .gb-hero-stats { flex-wrap: wrap; }
    .gb-trust-grid, .gb-testi-grid { grid-template-columns: 1fr; }
    .gb-cat-grid { grid-template-columns: 1fr 1fr; }
    .gb-steps-wrapper { flex-direction: column; align-items: flex-start; gap: 24px; padding-left: 20px;}
    .gb-steps-line { top: 0; bottom: 0; left: 39px; width: 2px; height: auto; border-top: none; border-left: 2px dashed #E2E8F0; }
    .gb-step { width: 100%; flex-direction: row; text-align: left; gap: 16px; background: transparent;}
    .gb-step-num { margin-bottom: 0; flex-shrink: 0; }
    .gb-cta-buttons { flex-direction: column; }
    .gb-hero-ctas { flex-direction: column; }
}
`;

fs.writeFileSync('c:/Users/CHRIS/Kavex/assets/css/global-buyers.css', css, 'utf8');
