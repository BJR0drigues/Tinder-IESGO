'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Flame, Heart, User, Calendar } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';

const NAV = [
  { href: '/feed',    icon: Flame,    label: 'Descobrir' },
  { href: '/matches', icon: Heart,    label: 'Matches'   },
  { href: '/events',  icon: Calendar, label: 'Eventos'   },
  { href: '/profile', icon: User,     label: 'Perfil'    },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppProvider>
      <div className="h-screen bg-deep flex flex-col overflow-hidden">

        {/* ── Desktop top nav ─────────────────────────────── */}
        <header className="hidden lg:flex items-center justify-between px-8 h-16 shrink-0 border-b border-surface-border bg-surface/90 backdrop-blur-xl z-20">
          <div className="relative w-28 h-10">
            <Image src="/Logo.png" alt="Tinder IESGO" fill className="object-contain" />
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all
                    ${active
                      ? 'bg-coral/15 text-coral shadow-[0_0_12px_rgba(240,112,112,0.2)]'
                      : 'text-white/40 hover:text-white hover:bg-surface-secondary'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-coral ml-0.5" />}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* ── Content ─────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden relative">

          {/* Mobile — phone frame */}
          <div className="lg:hidden flex items-center justify-center h-full bg-deep">
            <div className="w-full max-w-sm h-full max-h-[812px] bg-surface rounded-none sm:rounded-[40px] relative overflow-hidden flex flex-col shadow-2xl sm:border sm:border-surface-border">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-coral/5 rounded-full blur-3xl pointer-events-none z-0" />
              <div className="absolute bottom-0 right-0 w-60 h-40 bg-purple/5 rounded-full blur-3xl pointer-events-none z-0" />
              <div className="flex-1 overflow-hidden relative">
                {children}
              </div>
              {/* Mobile bottom nav */}
              <nav className="relative z-10 flex items-center justify-around px-2 py-3 border-t border-surface-border bg-surface/80 backdrop-blur-xl shrink-0">
                {NAV.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href}
                      className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all group"
                    >
                      <div className={`relative p-2 rounded-xl transition-all
                        ${active ? 'bg-coral/15 shadow-[0_0_12px_rgba(240,112,112,0.3)]' : 'group-hover:bg-surface-secondary'}`}>
                        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-coral' : 'text-white/40 group-hover:text-white/70'}`} />
                        {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-coral" />}
                      </div>
                      <span className={`text-[10px] font-semibold tracking-wide transition-colors
                        ${active ? 'text-coral' : 'text-white/30 group-hover:text-white/50'}`}>
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Desktop — full content */}
          <div className="hidden lg:flex lg:h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
