const CACHE_NAME = 'wordcraft-cache-v1';

// List all files you want to cache for offline or faster loading:
const urlsToCache = [
  '/',                   // Because start_url is "./index.html"
  '/index.html',
  '/wordcraft.css',
  '/wordcraft.js',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  // During install, open the cache and pre‐cache all the listed files
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Once cached, the service worker can be considered “installed”
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if you later change CACHE_NAME
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((existingName) => {
          if (existingName !== CACHE_NAME) {
            return caches.delete(existingName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For any request, try to respond with the cached version first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // If offline and resource not in cache, you could show a fallback page here.
          return new Response(
            `<h1 style="color:#0ff; background:#000; text-align:center; padding:50px;">You appear to be offline and the resource isn't cached.</h1>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
      );
    })
  );
});
