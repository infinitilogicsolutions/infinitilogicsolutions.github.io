const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../qr/sw.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../qr/index.html'),'utf8');
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
assert(html.includes("scope:'/qr/'"));assert(html.includes('id="offlineStatus"'));assert(html.includes('/qr/manifest.webmanifest'));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../qr/manifest.webmanifest')));assert.equal(manifest.start_url,'/qr/');assert.equal(manifest.scope,'/qr/');
function environment(){
 const data=new Map(),handlers={},calls=[];let mode='online',generation=1;
 function key(x){return new URL(typeof x==='string'?x:x.url,'https://example.com').pathname;}
 const caches={async open(name){if(!data.has(name))data.set(name,new Map());const store=data.get(name);return {async put(k,r){store.set(key(k),r.clone())},async match(k){return store.get(key(k))?.clone()}}},async keys(){return [...data.keys()]},async delete(k){return data.delete(k)}};
 const ctx={URL,Response,AbortController,console,caches,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,20)),clearTimeout,self:{location:{origin:'https://example.com'},skipWaiting:async()=>{},clients:{claim:async()=>{}},addEventListener:(type,fn)=>handlers[type]=fn},fetch:async(input,options={})=>{calls.push({input,options});if(mode==='offline')throw Error('offline');if(mode==='timeout')return new Promise((resolve,reject)=>{options.signal.addEventListener('abort',()=>reject(Error('timeout')))});if(mode==='bad')return new Response('<html>wrong app</html>',{headers:{'Content-Type':'text/html'}});const url=key(input);return new Response(url==='/qr/index.html'?'<html id="generator">version '+generation+'</html>':'asset',{headers:{'Content-Type':url.endsWith('.html')?'text/html':'image/png'}})}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 async function event(type,extra={}){let promise;handlers[type]({...extra,waitUntil:p=>promise=p});await promise;}
 async function request(url,method='GET',origin='https://example.com',range=false,mode='navigate'){let response;handlers.fetch({request:{url:origin+url,method,mode,headers:{has:k=>k==='range'&&range}},respondWith:p=>response=p});return response?await response:null;}
 return {data,calls,ctx,event,request,setMode:x=>mode=x,setVersion:x=>generation=x};
}
(async()=>{
 const e=environment();await e.event('install');assert.equal(e.calls.length,5);assert([...e.data.get('qr-lab-offline-v1').keys()].includes('/qr/index.html'));
 e.data.set('qr-lab-offline-old',new Map());e.data.set('my-blog-v10',new Map());e.data.set('dayboard-cache',new Map());await e.event('activate');assert(!e.data.has('qr-lab-offline-old'));assert(e.data.has('my-blog-v10')&&e.data.has('dayboard-cache'));
 e.setMode('offline');for(const route of ['/qr/','/qr/?from=home','/qr/index.html?x=1']){const r=await e.request(route);assert.equal(r.status,200);assert((await r.text()).includes('version 1'));}
 const calls=e.calls.length;assert(await e.request('/qr/manifest.webmanifest','GET',undefined,false,'same-origin'));assert.equal(e.calls.length,calls);
 assert.equal(await e.request('/cards/'),null);assert.equal(await e.request('/qr/secret'),null);assert.equal(await e.request('/support/'),null);assert.equal(await e.request('/qr/','POST'),null);assert.equal(await e.request('/qr/','GET','https://other.example'),null);assert.equal(await e.request('/qr/','GET',undefined,true),null);
 e.setMode('online');e.setVersion(2);assert((await (await e.request('/qr/')).text()).includes('version 2'));e.setMode('offline');assert((await (await e.request('/qr/')).text()).includes('version 2'));
 e.setMode('bad');assert((await (await e.request('/qr/')).text()).includes('version 2'));e.setMode('timeout');assert((await (await e.request('/qr/')).text()).includes('version 2'));
 let reply;await e.event('message',{data:{type:'QR_OFFLINE_STATUS'},ports:[{postMessage:d=>reply=d}]});assert(reply.ready);
 const empty=environment();empty.setMode('offline');assert.equal((await empty.request('/qr/')).status,503);
 const failed=environment();failed.setMode('bad');await assert.rejects(()=>failed.event('install'));assert(!failed.data.has('qr-lab-offline-v1'));
 console.log('PASS precache, offline reopen/query aliases, online refresh, failed/slow network fallback, invalid HTML rejection, readiness, cache isolation, out-of-scope/non-GET/range passthrough, first-use failure, manifest and inline syntax.');
})().catch(e=>{console.error(e);process.exit(1)});
