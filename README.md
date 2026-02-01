# My Blog

A modern, responsive personal blog and portfolio website built with HTML, CSS, and JavaScript. Designed to be hosted for free on GitHub Pages. The UI mirrors the BlogReplit design while keeping the original Markdown-to-JSON content pipeline.

## Features

- Replit-inspired layout with bold typography and gradient accents
- Fully responsive (mobile, tablet, desktop)
- Fast, framework-free runtime
- JSON-driven content for blog and projects
- Computed read time and category pills
- Shareable post URLs with Web Share API support
- PWA support with offline caching
- iOS home screen icon sizes for proper "Add to Home Screen" rendering

## Structure

```
Blog/
  ├── index.html          # Home page
  ├── about.html          # About page
  ├── projects.html       # Projects showcase
  ├── blog.html           # Blog listing
  ├── post.html           # Single post view (shareable)
  ├── 404.html            # Custom 404 page
  ├── assets/
  │   ├── css/
  │   │   ├── styles.css  # Compiled Tailwind styles (Replit design)
  │   │   └── custom.css  # Local overrides for dynamic content
  │   ├── js/
  │   │   ├── app.js          # Post rendering logic
  │   │   ├── pwa.js          # PWA enhancements
  │   │   └── notifications.js # Web notifications helper
  │   └── img/
  │       ├── circuit_infinity_tech_logo.png
  │       ├── apple-touch-icon-*.png
  │       ├── icon-192.png
  │       └── icon-512.png
  ├── data/
  │   └── posts.json      # Content database
  ├── posts/              # Markdown sources
  └── scripts/
      └── generate-json.js
```

## Project Docs

- `agent.md` - workflow checklist for new missions
- `architectural.md` - architectural overview of the application and file tree
- `releasenotes.md` - change log for notable updates

## Getting Started

### Choose Your Workflow

You can manage content in two ways:

**Option A: Markdown Files (Recommended)**
- Write posts in `posts/*.md` using Markdown
- Push to GitHub
- GitHub Actions automatically generates `data/posts.json`
- See `posts/README.md` for full documentation

**Option B: Direct JSON Editing**
- Manually edit `data/posts.json`
- Immediate local changes (no build step)

### 1. Add Your Logo

Replace `assets/img/circuit_infinity_tech_logo.png` with your own logo image if desired. For a matching iOS home screen icon, regenerate `assets/img/apple-touch-icon-*.png` (and the manifest icons `assets/img/icon-192.png` and `assets/img/icon-512.png`) from the same source.

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

3. Commit and push - GitHub Actions handles the rest.

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
  "tags": ["AI", "Tutorial"],
  "coverImage": "path/to/image.jpg" (optional)
}
```

### 3. Customize Colors

Global colors are defined in the compiled Tailwind output at `assets/css/styles.css` (look for `:root`).
Use `assets/css/custom.css` for smaller overrides and content styling.

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

### Home Page

- Hero section with gradient background
- "How I Work" feature cards
- Recent projects grid populated from `data/posts.json`

### Projects Page

- Featured projects grid (top two projects by date unless `featured: true` is set)
- Additional projects grid for the rest

### Blog Page

- Category pills generated from tags
- Blog cards with computed read time

### Post Page

- Full post view with share links
- Read time computed from content length
- Back link routes to Blog or Projects based on type

## Performance

- No external JS frameworks at runtime
- Minimal JavaScript
- Optimized CSS with modern features
- Fast load times

## What's Next

- Share the site on LinkedIn Pages and document the best sharing flow (post format, preview image, and link tracking).

## Future Enhancements (Optional)

- Add RSS feed
- Implement dark mode toggle
- Add comments system (via third-party service)
- Add search functionality

## License

MIT License - Feel free to use this for your own blog.

## Credits

Built with vanilla HTML, CSS, and JavaScript.
