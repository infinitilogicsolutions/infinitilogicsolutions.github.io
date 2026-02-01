# Architecture

## Overview
This is a static HTML/CSS/JS blog and portfolio site intended to run from GitHub Pages or any static host. Content is rendered client-side from `data/posts.json`, which is generated from markdown sources or edited directly.

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
  ├── package.json
  ├── package-lock.json
  ├── data/
  │   └── posts.json
  ├── posts/
  │   └── *.md
  ├── scripts/
  │   └── generate-json.js
  ├── assets/
  │   ├── css/
  │   ├── js/
  │   │   ├── app.js
  │   │   ├── typewriter.js
  │   │   ├── notifications.js
  │   │   └── pwa.js
  │   └── img/
  └── node_modules/ (generated)
```

## Content Pipeline
- Source: Markdown files in `posts/` with frontmatter metadata.
- Generator: `scripts/generate-json.js` converts markdown into `data/posts.json`.
- Alternative: Direct edits to `data/posts.json` for quick changes.

## Runtime Behavior
- Pages are static HTML: `index.html`, `about.html`, `projects.html`, `blog.html`, `post.html`.
- `assets/js/app.js` loads `data/posts.json` and renders cards or full post content.
- `post.html` reads a `slug` query parameter and renders a single post/project.
- Sharing uses the Web Share API with clipboard fallbacks.
- `assets/js/typewriter.js` animates the brand text across the hero and navigation logos in a looping typewriter effect.

## Data Model
Each post entry is a JSON object with:
- `id`, `type` (`blog` or `project`), `title`, `slug`, `date`, `summary`
- `contentHtml` (rendered HTML from markdown)
- Optional `coverImage`

## PWA and Offline
- `manifest.json` defines app metadata and icons.
- `service-worker.js` provides basic caching for offline use (if enabled).

## Constraints and Assumptions
- No server-side rendering or database.
- No framework dependencies; performance comes from minimal JS and CSS.
- Content updates require regenerating `data/posts.json` or direct JSON edits.
