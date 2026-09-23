import React, { useState } from 'react';
import { Lightbulb, HelpCircle, Target, Eye, Edit3, Sparkles } from 'lucide-react';
import { DEFAULT_SWEDISH_TEMPLATE } from '../lib/constants';

export default function SwedishMarkdownEditor({ content, onChange }) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'

  const insertTemplateHeader = (headerText) => {
    const textToInsert = `\n\n${headerText}\n- `;
    onChange((content || '') + textToInsert);
  };

  const loadDefaultTemplate = () => {
    if (!content || content.trim() === '') {
      onChange(DEFAULT_SWEDISH_TEMPLATE);
    } else if (confirm('Replace current text with fresh Swedish Method template?')) {
      onChange(DEFAULT_SWEDISH_TEMPLATE);
    }
  };

  return (
    <div className="glass-card flex flex-col border border-slate-800 overflow-hidden">
      {/* Editor Toolbar Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Swedish Method Markdown
          </span>
          <button
            type="button"
            onClick={loadDefaultTemplate}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Reset Template
          </button>
        </div>

        {/* Swedish Method Header Shortcuts */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => insertTemplateHeader('### 💡 Key Idea(s)')}
            className="badge-key-idea hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Insert Key Idea Section"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            + Key Idea
          </button>
          <button
            type="button"
            onClick={() => insertTemplateHeader('### ❓ Question(s)')}
            className="badge-question hover:bg-sky-500/20 transition-colors cursor-pointer"
            title="Insert Question Section"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            + Question
          </button>
          <button
            type="button"
            onClick={() => insertTemplateHeader('### 🏹 Application(s)')}
            className="badge-application hover:bg-emerald-500/20 transition-colors cursor-pointer"
            title="Insert Application Section"
          >
            <Target className="w-3.5 h-3.5" />
            + Application
          </button>

          {/* Edit / Preview Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 ml-2">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'edit' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'preview' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={DEFAULT_SWEDISH_TEMPLATE}
          rows={12}
          className="w-full bg-slate-950/60 p-4 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none resize-y"
        />
      ) : (
        <div className="p-4 bg-slate-950/60 min-h-[280px] prose prose-invert max-w-none text-sm leading-relaxed">
          {renderFormattedMarkdown(content)}
        </div>
      )}
    </div>
  );
}

// Simple lightweight renderer for headers and bullet points
function renderFormattedMarkdown(text) {
  if (!text || text.trim() === '') {
    return <p className="text-slate-500 italic">Nothing to preview yet...</p>;
  }

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### 💡') || line.toLowerCase().includes('key idea')) {
      return (
        <div key={idx} className="mt-4 mb-2 flex items-center gap-2 font-bold text-amber-300 text-base">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.startsWith('### ❓') || line.toLowerCase().includes('question')) {
      return (
        <div key={idx} className="mt-4 mb-2 flex items-center gap-2 font-bold text-sky-300 text-base">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.startsWith('### 🏹') || line.toLowerCase().includes('application')) {
      return (
        <div key={idx} className="mt-4 mb-2 flex items-center gap-2 font-bold text-emerald-300 text-base">
          <Target className="w-5 h-5 text-emerald-400" />
          <span>{line.replace(/#/g, '').trim()}</span>
        </div>
      );
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-4 my-1 text-slate-200">
          <span className="text-emerald-500 font-bold">•</span>
          <span>{line.trim().substring(2)}</span>
        </div>
      );
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-2" />;
    }
    return <p key={idx} className="text-slate-300 my-1">{line}</p>;
  });
}
