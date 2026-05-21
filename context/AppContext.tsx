'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CAMPUS_EVENTS } from '@/constants';

// ── Tipos básicos ──────────────────────────────────────────────────
export interface CurrentUser {
  id:          string;
  firstName:   string;
  lastName?:   string;
  email?:      string;
  phone?:      string;
  dateOfBirth: string;
  gender:      string;
  pronouns?:   string;
  bio?:        string;
  interests:   string[] | string;
  photos:      string[] | string;
  lookingFor:  string[] | string;
  course?:     string;
  semester?:   number;
  shift?:      string;
  intention?:  string;
  city?:       string;
  state?:      string;
  maxDistance: number;
  minAge:      number;
  maxAge:      number;
  verified:    boolean;
  role:        string;
  notifMatch:  boolean;
  notifMessage: boolean;
  notifLike:   boolean;
  stats?:      UserStats;
  achievements?: { achievementId: string; unlockedAt: string }[];
}

export interface UserStats {
  likesGiven:      number;
  passesGiven:     number;
  studyDatesGiven: number;
  matchCount:      number;
  messagesSent:    number;
  boostsUsed:      number;
  eventsAttended:  number;
}

export interface CampusEvent {
  id:          string;
  title:       string;
  description: string;
  location:    string;
  date:        number;
  category:    string;
  organizer:   string;
  attendees:   number;
  emoji?:      string;
}

// ── Context type ───────────────────────────────────────────────────
interface AppContextType {
  currentUser:       CurrentUser | null;
  loading:           boolean;
  logout:            () => void;
  updateProfile:     (updates: Partial<CurrentUser>) => Promise<void>;
  swipe:             (targetId: string, action: 'like' | 'pass' | 'study') => Promise<boolean>;
  // Eventos
  events:            CampusEvent[];
  attendedEventIds:  string[];
  attendEvent:       (eventId: string) => void;
  refreshEvents:     () => Promise<void>;
  // Stats
  userStats:         UserStats;
}

const DEFAULT_STATS: UserStats = {
  likesGiven: 0, passesGiven: 0, studyDatesGiven: 0,
  matchCount: 0, messagesSent: 0, boostsUsed: 0, eventsAttended: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading]         = useState(true);
  const [events, setEvents]           = useState<CampusEvent[]>([]);
  const [attendedEventIds, setAttended] = useState<string[]>([]);
  const [userStats, setUserStats]     = useState<UserStats>(DEFAULT_STATS);

  // ── Carregar usuário atual ─────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          if (user.stats) setUserStats({ ...DEFAULT_STATS, ...user.stats });
          if (user.attendedEventIds) setAttended(user.attendedEventIds);
        }
        const evRes = await fetch('/api/events');
        if (evRes.ok) {
          const { events: dbEvents } = await evRes.json();
          setEvents(dbEvents);
        } else {
          setEvents(CAMPUS_EVENTS);
        }
      } catch { /* não autenticado */ } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setCurrentUser(null);
    setUserStats(DEFAULT_STATS);
    setAttended([]);
  }, []);

  // ── Atualizar perfil ───────────────────────────────────────────
  const updateProfile = useCallback(async (updates: Partial<CurrentUser>) => {
    const res = await fetch('/api/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updates),
    });
    if (res.ok) {
      setCurrentUser(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  }, []);

  // ── Swipe ──────────────────────────────────────────────────────
  const swipe = useCallback(async (
    targetId: string,
    action:   'like' | 'pass' | 'study'
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/swipe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ targetUserId: targetId, action }),
      });
      const json = await res.json();

      // Atualizar stats locais imediatamente
      setUserStats(prev => ({
        ...prev,
        likesGiven:      action === 'like' || action === 'study' ? prev.likesGiven + 1  : prev.likesGiven,
        passesGiven:     action === 'pass'  ? prev.passesGiven + 1  : prev.passesGiven,
        studyDatesGiven: action === 'study' ? prev.studyDatesGiven + 1 : prev.studyDatesGiven,
        matchCount:      json.matched ? prev.matchCount + 1 : prev.matchCount,
      }));

      return json.matched === true;
    } catch {
      return false;
    }
  }, []);

  // ── Eventos ────────────────────────────────────────────────────
  const refreshEvents = useCallback(async () => {
    const res = await fetch('/api/events');
    if (res.ok) {
      const { events: dbEvents } = await res.json();
      setEvents(dbEvents);
    }
  }, []);

  const attendEvent = useCallback((eventId: string) => {
    const isAttending = attendedEventIds.includes(eventId);

    // Optimistic update imediato
    if (isAttending) {
      setAttended(prev => prev.filter(id => id !== eventId));
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees - 1 } : e));
      setUserStats(prev => ({ ...prev, eventsAttended: Math.max(0, prev.eventsAttended - 1) }));
    } else {
      setAttended(prev => [...prev, eventId]);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e));
      setUserStats(prev => ({ ...prev, eventsAttended: prev.eventsAttended + 1 }));
    }

    // Persistir no banco em background
    fetch(`/api/events/${eventId}/participants`, { method: 'POST' }).catch(() => {
      // Reverter em caso de erro
      if (isAttending) {
        setAttended(prev => [...prev, eventId]);
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e));
        setUserStats(prev => ({ ...prev, eventsAttended: prev.eventsAttended + 1 }));
      } else {
        setAttended(prev => prev.filter(id => id !== eventId));
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees - 1 } : e));
        setUserStats(prev => ({ ...prev, eventsAttended: Math.max(0, prev.eventsAttended - 1) }));
      }
    });
  }, [attendedEventIds]);

  return (
    <AppContext.Provider value={{
      currentUser, loading, logout, updateProfile, swipe,
      events, attendedEventIds, attendEvent, refreshEvents, userStats,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
