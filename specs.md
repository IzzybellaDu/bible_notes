# Bible Notes App — Product & Technical Specification (v1)

## 1. Overview
A web app (responsive, installable as a PWA) for personal Bible study notes using the **Swedish Method** — each note captures a **key idea**, a **question**, and an **application** for a passage. Notes are organized both by structured Bible reference (Book > Chapter > Verse) and by freeform tags. Users can add mutual friends and see each other's non-private notes; when a friend has also noted the same passage, the user gets a lightweight notification (not a merged view).

## 2. Goals for v1
- Fast, frictionless note capture in the Swedish Method format
- Structured + tag-based organization and browsing
- Mutual-friend social layer with sensible privacy defaults
- Simple "someone else has notes here" notification
- Ship as a responsive web app / PWA

## 3. Explicitly out of scope for v1 (see Section 10 for later)
- Native mobile app
- Group/Bible study circles (only 1:1 mutual friends for now)
- Side-by-side or threaded comparison of notes
- Multiple/licensed Bible translations (ESV, NIV, etc.)
- Reading plans, streaks, reminders
- Comments/discussion threads on shared notes
- Social login (Google/Apple)

## 4. User Stories
- As a user, I want to write a note on a passage as dot points for key idea(s), question(s), and application(s).
- As a user, I want to tag a note with the Bible reference and my own custom topic tags.
- As a user, I want to browse my notes by book/chapter or by tag.
- As a user, I want to add friends (both people must accept).
- As a user, I want my notes visible to friends by default, but I can mark any note private.
- As a user, I want to know, without digging, when a friend has also written notes on a passage.

## 5. Core Features

### 5.1 Notes (Swedish Method)
Each note has:
- **Passage reference**: book, chapter, verse start, verse end (optional, can be a single verse or range)
- **Key idea(s)**: list of dot points
- **Question(s)**: list of dot points
- **Application(s)**: list of dot points
- **Tags**: freeform array of strings (e.g. "faith", "sermon-notes", "Romans study")
- **Visibility**: `private` or `friends` (default: `friends`)
- **Timestamps**: created_at, updated_at

UI: each of the three fields (key idea / question / application) is an editable bullet list — add, edit, delete, reorder points.

### 5.2 Passage Reference & Bible Text
- Verse picker: book dropdown → chapter → verse range.
- Actual verse text is fetched from a free, public-domain Bible API (see Section 8) and displayed alongside the note editor for context — not stored long-term, just cached client-side/short-term server-side to reduce API calls.
- The reference is stored in a structured form (book id, chapter, verse_start, verse_end) so notes can be queried and sorted properly, not just as a free-text string.

### 5.3 Organization & Browsing
- **Structured view**: browse by Book → Chapter, seeing all your notes on that chapter.
- **Tag view**: filter/search notes by custom tag.
- Combine both: a structured browser with a tag filter sidebar/search bar.

### 5.4 Friends
- Search for other users by username or email.
- Send a friend request; both users must accept (mutual, like Facebook).
- Friends list page with pending requests (incoming/outgoing) and an unfriend option.

### 5.5 Sharing & Privacy
- Default visibility for a new note: **visible to friends**.
- Per-note toggle to mark it **private** at any time.
- Friends can view (read-only) each other's non-private notes, browsable the same way (by book/chapter or tag).
- Private notes must never be returned by any API call to another user, under any circumstance.

### 5.6 "Notes exist here" Notification
- When a user creates or opens a note on passage X, the system checks whether any of their friends have non-private notes on that same passage.
- If so, show a simple notification/badge (e.g. "Sarah also has notes on John 3") — **no automatic side-by-side or merged view**, just an alert that points the user toward the existence of the other notes.
- A notification center (bell icon) lists these events; users can mark them as read.

### 5.7 Auth
- Email/password signup and login only (no social login in v1).
- Passwords hashed with bcrypt; sessions via JWT or secure httpOnly cookie.
- Basic password-reset-via-email flow.

## 6. Data Model

```
User
  id, name, email, password_hash, created_at

Friendship
  id, user_id_a, user_id_b, status (pending | accepted), requested_by, created_at

Note
  id, user_id, book, chapter, verse_start, verse_end,
  key_ideas: string[], questions: string[], applications: string[],
  tags: string[], visibility (private | friends),
  created_at, updated_at

Notification
  id, user_id, type (friend_note_exists | friend_request | ...),
  related_note_id, related_friend_id, passage_ref, read (bool), created_at
```

## 7. API Endpoints (REST sketch)

**Auth**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/reset-password`

**Notes**
- `GET /notes` (own notes; query params: book, chapter, tag)
- `POST /notes`
- `GET /notes/:id`
- `PUT /notes/:id`
- `DELETE /notes/:id`
- `GET /notes/friends?book=&chapter=` (friends' visible notes for a passage)

**Friends**
- `GET /friends`
- `POST /friends/request` (body: target user)
- `POST /friends/:id/accept`
- `DELETE /friends/:id`

**Bible text (proxy/cache)**
- `GET /bible/:book/:chapter`

**Notifications**
- `GET /notifications`
- `POST /notifications/:id/read`

## 8. Bible Text Source
Recommendation: start with a **free, public-domain translation** via an API with no licensing fees or strict rate limits — e.g. `bible-api.com` or `bolls.life`, serving translations like WEB, KJV, or ASV. This avoids licensing costs while validating the product. Modern copyrighted translations (ESV, NIV, NLT) can be added later once there's a reason to pay for/license them — the app's data model already stores structured references, so swapping or adding a translation source later doesn't require a redesign.

## 9. Screens / Pages
1. **Login / Signup**
2. **Dashboard** — recent notes, notification feed
3. **Note editor** — create/edit a note (passage picker, verse text panel, three dot-point fields, tags, visibility toggle)
4. **Note browser** — by book/chapter, with tag filter
5. **Passage viewer** — verse text + your note (if any) + "friend also has notes" badge
6. **Friends** — friends list, pending requests, add-friend search
7. **Settings** — account details, default note visibility preference

## 10. Tech Stack Recommendation
- **Frontend**: React (Vite), React Router, Tailwind CSS
- **Backend**: Node.js + Express, **or** Supabase (Postgres + built-in Auth) to significantly cut backend build time
- **Database**: PostgreSQL
- **Auth**: bcrypt password hashing + JWT/cookie sessions (or Supabase Auth if using Supabase)
- **Bible text**: bible-api.com or bolls.life, server-side cached
- **Hosting**: Vercel (frontend) + Railway/Render (backend+DB), or Vercel + Supabase for an all-in-one fast path
- **PWA**: web manifest + service worker so it's installable on mobile home screens

*Note: since you're not locked into a specific backend, Supabase is worth strongly considering — it gives you Postgres, auth, and row-level-security-based privacy (great fit for the private/friends visibility model) largely out of the box, cutting a lot of the backend work described in Section 7.*

## 11. Non-Functional Requirements
- Mobile-first responsive design (usable down to ~360px width)
- Private notes are never exposed via any API response to another user
- Bible text responses cached to respect external API rate limits
- Basic accessibility: semantic HTML, keyboard-navigable forms

## 12. Future Ideas (v2+, not in scope now)
- Native mobile app (React Native, reusing the same API)
- Bible study groups/circles beyond 1:1 friends
- Side-by-side or threaded note comparison on a shared passage
- Additional/licensed translations (ESV, NIV)
- Reading plans, streaks, reminders
- Comments/discussion on shared notes
- Google/Apple social login