// Service Worker pour le mode hors ligne
const CACHE_NAME = 'repairer-pro-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache
const CACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo-icon.svg',
  // CSS et JS seront ajoutés dynamiquement
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache ouvert');
      return cache.addAll(CACHE_RESOURCES);
    })
  );
  
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression cache obsolète:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Stratégie Cache First pour les assets statiques
  if (event.request.url.includes('/assets/') || 
      event.request.url.includes('.css') ||
      event.request.url.includes('.js') ||
      event.request.url.includes('.svg') ||
      event.request.url.includes('.png') ||
      event.request.url.includes('.jpg')) {
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // Stratégie Network First pour les API
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co')) {
    
    event.respondWith(
      fetch(event.request).then((response) => {
        // Cache les réponses GET réussies
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Retourner les données mises en cache si le réseau échoue
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Stratégie Cache First pour la navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          return caches.match(OFFLINE_URL);
        });
      })
    );
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[SW] Synchronisation:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});

// Fonction de synchronisation des données
async function syncData() {
  try {
    // Récupérer les données en attente depuis IndexedDB
    const pendingData = await getPendingData();
    
    if (pendingData.length > 0) {
      console.log('[SW] Synchronisation de', pendingData.length, 'éléments');
      
      for (const data of pendingData) {
        try {
          await syncSingleItem(data);
          await removePendingData(data.id);
        } catch (error) {
          console.error('[SW] Erreur sync item:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Erreur synchronisation:', error);
  }
}

// Simulation des fonctions IndexedDB (à implémenter)
async function getPendingData() {
  return [];
}

async function syncSingleItem(data) {
  // Logique de synchronisation
}

async function removePendingData(id) {
  // Suppression des données synchronisées
}