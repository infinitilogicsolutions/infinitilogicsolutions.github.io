---
id: 19
type: project
title: Canvas Lab Studio — A Little Creative Studio in Your Browser
slug: canvas-lab-studio
date: 2026-10-10
summary: Layer photos, make manual cutouts, style backgrounds, add text and drawings, and export images with a mobile-friendly editor that keeps your project on your device.
tags: [JavaScript, Local-First, Canvas, GitHub Pages]
coverImage: assets/img/og/default.jpg
active: true
featured: true
---

## Goal

Build a creative photo editor that I can open on my phone without creating an account or uploading my photographs to an editing service.

**Canvas Lab Studio**, shortened to **Canvas Lab** in the app header, brings photos, backgrounds, text, stickers and drawing into one pastel workspace. Its editing code and interface live in one HTML file. Small companion files provide installation metadata and offline caching on GitHub Pages.

[Open Canvas Lab Studio](https://infinitilogicsolutions.github.io/canvas-lab/)

## Features

- Add photos from your device, including transparent PNGs
- Arrange layers by dragging, scaling with corner handles, and rotating
- Manually erase a photo's background and restore original pixels with a brush
- Choose solid colors, pastel gradients, transparent backgrounds or your own background photo
- Add text with serif, sans-serif and monospace styles
- Add stickers and draw on independent layers
- Adjust photo brightness, contrast and saturation
- Add soft shadows and photo outlines
- Hide, lock, reorder, duplicate and delete layers
- Crop the composition or resize it to square, portrait, story and landscape sizes
- Undo and redo recent edits
- Auto-save the current project in the browser and export/import portable JSON project files
- Export PNG or JPG; PNG supports a transparent backdrop
- Use the device share sheet when file sharing is supported

## Start With a Photo

Tap **Add a photo**, select a layer, and use the tools below the canvas on mobile. On desktop, the tools sit beside it.

**Cutout** provides Erase and Restore brushes for the selected photo. This first release does not automatically identify a subject. Erase is a manual mask; Restore brings original pixels back.

**Backdrop** sets the environment. **Text**, **Draw**, and **Stickers** add the finishing touches. **Layers** controls how the pieces stack.

A small illustrated studio sample is included so you can explore the editor before choosing a photograph. It is drawn with Canvas code and is not an AI-generated product photo.

## Keep AI Behind the Gear

The settings gear includes **Premium AI · Coming soon**. Automatic background removal, generated backgrounds, smart object removal, retouching and relighting belong to a future phase.

There are no connected AI models, paid services or payment requirements in this release. The premium section is a roadmap placeholder.

## Save and Share

The current project auto-saves in IndexedDB on this browser. Export a project file from the gear menu to keep a backup or move it to another device. Importing or starting a new canvas replaces the current workspace, with a confirmation first.

Image exports flatten the layers. Transparent export removes the canvas backdrop; an opaque photo still needs a cutout if you want to remove its original background.

On supporting iPhone browsers, **Share / Save** opens the share sheet. Otherwise, download the image and use Files to save it to Photos.

## Privacy and Limits

Photo processing is local. The app has no photo upload endpoint, external editing library, analytics or AI calls. The footer links to my existing support page through a subtle **Buy me a coffee** link.

The HTML editor can work as a downloaded file in browsers that allow opening local HTML. The hosted app caches its own shell after a successful online visit and service-worker activation. Browser storage can be cleared or evicted, so project exports remain the durable backup.

Imported photos are reduced to a maximum 1600-pixel long edge to keep mobile memory use bounded; background photographs use a 2000-pixel limit. Enlarging an export does not recover original detail. Projects are limited to 30 layers, and very large canvases and exports have explicit size limits.

Runtime checks cover rendering, masks, undo, drawing, project serialization, validation, crop/resize, export settings and storage using a simulated DOM and native Canvas implementation. Actual iPhone gestures, installation and native sharing need device verification.

## Build Story

[Read how I built Canvas Lab Studio](https://infinitilogicsolutions.github.io/posts/building-canvas-lab-studio.html).
