# Architecture

## Overview

### Cache ownership

The root service worker owns only `my-blog-` caches; cache reads target the current
version explicitly. Dictionary routes (`/dictionary` and `/dictionary/`), external
requests, and range requests bypass its fetch handler. Manual reset unregisters
only the root-scope worker and deletes only blog caches. This preserves a future
dictionary worker and cache on the same origin without changing existing blog URLs.
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
  │   │   ├── visitor-config.js
  │   │   ├── fingerprint.js
  │   │   ├── tracker.js
  │   │   ├── one-tap.js
  │   │   ├── personalizer.js
  │   │   ├── typewriter.js
  │   │   ├── notifications.js
  │   │   └── pwa.js
  │   └── img/
  │       ├── circuit_infinity_tech_logo.png
  │       ├── og/
  │       ├── apple-touch-icon-*.png
  │       ├── icon-192.png
  │       └── icon-512.png
  └── node_modules/ (generated)
```

## Content Pipeline
- Source: Markdown files in `posts/` with frontmatter metadata.
- Generator: `scripts/generate-json.js` converts markdown into `data/posts.json`.
- Output: `posts/<slug>.html` pages with Open Graph/Twitter metadata for social previews.
- Cover images default to `opengraph.jpg` when a post omits `coverImage`.
- Alternative: Direct edits to `data/posts.json` for quick changes.
- Automation: GitHub Actions runs nightly and uses the `DEPLOY_KEY` secret to push updates when branch rulesets block direct pushes.

## Runtime Behavior
- Pages are static HTML: `index.html`, `about.html`, `projects.html`, `blog.html`, `post.html`.
- `assets/js/visitor-config.js` stores the Apps Script endpoint, Google client ID, localStorage keys, and canonical Sheet field order.
- `assets/js/fingerprint.js` collects anonymous session, device, preference, network, rendering, performance, and behavioral signals; computes the visitor profile; and derives bot-scoring fields.
- `assets/js/tracker.js` serializes one ordered payload per page view and sends it to Google Apps Script using `sendBeacon` with `fetch keepalive` fallback.
- `assets/js/one-tap.js` loads Google Identity Services, restores cached identity, and prompts for consent-based Google profile capture.
- `assets/js/personalizer.js` applies dark/reduced-motion/touch/perf classes, welcome-back UI, nav identity UI, and footer privacy controls.
- `assets/js/app.js` loads `data/posts.json` and renders:
  - Home: recent project cards.
  - Projects: featured and additional project grids.
  - Blog: category pills, post list, and social share actions per card.
  - Post: full article view with computed read time and social share links.
- `assets/js/app.js` also uses the visitor locale/timezone profile to format dates and re-renders once the profile is ready on first load.
- `post.html` reads a `slug` query parameter and renders a single post/project.
- `posts/<slug>.html` pages include static meta tags for social previews and set a post slug for client-side rendering.
- Share buttons generate X/LinkedIn/Facebook share URLs and use the Web Share API with clipboard fallback.
- Layout styling is provided by the compiled Tailwind output in `assets/css/styles.css` plus local overrides in `assets/css/custom.css`.
- The footer privacy notice and clear-data control are injected client-side so every shell page and generated post page stays in sync.

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
- Analytics persistence depends on Google Sheets + Google Apps Script rather than a traditional backend.
- No framework dependencies; performance comes from minimal JS and CSS.
- Content updates require regenerating `data/posts.json` or direct JSON edits.
- Bot scoring is currently observational only; personalization still runs for every visitor while thresholds are tuned.
