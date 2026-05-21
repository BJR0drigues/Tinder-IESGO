'use client';

import React, { useState, useRef } from 'react';
import { Camera, Edit3, LogOut, CheckCircle, Settings, ChevronRight, Star, X, Save, ChevronLeft, ChevronRightIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compress-image';

const INTERESTS_LIST = [
  '🎮 Games', '☕ Café', '🏋️ Academia', '🎵 Música', '✈️ Viagens', '🎬 Filmes',
  '📚 Leitura', '🍕 Gastronomia', '🐾 Pets', '⚽ Esportes', '🎨 Arte', '🧘 Yoga',
  '🎤 Karaokê', '🌿 Natureza', '💻 Tech', '🎭 Teatro', '🍺 Cerveja', '🎸 Rock',
  '🤠 Sertanejo', '🕺 Dança', '📸 Fotografia', '🧪 Ciências', '🎯 Jogos de Mesa',
  '🏄 Surf', '🎻 Clássico', '🍜 Culinária', '🚴 Ciclismo', '🏊 Natação',
];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-surface-secondary rounded-2xl p-3 text-center border border-surface-border">
      <p className="font-display font-black text-xl text-coral">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, loading, logout, userStats, updateProfile } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'info' | 'stats' | 'conquistas'>('info');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const interests: string[] = Array.isArray(currentUser.interests)
    ? currentUser.interests
    : JSON.parse(currentUser.interests ?? '[]');

  const photos: string[] = Array.isArray(currentUser.photos)
    ? currentUser.photos
    : JSON.parse(currentUser.photos ?? '[]');

  const openEdit = () => {
    setEditBio(currentUser.bio ?? '');
    setEditInterests([...interests]);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    await updateProfile({ bio: editBio, interests: editInterests });
    setSaving(false);
    setEditOpen(false);
  };

  const toggleInterest = (i: string) => {
    const label = i.split(' ').slice(1).join(' ');
    setEditInterests(prev =>
      prev.includes(label)
        ? prev.filter(x => x !== label)
        : prev.length < 10 ? [...prev, label] : prev
    );
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const newPhotos = photos.length > 0 ? [compressed, ...photos.slice(1)] : [compressed];
    await updateProfile({ photos: newPhotos });
    e.target.value = '';
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 1400, 600, 0.80);
    await updateProfile({ bannerPhoto: compressed } as any);
    e.target.value = '';
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const newPhotos = [...photos, compressed].slice(0, 6);
    await updateProfile({ photos: newPhotos });
    e.target.value = '';
  };

  const bannerPhoto = (currentUser as any).bannerPhoto;

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-deep">
      <div className="lg:max-w-2xl lg:mx-auto">

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />

      {/* ── Cover / Banner ── */}
      <div className="relative">
        <div className="h-36 overflow-hidden relative group">
          {bannerPhoto ? (
            <img src={bannerPhoto} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-full" />
          )}
          {/* Banner edit button */}
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold">
              <Camera className="w-4 h-4" /> Alterar banner
            </span>
          </button>
        </div>

        {/* Avatar */}
        <div className="absolute bottom-0 translate-y-1/2 left-5">
          <div className="relative">
            <div className="w-22 h-22 rounded-full overflow-hidden border-4 border-deep bg-gradient-brand shadow-glow-coral"
              style={{ width: 88, height: 88 }}>
              {photos[0]
                ? <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-coral border-2 border-deep flex items-center justify-center hover:bg-coral/80 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Edit & Settings buttons */}
        <div className="absolute bottom-2 right-4 flex gap-2">
          <button
            onClick={openEdit}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
            title="Editar perfil"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
            title="Configurações"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── Name + badges ── */}
      <div className="px-5 mt-14 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-black text-2xl text-white">
            {currentUser.firstName}{currentUser.lastName ? ` ${currentUser.lastName}` : ''}
          </h2>
          {currentUser.verified && <CheckCircle className="w-5 h-5 text-coral" />}
        </div>
        <p className="text-sm text-white/40 mt-0.5">
          {currentUser.course ?? 'IESGO'}{currentUser.semester ? ` · ${currentUser.semester}º sem` : ''} · Formosa, GO
        </p>
        {currentUser.intention && (
          <span className="inline-block mt-2 text-xs bg-coral/15 text-coral border border-coral/30 px-2.5 py-1 rounded-full font-semibold">
            {currentUser.intention}
          </span>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="px-4 mb-5 flex gap-2">
        <StatCard label="Likes"     value={userStats?.likesGiven  ?? 0} />
        <StatCard label="Matches"   value={userStats?.matchCount   ?? 0} />
        <StatCard label="Mensagens" value={userStats?.messagesSent ?? 0} />
      </div>

      {/* ── Photo carousel ── */}
      {photos.length > 0 && (
        <div className="px-4 mb-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Fotos</p>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {photos.map((p, i) => (
                <div key={i} className="relative shrink-0 w-24 h-32 rounded-xl overflow-hidden border border-surface-border">
                  <img src={p} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-[9px] bg-coral text-white font-bold px-1.5 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
              ))}
              {/* Add photo slot */}
              {photos.length < 6 && (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="shrink-0 w-24 h-32 rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center gap-1.5 hover:border-coral/40 transition-colors"
                >
                  <Camera className="w-5 h-5 text-white/30" />
                  <span className="text-xs text-white/30">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mx-4 mb-4 bg-surface-secondary rounded-2xl p-1 border border-surface-border">
        {(['info', 'stats', 'conquistas'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all
              ${tab === t ? 'bg-gradient-brand text-white shadow-glow-coral' : 'text-white/40 hover:text-white/70'}`}>
            {t === 'info' ? 'Perfil' : t === 'stats' ? 'Estatísticas' : 'Conquistas'}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="px-4 pb-6 space-y-3">
        {tab === 'info' && (
          <>
            {currentUser.bio ? (
              <div className="bg-surface-secondary rounded-2xl p-4 border border-surface-border">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Sobre mim</p>
                <p className="text-sm text-white/70 leading-relaxed">{currentUser.bio}</p>
              </div>
            ) : (
              <button onClick={openEdit}
                className="w-full bg-surface-secondary rounded-2xl p-4 border border-dashed border-surface-border text-center hover:border-coral/30 transition-all">
                <p className="text-sm text-white/30">+ Adicionar bio</p>
              </button>
            )}

            {interests.length > 0 && (
              <div className="bg-surface-secondary rounded-2xl p-4 border border-surface-border">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Interesses</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <span key={i} className="text-xs bg-coral/10 border border-coral/20 text-coral/80 px-2.5 py-1 rounded-full">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {[
              { label: 'Intenção', value: currentUser.intention ?? 'Não definido' },
              { label: 'Faixa de idade buscada', value: `${currentUser.minAge ?? 18}–${currentUser.maxAge ?? 30} anos` },
              { label: 'Distância máxima', value: `${currentUser.maxDistance ?? 35} km` },
              { label: 'Turno', value: currentUser.shift ?? 'Não definido' },
            ].map(item => (
              <button key={item.label} onClick={openEdit}
                className="w-full bg-surface-secondary rounded-2xl p-4 border border-surface-border flex items-center justify-between hover:border-coral/20 transition-all">
                <div className="text-left">
                  <p className="text-xs text-white/40">{item.label}</p>
                  <p className="text-sm text-white/70 font-medium mt-0.5">{item.value}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </button>
            ))}
          </>
        )}

        {tab === 'stats' && (
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Likes dados',  value: userStats?.likesGiven      ?? 0, emoji: '❤️' },
              { label: 'Passes',       value: userStats?.passesGiven     ?? 0, emoji: '👋' },
              { label: 'Matches',      value: userStats?.matchCount      ?? 0, emoji: '🎉' },
              { label: 'Mensagens',    value: userStats?.messagesSent    ?? 0, emoji: '💬' },
              { label: 'Study Dates',  value: userStats?.studyDatesGiven ?? 0, emoji: '📚' },
              { label: 'Boosts',       value: userStats?.boostsUsed      ?? 0, emoji: '🚀' },
            ].map(s => (
              <div key={s.label} className="bg-surface-secondary rounded-2xl p-4 border border-surface-border text-center">
                <p className="text-2xl mb-1">{s.emoji}</p>
                <p className="font-display font-black text-2xl text-coral">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'conquistas' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'first_like',  title: 'Primeiro Crush', icon: '💘', unlocked: (userStats?.likesGiven      ?? 0) >= 1 },
              { id: 'first_match', title: 'É um Match!',    icon: '🎉', unlocked: (userStats?.matchCount      ?? 0) >= 1 },
              { id: 'first_msg',   title: 'Quebra-gelo',    icon: '💬', unlocked: (userStats?.messagesSent    ?? 0) >= 1 },
              { id: 'five_matches',title: 'Popular',        icon: '⭐', unlocked: (userStats?.matchCount      ?? 0) >= 5 },
              { id: 'ten_likes',   title: '10 Likes',       icon: '❤️', unlocked: (userStats?.likesGiven      ?? 0) >= 10 },
              { id: 'boost',       title: 'No Holofote',    icon: '🚀', unlocked: (userStats?.boostsUsed      ?? 0) >= 1 },
              { id: 'study_date',  title: 'Study Date',     icon: '☕', unlocked: (userStats?.studyDatesGiven ?? 0) >= 1 },
              { id: 'verified',    title: 'Verificado',     icon: '✅', unlocked: currentUser.verified },
              { id: 'event',       title: 'Universitário',  icon: '🎓', unlocked: (userStats?.eventsAttended  ?? 0) >= 1 },
            ].map(a => (
              <div key={a.id}
                className={`rounded-2xl p-3 text-center border transition-all
                  ${a.unlocked ? 'bg-coral/10 border-coral/30' : 'bg-surface-secondary border-surface-border opacity-40'}`}>
                <p className="text-2xl mb-1">{a.icon}</p>
                <p className="text-[10px] text-white/60 font-medium leading-tight">{a.title}</p>
                {a.unlocked && <Star className="w-2.5 h-2.5 text-coral mx-auto mt-1" />}
              </div>
            ))}
          </div>
        )}

        <button onClick={handleLogout}
          className="w-full mt-4 py-3.5 rounded-2xl bg-surface-secondary border border-surface-border
            text-white/40 font-medium text-sm flex items-center justify-center gap-2 hover:border-red-400/30 hover:text-red-400 transition-all">
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface rounded-t-3xl lg:rounded-3xl border border-surface-border shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border shrink-0">
              <h3 className="font-display font-bold text-white text-lg">Editar Perfil</h3>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">BIO</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-input border border-surface-border text-white
                    placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none resize-none text-sm"
                />
                <p className="text-right text-xs text-white/30 mt-1">{editBio.length}/500</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
                  INTERESSES <span className="text-white/20 normal-case font-normal">({editInterests.length}/10)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map(i => {
                    const label = i.split(' ').slice(1).join(' ');
                    const sel = editInterests.includes(label);
                    return (
                      <button key={i} type="button" onClick={() => toggleInterest(i)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                          ${sel ? 'border-coral bg-coral/15 text-coral' : 'border-surface-border bg-surface-secondary text-white/50 hover:border-purple/40'}`}>
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-surface-border shrink-0">
              <button onClick={saveEdit} disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-gradient-brand text-white font-display font-bold
                  shadow-glow-coral hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface rounded-t-3xl lg:rounded-3xl border border-surface-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <h3 className="font-display font-bold text-white text-lg">Configurações</h3>
              <button onClick={() => setSettingsOpen(false)} className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { emoji: '🔔', label: 'Notificações de match',    key: 'notifMatch',   val: currentUser.notifMatch },
                { emoji: '💬', label: 'Notificações de mensagem', key: 'notifMessage', val: currentUser.notifMessage },
                { emoji: '⭐', label: 'Notificações de curtida',  key: 'notifLike',    val: currentUser.notifLike },
              ].map(({ emoji, label, key, val }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-surface-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-sm text-white/80 font-medium">{label}</span>
                  </div>
                  <button
                    onClick={() => updateProfile({ [key]: !val } as any)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${val ? 'bg-coral' : 'bg-surface-border'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button onClick={handleLogout}
                className="w-full mt-2 py-3.5 rounded-2xl bg-surface-secondary border border-surface-border
                  text-red-400 font-medium text-sm flex items-center justify-center gap-2 hover:border-red-400/30 transition-all">
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
