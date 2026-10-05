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


## Site efficiency — September 29, 2026

Listing pages now load generated `data/posts-index.json` with metadata and precomputed read times. Full article HTML stays in `data/posts.json` for article views. Requests are shared per page, including personalization refreshes; failed requests can retry. The publishing workflow tracks both data files and reruns for generator/template edits. Service worker v5 precaches both the small index and the full article JSON during installation, preserving offline article access after installation completes. Listing pages use the small index for rendering; the full dataset still downloads in the background. Both JSON endpoints retain the existing offline refresh strategy. Homepage scripts use ordered deferred execution; logo dimensions reserve layout space.


## Article rendering performance — September 29, 2026

Generated article pages include complete HTML from a renderer shared with the dynamic offline fallback. Prerendered articles only bind share controls; personalization does not rebuild them. Published dates are stable UTC dates. The existing logo has a 140px WebP delivery variant with explicit dimensions. Source pages allow zoom and use ordered deferred scripts. Service-worker v6 preserves full JSON precaching and includes the shared renderer and small logo. Initial service-worker activation no longer reloads a first-time visit; updates for existing controlled sessions retain the existing refresh behavior.

The footer displays this visit’s navigation-to-load duration using Navigation Timing, with reserved space and an unavailable fallback. It is a real visit measurement, not a Lighthouse score.

## Paperlens scanner — October 5, 2026

- `scan/index.html` is a self-contained HTML/CSS/JavaScript app with inline SVG icons and no runtime downloads, build step, image uploads, or backend.
- Canvas-based bright-region detection proposes document corners; users can correct the convex quadrilateral. A projective homography and bilinear resampling straighten the page. Detection is heuristic and works best for light paper on a contrasting background.
- Draft pages retain original/base JPEG blobs, corners, rotation, filter, brightness, contrast, and sharpening in the `paperlens-v2` IndexedDB store. Export preferences use `paperlens-options` in localStorage. Scan processing caps the long edge at 2200 pixels; export presets preserve available detail or reduce size.
- Image exports are prepared before a direct share-button action. The image preview provides a touch-and-hold fallback. A self-contained PDF writer embeds each processed JPEG with A4, Letter, or fitted page dimensions and selected margins; PDF preparation and sharing are separate taps.
- Mobile layout uses a larger preview and a fixed save toolbar. Desktop layout separates the preview from editing controls. Camera/corner overlays use the full viewport; the viewer adds 100–300% zoom. Studio options add JPEG/PNG, compression presets, contrast, sharpening, and page order.
- Root blog service worker `my-blog-v7` bypasses `/scan` and `/scan/` (alongside dictionary routes), removing stale scanner responses when the prior blog cache is cleaned up. Existing blog assets and both JSON datasets remain precached.
- Validation: JavaScript syntax; real canvas fixtures for detection, homography, perspective resampling, filters, sharpening, rotation, JPEG/PNG encoding, reordering, and PDF generation; parsed two-page Letter PDF with embedded images. Actual iPhone camera, native Photos sharing, and browser layout still require device verification.

## Paperlens content publication — October 5, 2026

Project ID 13 and blog ID 14 are defined in `posts/paperlens-browser-document-scanner.md` and `posts/building-paperlens-single-html-document-scanner.md`. The existing generator publishes them into both JSON feeds and static article pages. Both entries use `assets/img/og/paperlens.jpg` for card/social metadata; the blog also includes a responsive, full-aspect screenshot with alternative text and intrinsic dimensions. Generated output uses the existing template and shared article renderer. Scanner code, runtime dependencies, and publishing workflow are unchanged by the content publication.

## Paperlens two-sided ID composition — October 5, 2026

- Explicit ID mode reuses camera/import, four-corner cropping, and perspective correction; it does not attempt unreliable automatic ID classification.
- Each side retains original/base Blob and corner coordinates. A guided dialog selects the side, supports retakes and re-cropping, and enables composition only with both sides present. Fresh retakes detect new corners instead of reusing coordinates from a different image.
- Composition decodes two sides in parallel, scales them to a common width while preserving aspect ratios, and draws them vertically with white padding/gap. The canvas longest dimension is capped at 2200 pixels. A lossless PNG base is generated only when accepted; normal rendering and JPEG/PNG/PDF export reuse the existing pipeline.
- Composite pages retain cardSides so editing replaces the same page. Reordering/deletion adjust the pending edit target. Draft snapshots include cardSides and pendingId, excluding object URLs; older page-only records remain compatible. Object URLs are released on preview refresh/completion/discard.
- Validation: real canvas fixtures confirm white spacing, front/back order, aspect-preserving size, JPEG/PNG output and small-file limits, single-page embedded-image PDF, side-edit replacement, fresh capture corners, cancellation, ordinary document scans, IndexedDB serialization and recovery. Browser layout, live camera and native Photos sharing require actual-device QA.

## Developer photo print studio — October 5, 2026

- Local export preferences gain developer:false; the accessible checkbox/switch persists changes immediately and reveals the experimental entry point. This is feature visibility, not an authentication/security boundary.
- A separate portrait state/input/dialog isolates passport cropping and files from document/ID drafts. Input decoding reuses the existing Blob decoder and bounds source canvases to 3500 pixels. Portraits are intentionally memory-only; file object URLs are released on crop/preset changes, rebuild and clear.
- Crop uses a source-space rectangle constrained to the preset aspect ratio, a cover fit, zoom 100–300%, normalized horizontal/vertical offsets and optional pointer dragging. Slider updates coalesce preview work through requestAnimationFrame. Aspect ratios and framing are changed without document enhancement filters or perspective distortion.
- Pure layout calculation packs exact inch dimensions into a landscape 6 × 4 sheet, optionally reserving 0.1-inch outer padding/gaps. Nominal 2-inch presets fit six without spacing; exact 51 mm fits fewer rather than shrinking it silently. Conditional 35 × 45 mm is explicitly not a universal Indian passport preset.
- Export draws repeated crops directly into one 1800 × 1200 canvas, writes/updates JFIF 300-dpi density, and prepares files before user-triggered sharing/download. The PDF writer optionally consumes this sheet with a fixed 432 × 288-point MediaBox, zero margin and high JPEG quality; ordinary document PDF behavior is unchanged.
- A sequence guard discards stale asynchronous preparation after edits; all edits invalidate prepared files. Print instructions flag edge-to-edge risks, borderless overscan and actual-size printing. Country guidance links official sources but does not certify acceptance or alter faces/backgrounds.
- Validation: developer gating; six/spacing/exact-mm/35×45 layout counts; aspect-preserving pan/zoom; sheet pixel placement; JPEG dimensions/density; PDF page size/image count; independence from document export settings; invalidation and memory clear; prior ID/draft/document canvas regression tests. Real Safari camera/sharing/layout and printer physical output remain device QA.

## Pastel theme and inline developer workspace — October 5, 2026

- Move the existing portrait workspace into a labelled section inside main, before the scan start screen. It retains its controls/canvas/export handlers, removing modal role, Close button and Escape-dismissal behavior.
- syncDeveloper maps the persisted Boolean preference to section visibility and a developer-enabled main class. Invoke it after script initialization and toggle changes so reload restores the same visibility. The settings entry scrolls to the section; enabled scanner start layout becomes compact.
- Append one shared light-theme stylesheet using lavender, mint, peach and sky-blue surfaces with dark foregrounds. It covers document inputs, dialogs, settings selects, scanner controls, thumbnail/preview surfaces, overlays, save toolbar and status feedback; actual document pixels and live image overlays retain appropriate contrast.
- Responsive portrait section uses normal page scrolling with no modal height cap and mobile stacked selectors. Existing image processing, draft storage and exports are unchanged.
- Validation: existing document/ID/draft and passport canvas tests pass. Updated passport regression checks inline main membership, toggle on/off/on visibility and removal of the old modal. Browser layout and device visual QA remain pending.
