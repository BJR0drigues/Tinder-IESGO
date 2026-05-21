'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Phone, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'contact' | 'otp'>('contact');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [devCode, setDevCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOTP = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact, type: contactType }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Erro ao enviar código.'); return; }
      if (json.devCode) setDevCode(json.devCode);
      setStep('otp');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact, code: otp }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Código inválido.'); return; }

      if (json.isNewUser) {
        router.push('/register');
        return;
      }

      const loginRes = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact, contactType }),
      });
      if (!loginRes.ok) {
        const loginJson = await loginRes.json();
        setError(loginJson.error ?? 'Erro ao fazer login.');
        return;
      }
      router.refresh();
      router.push('/feed');
    } finally { setLoading(false); }
  };

  const handleDigit = (i: number, val: string) => {
    const digits = otp.split('');
    digits[i] = val.replace(/\D/g, '').slice(-1);
    setOtp(digits.join(''));
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col lg:flex-row">
      {/* Desktop left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden bg-gradient-brand flex-col items-center justify-center gap-8 px-12">
        {[500, 350, 650].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-white/[0.06] pointer-events-none"
            style={{ width: s, height: s }} />
        ))}
        <div className="relative w-52 h-52 z-10">
          <Image src="/Logo.png" alt="Tinder IESGO" fill
            className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]" />
        </div>
        <div className="text-center z-10">
          <p className="text-white/80 text-xl font-semibold leading-relaxed">
            Bem-vindo de volta!<br />Seu match te espera.
          </p>
          <p className="text-white/40 text-sm mt-3">IESGO · Formosa, GO</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-deep lg:bg-surface">
      <div className="w-full max-w-sm lg:max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 w-24 h-24 relative">
            <Image src="/Logo.png" alt="Tinder IESGO" fill className="object-contain drop-shadow-[0_0_16px_rgba(240,112,112,0.5)]" />
          </div>
          <p className="text-white/40 text-sm mt-1">Bem-vindo de volta!</p>
        </div>

        {step === 'contact' && (
          <div className="space-y-5 animate-fade-in">
            {/* Toggle */}
            <div className="flex gap-2">
              {(['email', 'phone'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => { setContactType(t); setContact(''); }}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm border transition-all
                    ${contactType === t
                      ? 'bg-coral/15 border-coral text-coral'
                      : 'bg-surface-secondary border-surface-border text-white/40'}`}
                >
                  {t === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  {t === 'email' ? 'E-mail' : 'Celular'}
                </button>
              ))}
            </div>

            <input
              type={contactType === 'email' ? 'email' : 'tel'}
              placeholder={contactType === 'email' ? 'seu@email.com' : '(62) 9 0000-0000'}
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-surface-input border border-surface-border
                text-white placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20
                outline-none font-medium transition-all"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={sendOTP}
              disabled={!contact.trim() || loading}
              className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-display font-bold
                shadow-glow-coral hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Enviar código</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-sm text-white/30">
              Não tem conta?{' '}
              <button onClick={() => router.push('/register')} className="text-coral hover:underline font-medium">
                Criar conta
              </button>
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setStep('contact')} className="flex items-center gap-2 text-white/40 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="text-center">
              <p className="text-white/60 text-sm">Código enviado para</p>
              <p className="text-white font-medium">{contact}</p>
            </div>

            {devCode && (
              <div className="flex flex-col items-center gap-1 px-4 py-4 rounded-2xl bg-coral/10 border border-coral/30 text-center">
                <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">Seu código de acesso</p>
                <p className="text-coral font-display font-black text-4xl tracking-[0.3em]">{devCode}</p>
                <p className="text-xs text-white/30 mt-1">Digite os 6 dígitos abaixo</p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <input key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1}
                  value={otp[i] ?? ''}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus(); }}
                  className={`w-12 h-14 text-center text-2xl font-display font-bold rounded-xl border
                    bg-surface-input outline-none transition-all
                    ${otp[i] ? 'border-coral text-coral' : 'border-surface-border text-white/20'}
                    focus:border-coral`}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={verify}
              disabled={otp.length < 6 || loading}
              className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-display font-bold
                shadow-glow-coral hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : 'Entrar'}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
