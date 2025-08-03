const CACHE_NAME = 'topreparateurs-pos-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/admin',
  '/manifest.json',
  '/placeholder.svg'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => 
            cacheName !== STATIC_CACHE && 
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== CACHE_NAME
          ).map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network First for API, Cache First for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - Network First
  if (request.url.includes('/api/') || request.url.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Static assets - Cache First
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
            return response;
          });
      })
  );
});

// Background Sync for offline transactions
self.addEventListener('sync', event => {
  if (event.tag === 'pos-sync') {
    event.waitUntil(syncPOSData());
  }
});

// Sync POS data when online
async function syncPOSData() {
  try {
    const pendingTransactions = await getStoredTransactions();
    for (const transaction of pendingTransactions) {
      await syncTransaction(transaction);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function getStoredTransactions() {
  // Implementation would retrieve from IndexedDB
  return [];
}

async function syncTransaction(transaction) {
  // Implementation would sync with server
  console.log('Syncing transaction:', transaction);
}