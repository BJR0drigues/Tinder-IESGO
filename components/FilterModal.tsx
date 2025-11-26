import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, GraduationCap, Check } from 'lucide-react';
import Button from './Button';
import { COURSES, INTERESTS } from '../types';
import { useApp } from '../context/AppContext';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const { activeFilters, toggleFilter, activeCourseFilters, toggleCourseFilter, clearFilters } = useApp();
  const [activeTab, setActiveTab] = useState<'interests' | 'courses'>('courses');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-iesgo-dark/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 h-[85%] flex flex-col shadow-2xl font-sans"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-display font-bold text-iesgo-blue tracking-tight">Filtrar Galera</h2>
              <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 gap-2 bg-slate-50 mx-6 mt-6 rounded-xl shrink-0 border border-slate-100">
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'courses' ? 'bg-white text-iesgo-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Cursos
              </button>
              <button
                onClick={() => setActiveTab('interests')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${activeTab === 'interests' ? 'bg-white text-brand-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Interesses
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'courses' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-iesgo-blue" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione os Cursos</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {COURSES.map(course => {
                      const isActive = activeCourseFilters.includes(course);
                      return (
                        <button
                          key={course}
                          onClick={() => toggleCourseFilter(course)}
                          className={`w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${isActive
                              ? 'bg-blue-50 text-iesgo-blue border border-iesgo-blue shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
                            }`}
                        >
                          {course}
                          {isActive && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-brand-500" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interesses & Rolês</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => {
                      const isActive = activeFilters.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleFilter(interest)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${isActive
                              ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                            }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 shrink-0 flex gap-3 bg-white pb-safe">
              {(activeFilters.length > 0 || activeCourseFilters.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} className="flex-1">
                  Limpar
                </Button>
              )}
              <Button fullWidth onClick={onClose} className="flex-[2]">
                Ver Resultados
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterModal;