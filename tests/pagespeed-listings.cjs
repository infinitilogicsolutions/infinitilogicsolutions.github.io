const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const posts=JSON.parse(fs.readFileSync('data/posts-index.json')),blog=posts.filter(p=>p.type==='blog'&&p.active!==false);
for(const name of ['index.html','projects.html','blog.html']){
 const html=fs.readFileSync(name,'utf8');assert(!/Loading (posts|projects|categories)/.test(html),name+' must be readable before JavaScript');
 assert(html.includes('data-prerendered="true"'));assert(html.includes('/assets/img/thumbs/'));
 for(const match of html.matchAll(/<img[^>]*src="(\/assets\/img\/thumbs\/[^\"]+)"[^>]*>/g)){
  assert(fs.existsSync('.'+match[1]),'Referenced thumbnail must exist');assert(/width="\d+"/.test(match[0])&&/height="\d+"/.test(match[0]));assert(match[0].includes('srcset='));
 }
 assert.equal((html.match(/<link rel="stylesheet"/g)||[]).length,1);
}
const html=fs.readFileSync('blog.html','utf8');assert.equal((html.match(/<article class="group" data-blog-category=/g)||[]).length,blog.length);
assert(html.includes('Feb 2, 2026'),'Publication date must not move to the previous day');
const rows=blog.map(post=>({dataset:{blogCategory:post.tags[0]},hidden:false}));
const categories=['All',...new Set(rows.map(row=>row.dataset.blogCategory))].map(name=>({dataset:{blogCategory:name},setAttribute(k,v){this[k]=v}}));
const handlers={},listing={dataset:{prerendered:'true'},querySelectorAll:()=>rows,querySelector:()=>null};Object.defineProperty(listing,'innerHTML',{set(){throw Error('Static listing was replaced')}});
let categoryHandler,fetches=0;
const categoryRoot={contains:()=>true,addEventListener(type,fn){categoryHandler=fn}};
const nodes={blogGrid:listing,blogCategories:categoryRoot,blogListingData:{textContent:JSON.stringify(blog)},featuredProjectsGrid:{dataset:{prerendered:'true'}},projectsGrid:{dataset:{prerendered:'true'}}};
const context={console,URL,window:{InfinitiListings:require('../assets/js/listing-renderer'),InfinitiVisitor:{events:{fingerprintReady:'profile-ready'}}},document:{getElementById:id=>nodes[id]||null,querySelectorAll:()=>categories,addEventListener(name,fn){handlers[name]=fn}},fetch(){fetches++;throw Error('Static listings must not fetch article JSON')}};
listing.querySelectorAll=selector=>selector.includes('data-share-copy')?[]:rows;
vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/app.js','utf8'),context);
(async()=>{
 await vm.runInContext('loadProjects();loadBlogPosts()',context);assert(categoryHandler);assert.equal(fetches,0);
 const target={dataset:{blogCategory:'DuckDB'}};categoryHandler({target:{closest:()=>target}});
 assert.equal(rows.filter(row=>!row.hidden).length,1);assert.equal(rows.find(row=>!row.hidden).dataset.blogCategory,'DuckDB');
 handlers['profile-ready']();assert.equal(fetches,0);assert.equal(rows.filter(row=>!row.hidden).length,1,'Profile detection must preserve the selected category');
 target.dataset.blogCategory='All';categoryHandler({target:{closest:()=>target}});assert(rows.every(row=>!row.hidden));
 await vm.runInContext('loadBlogPosts()',context);assert.equal(fetches,0);
 console.log('PASS initial HTML, existing thumbnail URLs/dimensions, single stylesheet, UTC publication dates, category filtering without replacement, profile-event stability, no listing JSON fetch.');
})().catch(error=>{console.error(error);process.exitCode=1});
