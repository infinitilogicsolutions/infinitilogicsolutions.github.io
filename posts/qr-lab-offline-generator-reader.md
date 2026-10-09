---
id: 17
type: project
title: QR Lab — A Private QR Generator and Reader in One HTML File
slug: qr-lab-offline-generator-reader
date: 2026-10-09
summary: Generate and read QR codes for Wi-Fi, contacts, links, locations and more. Customize colors and characters, export PNG or SVG, and keep the QR processing on your device.
tags: [JavaScript, Local-First, GitHub Pages, Software Architecture]
coverImage: assets/img/og/default.jpg
active: true
featured: true
---

## Goal

Build a QR tool I can open on my phone, use immediately, and keep as a single HTML file.

**QR Lab** combines a generator and reader with a simple pastel interface. GitHub Pages delivers the application; QR encoding, image decoding and exports happen in the browser.

[Open QR Lab](https://infinitilogicsolutions.github.io/qr/)

## Features

- Eleven QR types: links, contacts, Wi-Fi, text, email, SMS, phone calls, WhatsApp, locations, calendar events and UPI
- Wi-Fi selected by default, with network name, security, password and hidden-network support
- A compact type selector and editable fields
- A top-right gear for custom code/background colors and optional character badges
- Save/Cancel customization with locally remembered appearance preferences
- PNG and SVG downloads, printing, and image sharing where supported
- A reader for uploaded QR images or live camera frames
- Contact selection from the device where the browser supports it, plus local `.vcf` import
- A current-location button with browser-managed permission and editable coordinates
- No QR-processing backend, account requirement or runtime library download

## A Simple Main Page

Choose a QR type, fill its fields, and tap **Generate QR code**.

For Wi-Fi, enter the exact network name, choose its security type, and add the password. A generated Wi-Fi QR contains those credentials, so share it with the same care as the password itself. Personal networks are supported; enterprise networks requiring a username are outside this form.

Customization stays inside the **gear**. Pick a dark code color, a light background and, optionally, a character. **Save customization** closes the picker and remembers the appearance. Cancel restores the saved style.

Generated designs keep a white or light quiet zone, use higher error correction for character badges, and pass a check with the embedded reader. Test the final export with the phone or scanner that will actually use it.

## Contacts Without Re-Typing

Choose **Contact**, then **Choose from device**. A supporting browser opens its contact picker and returns only the contact details you select.

When direct picking is unavailable, **Import .vcf** reads a contact file locally. The form includes iPhone guidance for saving a shared contact to Files. Files with several contacts show a selector so you can choose one.

Imported details remain editable. Review the name, phone, email and address before generating the contact QR. Selecting a device contact is browser-dependent; importing a vCard is the portable fallback.

## A QR for Your Current Location

Choose **Location** and tap **Use current location**.

The browser asks for location permission when needed. QR Lab fills latitude and longitude and shows the accuracy reported by the device. Review the values, then Generate.

Permission denial, unavailable location or a timeout leaves manual entry available. This is a one-time request, not continuous tracking.

## Read Before You Open

Switch to **Read QR**, then start the camera or choose an image. Decoded content appears for review.

The reader does not automatically open websites, join Wi-Fi, add contacts or make payments. For HTTP(S) links, an explicit **Open scanned link** action is available. Other payloads appear as text that you can copy or turn back into a QR code.

Live camera requires HTTPS or localhost and camera permission. Image import also provides a fallback when the camera is unavailable.

## Tech Stack

- One HTML file with CSS and vanilla JavaScript
- An embedded QR encoder with UTF-8 support
- Embedded jsQR decoding for images, camera frames and generated-code checks
- SVG for vector output and Canvas for PNG export and decoding
- Native browser contact, geolocation, camera and sharing APIs where available
- `localStorage` for appearance preferences only
- GitHub Pages for static hosting

## Privacy and Boundaries

QR Lab does not upload or save contact fields, Wi-Fi passwords, scanned images or location coordinates. Its working data stays in memory; saved colors and character choices stay in the browser.

Browser and device location services may use their own positioning provider. A link, WhatsApp chat or UPI destination can require another app or an internet connection.

The self-contained HTML file can run offline once you have downloaded it. The hosted page does not register its own service worker, so a fresh offline visit is not guaranteed. Browser support for contact picking, sharing and specialized QR payloads varies.

Static QR codes have no built-in expiration, but the website or destination they point to can change.

## Build Story

[Read how I built a QR generator and reader that work in one HTML file](https://infinitilogicsolutions.github.io/posts/building-qr-lab-one-html-file.html).
