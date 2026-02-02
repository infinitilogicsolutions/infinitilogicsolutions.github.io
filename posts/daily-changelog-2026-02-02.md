---
id: 8
type: blog
title: "Daily Change Log — February 2, 2026"
slug: daily-changelog-2026-02-02
date: 2026-02-02
summary: "A quick recap of today’s updates: social sharing, CODEOWNERS, and automated post generation."
---

Today was all about making the blog easier to share and the publishing pipeline more reliable. Here’s the quick rundown.

## Social sharing on posts

- Added share actions for **X**, **LinkedIn**, and **Facebook** on blog cards.
- Added a **copy link** button everywhere sharing appears.
- Expanded the post page share section to include Facebook and unified all share URL logic.

## Safer automation for nightly publishing

- Updated the GitHub Actions workflow to push `data/posts.json` using a **deploy key** instead of the default token.
- Documented the `DEPLOY_KEY` setup so the nightly generator can still push even with strict branch rules enabled.

## Repo hygiene updates

- Added a **CODEOWNERS** file to make ownership explicit.
- Updated docs and release notes to reflect the new sharing and automation behavior.

## What this means for readers

Sharing a post is now one click from the blog list or the post itself, and the nightly publishing job should keep content in sync even with branch protections enabled.

Thanks for following along — more improvements coming soon.
