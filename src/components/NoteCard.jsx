import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Tag,
  Globe,
  Lock,
  Edit,
  Trash2,
  Lightbulb,
  HelpCircle,
  Target,
  User,
  Sparkles,
  Users
} from 'lucide-react';
import { formatPassageRef } from '../lib/overlap';

export default function NoteCard({ note, authorProfile, currentUserId, onDelete, overlappingFriends = [] }) {
  const isOwnNote = note.user_id === currentUserId;
  const passageRefStr = formatPassageRef(
    note.book,
    note.chapter_start,
    note.verse_start,
    note.chapter_end,
    note.verse_end
  );

  return (
    <div className="glass-card p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group">
      <div>
        {/* Card Header: Passage Ref + Visibility + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/passage/${encodeURIComponent(passageRefStr)}`}
              className="font-heading font-bold text-lg text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>{passageRefStr}</span>
            </Link>

            {/* Visibility Badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                note.visibility === 'private'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {note.visibility === 'private' ? (
                <>
                  <Lock className="w-3 h-3 text-rose-400" /> Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" /> Shared with Friends
                </>
              )}
            </span>

            {/* Overlapping Friends Alert Badge */}
            {overlappingFriends.length > 0 && (
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Users className="w-3 h-3 text-amber-400" />
                {overlappingFriends.length} friend{overlappingFriends.length > 1 ? 's' : ''} also noted this passage!
              </span>
            )}
          </div>

          {/* Edit / Delete actions for own note */}
          {isOwnNote && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Link
                to={`/editor/${note.id}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                title="Edit Note"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="text-sm text-slate-300 space-y-3 my-4 line-clamp-6 leading-relaxed">
          {renderFormattedContent(note.content)}
        </div>
      </div>

      {/* Card Footer: Tags & Author */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((tag) => (
              <Link
                key={tag}
                to={`/notes?tag=${encodeURIComponent(tag)}`}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-colors"
              >
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>{tag}</span>
              </Link>
            ))
          ) : (
            <span className="text-slate-600 italic text-[11px]">No tags</span>
          )}
        </div>

        {/* Author / Timestamp */}
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          {authorProfile && (
            <Link
              to={`/friend/${authorProfile.id}`}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium"
            >
              <img
                src={authorProfile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
              <span>{isOwnNote ? 'You' : `@${authorProfile.username}`}</span>
            </Link>
          )}
          <span>•</span>
          <span>{new Date(note.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

function renderFormattedContent(text) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (line.includes('💡') || line.toLowerCase().includes('key idea')) {
      return (
        <div key={idx} className="font-semibold text-amber-300 flex items-center gap-1.5 mt-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.includes('❓') || line.toLowerCase().includes('question')) {
      return (
        <div key={idx} className="font-semibold text-sky-300 flex items-center gap-1.5 mt-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.includes('🏹') || line.toLowerCase().includes('application')) {
      return (
        <div key={idx} className="font-semibold text-emerald-300 flex items-center gap-1.5 mt-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-3 text-slate-300">
          <span className="text-emerald-500 font-bold">•</span>
          <span>{line.trim().substring(2)}</span>
        </div>
      );
    }
    return <p key={idx} className="text-slate-300">{line}</p>;
  });
}
