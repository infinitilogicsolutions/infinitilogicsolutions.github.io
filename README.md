# My Blog

A modern, responsive personal blog and portfolio website built with HTML, CSS, and JavaScript. Designed to be hosted for free on GitHub Pages. The UI mirrors the BlogReplit design while keeping the original Markdown-to-JSON content pipeline.

## Features

- Replit-inspired layout with bold typography and gradient accents
- Fully responsive (mobile, tablet, desktop)
- Fast, framework-free runtime
- JSON-driven content for blog and projects
- Computed read time and category pills
- Social share buttons (X, LinkedIn, Facebook) plus Web Share API + copy link fallback
- Per-post static pages with Open Graph/Twitter metadata for rich social previews
- Per-post cover images with fallback to the default Open Graph image
- Visitor intelligence logging to Google Sheets via Google Apps Script
- Bot scoring, Google One Tap identity capture, and per-visitor UX personalization
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
  │   │   ├── app.js             # Post rendering logic
  │   │   ├── visitor-config.js  # Apps Script + Google Identity config
  │   │   ├── fingerprint.js     # Signal capture and bot scoring
  │   │   ├── tracker.js         # Payload assembly and Google Sheets delivery
  │   │   ├── one-tap.js         # Google One Tap identity prompt
  │   │   ├── personalizer.js    # Theme/perf/touch personalization + privacy UI
  │   │   ├── pwa.js             # PWA enhancements
  │   │   └── notifications.js   # Web notifications helper
  │   └── img/
  │       ├── circuit_infinity_tech_logo.png
  │       ├── og/
  │       ├── apple-touch-icon-*.png
  │       ├── icon-192.png
  │       └── icon-512.png
  ├── data/
  │   └── posts.json      # Content database
  ├── posts/              # Markdown sources + generated post pages
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
- GitHub Actions automatically generates `data/posts.json` and `posts/*.html`
- See `posts/README.md` for full documentation
  - If branch rules require PRs, configure a deploy key bypass and store the private key in the `DEPLOY_KEY` repo secret.

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
- Quick-share actions on each blog card

### Post Page

- Full post view with social share links and copy-to-clipboard
- Read time computed from content length
- Back link routes to Blog or Projects based on type

### Visitor Intelligence

- Captures browser, device, network, rendering, and behavioral signals client-side
- Scores each page view for likely bot behavior before sending a row to Google Sheets
- Offers optional Google One Tap profile capture after explicit consent
- Applies dark mode, reduced motion, touch mode, perf mode, locale-aware dates, and returning visitor UI
- Adds a footer privacy notice plus a one-click local data reset

## Performance

- No external JS frameworks at runtime
- Minimal JavaScript
- Optimized CSS with modern features
- Fast load times
- Telemetry runs asynchronously and posts to Apps Script with `sendBeacon`/`fetch keepalive` fallback

## External Setup

- Google Sheet with `Raw Log`, `Human Traffic`, `Bot Traffic`, and `Dashboard` tabs
- Google Apps Script web app bound to the Sheet for row appends
- Google OAuth client ID for Google Identity Services / One Tap
- The Apps Script URL and Google client ID live in `assets/js/visitor-config.js`

## What's Next

- Current scanner request: publish the upgraded Paperlens app at `/scan/index.html`, keeping `/scan/` as its public address; verify camera capture and Save Image on iPhone Safari.

- Verify the blog and the planned `/dictionary/` deployment together, including offline reload and blog cache reset.
- Validate live traffic quality in Google Sheets and tune bot-score thresholds with real sessions.

## Cache isolation

The blog reads only its own `my-blog-v4` cache and removes only outdated
`my-blog-` caches. Its worker bypasses `/dictionary` and `/dictionary/` paths,
cross-origin requests, and byte-range requests. The manual cache reset preserves
other applications' caches and service workers. The `before-cache-isolation` tag
marks the previous main version. The dictionary itself is not deployed by this change.

## Future Enhancements (Optional)

- Add RSS feed
- Implement dark mode toggle
- Add comments system (via third-party service)
- Add search functionality

## License

MIT License - Feel free to use this for your own blog.

## Credits

Built with vanilla HTML, CSS, and JavaScript.


## Site efficiency — September 29, 2026

Listing pages now load generated `data/posts-index.json` with metadata and precomputed read times. Full article HTML stays in `data/posts.json` for article views. Requests are shared per page, including personalization refreshes; failed requests can retry. The publishing workflow tracks both data files and reruns for generator/template edits. Service worker v5 precaches both the small index and the full article JSON during installation, preserving offline article access after installation completes. Listing pages use the small index for rendering; the full dataset still downloads in the background. Both JSON endpoints retain the existing offline refresh strategy. Homepage scripts use ordered deferred execution; logo dimensions reserve layout space.


## Article rendering performance — September 29, 2026

Generated article pages include complete HTML from a renderer shared with the dynamic offline fallback. Prerendered articles only bind share controls; personalization does not rebuild them. Published dates are stable UTC dates. The existing logo has a 140px WebP delivery variant with explicit dimensions. Source pages allow zoom and use ordered deferred scripts. Service-worker v6 preserves full JSON precaching and includes the shared renderer and small logo. Initial service-worker activation no longer reloads a first-time visit; updates for existing controlled sessions retain the existing refresh behavior.

The footer displays this visit’s navigation-to-load duration using Navigation Timing, with reserved space and an unavailable fallback. It is a real visit measurement, not a Lighthouse score.

## Paperlens document scanner — October 5, 2026

Open [Paperlens](https://infinitilogicsolutions.github.io/scan/) in Safari. The standalone `scan/index.html` replaces the basic scanner while preserving its address. It includes bright-paper edge detection with manual corner adjustment, projective perspective correction, auto/manual capture, multipage drafts, filters, brightness/contrast/sharpening, page rotation and reordering, full-screen zoom, and JPEG/PNG/PDF export.

Use the sliders icon for maximum-detail/balanced/small-file output, photo format, PDF A4/US Letter/fit-to-scan sizing, and margins. Maximum detail preserves the captured scan resolution rather than upscaling. Save to Photos opens an image preview; tap Share image and choose Save Image in the iPhone share sheet, or touch and hold the preview. PDF preparation uses a separate Save PDF tap to preserve user activation for sharing.

Images and draft pages are processed on-device. IndexedDB stores the current draft; localStorage keeps export preferences. Camera access requires HTTPS and permission. All studio options are included without a paid tier. The root blog worker bypasses the scanner route to avoid serving the old basic scanner from its cache.

## Paperlens project and build story — October 5, 2026

The [Paperlens project](https://infinitilogicsolutions.github.io/posts/paperlens-browser-document-scanner.html) describes the scanner, feature set, usage, and constraints. [I Built a Document Scanner in One HTML File](https://infinitilogicsolutions.github.io/posts/building-paperlens-single-html-document-scanner.html) explains the architecture and implementation. Both use the existing Markdown publishing pipeline, share the supplied iPhone screenshot at `assets/img/og/paperlens.jpg`, and link to the live `/scan/` app. The build story also shows the complete screenshot within the article.

## Paperlens ID / license scans — October 5, 2026

Choose **Scan ID / license** on the home screen or **Add page → ID / license**. Capture or import the front, adjust its corners, then repeat for the back. Tap **Combine on one page** to place both sides on one white page; the existing Save to Photos and PDF actions export that page. Select a side to retake it or adjust its crop. Completed IDs expose **Edit ID front / back** without creating duplicate pages.

Both sides and unfinished ID drafts remain in IndexedDB on this device. Closing the ID dialog keeps the draft; Discard ID draft removes only that unfinished ID. Existing document scans remain compatible. No new production dependencies, network processing, automatic ID classification, or OCR were added.

What's next? The current requested enhancement is front/back ID composition. Follow-up choice is pending; real iPhone camera permissions and native Save Image still need device verification.

## Developer passport-photo studio — October 5, 2026

Open Studio (sliders icon) and enable **Developer mode**. The complete **Passport photo sheet** workspace appears at the top of the main page; Apply options closes settings. The saved toggle restores the workspace after reload. Developer mode defaults off and is remembered locally. Upload a portrait, select U.S. 2 × 2 inches or India overseas 2 × 2 inches, and use zoom/position sliders or drag the crop. Exact 51 × 51 mm and conditional 35 × 45 mm presets are also available; follow the specific application instructions rather than assuming one Indian size applies everywhere.

Maximum layout packs six 2 × 2-inch copies on a 6 × 4-inch sheet with no gaps or border allowance. The spaced layout leaves trimming room and therefore fits fewer copies. Exact 51 mm exceeds 2 inches slightly and fits fewer copies without shrinking the required size. The tool shows the count before exporting.

Prepare the sheet, then share/download its 1800 × 1200 JPEG tagged at 300 ppi, or download its single-page 432 × 288-point PDF. Document compression, filters, paper and margin settings never change this sheet. Order a landscape 6 × 4 photo print with no crop/zoom; print the PDF at 100% / Actual size on 6 × 4 paper. Measure the finished photos: printer overscan or automatic fitting can change physical size.

The tool crops/resamples only: no background replacement, filters, retouching, face recognition or approval guarantee. It is for printed photos, not digital application uploads. Portraits stay in memory (not IndexedDB) and Clear photo releases them. Rules: [U.S.](https://travel.state.gov/en/passports/apply/help/photos.html) · [India overseas example](https://www.indianembassynetherlands.gov.in/page/basic-requirements-and-photo-specifications/).

Optional regression test: install @napi-rs/canvas in your development environment and run `node tests/paperlens-passport.cjs`. It is not a production dependency.

What's next? This requested enhancement adds developer-gated passport-photo resizing/duplication. Follow-up choice is pending; verify Safari layout/Photos sharing and measure a real 6 × 4 lab print.

## Pastel main-page studio — October 5, 2026

The app uses a light pastel palette: lavender actions, mint photo/export controls, peach ID/PDF accents and sky-blue scan tools. Developer mode reveals the full portrait workspace directly on the main page above a compact scanner start card. Turning it off hides the workspace; Escape closes overlays without hiding the enabled main-page tools.

What's next? The requested main-page placement and pastel theme are implemented. Follow-up choice is pending; verify the layout and colors on your iPhone.


## Dayboard Kanban — October 6, 2026

Open [Dayboard](https://infinitilogicsolutions.github.io/cards/). `cards/index.html` is a standalone, dependency-free Kanban app with To do / Doing / Done columns, expandable card notes, due dates, countdown timers, drag-and-drop and a mobile-friendly status selector.

Click the page title to rename it. The name saves locally and updates the browser title and iOS bookmark-title metadata. **New board** creates a separate `?board=<id>` URL with isolated localStorage. Rename each board, then bookmark its current URL or use Safari Share → Add to Home Screen; review the suggested shortcut name before adding it. Existing shortcuts may need renaming or recreating after title changes. Boards are local to the current browser/device; links do not share or sync board contents.

Export JSON backs up the current board; Import JSON validates it and asks before replacing that board. Download HTML produces a named, standalone copy with the current data and its own board ID. Timers keep a wall-clock deadline across reloads, but only alert while the page is open. Export regularly: clearing browser data removes local boards.

What's next? The current request publishes the editable-title app at `/cards/index.html`. Follow-up choice is pending; verify separate shortcuts on your iPhone.


## Dayboard project and build story — October 6, 2026

The [Dayboard project](https://infinitilogicsolutions.github.io/posts/dayboard-local-kanban.html) documents the local-first Kanban app, usage, backups and boundaries. [I Built a Kanban Board That Keeps Its Data in the Browser](https://infinitilogicsolutions.github.io/posts/building-dayboard-local-kanban.html) explains board identity, bookmark titles, timer deadlines and portable exports. The project uses the supplied desktop screenshot at `assets/img/og/dayboard-project.jpg`; the post uses the supplied phone screenshot at `assets/img/og/dayboard-blog.jpg`. Both use the existing Markdown publishing pipeline and link to `/cards/?board=dayboard-default`.

What's next? The user requested publication now instead of tonight. The one-time scheduled publishing task was disabled to avoid duplicates; follow-up choice is pending.


## QR Lab — October 9, 2026

`qr/index.html` is a standalone QR generator and reader at `/qr/`. Wi-Fi is selected by default: enter the network name, security and password, then Generate. The QR type dropdown also supports links, contacts, text, email, SMS, calls, WhatsApp, locations, calendar events and UPI.

The top-right gear opens color and optional character customization. Save closes the picker and remembers appearance preferences locally; Cancel restores the saved style. QR payloads and Wi-Fi passwords are never stored. Download PNG/SVG, share a PNG where supported, or print. Generated designs retain a four-module quiet zone, require dark-on-light contrast, and are checked with the embedded reader. Characters select High error correction automatically.

Read QR accepts image uploads or a live camera. Camera access requires HTTPS/localhost and permission; image import works from a downloaded HTML file. Review decoded contents before opening a link. Processing is local with embedded encoders/decoder and no external runtime requests. The downloaded file works offline; adding a new service worker/installable PWA is outside this change.

Validation: all 11 payload types round-trip through exported SVGs and the embedded reader; Unicode, character badges and six palettes pass. Script syntax, Save behavior and the default Wi-Fi flow were checked. Live camera, browser layout and native iPhone sharing need device verification.

What's next? The current request is to push this app under `/qr/`. Review the pull request, then merge to make it available through GitHub Pages; follow-up features are pending.


## QR Lab device contacts — October 9, 2026

Select **Contact** from the QR type dropdown, then **Choose from device**. Supporting browsers (for example Chrome on Android over HTTPS) show their native contact picker; only the selected contact and approved properties are returned. Review/edit the filled name, phone, email and address, then Generate. Cancellation preserves the form.

Browsers without the Contact Picker API, including normal iPhone browser configurations, use the local **Import .vcf** fallback. In iPhone Contacts, select a contact, use Share Contact and save its vCard to Files, then choose it here. Multi-contact files show a contact selector. The importer supports plain UTF-8 vCards, folded lines, escaped values and grouped properties; it skips photo data, rejects encoded text fields it cannot safely interpret, and limits imports to 1 MB/100 contacts. QR Lab does not scan the whole address book, upload the contact, or store imported fields.

Run `node tests/qr-contacts.cjs` for mocked contact-picker/fallback and vCard parsing checks. Real-device picker, export/share-sheet options and layout still need verification.

What's next? The requested enhancement is implemented on a new feature branch for review; merge the PR to deploy. Follow-up choice is pending.
