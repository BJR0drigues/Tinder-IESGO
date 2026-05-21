'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';

interface MatchPopupProps {
  popupData: { user: { id: string; firstName: string; photos: string[] }; type: string } | null;
  onClose:   () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ popupData, onClose }) => {
  const router = useRouter();

  const handleSendMessage = () => {
    onClose();
    router.push('/matches');
  };

  return (
    <AnimatePresence>
      {popupData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-deep/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
        >
          {/* Rings */}
          {[200, 300, 400].map(s => (
            <div key={s} className="absolute rounded-full border border-coral/10"
              style={{ width: s, height: s }} />
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 w-full"
          >
            <h1 className="text-4xl font-display font-black text-white mb-2 match-pop">
              É um Match! 🎉
            </h1>
            <p className="text-white/50 text-sm mb-8">
              Você e <span className="text-white font-semibold">{popupData.user.firstName}</span> se curtiram!
            </p>

            {/* Photos */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-coral overflow-hidden shadow-glow-coral">
                <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-2xl">👤</div>
              </div>
              <Heart className="w-8 h-8 text-coral fill-coral" />
              <div className="w-20 h-20 rounded-full border-4 border-purple overflow-hidden">
                {popupData.user.photos[0]
                  ? <img src={popupData.user.photos[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-2xl">👤</div>
                }
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSendMessage}
                className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-display font-bold flex items-center justify-center gap-2 shadow-glow-coral"
              >
                <MessageCircle className="w-5 h-5" />
                Enviar mensagem
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-surface-secondary border border-surface-border text-white/60 font-medium"
              >
                Continuar descobrindo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchPopup;
