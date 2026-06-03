// Service Worker — Surachet Legal AI Consultancy
// Version: 1.0.0

const CACHE_NAME = 'surachet-legal-ai-v1';
const OFFLINE_URL = '/consultai-website/offline.html';

const PRECACHE_ASSETS = [
  '/consultai-website/',
  '/consultai-website/index.html',
  '/consultai-website/manifest.json',
  '/consultai-website/offline.html',
  '/consultai-website/icons/icon-192x192.png',
  '/consultai-website/icons/icon-512x512.png',
];

// Install: precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
