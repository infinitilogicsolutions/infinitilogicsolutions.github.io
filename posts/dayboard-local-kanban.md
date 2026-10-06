---
id: 15
type: project
title: Dayboard — A Local-First Kanban Board in One HTML File
slug: dayboard-local-kanban
date: 2026-10-06
summary: A simple browser Kanban board with expandable cards, due dates, persistent timers, separate bookmarkable boards, and JSON or HTML backups. Your tasks stay on your device.
tags: [JavaScript, Local-First, GitHub Pages, Software Architecture]
coverImage: assets/img/og/dayboard-project.jpg
active: true
featured: true
---

## Goal

Build a small personal Kanban board that I can open in a browser, use immediately, and keep without an account or a backend.

**Dayboard** brings the familiar **To do → Doing → Done** workflow into one self-contained HTML file. GitHub Pages delivers the application; the browser owns the board data.

[Open Dayboard](https://infinitilogicsolutions.github.io/cards/?board=dayboard-default)

<figure style="margin:2rem 0"><img src="/assets/img/og/dayboard-project.jpg" alt="Dayboard desktop view with To do, Doing and Done columns, editable title and backup controls" width="1600" height="739" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;border-radius:18px"><figcaption style="text-align:center;margin-top:1rem">Three columns, expandable cards, and a board saved in this browser.</figcaption></figure>

## Features

- To do, Doing, and Done columns with card counts
- Click any card to open its title, notes, status, due date, and countdown timer
- Automatic local saving as you edit
- Desktop drag-and-drop between columns, plus a status selector for touch devices
- Start, pause, reset, and restart a timer on each card
- Due date/time badges and overdue indicators for unfinished cards
- Editable page titles that also update browser and iOS bookmark-title metadata
- Independent boards with separate bookmarkable URLs and local storage
- JSON export and validated import with a replacement confirmation
- Downloadable standalone HTML copies containing the current board
- A responsive, light interface with blue, amber, and mint columns

## Separate Boards, Separate Bookmarks

Click the title to rename a board—for example, **Work tasks** or **Home tasks**. Choose **New board** to create another board with its own `?board=<id>` URL.

Bookmark that exact URL. On iPhone, use Safari's Share menu and **Add to Home Screen**, reviewing the shortcut name before saving it. A shortcut already on the Home Screen may need renaming or recreating after the title changes.

The URL identifies the board; it does not contain the tasks. Opening the link on another device does not transfer or sync its contents.

## Keep a Backup You Can Take With You

**Export JSON** saves the current board's data. **Import JSON** validates the backup and asks before replacing the board you are viewing.

**Download HTML** carries the application and a snapshot of your board together. The downloaded copy gets its own board ID, so it can work independently from the original. Export filenames use the board's name.

Local saving is convenient, but it is not permanent storage. Browser resets, storage eviction, or clearing site data can remove your boards. Export important work regularly.

## Tech Stack

- One HTML file containing CSS and vanilla JavaScript
- CSS Grid for the board and native dialogs for card details
- `localStorage` for versioned board data
- URL query parameters for board identity
- Absolute timer deadlines for countdown recovery after reloads
- Blob downloads for JSON and standalone HTML export
- GitHub Pages for static hosting

There is no application server, account system, cloud task database, or third-party runtime dependency in Dayboard.

## Boundaries

Boards stay in the current browser's storage. They do not sync automatically between devices or browsers, and bookmarks are not collaboration links.

Timers recover their remaining time from a saved deadline, but alerts happen only while the page is open. Dayboard does not schedule background notifications or calendar events.

Local-first also does not mean that the hosted page is offline-installable. The app does not register its own service worker. A downloaded HTML copy is self-contained; a fresh offline visit to the hosted URL is a different concern.

## Build Story

[Read how I built a Kanban board that keeps its data in the browser](https://infinitilogicsolutions.github.io/posts/building-dayboard-local-kanban.html).