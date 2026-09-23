import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ArrowLeft,
  Globe,
  Sparkles
} from 'lucide-react';
import { api, getCurrentUserId } from '../lib/supabase';
import NoteCard from '../components/NoteCard';

export default function FriendProfilePage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [friendProfile, setFriendProfile] = useState(null);
  const [friendNotes, setFriendNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getProfiles().then(allProfiles => {
      if (!isMounted) return;
      const found = allProfiles.find(p => p.id === friendId);
      setFriendProfile(found || null);

      api.getNotes().then(allNotes => {
        if (!isMounted) return;
        // Filter notes for this friend with 'friends' visibility
        const shared = allNotes.filter(n => n.user_id === friendId && n.visibility === 'friends');
        setFriendNotes(shared);
        setLoading(false);
      });
    });

    return () => { isMounted = false; };
  }, [friendId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
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
              <Users className="w-6 h-6 text-emerald-400" />
              <span>{friendProfile?.full_name || 'Friend Profile'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              @{friendProfile?.username} • Shared Bible Study Notes
            </p>
          </div>
        </div>

        <Link
          to="/friends"
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Back to Friends list
        </Link>
      </div>

      {/* Profile Header Banner */}
      {friendProfile && (
        <div className="glass-panel p-6 border border-slate-800 flex items-center gap-4">
          <img
            src={friendProfile.avatar_url}
            alt={friendProfile.full_name}
            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-100">{friendProfile.full_name}</h2>
            <p className="text-xs text-emerald-400 font-medium">@{friendProfile.username}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              Sharing {friendNotes.length} public/friends Bible study notes
            </p>
          </div>
        </div>
      )}

      {/* Friend Notes List Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-heading font-bold text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Shared Notes ({friendNotes.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading notes...</div>
        ) : friendNotes.length === 0 ? (
          <div className="glass-card p-12 text-center text-xs text-slate-500">
            This friend hasn't published any shared notes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                authorProfile={friendProfile}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
