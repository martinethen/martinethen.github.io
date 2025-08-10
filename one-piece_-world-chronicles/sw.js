const CACHE_NAME = 'one-piece-adventure-v1';
const API_CACHE_NAME = 'one-piece-adventure-api-v1';

// These URLs will be cached when the service worker is installed.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/components/StoryDisplay.tsx',
  '/components/ChoiceButton.tsx',
  '/components/Loader.tsx',
  '/components/ErrorDisplay.tsx',
  '/components/StatsPage.tsx',
  '/components/CustomizationPage.tsx',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/@google/genai@^1.8.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error("Failed to cache app shell:", err);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network-first, then cache.
  if (url.hostname.includes('googleapis.com')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request).then(cachedResponse => {
              return cachedResponse || new Response(JSON.stringify({ error: 'Offline and not in cache' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
      })
    );
    return;
  }
  
  // Other requests: Cache-first, then network.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then(networkResponse => {
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
            return networkResponse;
        }
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// Listen for messages from the client (e.g., from App.tsx)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    console.log('Service Worker received command to clear API cache.');
    event.waitUntil(
      caches.delete(API_CACHE_NAME).then(() => {
        console.log('API cache successfully deleted.');
      })
    );
  }
});