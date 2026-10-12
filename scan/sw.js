'use strict';
const CACHE_NAME='paperlens-offline-v1';
const SHELL=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.add(new Request(SHELL,{cache:'reload'}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys()){
      if(name.startsWith('paperlens-offline-')&&name!==CACHE_NAME)await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  // Only the app entry routes use the shell; unrelated URLs keep their normal behavior.
  if(event.request.mode!=='navigate'||![scope.pathname,scope.pathname+'index.html'].includes(url.pathname))return;
  const refresh=(async()=>{
    const response=await fetch(new Request(SHELL,{cache:'no-cache'}));
    if(response.ok&&response.headers.get('content-type')?.includes('text/html')){
      await (await caches.open(CACHE_NAME)).put(SHELL,response.clone());
    }
    return response;
  })();
  event.waitUntil(refresh.catch(()=>{}));
  event.respondWith((async()=>{
    const cached=await (await caches.open(CACHE_NAME)).match(SHELL);
    return cached||refresh;
  })());
});
