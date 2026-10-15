-- ImgHub cloud database setup for Supabase
-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);
alter table public.albums enable row level security;
drop policy if exists "Albums readable by owner" on public.albums;
create policy "Albums readable by owner" on public.albums for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Albums insert own" on public.albums;
create policy "Albums insert own" on public.albums for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Albums update own" on public.albums;
create policy "Albums update own" on public.albums for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Albums delete own" on public.albums;
create policy "Albums delete own" on public.albums for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '',
  category text not null default 'Other',
  tags text[] not null default '{}',
  display_date date not null default current_date,
  author text not null default '',
  visibility text not null default 'public' check (visibility in ('public','private')),
  album_id uuid references public.albums(id) on delete set null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_display_date_idx on public.posts(display_date desc);
create index if not exists posts_user_id_idx on public.posts(user_id);
alter table public.posts enable row level security;
drop policy if exists "Public posts and own private posts readable" on public.posts;
create policy "Public posts and own private posts readable" on public.posts for select to anon, authenticated using (visibility = 'public' or auth.uid() = user_id);
drop policy if exists "Insert own posts" on public.posts;
create policy "Insert own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Update own posts" on public.posts;
create policy "Update own posts" on public.posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Delete own posts" on public.posts;
create policy "Delete own posts" on public.posts for delete to authenticated using (auth.uid() = user_id);

-- Shared public image bucket. Keep file uploads under each user's own UUID folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 12582912, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 12582912,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "Public can view photo files" on storage.objects;
create policy "Public can view photo files" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "Users upload to own folder" on storage.objects;
create policy "Users upload to own folder" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update own files" on storage.objects;
create policy "Users update own files" on storage.objects for update to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete own files" on storage.objects;
create policy "Users delete own files" on storage.objects for delete to authenticated using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
