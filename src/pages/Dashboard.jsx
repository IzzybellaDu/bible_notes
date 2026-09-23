import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  FolderOpen,
  Users,
  Search,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Bell,
  ArrowRight
} from 'lucide-react';
import { api, getCurrentUserId, getCurrentUserProfile } from '../lib/supabase';
import { doPassagesOverlap } from '../lib/overlap';
import NoteCard from '../components/NoteCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const currentUser = getCurrentUserProfile();

  const [notes, setNotes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickPassage, setQuickPassage] = useState('John 3');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const allNotes = await api.getNotes();
      const allProfiles = await api.getProfiles();
      const notifs = await api.getNotifications();

      setNotes(allNotes);
      setProfiles(allProfiles);
      setNotifications(notifs);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUserId]);

  const handleDeleteNote = async (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (quickPassage.trim()) {
      navigate(`/passage/${encodeURIComponent(quickPassage.trim())}`);
    }
  };

  const myNotes = notes.filter(n => n.user_id === currentUserId);
  const friendNotes = notes.filter(n => n.user_id !== currentUserId);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Welcome back, {currentUser?.full_name || 'Friend'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight">
              Personal Bible Notes & Swedish Study
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
              Capture Key Ideas 💡, Questions ❓, and Applications 🏹 for any passage. See when mutual friends are studying the same chapters.
            </p>
          </div>

          {/* Quick Passage Search Box */}
          <form onSubmit={handleQuickLookup} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-xl">
            <div className="relative flex-1">
              <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                placeholder="e.g. John 3 or Romans 12"
                value={quickPassage}
                onChange={(e) => setQuickPassage(e.target.value)}
                className="w-full sm:w-56 bg-transparent pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <span>Read & Note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Stats & Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{myNotes.length}</p>
            <p className="text-xs text-slate-400 font-medium">My Saved Notes</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{friendNotes.length}</p>
            <p className="text-xs text-slate-400 font-medium">Friends' Shared Notes</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{notifications.filter(n => !n.read).length}</p>
            <p className="text-xs text-slate-400 font-medium">Unread Overlap Alerts</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Notes & Friend Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Recent Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Recent Notes</span>
            </h2>
            <Link
              to="/notes"
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View all notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading notes...</div>
          ) : myNotes.length === 0 ? (
            <div className="glass-panel p-8 text-center space-y-4 border border-dashed border-slate-800">
              <Lightbulb className="w-10 h-10 text-amber-400 mx-auto opacity-80" />
              <div>
                <h3 className="text-base font-semibold text-slate-200">No notes written yet</h3>
                <p className="text-xs text-slate-400 mt-1">Start your first Bible study note using the Swedish Method.</p>
              </div>
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Note Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myNotes.slice(0, 4).map((note) => {
                const author = profiles.find(p => p.id === note.user_id);
                const overlaps = friendNotes.filter(fn => doPassagesOverlap(note, fn));
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

        {/* Right Column: Friends' Shared Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Friends' Shared Notes</span>
            </h2>
            <Link to="/friends" className="text-xs text-amber-400 hover:underline font-medium">
              Manage Friends
            </Link>
          </div>

          {friendNotes.length === 0 ? (
            <div className="glass-card p-6 text-center text-xs text-slate-500">
              No shared notes from friends yet. Add friends to share Bible study notes!
            </div>
          ) : (
            <div className="space-y-4">
              {friendNotes.slice(0, 3).map((note) => {
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
