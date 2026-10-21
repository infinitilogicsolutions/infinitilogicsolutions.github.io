// One renderer for generated listings and progressive client-side fallbacks.
(function(root) {
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
    timeZone: profile.timeZone
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
    timeZone: profile.timeZone
  });
}

function formatYear(dateString) {
  if (!dateString) return '';
  const profile = getLocaleProfile();
  return new Intl.DateTimeFormat(profile.locale, {
    year: 'numeric',
    timeZone: profile.timeZone
  }).format(new Date(dateString));
}

function getLocaleProfile() { return {locale:'en-US',timeZone:'UTC'}; }

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
  const siteRoot = 'https://infinitilogicsolutions.github.io';
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

function renderThumbnail(post, className, sizes) {
  const image = post.thumbnail;
  if (!image) return '';
  return `<img src="${projectText(image.src)}" srcset="${projectText(image.srcset)}" sizes="${sizes}" width="${image.width}" height="${image.height}" alt="" class="${className}" loading="lazy" decoding="async">`;
}
// Explicit routes only: unknown/future projects retain the article fallback.
const PROJECT_APPS = {
  'canvas-lab-studio': ['/canvas-lab/', 'Canvas Lab Studio'],
  'qr-lab-offline-generator-reader': ['/qr/', 'QR Lab'],
  'dayboard-local-kanban': ['/cards/', 'Dayboard'],
  'paperlens-browser-document-scanner': ['/scan/', 'Paperlens']
};
function projectText(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
function createProjectCard(project, index, featured) {
  const app = PROJECT_APPS[project.slug];
  const title = projectText(app ? app[1] : project.title);
  const articleUrl = buildPostUrl(project.slug);
  const destination = app ? app[0] : articleUrl;
  const image = project.thumbnail && !String(project.coverImage || '').endsWith('/default.jpg')
    ? renderThumbnail(project, 'project-cover', '(max-width:767px) calc(100vw - 48px), 470px')
    : `<div class="project-symbol" aria-hidden="true">${projectText(app ? app[1] : getCategory(project))}</div>`;
  const heading = featured ? 'h2' : 'h3';
  return `<article class="project-card group">
    <a href="${destination}" class="project-preview" aria-label="${app ? 'Open ' : 'Read about '}${title}">${image}</a>
    <div class="flex items-center gap-2 mb-2"><span class="text-xs font-mono text-primary">${projectText(getCategory(project))}</span><span class="text-xs text-muted-foreground">${formatYear(project.date)}</span></div>
    <${heading} class="font-display text-2xl font-semibold"><a href="${destination}">${title}</a></${heading}>
    <p class="text-muted-foreground mt-2 line-clamp-2">${projectText(project.summary)}</p>
    <div class="project-actions">${app ? `<a class="project-open" href="${app[0]}" aria-label="Open ${title}">Open app <span aria-hidden="true">↗</span></a>` : ''}<a href="${articleUrl}" aria-label="Read about ${title}">${app ? 'About this app' : 'View project'}</a></div>
  </article>`;
}
function createRecentProjectCard(project, index) { return createProjectCard(project, index, false); }
function createFeaturedProjectCard(project, index) { return createProjectCard(project, index, true); }

function createOtherProjectCard(project, index) {
  const category = getCategory(project);
  const year = formatYear(project.date);
  const gradient = getProjectGradient(index + 2);
  const postUrl = buildPostUrl(project.slug);

  return `
    <a href="${postUrl}">
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
  const readTime = post.readTime || computeReadTime(post.contentHtml || '');
  const date = formatDateShort(post.date);
  const shareLinks = buildShareLinks(post);
  const shareTitle = encodeURIComponent(post.title || '');
  const postUrl = buildPostUrl(post.slug);
  const coverImage = post.coverImage || 'opengraph.jpg';

  return `
    <article class="group" data-blog-category="${projectText(category)}">
      <div class="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
        <div class="flex flex-col md:flex-row md:items-start gap-6">
          <div class="blog-cover">
            ${renderThumbnail(post, 'blog-cover-img', '(max-width:640px) 72px, (min-width:1024px) 200px, 160px')}
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
            <h2 class="font-display text-2xl font-semibold mb-2">
              <a href="${postUrl}" class="group-hover:text-primary transition-colors">${post.title}</a>
            </h2>
            <p class="text-muted-foreground mb-4">${post.summary || ''}</p>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span class="text-sm text-muted-foreground">${date}</span>
              <div class="flex flex-wrap items-center gap-3">
                <a href="${postUrl}" class="text-sm font-medium flex items-center gap-1 text-primary">
                  Read Article
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m13 6 6 6-6 6"></path>
                  </svg>
                </a>
                <div class="flex items-center gap-2">
                  <a href="${shareLinks.twitter}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on X">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-2.3-.1-4.2-1.5-4.9-3.6.7.1 1.5.1 2.2-.1C3 12.7 1.6 10.6 2 8.2c.8.4 1.6.6 2.5.6C2.8 7.7 2 5.1 3.5 3.6 5.8 6.2 9.1 7.7 12.7 7.5c-.7-3.1 2-5.2 4.6-3.8 1.1-.2 2.2-.6 3.1-1.2-.3 1.1-1.1 2-2 2.6 1-.1 2-.4 3-.8z"></path>
                    </svg>
                  </a>
                  <a href="${shareLinks.linkedIn}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on LinkedIn">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="${shareLinks.facebook}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on Facebook">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <button class="p-2 rounded-full share-button" type="button" aria-label="Copy link" data-share-copy="true" data-share-slug="${post.slug}" data-share-title="${shareTitle}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                      <rect x="2" y="2" width="13" height="13" rx="2"></rect>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}


 const api={createRecentProjectCard,createFeaturedProjectCard,createOtherProjectCard,createBlogCard,getCategory};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.InfinitiListings=api;
})(typeof window!=='undefined'?window:globalThis);
