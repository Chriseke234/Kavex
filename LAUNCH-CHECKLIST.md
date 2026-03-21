# Kavex Launch Checklist (Production Ready)

Follow this 30-item checklist meticulously before flipping the switch to live production.

## 1. Environment & Infrastructure
- [ ] **Netlify Env Vars**: All variables from `.env.example` set in Netlify Site Settings.
- [ ] **Secret Isolation**: Verified that `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are ONLY accessible to Netlify Functions.
- [ ] **Custom Domain**: `kavex.com` (or targeted domain) connected and verified in Netlify.
- [ ] **SSL Certificate**: Let's Encrypt / Managed SSL active and forcing HTTPS.
- [ ] **Functions Health**: Ping `/.netlify/functions/claude-proxy` to ensure cold starts are working.

## 2. Supabase & Data Security
- [ ] **RLS Policies**: Row Level Security enabled on `profiles`, `products`, `orders`, and `rfqs` tables.
- [ ] **Storage Buckets**: `kyb-documents` set to private; `product-images` set to public read-only.
- [ ] **Database Backups**: Daily automated backups enabled.
- [ ] **Admin Account**: Created a secure admin user and granted `admin` role in `profiles` table.
- [ ] **Edge Runtime**: Deno runtime versions pinned in functions.

## 3. Payment & Trade (Flutterwave)
- [ ] **Live Keys**: Switched `FLW_PUBLIC_KEY` and `FLW_SECRET_KEY` from `TEST` to `LIVE`.
- [ ] **Webhook Secret**: `FLW_SECRET_HASH` configured in Netlify to verify incoming payment notifications.
- [ ] **Escrow Logic**: Verified that payouts happen only after "Delivered" confirmation.
- [ ] **Test Transaction**: Successful completion of end-to-end journey with test card:
    - Card: `4187427415564246`
    - Exp: `09/32` | CVV: `828` | PIN: `3310` | OTP: `12345`

## 4. Notifications & Communication
- [ ] **Resend Verification**: Domain `kavex.com` SPF/DKIM records verified in Resend dashboard.
- [ ] **Logo Branding**: Emails include high-res Kavex logo and brand colors.
- [ ] **SMS Gateway**: WhatsApp/SMS integration tested for real-time order alerts.
- [ ] **Reply-To**: Support email correctly routed to `support@kavex.com`.

## 5. User Journeys (End-to-End)
- [ ] **Buyer Flow**: Register → Browse → RFQ → Checkout → Track → Confirm.
- [ ] **Seller Flow**: Register (KYB) → Add Product (AI) → Manage Store → Receive Order.
- [ ] **Admin Flow**: View GMV → Verify KYB Docs → Handle Dispute → Manual Payout.
- [ ] **AI Chatbot**: Test contextual prompts on 5 different pages.

## 6. Frontend / Performance (Mobile-First)
- [ ] **Mobile UX**: Pixel-perfect testing at `375px` (Mobile) and `768px` (Tablet).
- [ ] **Lighthouse Score**: All scores > 90 (Performance, SEO, Accessibility).
- [ ] **404 Routing**: Entering a dead URL correctly triggers the branded 404 page.
- [ ] **PWA Audit**: Service worker registers correctly and manifest is detected.

## 7. Legal & Final Audit
- [ ] **Terms of Service**: Updated with Nigerian trade laws and Escrow clauses.
- [ ] **Privacy Policy**: GDPR/NDPR compliant regarding seller documents.
- [ ] **Analytics**: Google Tag Manager / Netlify Analytics active.
- [ ] **Pre-Launch Snapshot**: Clean local build with no console errors in production mode.
