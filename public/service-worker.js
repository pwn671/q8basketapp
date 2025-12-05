// Enhanced Service Worker for Q8 Basket PWA
const CACHE_NAME = 'q8basket-cache-v2';
const STATIC_CACHE_NAME = 'q8basket-static-v2';
const DYNAMIC_CACHE_NAME = 'q8basket-dynamic-v2';
const API_CACHE_NAME = 'q8basket-api-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/browserconfig.xml',
  // Icons
  '/icons/Logo.svg',
  '/icons/icon-48.svg',
  '/icons/icon-72.svg',
  '/icons/icon-96.svg',
  '/icons/icon-144.svg',
  '/icons/icon-192.svg',
  '/icons/icon-256.svg',
  '/icons/icon-384.svg',
  '/icons/icon-512.svg',
  // Other static assets
  '/icons/apple.svg',
  '/icons/google.svg',
  '/icons/cart.svg',
  '/icons/search.svg',
  '/icons/location.svg',
  '/icons/home.svg',
  '/icons/profile.svg'
];

// API endpoints to cache with NetworkFirst strategy
const API_PATTERNS = [
  /^https:\/\/.*\/api\/.*$/,
  /^https:\/\/.*\/front\/.*$/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        // Use Promise.allSettled to handle individual failures gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              console.warn(`Service Worker: Failed to cache ${asset}:`, err);
              return null; // Don't fail the entire install
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Static assets cached (some may have failed)');
        // Don't skip waiting on first install - let app load first
        // Only skip waiting on updates
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
        // Continue installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME &&
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        // Don't claim clients immediately on first install
        // Let the app load naturally first
        // Only claim if there's already a controller (update scenario)
        if (self.clients && self.clients.claim) {
          return self.clients.claim().catch(err => {
            console.warn('Service Worker: Failed to claim clients', err);
          });
        }
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed', error);
        // Continue even if activation fails
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with NetworkFirst strategy
  if (API_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with CacheFirst strategy
  if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests with NetworkFirst strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests with StaleWhileRevalidate strategy
  event.respondWith(handleOtherRequest(request));
});

// CacheFirst strategy for static assets
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static request failed', error);
    return new Response('Offline', { status: 503 });
  }
}

// NetworkFirst strategy for API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // ✅ Handle 401 Unauthorized globally (optional improvement)
    if (networkResponse.status === 401) {
      console.warn('Service Worker: Unauthorized (401) detected — skipping cache');
      return networkResponse;
    }

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// NetworkFirst strategy for navigation requests
async function handleNavigationRequest(request) {
  try {
    // Always try network first - don't serve cached content on first load
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      // Cache successful responses for offline use
      try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('Service Worker: Failed to cache navigation response', cacheError);
      }
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Navigation request failed, trying cache', error);
    // Only fallback to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Try index.html as last resort
    const indexCache = await caches.match('/index.html');
    if (indexCache) {
      return indexCache;
    }
    // If no cache, return network error (don't serve stale content on first load)
    return new Response('Offline', { status: 503 });
  }
}

// ✅ FINAL FIX: StaleWhileRevalidate strategy (safe clone)
async function handleOtherRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Fetch from network in parallel
    const networkPromise = fetch(request)
      .then(async (response) => {
        if (response && response.ok) {
          // Clone immediately for caching before anything consumes the body
          const responseClone = response.clone();
          try {
            await cache.put(request, responseClone);
          } catch (err) {
            console.warn('Service Worker: Failed to cache response', err);
          }
        }
        // Return a fresh clone so browser can consume safely
        return response.clone();
      })
      .catch((err) => {
        console.error('Service Worker: Network fetch failed', err);
        return cachedResponse || new Response('Offline', { status: 503 });
      });

    // Return cached response first, fallback to network
    return cachedResponse || networkPromise;

  } catch (error) {
    console.error('Service Worker: Other request failed', error);
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    // Implement background sync logic here
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Q8 Basket',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'View', icon: '/icons/search.svg' },
      { action: 'close', title: 'Close', icon: '/icons/close.svg' }
    ]
  };

  event.waitUntil(self.registration.showNotification('Q8 Basket', options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded');
