const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../qr/index.html'),'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const s of scripts)new vm.Script(s);
const extra=scripts.find(s=>s.includes('const contactKeys='));
function env(native=true){
const nodes={};function node(id){return nodes[id]??=( {value:'',hidden:false,disabled:false,textContent:'',files:[],children:[],replaceChildren(){this.children=[]},append(x){this.children.push(x)},focus(){},click(){this.clicked=true}});}
const ctx={window:{isSecureContext:true},navigator:{contacts:native?{getProperties:async()=>['name','email','tel','address'],select:async()=>[{name:['Jane Doe'],tel:['+15551234567'],email:['jane@example.com'],address:[{city:'Aldie',region:'VA',country:'USA'}]}]}:undefined},document:{createElement:()=>({})},active:'contact',$:node,capture(){ctx.captured=true},clearPreview(){ctx.cleared=true},console};
node('reset').onclick=()=>{};vm.createContext(ctx);vm.runInContext(extra,ctx);return {ctx,nodes,node};}
(async()=>{
const {ctx,node}=env();
const text='BEGIN:VCARD\r\nVERSION:3.0\r\nN:Doe;Jane;;;\r\nFN:Jane Doe\r\nORG:QR\\; Lab;Team\r\nTEL;TYPE=CELL:+15551234567\r\nEMAIL:jane@example.com\r\nADR;TYPE=HOME:;;Main\\; Street;Aldie;VA;20105;USA\r\nPHOTO;ENCODING=b:AAAA\r\nEND:VCARD\r\n';
const c=ctx.parseVCards(text)[0];assert.equal(c.first,'Jane');assert.equal(c.last,'Doe');assert.equal(c.address,'Main; Street');assert.equal(c.company,'QR; Lab / Team');
assert.equal(ctx.parseVCards('BEGIN:VCARD\nVERSION:4.0\nFN:नमस्ते \n नाम\nEND:VCARD')[0].first,'नमस्ते नाम');
assert.equal(ctx.parseVCards(text+text).length,2);assert.throws(()=>ctx.parseVCards('not a vcard'));assert.throws(()=>ctx.parseVCards('BEGIN:VCARD\nFN;ENCODING=QUOTED-PRINTABLE:=61\nEND:VCARD'));
ctx.applyContact(c);assert.equal(node('f-first').value,'Jane');assert.equal(node('f-company').value,'QR; Lab / Team');assert(ctx.captured&&ctx.cleared);
await node('pickContact').onclick();assert.equal(node('f-first').value,'Jane Doe');assert.equal(node('f-city').value,'Aldie');assert(!node('pickContact').disabled);
ctx.navigator.contacts.select=async()=>{const e=Error();e.name='AbortError';throw e;};await node('pickContact').onclick();assert.match(node('contactStatus').textContent,/canceled/);
ctx.navigator.contacts.select=async()=>[];await node('pickContact').onclick();assert.match(node('contactStatus').textContent,/No contact/);
node('contactFile').files=[{size:10,text:async()=>text+text}];await node('contactFile').onchange();assert.equal(node('contactSelect').children.length,2);assert(!node('contactChoice').hidden);
node('contactSelect').value='1';node('useContact').onclick();assert.equal(node('f-last').value,'Doe');assert(node('contactChoice').hidden);
node('contactFile').files=[{size:1024*1024+1}];await node('contactFile').onchange();assert.match(node('contactStatus').textContent,/smaller than 1 MB/);
const fallback=env(false);await fallback.node('pickContact').onclick();assert(fallback.node('contactFile').clicked);assert.match(fallback.node('contactHelp').textContent,/iPhone/);
console.log('PASS syntax, native selection/cancel, fallback, Unicode/folding/escaping, photo skipping, multi-contact selection, malformed/encoded/oversized rejection, field fill.');
})().catch(e=>{console.error(e);process.exit(1)});
