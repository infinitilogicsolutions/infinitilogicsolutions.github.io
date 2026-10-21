const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const posts=JSON.parse(fs.readFileSync('data/posts-index.json'));
const html=fs.readFileSync('blog.html','utf8'),match=html.match(/<script id="postNotificationData" type="application\/json">([\s\S]*?)<\/script>/);assert(match);
const metadata=JSON.parse(match[1]);assert.equal(metadata.length,posts.length);assert(metadata.every(post=>!Object.hasOwn(post,'contentHtml')));
const storage=new Map(),requests=[];
const context={console,document:{getElementById:()=>({textContent:match[1]})},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},fetch:async url=>{requests.push(url);return{ok:true,json:async()=>posts}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/notifications.js','utf8').split('// Add notification styles')[0]+'\nglobalThis.Manager=PostNotificationManager;',context);
(async()=>{const manager=new context.Manager();await manager.checkForNewPosts(true);assert.equal(requests.length,0);assert.equal(storage.get('last_known_post_count'),String(posts.length));await manager.checkForNewPosts();assert.deepEqual(requests,['/data/posts-index.json']);console.log('PASS embedded initial notification counts, no initial request, small-index subsequent checks, no article bodies.');})().catch(error=>{console.error(error);process.exitCode=1});
