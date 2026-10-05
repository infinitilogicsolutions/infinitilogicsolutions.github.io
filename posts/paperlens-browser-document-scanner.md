---
id: 13
type: project
title: Paperlens — A Document Scanner That Runs in Your Browser
slug: paperlens-browser-document-scanner
date: 2026-10-05
summary: A single-file document scanner with editable corners, perspective correction, on-device drafts, and JPEG, PNG, and multipage PDF export. Built for iPhone Safari and hosted on GitHub Pages.
tags: [JavaScript, Canvas, Local-First, GitHub Pages, Software Architecture]
coverImage: assets/img/og/paperlens.jpg
active: true
featured: true
---

## Goal

Build the everyday document-scanning workflow I use on an iPhone: capture a page, adjust its edges, straighten it, and keep a usable copy.

Paperlens takes that familiar workflow into a browser. The scanner, editing tools, local draft storage, and export logic live in **one HTML file**, hosted at `/scan/` on GitHub Pages.

[Open Paperlens](https://infinitilogicsolutions.github.io/scan/)

## Features

- Live camera capture with manual and automatic modes, plus photo import
- Automatic corner suggestions for light paper against a contrasting background
- Four draggable corners and real perspective correction
- Color, clean, grayscale, and black-and-white filters
- Brightness, contrast, sharpening, and page rotation
- Multiple pages, page reordering, and draft recovery on the same browser and device
- A larger editing workspace and a full-screen preview with zoom
- JPEG and PNG image export, with detail and file-size presets
- Multipage PDFs with A4, US Letter, or fitted page sizes and configurable margins
- Native sharing when available, with image-preview and download fallbacks

All studio options are included. There is no paid tier or account registration in the scanner.

## How It Works

**Capture or import → adjust corners → straighten → enhance → export.**

The camera frame or imported photo becomes a Canvas image. A lightweight bright-region detector proposes a document outline. The user can correct those suggestions before accepting the scan.

The four corners define a projective transformation. Paperlens maps that quadrilateral to a rectangular page and uses bilinear interpolation to sample the source pixels. That straightens an angled document rather than simply cropping around it.

The app then applies the chosen image adjustments and prepares an export file.

## Technologies and Tools Used

- HTML, CSS, and vanilla JavaScript
- Canvas 2D for image processing
- Browser camera APIs and file inputs
- IndexedDB for draft pages and image blobs
- localStorage for export preferences
- Web Share API for supported native sharing
- Inline SVG icons
- GitHub Pages for static hosting
- AI-assisted development with Codex

The application has no third-party runtime dependencies or separate scanning service. Its HTML file is approximately **49 KB uncompressed**.

## Keeping a Copy on iPhone

Select a page and tap **Save to Photos**. Paperlens opens a prepared image preview. Tap **Share image**, then choose **Save Image** in the iPhone share sheet when available. Touching and holding the preview provides another saving path; downloading keeps a copy in Files.

Photos exports the selected page. PDF export combines all pages in the current draft. Preparing the PDF and sharing it use separate taps.

## Local Processing and Storage

The scanner does not upload captured documents. Image processing and file generation happen on the device. The current draft is stored in IndexedDB; export preferences are stored in localStorage.

Draft recovery is specific to the browser and site origin. It is not cloud sync, and browser storage can be cleared or evicted. Export important documents before relying on the draft as your only copy.

## Practical Limits

Edge detection is a heuristic. It works best with light paper on a darker background; manual corner adjustment remains available when the detector misses an edge.

Processing caps the image's long edge at **2,200 pixels**. Maximum-detail export preserves the available scan resolution; it does not invent extra detail. The PDFs contain page images rather than an OCR-generated text layer.

Live camera capture needs HTTPS and permission. Torch control and native sharing depend on the device and browser. The app is designed for iPhone Safari, with physical-device verification still needed across camera and sharing paths.

## Result

Paperlens brings a useful scanning workflow to a static website: document straightening, editing, local drafts, and multiple export formats without operating an image-processing backend.

[Try the scanner](https://infinitilogicsolutions.github.io/scan/) or [read how it was built](https://infinitilogicsolutions.github.io/posts/building-paperlens-single-html-document-scanner.html).
