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

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getMonogram(title) {
    if (!title) return 'IL';
    const cleaned = title.replace(/[^A-Za-z0-9 ]/g, ' ').trim();
    if (!cleaned) return 'IL';
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

// Create card element
function createCard(post, isHorizontal = false) {
    const card = document.createElement('div');
    card.className = isHorizontal ? 'card card-horizontal' : 'card';
    card.dataset.slug = post.slug;

    let coverImage = '';
    if (post.coverImage) {
        coverImage = `<img src="${post.coverImage}" alt="${post.title}" class="card-image">`;
    } else {
        const monogram = getMonogram(post.title);
        const icon = post.type === 'project'
            ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"></path></svg>'
            : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19l4.5-1 9.5-9.5-3.5-3.5L5 14.5 4 19z"></path><path d="M14 5l3.5 3.5"></path></svg>';
        coverImage = `
            <div class="card-image card-placeholder" aria-hidden="true">
                <div class="card-placeholder-inner">
                    <span class="card-placeholder-icon">${icon}</span>
                    <span class="card-placeholder-monogram">${monogram}</span>
                </div>
            </div>
        `;
    }

    // Tags display
    const tagsHtml = post.tags && post.tags.length > 0 ? `
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="tag" onclick="filterByTag('${tag}'); event.stopPropagation();">${tag}</span>`).join('')}
        </div>
    ` : '';

    const actions = isHorizontal ? `
        <div class="card-actions">
            <a href="post.html?slug=${post.slug}" class="btn btn-primary">Read Full Article</a>
            <button class="btn btn-secondary share-btn" onclick="sharePost('${post.slug}', '${post.title}'); event.stopPropagation();">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>
        </div>
    ` : '';

    card.innerHTML = `
        ${coverImage}
        <div class="card-content">
            <h2 class="card-title">${post.title}</h2>
            <p class="card-date">${formatDate(post.date)}</p>
            <p class="card-summary">${post.summary}</p>
            ${tagsHtml}
            ${actions}
        </div>
    `;

    // Only make non-horizontal cards clickable for navigation
    if (!isHorizontal) {
        card.addEventListener('click', () => {
            window.location.href = `post.html?slug=${post.slug}`;
        });
    }

    return card;
}

// Load projects
async function loadProjects() {
    const posts = await fetchPosts();
    const projects = posts.filter(post => post.type === 'project' && post.active !== false);
    const container = document.getElementById('projectsGrid');

    if (projects.length === 0) {
        container.innerHTML = '<p class="error">No projects found.</p>';
        return;
    }

    container.innerHTML = '';
    projects.forEach(project => {
        container.appendChild(createCard(project, false));
    });
}

// Global state for filtering
let allBlogPosts = [];
let currentFilters = {
    tag: 'all',
    date: 'all',
    sort: 'date-desc'
};

// Load blog posts
async function loadBlogPosts() {
    const posts = await fetchPosts();
    allBlogPosts = posts.filter(post => post.type === 'blog' && post.active !== false);
    
    if (allBlogPosts.length === 0) {
        document.getElementById('blogGrid').innerHTML = '<p class="error">No blog posts found.</p>';
        return;
    }

    // Populate filter dropdowns
    populateFilters();
    
    // Set up event listeners
    setupFilterListeners();
    
    // Display posts
    displayFilteredPosts();
}

// Populate filter dropdowns
function populateFilters() {
    // Collect all unique tags
    const allTags = new Set();
    allBlogPosts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const tagFilter = document.getElementById('tagFilter');
    Array.from(allTags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
    
    // Collect unique year-month combinations
    const dates = new Set();
    allBlogPosts.forEach(post => {
        const date = new Date(post.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        dates.add(yearMonth);
    });
    
    const dateFilter = document.getElementById('dateFilter');
    Array.from(dates).sort().reverse().forEach(yearMonth => {
        const [year, month] = yearMonth.split('-');
        const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const option = document.createElement('option');
        option.value = yearMonth;
        option.textContent = monthName;
        dateFilter.appendChild(option);
    });
}

// Set up filter event listeners
function setupFilterListeners() {
    document.getElementById('tagFilter').addEventListener('change', (e) => {
        currentFilters.tag = e.target.value;
        displayFilteredPosts();
    });
    
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        currentFilters.date = e.target.value;
        displayFilteredPosts();
    });
    
    document.getElementById('sortBy').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        displayFilteredPosts();
    });
    
    document.getElementById('resetFilters').addEventListener('click', () => {
        currentFilters = { tag: 'all', date: 'all', sort: 'date-desc' };
        document.getElementById('tagFilter').value = 'all';
        document.getElementById('dateFilter').value = 'all';
        document.getElementById('sortBy').value = 'date-desc';
        displayFilteredPosts();
    });
}

// Filter by tag (called from tag click)
function filterByTag(tag) {
    currentFilters.tag = tag;
    document.getElementById('tagFilter').value = tag;
    displayFilteredPosts();
}

// Display filtered and sorted posts
function displayFilteredPosts() {
    let filtered = [...allBlogPosts];
    
    // Filter by tag
    if (currentFilters.tag !== 'all') {
        filtered = filtered.filter(post => 
            post.tags && post.tags.includes(currentFilters.tag)
        );
    }
    
    // Filter by date (year-month)
    if (currentFilters.date !== 'all') {
        filtered = filtered.filter(post => {
            const postDate = new Date(post.date);
            const postYearMonth = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
            return postYearMonth === currentFilters.date;
        });
    }
    
    // Sort posts
    filtered.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    
    // Update active filters display
    updateActiveFilters(filtered.length);
    
    // Render posts
    const container = document.getElementById('blogGrid');
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="error">No posts match your filters.</p>';
        return;
    }
    
    filtered.forEach(post => {
        container.appendChild(createCard(post, true));
    });
}

// Update active filters display
function updateActiveFilters(resultCount) {
    const activeFiltersDiv = document.getElementById('activeFilters');
    const badges = [];
    
    if (currentFilters.tag !== 'all') {
        badges.push(`Tag: ${currentFilters.tag}`);
    }
    
    if (currentFilters.date !== 'all') {
        const [year, month] = currentFilters.date.split('-');
        const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        badges.push(`Date: ${monthName}`);
    }
    
    if (badges.length > 0) {
        activeFiltersDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span style="font-weight: 600; color: var(--text-color);">Showing ${resultCount} post(s):</span>
                ${badges.map(badge => `<span class="filter-badge">${badge}</span>`).join('')}
            </div>
        `;
    } else {
        activeFiltersDiv.innerHTML = '';
    }
}

// Load single post
async function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        document.getElementById('postContent').innerHTML = '<p class="error">No post specified.</p>';
        return;
    }

    const posts = await fetchPosts();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        document.getElementById('postContent').innerHTML = '<p class="error">Post not found.</p>';
        return;
    }

    // Update page title
    document.title = `${post.title} - InfinitiLogicSolutions`;

    const coverImage = post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" class="post-cover">` : '';
    
    const tagsHtml = post.tags && post.tags.length > 0 ? `
        <div class="post-tags" style="margin-top: 1rem;">
            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    ` : '';

    document.getElementById('postContent').innerHTML = `
        <div class="post-header">
            <h1 class="post-title">${post.title}</h1>
            <div class="post-meta">
                <span class="post-type">${post.type}</span>
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
            ${tagsHtml}
        </div>
        ${coverImage}
        <div class="post-content">
            ${post.contentHtml}
        </div>
        <div class="post-actions">
            <button class="btn btn-primary share-btn" onclick="sharePost('${post.slug}', '${post.title}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>
            <a href="${post.type === 'blog' ? 'blog.html' : 'projects.html'}" class="btn btn-secondary">
                Back to ${post.type === 'blog' ? 'Blog' : 'Projects'}
            </a>
        </div>
    `;
}

// Share post function
async function sharePost(slug, title) {
    const url = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/post.html?slug=${slug}`;
    
    // Try Web Share API first
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                url: url
            });
            return;
        } catch (err) {
            // User cancelled or error occurred
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    }
    
    // Fallback: Copy to clipboard
    try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        // Final fallback: show the URL
        prompt('Copy this link:', url);
    }
}
