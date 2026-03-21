/**
 * Kavex Environment Variable Injector
 * 
 * Safely exposes only non-secret Netlify environment variables
 * to the client window object during the build/initialization phase.
 * 
 * IMPORTANT: Never include secret keys (Service Role, API Secrets) here.
 */

window.__env = {
    // Supabase Public
    SUPABASE_URL: window.__env?.SUPABASE_URL || "https://kvddsokouanrxyzztald.supabase.co",
    SUPABASE_ANON_KEY: window.__env?.SUPABASE_ANON_KEY || "sb_publishable_8anZv09FsWa39-vqDBCbcA_85Nt95fL",
    
    // Flutterwave Public
    FLW_PUBLIC_KEY: window.__env?.FLW_PUBLIC_KEY || "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxx",

    // Sitemeta
    SITE_URL: window.__env?.SITE_URL || "https://kavex.com"
};

// Log readiness in developmental builds
if (window.location.hostname === 'localhost') {
    console.log("🚀 Kavex Env Injected:", Object.keys(window.__env));
}
