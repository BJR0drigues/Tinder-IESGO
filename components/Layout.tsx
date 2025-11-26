
import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, User, Zap, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, matches, theme, toggleTheme } = useApp();
  const location = useLocation();

  if (!currentUser) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path;

  const totalUnread = matches.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-100 dark:border-slate-800 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-20 shrink-0 border-b border-slate-50 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14">
            <Logo className="w-full h-full" />
          </div>
          <div className="flex flex-col leading-none justify-center">
            <span className="font-display font-extrabold text-xl text-brand-500 tracking-tight">TINDER</span>
            <span className="font-display font-bold text-xs text-iesgo-blue dark:text-blue-400 tracking-[0.2em] -mt-0.5 ml-0.5">IESGO</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden relative bg-paper">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="h-20 bg-white border-t border-slate-50 flex items-center justify-around px-4 z-20 shrink-0 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <Link to="/feed" className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all w-16 ${isActive('/feed') ? 'text-brand-500' : 'text-slate-300 hover:text-slate-400'}`}>
          <Zap className={`w-7 h-7 ${isActive('/feed') ? 'fill-current' : ''}`} strokeWidth={isActive('/feed') ? 2.5 : 2} />
        </Link>

        <Link to="/matches" className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all w-16 relative ${isActive('/matches') ? 'text-brand-500' : 'text-slate-300 hover:text-slate-400'}`}>
          <div className="relative">
            <MessageCircle className={`w-7 h-7 ${isActive('/matches') ? 'fill-current' : ''}`} strokeWidth={isActive('/matches') ? 2.5 : 2} />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-iesgo-blue text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {totalUnread}
              </span>
            )}
          </div>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all w-16 ${isActive('/profile') ? 'text-brand-500' : 'text-slate-300 hover:text-slate-400'}`}>
          <User className={`w-7 h-7 ${isActive('/profile') ? 'fill-current' : ''}`} strokeWidth={isActive('/profile') ? 2.5 : 2} />
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
