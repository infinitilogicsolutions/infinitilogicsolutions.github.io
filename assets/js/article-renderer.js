// Shared by the static generator and the offline fallback page.
(function (root) {
  function renderArticle({ post, category, date, readTime, summary, backLink, backLabel, shareLinks, shareTitle }) {
  return `
    <div>
      <a href="${backLink}" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path>
          <path d="m12 19-7-7 7-7"></path>
        </svg>
        Back to ${backLabel}
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
          <a href="${shareLinks.twitter}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on X">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-2.3-.1-4.2-1.5-4.9-3.6.7.1 1.5.1 2.2-.1C3 12.7 1.6 10.6 2 8.2c.8.4 1.6.6 2.5.6C2.8 7.7 2 5.1 3.5 3.6 5.8 6.2 9.1 7.7 12.7 7.5c-.7-3.1 2-5.2 4.6-3.8 1.1-.2 2.2-.6 3.1-1.2-.3 1.1-1.1 2-2 2.6 1-.1 2-.4 3-.8z"></path>
            </svg>
          </a>
          <a href="${shareLinks.linkedIn}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect width="4" height="12" x="2" y="9"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <a href="${shareLinks.facebook}" target="_blank" rel="noreferrer" class="p-2 rounded-full share-button" aria-label="Share on Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <button class="p-2 rounded-full share-button" type="button" aria-label="Copy link" data-share-copy="true" data-share-slug="${post.slug}" data-share-title="${shareTitle}">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"></rect>
              <rect x="2" y="2" width="13" height="13" rx="2"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = renderArticle;
  else root.renderArticle = renderArticle;
})(typeof window !== 'undefined' ? window : globalThis);
