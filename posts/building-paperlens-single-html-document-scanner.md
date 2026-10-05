---
id: 14
type: blog
title: I Built a Document Scanner in One HTML File
slug: building-paperlens-single-html-document-scanner
date: 2026-10-05
summary: How Paperlens grew from a one-file iPhone document scanner into a local-first tool for two-sided IDs and passport/visa photo print sheets—with exact print sizing and a pastel studio.
tags: [Software Architecture, JavaScript, Canvas, Local-First, GitHub Pages]
coverImage: assets/img/og/paperlens.jpg
active: true
---

I wanted a simple thing: open a page on my iPhone, scan a document, straighten it, and save the result to Photos.

The reference was the scanning experience in the iPhone Notes app. A camera button alone would not be enough. The useful part is turning an angled photograph into a page you can read, share, and keep.

That became **Paperlens**: a browser-based document scanner built with AI assistance and delivered as one HTML file. It now also combines front/back ID scans and prepares passport or visa-size portraits on a 6 × 4-inch photo sheet.

[Try Paperlens](https://infinitilogicsolutions.github.io/scan/)

<figure style="margin:2rem 0"><img src="/assets/img/og/paperlens.jpg" alt="Paperlens on iPhone, showing Scan document and Import photo controls" width="1170" height="1896" loading="lazy" decoding="async" style="display:block;width:100%;max-width:390px;height:auto;margin:0 auto;border-radius:18px"><figcaption style="text-align:center;margin-top:1rem">The original Paperlens interface on iPhone. The current version uses a pastel theme and adds ID and photo-print tools.</figcaption></figure>

## Start With the Whole Workflow

The first version could capture a photo, rotate it, apply a filter, and open a share sheet. It still behaved more like a camera app than a document scanner.

The upgrade needed to complete the task:

1. Capture a page or import a photo.
2. Identify the paper's corners and let the user correct them.
3. Straighten the page.
4. Improve readability.
5. Keep several pages together.
6. Export an image or a document.

That sequence became the architecture. Each step transforms local image data; the browser can own the entire path.

## A Rectangle Around a Photo Is Not Enough

If I photograph a document from an angle, its edges form a quadrilateral. Cropping the bounding rectangle leaves the perspective distortion in place.

Paperlens uses the four document corners to calculate a **projective homography**: a mapping between that quadrilateral and a rectangular output page.

For each output pixel, the app calculates the corresponding source position. Bilinear interpolation samples the nearby source pixels rather than rounding every position to a single pixel.

This is the core of the scanner. The filter improves the appearance afterward, but the geometric transformation is what straightens the page.

## Suggest the Edges, Keep the User in Control

The detector works on a smaller copy of the image. It estimates a brightness threshold, finds connected bright regions, and selects plausible paper corners.

It is deliberately lightweight. There is no downloaded machine-learning model or external vision service.

The tradeoff is that it works best for light paper on a contrasting background. A white page on a white desk can be ambiguous. Shadows, receipts, and unusual shapes can also confuse it.

So automatic detection proposes corners; it does not remove the ability to adjust them. The editor exposes all four handles, along with a full-image reset.

Automatic capture adds a stability check: when a detected page holds approximately steady across several samples, the app captures it. Manual capture stays available.

## The Browser Is the Processing Layer

Canvas handles the image transformations and pixel adjustments. Paperlens offers color, clean, grayscale, and black-and-white treatments, plus brightness, contrast, sharpening, and rotation.

The clean treatment uses a local brightness estimate to help normalize uneven illumination. It is an image-processing heuristic, not a guarantee that every shadow disappears.

The interface also matters. A larger page preview, recognizable SVG icons, a persistent save toolbar, and a full-screen zoom view make the result easier to inspect on a phone.

The document scanner, ID composer, and portrait studio remain in one HTML file with no third-party runtime dependencies. Page images are separate in-memory or locally stored data; their size depends on the scanning session.

## Front and Back Belong Together

An ID or license has two sides, but its useful exported copy often needs to be one page.

Paperlens adds an explicit **Scan ID / license** flow. Each side uses the same camera/import path, four-corner editor, and perspective correction as a document. After accepting the front, the interface prompts for the back.

The composition step decodes both cropped sides, scales them to a common width while preserving aspect ratios, and draws them vertically on a white canvas with padding. That canvas becomes an ordinary page in the existing export pipeline: one Photos image or one PDF page.

Keeping the two side originals matters. A completed ID can be reopened to edit or retake either side, then replace the existing composite. Fresh captures detect their own corners; a retake must not inherit coordinates from a different photograph.

Unfinished ID drafts survive a reload in the same browser. This adds a second kind of draft state without requiring a second processing system.

## Passport and Visa Photos Make Pixels Physical

The next request was practical: upload a portrait, crop it to a requested passport or visa size, and repeat it on a 6 × 4-inch sheet for a regular photo print.

This is a different geometry problem. A document needs perspective correction; a portrait needs a crop with a fixed aspect ratio and predictable physical dimensions.

The photo studio supports:

- U.S. 2 × 2-inch photos
- India overseas nominal 2 × 2-inch photos
- Exact 51 × 51 mm when the application explicitly requests millimetres
- 35 × 45 mm only when the specific application requests that format

The 2-inch preset also matches the printed photo size described in the [U.S. visa requirements](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html). Indian passport and visa instructions vary by application and location; the preset is not a universal compliance promise. Check [passport instructions](https://travel.state.gov/en/passports/apply/help/photos.html) and the [relevant consulate’s guidance](https://www.indianembassynetherlands.gov.in/page/basic-requirements-and-photo-specifications/) before printing.

The crop is a source-space rectangle, not a perspective transform. Zoom changes its dimensions; dragging or position sliders move it within the source image. No scanner filter, background replacement, or face retouching runs on this path.

The sheet is **1800 × 1200 pixels**. At **300 pixels per inch**, that is **6 × 4 inches**. A nominal 2-inch square occupies 600 × 600 pixels, so six copies fill the sheet in three columns and two rows.

That arithmetic also reveals a useful limit: six squares leave no cutting margin. The spaced layout deliberately fits fewer copies. An exact 51 mm square is slightly larger than 2 inches, so it also fits fewer copies rather than being silently reduced to fit.

JPEG metadata matters here. Browser Canvas encoders commonly use a default density unrelated to the intended print. Paperlens writes a **300-ppi JFIF density** into the output JPG. The existing PDF writer accepts the same sheet with a fixed **432 × 288-point** page—six by four inches at 72 PDF points per inch.

Neither format can control the printer. Photo-lab auto-cropping, fit-to-page options, or borderless overscan can change the result. The interface tells the user to print at actual size, disable enlargement/cropping, and measure the finished photos.

These are print-sheet exports, not files prepared for digital passport or visa submission. Correct dimensions alone do not establish acceptance.

## A Pastel Studio on the Main Page

The photo-print tool is experimental, so it sits behind a **Developer mode** toggle in Studio settings. Turning the toggle on reveals all photo controls directly at the top of the main page; localStorage remembers that preference after reload.

The interface now uses pastel lavender, mint, peach, and sky blue with dark text. The scan start card becomes compact when the portrait workspace is visible, and the tools use ordinary page scrolling instead of another popup.

This is a visibility switch, not an authentication boundary. Its purpose is to keep the everyday scanner focused while making the complete photo workflow available when needed.

## A Draft Belongs on the Device

A multipage scan needs state. Paperlens stores its current draft in IndexedDB, including image blobs, corner coordinates, filters, adjustments, and the original sides of an ID. An unfinished ID capture is saved alongside the document draft. Export preferences and the Developer toggle use localStorage.

Portraits in the print studio stay in memory and are not added to IndexedDB. **Clear photo** releases the portrait and prepared files.

That lets the same browser restore a document or ID draft after a reload. Captured documents are not uploaded to an application server.

There are limits to that promise. Drafts do not sync between devices, browsers, or hosting origins. Browser storage can disappear after a reset or eviction. Exported files are the copies to keep.

Processing locally also does not automatically make the website offline-installable. The scanner does not register its own service worker. Once loaded, its processing uses local code and data, but a fresh offline visit is a separate concern.

## Saving to Photos Is a User Action

The browser cannot silently place a file in the iPhone Photos library. Paperlens prepares an image file, then offers a direct **Share image** action for the native share sheet.

The user chooses the saving destination. The image preview also supports touching and holding, and the download option keeps a copy in Files.

Preparing the file before the share-button tap matters. The app avoids making the sharing action wait behind a long image-processing operation.

PDF export follows the same idea: first prepare the document, then tap **Save PDF** to share or download it.

## A PDF Without a PDF Service

Paperlens includes a small PDF writer that embeds each processed JPEG as a page image. The user can choose A4, US Letter, or a page fitted to the scan, along with margins.

The resulting PDF combines the draft's pages without sending them to a conversion service.

It is an image-based PDF. There is no OCR pipeline, searchable text layer, or claim of full Notes feature parity. Keeping that boundary clear matters more than calling every export a complete document platform.

## Choose Detail Deliberately

Document scanning and ID composition cap the long edge at **2,200 pixels** to bound processing work on a phone. Maximum-detail export keeps that available resolution; balanced and small-file presets can reduce dimensions and JPEG quality.

PNG is also available for image export. Its usefulness and file size depend on the page content, so a lossless format is not automatically the smallest choice.

The portrait source canvas is bounded to 3,500 pixels, while the print sheet always exports at 1800 × 1200. Document quality presets do not change the photo sheet’s dimensions or density.

This is a practical client-side tradeoff: the user's device supplies the CPU and memory. Removing a backend changes where the work happens; it does not eliminate the work.

## What I Checked

Validation covered JavaScript syntax and real Canvas fixtures for corner detection, perspective resampling, filters, contrast, sharpening, rotation, page ordering, and JPEG/PNG encoding. Generated two-page PDFs were parsed to confirm page sizes and embedded images.

The newer checks cover front/back placement, replacement of an edited ID page, retakes, cancellation, ID draft recovery, portrait crop ratios and pan/zoom, duplication counts, Developer mode visibility, and stale-export invalidation. The print JPG was inspected for 1800 × 1200 pixels and 300-ppi metadata; its PDF was parsed for one embedded image on a 432 × 288-point page.

The actual iPhone camera, torch support, share-sheet choices, and layout still need device testing. Those browser and OS interactions deserve their own verification beyond processing checks. A physical lab print also needs a ruler check; a correct file does not prove the printer preserved its size.

## The Architectural Lesson

This workload has a small operating footprint because the document does not need to leave the device. Static hosting delivers the app; the browser captures, processes, stores the draft, and generates the files.

For Paperlens, the useful architectural question was: **can the place where the document is captured also be the place where it is processed?**

In this case, enough of that workflow fits in one HTML file to make a useful tool.

[Open Paperlens](https://infinitilogicsolutions.github.io/scan/) or [view the project](https://infinitilogicsolutions.github.io/posts/paperlens-browser-document-scanner.html).
