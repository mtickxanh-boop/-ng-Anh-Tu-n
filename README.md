# ImgHub Cloud — bilingual photo-sharing website

Includes:
- English/Vietnamese language switch
- Supabase Auth (email/password)
- Shared cloud database and public gallery
- Upload images to shared Supabase Storage
- Post title, description, category, tags, author display name, visibility, album and chosen display date (including past dates)
- Edit/delete own posts; public visitors can view public posts
- Responsive dark UI

## Important
This is a starter project, not yet connected to your domain or cloud account. You must configure Supabase and deploy the files. Do not put a Supabase `service_role` secret in `index.html`. The browser uses only the project's publishable/anon key; access is protected by Row Level Security policies in `schema.sql`.

## 1. Create the shared backend
1. Create a project at https://supabase.com/
2. Open SQL Editor, paste all of `schema.sql`, and run it.
3. In Project Settings > API (or Connect), copy the Project URL and publishable/anon key.
4. Open `index.html` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
5. In Supabase Authentication settings, configure your Site URL and Redirect URLs for your final domain, e.g. `https://yourdomain.com` and `https://www.yourdomain.com`.
6. For email/password signup, configure email confirmation settings and SMTP as appropriate. Test signup and sign-in.

## 2. Deploy and connect your existing domain
Recommended: Cloudflare Pages, Netlify, or Vercel static hosting.
- Upload/deploy `index.html` as the site entry point. Keep `schema.sql` private or outside the public web root after setup.
- Add your domain in the hosting provider's Domains section.
- Follow the provider's exact DNS instructions at your domain registrar. DNS values differ by provider; do not guess them.
- Enable HTTPS/SSL in the host and wait for DNS propagation.
- Add both apex and `www` domain URLs to Supabase Auth URL configuration if you use both.

## 3. Test before announcing
- Open the domain in a private/incognito window and confirm public posts display.
- Create two separate user accounts and verify each can edit/delete only their own posts.
- Verify uploads work and past display dates render as selected.
- Confirm backups and account email settings.
- Set storage quotas, abuse controls, moderation/reporting, rate limits and privacy policy before a large public launch.

## Current limitations to plan for
- This starter does not yet include admin/moderation dashboard, comments, likes, reporting, password reset UI, social login, image deletion from Storage on post deletion, rate limiting, or automated content moderation.
- Public images are publicly viewable by URL. The `private` post visibility restricts database row visibility, but files are stored in a public bucket for this starter; therefore private image URLs are not truly private. For genuine private images, use a private bucket and signed URLs before production.
- Date field is a user-chosen display date; actual `created_at` remains server-generated.
- Supabase free/paid quotas and hosting limits apply. Large traffic may require a paid plan.
