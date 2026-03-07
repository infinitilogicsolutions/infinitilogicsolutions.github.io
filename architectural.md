# Architecture

## Overview
This is a static HTML/CSS/JS blog and portfolio site intended to run from GitHub Pages or any static host. Content is rendered client-side from `data/posts.json`, which is generated from markdown sources or edited directly. The UI is a Replit-inspired layout implemented with compiled Tailwind CSS utilities.

## File Tree
```
Blog/
  ├── 404.html
  ├── README.md
  ├── PWA-GUIDE.md
  ├── agent.md
  ├── architectural.md
  ├── releasenotes.md
  ├── about.html
  ├── blog.html
  ├── index.html
  ├── post.html
  ├── projects.html
  ├── manifest.json
  ├── service-worker.js
  ├── favicon.png
  ├── opengraph.jpg
  ├── package.json
  ├── package-lock.json
  ├── data/
  │   └── posts.json
  ├── posts/
  │   ├── *.md
  │   └── *.html
  ├── scripts/
  │   └── generate-json.js
  ├── assets/
  │   ├── css/
  │   │   ├── styles.css
  │   │   └── custom.css
  │   ├── js/
  │   │   ├── app.js
  │   │   ├── typewriter.js
  │   │   ├── notifications.js
  │   │   └── pwa.js
  │   └── img/
  │       ├── circuit_infinity_tech_logo.png
  │       ├── apple-touch-icon-*.png
  │       ├── icon-192.png
  │       └── icon-512.png
  └── node_modules/ (generated)
```

## Content Pipeline
- Source: Markdown files in `posts/` with frontmatter metadata.
- Generator: `scripts/generate-json.js` converts markdown into `data/posts.json`.
- Output: `posts/<slug>.html` pages with Open Graph/Twitter metadata for social previews.
- Alternative: Direct edits to `data/posts.json` for quick changes.
- Automation: GitHub Actions runs nightly and uses the `DEPLOY_KEY` secret to push updates when branch rulesets block direct pushes.

## Runtime Behavior
- Pages are static HTML: `index.html`, `about.html`, `projects.html`, `blog.html`, `post.html`.
- `assets/js/app.js` loads `data/posts.json` and renders:
  - Home: recent project cards.
  - Projects: featured and additional project grids.
  - Blog: category pills, post list, and social share actions per card.
  - Post: full article view with computed read time and social share links.
- `post.html` reads a `slug` query parameter and renders a single post/project.
- `posts/<slug>.html` pages include static meta tags for social previews and set a post slug for client-side rendering.
- Share buttons generate X/LinkedIn/Facebook share URLs and use the Web Share API with clipboard fallback.
- Layout styling is provided by the compiled Tailwind output in `assets/css/styles.css` plus local overrides in `assets/css/custom.css`.

## Data Model
Each post entry is a JSON object with:
- `id`, `type` (`blog` or `project`), `title`, `slug`, `date`, `summary`
- `contentHtml` (rendered HTML from markdown)
- Optional `coverImage`, `tags`, `category`, `featured`

## PWA and Offline
- `manifest.json` defines app metadata and icons.
- `index.html` declares iOS home screen icons via `apple-touch-icon` tags.
- `service-worker.js` provides basic caching for offline use, including icon assets.

## Constraints and Assumptions
- No server-side rendering or database.
- No framework dependencies; performance comes from minimal JS and CSS.
- Content updates require regenerating `data/posts.json` or direct JSON edits.
