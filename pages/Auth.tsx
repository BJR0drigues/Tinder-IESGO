import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, Moon, Sun } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';

const Auth: React.FC = () => {
  const { login, loading, theme, toggleTheme } = useApp();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'welcome' | 'email' | 'verification'>('welcome');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      if (email.includes('@') && email.includes('.')) {
        setStep('verification');
      } else {
        alert('Por favor, insira um e-mail válido.');
      }
    } else {
      login(email);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between p-8 bg-iesgo-blue dark:bg-slate-950 text-center relative overflow-hidden font-sans transition-colors duration-500">

      {/* Theme Toggle (Absolute Top Right) */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Orbit Watermark Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />

      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="mb-8 relative w-40 h-40">
          <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full"></div>
          <Logo className="w-full h-full drop-shadow-2xl" />
        </div>

        <h1 className="text-5xl font-display font-black text-white mb-2 tracking-tight">
          <span className="text-brand-500">TINDER</span> IESGO
        </h1>
        <p className="text-blue-200 font-medium text-lg max-w-[250px] leading-relaxed">
          O seu match está na sala ao lado.
        </p>
      </div>

      {/* Bottom Section (Card) */}
      <div className="w-full max-w-xs mx-auto z-10">
        {step === 'welcome' && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-left flex items-start gap-3 border border-white/10">
              <ShieldCheck className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Comunidade Segura</h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">Conexões exclusivas com universitários e alumni. Ambiente verificado.</p>
              </div>
            </div>

            <Button fullWidth onClick={() => setStep('email')} variant="primary" className="bg-white text-iesgo-blue hover:bg-blue-50 border-none shadow-xl">
              Entrar agora
            </Button>

            <p className="text-xs text-white/40 mt-4 font-medium">Ao entrar, você concorda com nossos Termos.</p>
          </div>
        )}

        {step !== 'welcome' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleLogin} className="space-y-5">
              {step === 'email' ? (
                <div className="text-left">
                  <h3 className="font-display font-bold text-slate-800 dark:text-white text-lg mb-1">Qual seu e-mail?</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-sm mb-4">Use seu e-mail pessoal ou institucional.</p>
                  <input
                    type="email"
                    required
                    placeholder="ex: nome@gmail.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:text-white outline-none transition-all font-medium text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-left">
                  <h3 className="font-display font-bold text-slate-800 dark:text-white text-lg mb-1">Código enviado</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-sm mb-4">Verifique sua caixa de entrada em {email}</p>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center tracking-[0.5em] text-2xl font-display font-bold text-iesgo-blue dark:text-blue-400 outline-none focus:border-brand-500 dark:focus:border-brand-500"
                    placeholder="• • • • • •"
                    defaultValue="123456"
                    autoFocus
                  />
                </div>
              )}

              <Button fullWidth type="submit" disabled={loading} className="w-full shadow-lg">
                {loading ? 'Validando...' : (step === 'email' ? 'Continuar' : 'Acessar Campus')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wide"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 text-[10px] text-white/20 font-medium">
        Tinder IESGO 2025
      </div>
    </div>
  );
};

export default Auth;
