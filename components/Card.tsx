import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Heart, GraduationCap, Info, Check, Coffee, Zap, Flame, Sun, Moon, BookOpen } from 'lucide-react';
import { User, Intention } from '../types';
import { useApp } from '../context/AppContext';

interface CardProps {
  user: User;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
  index: number;
}

const getIntentionIcon = (intention: Intention) => {
  switch (intention) {
    case 'Study Date': return <Coffee className="w-3.5 h-3.5" />;
    case 'Barzinho': return <Zap className="w-3.5 h-3.5" />;
    case 'Match': return <Flame className="w-3.5 h-3.5" />;
    default: return <Heart className="w-3.5 h-3.5" />;
  }
};

const getShiftIcon = (shift: string) => {
  return shift === 'Noturno' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />;
};

const Card: React.FC<CardProps> = ({ user, onSwipe, index }) => {
  const { calculateCompatibility } = useApp();
  const [showInfo, setShowInfo] = useState(false);

  const compatibility = useMemo(() => calculateCompatibility(user), [calculateCompatibility, user]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    } else if (info.offset.y < -100) {
      onSwipe('up');
    }
  };

  const isDraggable = index === 1;

  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden cursor-grab active:cursor-grabbing border border-slate-100"
      drag={isDraggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.1, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ zIndex: index }}
    >
      <div className="relative h-full flex flex-col font-sans">
        {/* Image Section */}
        <div className="flex-1 relative bg-slate-200">
          <img
            src={user.photos[0]}
            alt={user.name}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-iesgo-dark/95 via-iesgo-dark/20 to-transparent" />

          {/* Compatibility Badge (Top Left) */}
          <div className="absolute top-4 left-4">
            <div className="bg-iesgo-blue backdrop-blur-md pl-2 pr-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
              <span className="text-white font-display font-extrabold text-sm">{compatibility.score}%</span>
              <span className="text-blue-100 text-[10px] font-bold uppercase tracking-wide border-l border-blue-400 pl-2">{compatibility.label}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 p-6 w-full text-white pb-32">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl font-display font-bold tracking-tight shadow-black drop-shadow-md">{user.name}, {user.age}</h2>
              {user.verified && <Check className="w-5 h-5 bg-blue-500 rounded-full p-0.5" />}
            </div>

            {/* Course & Semester */}
            <div className="flex items-center gap-2 mb-3 text-blue-100">
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium text-lg tracking-wide">{user.course}</span>
              <span className="text-sm opacity-70 bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold uppercase">{user.semester}º Sem</span>
            </div>

            {/* Status Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-brand-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-brand-500/30 uppercase tracking-wide">
                {getIntentionIcon(user.intention)}
                {user.intention}
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wide">
                {getShiftIcon(user.shift)}
                {user.shift}
              </div>
            </div>

            {!showInfo && (
              <p className="line-clamp-2 text-sm text-blue-50 leading-relaxed font-normal opacity-90 border-l-2 border-brand-500 pl-3">
                {user.bio}
              </p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
            className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/40 pointer-events-auto transition-colors border border-white/10"
            aria-label="Ver mais informações"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Expanded Info */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 bg-white z-20 overflow-y-auto"
            >
              <div className="relative h-72 shrink-0">
                <img src={user.photos[0]} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur text-white rounded-full hover:bg-black/60 transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 -mt-12 relative pb-32">
                <div className="bg-white rounded-2xl p-5 shadow-lg mb-6">
                  <div className="mb-2">
                    <h2 className="text-2xl font-display font-bold text-slate-900">{user.name}, {user.age}</h2>
                    <p className="text-brand-500 font-semibold">{user.course}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Turno</span>
                      <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                        {getShiftIcon(user.shift)} {user.shift}
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Intenção</span>
                      <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                        {getIntentionIcon(user.intention)} {user.intention}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 px-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sobre</h3>
                    <p className="text-slate-600 leading-relaxed text-base">"{user.bio}"</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {user.photos.slice(1).map((photo, i) => (
                      <img key={i} src={photo} className="w-full rounded-2xl shadow-sm" alt="" loading="lazy" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 w-full flex justify-center items-center gap-5 z-10 pointer-events-auto">
        {/* Pass */}
        <button
          onClick={() => onSwipe('left')}
          className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 active:scale-90"
          aria-label="Passar"
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </button>

        {/* Study Date (Super Action) */}
        <button
          onClick={() => onSwipe('up')}
          className="w-16 h-16 bg-iesgo-blue rounded-full shadow-2xl shadow-blue-900/40 flex flex-col items-center justify-center text-white hover:scale-110 transition-transform border-4 border-white active:scale-95"
          aria-label="Study Date"
        >
          <BookOpen className="w-6 h-6 mb-0.5" strokeWidth={2.5} />
          <span className="text-[9px] font-extrabold uppercase tracking-tight">Study?</span>
        </button>

        {/* Like */}
        <button
          onClick={() => onSwipe('right')}
          className="w-14 h-14 bg-coral-gradient rounded-full shadow-xl shadow-brand-500/30 flex items-center justify-center text-white hover:brightness-110 transition-all border border-white active:scale-90"
          aria-label="Curtir"
        >
          <Heart className="w-7 h-7 fill-white" strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(Card);