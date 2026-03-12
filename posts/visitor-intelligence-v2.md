---
id: 10
type: blog
title: "Visitor Intelligence v2: 67 Signals, Bot Scoring, and UX Personalization Without a Backend"
slug: visitor-intelligence-v2
date: 2026-03-12
summary: "How the Visitor Intelligence system logs 67 client signals, scores bots, and personalizes UX on a static site using Google Sheets."
tags:
  - Visitor Intelligence
  - Analytics
  - Bot Detection
  - UX Personalization
  - Google Sheets
  - Privacy
coverImage: /assets/img/og/visitor-intelligence-v2.png
active: true
---

Visitor intelligence is easy to overcomplicate. I wanted the opposite: a serverless, static-site friendly system that still answers real questions about who is visiting, what they experience, and whether they are human.

The result is Visitor Intelligence v2, implemented directly in this codebase. It captures 67 client-side signals, scores bots with a weighted checklist, and uses the data to personalize UX, all without a backend server.

![Visitor intelligence visualization](/assets/img/og/visitor-intelligence-v2.png)

## What ships in this repo

The system lives entirely in the front-end JavaScript layer and a Google Apps Script endpoint:

- `assets/js/visitor-config.js` defines the data schema and storage keys.
- `assets/js/fingerprint.js` collects device, browser, network, and behavioral signals, then computes `botScore`, `botLabel`, and `botSignals`.
- `assets/js/tracker.js` assembles a 69-field payload and sends it via `sendBeacon` or a short-lived `fetch()` call.
- `assets/js/one-tap.js` optionally adds Google One Tap identity data after explicit consent.
- `assets/js/personalizer.js` applies dark mode, reduced motion, performance mode, and touch-friendly tweaks, and renders the privacy notice and “Clear my data” action.

This combination keeps the site fully static on GitHub Pages while still producing structured analytics in Google Sheets.

## Signal coverage: 67 data points, 9 categories

The v2 schema captures a wide sweep of signals, including:

- Session and page metadata
- Display and device characteristics
- Accessibility and preference settings
- Network conditions and performance timing
- Browser and platform fingerprints
- Behavioral signals like time on page, scroll depth, and mouse entropy

These signals are assembled into a single row per visit. The bot-scoring layer then adds `botScore`, `botLabel`, and `botSignals` so downstream dashboards can filter reliably.

## Bot scoring that uses real behavior

The system does not rely on a single magic check. Instead, it layers environment fingerprints (like WebGL and audio hashes) with behavioral signals (scroll depth, first click time, mouse entropy). The weighted scoring model lives in `assets/js/fingerprint.js` and labels visitors as Human, Likely Human, Suspicious, Likely Bot, or Bot.

This keeps metrics usable without throwing out legitimate users, and it avoids the brittleness of pure headless detection.

## Personalization that stays light

Personalization happens locally and immediately. The personalizer module toggles CSS classes for dark mode, reduced motion, touch mode, and performance mode based on the captured signals. Returning visitors get a subtle welcome-back toast on the home page, and signed-in Google users see their identity in the nav.

Because the experience changes are client-side, the UI still loads fast and never blocks on analytics.

## Privacy and control

The system deliberately separates anonymous signals from identity. Google One Tap is optional and only populates identity fields after consent. A persistent privacy notice is injected into the footer along with a “Clear my data” button that wipes local storage and disables auto-select for One Tap.

## The PRD is attached for AI collaboration

If you are using an AI tool to extend or review the system, the full spec is already included in the repo at `docs/prd/visitor-intelligence-prd-v2.md`. Attaching that PRD gives the AI the exact schema, scoring rules, and privacy constraints it needs to stay aligned with the implementation.

## What I will explore next

- Tightening the dashboard formulas for more actionable insights
- Adding a lightweight consent banner for jurisdictions that require it
- Exploring how to publish a read-only metrics view without exposing raw data

If you are building a static site and want serious insight without a backend, this approach is a good baseline. It is fast, transparent, and easy to tune as traffic grows.
