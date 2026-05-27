'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, X, Send, Plus, ChevronLeft, MessageCircle, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const CATEGORIES = [
  { value: 'all',      label: 'Todos',     emoji: '✨' },
  { value: 'social',   label: 'Social',    emoji: '🎉' },
  { value: 'academic', label: 'Acadêmico', emoji: '📚' },
  { value: 'sports',   label: 'Esportes',  emoji: '⚽' },
  { value: 'cultural', label: 'Cultural',  emoji: '🎵' },
];

const CATEGORY_VALUES = ['social', 'academic', 'sports', 'cultural'];

interface EventMsg {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName?: string; photo?: string; course?: string };
}

interface Participant {
  id: string; firstName: string; lastName?: string;
  photo?: string; course?: string; verified: boolean;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diff === 0)  return 'Hoje';
  if (diff === 1)  return 'Amanhã';
  if (diff === -1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function EventsPage() {
  const { events, attendedEventIds, attendEvent, refreshEvents, currentUser } = useApp();
  const [filter, setFilter]           = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [activeTab, setActiveTab]     = useState<'chat' | 'participantes'>('chat');
  const [messages, setMessages]       = useState<EventMsg[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [msgInput, setMsgInput]       = useState('');
  const [sending, setSending]         = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [createOpen, setCreateOpen]   = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create event form
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', location: 'IESGO — Formosa, GO',
    date: '', category: 'social', organizer: '', emoji: '🎉',
  });
  const [creating, setCreating] = useState(false);

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  const openEvent = async (ev: typeof events[0]) => {
    setSelectedEvent(ev);
    setLoadingDetail(true);
    setMessages([]);
    setParticipants([]);
    try {
      const [msgRes, partRes] = await Promise.all([
        fetch(`/api/events/${ev.id}/messages`),
        fetch(`/api/events/${ev.id}/participants`),
      ]);
      if (msgRes.ok)  setMessages((await msgRes.json()).messages);
      if (partRes.ok) setParticipants((await partRes.json()).participants);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Poll messages every 5s when detail is open
  useEffect(() => {
    if (!selectedEvent) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/events/${selectedEvent.id}/messages`);
      if (res.ok) setMessages((await res.json()).messages);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !selectedEvent || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msgInput.trim() }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages(prev => [...prev, message]);
        setMsgInput('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleAttend = async (eventId: string) => {
    attendEvent(eventId);
    if (selectedEvent?.id === eventId) {
      const res = await fetch(`/api/events/${eventId}/participants`);
      if (res.ok) setParticipants((await res.json()).participants);
    }
  };

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.organizer) return;
    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, date: new Date(newEvent.date).toISOString() }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setNewEvent({ title: '', description: '', location: 'IESGO — Formosa, GO', date: '', category: 'social', organizer: '', emoji: '🎉' });
        await refreshEvents();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedEvent?.id === eventId) setSelectedEvent(null);
        await refreshEvents();
      } else {
        alert('Erro ao excluir evento. Apenas o criador pode excluí-lo.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Event detail view ──────────────────────────────────────────────
  if (selectedEvent) {
    const attending = attendedEventIds.includes(selectedEvent.id);
    return (
      <div className="h-full flex flex-col bg-deep lg:max-w-3xl lg:mx-auto lg:w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface/80 backdrop-blur-xl shrink-0">
          <button onClick={() => setSelectedEvent(null)}
            className="w-9 h-9 rounded-xl bg-surface-secondary border border-surface-border flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white/60" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-sm truncate">{selectedEvent.emoji} {selectedEvent.title}</p>
            <p className="text-xs text-white/40">{formatDate(selectedEvent.date)} · {selectedEvent.location.split(' — ')[0]}</p>
          </div>
          
          {selectedEvent.createdById === currentUser?.id && (
            <button onClick={() => handleDeleteEvent(selectedEvent.id)}
              className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 hover:bg-red-500/20 transition-all"
              title="Excluir evento">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}

          <button
            onClick={() => handleAttend(selectedEvent.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0
              ${attending
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-gradient-brand text-white shadow-glow-coral hover:opacity-90'}`}>
            {attending ? <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmado</> : <><Calendar className="w-3.5 h-3.5" /> Participar</>}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mx-4 mt-3 mb-2 bg-surface-secondary rounded-xl p-1 border border-surface-border shrink-0">
          {(['chat', 'participantes'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5
                ${activeTab === t ? 'bg-gradient-brand text-white' : 'text-white/40 hover:text-white/70'}`}>
              {t === 'chat' ? <MessageCircle className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              {t === 'chat' ? 'Chat do Evento' : `Participantes (${participants.length})`}
            </button>
          ))}
        </div>

        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
          </div>
        ) : activeTab === 'chat' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                  <MessageCircle className="w-12 h-12 text-white/10" />
                  <p className="text-white/30 text-sm">Nenhuma mensagem ainda.<br />Seja o primeiro a escrever!</p>
                </div>
              ) : messages.map(msg => {
                const isMe = msg.user.id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-brand shrink-0 mt-1">
                      {msg.user.photo
                        ? <img src={msg.user.photo} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                    </div>
                    <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!isMe && (
                        <p className="text-[10px] text-white/40 px-1">
                          {msg.user.firstName}{msg.user.lastName ? ` ${msg.user.lastName.charAt(0)}.` : ''}
                          {msg.user.course ? ` · ${msg.user.course.split(' ')[0]}` : ''}
                        </p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMe
                          ? 'bg-gradient-brand text-white rounded-tr-md'
                          : 'bg-surface-secondary border border-surface-border text-white/80 rounded-tl-md'}`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-white/30 px-1">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-surface-border bg-surface/80 backdrop-blur-xl shrink-0">
              <div className="flex gap-2">
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Mensagem no chat do evento..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white
                    placeholder-white/20 focus:border-coral outline-none text-sm"
                />
                <button onClick={sendMessage} disabled={!msgInput.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center
                    shadow-glow-coral hover:opacity-90 disabled:opacity-40 transition-all">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Participants list */
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2 space-y-2">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                <Users className="w-12 h-12 text-white/10" />
                <p className="text-white/30 text-sm text-center">Nenhum participante ainda.<br />Seja o primeiro a confirmar!</p>
              </div>
            ) : participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-surface-border">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-brand shrink-0">
                  {p.photo
                    ? <img src={p.photo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-white truncate">
                      {p.firstName}{p.lastName ? ` ${p.lastName.charAt(0)}.` : ''}
                    </p>
                    {p.verified && <CheckCircle2 className="w-3.5 h-3.5 text-coral shrink-0" />}
                  </div>
                  <p className="text-xs text-white/40 truncate">{p.course ?? 'IESGO'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Event list ─────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-deep">
      <div className="lg:max-w-3xl lg:mx-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white">
            Eventos do <span className="text-coral">Campus</span>
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Formosa, GO · IESGO</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-bold
            shadow-glow-coral hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Criar Evento
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 mb-5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilter(c.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all
              ${filter === c.value
                ? 'bg-coral/15 border-coral text-coral'
                : 'bg-surface-secondary border-surface-border text-white/50 hover:border-purple/30'}`}>
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="px-4 pb-6 space-y-3">
        {filtered.map(event => {
          const attending = attendedEventIds.includes(event.id);
          return (
            <div key={event.id}
              className="bg-surface-secondary rounded-2xl border border-surface-border overflow-hidden hover:border-coral/20 transition-all cursor-pointer"
              onClick={() => openEvent(event)}
            >
              <div className={`h-1.5 ${
                event.category === 'social'   ? 'bg-gradient-brand' :
                event.category === 'academic' ? 'bg-gradient-to-r from-blue-500 to-purple' :
                event.category === 'sports'   ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                'bg-gradient-to-r from-yellow-400 to-orange-400'
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{event.emoji}</span>
                    <div>
                      <h3 className="font-display font-bold text-white text-sm leading-tight">{event.title}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{event.organizer}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-coral">{formatDate(event.date)}</p>
                    <p className="text-[10px] text-white/30">
                      {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/50 leading-relaxed mb-3 line-clamp-2">{event.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location.split(' — ')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.attendees}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Chat
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {event.createdById === currentUser?.id && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                        className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleAttend(event.id); }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${attending
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-gradient-brand text-white shadow-glow-coral hover:opacity-90'}`}>
                      {attending
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmado</>
                        : <><Calendar className="w-3.5 h-3.5" /> Participar</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-white/30 text-sm">Nenhum evento nessa categoria.</p>
          </div>
        )}
      </div>

      </div>
      {/* ── Create Event Modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface rounded-t-3xl lg:rounded-3xl border border-surface-border shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border shrink-0">
              <h3 className="font-display font-bold text-white text-lg">Criar Evento</h3>
              <button onClick={() => setCreateOpen(false)} className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              {[
                { label: 'TÍTULO', key: 'title', placeholder: 'Ex: Churrasco da Atlética' },
                { label: 'ORGANIZADOR', key: 'organizer', placeholder: 'Ex: Atlética IESGO' },
                { label: 'LOCAL', key: 'location', placeholder: 'Ex: Quadra da IESGO' },
                { label: 'EMOJI', key: 'emoji', placeholder: '🎉' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">{label}</label>
                  <input
                    value={(newEvent as any)[key]}
                    onChange={e => setNewEvent(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white
                      placeholder-white/20 focus:border-coral outline-none text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">DESCRIÇÃO</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do evento..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white
                    placeholder-white/20 focus:border-coral outline-none resize-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">DATA E HORA</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white
                    focus:border-coral outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">CATEGORIA</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setNewEvent(prev => ({ ...prev, category: c.value }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all
                        ${newEvent.category === c.value
                          ? 'border-coral bg-coral/15 text-coral'
                          : 'border-surface-border bg-surface-secondary text-white/50'}`}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-surface-border shrink-0">
              <button onClick={handleCreate} disabled={creating || !newEvent.title || !newEvent.description || !newEvent.date || !newEvent.organizer}
                className="w-full py-3.5 rounded-2xl bg-gradient-brand text-white font-display font-bold
                  shadow-glow-coral hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? 'Criando...' : 'Criar Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
