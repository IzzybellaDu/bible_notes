import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Globe,
  Lock,
  Key,
  Database,
  CheckCircle2,
  Save,
  Copy,
  Sparkles
} from 'lucide-react';
import { api, getCurrentUserProfile, isSupabaseConfigured } from '../lib/supabase';

export default function SettingsPage() {
  const [profile, setProfile] = useState(getCurrentUserProfile());
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [defaultVisibility, setDefaultVisibility] = useState(profile?.default_visibility || 'friends');
  
  const [esvKey, setEsvKey] = useState(import.meta.env.VITE_ESV_API_KEY || '');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getCurrentUserProfile();
    if (current) {
      setProfile(current);
      setFullName(current.full_name || '');
      setUsername(current.username || '');
      setDefaultVisibility(current.default_visibility || 'friends');
    }
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        username: username,
        default_visibility: defaultVisibility
      });
      if (updated) {
        setProfile(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  const copySqlSchema = () => {
    const sqlText = `-- Bible Notes App Supabase Schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  default_visibility text check (default_visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  book text not null,
  chapter_start integer not null,
  verse_start integer not null,
  chapter_end integer not null,
  verse_end integer not null,
  content text not null,
  tags text[] default '{}',
  visibility text check (visibility in ('private', 'friends')) default 'friends',
  created_at timestamptz default now()
);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Account Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage profile details, note visibility defaults, API keys, and database setup.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Profile Details Card */}
        <div className="glass-panel p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Global Note Visibility Card */}
        <div className="glass-panel p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Default Note Visibility
          </h2>
          <p className="text-xs text-slate-400">
            Choose default visibility for all newly created Bible notes. You can always override visibility per note.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setDefaultVisibility('friends')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                defaultVisibility === 'friends'
                  ? 'bg-emerald-950/30 border-emerald-500 text-slate-100 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-emerald-300">
                <Globe className="w-4 h-4" />
                <span>Visible to Friends (Recommended)</span>
              </div>
              <p className="text-xs text-slate-400">
                Mutual friends can view your note and get overlap alerts when studying the same passage.
              </p>
            </div>

            <div
              onClick={() => setDefaultVisibility('private')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                defaultVisibility === 'private'
                  ? 'bg-rose-950/30 border-rose-500 text-slate-100 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-rose-300">
                <Lock className="w-4 h-4" />
                <span>Private by Default</span>
              </div>
              <p className="text-xs text-slate-400">
                Notes are completely private to you unless explicitly shared.
              </p>
            </div>
          </div>
        </div>

        {/* ESV API Key Configuration Card */}
        <div className="glass-panel p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            ESV Bible API Key
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                Key status: Active (from .env)
              </span>
            </div>
            <span className="text-[11px] font-mono bg-slate-900 text-slate-400 px-2.5 py-1 rounded-md">
              {esvKey ? `${esvKey.substring(0, 8)}...` : 'Not set'}
            </span>
          </div>
        </div>

        {/* Database & Schema Deployment Card */}
        <div className="glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Supabase SQL Schema
            </h2>

            <button
              type="button"
              onClick={copySqlSchema}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {isSupabaseConfigured
              ? 'Connected to live Supabase backend instance.'
              : 'Running with high-performance local storage fallback. Copy the SQL schema to initialize your remote Supabase project.'}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-8 py-2.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
}
