import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { api, getCurrentUserId } from '../lib/supabase';

export default function FriendsPage() {
  const currentUserId = getCurrentUserId();

  const [profiles, setProfiles] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const allProfiles = await api.getProfiles();
      const allFriendships = await api.getFriends();
      setProfiles(allProfiles);
      setFriendships(allFriendships);
    } catch (e) {
      console.error('Error loading friends data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, [currentUserId]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!targetSearch.trim()) return;

    setMessage(null);
    try {
      await api.sendFriendRequest(targetSearch.trim());
      setMessage({ type: 'success', text: `Friend request sent to @${targetSearch.trim()}!` });
      setTargetSearch('');
      loadFriendsData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    await api.acceptFriendRequest(friendshipId);
    loadFriendsData();
  };

  const handleRemoveFriendship = async (friendshipId) => {
    if (confirm('Remove this friend?')) {
      await api.removeFriendship(friendshipId);
      loadFriendsData();
    }
  };

  // Accepted friends
  const activeFriendships = friendships.filter(
    f => f.status === 'accepted' && (f.user_id_a === currentUserId || f.user_id_b === currentUserId)
  );

  const activeFriendProfiles = activeFriendships.map(f => {
    const friendId = f.user_id_a === currentUserId ? f.user_id_b : f.user_id_a;
    return {
      friendshipId: f.id,
      profile: profiles.find(p => p.id === friendId)
    };
  }).filter(item => item.profile);

  // Incoming pending requests
  const incomingRequests = friendships.filter(
    f => f.status === 'pending' && f.requested_by !== currentUserId && (f.user_id_a === currentUserId || f.user_id_b === currentUserId)
  );

  // Outgoing pending requests
  const outgoingRequests = friendships.filter(
    f => f.status === 'pending' && f.requested_by === currentUserId
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          <span>Friends & Social Study</span>
        </h1>
        <p className="text-xs text-slate-400">
          Connect with mutual friends to view non-private study notes and receive passage overlap alerts.
        </p>
      </div>

      {/* Add Friend Box */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Add Friend
        </h2>

        <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Enter username (e.g. sarah_m or david_k)"
              value={targetSearch}
              onChange={(e) => setTargetSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Send Request</span>
          </button>
        </form>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Pending Requests Section */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-base font-heading font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Friend Requests</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Incoming Requests */}
            {incomingRequests.map(req => {
              const sender = profiles.find(p => p.id === req.requested_by);
              if (!sender) return null;
              return (
                <div key={req.id} className="glass-card p-4 flex items-center justify-between border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <img src={sender.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{sender.full_name}</p>
                      <p className="text-[11px] text-slate-400">@{sender.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRemoveFriendship(req.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg text-xs transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Outgoing Requests */}
            {outgoingRequests.map(req => {
              const targetId = req.user_id_a === currentUserId ? req.user_id_b : req.user_id_a;
              const target = profiles.find(p => p.id === targetId);
              if (!target) return null;
              return (
                <div key={req.id} className="glass-card p-4 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-3">
                    <img src={target.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{target.full_name}</p>
                      <p className="text-[11px] text-slate-400">@{target.username} • Request Pending</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriendship(req.id)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Friends List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-heading font-bold text-slate-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Friends ({activeFriendProfiles.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Loading friends...</div>
        ) : activeFriendProfiles.length === 0 ? (
          <div className="glass-card p-8 text-center text-xs text-slate-500">
            You don't have any active mutual friends yet. Search for a username above to send a request!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeFriendProfiles.map(({ friendshipId, profile }) => (
              <div key={profile.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">{profile.full_name}</h3>
                    <p className="text-xs text-emerald-400">@{profile.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <Link
                    to={`/friend/${profile.id}`}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Shared Notes</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleRemoveFriendship(friendshipId)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Unfriend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
