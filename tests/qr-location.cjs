const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../qr/index.html'),'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);for(const s of scripts)new vm.Script(s);
const nodes={},$=id=>nodes[id]??={value:'',textContent:'',disabled:false,hidden:false};$('reset').onclick=()=>{};
let request,called=0;const ctx={window:{isSecureContext:true,addEventListener(){}},navigator:{geolocation:{getCurrentPosition(ok,fail,options){called++;request={ok,fail,options};}}},active:'location',$,capture(){},clearPreview(){ctx.cleared=true},console};vm.createContext(ctx);vm.runInContext(scripts.at(-1),ctx);
assert.equal(called,0);$('useLocation').onclick();assert.equal(called,1);assert($('useLocation').disabled);assert.equal(request.options.maximumAge,0);assert.equal(request.options.timeout,10000);
request.ok({coords:{latitude:38.91234567,longitude:-77.4567891,accuracy:12.1}});assert.equal($('f-lat').value,'38.912346');assert.equal($('f-lon').value,'-77.456789');assert.match($('locationStatus').textContent,/±13 m/);assert(ctx.cleared);assert(!$('useLocation').disabled);
for(const code of [1,2,3]){$('useLocation').onclick();request.fail({code});assert(!$('useLocation').disabled);assert.equal($('f-lat').value,'38.912346');}
$('useLocation').onclick();const stale=request;ctx.active='wifi';ctx.syncLocationTools();stale.ok({coords:{latitude:1,longitude:2,accuracy:1}});assert.equal($('f-lat').value,'38.912346');
ctx.active='location';ctx.syncLocationTools();$('useLocation').onclick();request.ok({coords:{latitude:99,longitude:2,accuracy:1}});assert.match($('locationStatus').textContent,/invalid/);
ctx.window.isSecureContext=false;$('useLocation').onclick();assert.match($('locationStatus').textContent,/HTTPS/);
ctx.window.isSecureContext=true;ctx.navigator.geolocation=undefined;$('useLocation').onclick();assert.match($('locationStatus').textContent,/not available/);
console.log('PASS no automatic permission request, success/accuracy/rounding, denial/unavailable/timeout, stale result, invalid coordinates, insecure/unsupported fallback and script syntax.');
