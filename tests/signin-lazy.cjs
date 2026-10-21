const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(cached){
 const storage=new Map(cached?[['profile',JSON.stringify(cached)]]:[]),scripts=[],state={},listeners={};
 const status={textContent:''},host={replaceChildren(){}},close={addEventListener(){}};
 const dialog={open:false,querySelector:s=>s==='[data-signin-status]'?status:s==='[data-google-button]'?host:close,setAttribute(){},showModal(){this.open=true},close(){this.open=false}};
 const ns={config:{oneTapEnabled:true,googleClientId:'test-client'},storageKeys:{googleProfile:'profile'},events:{identityReady:'identity'},parseJson:(value,fallback)=>value?JSON.parse(value):fallback,getState:key=>state[key],setState:(key,value)=>state[key]=value};
 const context={console,atob:value=>Buffer.from(value,'base64').toString('binary'),window:{InfinitiVisitor:ns,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}},document:{createElement:tag=>tag==='dialog'?dialog:{dataset:{},remove(){this.removed=true}},body:{appendChild(){}},head:{appendChild(script){scripts.push(script)}},addEventListener:(name,fn)=>listeners[name]=fn}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/one-tap.js','utf8'),context);
 return{context,ns,scripts,state,status,dialog,storage};
}
(async()=>{
 const e=setup();assert.equal(e.scripts.length,0,'Ordinary browsing must not load Google');
 const loading=e.ns.requestSignIn();assert(e.dialog.open);assert.equal(e.scripts.length,1);
 let initialization,renders=0;
 e.context.window.google={accounts:{id:{initialize:options=>initialization=options,renderButton(){renders++}}}};
 e.scripts[0].onload();await loading;assert.equal(renders,1);assert(initialization);assert.equal(initialization.auto_select,false);
 await e.ns.requestSignIn();assert.equal(e.scripts.length,1,'Reuse the loaded SDK');assert.equal(renders,2);
 const payload={sub:'test-user',name:'Test User',email:'test@example.test'};
 initialization.callback({credential:'header.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.signature'});
 assert.equal(e.state.identity.googleSubId,'test-user');assert.equal(JSON.parse(e.storage.get('profile')).googleName,'Test User');assert(!e.dialog.open);
 const cached=setup({googleSubId:'cached-user',googleName:'Cached User'});assert.equal(cached.state.identity.googleSubId,'cached-user');assert.equal(cached.scripts.length,0);
 const failed=setup();const request=failed.ns.requestSignIn();failed.scripts[0].onerror();await request;assert.match(failed.status.textContent,/unavailable/);assert(failed.scripts[0].removed);
 const retry=failed.ns.requestSignIn();assert.equal(failed.scripts.length,2);failed.scripts[1].onerror();await retry;
 const disabled=setup();disabled.ns.config.oneTapEnabled=false;await disabled.ns.requestSignIn();assert.equal(disabled.scripts.length,0);
 console.log('PASS no automatic Google requests, explicit load, SDK reuse, unchanged identity callback/storage, cached identity restoration, retryable network failure and disabled configuration.');
})().catch(error=>{console.error(error);process.exitCode=1});
