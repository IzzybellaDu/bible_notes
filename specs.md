# Bible Notes App — Product & Technical Specification (v2)

## 1. Overview
A web app (responsive, installable as a PWA) for personal Bible study notes using the **Swedish Method** — each note captures key ideas, questions, and applications for a passage using a Markdown editor pre-filled with Swedish Method template headers. Notes are organized both by structured Bible reference (Book > Chapter Range > Verse Range) and by freeform tags. Users can add mutual friends and see each other's non-private notes; when a friend has also noted an overlapping passage, the user gets a lightweight notification and live passage badge.

## 2. Goals for v1
- Fast, frictionless note capture with Markdown Swedish Method template headers (💡 Key Idea, ❓ Question, 🏹 Application)
- Structured + tag-based organization and browsing (with support for cross-chapter passage ranges)
- Mutual-friend social layer with sensible privacy defaults and dedicated friend profile note feeds
- Realtime live passage badge + notification center when friends note overlapping passages
- ESV Bible text integration via API Key, with seamless fallback to WEB (World English Bible) via public domain API
- Ship as a responsive web app / installable PWA with app-shell and text caching

## 3. Explicitly out of scope for v1 (see Section 12 for later)
- Native mobile app (iOS/Android native builds)
- Group/Bible study circles (only 1:1 mutual friends for now)
- Side-by-side or threaded comparison of notes
- Reading plans, streaks, reminders
- Comments/discussion threads on shared notes
- Third-party social logins (Google/Apple)

## 4. User Stories
- As a user, I want to write a note on a passage using Markdown pre-filled with Swedish Method headers (💡 Key Idea, ❓ Question, 🏹 Application).
- As a user, I want to tag a note with a single or cross-chapter Bible reference and custom topic tags.
- As a user, I want to browse my notes by book/chapter, by tag, or view shared notes on a friend's profile.
- As a user, I want to add friends via email/username search (mutual accept).
- As a user, I want my notes visible to friends by default (configurable in Settings), with per-note private toggles.
- As a user, I want to see a live badge when viewing a passage if a friend has noted an overlapping verse range, and receive notifications when new notes are added.
- As a user, I want to read ESV passage text alongside my note editor, falling back to WEB if needed.

## 5. Core Features

### 5.1 Notes (Swedish Method Markdown Editor)
Each note has:
- **Passage reference**: book, chapter_start, verse_start, chapter_end, verse_end (supports single verse, single chapter range, or cross-chapter ranges such as Gen 1:26 – Gen 2:3)
- **Content**: Freeform Markdown string pre-populated with Swedish Method headers:
  - `### 💡 Key Idea(s)`
  - `### ❓ Question(s)`
  - `### 🏹 Application(s)`
- **Tags**: freeform array of strings (e.g. `["faith", "sermon-notes", "Romans study"]`)
- **Visibility**: `private` or `friends` (defaults to user's global setting, which defaults to `friends`)
- **Timestamps**: created_at, updated_at

### 5.2 Passage Reference & Bible Text
- Verse picker: book dropdown → start chapter/verse → end chapter/verse.
- **ESV Bible API**: Passage text is fetched using Crossway ESV API (`api.esv.org`) using `VITE_ESV_API_KEY` (or proxy environment variable). If key is unconfigured or rate limited, gracefully fall back to free public domain translation (WEB via `bible-api.com`).
- Structured reference storage (`book`, `chapter_start`, `verse_start`, `chapter_end`, `verse_end`) enables exact and range-overlap matching queries.

### 5.3 Organization & Browsing
- **Structured view**: browse by Book → Chapter, seeing all notes spanning that chapter.
- **Tag view**: filter/search notes by custom tag.
- **Friend profile view**: browse all shared notes created by a specific mutual friend.
- Combine views with search bar and tag filtering.

### 5.4 Friends
- Search for users by username or email.
- Mutual friend request system (pending / accepted).
- Friends management page (incoming/outgoing requests, active friends list, unfriend option).

### 5.5 Sharing & Privacy
- **Default visibility**: Configurable in User Settings (default: `friends`).
- Per-note toggle to flip between `private` and `friends` at any time.
- Friends can view (read-only) non-private notes via passage view, tag search, or friend profile feed.
- Enforced at database level via **Supabase Row Level Security (RLS)** — private notes are strictly non-queryable by other users.

### 5.6 Overlap Detection & Notification System
- **Passage Overlap Detection**: Overlap occurs if two notes in the same book have intersecting chapter/verse bounds (e.g. Note A: John 3:1–16 overlaps with Note B: John 3:16–21).
- **Live Passage Badge**: When viewing a passage, a badge indicates if any friend has written notes covering any overlapping verses (e.g. "Sarah also has notes on John 3:16").
- **Persistent Notifications**: When User A creates a note on a passage, the system generates a `friend_note_exists` notification for any friend who has a note overlapping that passage.
- **Notification Center**: Bell icon header with unread badge and mark-as-read functionality.

### 5.7 Auth & User Preferences
- Supabase Auth (Email & Password signup/login).
- User Settings page:
  - Account info & display name
  - Global Default Note Visibility (`friends` vs `private`)
  - Optional custom ESV API Key override

## 6. Data Model (Supabase PostgreSQL + RLS)

```sql
-- Profiles / Users table (linked to auth.users)
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  default_visibility text check (default_visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now()
);

-- Friendships table (mutual)
friendships (
  id uuid primary key default gen_random_uuid(),
  user_id_a uuid references profiles(id) on delete cascade,
  user_id_b uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted')) default 'pending',
  requested_by uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  constraint unique_friendship unique (user_id_a, user_id_b)
);

-- Notes table
notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  book text not null,
  chapter_start integer not null,
  verse_start integer not null,
  chapter_end integer not null,
  verse_end integer not null,
  content text not null, -- Markdown pre-filled with Swedish Method headers
  tags text[] default '{}',
  visibility text check (visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications table
notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- 'friend_note_exists', 'friend_request', 'friend_accept'
  related_note_id uuid references notes(id) on delete cascade,
  related_user_id uuid references profiles(id) on delete cascade,
  passage_summary text,
  read boolean default false,
  created_at timestamptz default now()
);
```

## 7. Supabase Row Level Security (RLS) Rules
- **profiles**: Public read for basic info (username, full_name). Update self only.
- **friendships**: Read/write allowed only if `auth.uid()` matches `user_id_a` or `user_id_b`.
- **notes**:
  - `SELECT`: `auth.uid() = user_id` OR (`visibility = 'friends'` AND `user_id` is an accepted friend of `auth.uid()`).
  - `INSERT` / `UPDATE` / `DELETE`: `auth.uid() = user_id`.
- **notifications**: Read/update only if `auth.uid() = user_id`.

## 8. Bible Text Integration & Caching
- **Primary Source**: ESV API (`https://api.esv.org/v3/passage/text/`) using Bearer Token from `VITE_ESV_API_KEY` (or proxy endpoint).
- **Fallback Source**: `https://bible-api.com/{book}+{chapter}:{verse}` serving WEB translation.
- **Caching**: Client-side IndexedDB / LocalStorage cache for fetched passage text to minimize API quota usage and speed up UI render.

## 9. Screens / Pages
1. **Login / Signup** — Auth forms with clean styling
2. **Dashboard** — Recent notes, quick passage lookup, notification feed
3. **Note Editor** — Book/chapter/verse picker, side-by-side ESV Bible text reader, Markdown editor pre-loaded with Swedish Method template, tags input, visibility toggle
4. **Note Browser** — Structured Book/Chapter tree + Tag filter sidebar
5. **Passage Viewer** — Bible passage text + user note + Live "Friend also noted this passage" badge
6. **Friends Page** — Friends list, pending requests, add-friend search, link to friend profiles
7. **Friend Profile Page** — View all shared (`friends` visibility) notes by a specific friend
8. **Settings** — Profile settings, default note visibility preference, optional ESV API Key configuration

## 10. Tech Stack
- **Frontend Framework**: React (Vite) + React Router v6
- **Styling**: Tailwind CSS + Lucide React icons
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **PWA**: `vite-plugin-pwa` with Web App Manifest, Service Worker caching for app shell & offline passage text viewing
- **Bible API**: ESV API (primary) + WEB (bible-api.com fallback)

## 11. Non-Functional Requirements
- **Security**: Private notes MUST never be accessible by unauthorized users; enforced by Supabase RLS policies.
- **Responsiveness**: Mobile-first responsive design down to ~360px viewport.
- **Performance**: Instant UI feedback with client-side caching for Bible passages.
- **PWA**: Installable app shell on mobile home screens.

## 12. Future Ideas (v2+, out of scope for v1)
- Native mobile app wrapper (Capacitor or React Native)
- Group Bible study circles beyond 1:1 friends
- Side-by-side note comparison view
- Offline note creation queue with auto-sync
- Social login providers (Google/Apple)