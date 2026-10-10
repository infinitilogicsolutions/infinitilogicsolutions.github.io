---
id: 20
type: blog
title: I Built a Little Photo Studio That Keeps the Editing in Your Browser
slug: building-canvas-lab-studio
date: 2026-10-10
summary: Canvas Lab Studio combines Photoroom-inspired photo workflows with visual composition ideas from ArtCraft, using independent code and a local-first first release.
tags: [Software Architecture, JavaScript, Local-First, Canvas]
coverImage: assets/img/og/default.jpg
active: true
---

I came across ArtCraft while thinking about creative tools that could work like my other HTML projects.

The appeal was visual control: arrange the scene, compose the layers, and make deliberate choices. Photoroom offered another useful reference: begin with a photograph, isolate the subject, and give it a better setting.

That led to **Canvas Lab Studio**. It borrows workflow ideas, while using an independent interface, original code, and an intentionally smaller first release.

[Try Canvas Lab Studio](https://infinitilogicsolutions.github.io/canvas-lab/)

## Build the Editor Before Connecting AI

Layers, backgrounds, crop, resize, text and export do not need a generative model.

The first release focuses on those useful building blocks. Background removal is manual: brush away the unwanted pixels and restore the parts you want to keep. There is no automatic segmentation disguised behind that button.

The gear contains **Premium AI · Coming soon**. Automatic background removal, generated backgrounds, smart object removal and relighting are reserved for a future phase. No model downloads, provider keys or paid AI services are connected today.

## One Scene, Two Canvases

The main canvas renders the artwork. A separate overlay draws selection bounds, scale handles and crop guides.

That separation means a downloaded image contains the design, without selection boxes or editing controls. Exports replay the scene into a fresh canvas at the requested resolution.

Each layer stores its position, rotation, opacity and style. Photos carry their own raster source; text stays editable. Drawing strokes live on an independent raster layer rather than becoming part of the background.

## Masks Keep the Original Photo

A cutout should be reversible.

Canvas Lab keeps the original imported photo and a separate alpha mask. Erase removes opacity from the mask; Restore paints opacity back. The editor combines the source and mask when rendering.

This lets a person recover an accidentally erased edge without re-importing the photograph. It also makes the cutout portable: the project backup includes both source and mask.

There is a deliberate memory tradeoff. Imported photos are reduced to a maximum 1600-pixel long edge, background photos to 2000 pixels. The app is intended for small compositions on phones rather than unrestricted professional-resolution documents.

## Crop the Whole Composition

Crop changes the canvas boundary and translates the layers into that new frame. It preserves the backdrop's existing framing by capturing the cropped background, rather than unexpectedly re-centering it.

Resize has a different job. It can uniformly scale the composition to fit a new canvas, or change the canvas around the existing artwork. A portrait export should not stretch a square photograph into a different shape.

## Save Locally, Back Up Explicitly

IndexedDB stores the current project after edits. Writes are serialized so an older save cannot overtake a newer one.

Local storage is convenient, but it is not a permanent archive. The gear also offers project export and import. A project JSON file carries the editable scene and embedded image data, allowing it to move between devices.

The importer checks dimensions, layer types, styles and asset sources. It accepts embedded supported raster images rather than fetching arbitrary remote assets. If image loading fails, the previous canvas is restored.

## Keep the Phone Workflow Simple

On mobile, the artwork comes first, followed by a compact tool strip and the selected tool's controls. Desktop gives those controls a side panel.

Pointer events handle dragging, corner scaling and brushes. Settings and export use native dialogs. The image share button uses file sharing when the browser supports it and otherwise falls back to downloading.

The footer keeps the support link visible without interrupting the creative task.

## What Was Checked

Functional checks used a simulated DOM with a native Canvas implementation. They exercised artwork rendering, erase/restore masks, undo, drawing, transparent PNG and JPG behavior, portable project restore, malformed imports, crop, resize, local save ordering and export size limits.

These are code-path checks, not a substitute for testing actual Safari gestures, Home Screen installation or iPhone share sheets. Those remain device checks.

## The Next Phase

The useful next milestone is automatic background removal behind the gear. Before adding it, I want to choose a suitably licensed model and measure download size, memory use, cutout quality and speed on an iPhone.

The editor can remain useful while that work happens. A good creative tool starts with a controllable canvas and reliable exports.

[Open Canvas Lab Studio](https://infinitilogicsolutions.github.io/canvas-lab/) or [view the project](https://infinitilogicsolutions.github.io/posts/canvas-lab-studio.html).
