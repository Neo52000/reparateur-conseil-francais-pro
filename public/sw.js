const CACHE_VERSION = 'v3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo-icon.svg'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      // Don't skipWaiting automatically — wait for user action
  );
});

// Activate Service Worker — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all clients that a new version is active
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
          });
        });
      })
  );
});

// Listen for skip waiting message from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // API / Supabase requests — Network First
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigation requests (HTML pages) — Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful navigation responses
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Vite hashed assets (e.g. /assets/index-abc123.js) — Cache First (immutable)
  if (url.pathname.startsWith('/assets/') && /\.[a-f0-9]{8,}\./i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Other static assets — Cache First with background revalidation
  if (/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot|ico)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default — Network First
  event.respondWith(networkFirst(request));
});

// Strategy: Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Strategy: Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Strategy: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Background Sync for offline transactions
self.addEventListener('sync', event => {
  if (event.tag === 'pos-sync') {
    event.waitUntil(syncPOSData());
  }
});

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
  return [];
}

async function syncTransaction(transaction) {
  console.log('Syncing transaction:', transaction);
}
