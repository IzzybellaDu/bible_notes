# Bible Notes App — Product & Technical Specification (v1)

## 1. Overview

A web app (responsive and installable as a PWA) for personal Bible study notes using the **Swedish Method**. Each note captures a **key idea**, a **question**, and an **application** for a passage.

Notes are organized both by structured Bible reference (**Book → Chapter → Verse**) and by freeform tags.

Users can add mutual friends and see each other's non-private notes. When a friend has also noted the same passage, the user receives a lightweight notification. This does **not** create a merged or side-by-side view.

---

## 2. Goals for v1

* Fast, frictionless note capture in the Swedish Method format
* Structured and tag-based organization and browsing
* Mutual-friend social layer with sensible privacy defaults
* Simple "someone else has notes here" notification
* Ship as a responsive web app / PWA

---

## 3. Explicitly Out of Scope for v1

See [Section 12](#12-future-ideas-v2) for later features.

* Native mobile app
* Group/Bible study circles (only 1:1 mutual friends for now)
* Side-by-side or threaded comparison of notes
* Multiple/licensed Bible translations (ESV, NIV, etc.)
* Reading plans, streaks, reminders
* Comments/discussion threads on shared notes
* Social login (Google/Apple)

---

## 4. User Stories

* As a user, I want to write a note on a passage as dot points for key idea(s), question(s), and application(s).
* As a user, I want to tag a note with the Bible reference and my own custom topic tags.
* As a user, I want to browse my notes by book/chapter or by tag.
* As a user, I want to add friends, where both people must accept the request.
* As a user, I want my notes visible to friends by default, but I can mark any note private.
* As a user, I want to know, without digging, when a friend has also written notes on a passage.

---

# 5. Core Features

## 5.1 Notes (Swedish Method)

Each note has:

* **Passage reference**

  * Book
  * Chapter
  * Verse start
  * Verse end (optional)
  * Can represent a single verse or a verse range
* **Key idea(s)** — list of dot points
* **Question(s)** — list of dot points
* **Application(s)** — list of dot points
* **Tags** — freeform array of strings

  * Examples: `faith`, `sermon-notes`, `Romans study`
* **Visibility**

  * `private`
  * `friends`
  * Default: `friends`
* **Timestamps**

  * `created_at`
  * `updated_at`

### UI

Each of the three Swedish Method fields is an editable bullet list:

* Add bullet
* Edit bullet
* Delete bullet
* Reorder bullets

---

## 5.2 Passage Reference & Bible Text

* Verse picker:

  * Book dropdown
  * Chapter selector
  * Verse range selector
* Actual verse text is fetched from a free, public-domain Bible API and displayed alongside the note editor for context.
* Bible text is **not stored long-term**.
* Bible text may be cached client-side and/or short-term server-side to reduce API calls.
* The passage reference is stored in a structured form so notes can be queried and sorted correctly rather than relying on a free-text reference.

### Stored Reference

```text
book_id
chapter
verse_start
verse_end
```

---

## 5.3 Organization & Browsing

### Structured View

Browse notes by:

```text
Book → Chapter → Notes
```

### Tag View

* Filter notes by custom tag
* Search notes by tag

### Combined View

A structured browser containing:

* Book/chapter navigation
* Tag filter sidebar
* Search bar

---

## 5.4 Friends

Users can:

* Search for other users by username or email
* Send friend requests
* Accept incoming friend requests
* View pending incoming requests
* View pending outgoing requests
* View their friends list
* Unfriend another user

Both users must accept the friendship request before they become mutual friends.

---

## 5.5 Sharing & Privacy

* New notes are **visible to friends by default**.
* Each note can be changed to **private** at any time.
* Friends can view each other's non-private notes in read-only mode.
* Friends can browse shared notes using:

  * Book/chapter
  * Tags
* Private notes must **never** be returned by an API call to another user under any circumstances.

---

## 5.6 "Notes Exist Here" Notification

When a user creates or opens a note for passage **X**, the system checks whether any of their friends have non-private notes on the same passage.

If so, display a lightweight notification such as:

> Sarah also has notes on John 3.

The system should **not** automatically display the friend's note alongside the user's note.

### Notification Center

A notification center accessible through a bell icon should:

* List relevant events
* Show when a friend has notes on the same passage
* Allow users to mark notifications as read

---

## 5.7 Authentication

### Supported in v1

* Email/password signup
* Email/password login
* Logout
* Password reset via email

### Security

* Passwords hashed using **bcrypt**
* Sessions handled using either:

  * JWT, or
  * Secure `httpOnly` cookies

Social login is out of scope for v1.

---

# 6. Data Model

## User

```text
User
  id
  name
  email
  password_hash
  created_at
```

## Friendship

```text
Friendship
  id
  user_id_a
  user_id_b
  status (pending | accepted)
  requested_by
  created_at
```

## Note

```text
Note
  id
  user_id
  book
  chapter
  verse_start
  verse_end
  key_ideas: string[]
  questions: string[]
  applications: string[]
  tags: string[]
  visibility (private | friends)
  created_at
  updated_at
```

## Notification

```text
Notification
  id
  user_id
  type (friend_note_exists | friend_request | ...)
  related_note_id
  related_friend_id
  passage_ref
  read (bool)
  created_at
```

---

# 7. API Endpoints

## Authentication

| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| `POST` | `/auth/signup`         | Create an account |
| `POST` | `/auth/login`          | Log in            |
| `POST` | `/auth/logout`         | Log out           |
| `POST` | `/auth/reset-password` | Reset password    |

## Notes

| Method   | Endpoint                        | Description                              |
| -------- | ------------------------------- | ---------------------------------------- |
| `GET`    | `/notes`                        | Get user's own notes                     |
| `POST`   | `/notes`                        | Create a note                            |
| `GET`    | `/notes/:id`                    | Get a specific note                      |
| `PUT`    | `/notes/:id`                    | Update a note                            |
| `DELETE` | `/notes/:id`                    | Delete a note                            |
| `GET`    | `/notes/friends?book=&chapter=` | Get friends' visible notes for a passage |

### `/notes` Query Parameters

```text
book
chapter
tag
```

---

## Friends

| Method   | Endpoint              | Description                      |
| -------- | --------------------- | -------------------------------- |
| `GET`    | `/friends`            | Get friends and pending requests |
| `POST`   | `/friends/request`    | Send a friend request            |
| `POST`   | `/friends/:id/accept` | Accept a friend request          |
| `DELETE` | `/friends/:id`        | Remove a friendship              |

---

## Bible Text

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| `GET`  | `/bible/:book/:chapter` | Fetch Bible text |

The backend should proxy/cache requests to the external Bible API to reduce API calls and respect rate limits.

---

## Notifications

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/noti   |             |
