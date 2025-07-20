// Service Worker for SecureFlow Automaton PWA
// Version 1.0.0 - Production Ready

const CACHE_NAME = 'secureflow-v1.0.0';
const STATIC_CACHE = 'secureflow-static-v1.0.0';
const DYNAMIC_CACHE = 'secureflow-dynamic-v1.0.0';
const API_CACHE = 'secureflow-api-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo.svg',
  '/placeholder.svg',
  '/auth',
  '/profile',
  '/settings',
  '/monitoring',
  // Add critical CSS and JS files (will be populated by build process)
];

// API endpoints to cache with different strategies
const API_ENDPOINTS = {
  CACHE_FIRST: [
    '/api/vulnerabilities/static',
    '/api/compliance/frameworks',
    '/api/security/benchmarks'
  ],
  NETWORK_FIRST: [
    '/api/vulnerabilities/scan',
    '/api/security/threats',
    '/api/monitoring/health',
    '/api/monitoring/performance'
  ],
  STALE_WHILE_REVALIDATE: [
    '/api/user/profile',
    '/api/settings',
    '/api/metrics/summary'
  ]
};

// Background sync tags
const SYNC_TAGS = {
  SECURITY_SCAN: 'security-scan-sync',
  VULNERABILITY_REPORT: 'vulnerability-report-sync',
  PERFORMANCE_METRICS: 'performance-metrics-sync',
  ERROR_REPORTING: 'error-reporting-sync'
};

// IndexedDB setup for offline data storage
const DB_NAME = 'SecureFlowDB';
const DB_VERSION = 1;
const STORES = {
  VULNERABILITIES: 'vulnerabilities',
  SCANS: 'scans',
  METRICS: 'metrics',
  SYNC_QUEUE: 'syncQueue',
  OFFLINE_ACTIONS: 'offlineActions'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Initialize IndexedDB
      initializeDB(),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.SECURITY_SCAN:
      event.waitUntil(syncSecurityScans());
      break;
    case SYNC_TAGS.VULNERABILITY_REPORT:
      event.waitUntil(syncVulnerabilityReports());
      break;
    case SYNC_TAGS.PERFORMANCE_METRICS:
      event.waitUntil(syncPerformanceMetrics());
      break;
    case SYNC_TAGS.ERROR_REPORTING:
      event.waitUntil(syncErrorReports());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Push notifications for security alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }
  
  const options = {
    title: data.title || 'SecureFlow Security Alert',
    body: data.body || 'New security event detected',
    icon: '/logo.svg',
    badge: '/favicon.ico',
    tag: data.tag || 'security-alert',
    data: data.url || '/',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/logo.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: data.priority === 'high',
    silent: data.priority === 'low'
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Helper functions

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Determine caching strategy based on endpoint
  if (API_ENDPOINTS.CACHE_FIRST.some(endpoint => pathname.includes(endpoint))) {
    return cacheFirst(request, API_CACHE);
  }
  
  if (API_ENDPOINTS.NETWORK_FIRST.some(endpoint => pathname.includes(endpoint))) {
    return networkFirst(request, API_CACHE);
  }
  
  if (API_ENDPOINTS.STALE_WHILE_REVALIDATE.some(endpoint => pathname.includes(endpoint))) {
    return staleWhileRevalidate(request, API_CACHE);
  }
  
  // Default: network first for API requests
  return networkFirst(request, API_CACHE);
}

async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cached version or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return cached index.html for SPA routing
    return caches.match('/index.html');
  }
}

async function handleStaticAsset(request) {
  return cacheFirst(request, STATIC_CACHE);
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Queue for background sync if this is a critical request
    if (request.method === 'POST' || request.method === 'PUT') {
      await queueOfflineAction(request);
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Network update failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || networkResponsePromise;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

async function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(STORES.VULNERABILITIES)) {
        const vulnerabilitiesStore = db.createObjectStore(STORES.VULNERABILITIES, { keyPath: 'id' });
        vulnerabilitiesStore.createIndex('severity', 'severity', { unique: false });
        vulnerabilitiesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.SCANS)) {
        const scansStore = db.createObjectStore(STORES.SCANS, { keyPath: 'id' });
        scansStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.METRICS)) {
        const metricsStore = db.createObjectStore(STORES.METRICS, { keyPath: 'id' });
        metricsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
        const actionsStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, { keyPath: 'id', autoIncrement: true });
        actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function queueOfflineAction(request) {
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
    
    const action = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };
    
    await store.add(action);
    console.log('[SW] Queued offline action:', action);
    
    // Register for background sync
    await self.registration.sync.register(SYNC_TAGS.SECURITY_SCAN);
  } catch (error) {
    console.error('[SW] Failed to queue offline action:', error);
  }
}

async function syncSecurityScans() {
  console.log('[SW] Syncing security scans...');
  
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORES.OFFLINE_ACTIONS], 'readonly');
    const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
    const actions = await store.getAll();
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          // Remove successful action from queue
          const deleteTransaction = db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORES.OFFLINE_ACTIONS);
          await deleteStore.delete(action.id);
          
          console.log('[SW] Synced offline action:', action.url);
        }
      } catch (error) {
        console.error('[SW] Failed to sync action:', action.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

async function syncVulnerabilityReports() {
  console.log('[SW] Syncing vulnerability reports...');
  // Implementation for syncing vulnerability data
}

async function syncPerformanceMetrics() {
  console.log('[SW] Syncing performance metrics...');
  // Implementation for syncing performance data
}

async function syncErrorReports() {
  console.log('[SW] Syncing error reports...');
  // Implementation for syncing error reports
}

// Performance monitoring for the service worker itself
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Handle performance measurements from the main thread
    console.log('[SW] Performance measure received:', event.data);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service Worker loaded successfully');
