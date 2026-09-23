export const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50, testament: 'OT' },
  { name: 'Exodus', chapters: 40, testament: 'OT' },
  { name: 'Leviticus', chapters: 27, testament: 'OT' },
  { name: 'Numbers', chapters: 36, testament: 'OT' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT' },
  { name: 'Joshua', chapters: 24, testament: 'OT' },
  { name: 'Judges', chapters: 21, testament: 'OT' },
  { name: 'Ruth', chapters: 4, testament: 'OT' },
  { name: '1 Samuel', chapters: 31, testament: 'OT' },
  { name: '2 Samuel', chapters: 24, testament: 'OT' },
  { name: '1 Kings', chapters: 22, testament: 'OT' },
  { name: '2 Kings', chapters: 25, testament: 'OT' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT' },
  { name: 'Ezra', chapters: 10, testament: 'OT' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT' },
  { name: 'Esther', chapters: 10, testament: 'OT' },
  { name: 'Job', chapters: 42, testament: 'OT' },
  { name: 'Psalms', chapters: 150, testament: 'OT' },
  { name: 'Proverbs', chapters: 31, testament: 'OT' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT' },
  { name: 'Isaiah', chapters: 66, testament: 'OT' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT' },
  { name: 'Lamentations', chapters: 5, testament: 'OT' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT' },
  { name: 'Daniel', chapters: 12, testament: 'OT' },
  { name: 'Hosea', chapters: 14, testament: 'OT' },
  { name: 'Joel', chapters: 3, testament: 'OT' },
  { name: 'Amos', chapters: 9, testament: 'OT' },
  { name: 'Obadiah', chapters: 1, testament: 'OT' },
  { name: 'Jonah', chapters: 4, testament: 'OT' },
  { name: 'Micah', chapters: 7, testament: 'OT' },
  { name: 'Nahum', chapters: 3, testament: 'OT' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT' },
  { name: 'Haggai', chapters: 2, testament: 'OT' },
  { name: 'Zechariah', chapters: 14, testament: 'OT' },
  { name: 'Malachi', chapters: 4, testament: 'OT' },

  // New Testament
  { name: 'Matthew', chapters: 28, testament: 'NT' },
  { name: 'Mark', chapters: 16, testament: 'NT' },
  { name: 'Luke', chapters: 24, testament: 'NT' },
  { name: 'John', chapters: 21, testament: 'NT' },
  { name: 'Acts', chapters: 28, testament: 'NT' },
  { name: 'Romans', chapters: 16, testament: 'NT' },
  { name: '1 Corinthians', chapters: 16, testament: 'NT' },
  { name: '2 Corinthians', chapters: 13, testament: 'NT' },
  { name: 'Galatians', chapters: 6, testament: 'NT' },
  { name: 'Ephesians', chapters: 6, testament: 'NT' },
  { name: 'Philippians', chapters: 4, testament: 'NT' },
  { name: 'Colossians', chapters: 4, testament: 'NT' },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT' },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT' },
  { name: '1 Timothy', chapters: 6, testament: 'NT' },
  { name: '2 Timothy', chapters: 4, testament: 'NT' },
  { name: 'Titus', chapters: 3, testament: 'NT' },
  { name: 'Philemon', chapters: 1, testament: 'NT' },
  { name: 'Hebrews', chapters: 13, testament: 'NT' },
  { name: 'James', chapters: 5, testament: 'NT' },
  { name: '1 Peter', chapters: 5, testament: 'NT' },
  { name: '2 Peter', chapters: 3, testament: 'NT' },
  { name: '1 John', chapters: 5, testament: 'NT' },
  { name: '2 John', chapters: 1, testament: 'NT' },
  { name: '3 John', chapters: 1, testament: 'NT' },
  { name: 'Jude', chapters: 1, testament: 'NT' },
  { name: 'Revelation', chapters: 22, testament: 'NT' }
];

export const DEFAULT_SWEDISH_TEMPLATE = `### 💡 Key Idea(s)
- 

### ❓ Question(s)
- 

### 🏹 Application(s)
- `;

export const INITIAL_MOCK_PROFILES = [
  {
    id: 'user-me',
    username: 'izzy',
    full_name: 'Izzy Bella',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    default_visibility: 'friends',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-sarah',
    username: 'sarah_m',
    full_name: 'Sarah Miller',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    default_visibility: 'friends',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-david',
    username: 'david_k',
    full_name: 'David Kim',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    default_visibility: 'friends',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_NOTES = [
  {
    id: 'note-1',
    user_id: 'user-me',
    book: 'John',
    chapter_start: 3,
    verse_start: 16,
    chapter_end: 3,
    verse_end: 21,
    content: `### 💡 Key Idea(s)
- God's love for humanity was demonstrated through giving His Son for eternal life.
- Light has come into the world, exposing true motives.

### ❓ Question(s)
- Why do people prefer darkness over light when truth brings freedom?

### 🏹 Application(s)
- Walk openly in God's truth today, hiding nothing and living with total transparency before Him.`,
    tags: ['salvation', 'love', 'gospel'],
    visibility: 'friends',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'note-2',
    user_id: 'user-sarah',
    book: 'John',
    chapter_start: 3,
    verse_start: 1,
    chapter_end: 3,
    verse_end: 17,
    content: `### 💡 Key Idea(s)
- Spiritual rebirth (born of water and Spirit) is mandatory to see the Kingdom of God.
- Salvation is rooted in God's deep love, not condemnation.

### ❓ Question(s)
- How did Nicodemus understand being "born again" as a ruler of Israel?

### 🏹 Application(s)
- Depend entirely on the Holy Spirit's renewing power rather than self-reliance.`,
    tags: ['grace', 'rebirth', 'John-study'],
    visibility: 'friends',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'note-3',
    user_id: 'user-david',
    book: 'Romans',
    chapter_start: 12,
    verse_start: 1,
    chapter_end: 12,
    verse_end: 2,
    content: `### 💡 Key Idea(s)
- Presenting our bodies as a living sacrifice is our true spiritual worship.
- Mind renewal prevents conforming to the pattern of this world.

### ❓ Question(s)
- What daily habits actively renew my mind?

### 🏹 Application(s)
- Spend 15 minutes in Scripture memory before opening social media each morning.`,
    tags: ['discipleship', 'worship'],
    visibility: 'friends',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const INITIAL_MOCK_FRIENDSHIPS = [
  {
    id: 'f-1',
    user_id_a: 'user-me',
    user_id_b: 'user-sarah',
    status: 'accepted',
    requested_by: 'user-sarah',
    created_at: new Date().toISOString()
  },
  {
    id: 'f-2',
    user_id_a: 'user-me',
    user_id_b: 'user-david',
    status: 'accepted',
    requested_by: 'user-me',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_NOTIFICATIONS = [
  {
    id: 'n-1',
    user_id: 'user-me',
    type: 'friend_note_exists',
    related_note_id: 'note-2',
    related_user_id: 'user-sarah',
    passage_summary: 'John 3:1–17',
    read: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];
