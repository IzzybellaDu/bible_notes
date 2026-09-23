import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Users,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Target
} from 'lucide-react';
import { api, getCurrentUserId } from '../lib/supabase';
import { fetchPassageText } from '../lib/bible';
import { parsePassageRef, formatPassageRef, doPassagesOverlap } from '../lib/overlap';
import NoteCard from '../components/NoteCard';

export default function PassageViewer() {
  const { refStr } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const decodedRef = decodeURIComponent(refStr || 'John 3:16');
  const parsedPassage = parsePassageRef(decodedRef) || {
    book: 'John',
    chapter_start: 3,
    verse_start: 16,
    chapter_end: 3,
    verse_end: 21
  };

  const formattedPassageTitle = formatPassageRef(
    parsedPassage.book,
    parsedPassage.chapter_start,
    parsedPassage.verse_start,
    parsedPassage.chapter_end,
    parsedPassage.verse_end
  );

  const [bibleData, setBibleData] = useState({ text: 'Loading passage text...', source: '' });
  const [loadingText, setLoadingText] = useState(true);

  const [myPassageNote, setMyPassageNote] = useState(null);
  const [friendPassageNotes, setFriendPassageNotes] = useState([]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoadingText(true);

    fetchPassageText(
      parsedPassage.book,
      parsedPassage.chapter_start,
      parsedPassage.verse_start,
      parsedPassage.chapter_end,
      parsedPassage.verse_end
    ).then(data => {
      if (isMounted) {
        setBibleData(data);
        setLoadingText(false);
      }
    });

    api.getNotes().then(allNotes => {
      if (!isMounted) return;
      api.getProfiles().then(allProfiles => {
        if (!isMounted) return;
        setProfiles(allProfiles);

        const tempPassageObj = { ...parsedPassage };

        const ownNote = allNotes.find(
          n => n.user_id === currentUserId && doPassagesOverlap(tempPassageObj, n)
        );
        setMyPassageNote(ownNote || null);

        const friends = allNotes.filter(
          n => n.user_id !== currentUserId && n.visibility === 'friends' && doPassagesOverlap(tempPassageObj, n)
        );
        setFriendPassageNotes(friends);
      });
    });

    return () => { isMounted = false; };
  }, [decodedRef, currentUserId]);

  const handleDeleteNote = async (id) => {
    if (confirm('Delete your note for this passage?')) {
      await api.deleteNote(id);
      setMyPassageNote(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Passage Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <span>{formattedPassageTitle}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Bible passage text & Swedish Method study notes
            </p>
          </div>
        </div>

        <Link
          to={`/editor?book=${parsedPassage.book}&cStart=${parsedPassage.chapter_start}&vStart=${parsedPassage.verse_start}&cEnd=${parsedPassage.chapter_end}&vEnd=${parsedPassage.verse_end}`}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-full text-xs transition-all shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{myPassageNote ? 'Edit My Note' : 'Write Note on Passage'}</span>
        </Link>
      </div>

      {/* Bible Passage Text Display Card */}
      <div className="glass-panel p-6 sm:p-8 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Scripture Text ({bibleData.translation || 'ESV'})
          </span>
          <span className="text-[11px] text-slate-400">
            Source: {bibleData.source}
          </span>
        </div>

        {loadingText ? (
          <div className="py-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            Loading Bible passage text...
          </div>
        ) : (
          <div className="text-base sm:text-lg leading-relaxed text-slate-200 font-serif whitespace-pre-line italic">
            {bibleData.text}
          </div>
        )}
      </div>

      {/* Friends Overlap Notification Banner */}
      {friendPassageNotes.length > 0 && (
        <div className="glass-panel p-4 bg-amber-950/20 border-amber-500/30 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Friend Note Alert ({friendPassageNotes.length})
            </p>
            <p className="text-xs text-slate-300">
              {friendPassageNotes.length} friend{friendPassageNotes.length > 1 ? 's have' : ' has'} written notes covering this passage!
            </p>
          </div>
        </div>
      )}

      {/* Grid: My Note & Friends' Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* My Note Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>My Note on {formattedPassageTitle}</span>
          </h2>

          {myPassageNote ? (
            <NoteCard
              note={myPassageNote}
              authorProfile={profiles.find(p => p.id === currentUserId)}
              currentUserId={currentUserId}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="glass-card p-8 text-center space-y-3 border border-dashed border-slate-800">
              <p className="text-sm font-medium text-slate-300">You haven't written a note for this passage yet.</p>
              <Link
                to={`/editor`}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write Swedish Method Note</span>
              </Link>
            </div>
          )}
        </div>

        {/* Friends' Notes Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Friends' Notes ({friendPassageNotes.length})</span>
          </h2>

          {friendPassageNotes.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-500">
              None of your mutual friends have written shared notes on this passage yet.
            </div>
          ) : (
            <div className="space-y-4">
              {friendPassageNotes.map(note => {
                const author = profiles.find(p => p.id === note.user_id);
                return (
                  <NoteCard
                    key={note.id}
                    note={note}
                    authorProfile={author}
                    currentUserId={currentUserId}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
