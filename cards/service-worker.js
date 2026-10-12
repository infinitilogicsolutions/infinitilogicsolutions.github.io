'use strict';
const CACHE_PREFIX='dayboard-shell-';
const CACHE_NAME=CACHE_PREFIX+'v1';
const APP_PATH='/cards/index.html';
const APP_URL=new URL(APP_PATH,self.location.origin).href;
function validShell(response){return response.ok&&response.headers.get('Content-Type')?.includes('text/html');}
async function fetchShell(request){
 const response=await fetch(request);
 if(validShell(response))await (await caches.open(CACHE_NAME)).put(APP_URL,response.clone());
 return response;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(APP_URL,{cache:'reload'});
 if(!validShell(response))throw Error('Dayboard offline shell unavailable');
 await (await caches.open(CACHE_NAME)).put(APP_URL,response);
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await Promise.all((await caches.keys()).filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||request.mode!=='navigate'||url.origin!==self.location.origin||!['/cards/','/cards/index.html'].includes(url.pathname))return;
 // Cache only the generic application shell, never board data or bookmark queries.
 // Keep event.waitUntil synchronous so refreshes are tied to the event lifetime.
 const cached=caches.open(CACHE_NAME).then(cache=>cache.match(APP_URL));
 const refresh=cached.then(response=>response?fetchShell(request).catch(()=>null):null);
 event.waitUntil(refresh);
 event.respondWith(cached.then(async response=>{
  if(response)return response;
  try{return await fetchShell(request);}catch{return new Response('Dayboard has not been saved offline yet. Open this board once with internet, wait for Ready offline, then try again.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 }));
});
