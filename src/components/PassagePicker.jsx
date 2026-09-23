import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../lib/constants';
import { BookOpen, Layers, Bookmark } from 'lucide-react';

export default function PassagePicker({ value, onChange }) {
  const selectedBookObj = BIBLE_BOOKS.find(b => b.name === value.book) || BIBLE_BOOKS[0];

  const handleBookChange = (e) => {
    const newBookName = e.target.value;
    const newBookObj = BIBLE_BOOKS.find(b => b.name === newBookName) || BIBLE_BOOKS[0];
    onChange({
      ...value,
      book: newBookName,
      chapter_start: 1,
      verse_start: 1,
      chapter_end: 1,
      verse_end: 1
    });
  };

  const handleStartChapterChange = (e) => {
    const c = parseInt(e.target.value, 10);
    onChange({
      ...value,
      chapter_start: c,
      chapter_end: Math.max(c, value.chapter_end || c)
    });
  };

  const handleStartVerseChange = (e) => {
    const v = parseInt(e.target.value, 10);
    onChange({
      ...value,
      verse_start: v,
      verse_end: value.chapter_start === value.chapter_end ? Math.max(v, value.verse_end || v) : value.verse_end
    });
  };

  const handleEndChapterChange = (e) => {
    const c = parseInt(e.target.value, 10);
    onChange({
      ...value,
      chapter_end: Math.max(value.chapter_start, c)
    });
  };

  const handleEndVerseChange = (e) => {
    const v = parseInt(e.target.value, 10);
    onChange({
      ...value,
      verse_end: v
    });
  };

  const setSingleVerse = () => {
    onChange({
      ...value,
      chapter_end: value.chapter_start,
      verse_end: value.verse_start
    });
  };

  const setWholeChapter = () => {
    onChange({
      ...value,
      chapter_end: value.chapter_start,
      verse_start: 1,
      verse_end: 99
    });
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          Passage Selection
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={setSingleVerse}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-2 py-1 rounded-md transition-colors"
          >
            Single Verse
          </button>
          <button
            type="button"
            onClick={setWholeChapter}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-2 py-1 rounded-md transition-colors"
          >
            Whole Chapter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Book Selector */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Book</label>
          <select
            value={value.book}
            onChange={handleBookChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <optgroup label="New Testament">
              {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </optgroup>
            <optgroup label="Old Testament">
              {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Start Chapter & Verse */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">From Chapter</label>
          <select
            value={value.chapter_start}
            onChange={handleStartChapterChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {Array.from({ length: selectedBookObj.chapters }, (_, i) => i + 1).map(c => (
              <option key={c} value={c}>Ch. {c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">From Verse</label>
          <input
            type="number"
            min="1"
            max="200"
            value={value.verse_start}
            onChange={handleStartVerseChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* End Chapter & Verse */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">To Verse (End)</label>
          <div className="flex items-center gap-1">
            {value.chapter_end !== value.chapter_start && (
              <span className="text-xs text-amber-400 font-mono">Ch{value.chapter_end}:</span>
            )}
            <input
              type="number"
              min="1"
              max="200"
              value={value.verse_end}
              onChange={handleEndVerseChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
