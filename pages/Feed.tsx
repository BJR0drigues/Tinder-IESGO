import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, GraduationCap, RefreshCw } from 'lucide-react';
import { User } from '../types';
import Card from '../components/Card';
import FilterModal from '../components/FilterModal';
import MatchPopup from '../components/MatchPopup';

const Feed: React.FC = () => {
  const { potentialMatches, swipe, activeFilters, activeCourseFilters } = useApp();
  const [matchPopup, setMatchPopup] = useState<{ user: User, type: string } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleClosePopup = useCallback(() => setMatchPopup(null), []);
  const handleOpenFilters = useCallback(() => setIsFilterOpen(true), []);
  const handleCloseFilters = useCallback(() => setIsFilterOpen(false), []);

  return (
    <div className="h-full w-full relative p-4 bg-paper flex flex-col overflow-hidden font-sans">
      {/* Filter Button */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button
          onClick={handleOpenFilters}
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

      <FilterModal isOpen={isFilterOpen} onClose={handleCloseFilters} />
      <MatchPopup popupData={matchPopup} onClose={handleClosePopup} />

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
                  onClick={handleOpenFilters}
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
    </div>
  );
};

export default Feed;