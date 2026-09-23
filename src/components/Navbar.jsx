import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  FolderOpen,
  Users,
  Bell,
  Settings,
  Search,
  UserCheck,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api, getCurrentUserId, setCurrentUserId, getCurrentUserProfile } from '../lib/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [allProfiles, setAllProfiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadNavData = async () => {
    setUserProfile(getCurrentUserProfile());
    try {
      const profiles = await api.getProfiles();
      setAllProfiles(profiles);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed loading nav data:', e);
    }
  };

  useEffect(() => {
    loadNavData();
    const interval = setInterval(loadNavData, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleUserSwitch = (userId) => {
    setCurrentUserId(userId);
    setUserProfile(getCurrentUserProfile());
    setShowUserDropdown(false);
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const markAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors leading-none">
                  Bible Notes
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/90 mt-0.5">
                  Swedish Method
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/notes"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/notes'
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Browse Notes
              </Link>

              <Link
                to="/friends"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/friends'
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Friends
              </Link>
            </nav>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search notes, tags, books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Create Note Button */}
            <Link
              to="/editor"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md shadow-emerald-950/40 hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Note</span>
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-full text-slate-300 hover:bg-slate-900 hover:text-slate-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel border border-slate-800 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-sm text-slate-200">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            api.markNotificationRead(n.id);
                            setShowNotifDropdown(false);
                            if (n.passage_summary) {
                              navigate(`/notes?q=${encodeURIComponent(n.passage_summary)}`);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? 'bg-slate-900/40 border-slate-800/40 text-slate-400'
                              : 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-emerald-300">
                              {n.type === 'friend_note_exists' && '📖 Friend Note Alert'}
                              {n.type === 'friend_request' && '👋 Friend Request'}
                              {n.type === 'friend_accept' && '🎉 Request Accepted'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-300">
                            {n.type === 'friend_note_exists' && `A friend also created a note on ${n.passage_summary}!`}
                            {n.type === 'friend_request' && 'You received a new friend request.'}
                            {n.type === 'friend_accept' && 'Your friend request was accepted!'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-900 border border-slate-800/80 transition-colors"
              >
                <img
                  src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                  alt={userProfile?.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/50"
                />
                <span className="hidden sm:inline text-xs font-medium text-slate-300 pr-1">
                  @{userProfile?.username}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 glass-panel border border-slate-800 p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                  <div className="px-2 py-1.5 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-100">{userProfile?.full_name}</p>
                    <p className="text-[11px] text-slate-400">@{userProfile?.username}</p>
                  </div>

                  {/* Switch User for Testing Demo */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                    <p className="text-[10px] uppercase font-bold text-slate-500 px-2 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Switch Account (Demo Testing)
                    </p>
                    <div className="space-y-1">
                      {allProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleUserSwitch(p.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            p.id === getCurrentUserId()
                              ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={p.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <span>@{p.username}</span>
                          </div>
                          {p.id === getCurrentUserId() && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex flex-col gap-1">
                    <Link
                      to="/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings & Preferences
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
