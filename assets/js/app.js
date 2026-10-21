// Share in-flight and completed requests within this page; retry failures.
const postRequests = new Map();
function fetchPosts(listing = false) {
  const url = listing ? '/data/posts-index.json' : '/data/posts.json';
  if (!postRequests.has(url)) {
    postRequests.set(url, fetch(url).then((response) => {
      if (!response.ok) throw new Error('Failed to load posts');
      return response.json();
    }).catch((error) => {
      postRequests.delete(url);
      console.error('Error fetching posts:', error);
      return [];
    }));
  }
  return postRequests.get(url);
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
  const profile = getLocaleProfile();
  return date.toLocaleDateString(profile.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function formatDateShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const profile = getLocaleProfile();
  return date.toLocaleDateString(profile.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function formatYear(dateString) {
  if (!dateString) return '';
  const profile = getLocaleProfile();
  return new Intl.DateTimeFormat(profile.locale, {
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(dateString));
}

function getLocaleProfile() {
  const namespaceProfile = window.InfinitiVisitor && window.InfinitiVisitor.getState
    ? window.InfinitiVisitor.getState('profile')
    : null;

  if (namespaceProfile) {
    return {
      locale: namespaceProfile.language || 'en-US',
      timeZone: namespaceProfile.timezone || undefined
    };
  }

  try {
    const cached = JSON.parse(window.localStorage.getItem('ils_fingerprint_cache') || 'null');

    return {
      locale: (cached && cached.language) || 'en-US',
      timeZone: cached && cached.timezone ? cached.timezone : undefined
    };
  } catch (error) {
    return {
      locale: 'en-US',
      timeZone: undefined
    };
  }
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

function buildPostUrl(slug) {
  if (!slug) return '';
  const siteRoot = window.location.origin;
  return new URL(`/posts/${slug}.html`, siteRoot).toString();
}

function buildShareLinks(post) {
  const url = buildPostUrl(post.slug);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(post.title || '');

  return {
    url,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };
}

function bindShareCopyButtons(container) {
  if (!container) return;

  const buttons = container.querySelectorAll('[data-share-copy="true"]');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const slug = button.dataset.shareSlug;
      const encodedTitle = button.dataset.shareTitle || '';
      const title = encodedTitle ? decodeURIComponent(encodedTitle) : '';

      if (slug) {
        sharePost(slug, title);
      }
    });
  });
}

const {createRecentProjectCard,createFeaturedProjectCard,createOtherProjectCard,createBlogCard} = window.InfinitiListings || {};

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
  const listing=document.getElementById('blogGrid');
  if(listing?.dataset.prerendered==='true') {
    document.querySelectorAll('#blogCategories button[data-blog-category]').forEach(button=>{
      const selected=button.dataset.blogCategory===category;
      button.dataset.active=String(selected);button.setAttribute('aria-pressed',String(selected));
    });
    listing.querySelectorAll('article[data-blog-category]').forEach(article=>{article.hidden=category!=='All' && article.dataset.blogCategory!==category;});
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
  bindShareCopyButtons(container);
}

async function loadProjects() {
  const containers=['recentProjectsGrid','featuredProjectsGrid','projectsGrid'].map(id=>document.getElementById(id)).filter(Boolean);
  if(containers.length && containers.every(node=>node.dataset.prerendered==='true')) return;
  const posts = await fetchPosts(true);
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
  const listing=document.getElementById('blogGrid');
  const metadata=document.getElementById('blogListingData');
  if(listing?.dataset.prerendered==='true' && metadata) {
    if(listing.dataset.hydrated==='true') return;
    try { blogPosts=JSON.parse(metadata.textContent); } catch(error) { console.error('Invalid blog listing metadata:',error); return; }
    listing.dataset.hydrated='true';
    const categories=document.getElementById('blogCategories');
    categories.addEventListener('click',event=>{
      const button=event.target.closest('button[data-blog-category]');
      if(button && categories.contains(button)) updateCategory(button.dataset.blogCategory);
    });
    bindShareCopyButtons(listing);
    return;
  }
  const posts = await fetchPosts(true);
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
  // Generated pages already contain the complete article. Never replace it on
  // fingerprint-ready: that causes layout shifts and resets reading position.
  if (container.dataset.prerendered === 'true') {
    if (!container.dataset.shareBound) {
      bindShareCopyButtons(container);
      container.dataset.shareBound = 'true';
    }
    return;
  }


  const params = new URLSearchParams(window.location.search);
  let slug = params.get('slug');
  if (!slug) {
    slug = document.body?.dataset?.postSlug || window.POST_SLUG;
  }
  if (!slug) {
    const match = window.location.pathname.match(/\/posts\/([^/]+)\.html$/);
    if (match) {
      slug = match[1];
    }
  }

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
  const readTime = post.readTime || computeReadTime(post.contentHtml || '');
  const summary = post.summary || '';
  const backLink = post.type === 'blog' ? '/blog.html' : '/projects.html';
  const backLabel = post.type === 'blog' ? 'Blog' : 'Projects';

  document.title = `${post.title} - InfinitiLogicSolutions`;

  const shareLinks = buildShareLinks(post);
  const shareTitle = encodeURIComponent(post.title || '');

  container.innerHTML = renderArticle({ post, category, date, readTime, summary, backLink, backLabel, shareLinks, shareTitle });

  bindShareCopyButtons(container);
}

async function sharePost(slug, title) {
  const url = buildPostUrl(slug);

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

if (window.InfinitiVisitor && window.InfinitiVisitor.events) {
  document.addEventListener(window.InfinitiVisitor.events.fingerprintReady,()=>{
    if(document.getElementById('postContent')) loadSinglePost();
  },{once:true});
}
