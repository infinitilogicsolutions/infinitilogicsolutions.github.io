const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');
const renderArticle = require('../assets/js/article-renderer.js');
const listings = require('../assets/js/listing-renderer.js');
const thumbnails = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/thumbnails.json'),'utf8'));


const POSTS_DIR = path.join(__dirname, '..', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'posts.json');
const POST_TEMPLATE_FILE = path.join(__dirname, '..', 'post.html');
const SITE_URL = (process.env.SITE_URL || 'https://infinitilogicsolutions.github.io/').replace(/\/?$/, '/');

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeMetaContent(value) {
    return escapeHtml(String(value || '').replace(/\s+/g, ' ').trim());
}

function toAbsoluteUrl(value) {
    if (!value) return new URL('opengraph.jpg', SITE_URL).toString();
    if (/^https?:\/\//i.test(value)) return value;
    const clean = value.startsWith('/') ? value.slice(1) : value;
    return new URL(clean, SITE_URL).toString();
}

function formatPublishedTime(value) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function rewriteAssetPaths(html) {
    return html
        .replace(/href="manifest\.json"/g, 'href="/manifest.json"')
        .replace(/href="favicon\.png"/g, 'href="/favicon.png"')
        .replace(/href="opengraph\.jpg"/g, 'href="/opengraph.jpg"')
        .replace(/href="index\.html"/g, 'href="/index.html"')
        .replace(/href="about\.html"/g, 'href="/about.html"')
        .replace(/href="projects\.html"/g, 'href="/projects.html"')
        .replace(/href="blog\.html"/g, 'href="/blog.html"')
        .replace(/href="post\.html"/g, 'href="/post.html"')
        .replace(/href="posts\/([^"]+)\.html"/g, 'href="/posts/$1.html"')
        .replace(/href="assets\//g, 'href="/assets/')
        .replace(/src="assets\//g, 'src="/assets/');
}

function buildPostPage(template, post) {
    const title = normalizeMetaContent(post.title || 'Post');
    const description = normalizeMetaContent(post.summary || 'Latest updates from InfinitiLogicSolutions.');
    const postUrl = new URL(`posts/${post.slug}.html`, SITE_URL).toString();
    const imageUrl = toAbsoluteUrl(post.coverImage || 'opengraph.jpg');
    const ogType = post.type === 'blog' ? 'article' : 'website';
    const publishedTime = ogType === 'article' ? formatPublishedTime(post.date) : '';

    let html = template;

    html = html.replace(/<title>.*?<\/title>/, `<title>${title} - InfinitiLogicSolutions</title>`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);

    const metaBlock = `
  <link rel="canonical" href="${postUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="InfinitiLogicSolutions">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${postUrl}">
  <meta property="og:image" content="${imageUrl}">
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">`;

    html = html.replace('</head>', `${metaBlock}\n</head>`);
    html = html.replace(/<body([^>]*)>/, `<body$1 data-post-slug="${escapeHtml(post.slug)}">`);

    const text = (post.contentHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const encodedUrl = encodeURIComponent(postUrl);
    const shareTitle = encodeURIComponent(post.title || '');
    const article = renderArticle({
        post,
        category: post.category || post.tags?.[0] || (post.type === 'project' ? 'Project' : 'General'),
        date: new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
        readTime: `${Math.max(1, Math.round((text ? text.split(' ').length : 0) / 200))} min read`,
        summary: post.summary || '',
        backLink: post.type === 'blog' ? '/blog.html' : '/projects.html',
        backLabel: post.type === 'blog' ? 'Blog' : 'Projects',
        shareTitle,
        shareLinks: {
            twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodedUrl}`,
            linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        }
    });
    html = html.replace(/<div id="postContent" class="post-detail">[\s\S]*?<\/div>/,
        () => `<div id="postContent" class="post-detail" data-prerendered="true">${article}</div>`);
    return rewriteAssetPaths(html);
}

// Function to parse frontmatter
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
        throw new Error('No frontmatter found');
    }
    
    const frontmatter = yaml.load(match[1]);
    const markdown = match[2];
    
    return { frontmatter, markdown };
}

// Function to generate slug from filename
function generateSlug(filename) {
    return filename.replace(/\.md$/, '').toLowerCase();
}

// Function to process a single markdown file
function processMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, markdown } = parseFrontmatter(content);
    
    // Convert markdown to HTML
    const contentHtml = marked.parse(markdown, {
        breaks: false,
        gfm: true
    });
    
    // Extract filename for slug
    const filename = path.basename(filePath);
    const slug = frontmatter.slug || generateSlug(filename);
    
    const isActive = frontmatter.active === undefined
        ? true
        : String(frontmatter.active).toLowerCase() !== 'false';

    const coverImage = frontmatter.coverImage ? String(frontmatter.coverImage).trim() : '';

    return {
        id: frontmatter.id,
        type: frontmatter.type || 'blog',
        title: frontmatter.title,
        slug: slug,
        date: frontmatter.date,
        summary: frontmatter.summary || '',
        contentHtml: contentHtml.trim(),
        coverImage: coverImage || 'opengraph.jpg',
        thumbnail: thumbnails[coverImage] || null,
        tags: frontmatter.tags || [],
        active: isActive,
        featured: frontmatter.featured === true || String(frontmatter.featured).toLowerCase() === 'true'
    };
}

// Named end markers make regeneration safe even when cards contain nested divs.
function replaceListing(html,id,markup) {
 const opening=new RegExp('<div id="'+id+'"[^>]*>').exec(html);
 if(!opening)throw new Error('Missing listing container: '+id);
 const start=opening.index,endMarker='<!-- /listing:'+id+' -->';
 const markedEnd=html.indexOf(endMarker,start);
 const end=markedEnd>=0?markedEnd+endMarker.length:html.indexOf('</div>',start)+6;
 const tag=opening[0].replace(/ data-prerendered="[^"]*"/g,'').replace(/>$/,' data-prerendered="true">');
 return html.slice(0,start)+tag+markup+'</div>'+endMarker+html.slice(end);
}
function generateListings(index) {
 const projects=index.filter(post=>post.type==='project'&&post.active!==false);
 const explicit=projects.filter(post=>post.featured===true);
 const featured=explicit.length?explicit:projects.slice(0,2);
 const others=projects.filter(post=>!featured.includes(post));
 const blog=index.filter(post=>post.type==='blog'&&post.active!==false);
 const counts={};blog.forEach(post=>{const category=listings.getCategory(post);counts[category]=(counts[category]||0)+1});
 const categories=[['All',blog.length],...Object.keys(counts).sort().map(name=>[name,counts[name]])];
 for(const name of ['index.html','projects.html','blog.html']) {
  const file=path.join(__dirname,'..',name);let html=fs.readFileSync(file,'utf8');
  if(name==='index.html')html=replaceListing(html,'recentProjectsGrid',projects.slice(0,3).map((post,i)=>listings.createRecentProjectCard(post,i)).join(''));
  if(name==='projects.html'){
   html=replaceListing(html,'featuredProjectsGrid',featured.map((post,i)=>listings.createFeaturedProjectCard(post,i)).join(''));
   html=replaceListing(html,'projectsGrid',others.map((post,i)=>listings.createOtherProjectCard(post,i)).join(''));
  }
  if(name==='blog.html'){
   html=replaceListing(html,'blogCategories',categories.map(([name,count])=>`<button type="button" class="blog-category-pill px-4 py-2 text-sm font-medium rounded-full transition-all" data-blog-category="${escapeHtml(name)}" data-active="${name==='All'}" aria-pressed="${name==='All'}">${escapeHtml(name)} (${count})</button>`).join(''));
   html=replaceListing(html,'blogGrid',blog.map((post,i)=>listings.createBlogCard(post,i)).join(''));
   html=html.replace(/<script id="blogListingData" type="application\/json">[\s\S]*?<\/script>\n?/,'');
   html=html.replace('</body>',`<script id="blogListingData" type="application/json">${JSON.stringify(blog).replace(/</g,'\\u003c')}</script>\n</body>`);
  }
  html=html.replace(/<script id="postNotificationData" type="application\/json">[\s\S]*?<\/script>\n?/,'');
  const notifications=index.map(({type,title,summary,date})=>({type,title,summary,date}));
  html=html.replace('</body>',`<script id="postNotificationData" type="application/json">${JSON.stringify(notifications).replace(/</g,'\\u003c')}</script>\n</body>`);
  fs.writeFileSync(file,html.replace(/[ \t]+$/gm,''));
 }
}

// Main function
function generatePostsJson() {
    console.log('🔍 Scanning for markdown files...');
    
    if (!fs.existsSync(POSTS_DIR)) {
        console.log('⚠️  Posts directory does not exist. Creating it...');
        fs.mkdirSync(POSTS_DIR, { recursive: true });
        console.log('✅ Created posts directory');
        return;
    }
    
    const files = fs.readdirSync(POSTS_DIR)
        .filter(file => file.endsWith('.md') && file !== 'README.md')
        .map(file => path.join(POSTS_DIR, file));
    
    if (files.length === 0) {
        console.log('⚠️  No markdown files found in posts directory');
        return;
    }
    
    console.log(`📝 Found ${files.length} markdown file(s)`);
    
    const posts = [];
    
    for (const file of files) {
        try {
            console.log(`   Processing: ${path.basename(file)}`);
            const post = processMarkdownFile(file);
            posts.push(post);
        } catch (error) {
            console.error(`   ❌ Error processing ${path.basename(file)}:`, error.message);
        }
    }
    
    // Filter out future-dated posts (scheduled publishing)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const publishedPosts = posts.filter(post => {
        const postDate = new Date(post.date);
        postDate.setHours(0, 0, 0, 0);
        return postDate <= today;
    });
    
    const futureCount = posts.length - publishedPosts.length;
    if (futureCount > 0) {
        console.log(`⏰ ${futureCount} post(s) scheduled for future publication`);
    }
    
    // Sort posts by date (newest first)
    publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate per-post HTML pages for social previews
    const template = fs.readFileSync(POST_TEMPLATE_FILE, 'utf-8');
    const expectedFiles = new Set(publishedPosts.map((post) => `${post.slug}.html`));
    const existingHtmlFiles = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.html'));

    existingHtmlFiles.forEach((file) => {
        if (!expectedFiles.has(file)) {
            fs.unlinkSync(path.join(POSTS_DIR, file));
        }
    });

    for (const post of publishedPosts) {
        const html = buildPostPage(template, post);
        const outputPath = path.join(POSTS_DIR, `${post.slug}.html`);
        fs.writeFileSync(outputPath, html);
    }
    
    // Write to JSON file
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(publishedPosts, null, 2));
    // Listing pages need metadata, not the complete article bodies.
    const index = publishedPosts.map(({ contentHtml, ...metadata }) => {
        const text = (contentHtml || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = text ? text.split(' ').length : 0;
        return { ...metadata, readTime: `${Math.max(1, Math.round(words / 200))} min read` };
    });
    fs.writeFileSync(path.join(outputDir, 'posts-index.json'), JSON.stringify(index));
    generateListings(index);
    console.log(`✅ Generated ${OUTPUT_FILE} with ${publishedPosts.length} post(s)`);
    console.log(`📅 Posts are checked nightly for scheduled publishing`);
}

// Run the script
try {
    generatePostsJson();
} catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
}
