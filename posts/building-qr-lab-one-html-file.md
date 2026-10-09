---
id: 18
type: blog
title: I Built a QR Generator and Reader That Work in One HTML File
slug: building-qr-lab-one-html-file
date: 2026-10-09
summary: How QR Lab keeps QR generation, reading and image exports inside the browser, while using device APIs carefully for contacts and current location.
tags: [Software Architecture, JavaScript, Local-First, GitHub Pages]
coverImage: assets/img/og/default.jpg
active: true
---

I wanted a QR generator I could open on my phone and use without an account.

A Wi-Fi code was the starting point. Then came links, contact information, a reader, colors, character badges and a way to use my device's current location.

The result is **QR Lab**: a generator and reader built with AI assistance, delivered as one self-contained HTML file.

[Try QR Lab](https://infinitilogicsolutions.github.io/qr/)

## Start With the Everyday Task

The first screen opens with Wi-Fi selected. Enter the network name, security and password, then Generate.

A dropdown keeps the other QR types available without filling the screen with separate tools: links, contacts, text, email, SMS, calls, WhatsApp, locations, calendar events and UPI.

Each type is a small form that creates a specific payload. The QR encoder does not need to know whether those bytes describe a website, a network or a contact. It needs a correctly formatted string.

That separation keeps the implementation understandable: the form owns its fields, the payload builder owns its format, and the encoder owns the QR matrix.

## Keep Customization Behind the Gear

Color and character choices are useful, but they do not need to occupy the main page.

The top-right gear opens the customization picker. Save commits the appearance preferences and closes it. Cancel restores the previous choices.

Only those appearance preferences go into local storage. Contact details, Wi-Fi credentials and coordinates stay in memory.

This is a small distinction with a practical consequence: reopening the app can restore its look without restoring someone else's personal information into the form.

## A Beautiful QR Still Has to Scan

A QR code is structured data rendered as an image. Decorating it changes what the scanner sees.

QR Lab uses dark modules on a light background and retains a four-module quiet zone around the matrix. Custom color pairs must pass a contrast check.

Character badges occupy a small area in the center. Choosing one automatically uses High error correction, giving the code more redundancy to tolerate the covered area.

The app then draws the proposed design to a canvas and attempts to decode it with the embedded reader. If the result does not match the intended payload, it refuses that design.

That is useful feedback during generation. It is not a guarantee for every camera, printer, paper size or lighting condition. The exported code still needs a scan test before being shared or printed.

## Embed the Dependencies, Keep the File Portable

Using a script from a CDN would make the source shorter, but it would also make a fresh download depend on fetching that script.

QR Lab embeds its QR encoder and jsQR decoder, with their license notices. The CSS, UI, payload builders and export logic are in the same file.

SVG represents the module grid for vector output. Canvas creates PNG images and supplies pixel data to the reader. The app maintains integer-sized modules when rasterizing the code.

GitHub Pages serves the file; there is no application endpoint receiving a password or generating an image.

The distinction matters: downloading a self-contained HTML file provides offline QR processing. Opening a hosted URL for the first time without a connection is a separate delivery problem. QR Lab does not register its own service worker.

## Device Features Need a Fallback

A **Choose from device** button sounds simple. Browser support makes it more complicated.

Where the Contact Picker API is available, a button tap opens the browser's picker. The page receives the selected contact properties, not unrestricted access to the address book.

Where it is unavailable, the app offers local vCard import. That gives iPhone users and other unsupported browsers a path through an exported `.vcf` file.

The importer handles UTF-8 text, folded lines, escaped separators and common contact properties. It skips photos and offers a selector for files containing multiple contacts. File size and contact-count limits keep the work bounded.

It does not try to silently interpret text encodings it cannot safely handle. It explains the problem and leaves manual entry available.

The selected information fills editable fields. Generating the QR is a separate step, giving the user a chance to review what will be shared.

## Ask for Location at the Moment It Is Useful

The Location form has a **Use current location** button.

It makes a one-time location request only after that tap. The browser handles permission, and the form shows the returned coordinates and reported accuracy.

There is no permission request on page load and no continuous location watcher. If the request is denied, unavailable or times out, typed coordinates remain an option.

An asynchronous result also needs context. If I change QR types or clear the form while a request is pending, that old result should not fill a different screen. A sequence token makes late callbacks harmless.

QR Lab does not store or upload those coordinates. The browser or operating system may still use a positioning service to determine them; local QR processing does not control that layer.

## Reading Is Not the Same as Opening

The reader accepts an uploaded image or live camera frames. Images are decoded locally, and camera tracks stop after a successful scan or when the user leaves the camera workflow.

The decoded result is displayed as text. Websites get an explicit Open action; other payloads can be copied or regenerated.

The app does not automatically join a network, add a contact, place a call or launch a payment. A QR reader should let the person see what they are about to use.

This also avoids pretending that every specialized payload has identical support across phone cameras and other scanning apps.

## What I Checked

Generation checks round-tripped all eleven payload types through exported SVG images and the embedded reader, including Unicode text, character badges and color palettes.

Contact tests covered selection, cancellation, editable field filling, file fallback, multi-contact import and bounded parsing. Location tests covered successful fixes, rounding, reported accuracy, denied permission, timeout, unavailable positioning and stale callbacks.

Those checks exercise the code paths. Native contact pickers, actual permission prompts, iPhone sharing and camera behavior still require device testing.

## The Architectural Lesson

QR generation and decoding do not inherently require shared server state.

For this tool, static hosting delivers the application, the browser processes the QR data, and explicit exports provide the result. Device APIs add convenience, while editable fields and file import keep the workflow usable when those APIs are absent.

The useful boundary is clear: a small personal tool that keeps its QR work on the device and asks for additional access only when the user needs it.

[Open QR Lab](https://infinitilogicsolutions.github.io/qr/) or [view the project](https://infinitilogicsolutions.github.io/posts/qr-lab-offline-generator-reader.html).
