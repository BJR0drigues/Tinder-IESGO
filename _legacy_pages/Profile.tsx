import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Settings, LogOut, CheckCircle, Edit2, Shield, AlertCircle, Loader2, Moon, Sun, Trophy, BarChart3, Heart, X } from 'lucide-react';
import { Shift, Intention } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// ── Modal de Conquistas ─────────────────────────────────────────
const AchievementsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { achievements } = useApp();
  const unlockedIds = achievements.map(a => a.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-800">Conquistas</h2>
            <p className="text-xs text-slate-400">{achievements.length}/{ACHIEVEMENT_DEFINITIONS.length} desbloqueadas</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-coral-gradient rounded-full transition-all"
                style={{ width: `${(achievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENT_DEFINITIONS.map(def => {
              const unlocked = unlockedIds.includes(def.id);
              const unlockedData = achievements.find(a => a.id === def.id);
              return (
                <div
                  key={def.id}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                    unlocked
                      ? 'bg-white border-amber-200 shadow-sm'
                      : 'bg-slate-50 border-slate-100 opacity-50'
                  }`}
                >
                  <span className={`text-2xl mb-1.5 ${unlocked ? '' : 'grayscale'}`}>{def.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-tight mb-0.5">{def.title}</span>
                  <span className="text-[9px] text-slate-400 text-center leading-tight">{def.description}</span>
                  {unlocked && unlockedData?.unlockedAt && (
                    <span className="text-[8px] text-amber-500 font-bold mt-1">
                      {new Date(unlockedData.unlockedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Profile Page ─────────────────────────────────────────────────
const Profile: React.FC = () => {
  const { currentUser, logout, verifyProfile, isVerifying, updateProfile, userStats, achievements, matches } = useApp();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean, message: string } | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const result = await verifyProfile(e.target.files[0]);
      setVerificationResult(result);
      if (result.success) {
        setTimeout(() => { setShowVerificationModal(false); setVerificationResult(null); }, 2000);
      }
    }
  };

  if (!currentUser) return null;

  const totalSwipes = userStats.likesGiven + userStats.passesGiven + userStats.studyDatesGiven;
  const matchRate = totalSwipes > 0 ? Math.round((matches.length / Math.max(userStats.likesGiven + userStats.studyDatesGiven, 1)) * 100) : 0;

  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-10 font-sans">
      {/* Header Image */}
      <div className="relative h-60 bg-iesgo-blue">
        <img src={currentUser.photos[0]} className="w-full h-full object-cover opacity-70" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-iesgo-blue/90 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 w-full text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-display">{currentUser.name}, {currentUser.age}</h1>
            {currentUser.verified && <CheckCircle className="w-5 h-5 text-brand-400 fill-current bg-white rounded-full" />}
          </div>
          <p className="text-blue-200 font-medium">{currentUser.course} • {currentUser.semester}º sem.</p>
        </div>
        <button className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 -mt-4 rounded-t-3xl bg-slate-50 relative z-10">
        {/* Verification Banner */}
        {!currentUser.verified && (
          <div className="bg-gradient-to-r from-iesgo-blue to-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 text-white mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                Verifique seu perfil
              </h3>
              <p className="text-xs text-blue-100 opacity-90">Valide sua foto para ter o selo IESGO.</p>
            </div>
            <button onClick={() => setShowVerificationModal(true)} className="bg-white text-iesgo-blue px-3 py-1.5 rounded-lg text-xs font-bold">
              Verificar
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              Suas Estatísticas
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Likes Dados', value: userStats.likesGiven + userStats.studyDatesGiven, emoji: '❤️' },
              { label: 'Matches', value: matches.length, emoji: '🎉' },
              { label: 'Taxa Match', value: `${matchRate}%`, emoji: '✨' },
              { label: 'Mensagens', value: userStats.messagesSent, emoji: '💬' },
              { label: 'Study Dates', value: userStats.studyDatesGiven, emoji: '☕' },
              { label: 'Boosts', value: userStats.boostsUsed, emoji: '🚀' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                <div className="text-xl mb-0.5">{stat.emoji}</div>
                <div className="text-lg font-display font-extrabold text-slate-800 leading-tight">{stat.value}</div>
                <div className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Preview */}
        <div className="mb-5">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-amber-500" />
                Conquistas
              </h3>
              <button onClick={() => setShowAchievements(true)} className="text-xs text-brand-500 font-bold">
                Ver todas
              </button>
            </div>
            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Faça swipes para desbloquear conquistas! 🏆</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {achievements.slice(0, 6).map(a => (
                  <div key={a.id} title={a.title} className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-lg">
                    {a.icon}
                  </div>
                ))}
                {achievements.length > 6 && (
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                    +{achievements.length - 6}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{achievements.length}/{ACHIEVEMENT_DEFINITIONS.length} desbloqueadas</span>
                <span>{Math.round((achievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-coral-gradient rounded-full transition-all"
                  style={{ width: `${(achievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Academic Preferences */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-brand-500" />
              Preferências Acadêmicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Meu Turno</label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {(['Matutino', 'Noturno'] as Shift[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateProfile({ shift: s })}
                      className={`flex-1 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                        currentUser.shift === s ? 'bg-white text-iesgo-blue shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {s === 'Matutino' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Minha Intenção</label>
                <select
                  value={currentUser.intention}
                  onChange={(e) => updateProfile({ intention: e.target.value as Intention })}
                  className="w-full bg-slate-100 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none border-r-8 border-transparent"
                >
                  <option value="Study Date">☕ Study Date</option>
                  <option value="Barzinho">🍻 Barzinho</option>
                  <option value="Match">🔥 Match</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-slate-800 text-sm">Sobre mim</h3>
              <button className="text-brand-500"><Edit2 className="w-4 h-4" /></button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{currentUser.bio}</p>
          </div>

          {/* Interests */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Interesses</h3>
              <button className="text-brand-500 font-medium text-xs">Editar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map(interest => (
                <span key={interest} className="text-xs px-3 py-1 bg-brand-50 text-brand-600 rounded-full font-medium border border-brand-100">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">Minhas Fotos</h3>
              <button className="text-brand-500 font-medium text-sm">Editar</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {currentUser.photos.map((photo, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 relative">
                  <img src={photo} className="w-full h-full object-cover" />
                </div>
              ))}
              <button className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-colors">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Adicionar</span>
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-4 mt-2 text-red-500 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-300">IESGO Match v3.0 — Mais sistemas, mais campus!</p>
          </div>
        </div>
      </div>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      </AnimatePresence>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-iesgo-blue/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-iesgo-blue" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Validação IESGO</h2>
            <p className="text-sm text-slate-500 mb-6">Tire uma selfie para validarmos com sua foto de perfil e garantir a segurança do campus.</p>

            {isVerifying ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600">IA analisando...</p>
              </div>
            ) : verificationResult ? (
              <div className={`p-4 rounded-xl mb-4 ${verificationResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center justify-center gap-2 mb-1 font-bold">
                  {verificationResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {verificationResult.success ? 'Verificado!' : 'Falhou'}
                </div>
                <p className="text-xs">{verificationResult.message}</p>
              </div>
            ) : (
              <label className="block w-full cursor-pointer bg-iesgo-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
                Tirar Selfie
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            {!isVerifying && (
              <button
                onClick={() => { setShowVerificationModal(false); setVerificationResult(null); }}
                className="mt-4 text-slate-400 text-sm font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
