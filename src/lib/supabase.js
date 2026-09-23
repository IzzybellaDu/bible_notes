import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_MOCK_PROFILES,
  INITIAL_MOCK_NOTES,
  INITIAL_MOCK_FRIENDSHIPS,
  INITIAL_MOCK_NOTIFICATIONS
} from './constants';
import { doPassagesOverlap, formatPassageRef } from './overlap';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// HYBRID LOCAL MOCK STORE (runs when Supabase is not configured)
// ====================================================================

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'bn_current_user_id',
  PROFILES: 'bn_profiles_v2',
  NOTES: 'bn_notes_v2',
  FRIENDSHIPS: 'bn_friendships_v2',
  NOTIFICATIONS: 'bn_notifications_v2',
  SETTINGS: 'bn_settings_v2'
};

// Initialize LocalStorage with mock data if empty
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_MOCK_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_MOCK_NOTES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) {
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(INITIAL_MOCK_FRIENDSHIPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user-me');
  }
}

initLocalStorage();

// Helper getters/setters
function getProfiles() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
}
function saveProfiles(data) {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data));
}

function getNotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
}
function saveNotes(data) {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data));
}

function getFriendships() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS) || '[]');
}
function saveFriendships(data) {
  localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(data));
}

function getNotifications() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
}
function saveNotifications(data) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
}

export function getCurrentUserId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-me';
}

export function setCurrentUserId(id) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
}

export function getCurrentUserProfile() {
  const currentId = getCurrentUserId();
  const profiles = getProfiles();
  return profiles.find(p => p.id === currentId) || profiles[0];
}

// Data API Wrapper (Unified for Supabase and Local Store)

export const api = {
  // Profiles
  async getProfiles() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    }
    return getProfiles();
  },

  async updateProfile(updates) {
    const userId = getCurrentUserId();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
      if (error) throw error;
      return data;
    }
    const profiles = getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates };
      saveProfiles(profiles);
      return profiles[idx];
    }
    return null;
  },

  // Notes
  async getNotes() {
    const userId = getCurrentUserId();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) throw error;
      return data;
    }
    // RLS Simulation: View own notes OR friends' non-private notes
    const friendships = getFriendships();
    const friendIds = friendships
      .filter(f => f.status === 'accepted' && (f.user_id_a === userId || f.user_id_b === userId))
      .map(f => (f.user_id_a === userId ? f.user_id_b : f.user_id_a));

    const allNotes = getNotes();
    return allNotes.filter(n => {
      if (n.user_id === userId) return true; // own notes
      if (n.visibility === 'friends' && friendIds.includes(n.user_id)) return true; // friend's shared note
      return false; // private note of another user is strictly filtered
    });
  },

  async saveNote(noteData) {
    const userId = getCurrentUserId();
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      if (noteData.id) {
        const { data, error } = await supabase.from('notes').update({ ...noteData, updated_at: now }).eq('id', noteData.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('notes').insert([{ ...noteData, user_id: userId, created_at: now, updated_at: now }]).select().single();
        if (error) throw error;
        return data;
      }
    }

    const notes = getNotes();
    let savedNote;

    if (noteData.id) {
      const idx = notes.findIndex(n => n.id === noteData.id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...noteData, updated_at: now };
        savedNote = notes[idx];
      }
    } else {
      savedNote = {
        id: 'note-' + Date.now(),
        user_id: userId,
        created_at: now,
        updated_at: now,
        ...noteData
      };
      notes.unshift(savedNote);
    }
    saveNotes(notes);

    // Overlap notification generation for friends
    if (savedNote.visibility === 'friends') {
      const friendships = getFriendships();
      const friendIds = friendships
        .filter(f => f.status === 'accepted' && (f.user_id_a === userId || f.user_id_b === userId))
        .map(f => (f.user_id_a === userId ? f.user_id_b : f.user_id_a));

      const notifications = getNotifications();
      const refSummary = formatPassageRef(savedNote.book, savedNote.chapter_start, savedNote.verse_start, savedNote.chapter_end, savedNote.verse_end);

      friendIds.forEach(fId => {
        // Check if friend has notes on this passage
        const friendHasNotes = notes.some(n => n.user_id === fId && doPassagesOverlap(n, savedNote));
        if (friendHasNotes) {
          notifications.unshift({
            id: 'n-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            user_id: fId,
            type: 'friend_note_exists',
            related_note_id: savedNote.id,
            related_user_id: userId,
            passage_summary: refSummary,
            read: false,
            created_at: now
          });
        }
      });
      saveNotifications(notifications);
    }

    return savedNote;
  },

  async deleteNote(noteId) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
      return true;
    }
    const notes = getNotes().filter(n => n.id !== noteId);
    saveNotes(notes);
    return true;
  },

  // Friends & Requests
  async getFriends() {
    const userId = getCurrentUserId();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('friendships').select('*');
      if (error) throw error;
      return data;
    }
    return getFriendships();
  },

  async sendFriendRequest(targetUsernameOrEmail) {
    const userId = getCurrentUserId();
    const profiles = getProfiles();
    const target = profiles.find(
      p => (p.username.toLowerCase() === targetUsernameOrEmail.trim().toLowerCase()) && p.id !== userId
    );

    if (!target) {
      throw new Error(`User "${targetUsernameOrEmail}" not found.`);
    }

    const friendships = getFriendships();
    const existing = friendships.find(
      f => (f.user_id_a === userId && f.user_id_b === target.id) || (f.user_id_a === target.id && f.user_id_b === userId)
    );

    if (existing) {
      throw new Error(existing.status === 'accepted' ? 'Already friends!' : 'Friend request pending.');
    }

    const newFriendship = {
      id: 'f-' + Date.now(),
      user_id_a: userId,
      user_id_b: target.id,
      status: 'pending',
      requested_by: userId,
      created_at: new Date().toISOString()
    };

    friendships.push(newFriendship);
    saveFriendships(friendships);

    // Create notification for target user
    const notifications = getNotifications();
    notifications.unshift({
      id: 'n-' + Date.now(),
      user_id: target.id,
      type: 'friend_request',
      related_user_id: userId,
      read: false,
      created_at: new Date().toISOString()
    });
    saveNotifications(notifications);

    return newFriendship;
  },

  async acceptFriendRequest(friendshipId) {
    const friendships = getFriendships();
    const idx = friendships.findIndex(f => f.id === friendshipId);
    if (idx !== -1) {
      friendships[idx].status = 'accepted';
      saveFriendships(friendships);

      // Notify requestor
      const notifications = getNotifications();
      const currentUserId = getCurrentUserId();
      const otherUserId = friendships[idx].user_id_a === currentUserId ? friendships[idx].user_id_b : friendships[idx].user_id_a;
      notifications.unshift({
        id: 'n-' + Date.now(),
        user_id: otherUserId,
        type: 'friend_accept',
        related_user_id: currentUserId,
        read: false,
        created_at: new Date().toISOString()
      });
      saveNotifications(notifications);
      return friendships[idx];
    }
    return null;
  },

  async removeFriendship(friendshipId) {
    const friendships = getFriendships().filter(f => f.id !== friendshipId);
    saveFriendships(friendships);
    return true;
  },

  // Notifications
  async getNotifications() {
    const userId = getCurrentUserId();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId);
      if (error) throw error;
      return data;
    }
    return getNotifications().filter(n => n.user_id === userId);
  },

  async markNotificationRead(notifId) {
    const userId = getCurrentUserId();
    const notifications = getNotifications();
    const idx = notifications.findIndex(n => n.id === notifId && n.user_id === userId);
    if (idx !== -1) {
      notifications[idx].read = true;
      saveNotifications(notifications);
    }
    return true;
  },

  async markAllNotificationsRead() {
    const userId = getCurrentUserId();
    const notifications = getNotifications();
    notifications.forEach(n => {
      if (n.user_id === userId) n.read = true;
    });
    saveNotifications(notifications);
    return true;
  }
};
