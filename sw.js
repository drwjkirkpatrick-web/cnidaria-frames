/**
 * sw.js - Service Worker for Cnidaria Frames v1.1
 *
 * Provides caching for offline access. Cache-bust on version bump.
 */

const CACHE_NAME = 'cnidaria-frames-v1-1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/jellyfish.css',
  '/js/utils.js',
  '/js/lunar-phase.js',
  '/js/themes.js',
  '/js/personality.js',
  '/js/state-manager.js',
  '/js/limbic-bridge.js',
  '/js/caustics.js',
  '/js/ink-cloud.js',
  '/js/particles.js',
  '/js/food-pellets.js',
  '/js/predator.js',
  '/js/gesture-handler.js',
  '/js/voice-command.js',
  '/js/audio-engine.js',
  '/js/system-apis.js',
  '/js/analytics.js',
  '/js/settings-panel.js',
  '/js/performance-monitor.js',
  '/js/screensaver.js',
  '/js/ws-bridge.js',
  '/js/jellyfish.js',
  '/js/main.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Opened cache', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.warn('[SW] Cache install failed:', err))
  );
  self.skipWaiting();
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Fetch from network in parallel
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Update cache with fresh response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // Network failed — we already have cachedResponse or nothing
          });

        // Return cached immediately if available, else wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});