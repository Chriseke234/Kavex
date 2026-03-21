const CACHE_NAME = 'kavex-v1';
const ASSETS = [
    '/',
    '/assets/css/main.css',
    '/assets/js/main.js',
    '/assets/js/supabase-client.js',
    '/assets/js/auth.js',
    '/assets/img/logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
