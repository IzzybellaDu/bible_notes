-- ====================================================================
-- Bible Notes App — PostgreSQL Database Schema & RLS Policies (v2)
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  default_visibility text check (default_visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now()
);

-- 2. Friendships Table (Mutual Friends)
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id_a uuid references public.profiles(id) on delete cascade not null,
  user_id_b uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  requested_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_friendship_pair unique (user_id_a, user_id_b)
);

-- 3. Notes Table (Swedish Method + Cross-chapter verse ranges)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  book text not null,
  chapter_start integer not null,
  verse_start integer not null,
  chapter_end integer not null,
  verse_end integer not null,
  content text not null, -- Freeform Markdown pre-filled with Swedish Method template headers
  tags text[] default '{}',
  visibility text check (visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Notifications Table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'friend_note_exists', 'friend_request', 'friend_accept'
  related_note_id uuid references public.notes(id) on delete cascade,
  related_user_id uuid references public.profiles(id) on delete cascade,
  passage_summary text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes for fast queries
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_book_chapter on public.notes(book, chapter_start, chapter_end);
create index if not exists idx_notes_tags on public.notes using gin(tags);
create index if not exists idx_friendships_users on public.friendships(user_id_a, user_id_b);
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Friendships Policies
create policy "Users can view own friendships" on public.friendships
  for select using (auth.uid() = user_id_a or auth.uid() = user_id_b);

create policy "Users can manage own friendships" on public.friendships
  for all using (auth.uid() = user_id_a or auth.uid() = user_id_b);

-- Notes Policies
create policy "Users can view own notes" on public.notes
  for select using (auth.uid() = user_id);

create policy "Users can view friends non-private notes" on public.notes
  for select using (
    visibility = 'friends' and exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
      and (
        (f.user_id_a = auth.uid() and f.user_id_b = notes.user_id) or
        (f.user_id_b = auth.uid() and f.user_id_a = notes.user_id)
      )
    )
  );

create policy "Users can insert own notes" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on public.notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on public.notes
  for delete using (auth.uid() = user_id);

-- Notifications Policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);
