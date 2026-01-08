# My Blog

A modern, responsive personal blog and portfolio website built with HTML, CSS, and JavaScript. Designed to be hosted for free on GitHub Pages.

## Features

- 🎨 Beautiful, modern design with gradient accents
- 📱 Fully responsive (mobile, tablet, desktop)
- 🚀 Fast and lightweight (no frameworks required)
- 📝 Simple JSON-based content management
- 🔗 Shareable post URLs with Web Share API support
- ✨ Smooth animations and transitions
- 🎯 SEO-friendly structure

## Structure

```
Blog/
  ├── index.html          # Hero page with centered logo
  ├── about.html          # About page
  ├── projects.html       # Projects showcase
  ├── blog.html           # Blog posts (with expand cards)
  ├── post.html           # Single post view (shareable)
  ├── 404.html            # Custom 404 page
  ├── assets/
  │   ├── css/
  │   │   └── styles.css  # All styles
  │   ├── js/
  │   │   └── app.js      # All JavaScript logic
  │   └── img/
  │       └── logo.png    # Your logo
  └── data/
      └── posts.json      # Content database
```

## Getting Started

### Choose Your Workflow

You can manage content in two ways:

**Option A: Markdown Files (Recommended)** 📝
- Write posts in `posts/*.md` using Markdown
- Push to GitHub
- GitHub Actions automatically generates `data/posts.json`
- See `posts/README.md` for full documentation

**Option B: Direct JSON Editing** ✏️
- Manually edit `data/posts.json`
- Immediate local changes (no build step)

### 1. Add Your Logo

Replace `assets/img/logo.png` with your own logo image (recommended size: 400x400px or similar).

### 2. Customize Content

#### Using Markdown (Recommended)

1. Create a new `.md` file in the `posts/` directory
2. Add frontmatter (metadata) at the top:

```markdown
---
id: 1
type: blog
title: Your Title
date: 2026-01-05
summary: Brief description
---

Your content here in **Markdown**!
```

3. Commit and push - GitHub Actions handles the rest!

See `posts/README.md` for detailed instructions.

#### Direct JSON Editing

Edit `data/posts.json` to add your own projects and blog posts. Each entry should have:

```json
{
  "id": 1,
  "type": "project" or "blog",
  "title": "Your Title",
  "slug": "url-friendly-slug",
  "date": "2026-01-05",
  "summary": "Brief description",
  "contentHtml": "<p>Full HTML content</p>",
  "coverImage": "path/to/image.jpg" (optional)
}
```

### 3. Update About Page

Edit `about.html` to add your personal information, bio, and social links.

### 4. Customize Colors

Update CSS custom properties in `assets/css/styles.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* ... other variables ... */
}
```

## Deploying to GitHub Pages

### Option 1: User Site (username.github.io)

1. Create a repo named `username.github.io`
2. Push your code to the `main` branch
3. Your site will be live at `https://username.github.io/`

### Option 2: Project Site

1. Create a repo (e.g., `my-blog`)
2. Push your code
3. Go to **Settings** → **Pages**
4. Set source to **Deploy from a branch**
5. Select `main` branch and `/ (root)` folder
6. Your site will be live at `https://username.github.io/my-blog/`

## Features Explained

### Hero Page (index.html)

Full-screen centered logo with animated down arrow that navigates to About page.

### Projects Page

- Displays all items with `type: "project"`
- Click card → navigate to full post page
- Great for showcasing your work portfolio

### Blog Page

- Displays all items with `type: "blog"`
- Click card → expands inline to show full content
- "Open Full Page" button for shareable link
- Share button to share via Web Share API or copy link

### Post Page (Shareable)

- Dedicated page for each post/project
- Accessed via `post.html?slug=your-slug`
- Perfect for sharing on social media
- Back button returns to appropriate section

### Share Functionality

1. **Web Share API** (mobile): Native share dialog
2. **Fallback**: Copy link to clipboard
3. **Final fallback**: Show link in prompt

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on all devices
- Graceful fallbacks for older browsers

## Performance

- No external dependencies
- Minimal JavaScript
- Optimized CSS with modern features
- Fast load times

## Future Enhancements (Optional)

- Add PWA support with `manifest.json` and service worker
- Implement dark mode toggle
- Add RSS feed
- Add comments system (via third-party service)
- Add search functionality
- Implement tags/categories filtering

## License

MIT License - Feel free to use this for your own blog!

## Credits

Built with ❤️ using vanilla HTML, CSS, and JavaScript.
