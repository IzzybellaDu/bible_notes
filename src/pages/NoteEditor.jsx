import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  BookOpen,
  Tag,
  Globe,
  Lock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';
import PassagePicker from '../components/PassagePicker';
import SwedishMarkdownEditor from '../components/SwedishMarkdownEditor';
import { api, getCurrentUserId, getCurrentUserProfile } from '../lib/supabase';
import { fetchPassageText } from '../lib/bible';
import { DEFAULT_SWEDISH_TEMPLATE } from '../lib/constants';
import { formatPassageRef, doPassagesOverlap } from '../lib/overlap';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const currentUser = getCurrentUserProfile();

  const [passage, setPassage] = useState({
    book: 'John',
    chapter_start: 3,
    verse_start: 16,
    chapter_end: 3,
    verse_end: 21
  });

  const [content, setContent] = useState(DEFAULT_SWEDISH_TEMPLATE);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['faith', 'salvation']);
  const [visibility, setVisibility] = useState(currentUser?.default_visibility || 'friends');

  const [bibleTextData, setBibleTextData] = useState({ text: 'Loading passage text...', source: '' });
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [overlappingFriends, setOverlappingFriends] = useState([]);

  // Load existing note if editing
  useEffect(() => {
    if (id) {
      api.getNotes().then(allNotes => {
        const found = allNotes.find(n => n.id === id);
        if (found) {
          setPassage({
            book: found.book,
            chapter_start: found.chapter_start,
            verse_start: found.verse_start,
            chapter_end: found.chapter_end,
            verse_end: found.verse_end
          });
          setContent(found.content);
          setTags(found.tags || []);
          setVisibility(found.visibility || 'friends');
        }
      });
    }
  }, [id]);

  // Fetch passage text & check friend overlaps whenever passage changes
  useEffect(() => {
    let isMounted = true;
    setLoadingPassage(true);

    fetchPassageText(
      passage.book,
      passage.chapter_start,
      passage.verse_start,
      passage.chapter_end,
      passage.verse_end
    ).then(data => {
      if (isMounted) {
        setBibleTextData(data);
        setLoadingPassage(false);
      }
    });

    // Check if friends have notes on this passage
    api.getNotes().then(allNotes => {
      if (!isMounted) return;
      const friendsNotes = allNotes.filter(n => n.user_id !== currentUserId && n.visibility === 'friends');
      const tempNoteObj = { ...passage };
      const overlapping = friendsNotes.filter(fn => doPassagesOverlap(tempNoteObj, fn));
      setOverlappingFriends(overlapping);
    });

    return () => { isMounted = false; };
  }, [passage.book, passage.chapter_start, passage.verse_start, passage.chapter_end, passage.verse_end]);

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,/g, '').toLowerCase();
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!content || content.trim() === '') {
      alert('Please enter note content.');
      return;
    }

    setSaving(true);
    try {
      const notePayload = {
        id: id || undefined,
        book: passage.book,
        chapter_start: passage.chapter_start,
        verse_start: passage.verse_start,
        chapter_end: passage.chapter_end,
        verse_end: passage.verse_end,
        content,
        tags,
        visibility
      };

      await api.saveNote(notePayload);
      navigate('/notes');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const passageRefStr = formatPassageRef(
    passage.book,
    passage.chapter_start,
    passage.verse_start,
    passage.chapter_end,
    passage.verse_end
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold text-slate-100 flex items-center gap-2">
              <span>{id ? 'Edit Bible Note' : 'Create New Bible Note'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Format using Swedish Method template (Key Idea, Question, Application)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveNote}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Note'}</span>
        </button>
      </div>

      {/* Friend Overlap Alert Notification */}
      {overlappingFriends.length > 0 && (
        <div className="glass-panel p-4 bg-amber-950/20 border-amber-500/30 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Friend Note Alert
              </p>
              <p className="text-xs text-slate-300">
                {overlappingFriends.length} mutual friend{overlappingFriends.length > 1 ? 's have' : ' has'} notes on {passageRefStr}!
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/passage/${encodeURIComponent(passageRefStr)}`)}
            className="text-xs font-semibold text-amber-400 hover:underline shrink-0"
          >
            View Friend Notes →
          </button>
        </div>
      )}

      {/* Main Grid: Passage Picker & Bible Text (Left) vs Editor & Settings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Passage Picker & Bible Reader (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <PassagePicker value={passage} onChange={setPassage} />

          {/* Side-by-side ESV Bible Reader Panel */}
          <div className="glass-card p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{passageRefStr}</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {bibleTextData.translation}
              </span>
            </div>

            <div className="max-h-[380px] overflow-y-auto pr-2 text-sm leading-relaxed text-slate-200 font-serif space-y-3">
              {loadingPassage ? (
                <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  Fetching ESV passage text...
                </div>
              ) : (
                <p className="whitespace-pre-line italic text-slate-300">
                  {bibleTextData.text}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Source: {bibleTextData.source}</span>
              <span className="text-emerald-400 font-sans">Cached & Offline Ready</span>
            </div>
          </div>
        </div>

        {/* Right Column: Swedish Method Editor & Metadata (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Controls: Visibility & Tags */}
          <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Note Visibility Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Note Visibility
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('friends')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    visibility === 'friends'
                      ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Friends
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    visibility === 'private'
                      ? 'bg-rose-600 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </button>
              </div>
            </div>

            {/* Tags Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic Tags (press Enter or comma)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-950 border border-slate-800 rounded-lg p-1.5 min-h-[38px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-800 text-emerald-300 text-xs px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "e.g. grace, sermon" : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-xs text-slate-100 placeholder-slate-600 focus:outline-none flex-1 min-w-[80px]"
                />
              </div>
            </div>

          </div>

          {/* Swedish Method Markdown Editor */}
          <SwedishMarkdownEditor content={content} onChange={setContent} />

        </div>

      </div>
    </div>
  );
}
