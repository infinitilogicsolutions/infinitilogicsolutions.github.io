const CACHE_NAME = 'my-blog-v1';
const DYNAMIC_CACHE = 'my-blog-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/blog.html',
  '/projects.html',
  '/post.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/img/logo.svg',
  '/data/posts.json',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';
  const isDocument = isNavigation || event.request.destination === 'document';
  const requestUrl = new URL(event.request.url);

  event.respondWith(
    (isDocument
      ? caches.match(event.request, { ignoreSearch: true })
      : caches.match(event.request))
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background for dynamic content
          if (event.request.url.includes('/data/posts.json')) {
            fetch(event.request).then((response) => {
              if (response && response.status === 200) {
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(event.request, response);
                });
              }
            }).catch(() => {
              // Offline, use cached version
            });
          }
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Offline and not cached - return offline page
            if (isDocument) {
              if (requestUrl.pathname.endsWith('/post.html')) {
                return caches.match('/post.html');
              }
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
