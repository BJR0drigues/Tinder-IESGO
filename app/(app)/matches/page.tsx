'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Heart, Zap, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MatchUser {
  id: string; firstName: string; lastName?: string;
  photos: string[]; course?: string; verified: boolean;
  bio?: string; interests?: string[]; dateOfBirth?: string; intention?: string;
}
interface MatchItem {
  id: string; type?: string; createdAt: string;
  other: MatchUser; lastMessage?: string; lastMessageTime?: string; unreadCount: number;
}
interface MessageItem {
  id: string; matchId: string; senderId: string;
  content: string; type: string; isRead: boolean; createdAt: string;
}

function timeAgo(ts: string) {
  const d = Date.now() - new Date(ts).getTime();
  if (d < 60000)   return 'agora';
  if (d < 3600000) return `${Math.floor(d / 60000)}m`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`;
  return `${Math.floor(d / 86400000)}d`;
}

function getAge(dob?: string) {
  if (!dob) return null;
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
  return age;
}

function MatchRow({
  match, onChat, onProfile,
}: {
  match: MatchItem;
  onChat: () => void;
  onProfile: () => void;
}) {
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary border border-surface-border hover:border-coral/30 transition-all">
      {/* Avatar — opens profile */}
      <button onClick={onProfile} className="relative shrink-0">
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-gradient-brand">
          {match.other.photos[0]
            ? <img src={match.other.photos[0]} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
        </div>
        {match.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">
            {match.unreadCount}
          </span>
        )}
      </button>

      {/* Info — opens chat */}
      <button onClick={onChat} className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-semibold text-white text-sm truncate">{match.other.firstName}</p>
          {match.lastMessageTime && (
            <span className="text-[10px] text-white/30 shrink-0 ml-2">{timeAgo(match.lastMessageTime)}</span>
          )}
        </div>
        <p className={`text-xs truncate ${match.unreadCount > 0 ? 'text-white/70 font-medium' : 'text-white/30'}`}>
          {match.lastMessage ?? 'Diga oi! 👋'}
        </p>
      </button>
    </div>
  );
}

export default function MatchesPage() {
  const { currentUser } = useApp();
  const [matches, setMatches]       = useState<MatchItem[]>([]);
  const [activeMatch, setActive]    = useState<MatchItem | null>(null);
  const [messages, setMessages]     = useState<MessageItem[]>([]);
  const [text, setText]             = useState('');
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [viewProfile, setViewProfile]   = useState<MatchItem | null>(null);
  const [profilePhotoIdx, setProfileIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMatches = useCallback(async () => {
    const res = await fetch('/api/matches');
    if (res.ok) setMatches((await res.json()).matches ?? []);
    setLoading(false);
  }, []);

  const fetchMessages = useCallback(async (matchId: string) => {
    const res = await fetch(`/api/messages/${matchId}`);
    if (res.ok) {
      setMessages((await res.json()).messages ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  useEffect(() => {
    if (activeMatch) fetchMessages(activeMatch.id);
    else setMessages([]);
  }, [activeMatch, fetchMessages]);

  useEffect(() => {
    if (!activeMatch) return;
    const interval = setInterval(() => fetchMessages(activeMatch.id), 8000);
    return () => clearInterval(interval);
  }, [activeMatch, fetchMessages]);

  const send = async () => {
    if (!text.trim() || !activeMatch) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeMatch.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) { setText(''); fetchMessages(activeMatch.id); fetchMatches(); }
    } finally { setSending(false); }
  };

  const openProfile = (m: MatchItem) => { setViewProfile(m); setProfileIdx(0); };

  const studyDates = matches.filter(m => m.type === 'study');
  const regular    = matches.filter(m => m.type !== 'study');

  return (
    <div className="h-full flex bg-deep w-full overflow-hidden">

      {/* ── LEFT: matches list ───────────────────────────────────── */}
      <div className={`flex flex-col bg-deep overflow-y-auto no-scrollbar
        w-full lg:w-80 lg:flex-none lg:border-r lg:border-surface-border
        ${activeMatch ? 'hidden lg:flex' : 'flex'}`}>

        <div className="px-5 pt-5 pb-4 shrink-0">
          <h1 className="font-display font-black text-2xl text-white">
            Seus <span className="text-coral">matches</span>
          </h1>
          <p className="text-xs text-white/30 mt-0.5">{matches.length} conexões no campus</p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-surface-secondary border border-surface-border flex items-center justify-center text-4xl">💘</div>
            <div>
              <p className="font-display font-bold text-white">Nenhum match ainda</p>
              <p className="text-sm text-white/40 mt-1">Volte ao feed e dê likes!</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 px-4 space-y-5 pb-4">
            {studyDates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">Study Dates</span>
                </div>
                <div className="space-y-2">
                  {studyDates.map(m => (
                    <MatchRow key={m.id} match={m} onChat={() => setActive(m)} onProfile={() => openProfile(m)} />
                  ))}
                </div>
              </div>
            )}
            {regular.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-coral" />
                  <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">Matches</span>
                </div>
                <div className="space-y-2">
                  {regular.map(m => (
                    <MatchRow key={m.id} match={m} onChat={() => setActive(m)} onProfile={() => openProfile(m)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: chat or empty state ───────────────────────────── */}
      {activeMatch ? (
        <div className="flex flex-col h-full bg-deep flex-1 border-l border-surface-border">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-surface-border shrink-0">
            <button onClick={() => setActive(null)}
              className="w-9 h-9 rounded-xl bg-surface-secondary border border-surface-border flex items-center justify-center lg:hidden">
              <ArrowLeft className="w-4 h-4 text-white/60" />
            </button>
            <button onClick={() => openProfile(activeMatch)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-brand shrink-0">
                {activeMatch.other.photos[0]
                  ? <img src={activeMatch.other.photos[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{activeMatch.other.firstName}</p>
                <p className="text-xs text-white/30">{activeMatch.other.course ?? 'IESGO'} · ver perfil</p>
              </div>
            </button>
            {activeMatch.type === 'study' && (
              <span className="text-xs bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full font-semibold shrink-0">
                Study Date
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-white/20 text-xs mt-1">Seja o primeiro a dizer oi! 👋</p>
              </div>
            )}
            {messages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${isMine
                      ? 'bg-gradient-brand text-white rounded-tr-sm'
                      : 'bg-surface-secondary border border-surface-border text-white/80 rounded-tl-sm'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 shrink-0 flex gap-2 border-t border-surface-border pt-3">
            <input
              type="text" value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Escreva uma mensagem..."
              className="flex-1 px-4 py-3 rounded-2xl bg-surface-input border border-surface-border text-white
                placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none text-sm"
            />
            <button onClick={send} disabled={!text.trim() || sending}
              className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center
                shadow-glow-coral disabled:opacity-40 transition-all active:scale-95">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        /* Desktop: empty state when no chat selected */
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-4 text-center border-l border-surface-border">
          <div className="w-20 h-20 rounded-full bg-surface-secondary border border-surface-border flex items-center justify-center text-4xl">💬</div>
          <div>
            <p className="font-display font-bold text-white">Selecione um match</p>
            <p className="text-sm text-white/40 mt-1">Escolha uma conversa para começar</p>
          </div>
        </div>
      )}

      {/* ── Profile modal ─────────────────────────────────────────── */}
      {viewProfile && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setViewProfile(null)}>
          <div
            className="w-full max-w-sm lg:max-w-md bg-surface rounded-t-3xl lg:rounded-3xl border border-surface-border shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Photo carousel */}
            <div className="relative h-72 shrink-0 bg-gradient-brand">
              {viewProfile.other.photos.length > 0 ? (
                <img src={viewProfile.other.photos[profilePhotoIdx]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
              )}
              <button onClick={() => setViewProfile(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
              {viewProfile.other.photos.length > 1 && (
                <>
                  <button onClick={() => setProfileIdx(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-30"
                    disabled={profilePhotoIdx === 0}>
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setProfileIdx(i => Math.min(viewProfile.other.photos.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-30"
                    disabled={profilePhotoIdx === viewProfile.other.photos.length - 1}>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {viewProfile.other.photos.map((_, i) => (
                      <button key={i} onClick={() => setProfileIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === profilePhotoIdx ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
            </div>

            {/* Info */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              <div>
                <h2 className="font-display font-black text-xl text-white">
                  {viewProfile.other.firstName}
                  {viewProfile.other.lastName ? ` ${viewProfile.other.lastName.charAt(0)}.` : ''}
                  {getAge(viewProfile.other.dateOfBirth) != null && (
                    <span className="text-white/50 font-normal text-lg">, {getAge(viewProfile.other.dateOfBirth)}</span>
                  )}
                </h2>
                <p className="text-sm text-white/50 mt-0.5">{viewProfile.other.course ?? 'IESGO'}</p>
              </div>
              {viewProfile.other.bio && (
                <p className="text-sm text-white/70 leading-relaxed">{viewProfile.other.bio}</p>
              )}
              {viewProfile.other.intention && (
                <p className="text-sm text-white/60">💫 {viewProfile.other.intention}</p>
              )}
              {viewProfile.other.interests && viewProfile.other.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Interesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewProfile.other.interests.map((interest, i) => (
                      <span key={i} className="text-xs bg-coral/10 border border-coral/20 text-coral/80 px-2.5 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-5 py-4 border-t border-surface-border shrink-0">
              <button
                onClick={() => { setViewProfile(null); setActive(viewProfile); }}
                className="w-full py-3.5 rounded-2xl bg-gradient-brand text-white font-display font-bold
                  shadow-glow-coral hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Enviar mensagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
