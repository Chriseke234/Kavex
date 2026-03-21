// Supabase Client Initialization
// Note: This script assumes the Supabase JS library is loaded via CDN in the HTML header.

const SUPABASE_URL = window.__env?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.__env?.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials missing. Check window.__env population.");
}

// Initialize the Supabase client
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export to window for global access (vanilla JS pattern)
window.kavexSupabase = supabase;
