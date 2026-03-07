# 📝 Writing Posts in Markdown

This directory contains your blog posts and projects written in **Markdown** format.

## 🚀 How It Works

1. **Write** a new `.md` file in this directory
2. **Commit and push** to GitHub
3. **GitHub Actions automatically** converts all markdown files to `data/posts.json` and `posts/*.html`
4. Your site updates automatically! ✨

## 📋 Markdown File Format

Every markdown file must have **frontmatter** (metadata) at the top:

```markdown
---
id: 1
type: blog
title: Your Post Title
slug: your-post-slug
date: 2026-01-05
summary: A brief description of your post
coverImage: assets/img/cover.jpg
---

Your markdown content starts here...

## Heading 2

Regular paragraph text.

- Bullet points
- Work great

**Bold text** and *italic text* work too.

```code blocks are supported```
```

## 🏷️ Frontmatter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `id` | ✅ Yes | Unique number for each post | `1` |
| `type` | ✅ Yes | Either `blog` or `project` | `blog` |
| `title` | ✅ Yes | Post title | `My Awesome Post` |
| `slug` | ❌ No | URL-friendly slug (auto-generated from filename if omitted) | `my-awesome-post` |
| `date` | ✅ Yes | Publication date (YYYY-MM-DD) | `2026-01-05` |
| `summary` | ✅ Yes | Brief description shown on cards | `A guide to...` |
| `coverImage` | ❌ No | Path to cover image (defaults to `opengraph.jpg`) | `assets/img/og/my-post.jpg` |

## ✍️ Writing Tips

### Use Markdown Formatting

- `# Heading 1` → Main title (avoid, use frontmatter `title` instead)
- `## Heading 2` → Section headings
- `### Heading 3` → Subsections
- `**bold**` → **bold text**
- `*italic*` → *italic text*
- `[link](url)` → hyperlinks
- `` `code` `` → inline code
- Triple backticks for code blocks

### Naming Your Files

- Use lowercase and hyphens: `my-blog-post.md`
- Be descriptive: `getting-started-with-react.md`
- If you don't specify a `slug` in frontmatter, the filename becomes the slug

### ID Numbers

- Each post needs a unique `id`
- Use sequential numbers: 1, 2, 3, etc.
- Check existing posts to avoid duplicates

## 🧪 Test Locally

Before pushing, you can test the conversion locally:

```bash
# Install dependencies (first time only)
npm install

# Generate JSON from markdown
npm run generate

# Preview your site
npm run preview
```

Then open `http://localhost:8000` in your browser.

## 📁 File Examples

### Blog Post Example

**File:** `posts/my-first-post.md`

```markdown
---
id: 10
type: blog
title: My First Blog Post
date: 2026-01-05
summary: Sharing my thoughts on web development and why I started this blog.
---

Welcome to my blog! I'm excited to share my journey as a developer.

## Why I Started

I wanted a place to document my learning and share knowledge with others.

## What's Next

Stay tuned for tutorials, project showcases, and more!
```

### Project Example

**File:** `posts/weather-app-project.md`

```markdown
---
id: 11
type: project
title: Weather Dashboard App
date: 2026-01-04
summary: A beautiful weather app built with vanilla JavaScript and OpenWeatherMap API.
coverImage: assets/img/weather-app.png
---

This project displays real-time weather data in an intuitive interface.

## Features

- 5-day forecast
- Location search
- Temperature unit conversion

## Tech Stack

- Vanilla JavaScript
- OpenWeatherMap API
- CSS Grid
```

## ⏰ Scheduled Publishing

You can **schedule posts for future publication**!

### How It Works

1. **Write a post with a future date:**

```markdown
---
id: 10
type: blog
title: My Future Post
date: 2026-01-10  👈 Future date!
summary: This will publish on Jan 10
---
```

2. **Push to GitHub anytime:**

```bash
git add posts/my-future-post.md
git commit -m "Schedule post for next week"
git push
```

3. **Automation handles the rest:**
   - GitHub Actions runs **every night at 2 AM UTC**
   - Checks all markdown files
   - Only publishes posts where `date <= today`
   - Your post goes live automatically on its scheduled date! 🎉

### Benefits

✅ **Write ahead** - Create multiple posts at once  
✅ **No manual publishing** - Forget about it, it publishes automatically  
✅ **Perfect timing** - Posts go live overnight, ready for morning readers  
✅ **Time zone agnostic** - Set the date, don't worry about exact times  

### Example Workflow

```bash
# Monday: Write 5 posts for the week
touch posts/monday-post.md      # date: 2026-01-06
touch posts/tuesday-post.md     # date: 2026-01-07  
touch posts/wednesday-post.md   # date: 2026-01-08
touch posts/thursday-post.md    # date: 2026-01-09
touch posts/friday-post.md      # date: 2026-01-10

# Push them all at once
git add posts/*.md
git commit -m "Schedule week's posts"
git push

# Each post will automatically go live on its date!
```

### Customizing the Schedule

To change when posts publish, edit `.github/workflows/generate-posts.yml`:

```yaml
schedule:
  # Current: 2 AM UTC
  - cron: '0 2 * * *'
  
  # Examples:
  # 6 AM UTC:  '0 6 * * *'
  # Midnight:  '0 0 * * *'
  # Twice daily: '0 2,14 * * *'
```

## 🔄 Workflow Summary

```
1. Create/edit .md file in posts/
           ↓
2. Git commit + push to GitHub
           ↓
3. GitHub Actions triggers (on push OR nightly)
           ↓
4. Script converts all .md → data/posts.json
   (Only includes posts where date <= today)
   Also generates `posts/<slug>.html` for social preview metadata
           ↓
5. Bot commits posts.json (if changed)
           ↓
6. GitHub Pages deploys
           ↓
7. Your site is live! 🎉
```

## ❓ FAQ

**Q: Can I write HTML in markdown?**  
A: Yes! You can include HTML tags directly in your markdown if needed.

**Q: What if the automation fails?**  
A: Check the "Actions" tab on GitHub to see error logs. Common issues:
- Missing required frontmatter fields
- Invalid YAML syntax in frontmatter
- Duplicate IDs

**Q: Can I schedule posts for the future?**  
A: Yes! Just set a future date in the frontmatter. GitHub Actions runs nightly at 2 AM UTC and publishes posts whose date has arrived.

**Q: What timezone does scheduling use?**  
A: Dates are compared at midnight in the UTC timezone. The exact hour doesn't matter - only the date (YYYY-MM-DD).

**Q: Can I keep both markdown and edit JSON manually?**  
A: Not recommended. The automation overwrites `posts.json` each time. Stick to one method.

**Q: How do I add images?**  
A: 
1. Add image to `assets/img/`
2. Reference in markdown: `![alt text](assets/img/your-image.jpg)`
3. Or use as cover: `coverImage: assets/img/your-image.jpg`

## 🎯 Quick Start

```bash
# 1. Create a new post
touch posts/my-new-post.md

# 2. Add frontmatter and content
# (use examples above)

# 3. Test locally (optional)
npm install
npm run generate

# 4. Commit and push
git add posts/my-new-post.md
git commit -m "Add new blog post"
git push

# Done! GitHub Actions will handle the rest.
```

Happy writing! 📝✨
