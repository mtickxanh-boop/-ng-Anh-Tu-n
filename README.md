# Pixora — Dark Photo Sharing UI

A responsive, browser-only photo-sharing website demo built with HTML, CSS, and vanilla JavaScript.

## Run it
1. Unzip the project.
2. Open `index.html` in a modern browser. For best results, use a simple local server:
   - VS Code: install Live Server, right-click `index.html`, choose **Open with Live Server**.
   - Or run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Included
- Responsive desktop and mobile layouts.
- Home feed, Explore, Profile, Saved posts, Settings, and Archive filters by year/month.
- Multi-image upload, image previews, caption, topic, date, visibility, and archive option.
- Per-post display settings for likes and views, including toggles to show/hide each metric.
- Like/save actions, demo comment, copy-to-clipboard share, delete post.
- Local browser persistence with `localStorage`, plus JSON export/reset.

## Important limitations
This is a front-end demo, not a hosted social network. Posts and uploaded images are saved only in the current browser/device. It does not include real accounts, server-side image storage, live comments, real analytics, or cross-device sync. The editable likes/views are **display values for your own demo posts**, not actual engagement from a social platform. Sample photos are loaded from Unsplash and require an internet connection. Browser storage has limits; this demo caps selected upload size to help prevent storage failures.

For a production website, add a backend (for example, Supabase or Firebase), authentication, database policies, object storage, moderation, and deployment.
