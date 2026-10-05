---
id: 13
type: project
title: Paperlens — Document Scans, Two-Sided IDs, and Passport Photo Sheets
slug: paperlens-browser-document-scanner
date: 2026-10-05
summary: A local-first browser scanner with editable document corners, front/back ID capture, passport and visa photo print sizes, and 6 × 4-inch photo sheets. One HTML file, hosted on GitHub Pages.
tags: [JavaScript, Canvas, Local-First, GitHub Pages, Software Architecture]
coverImage: assets/img/og/paperlens.jpg
active: true
featured: true
---

## Goal

Build the everyday document-scanning workflow I use on an iPhone, then extend it to two related tasks: keeping both sides of an ID together and preparing passport or visa photos for an inexpensive photo print.

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
- Guided front/back ID or license capture, separate cropping, and a combined single-page export
- Later retakes or crop edits for either ID side, plus unfinished ID draft recovery
- Developer-gated passport/visa photo sizing, portrait crop, pan, zoom, and automatic duplication
- Landscape 6 × 4-inch print sheets as a 300-ppi JPG or a PDF with exact physical dimensions
- A pastel lavender, mint, peach, and sky-blue interface; enabled photo tools appear directly on the main page

All studio options are included. There is no paid tier or account registration in the scanner.

## Two Sides of an ID, One Page

Choose **Scan ID / license** from the start screen or **Add page → ID / license**. Capture or import the front, adjust its four corners, then flip the card and repeat for the back.

**Combine on one page** places both cropped sides vertically on a white canvas, keeping their aspect ratios. The combined ID exports as one image or one PDF page through the existing save actions. **Edit ID front / back** reopens either side for a retake or crop adjustment without creating a duplicate document page.

Unfinished ID drafts are saved on the device. Closing the ID dialog keeps the draft; **Discard ID draft** removes only that unfinished ID. Selecting ID mode is explicit—the app does not identify license types or extract identity details.

## Passport and Visa Photo Print Sheets

Open **Studio** using the sliders icon and turn on **Developer mode**. The complete photo studio appears at the top of the main page, and the preference remains enabled after reload.

Upload a portrait, choose the requested size, and position it with drag, zoom, and horizontal/vertical controls. The crop stays at the selected aspect ratio.

| Preset | Output size | Use |
| --- | --- | --- |
| U.S. | 2 × 2 inches | Printed passport photos; also the printed U.S. visa format when the application requests it |
| India overseas | 2 × 2 inches | Nominal overseas passport format; check the specific consulate/application |
| India exact millimetres | 51 × 51 mm | When the instructions explicitly specify this measurement |
| Smaller document format | 35 × 45 mm | Only when the particular passport, visa, or document application requests it |

[U.S. passport rules](https://travel.state.gov/en/passports/apply/help/photos.html), [U.S. visa photo rules](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html), and [an Indian overseas passport example](https://www.indianembassynetherlands.gov.in/page/basic-requirements-and-photo-specifications/) provide reference requirements. These presets are dimensions, not a claim that every passport or visa application uses the same rules.

The studio repeats the crop on a **6 × 4-inch landscape sheet**. Maximum layout fits six nominal 2-inch square photos without gaps. A spaced layout reserves trimming room and fits fewer copies. Exact 51 mm is slightly larger than 2 inches, so fewer copies fit; the tool preserves the requested size instead of shrinking it.

Prepare the sheet, then share/download a **1800 × 1200-pixel JPG tagged at 300 ppi** or download a PDF whose page is exactly **6 × 4 inches**. These exports ignore document filters, compression presets, PDF paper selection, and document margins.

Order a landscape 6 × 4-inch print with no automatic crop or enlargement. For the PDF, select **100% / Actual size** on 6 × 4-inch paper. Check the cut photos with a ruler: borderless overscan or fit-to-page settings can change the dimensions. The sheet can be sent to a photo lab as an ordinary print; pricing depends on the provider.

This tool crops and resizes an existing portrait. It does not retouch a face, replace a background, check passport compliance, or prepare a digital visa-application upload. Start with a suitable unaltered photo and follow the receiving authority’s requirements.

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

The application has no third-party runtime dependencies or separate scanning service. The document scanner, ID composer, and photo-print studio remain in the same HTML file.

## Keeping a Copy on iPhone

Select a page and tap **Save to Photos**. Paperlens opens a prepared image preview. Tap **Share image**, then choose **Save Image** in the iPhone share sheet when available. Touching and holding the preview provides another saving path; downloading keeps a copy in Files.

Photos exports the selected page. PDF export combines all pages in the current draft. Preparing the PDF and sharing it use separate taps.

## Local Processing and Storage

The scanner does not upload captured documents. Image processing and file generation happen on the device. Document pages, completed ID sides, and unfinished ID drafts are stored in IndexedDB; export preferences and the Developer toggle are stored in localStorage. Portraits in the photo-print studio stay in memory rather than the draft database; **Clear photo** releases the portrait and prepared output.

Draft recovery is specific to the browser and site origin. It is not cloud sync, and browser storage can be cleared or evicted. Export important documents before relying on the draft as your only copy.

## Practical Limits

Edge detection is a heuristic. It works best with light paper on a darker background; manual corner adjustment remains available when the detector misses an edge.

Document scans and combined IDs cap the image's long edge at **2,200 pixels**. The portrait studio bounds its source canvas to **3,500 pixels** and produces a fixed **1800 × 1200-pixel** sheet. Maximum-detail export preserves the available scan resolution; it does not invent extra detail. The PDFs contain page images rather than an OCR-generated text layer.

Live camera capture needs HTTPS and permission. Torch control and native sharing depend on the device and browser. The app is designed for iPhone Safari, with physical-device verification still needed across camera and sharing paths.

## Result

Paperlens brings three useful image workflows to a static website: document scanning, two-sided ID composition, and passport/visa-size photo print sheets. Capture, cropping, draft storage, and file generation stay on the device without an image-processing backend.

[Try the scanner](https://infinitilogicsolutions.github.io/scan/) or [read how it was built](https://infinitilogicsolutions.github.io/posts/building-paperlens-single-html-document-scanner.html).
