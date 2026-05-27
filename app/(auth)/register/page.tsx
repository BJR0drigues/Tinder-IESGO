'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, Lock,
  Calendar, Heart, Search, Bell, Camera, Plus, X,
  CheckCircle, Sparkles, MapPin, ChevronDown,
} from 'lucide-react';
import { compressImage } from '@/lib/compress-image';

// ── Constantes ────────────────────────────────────────────────────
const COURSES = [
  'Administração', 'Agronomia', 'Bacharelado em Sistema de Informação',
  'Biomedicina', 'Ciências Contábeis', 'Direito', 'Enfermagem',
  'Farmácia', 'Fisioterapia', 'Medicina Veterinária', 'Pedagogia', 'Psicologia',
];

const INTERESTS_LIST = [
  { emoji: '🎮', label: 'Games' },       { emoji: '☕', label: 'Café' },
  { emoji: '🏋️', label: 'Academia' },    { emoji: '🎵', label: 'Música' },
  { emoji: '✈️', label: 'Viagens' },     { emoji: '🎬', label: 'Filmes' },
  { emoji: '📚', label: 'Leitura' },     { emoji: '🍕', label: 'Gastronomia' },
  { emoji: '🐾', label: 'Pets' },        { emoji: '⚽', label: 'Esportes' },
  { emoji: '🎨', label: 'Arte' },        { emoji: '🧘', label: 'Yoga' },
  { emoji: '🎤', label: 'Karaokê' },     { emoji: '🌿', label: 'Natureza' },
  { emoji: '💻', label: 'Tech' },        { emoji: '🎭', label: 'Teatro' },
  { emoji: '🍺', label: 'Cerveja' },     { emoji: '🎸', label: 'Rock' },
  { emoji: '🤠', label: 'Sertanejo' },   { emoji: '🕺', label: 'Dança' },
  { emoji: '📸', label: 'Fotografia' },  { emoji: '🧪', label: 'Ciências' },
  { emoji: '🎯', label: 'Jogos de Mesa' }, { emoji: '🍜', label: 'Culinária' },
  { emoji: '🚴', label: 'Ciclismo' },    { emoji: '🏊', label: 'Natação' },
  { emoji: '🎻', label: 'Clássico' },    { emoji: '🧩', label: 'RPG' },
  { emoji: '🌙', label: 'Noitadas' },    { emoji: '🏖️', label: 'Praia' },
  { emoji: '🎪', label: 'Shows' },       { emoji: '🧠', label: 'Filosofia' },
];

const GENDERS = [
  { value: 'Mulher',      label: 'Mulher',      sub: 'Feminino · she/her',   emoji: '👩' },
  { value: 'Homem',       label: 'Homem',        sub: 'Masculino · he/him',  emoji: '👨' },
  { value: 'Não-binário', label: 'Não-binário', sub: 'they/them',             emoji: '🌈' },
  { value: 'Outro',       label: 'Outro — descrever', sub: 'Campo livre',    emoji: '✏️' },
];

const LOOKING_FOR = [
  { value: 'Mulheres',             emoji: '👩' },
  { value: 'Homens',               emoji: '👨' },
  { value: 'Pessoas não-binárias', emoji: '🌈' },
  { value: 'Todos',                sub: 'Sem filtro de gênero', emoji: '🌍' },
];

const INTENTIONS = [
  { value: 'Relacionamento sério',   sub: 'Quero namorar / algo estável',          emoji: '💍' },
  { value: 'Amizades & conexões',    sub: 'Conhecer pessoas, sem pressa',           emoji: '🤝' },
  { value: 'Casual / Ver o que rola', sub: 'Sem compromisso',                       emoji: '🌊' },
  { value: 'Prefiro não dizer',      sub: 'Não exibir no perfil',                   emoji: '🤫' },
];

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// ── Tipos ─────────────────────────────────────────────────────────
interface FormData {
  // Tela 2 — Nome
  firstName:    string;
  lastName:     string;
  // Tela 3 — Contato
  contactType:  'email' | 'phone';
  contact:      string;
  // Tela 4 — OTP
  otp:          string;
  // Tela 5 — Nascimento
  dobDay:       string;
  dobMonth:     string;
  dobYear:      string;
  // Tela 6 — Gênero
  gender:       string;
  pronouns:     string;
  showGender:   boolean;
  // Tela 7 — Preferência de match
  lookingFor:   string[];
  // Tela 8 — Bio
  bio:          string;
  bioTone:      string;
  // Tela 9 — Fotos
  photos:       string[]; // base64
  // Tela 10 — Interesses
  interests:    string[];
  // Tela 11 — Intenção
  intention:    string;
  // Tela 12 — Preferências de busca
  course:       string;
  shift:        string;
  semester:     number;
  city:         string;
  state:        string;
  maxDistance:  number;
  minAge:       number;
  maxAge:       number;
  // Tela 13 — Notificações
  notifMatch:   boolean;
  notifMessage: boolean;
  notifLike:    boolean;
}

const TOTAL_STEPS = 12; // telas 1-12 (1=splash, 13=criado)

// ── Componentes auxiliares ────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  if (step < 2 || step > 13) return null;
  const pct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  return (
    <div className="w-full h-[3px] bg-surface-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-progress rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepHeader({
  step, total, onBack, showLogo = false,
}: {
  step: number; total: number; onBack?: () => void; showLogo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        disabled={!onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-secondary border border-surface-border text-white/60 hover:text-white hover:bg-surface-tertiary transition-all disabled:opacity-0"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {showLogo ? (
        <div className="relative w-20 h-10">
          <Image src="/Logo.png" alt="Tinder IESGO" fill className="object-contain animate-heartbeat" />
        </div>
      ) : (
        <span className="text-sm text-white/40 font-medium">
          {step - 1} de {total - 2}
        </span>
      )}

      <div className="w-10" />
    </div>
  );
}

function SelectCard({
  selected, onClick, children,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left
        ${selected
          ? 'border-coral bg-coral/10 text-white'
          : 'border-surface-border bg-surface-secondary text-white/70 hover:border-purple/50 hover:bg-surface-tertiary'
        }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
        ${selected ? 'border-coral bg-coral' : 'border-white/30'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      {children}
    </button>
  );
}

function InterestChip({
  emoji, label, selected, onClick,
}: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all
        ${selected
          ? 'border-coral bg-coral/15 text-coral shadow-glow-coral'
          : 'border-surface-border bg-surface-secondary text-white/60 hover:border-purple/40'
        }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function ContinueBtn({
  onClick, disabled = false, loading = false, label = 'Continuar →',
}: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-4 rounded-2xl font-display font-bold text-white text-base bg-gradient-brand
        shadow-glow-coral hover:opacity-90 active:scale-95 transition-all
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Aguarde...
        </span>
      ) : label}
    </button>
  );
}

// ── Tela 1: Splash / Welcome ──────────────────────────────────────
function Step1({ onNext, onLogin }: { onNext: () => void; onLogin: () => void }) {
  return (
    <div className="flex flex-col min-h-screen-real items-center justify-between px-6 py-10 animate-fade-in">
      {/* Orbits */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[600, 450, 800].map((size, i) => (
          <div key={i}
            className="absolute rounded-full border border-white/[0.04]"
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 gap-6">
        <div className="relative w-48 h-48">
          <Image
            src="/Logo.png"
            alt="Tinder IESGO"
            fill
            className="object-contain drop-shadow-[0_0_40px_rgba(240,112,112,0.6)] animate-heartbeat"
          />
        </div>

        <div className="text-center">
          <p className="text-white/50 text-base font-medium">
            O seu match está na sala ao lado.
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="w-full z-10 space-y-3 max-w-xs">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-gradient-brand text-white font-display font-bold text-base
            shadow-glow-coral hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Criar conta
        </button>
        <button
          onClick={onLogin}
          className="w-full py-3.5 rounded-2xl bg-surface-secondary border border-surface-border text-white/70
            font-medium text-base hover:bg-surface-tertiary transition-all"
        >
          Já tenho conta
        </button>
        <p className="text-center text-white/30 text-xs mt-2">
          Ao continuar você concorda com os{' '}
          <span className="text-white/50 underline cursor-pointer">Termos de Uso</span>
          {' '}e a{' '}
          <span className="text-white/50 underline cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}

// ── Tela 2: Nome ──────────────────────────────────────────────────
function Step2({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={2} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={2} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Como você se <span className="text-coral">chama?</span>
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Seu nome aparecerá no perfil. Pode ser seu apelido favorito!
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
              PRIMEIRO NOME
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Ex: Mariana"
                value={data.firstName}
                onChange={e => setData({ firstName: e.target.value })}
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-surface-input border border-surface-border
                  text-white placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none
                  font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
              SOBRENOME <span className="text-white/20 normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Costa"
              value={data.lastName}
              onChange={e => setData({ lastName: e.target.value })}
              className="w-full px-4 py-4 rounded-xl bg-surface-input border border-surface-border
                text-white placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none
                font-medium transition-all"
            />
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-secondary border border-surface-border">
            <span className="text-lg mt-0.5">ℹ️</span>
            <p className="text-xs text-white/40 leading-relaxed">
              Seu sobrenome não é exibido publicamente — apenas o primeiro nome aparece para outros usuários.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">
              🎓 SEU CURSO
            </label>
            <div className="relative">
              <select
                value={data.course}
                onChange={e => setData({ course: e.target.value })}
                className="w-full px-4 py-4 rounded-xl bg-surface-input border border-surface-border
                  text-white appearance-none focus:border-coral outline-none cursor-pointer"
              >
                <option value="">Selecione seu curso</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={!data.firstName.trim()} />
    </div>
  );
}

// ── Tela 3: Contato ───────────────────────────────────────────────
function Step3({
  data, setData, onNext, onBack, loading, error,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void;
  onBack: () => void; loading: boolean; error: string;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={3} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={3} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Qual o seu <span className="text-coral">e-mail?</span>
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Usaremos para verificar sua conta e enviar notificações importantes.
        </p>

        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block">
            E-MAIL
          </label>
          <div className="relative flex">
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={data.contact}
              onChange={e => setData({ contact: e.target.value })}
              className="flex-1 px-4 py-4 rounded-xl bg-surface-input border border-surface-border text-white
                placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none
                font-medium transition-all"
            />
          </div>
          <p className="text-xs text-white/30 flex items-center gap-1.5">
            🔒 Seu e-mail nunca é compartilhado. Usado apenas para verificação de identidade.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={!data.contact.trim()} loading={loading} label="Enviar código →" />
    </div>
  );
}

// ── Tela 4: OTP ───────────────────────────────────────────────────
function Step4({
  data, setData, onNext, onBack, loading, error, devCode,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void;
  onBack: () => void; loading: boolean; error: string; devCode?: string;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (i: number, val: string) => {
    const digits = data.otp.split('');
    digits[i] = val.replace(/\D/g, '').slice(-1);
    setData({ otp: digits.join('') });
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={4} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={4} />
      <div className="flex-1 mt-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6 text-4xl shadow-glow-coral">
          🔑
        </div>
        <h2 className="font-display font-extrabold text-3xl text-white text-center mb-2">
          Código de <span className="text-coral">verificação</span>
        </h2>
        <p className="text-white/40 text-sm text-center mb-2">
          Enviamos um código para{' '}
          <span className="text-white/70 font-medium">
            {data.contactType === 'phone'
              ? `(62) 9 ${data.contact.slice(-4).padStart(4, '*')}`
              : data.contact.replace(/(.{2}).+(@.+)/, '$1****$2')}
          </span>
        </p>
        <p className="text-white/30 text-xs mb-4">Insira os 6 dígitos.</p>

        {devCode && (
          <div className="flex flex-col items-center gap-1 px-4 py-4 rounded-2xl bg-coral/10 border border-coral/30 mb-4 w-full text-center">
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">Seu código de acesso</p>
            <p className="text-coral font-display font-black text-4xl tracking-[0.3em]">{devCode}</p>
            <p className="text-xs text-white/30">Digite os 6 dígitos abaixo</p>
          </div>
        )}

        {/* Digit boxes */}
        <div className="flex gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data.otp[i] ?? ''}
              onChange={e => handleDigit(i, e.target.value)}
              onPaste={e => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
                if (pasted) {
                  const newOtp = (data.otp.slice(0, i) + pasted).slice(0, 6);
                  setData({ otp: newOtp });
                  const nextFocus = Math.min(i + pasted.length, 5);
                  inputRefs.current[nextFocus]?.focus();
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !data.otp[i] && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              className={`w-12 h-14 text-center text-2xl font-display font-bold rounded-xl border
                bg-surface-input outline-none transition-all
                ${data.otp[i]
                  ? 'border-coral text-coral shadow-glow-coral'
                  : 'border-surface-border text-white/20'
                } focus:border-coral focus:shadow-glow-coral`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <p className="text-xs text-white/30">
          Não recebeu?{' '}
          <button
            type="button"
            onClick={onBack}
            className="text-coral hover:underline font-medium"
          >
            Reenviar código
          </button>
        </p>
      </div>

      <ContinueBtn
        onClick={onNext}
        disabled={data.otp.replace(/\D/g, '').length < 6}
        loading={loading}
        label="Verificar código"
      />
    </div>
  );
}

// ── Tela 5: Data de Nascimento ────────────────────────────────────
function Step5({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  const age = (() => {
    if (!data.dobDay || !data.dobMonth || !data.dobYear) return null;
    const dob = new Date(Number(data.dobYear), MONTHS.indexOf(data.dobMonth), Number(data.dobDay));
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  })();

  const isValid = age !== null && age >= 18;

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={5} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={5} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Quando você <span className="text-coral">nasceu?</span>
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Sua idade ficará visível no perfil. Você precisa ter ao menos 18 anos.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Dia */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">DIA</label>
            <input
              type="number" min={1} max={31}
              placeholder="15"
              value={data.dobDay}
              onChange={e => setData({ dobDay: e.target.value })}
              className="w-full px-3 py-4 rounded-xl bg-surface-input border border-surface-border
                text-white text-center text-lg font-display font-bold placeholder-white/20
                focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
            />
          </div>
          {/* Mês */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">MÊS</label>
            <div className="relative">
              <select
                value={data.dobMonth}
                onChange={e => setData({ dobMonth: e.target.value })}
                className="w-full px-3 py-4 rounded-xl bg-surface-input border border-surface-border
                  text-white appearance-none focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none cursor-pointer"
              >
                <option value="">Mês</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
          {/* Ano */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">ANO</label>
            <input
              type="number" min={1900} max={new Date().getFullYear()}
              placeholder="2001"
              value={data.dobYear}
              onChange={e => setData({ dobYear: e.target.value })}
              className="w-full px-3 py-4 rounded-xl bg-surface-input border border-surface-border
                text-white text-center text-lg font-display font-bold placeholder-white/20
                focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
            />
          </div>
        </div>

        {age !== null && (
          <div className={`text-center py-4 rounded-xl mb-4 ${isValid ? 'bg-coral/10' : 'bg-red-500/10'}`}>
            <p className="text-sm text-white/40">Sua idade</p>
            <p className={`text-4xl font-display font-black ${isValid ? 'text-coral' : 'text-red-400'}`}>
              {age} anos
            </p>
            {!isValid && (
              <p className="text-xs text-red-400 mt-1">Você precisa ter ao menos 18 anos.</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-secondary border border-surface-border">
          <span className="text-base">👁️</span>
          <p className="text-xs text-white/40">
            Você pode ocultar seu ano — apenas a idade aparece no seu perfil público.
          </p>
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={!isValid} />
    </div>
  );
}

// ── Tela 6: Gênero & Pronomes ─────────────────────────────────────
function Step6({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={6} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={6} />
      <div className="flex-1 mt-8 overflow-y-auto no-scrollbar">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Como você se <span className="text-coral">identifica?</span>
        </h2>
        <p className="text-white/40 text-sm mb-6">
          Esse campo aparece no perfil. Escolha como prefere ser chamado/a.
        </p>

        <div className="space-y-2.5 mb-5">
          {GENDERS.map(g => (
            <SelectCard
              key={g.value}
              selected={data.gender === g.value}
              onClick={() => setData({ gender: g.value })}
            >
              <span className="text-xl">{g.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-white/40">{g.sub}</p>
              </div>
            </SelectCard>
          ))}
        </div>

        {/* Mostrar gênero toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-surface-border">
          <span className="text-sm text-white/70 font-medium">Mostrar gênero no perfil</span>
          <button
            type="button"
            onClick={() => setData({ showGender: !data.showGender })}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.showGender ? 'bg-coral' : 'bg-surface-border'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${data.showGender ? 'translate-x-5.5 left-0.5' : 'left-0.5 translate-x-0'}`} />
          </button>
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={!data.gender} />
    </div>
  );
}

// ── Tela 7: Preferência de Match ──────────────────────────────────
function Step7({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  const toggle = (val: string) => {
    setData({
      lookingFor: data.lookingFor.includes(val)
        ? data.lookingFor.filter(v => v !== val)
        : [...data.lookingFor, val],
    });
  };

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={7} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={7} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Quem você quer <span className="text-coral">conhecer?</span>
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Escolha quem aparece para você. Pode alterar nas configurações.
        </p>

        <div className="space-y-2.5">
          {LOOKING_FOR.map(lf => (
            <SelectCard
              key={lf.value}
              selected={data.lookingFor.includes(lf.value)}
              onClick={() => toggle(lf.value)}
            >
              <span className="text-xl">{lf.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{lf.value}</p>
                {lf.sub && <p className="text-xs text-white/40">{lf.sub}</p>}
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      <ContinueBtn onClick={onNext} />
    </div>
  );
}

// ── Tela 8: Bio ───────────────────────────────────────────────────
function Step8({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  const TONES = [
    { value: 'descontraido', label: 'Descontraído', emoji: '😎' },
    { value: 'direto',       label: 'Direto',       emoji: '🎯' },
    { value: 'filosofico',   label: 'Filosófico',   emoji: '🧐' },
    { value: 'humoristico',  label: 'Humorístico',  emoji: '😂' },
  ];

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={8} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={8} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Conte sobre <span className="text-coral">você</span>
        </h2>
        <p className="text-white/40 text-sm mb-6">
          Uma bio autêntica aumenta muito suas chances de match!
        </p>

        <div className="mb-5">
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">SUA BIO</label>
          <textarea
            value={data.bio}
            onChange={e => setData({ bio: e.target.value.slice(0, 500) })}
            placeholder="Ex: Estudante de Medicina, apaixonado por séries, viagens e bom café ☕"
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl bg-surface-input border border-surface-border
              text-white placeholder-white/20 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none
              resize-none transition-all text-sm leading-relaxed"
          />
          <p className="text-right text-xs text-white/30 mt-1">{data.bio.length} / 500</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">TOM DA SUA BIO</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setData({ bioTone: t.value })}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all
                  ${data.bioTone === t.value
                    ? 'border-coral bg-coral/15 text-coral'
                    : 'border-surface-border bg-surface-secondary text-white/50 hover:border-purple/40'
                  }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <ContinueBtn onClick={onNext} disabled={!data.bio.trim()} />
        <button
          type="button"
          onClick={onNext}
          className="w-full text-sm text-white/30 hover:text-white/50 py-2 transition-colors"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}

// ── Tela 9: Fotos ─────────────────────────────────────────────────
function Step9({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setData({ photos: [...data.photos, compressed].slice(0, 6) });
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    setData({ photos: data.photos.filter((_, idx) => idx !== i) });
  };

  const slots = Array.from({ length: 6 });

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={9} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={9} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Suas melhores <span className="text-coral">fotos</span>
        </h2>
        <p className="text-white/40 text-sm mb-6">
          Adicione pelo menos 2 fotos. Perfis com foto têm 5× mais matches.
        </p>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <div className="grid grid-cols-3 gap-2">
          {slots.map((_, i) => {
            const photo = data.photos[i];
            const isMain = i === 0;
            return (
              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden">
                {photo ? (
                  <>
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {isMain && (
                      <span className="absolute top-2 left-2 text-xs bg-coral text-white font-bold px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {i > 0 && (
                      <span className="absolute bottom-1.5 right-1.5 text-xs bg-black/50 text-white/70 px-1.5 py-0.5 rounded">
                        + Foto
                      </span>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-full bg-surface-secondary border-2 border-dashed border-surface-border
                      flex flex-col items-center justify-center gap-1.5 hover:border-coral/50 transition-colors"
                  >
                    {i === 0 ? (
                      <Camera className="w-6 h-6 text-white/30" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/20" />
                    )}
                    <span className="text-xs text-white/20">
                      {i === 0 ? 'Adicionar' : 'Adicionar'}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <ContinueBtn onClick={onNext} disabled={data.photos.length < 2} />
        <button
          type="button"
          onClick={onNext}
          className="w-full text-sm text-white/30 hover:text-white/50 py-2 transition-colors"
        >
          Adicionar depois
        </button>
      </div>
    </div>
  );
}

// ── Tela 10: Interesses ───────────────────────────────────────────
function Step10({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  const toggle = (label: string) => {
    if (data.interests.includes(label)) {
      setData({ interests: data.interests.filter(i => i !== label) });
    } else if (data.interests.length < 10) {
      setData({ interests: [...data.interests, label] });
    }
  };

  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={10} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={10} />
      <div className="flex-1 mt-8 overflow-y-auto no-scrollbar">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          Seus <span className="text-coral">interesses</span>
        </h2>
        <p className="text-white/40 text-sm mb-2">
          Escolha até 10 para aparecer no seu perfil.
        </p>
        <p className="text-sm font-semibold text-white/50 mb-5">
          <span className="text-coral">{data.interests.length}</span> de 10 selecionados
        </p>

        <div className="flex flex-wrap gap-2 pb-4">
          {INTERESTS_LIST.map(({ emoji, label }) => (
            <InterestChip
              key={label}
              emoji={emoji}
              label={label}
              selected={data.interests.includes(label)}
              onClick={() => toggle(label)}
            />
          ))}
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={data.interests.length === 0} />
    </div>
  );
}

// ── Tela 11: Intenção ─────────────────────────────────────────────
function Step11({
  data, setData, onNext, onBack,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={11} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={11} />
      <div className="flex-1 mt-8">
        <h2 className="font-display font-extrabold text-3xl text-white mb-1">
          O que você <span className="text-coral">busca?</span>
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Seja transparente — isso melhora a qualidade dos seus matches.
        </p>

        <div className="space-y-2.5">
          {INTENTIONS.map(intent => (
            <SelectCard
              key={intent.value}
              selected={data.intention === intent.value}
              onClick={() => setData({ intention: intent.value })}
            >
              <span className="text-2xl">{intent.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{intent.value}</p>
                <p className="text-xs text-white/40">{intent.sub}</p>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      <ContinueBtn onClick={onNext} disabled={!data.intention} />
    </div>
  );
}

// ── Tela 12: Preferências de busca ────────────────────────────────
function Step12({
  data, setData, onNext, onBack, loading,
}: {
  data: FormData; setData: (d: Partial<FormData>) => void; onNext: () => void; onBack: () => void; loading?: boolean;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-4 animate-slide-up">
      <StepHeader step={12} total={TOTAL_STEPS} onBack={onBack} showLogo />
      <ProgressBar step={12} />
      <div className="flex-1 mt-8 overflow-y-auto no-scrollbar space-y-6">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white mb-1">
            Preferências de <span className="text-coral">busca</span>
          </h2>
          <p className="text-white/40 text-sm">
            Defina quem você quer ver. Filtra os perfis mostrados para você.
          </p>
        </div>

        {/* Faixa de Idade */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">FAIXA DE IDADE</label>
            <span className="text-sm font-bold text-coral">{data.minAge} – {data.maxAge}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 w-6">Mín</span>
              <input
                type="range" min={18} max={60} value={data.minAge}
                onChange={e => setData({ minAge: Math.min(Number(e.target.value), data.maxAge - 1) })}
                className="flex-1 h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ background: `linear-gradient(to right, #F07070 0%, #F07070 ${((data.minAge - 18) / 42) * 100}%, #2e2a42 ${((data.minAge - 18) / 42) * 100}%, #2e2a42 100%)` }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 w-6">Máx</span>
              <input
                type="range" min={18} max={65} value={data.maxAge}
                onChange={e => setData({ maxAge: Math.max(Number(e.target.value), data.minAge + 1) })}
                className="flex-1 h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ background: `linear-gradient(to right, #F07070 0%, #F07070 ${((data.maxAge - 18) / 47) * 100}%, #2e2a42 ${((data.maxAge - 18) / 47) * 100}%, #2e2a42 100%)` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>18</span><span>60+</span>
          </div>
        </div>

        {/* Curso / Faculdade */}
        <div>
          <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
            🎓 CURSO / FACULDADE
          </label>
          <div className="relative">
            <select
              value={data.course}
              onChange={e => setData({ course: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-surface-input border border-surface-border
                text-white appearance-none focus:border-coral outline-none cursor-pointer"
            >
              <option value="">Todos os cursos</option>
              {COURSES.map(c => <option key={c} value={c}>{c} — IESGO</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>



      </div>
      <ContinueBtn onClick={onNext} loading={loading} label="Criar Perfil 🎉" />
    </div>
  );
}


// ── Tela 14: Perfil Criado ────────────────────────────────────────
function Step14({
  data, onNext,
}: {
  data: FormData; onNext: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-10 items-center justify-between animate-scale-in">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-5xl shadow-glow-coral animate-pulse-glow">
          💘
        </div>
        <div>
          <h2 className="font-display font-black text-4xl text-white mb-2">
            Perfil criado! 🎉
          </h2>
          <p className="text-white/50 text-base">
            Seu perfil está pronto e já é visível para outros usuários do campus.
          </p>
        </div>

        {/* Preview card */}
        <div className="w-full max-w-xs bg-surface-secondary border border-surface-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center shrink-0">
            {data.photos[0] ? (
              <img src={data.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-white">{data.firstName}{data.lastName ? `, ${new Date().getFullYear() - Number(data.dobYear)}` : ''}</p>
            <p className="text-xs text-white/40">{data.city || 'Formosa'}{data.state ? `, ${data.state}` : ', GO'} · {data.course || 'IESGO'}</p>
            {data.interests.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {data.interests.slice(0, 3).map(i => {
                  const found = INTERESTS_LIST.find(il => il.label === i);
                  return (
                    <span key={i} className="text-xs bg-surface-tertiary text-white/50 px-2 py-0.5 rounded-full">
                      {found?.emoji} {i}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ContinueBtn onClick={onNext} label="🔥 Começar a descobrir" />
    </div>
  );
}

// ── Tela 15: Revisão de Perfil ────────────────────────────────────
function Step15({
  data, onFinish, onEdit,
}: {
  data: FormData; onFinish: () => void; onEdit: () => void;
}) {
  const age = data.dobYear
    ? new Date().getFullYear() - Number(data.dobYear)
    : null;

  return (
    <div className="flex flex-col h-full animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onEdit} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-secondary border border-surface-border text-white/60">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-display font-bold text-white">Revisar perfil</span>
        <button onClick={onEdit} className="text-coral font-bold text-sm">Editar</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
        {/* Foto principal */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface-secondary">
          {data.photos[0] ? (
            <img src={data.photos[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">👤</div>
          )}
          <span className="absolute top-3 left-3 text-xs bg-coral text-white font-bold px-2 py-1 rounded-full">
            Foto principal
          </span>
          <button
            onClick={() => {}}
            className="absolute bottom-3 right-3 text-xs bg-black/50 text-white px-2 py-1 rounded-full border border-white/20"
          >
            + Foto
          </button>
        </div>

        {/* Nome e info */}
        <div className="bg-surface-secondary rounded-2xl p-4 space-y-3">
          <div>
            <h2 className="font-display font-black text-2xl text-white">
              {data.firstName}{data.lastName ? ` ${data.lastName.charAt(0)}.` : ''}{age ? `, ${age}` : ''}
            </h2>
            <p className="text-sm text-white/40">
              📍 {data.city || 'Formosa'}, {data.state || 'GO'} · {data.course || 'IESGO'}
            </p>
          </div>

          {data.bio && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">SOBRE MIM</p>
              <p className="text-sm text-white/70 leading-relaxed">{data.bio}</p>
            </div>
          )}

          {data.interests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">INTERESSES</p>
              <div className="flex flex-wrap gap-1.5">
                {data.interests.map(i => {
                  const found = INTERESTS_LIST.find(il => il.label === i);
                  return (
                    <span key={i} className="text-xs bg-surface-tertiary border border-surface-border text-white/60 px-2.5 py-1 rounded-full">
                      {found?.emoji} {i}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">DETALHES</p>
            <div className="space-y-1.5">
              {data.gender && (
                <p className="text-sm text-white/60 flex items-center gap-2">
                  👤 {data.gender}{data.pronouns ? ` · ${data.pronouns}` : ''}
                </p>
              )}
              {data.intention && (
                <p className="text-sm text-white/60 flex items-center gap-2">
                  💫 {data.intention}
                </p>
              )}
              {data.maxDistance && (
                <p className="text-sm text-white/60 flex items-center gap-2">
                  📍 Até {data.maxDistance}km de distância
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <ContinueBtn onClick={onFinish} label="🔥 Começar a descobrir" />
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────
function RegisterPageContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'create' | 'login'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [devCode, setDevCode] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '',
    contactType: 'email', contact: '', otp: '',
    dobDay: '', dobMonth: '', dobYear: '',
    gender: '', pronouns: '', showGender: true,
    lookingFor: ['Todos'],
    bio: '', bioTone: '',
    photos: [],
    interests: [],
    intention: '',
    course: '', shift: '', semester: 1, city: 'Formosa', state: 'GO',
    maxDistance: 35, minAge: 18, maxAge: 30,
    notifMatch: true, notifMessage: true, notifLike: false,
  });

  const update = (partial: Partial<FormData>) =>
    setFormData(prev => ({ ...prev, ...partial }));

  const searchParams = useSearchParams();
  useEffect(() => {
    const contact = searchParams.get('contact');
    const type = searchParams.get('type') as 'email' | 'phone' | null;
    if (contact && type) {
      update({ contact, contactType: type });
    }
  }, [searchParams]);

  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  // ── Enviar OTP ─────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact: formData.contact, type: formData.contactType }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Erro ao enviar código.'); return; }
      if (json.devCode) setDevCode(json.devCode);
      next();
    } finally {
      setLoading(false);
    }
  };

  // ── Verificar OTP ──────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact: formData.contact, code: formData.otp }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Código inválido.'); return; }

      if (!json.isNewUser) {
        // Usuário existente — fazer login direto
        const loginRes = await fetch('/api/auth/login', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ contact: formData.contact, contactType: formData.contactType }),
        });
        if (!loginRes.ok) {
          const loginJson = await loginRes.json();
          setError(loginJson.error ?? 'Erro ao fazer login.');
          return;
        }
        router.refresh();
        router.push('/feed');
        return;
      }
      next();
    } finally {
      setLoading(false);
    }
  };

  // ── Registrar (passo final) ────────────────────────────────────
  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const dob = formData.dobYear && formData.dobMonth && formData.dobDay
        ? new Date(
            Number(formData.dobYear),
            MONTHS.indexOf(formData.dobMonth),
            Number(formData.dobDay)
          ).toISOString()
        : null;

      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          contact:      formData.contact,
          contactType:  formData.contactType,
          firstName:    formData.firstName,
          lastName:     formData.lastName,
          dateOfBirth:  dob,
          gender:       formData.gender,
          pronouns:     formData.pronouns,
          showGender:   formData.showGender,
          lookingFor:   formData.lookingFor,
          bio:          formData.bio,
          bioTone:      formData.bioTone,
          interests:    formData.interests,
          photos:       formData.photos,
          course:       formData.course,
          shift:        formData.shift   || null,
          semester:     formData.semester || null,
          intention:    formData.intention,
          city:         formData.city,
          state:        formData.state,
          maxDistance:  formData.maxDistance,
          minAge:       formData.minAge,
          maxAge:       formData.maxAge,
          notifMatch:   formData.notifMatch,
          notifMessage: formData.notifMessage,
          notifLike:    formData.notifLike,
        }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Erro ao criar conta.'); return; }

      next(); // vai para tela 14 (perfil criado)
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => { router.refresh(); router.push('/feed'); };

  const steps = (
    <>
      {step === 1  && <Step1  onNext={next} onLogin={() => { setMode('login'); setStep(3); }} />}
      {step === 2  && <Step2  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 3  && <Step3  data={formData} setData={update} onNext={handleSendOTP} onBack={mode === 'login' ? () => { setMode('create'); setStep(1); } : back} loading={loading} error={error} />}
      {step === 4  && <Step4  data={formData} setData={update} onNext={handleVerifyOTP} onBack={() => setStep(3)} loading={loading} error={error} devCode={devCode} />}
      {step === 5  && <Step5  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 6  && <Step6  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 7  && <Step7  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 8  && <Step8  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 9  && <Step9  data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 10 && <Step10 data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 11 && <Step11 data={formData} setData={update} onNext={next} onBack={back} />}
      {step === 12 && <Step12 data={formData} setData={update} onNext={handleRegister} onBack={back} loading={loading} />}
      {step === 13 && <Step14 data={formData} onNext={handleFinish} />}
    </>
  );

  return (
    <div className="min-h-screen bg-deep flex flex-col lg:flex-row">

      {/* ── Desktop left branding panel ───────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative overflow-hidden bg-gradient-brand flex-col items-center justify-center gap-8 px-12">
        {/* Orbits */}
        {[500, 350, 650].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-white/[0.06] pointer-events-none"
            style={{ width: s, height: s }} />
        ))}
        {/* Logo */}
        <div className="relative w-52 h-52 z-10">
          <Image src="/Logo.png" alt="Tinder IESGO" fill
            className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-heartbeat" />
        </div>
        <div className="text-center z-10">
          <p className="text-white/80 text-xl font-semibold leading-relaxed">
            O seu match está<br />na sala ao lado.
          </p>
          <p className="text-white/40 text-sm mt-3">IESGO · Formosa, GO</p>
        </div>
        {/* Progress indicator */}
        {step >= 2 && step <= 13 && (
          <div className="z-10 flex flex-col items-center gap-2">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
              Etapa {step - 1} de {TOTAL_STEPS - 2}
            </p>
            <div className="w-40 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (TOTAL_STEPS - 2)) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Right form panel — mobile + desktop ──────────────── */}
      <div className="flex-1 bg-surface flex flex-col min-h-screen-real">
        <div className="flex-1 flex flex-col">
          {steps}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-deep flex items-center justify-center"><div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" /></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
