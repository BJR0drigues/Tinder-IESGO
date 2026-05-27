'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, SlidersHorizontal, CheckCircle, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const COURSES = [
  'Agronomia', 'Medicina Veterinária', 'Biomedicina', 'Enfermagem',
  'Farmácia', 'Fisioterapia', 'Administração', 'Ciências Contábeis',
  'Bacharelado em Sistema de Informação', 'Direito', 'Psicologia',
];

interface FeedUser {
  id:            string;
  firstName:     string;
  lastName?:     string;
  dateOfBirth:   string;
  gender:        string;
  bio?:          string;
  interests:     string[];
  photos:        string[];
  course?:       string;
  semester?:     number;
  shift?:        string;
  intention?:    string;
  city?:         string;
  state?:        string;
  verified:      boolean;
  compatibility: { score: number; label: string };
}

function getAge(dob: string) {
  const d = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// ── Card de perfil ─────────────────────────────────────────────────
function ProfileCard({
  user, onSwipe, isTop,
}: {
  user: FeedUser; onSwipe: (action: 'like' | 'pass' | 'study') => void; isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity  = useTransform(x, [30, 120],  [0, 1]);
  const passOpacity  = useTransform(x, [-120, -30], [1, 0]);
  const [showInfo, setShowInfo] = useState(false);
  const [imgIdx, setImgIdx]     = useState(0);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number; y: number } }) => {
    if (info.offset.x > 100)       onSwipe('like');
    else if (info.offset.x < -100) onSwipe('pass');
    else if (info.offset.y < -80)  onSwipe('study');
  }, [onSwipe]);

  const score = user.compatibility.score;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-coral' : 'text-white/50';

  const prevPhoto = () => setImgIdx(i => (i - 1 + user.photos.length) % user.photos.length);
  const nextPhoto = () => setImgIdx(i => (i + 1) % user.photos.length);

  return (
    <motion.div
      style={{ x, rotate, willChange: 'transform' }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      className="absolute inset-0 select-none"
    >
      {/* Like / Nope stamps */}
      {isTop && (
        <>
          <motion.div style={{ opacity: likeOpacity }}
            className="absolute top-10 left-6 z-30 rotate-[-15deg] px-5 py-2 rounded-2xl border-4 border-emerald-400 text-emerald-400 font-display font-black text-3xl uppercase pointer-events-none">
            LIKE
          </motion.div>
          <motion.div style={{ opacity: passOpacity }}
            className="absolute top-10 right-6 z-30 rotate-[15deg] px-5 py-2 rounded-2xl border-4 border-coral text-coral font-display font-black text-3xl uppercase pointer-events-none">
            NOPE
          </motion.div>
        </>
      )}

      {/* Card — full height photo background */}
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative">

        {/* ── Full-background photo ── */}
        {user.photos.length > 0 ? (
          <img src={user.photos[imgIdx]} alt={user.firstName}
            className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-gradient-full flex items-center justify-center text-8xl">👤</div>
        )}

        {/* Left / Right tap zones for photo navigation */}
        {user.photos.length > 1 && (
          <>
            <div onPointerDown={(e) => { e.stopPropagation(); prevPhoto(); }} onClick={(e) => e.stopPropagation()} className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer" aria-label="Foto anterior" />
            <div onPointerDown={(e) => { e.stopPropagation(); nextPhoto(); }} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer" aria-label="Próxima foto" />
          </>
        )}

        {/* Photo dots — top */}
        {user.photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
            {user.photos.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === imgIdx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        )}

        {/* Compatibility badge — top right */}
        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
          <span className={`font-display font-black text-sm ${scoreColor}`}>{score}%</span>
          <span className="text-[10px] text-white/60">{user.compatibility.label}</span>
        </div>

        {/* Strong bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-16">
          {/* Name row */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <h3 className="font-display font-black text-2xl text-white drop-shadow-lg">
                {user.firstName}{user.lastName ? ` ${user.lastName.charAt(0)}.` : ''}, {getAge(user.dateOfBirth)}
                {user.verified && <CheckCircle className="inline w-4 h-4 text-coral ml-1.5 mb-0.5" />}
              </h3>
              {user.course && (
                <p className="text-sm text-white/70">
                  🎓 {user.course}{user.semester ? ` · ${user.semester}º sem` : ''}
                </p>
              )}
              {user.city && (
                <p className="text-xs text-white/50 mt-0.5">📍 {user.city}, GO</p>
              )}
            </div>
            <button onClick={() => setShowInfo(!showInfo)}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Interests chips */}
          {user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {user.interests.slice(0, 4).map(interest => (
                <span key={interest}
                  className="text-xs bg-white/15 backdrop-blur-sm border border-white/20 text-white px-2.5 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons — overlaid inside card */}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => onSwipe('pass')}
              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border-2 border-coral/60 flex items-center justify-center
                hover:bg-coral/20 hover:border-coral active:scale-95 transition-all shadow-lg"
            >
              <X className="w-6 h-6 text-coral" />
            </button>
            <button
              onClick={() => onSwipe('study')}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border-2 border-yellow-400/60 flex items-center justify-center
                hover:bg-yellow-400/20 hover:border-yellow-400 active:scale-95 transition-all shadow-lg"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>
            <button
              onClick={() => onSwipe('like')}
              className="w-14 h-14 rounded-full bg-gradient-brand border-2 border-transparent flex items-center justify-center
                hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(240,112,112,0.5)]"
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </button>
          </div>
        </div>

        {/* Info panel (slide up) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 22 }}
              className="absolute inset-0 bg-surface-secondary/98 backdrop-blur-xl rounded-3xl p-5 overflow-y-auto no-scrollbar z-30"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg text-white">
                  {user.firstName}, {getAge(user.dateOfBirth)}
                </h3>
                <button onClick={() => setShowInfo(false)}
                  className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              {user.bio && <p className="text-sm text-white/70 leading-relaxed mb-4">{user.bio}</p>}
              {user.interests.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Interesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interests.map(i => (
                      <span key={i} className="text-xs bg-coral/10 border border-coral/20 text-coral/80 px-2.5 py-1 rounded-full">{i}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {user.intention && <p className="text-sm text-white/60">💫 {user.intention}</p>}
                {user.shift     && <p className="text-sm text-white/60">🕐 Turno {user.shift}</p>}
                {user.city      && <p className="text-sm text-white/60">📍 {user.city}{user.state ? `, ${user.state}` : ', GO'}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Página principal ───────────────────────────────────────────────
export default function FeedPage() {
  const { swipe, currentUser } = useApp();
  const router = useRouter();
  const [users, setUsers]           = useState<FeedUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [matched, setMatched]       = useState<FeedUser | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const courseFilterRef = useRef("");
  const [courseFilter, setCourseFilter] = useState("");

  const fetchFeed = useCallback(async (reset = false, course?: string) => {
    const activeCourse = course ?? courseFilterRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reset) params.set("reset", "true");
      if (activeCourse) params.set("course", activeCourse);
      const url = `/api/users/feed${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilter = (course: string) => {
    courseFilterRef.current = course;
    setCourseFilter(course);
    setFilterOpen(false);
    fetchFeed(false, course);
  };

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);
  const handleSwipe = async (user: FeedUser, action: "like" | "pass" | "study") => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    const isMatch = await swipe(user.id, action);
    if (isMatch) setMatched(user);
  };

  const topUser = users[0];
  return (
    <div className="h-full w-full flex flex-col bg-deep lg:flex-row lg:items-center lg:justify-center">
      <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div className="relative w-24 h-8">
          <Image src="/Logo.png" alt="Tinder IESGO" fill className="object-contain" />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all
            ${courseFilter
              ? "bg-coral/15 border-coral/40 text-coral"
              : "bg-surface-secondary border-surface-border text-white/50 hover:text-white"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

      </div>
      {/* Filter modal */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center"
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-surface rounded-t-3xl lg:rounded-3xl border border-surface-border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white text-lg">Filtrar por curso</h3>
                <button onClick={() => setFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => applyFilter('')}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all
                    ${!courseFilter ? 'bg-coral/15 border-coral/40 text-coral' : 'bg-surface-secondary border-surface-border text-white/60 hover:border-white/20'}`}
                >
                  Todos os cursos
                </button>
                {COURSES.map(c => (
                  <button
                    key={c}
                    onClick={() => applyFilter(c)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all
                      ${courseFilter === c ? 'bg-coral/15 border-coral/40 text-coral' : 'bg-surface-secondary border-surface-border text-white/60 hover:border-white/20'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card stack — centered on desktop */}
      <div className="flex-1 relative mx-4 mb-4 lg:mb-0 lg:mx-0 lg:flex-none lg:w-[420px] lg:h-[calc(100%-2rem)] lg:my-4 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-secondary border border-surface-border flex items-center justify-center text-4xl">
              😔
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg">Sem mais perfis</p>
              <p className="text-sm text-white/40 mt-1">Volta mais tarde ou mude seus filtros</p>
            </div>
            <button onClick={() => fetchFeed(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-brand text-white font-bold text-sm shadow-glow-coral">
              Recarregar
            </button>
          </div>
        ) : (
          <>
            {/* Background card (next) */}
            {users[1] && (
              <div className="absolute inset-0 scale-[0.95] translate-y-3 rounded-3xl overflow-hidden bg-surface-secondary opacity-60">
                {users[1].photos[0] && (
                  <img src={users[1].photos[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            )}
            {/* Top card */}
            {topUser && (
              <AnimatePresence>
                <ProfileCard
                  key={topUser.id}
                  user={topUser}
                  isTop
                  onSwipe={action => handleSwipe(topUser, action)}
                />
              </AnimatePresence>
            )}
          </>
        )}
      </div>


      {/* Match popup */}
      <AnimatePresence>
        {matched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-deep/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
          >
            {/* Rings */}
            {[200, 280, 360].map(s => (
              <div key={s} className="absolute rounded-full border border-coral/10"
                style={{ width: s, height: s }} />
            ))}

            <div className="relative z-10 text-center">
              {/* Photos */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-coral overflow-hidden shadow-glow-coral">
                  {currentUser?.photos?.[0] ? (
                    <img src={currentUser.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-2xl">👤</div>
                  )}
                </div>
                <span className="text-3xl">💘</span>
                <div className="w-20 h-20 rounded-full border-4 border-purple overflow-hidden shadow-glow-purple">
                  {matched.photos[0] ? (
                    <img src={matched.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-2xl">👤</div>
                  )}
                </div>
              </div>

              <h2 className="font-display font-black text-3xl text-white mb-2 match-pop">É um Match! 🎉</h2>
              <p className="text-white/50 text-sm mb-8">
                Você e <span className="text-white font-semibold">{matched.firstName}</span> se curtiram!
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { setMatched(null); router.push('/matches'); }}
                  className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-display font-bold shadow-glow-coral hover:opacity-90"
                >
                  Enviar mensagem
                </button>
                <button
                  onClick={() => setMatched(null)}
                  className="w-full py-3 rounded-2xl bg-surface-secondary border border-surface-border text-white/60 font-medium"
                >
                  Continuar descobrindo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
