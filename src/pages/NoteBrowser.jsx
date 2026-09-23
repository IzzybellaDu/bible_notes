import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  Tag,
  BookOpen,
  Globe,
  Lock,
  User,
  PlusCircle,
  X
} from 'lucide-react';
import { api, getCurrentUserId } from '../lib/supabase';
import { BIBLE_BOOKS } from '../lib/constants';
import { doPassagesOverlap } from '../lib/overlap';
import NoteCard from '../components/NoteCard';

export default function NoteBrowser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = getCurrentUserId();

  const [notes, setNotes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedBook, setSelectedBook] = useState(searchParams.get('book') || '');
  const [selectedChapter, setSelectedChapter] = useState(searchParams.get('chapter') || '');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'mine', 'friends'

  const loadNotesData = async () => {
    setLoading(true);
    try {
      const allNotes = await api.getNotes();
      const allProfiles = await api.getProfiles();
      setNotes(allNotes);
      setProfiles(allProfiles);
    } catch (e) {
      console.error('Error loading notes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotesData();
  }, [currentUserId]);

  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('tag');
    const b = searchParams.get('book');
    const c = searchParams.get('chapter');
    if (q !== null) setSearchQuery(q);
    if (t !== null) setSelectedTag(t);
    if (b !== null) setSelectedBook(b);
    if (c !== null) setSelectedChapter(c);
  }, [searchParams]);

  const handleDeleteNote = async (id) => {
    if (confirm('Delete this note?')) {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  // Collect unique tags
  const allTags = Array.from(
    new Set(notes.flatMap(n => n.tags || []))
  );

  // Filter logic
  const filteredNotes = notes.filter(note => {
    // Visibility filter
    if (visibilityFilter === 'mine' && note.user_id !== currentUserId) return false;
    if (visibilityFilter === 'friends' && note.user_id === currentUserId) return false;

    // Book filter
    if (selectedBook && (note.book || '').toLowerCase() !== selectedBook.toLowerCase()) return false;

    // Chapter filter
    if (selectedChapter) {
      const chNum = parseInt(selectedChapter, 10);
      if (note.chapter_start > chNum || note.chapter_end < chNum) return false;
    }

    // Tag filter
    if (selectedTag && !(note.tags || []).includes(selectedTag)) return false;

    // Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBook = (note.book || '').toLowerCase().includes(q);
      const matchContent = (note.content || '').toLowerCase().includes(q);
      const matchTags = (note.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchBook && !matchContent && !matchTags) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedBook('');
    setSelectedChapter('');
    setVisibilityFilter('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-emerald-400" />
            <span>Note Browser</span>
          </h1>
          <p className="text-xs text-slate-400">
            Browse notes by Book, Chapter, Tags, or Friends' shared notes
          </p>
        </div>

        <Link
          to="/editor"
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs transition-all shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Note</span>
        </Link>
      </div>

      {/* Filter Bar & Controls */}
      <div className="glass-panel p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Text Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search content, books, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Book Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">All Books</option>
              {BIBLE_BOOKS.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Visibility Tab Switcher */}
          <div className="sm:col-span-4 flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors ${
                visibilityFilter === 'all' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVisibilityFilter('mine')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors ${
                visibilityFilter === 'mine' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Notes
            </button>
            <button
              onClick={() => setVisibilityFilter('friends')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg transition-colors ${
                visibilityFilter === 'friends' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Friends'
            </button>
          </div>

        </div>

        {/* Tags Chips Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Tags:
          </span>
          {allTags.length === 0 ? (
            <span className="text-slate-600 italic text-[11px]">No tags created yet</span>
          ) : (
            allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                  selectedTag === tag
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))
          )}

          {(searchQuery || selectedTag || selectedBook || selectedChapter || visibilityFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-rose-400 hover:underline text-[11px] flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Results Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold text-base">No notes match your filters</p>
            <p className="text-xs text-slate-500">Try clearing your filters or creating a new note for this passage.</p>
            <button
              onClick={clearAllFilters}
              className="mt-2 text-xs text-emerald-400 hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const author = profiles.find(p => p.id === note.user_id);
              const overlaps = notes.filter(n => n.user_id !== note.user_id && doPassagesOverlap(note, n));
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  authorProfile={author}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteNote}
                  overlappingFriends={overlaps}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
