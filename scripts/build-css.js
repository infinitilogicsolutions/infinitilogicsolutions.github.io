// Conservative build-time removal of unused compiled utilities. Preserve all base,
// theme, keyframes, properties, non-utility CSS, and classes referenced in templates.
const fs=require('node:fs'),path=require('node:path'),postcss=require('postcss'),selectorParser=require('postcss-selector-parser');
const root=path.join(__dirname,'..');let corpus='';
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 if(entry.name.startsWith('.')||['node_modules','qa-dist','docs'].includes(entry.name))continue;
 const full=path.join(dir,entry.name);
 if(entry.isDirectory())scan(full);else if(/\.(html|js|md)$/.test(entry.name))corpus+='\n'+fs.readFileSync(full,'utf8');
}}
scan(root);const source=fs.readFileSync(path.join(__dirname,'styles-source.css'),'utf8'),css=postcss.parse(source);
let removed=0;
css.walkRules(rule=>{
 let parent=rule.parent,inUtilities=false;
 while(parent){if(parent.type==='atrule'&&parent.name==='layer'&&parent.params==='utilities')inUtilities=true;parent=parent.parent;}
 if(!inUtilities)return;
 const selectors=[];
 selectorParser(tree=>{tree.each(selector=>{let used=true;selector.walkClasses(node=>{if(!corpus.includes(node.value))used=false});if(used)selectors.push(selector.toString())})}).processSync(rule.selector);
 if(!selectors.length){rule.remove();removed++}else rule.selector=selectors.join(',');
});
// Remove only now-empty grouping blocks, retaining all declarations and ordering.
css.walkAtRules(rule=>{if(rule.nodes&&rule.nodes.length===0)rule.remove()});
const result=css.toString();fs.writeFileSync(path.join(root,'assets/css/styles.css'),result);
fs.writeFileSync(path.join(root,'assets/css/site.css'),result+'\n'+fs.readFileSync(path.join(root,'assets/css/custom.css'),'utf8'));
console.log(`CSS: ${source.length} → ${result.length} bytes; removed ${removed} unused utility rules.`);
