'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

interface ShowcaseData {
  url:    string;
  qrSvg:  string;
  stats:  { users: number; matches: number; messages: number; events: number };
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  course: string;
  createdAt: string;
}

interface AdminEvent {
  id: string;
  title: string;
  emoji: string;
  category: string;
  date: string;
  attendees: number;
}

type AdminTab = 'usuarios' | 'eventos';

function StatCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-w-[110px]">
      <span className="text-2xl">{emoji}</span>
      <span className="font-display font-black text-3xl text-coral">{value}</span>
      <span className="text-xs text-white/40 font-medium">{label}</span>
    </div>
  );
}

export default function ShowcasePage() {
  const [data, setData]             = useState<ShowcaseData | null>(null);
  const [error, setError]           = useState('');
  const [lastUpdated, setLast]      = useState('');
  const [adminOpen, setAdminOpen]   = useState(false);
  const [adminTab, setAdminTab]     = useState<AdminTab>('usuarios');
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [events, setEvents]         = useState<AdminEvent[]>([]);
  const [resetting, setResetting]   = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg]               = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/showcase');
      if (!res.ok) { setError('Erro ao carregar dados.'); return; }
      setData(await res.json());
      setLast(new Date().toLocaleTimeString('pt-BR'));
    } catch {
      setError('Não foi possível conectar ao servidor.');
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const openAdmin = async () => {
    setAdminOpen(true);
    setMsg('');
    const res = await fetch('/api/admin');
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users ?? []);
      setEvents(json.events ?? []);
    }
  };

  const closeAdmin = () => { setAdminOpen(false); setMsg(''); };

  const handleReset = async (action: 'reset-all' | 'reset-activity' | 'reset-events') => {
    const labels: Record<string, string> = {
      'reset-all':      'APAGAR TODOS OS USUÁRIOS, EVENTOS E DADOS? Irreversível.',
      'reset-activity': 'Apagar todos os matches, mensagens e swipes? Usuários e eventos ficam.',
      'reset-events':   'Remover TODOS os eventos? Os usuários ficam cadastrados.',
    };
    if (!confirm(labels[action])) return;
    setResetting(true);
    const res  = await fetch(`/api/admin?action=${action}`, { method: 'DELETE' });
    const json = await res.json();
    setMsg(json.message ?? json.error);
    setResetting(false);
    if (action === 'reset-all')    { setUsers([]); setEvents([]); }
    if (action === 'reset-events') { setEvents([]); }
    fetchData();
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Remover este evento?')) return;
    setDeletingId(eventId);
    const res  = await fetch(`/api/admin?action=delete-event&eventId=${eventId}`, { method: 'DELETE' });
    const json = await res.json();
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      fetchData();
    } else {
      setMsg(json.error ?? 'Erro ao remover evento.');
    }
    setDeletingId(null);
  };

  const CATEGORY_LABELS: Record<string, string> = {
    social:   '🎉 Social',
    academic: '📚 Acadêmico',
    sports:   '⚽ Esportes',
    cultural: '🎵 Cultural',
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col items-center justify-center p-6 gap-10">

      {/* Glow rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[600, 900, 1200].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-coral/5"
            style={{ width: s, height: s }} />
        ))}
      </div>

      {/* Admin button (top-right) */}
      <button
        onClick={adminOpen ? closeAdmin : openAdmin}
        className="absolute top-4 right-4 z-20 text-xs text-white/20 hover:text-white/60 px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 transition-all"
      >
        {adminOpen ? 'Fechar admin' : 'Admin'}
      </button>

      {/* Admin panel */}
      {adminOpen && (
        <div className="relative z-20 w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-6 space-y-5">
          <h2 className="text-white font-display font-bold text-lg">Painel Admin — Showcase</h2>

          {msg && (
            <p className="text-sm px-3 py-2 rounded-xl bg-coral/10 border border-coral/20 text-coral">{msg}</p>
          )}

          {/* Ações rápidas */}
          <div className="flex gap-3">
            <button
              onClick={() => handleReset('reset-activity')}
              disabled={resetting}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 text-sm font-semibold disabled:opacity-40 transition-all"
            >
              Resetar atividade
              <span className="block text-[11px] text-white/30 font-normal">mantém usuários e eventos</span>
            </button>
            <button
              onClick={() => handleReset('reset-all')}
              disabled={resetting}
              className="flex-1 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold disabled:opacity-40 transition-all"
            >
              Resetar tudo
              <span className="block text-[11px] text-red-400/50 font-normal">apaga tudo</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {(['usuarios', 'eventos'] as AdminTab[]).map(t => (
              <button key={t} onClick={() => setAdminTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${adminTab === t ? 'bg-coral/20 text-coral' : 'text-white/40 hover:text-white/60'}`}>
                {t === 'usuarios' ? `Usuários (${users.length})` : `Eventos (${events.length})`}
              </button>
            ))}
          </div>

          {/* Tab: Usuários */}
          {adminTab === 'usuarios' && (
            <div>
              {users.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">Nenhum usuário ainda.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                      <div>
                        <p className="text-sm text-white font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-white/30">{u.course ?? 'IESGO'}</p>
                      </div>
                      <p className="text-[11px] text-white/20">
                        {new Date(u.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Eventos */}
          {adminTab === 'eventos' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">Nenhum evento criado ainda.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {events.map(ev => (
                      <div key={ev.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                        <span className="text-xl shrink-0">{ev.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{ev.title}</p>
                          <p className="text-[11px] text-white/30">
                            {CATEGORY_LABELS[ev.category] ?? ev.category} ·{' '}
                            {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} ·{' '}
                            {ev.attendees} participantes
                          </p>
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          disabled={deletingId === ev.id}
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center
                            hover:bg-red-500/25 disabled:opacity-40 transition-all shrink-0"
                          title="Remover evento"
                        >
                          {deletingId === ev.id
                            ? <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleReset('reset-events')}
                    disabled={resetting}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold
                      hover:bg-red-500/20 disabled:opacity-40 transition-all"
                  >
                    Remover todos os eventos
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Logo + conteúdo principal */}
      {!adminOpen && (
        <>
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="relative w-24 h-24">
              <Image src="/Logo.png" alt="Tinder IESGO" fill
                className="object-contain drop-shadow-[0_0_30px_rgba(240,112,112,0.6)]" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-white tracking-tight">
                Tinder <span className="text-coral">IESGO</span>
              </h1>
              <p className="text-white/40 text-base mt-1">O seu match está na sala ao lado.</p>
            </div>
          </div>

          {error && (
            <p className="relative z-10 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {data ? (
            <>
              {/* QR Code */}
              <div className="relative z-10 flex flex-col items-center gap-5">

                {/* Card do QR */}
                <div className="relative">
                  {/* Brilho atrás do card */}
                  <div className="absolute inset-0 rounded-[2rem] bg-coral/30 blur-3xl scale-110 pointer-events-none" />

                  {/* Card branco com borda coral */}
                  <div className="relative rounded-[2rem] p-2 bg-gradient-to-br from-coral/60 via-purple/40 to-coral/20">
                    <div className="bg-white rounded-[1.5rem] p-4 shadow-2xl">
                      {/* QR responsivo dentro de um quadrado fixo */}
                      <div className="w-52 h-52"
                        dangerouslySetInnerHTML={{ __html: data.qrSvg }} />
                    </div>
                  </div>
                </div>

                {/* URL e instrução */}
                <div className="text-center space-y-1.5">
                  <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                    Escaneie com seu celular
                  </p>
                  <p className="font-display font-black text-white text-xl tracking-wide">
                    {data.url}
                  </p>
                  <p className="text-white/30 text-xs">
                    Conecte ao Wi-Fi do evento primeiro
                  </p>
                </div>
              </div>

              {/* Stats ao vivo */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">
                  Estatísticas ao vivo
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <StatCard emoji="👤" value={data.stats.users}    label="Usuários"  />
                  <StatCard emoji="💘" value={data.stats.matches}  label="Matches"   />
                  <StatCard emoji="💬" value={data.stats.messages} label="Mensagens" />
                  <StatCard emoji="🎉" value={data.stats.events}   label="Eventos"   />
                </div>
                {lastUpdated && (
                  <p className="text-[11px] text-white/20">
                    Atualizado às {lastUpdated} · atualiza a cada 15s
                  </p>
                )}
              </div>

              {/* Instrução rápida */}
              <div className="relative z-10 flex flex-col items-center gap-2 text-center max-w-xs">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <span className="text-xl shrink-0">📱</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Como participar:</p>
                    <ol className="text-xs text-white/50 mt-1 space-y-1 list-decimal list-inside">
                      <li>Conecte seu celular ao Wi-Fi do evento</li>
                      <li>Escaneie o QR code acima</li>
                      <li>Crie sua conta com e-mail ou celular</li>
                      <li>Dê match com quem está aqui!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          ) : !error && (
            <div className="relative z-10 w-10 h-10 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
          )}
        </>
      )}
    </div>
  );
}
