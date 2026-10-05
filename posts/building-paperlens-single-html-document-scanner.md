---
id: 14
type: blog
title: I Built a Document Scanner in One HTML File
slug: building-paperlens-single-html-document-scanner
date: 2026-10-05
summary: How Paperlens brings editable document corners, perspective correction, local drafts, and image/PDF export to iPhone Safari without an image-processing backend.
tags: [Software Architecture, JavaScript, Canvas, Local-First, GitHub Pages]
coverImage: assets/img/og/paperlens.jpg
active: true
---

I wanted a simple thing: open a page on my iPhone, scan a document, straighten it, and save the result to Photos.

The reference was the scanning experience in the iPhone Notes app. A camera button alone would not be enough. The useful part is turning an angled photograph into a page you can read, share, and keep.

That became **Paperlens**: a browser-based document scanner built with AI assistance and delivered as one HTML file.

[Try Paperlens](https://infinitilogicsolutions.github.io/scan/)

<figure style="margin:2rem 0"><img src="/assets/img/og/paperlens.jpg" alt="Paperlens on iPhone, showing Scan document and Import photo controls" width="1170" height="1896" loading="lazy" decoding="async" style="display:block;width:100%;max-width:390px;height:auto;margin:0 auto;border-radius:18px"><figcaption style="text-align:center;margin-top:1rem">Paperlens running on iPhone: capture a document or import a photo.</figcaption></figure>

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

The complete scanner is approximately **49 KB of uncompressed HTML, CSS, and JavaScript**, with no third-party runtime dependencies. The page images themselves are separate in-memory or locally stored data, so that figure is the app size, not the size of a scanning session.

## A Draft Belongs on the Device

A multipage scan needs state. Paperlens stores its current draft in IndexedDB, including image blobs, corner coordinates, filters, and adjustments. Export preferences use localStorage.

That lets the same browser restore a draft after a reload. Captured documents are not uploaded to an application server.

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

The scanner caps the long edge at **2,200 pixels** to bound processing work on a phone. Maximum-detail export keeps that available resolution; balanced and small-file presets can reduce dimensions and JPEG quality.

PNG is also available for image export. Its usefulness and file size depend on the page content, so a lossless format is not automatically the smallest choice.

This is a practical client-side tradeoff: the user's device supplies the CPU and memory. Removing a backend changes where the work happens; it does not eliminate the work.

## What I Checked

Validation covered JavaScript syntax and real Canvas fixtures for corner detection, perspective resampling, filters, contrast, sharpening, rotation, page ordering, and JPEG/PNG encoding. Generated two-page PDFs were parsed to confirm page sizes and embedded images.

The actual iPhone camera, torch support, share-sheet choices, and layout still need device testing. Those browser and OS interactions deserve their own verification beyond processing checks.

## The Architectural Lesson

This workload has a small operating footprint because the document does not need to leave the device. Static hosting delivers the app; the browser captures, processes, stores the draft, and generates the files.

For Paperlens, the useful architectural question was: **can the place where the document is captured also be the place where it is processed?**

In this case, enough of that workflow fits in one HTML file to make a useful tool.

[Open Paperlens](https://infinitilogicsolutions.github.io/scan/) or [view the project](https://infinitilogicsolutions.github.io/posts/paperlens-browser-document-scanner.html).
