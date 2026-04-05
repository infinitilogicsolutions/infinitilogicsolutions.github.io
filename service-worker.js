const CACHE_NAME = 'my-blog-v3';
const POSTS_JSON_PATH = '/data/posts.json';
const POST_ROUTE_PATTERN = /^\/posts\/[^/]+\.html$/;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/blog.html',
  '/projects.html',
  '/post.html',
  '/404.html',
  '/assets/css/styles.css',
  '/assets/css/custom.css',
  '/assets/js/app.js',
  '/assets/js/typewriter.js',
  '/assets/js/pwa.js',
  '/assets/js/notifications.js',
  '/assets/img/circuit_infinity_tech_logo.png',
  '/assets/img/apple-touch-icon-180.png',
  '/assets/img/apple-touch-icon-167.png',
  '/assets/img/apple-touch-icon-152.png',
  '/assets/img/apple-touch-icon-120.png',
  '/assets/img/icon-192.png',
  '/assets/img/icon-512.png',
  '/favicon.png',
  '/opengraph.jpg',
  POSTS_JSON_PATH,
  '/manifest.json'
];

function isCacheableResponse(response) {
  return Boolean(response && response.status === 200 && response.type !== 'error');
}

function isGeneratedPostRoute(pathname) {
  return POST_ROUTE_PATTERN.test(pathname);
}

async function putInCache(cacheKey, response) {
  if (!isCacheableResponse(response)) {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(cacheKey, response.clone());
  return response;
}

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
          if (cacheName !== CACHE_NAME) {
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
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isPostDocument = isDocument && isGeneratedPostRoute(requestUrl.pathname);

  if (isSameOrigin && requestUrl.pathname === POSTS_JSON_PATH) {
    event.respondWith(
      caches.match(POSTS_JSON_PATH).then((cachedResponse) => {
        const networkRefresh = fetch(event.request)
          .then((response) => putInCache(POSTS_JSON_PATH, response))
          .catch(() => null);

        event.waitUntil(networkRefresh);

        if (cachedResponse) {
          return cachedResponse;
        }

        return networkRefresh.then((response) => {
          if (response) {
            return response;
          }

          return new Response('[]', {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        });
      })
    );
    return;
  }

  const cacheKey = event.request;
  const cacheMatchOptions = isDocument ? { ignoreSearch: true } : undefined;

  event.respondWith(
    (isPostDocument
      ? fetch(event.request)
          .then((response) => putInCache(cacheKey, response))
          .catch(async () => {
            const cachedPost = await caches.match(cacheKey, cacheMatchOptions);
            if (cachedPost) {
              return cachedPost;
            }

            return caches.match('/post.html');
          })
      : caches.match(cacheKey, cacheMatchOptions)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return fetch(event.request)
              .then((response) => putInCache(cacheKey, response))
              .catch(() => {
                if (isDocument) {
                  if (requestUrl.pathname.endsWith('/post.html')) {
                    return caches.match('/post.html');
                  }
                  return caches.match('/index.html');
                }
              });
          }))
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
