---
id: 16
type: blog
title: I Built a Kanban Board That Keeps Its Data in the Browser
slug: building-dayboard-local-kanban
date: 2026-10-06
summary: How a simple one-file Kanban app combines local saving, card timers, independent bookmarkable boards, and portable backups without a task-management backend.
tags: [Software Architecture, JavaScript, Local-First, GitHub Pages]
coverImage: assets/img/og/dayboard-blog.jpg
active: true
---

I wanted a simple Kanban board: add a task, open it for more details, and move it from **To do** to **Doing** to **Done**.

I also wanted a due date, a timer, and a way to keep separate boards on my phone. None of that required a shared workspace, an account, or a task-management server.

That became **Dayboard**: a local-first Kanban application built with AI assistance and delivered in one HTML file.

[Try Dayboard](https://infinitilogicsolutions.github.io/cards/?board=dayboard-default)

<figure style="margin:2rem 0"><img src="/assets/img/og/dayboard-blog.jpg" alt="Dayboard on iPhone with its editable My board title, export controls and vertically stacked Kanban columns" width="1170" height="1928" loading="lazy" decoding="async" style="display:block;width:100%;max-width:390px;height:auto;margin:0 auto;border-radius:18px"><figcaption style="text-align:center;margin-top:1rem">The same board becomes a vertically stacked workspace on a phone.</figcaption></figure>

## Keep the Main View Small

A card needs a title. The board needs three columns. Everything else can wait until I open the card.

The card dialog holds its notes, status, due date/time, and countdown timer. The board shows a short notes preview and useful badges without turning each task into a form.

Desktop users can drag cards between columns. On a phone, changing the status inside a card provides a straightforward touch-friendly alternative.

The point was not to recreate every feature of a commercial project-management platform. It was to complete the personal workflow with a small interface.

## Static Hosting, Local State

The app lives at `/cards/index.html` on GitHub Pages. Its markup, styling, and JavaScript are all in that file.

The hosting layer serves code. It does not receive the board's tasks.

Each board is a versioned JSON object with a stable ID, an editable name, and an array of cards. A card stores its title, description, status, due date, and timer state. The browser saves changes in `localStorage`.

That is enough for small personal boards. It is not an architectural shortcut for every workload: shared teams, access control, cross-device synchronization, or large attachments would need a different design.

## A Title Is Not a Board Identity

My next requirement was practical: rename the page and save multiple Home Screen bookmarks.

Changing the visible heading alone would not separate the saved data. If every bookmark used the same storage key, **Work tasks** and **Home tasks** would still open the same board.

Dayboard separates identity from presentation:

- The board ID selects its storage key: `dayboard.v1.<id>`.
- The URL's `board` parameter identifies the board to load.
- The editable name updates the page heading, browser title, and iOS bookmark-title metadata.

**New board** creates a fresh ID and bookmarkable URL while keeping the previous board saved. Renaming a board changes its label, not its identity.

There is an important limit: the URL does not carry the tasks. It is a pointer into this browser's local storage, not a sharing link. Opening it elsewhere does not reproduce the board. Export/import is the deliberate transfer path.

## Timers Need a Deadline, Not Just a Counter

A timer that subtracts one second on every interval callback assumes the browser will keep calling it on schedule. Phones can suspend pages, and background tabs can throttle callbacks.

Dayboard stores an absolute end time while a timer is running. The displayed time is calculated from that deadline and the current clock:

```javascript
remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
```

Pausing stores the remaining duration. Restarting creates a new deadline. Reloading or returning to the page recalculates what is left rather than assuming every interval tick ran.

This makes countdown recovery more reliable. It does not make the browser a background reminder service: the app alerts only while the page is open. Due dates are stored task metadata, not events added to a system calendar.

## Local Saving Needs an Exit

Keeping data on the device removes the need for a task backend, but it also makes backup the user's responsibility.

Dayboard has two exits:

1. **JSON export** carries the board's structured data. Import checks the schema, card IDs, field limits, and timers, then asks before replacing the current board.
2. **HTML download** carries both the application and a snapshot of the board. The copy receives a new ID so it can be used independently.

The exported filenames follow the board's name. The HTML copy embeds escaped JSON, and card text is rendered as text rather than interpreted as HTML.

If local saving fails, the page shows a warning to export before closing. That matters more than silently pretending the changes are safe.

## Local-First Is Not a Cloud Backup

There is no automatic sync, shared editing, or server-side recovery. Clearing site data or losing browser storage can remove a board. A bookmark preserves an address, not its contents.

There is also a difference between local processing and offline delivery. Dayboard has no runtime library downloads, but the hosted page does not register its own service worker. A fresh offline visit is not guaranteed. The downloaded HTML copy provides the self-contained version to keep.

These limits belong in the product description, not in a footnote after someone loses their tasks.

## What I Checked

Functional checks covered saved titles, independent board URLs and storage, reloading the correct board, preserving previous boards, empty-title fallback, and named exports. Earlier checks covered card editing, local saving, JSON validation, deletion, and timer start/pause/restart/reset/expiry.

The supplied screenshots show the desktop and phone layouts. Actual iPhone Home Screen shortcuts and browser storage behavior still deserve device testing; a functional check is not the same as testing an installed shortcut.

## The Architectural Lesson

For a personal tool, the useful question was: **does this workflow need shared state at all?**

Here, a static file delivers the interface, the browser holds the working data, and exports provide portability. The result is a small tool with a clear boundary—not a cloud platform compressed into a single page.

[Open Dayboard](https://infinitilogicsolutions.github.io/cards/?board=dayboard-default) or [view the project](https://infinitilogicsolutions.github.io/posts/dayboard-local-kanban.html).