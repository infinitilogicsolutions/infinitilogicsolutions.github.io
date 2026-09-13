# release notes

## Cache isolation for dictionary hosting
- limit worker cleanup and manual reset to blog-owned caches and the root worker
- bypass dictionary routes, external requests, and byte-range requests
- read only the blog cache and bump its version to `my-blog-v4`
- validate cleanup, request bypass, scoped reads, and reset using isolated JavaScript checks
- preserve the previous main commit with the `before-cache-isolation` tag

## 2026-03-08
- add visitor intelligence runtime modules for signal capture, bot scoring, Google One Tap, personalization, and Apps Script delivery
- wire the new telemetry stack into all public pages and the post template so generated post pages inherit it automatically
- localize rendered dates from the detected visitor locale/timezone and add returning-visitor UI
- add footer privacy disclosure and local clear-data control
- document the Google Sheets / Apps Script / Google Identity setup in `README.md` and `architectural.md`

## 2026-03-07
- generate per-post HTML pages with Open Graph/Twitter metadata for rich social previews
- update share links to point at `posts/<slug>.html` for consistent LinkedIn context
- expand the posts generator workflow to publish the new HTML pages
- add cover image support with a default fallback for social previews

## 2026-02-01
- added iOS home screen icon sizes and wired apple-touch-icon tags on the homepage
- cached iOS touch icons in the service worker for offline availability
- added `agent.md` with workflow checklist
- added `architectural.md` with system overview
- added file tree to `architectural.md`
- documented docs and next steps in `README.md`
- expanded `agent.md` with commit-message guidance
- added looping typewriter animation for the brand logo across pages
- introduced `assets/js/typewriter.js` and updated styles for the underscore cursor
- replaced page layouts with the BlogReplit-inspired design across all pages
- swapped in compiled Tailwind CSS plus `assets/css/custom.css` overrides
- updated `assets/js/app.js` to render the new card layouts and compute read time
- added social share actions to blog cards and expanded post sharing links
- added Replit assets (favicon, opengraph, logo)
- refreshed PWA theme colors and cache manifest
- configured the nightly posts generator to push via deploy key when rulesets require bypass
