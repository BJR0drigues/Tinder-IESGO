import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, GraduationCap, RefreshCw, Rocket } from 'lucide-react';
import { User } from '../types';
import Card from '../components/Card';
import FilterModal from '../components/FilterModal';
import MatchPopup from '../components/MatchPopup';

const Feed: React.FC = () => {
  const { potentialMatches, swipe, activeFilters, activeCourseFilters, boostState, useBoost } = useApp();
  const [matchPopup, setMatchPopup] = useState<{ user: User, type: string } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [boostToast, setBoostToast] = useState<string | null>(null);

  const totalFilters = activeFilters.length + activeCourseFilters.length;

  const handleSwipe = useCallback(async (dir: 'left' | 'right' | 'up') => {
    if (potentialMatches.length === 0) return;
    const target = potentialMatches[0];

    let action: 'like' | 'pass' | 'study' = 'pass';
    if (dir === 'right') action = 'like';
    if (dir === 'up') action = 'study';

    const isMatch = await swipe(target.id, action);
    if (isMatch) {
      setMatchPopup({ user: target, type: action });
    }
  }, [potentialMatches, swipe]);

  const handleBoost = useCallback(() => {
    if (boostState.active) {
      setBoostToast('Boost já está ativo! Seu perfil está em destaque. 🚀');
    } else {
      const success = useBoost();
      if (success) {
        setBoostToast('Boost ativado por 30 minutos! Mais pessoas vão ver seu perfil. 🚀');
      } else {
        const remaining = boostState.usedAt
          ? Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - boostState.usedAt)) / (60 * 60 * 1000))
          : 0;
        setBoostToast(`Boost disponível em ${remaining}h. Só um por dia!`);
      }
    }
    setTimeout(() => setBoostToast(null), 3000);
  }, [boostState, useBoost]);

  const boostAvailable = !boostState.usedAt || (Date.now() - boostState.usedAt) >= 24 * 60 * 60 * 1000;

  return (
    <div className="h-full w-full relative p-4 bg-paper flex flex-col overflow-hidden font-sans">
      {/* Filter Button */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="pointer-events-auto bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-5 py-2.5 rounded-full flex items-center gap-2 text-slate-700 text-sm font-bold hover:bg-white transition-all active:scale-95 group font-display"
          aria-label="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4 text-iesgo-blue group-hover:rotate-180 transition-transform duration-500" />
          FILTROS
          {totalFilters > 0 && (
            <span className="bg-coral-gradient text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
              {totalFilters}
            </span>
          )}
        </button>
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <MatchPopup popupData={matchPopup} onClose={() => setMatchPopup(null)} />

      {/* Cards Stack */}
      <div className="flex-1 relative mt-12 mb-4">
        <AnimatePresence>
          {potentialMatches.length > 0 ? (
            potentialMatches.slice(0, 2).reverse().map((user, index) => (
              <Card
                key={user.id}
                user={user}
                onSwipe={handleSwipe}
                index={index === 1 || potentialMatches.length === 1 ? 1 : 0}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-dashed border-slate-300 animate-spin-slow"></div>
                <GraduationCap className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-800 mb-2">Acabaram os perfis!</h3>
              <p className="font-medium text-slate-500 mb-8 max-w-[200px] leading-relaxed">
                Ninguém novo por aqui com os filtros atuais.
              </p>
              {totalFilters > 0 ? (
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="px-8 py-3 bg-iesgo-blue text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/10"
                >
                  Limpar Filtros
                </button>
              ) : (
                <button className="flex items-center gap-2 text-brand-500 font-bold text-sm uppercase tracking-wide opacity-50 cursor-default">
                  <RefreshCw className="w-4 h-4" />
                  Volte mais tarde
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Boost Button */}
      <div className="flex justify-center pb-2">
        <button
          onClick={handleBoost}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 shadow-lg ${
            boostState.active
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-purple-500/30 animate-pulse'
              : boostAvailable
              ? 'bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-brand-500/30 hover:shadow-brand-500/50'
              : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          <Rocket className="w-4 h-4" />
          {boostState.active ? 'Boost Ativo 🔥' : boostAvailable ? 'Boost de Perfil' : 'Boost (aguardando)'}
        </button>
      </div>

      {/* Boost Toast */}
      <AnimatePresence>
        {boostToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-4 right-4 bg-slate-800 text-white text-sm font-medium px-4 py-3 rounded-2xl text-center shadow-lg z-50"
          >
            {boostToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;
