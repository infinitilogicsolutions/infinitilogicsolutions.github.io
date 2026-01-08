const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'posts.json');

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

    return {
        id: frontmatter.id,
        type: frontmatter.type || 'blog',
        title: frontmatter.title,
        slug: slug,
        date: frontmatter.date,
        summary: frontmatter.summary || '',
        contentHtml: contentHtml.trim(),
        coverImage: frontmatter.coverImage || '',
        tags: frontmatter.tags || [],
        active: isActive
    };
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
        .filter(file => file.endsWith('.md'))
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
    
    // Write to JSON file
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(publishedPosts, null, 2));
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
