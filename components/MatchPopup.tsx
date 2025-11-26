import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Coffee, MessageCircle } from 'lucide-react';
import { User } from '../types';
import Button from './Button';

interface MatchPopupProps {
    popupData: { user: User; type: string } | null;
    onClose: () => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ popupData, onClose }) => {
    const navigate = useNavigate();

    const handleSendMessage = () => {
        onClose();
        navigate('/matches');
    };

    return (
        <AnimatePresence>
            {popupData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-brand-gradient flex flex-col items-center justify-center p-8 text-center overflow-hidden"
                >
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative z-10 w-full"
                    >
                        {popupData.type === 'study' ? (
                            <div className="mb-6 inline-flex flex-col items-center">
                                <div className="bg-white/20 p-4 rounded-full mb-2 backdrop-blur-md">
                                    <BookOpen className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-display font-black text-white italic tracking-tight uppercase drop-shadow-md">Study Match!</h1>
                            </div>
                        ) : (
                            <h1 className="text-5xl font-display font-black text-white italic tracking-tighter uppercase drop-shadow-lg mb-8">It's a Match</h1>
                        )}

                        <p className="text-white/90 text-lg font-medium mb-10">
                            {popupData.type === 'study' ? `Bora estudar com ${popupData.user.name}?` : `Você e ${popupData.user.name} se curtiram.`}
                        </p>

                        <div className="flex gap-0 mb-12 items-center justify-center relative h-32">
                            {/* Orbit Path */}
                            <svg className="absolute w-[200px] h-[60px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible z-0 pointer-events-none">
                                <path d="M0,30 Q100,-20 200,30" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.5" />
                            </svg>

                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-2xl relative z-10 -mr-4"
                            >
                                <img src="https://picsum.photos/200" className="w-full h-full object-cover" />
                            </motion.div>

                            <div className="z-20 bg-white p-2 rounded-full shadow-xl">
                                {popupData.type === 'study' ? (
                                    <Coffee className="w-6 h-6 text-iesgo-blue" />
                                ) : (
                                    <Heart className="w-6 h-6 text-brand-500 fill-brand-500" />
                                )}
                            </div>

                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-2xl relative z-10 -ml-4"
                            >
                                <img src={popupData.user.photos[0]} className="w-full h-full object-cover" />
                            </motion.div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                fullWidth
                                onClick={handleSendMessage}
                                className="bg-white bg-none text-brand-600 hover:bg-white/90 shadow-xl border-none font-bold"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Mandar um "Oi"
                            </Button>
                            <Button
                                fullWidth
                                variant="ghost"
                                onClick={onClose}
                                className="text-white hover:bg-white/10"
                            >
                                Continuar vendo perfis
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MatchPopup;