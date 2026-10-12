'use strict';
const CACHE = 'qr-lab-offline-v1';
const APP = '/qr/index.html';
const ASSETS = [APP, '/qr/manifest.webmanifest', '/assets/img/site-icon-192-v2.png', '/assets/img/site-icon-512-v2.png', '/assets/img/site-icon-180-v2.png'];
const NAVIGATIONS = new Set(['/qr/', APP]);
async function validApp(response) {
  return response && response.status === 200 &&
    (response.headers.get('content-type') || '').includes('text/html') &&
    (await response.clone().text()).includes('id="generator"');
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const responses = await Promise.all(ASSETS.map(path => fetch(path, {cache:'reload'})));
    if (!await validApp(responses[0]) || responses.some(r => !r.ok)) throw Error('QR Lab offline assets unavailable');
    const cache = await caches.open(CACHE);
    await Promise.all(responses.map((response,i) => cache.put(ASSETS[i], response)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('qr-lab-offline-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
async function navigationResponse() {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(APP);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(APP, {cache:'no-store',signal:controller.signal});
    if (!await validApp(response)) throw Error('Invalid QR Lab response');
    await cache.put(APP,response.clone());
    return response;
  } catch (error) {
    if (saved) return saved;
    return new Response('QR Lab is not saved for offline use yet. Connect to the internet and open /qr/ once.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  } finally { clearTimeout(timeout); }
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('range')) return;
  if (request.mode === 'navigate' && NAVIGATIONS.has(url.pathname)) {
    event.respondWith(navigationResponse()); return;
  }
  if (ASSETS.includes(url.pathname) && url.pathname !== APP) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return await cache.match(url.pathname) || fetch(request);
    })());
  }
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'QR_OFFLINE_STATUS') return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const entries = await Promise.all(ASSETS.map(path => cache.match(path)));
    event.ports[0]?.postMessage({type:'QR_OFFLINE_STATUS',ready:entries.every(Boolean)});
  })());
});
