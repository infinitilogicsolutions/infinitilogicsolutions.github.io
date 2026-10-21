// Build-only image optimization. Originals remain available for articles and sharing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.join(__dirname,'..'),source=path.join(root,'assets/img/og'),output=path.join(root,'assets/img/thumbs');
async function generate(){
 fs.mkdirSync(output,{recursive:true});const manifest={};
 for(const name of fs.readdirSync(source).sort().filter(name=>/\.(png|jpe?g|webp)$/i.test(name))){
  const file=path.join(source,name),hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,10),stem=path.parse(name).name;
  const variants=[];
  for(const width of [160,480,960]){
   const filename=`${stem}-${hash}-${width}.webp`,destination=path.join(output,filename);
   if(!fs.existsSync(destination))await sharp(file).rotate().resize(width,Math.round(width*9/16),{fit:'cover',position:'centre'}).webp({quality:78,effort:6}).toFile(destination);
   variants.push({src:`/assets/img/thumbs/${filename}`,width});
  }
  manifest[`assets/img/og/${name}`]={src:variants[1].src,srcset:variants.map(v=>`${v.src} ${v.width}w`).join(', '),width:960,height:540};
 }
 fs.writeFileSync(path.join(root,'data/thumbnails.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(`Generated responsive WebP thumbnails for ${Object.keys(manifest).length} covers.`);
}
generate().catch(error=>{console.error(error);process.exitCode=1});
