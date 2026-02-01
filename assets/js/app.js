// Fetch posts data
async function fetchPosts() {
  try {
    const response = await fetch('data/posts.json');
    if (!response.ok) throw new Error('Failed to load posts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

const BLOG_COLORS = [
  'bg-blue-600',
  'bg-teal-600',
  'bg-slate-600',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-emerald-600'
];

const PROJECT_GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-teal-600 to-teal-800',
  'from-slate-600 to-slate-800',
  'from-indigo-600 to-indigo-800',
  'from-emerald-600 to-emerald-800',
  'from-cyan-600 to-cyan-800'
];

function formatDateLong(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatYear(dateString) {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function computeReadTime(contentHtml) {
  const text = stripHtml(contentHtml || '');
  const words = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function getCategory(post) {
  if (post.category) return post.category;
  if (post.tags && post.tags.length > 0) return post.tags[0];
  return post.type === 'project' ? 'Project' : 'General';
}

function getBlogColor(index) {
  return BLOG_COLORS[index % BLOG_COLORS.length];
}

function getProjectGradient(index) {
  return PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];
}

function sortByDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

function createRecentProjectCard(project, index) {
  const category = getCategory(project);
  const year = formatYear(project.date);
  const gradient = getProjectGradient(index);

  return `
    <a href="post.html?slug=${project.slug}">
      <div class="cursor-pointer">
        <div class="aspect-[4/3] bg-gradient-to-br ${gradient} rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
          <span class="font-display text-6xl font-bold text-white/20">${String(index + 1).padStart(2, '0')}</span>
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-mono px-2 py-1 bg-muted rounded-full text-muted-foreground">${category}</span>
          <span class="text-xs text-muted-foreground">${year}</span>
        </div>
        <h3 class="font-display text-xl font-medium group-hover:text-primary transition-colors">${project.title}</h3>
      </div>
    </a>
  `;
}

function createFeaturedProjectCard(project, index) {
  const category = getCategory(project);
  const year = formatYear(project.date);
  const gradient = getProjectGradient(index);

  return `
    <article class="group">
      <a href="post.html?slug=${project.slug}">
        <div class="cursor-pointer">
          <div class="aspect-video bg-gradient-to-br ${gradient} rounded-2xl relative overflow-hidden mb-5 group-hover:scale-[1.02] transition-transform shadow-lg">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="font-display text-8xl font-bold text-white/20">${String(index + 1).padStart(2, '0')}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-xs font-mono text-primary uppercase tracking-wider px-2 py-1 bg-primary/10 rounded-full">${category}</span>
                <h2 class="font-display text-2xl font-semibold mt-3 group-hover:text-primary transition-colors">${project.title}</h2>
              </div>
              <span class="font-mono text-sm text-muted-foreground mt-1">${year}</span>
            </div>
            <p class="text-muted-foreground mb-4 line-clamp-2">${project.summary || ''}</p>
            <div class="flex items-center gap-1 text-sm font-medium text-primary">
              View Project
              <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m13 6 6 6-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

function createOtherProjectCard(project, index) {
  const category = getCategory(project);
  const year = formatYear(project.date);
  const gradient = getProjectGradient(index + 2);

  return `
    <a href="post.html?slug=${project.slug}">
      <div class="group p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-lg cursor-pointer h-full">
        <div class="w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl mb-4 flex items-center justify-center">
          <span class="text-white font-display font-bold">${index + 1}</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-mono text-muted-foreground">${category}</span>
          <span class="text-xs text-muted-foreground">• ${year}</span>
        </div>
        <h3 class="font-display text-lg font-medium mb-2 group-hover:text-primary transition-colors">${project.title}</h3>
        <p class="text-sm text-muted-foreground line-clamp-2">${project.summary || ''}</p>
        <div class="mt-4 flex items-center gap-1 text-sm text-primary">
          View Project
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m13 6 6 6-6 6"></path>
          </svg>
        </div>
      </div>
    </a>
  `;
}

function createBlogCard(post, index) {
  const category = getCategory(post);
  const color = getBlogColor(index);
  const readTime = computeReadTime(post.contentHtml || '');
  const date = formatDateShort(post.date);

  return `
    <article class="group">
      <a href="post.html?slug=${post.slug}">
        <div class="cursor-pointer p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
          <div class="flex flex-col md:flex-row md:items-start gap-6">
            <div class="w-16 h-16 ${color} rounded-xl flex items-center justify-center shrink-0">
              <span class="font-display text-2xl font-bold text-white">${index + 1}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">${category}</span>
                <span class="text-sm text-muted-foreground flex items-center gap-1">
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="w-3.5 h-3.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  ${readTime}
                </span>
              </div>
              <h2 class="font-display text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">${post.title}</h2>
              <p class="text-muted-foreground mb-4">${post.summary || ''}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">${date}</span>
                <span class="text-sm font-medium flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Article
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m13 6 6 6-6 6"></path>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderRecentProjects(projects) {
  const container = document.getElementById('recentProjectsGrid');
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = '<p class="text-muted-foreground">No projects found.</p>';
    return;
  }

  container.innerHTML = projects
    .map((project, index) => `<div class="group">${createRecentProjectCard(project, index)}</div>`)
    .join('');
}

function renderFeaturedProjects(projects) {
  const container = document.getElementById('featuredProjectsGrid');
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = '<p class="text-muted-foreground">No featured projects found.</p>';
    return;
  }

  container.innerHTML = projects.map((project, index) => createFeaturedProjectCard(project, index)).join('');
}

function renderOtherProjects(projects) {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  if (!projects.length) {
    container.innerHTML = '<p class="text-muted-foreground">No additional projects found.</p>';
    return;
  }

  container.innerHTML = projects.map((project, index) => createOtherProjectCard(project, index)).join('');
}

function buildCategoryCounts(posts) {
  const counts = {};
  posts.forEach((post) => {
    const category = getCategory(post);
    counts[category] = (counts[category] || 0) + 1;
  });
  return counts;
}

function renderCategoryPills(categories, activeCategory) {
  const container = document.getElementById('blogCategories');
  if (!container) return;

  container.innerHTML = '';

  const allButton = document.createElement('button');
  allButton.className = 'blog-category-pill px-4 py-2 text-sm font-medium rounded-full transition-all';
  allButton.dataset.active = activeCategory === 'All' ? 'true' : 'false';
  allButton.textContent = `All (${categories.total})`;
  allButton.addEventListener('click', () => updateCategory('All'));
  container.appendChild(allButton);

  categories.list.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'blog-category-pill px-4 py-2 text-sm font-medium rounded-full transition-all';
    button.dataset.active = activeCategory === category.name ? 'true' : 'false';
    button.textContent = `${category.name} (${category.count})`;
    button.addEventListener('click', () => updateCategory(category.name));
    container.appendChild(button);
  });
}

let blogPosts = [];
let activeCategory = 'All';

function updateCategory(category) {
  activeCategory = category;
  const counts = buildCategoryCounts(blogPosts);
  const list = Object.keys(counts).sort().map((name) => ({
    name,
    count: counts[name]
  }));
  renderCategoryPills({ total: blogPosts.length, list }, activeCategory);
  renderBlogPosts(blogPosts, activeCategory);
}

function renderBlogPosts(posts, category) {
  const container = document.getElementById('blogGrid');
  if (!container) return;

  const filtered = category === 'All'
    ? posts
    : posts.filter((post) => getCategory(post) === category);

  if (!filtered.length) {
    container.innerHTML = '<p class="text-muted-foreground">No posts match this category.</p>';
    return;
  }

  container.innerHTML = filtered.map((post, index) => createBlogCard(post, index)).join('');
}

async function loadProjects() {
  const posts = await fetchPosts();
  const projects = posts.filter((post) => post.type === 'project' && post.active !== false).sort(sortByDateDesc);

  if (!projects.length) {
    renderFeaturedProjects([]);
    renderOtherProjects([]);
    renderRecentProjects([]);
    return;
  }

  const featuredExplicit = projects.filter((project) => project.featured === true);
  const featured = featuredExplicit.length ? featuredExplicit : projects.slice(0, 2);
  const remaining = projects.filter((project) => !featured.includes(project));

  renderFeaturedProjects(featured);
  renderOtherProjects(remaining);
  renderRecentProjects(projects.slice(0, 3));
}

async function loadBlogPosts() {
  const posts = await fetchPosts();
  blogPosts = posts.filter((post) => post.type === 'blog' && post.active !== false).sort(sortByDateDesc);

  if (!blogPosts.length) {
    const container = document.getElementById('blogGrid');
    if (container) container.innerHTML = '<p class="text-muted-foreground">No blog posts found.</p>';
    const categories = document.getElementById('blogCategories');
    if (categories) categories.innerHTML = '';
    return;
  }

  const counts = buildCategoryCounts(blogPosts);
  const list = Object.keys(counts).sort().map((name) => ({
    name,
    count: counts[name]
  }));

  renderCategoryPills({ total: blogPosts.length, list }, activeCategory);
  renderBlogPosts(blogPosts, activeCategory);
}

async function loadSinglePost() {
  const container = document.getElementById('postContent');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    container.innerHTML = '<p class="text-muted-foreground">No post specified.</p>';
    return;
  }

  const posts = await fetchPosts();
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    container.innerHTML = '<p class="text-muted-foreground">Post not found.</p>';
    return;
  }

  const category = getCategory(post);
  const date = formatDateShort(post.date);
  const readTime = computeReadTime(post.contentHtml || '');
  const summary = post.summary || '';

  document.title = `${post.title} - InfinitiLogicSolutions`;

  const shareUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/post.html?slug=${post.slug}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  container.innerHTML = `
    <div>
      <a href="${post.type === 'blog' ? 'blog.html' : 'projects.html'}" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path>
          <path d="m12 19-7-7 7-7"></path>
        </svg>
        Back to ${post.type === 'blog' ? 'Blog' : 'Projects'}
      </a>

      <div class="flex flex-wrap items-center gap-4 mb-6">
        <span class="inline-flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 bg-primary/10 text-primary rounded-full">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-3.5 h-3.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"></path>
          </svg>
          ${category}
        </span>
        <span class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-3.5 h-3.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <path d="M16 2v4"></path>
            <path d="M8 2v4"></path>
            <path d="M3 10h18"></path>
          </svg>
          ${date}
        </span>
        <span class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-3.5 h-3.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          ${readTime}
        </span>
      </div>

      <h1 class="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">${post.title}</h1>

      <p class="text-xl text-muted-foreground leading-relaxed mb-12 post-summary">${summary}</p>

      <div class="post-content">
        ${post.contentHtml || ''}
      </div>

      <div class="flex items-center justify-between mt-12 pt-8 border-t border-border">
        <p class="text-sm text-muted-foreground">Share this article</p>
        <div class="flex items-center gap-2">
          <a href="${twitterUrl}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on Twitter">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-2.3-.1-4.2-1.5-4.9-3.6.7.1 1.5.1 2.2-.1C3 12.7 1.6 10.6 2 8.2c.8.4 1.6.6 2.5.6C2.8 7.7 2 5.1 3.5 3.6 5.8 6.2 9.1 7.7 12.7 7.5c-.7-3.1 2-5.2 4.6-3.8 1.1-.2 2.2-.6 3.1-1.2-.3 1.1-1.1 2-2 2.6 1-.1 2-.4 3-.8z"></path>
            </svg>
          </a>
          <a href="${linkedInUrl}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect width="4" height="12" x="2" y="9"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <button class="p-2 rounded-full share-button" type="button" aria-label="Copy link" data-share-copy="true">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"></rect>
              <rect x="2" y="2" width="13" height="13" rx="2"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const copyButton = container.querySelector('[data-share-copy="true"]');
  if (copyButton) {
    copyButton.addEventListener('click', () => sharePost(post.slug, post.title));
  }
}

async function sharePost(slug, title) {
  const url = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/post.html?slug=${slug}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url
      });
      return;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy:', error);
    prompt('Copy this link:', url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('recentProjectsGrid')) {
    loadProjects();
  }
  if (document.getElementById('featuredProjectsGrid') || document.getElementById('projectsGrid')) {
    loadProjects();
  }
  if (document.getElementById('blogGrid')) {
    loadBlogPosts();
  }
  if (document.getElementById('postContent')) {
    loadSinglePost();
  }
});
