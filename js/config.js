// Supabase Configuration
// Note: These values should be provided via environment variables in production.
// For local development, they can be set in config.js or a .env file handled by the bundler/server.

const SUPABASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'https://kvddsokouanrxyzztald.supabase.co' // Using the created project URL
  : ''; // In production, this can be hardcoded or dynamically injected

const SUPABASE_ANON_KEY = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'sb_publishable_8anZv09FsWa39-vqDBCbcA_85Nt95fL' // Using the provided publishable key
  : '';

// Initialize Supabase Client (assuming supabase-js is loaded via CDN/npm)
let supabase;

if (typeof window.supabase !== 'undefined') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('Supabase client library not loaded. Make sure to include it in your HTML.');
}

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
