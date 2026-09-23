import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import NoteBrowser from './pages/NoteBrowser';
import PassageViewer from './pages/PassageViewer';
import FriendsPage from './pages/FriendsPage';
import FriendProfilePage from './pages/FriendProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor" element={<NoteEditor />} />
            <Route path="/editor/:id" element={<NoteEditor />} />
            <Route path="/notes" element={<NoteBrowser />} />
            <Route path="/passage/:refStr" element={<PassageViewer />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/friend/:friendId" element={<FriendProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Bible Notes App — Swedish Method Study</span>
            <span>Powered by ESV API & Supabase</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
