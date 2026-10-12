const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},stores=new Map(),origin='https://example.test';let online=true,networkBody='<html>v1</html>',status=200,claimed=false;
const cacheFor=name=>{if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return{async put(key,response){data.set(String(key),response.clone())},async match(key){return data.get(String(key))?.clone()}}};
const scope={location:{origin},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>claimed=true}};
const context={self:scope,URL,Response,caches:{open:async name=>cacheFor(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)},fetch:async()=>{if(!online)throw Error('offline');return new Response(networkBody,{status,headers:{'Content-Type':'text/html'}})}};
vm.createContext(context);vm.runInContext(fs.readFileSync('offline/cards/service-worker.js','utf8'),context);
function lifecycle(name){let promise;handlers[name]({waitUntil:p=>promise=p});return promise;}
function navigation(url,extra={}){let response;const waits=[];handlers.fetch({request:{url,method:'GET',mode:'navigate',...extra},respondWith:p=>response=p,waitUntil:p=>waits.push(p)});return{response,done:()=>Promise.all(waits)}};
(async()=>{
 await lifecycle('install');stores.set('my-blog-v7',new Map());stores.set('other-app',new Map());stores.set('dayboard-shell-old',new Map());await lifecycle('activate');assert(claimed);assert(stores.has('my-blog-v7'));assert(stores.has('other-app'));assert(!stores.has('dayboard-shell-old'));
 online=false;for(const path of ['/cards/?board=one','/cards/?board=two','/cards/index.html?board=three']){const event=navigation(origin+path);assert.equal(await(await event.response).text(),'<html>v1</html>');await event.done();}
 assert.equal(stores.get('dayboard-shell-v1').size,1);
 for(const url of [origin+'/scan/',origin+'/cards/service-worker.js','https://external.test/cards/'])assert.equal(navigation(url).response,undefined);
 assert.equal(navigation(origin+'/cards/',{method:'POST'}).response,undefined);
 online=true;networkBody='<html>v2</html>';const refresh=navigation(origin+'/cards/?board=one');assert.equal(await(await refresh.response).text(),'<html>v1</html>');await refresh.done();online=false;assert.equal(await(await navigation(origin+'/cards/').response).text(),'<html>v2</html>');
 online=true;status=404;await navigation(origin+'/cards/').done();assert.equal(await(await cacheFor('dayboard-shell-v1').match(origin+'/cards/index.html')).text(),'<html>v2</html>');
 await assert.rejects(lifecycle('install'));assert.equal(await(await cacheFor('dayboard-shell-v1').match(origin+'/cards/index.html')).text(),'<html>v2</html>');
 stores.delete('dayboard-shell-v1');online=false;assert.equal((await navigation(origin+'/cards/').response).status,503);
 const html=fs.readFileSync('offline/cards/index.html','utf8');assert(html.includes("scope:'/cards/'"));assert(html.includes("location.protocol==='file:'"));assert(!fs.readFileSync('offline/cards/service-worker.js','utf8').includes('localStorage'));for(const script of html.matchAll(/<script>\n([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 console.log('PASS: install, offline reopen for multiple bookmark URLs, canonical shell-only caching, background refresh, failed-response safety, cache ownership, uncached fallback, standalone guard and app syntax.');
})().catch(e=>{console.error(e);process.exitCode=1});
