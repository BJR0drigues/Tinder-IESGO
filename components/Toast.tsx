import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-slate-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-white" />,
    error: <AlertCircle className="w-5 h-5 text-white" />,
    info: <div className="w-5 h-5 rounded-full border-2 border-white/30" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-20 left-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 text-white ${variants[type]}`}
    >
      {icons[type]}
      <span className="flex-1 font-medium text-sm">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;