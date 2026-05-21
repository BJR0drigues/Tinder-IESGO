import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Message, User, StudyGroup } from '../types';
import { MOCK_USERS } from '../constants';
import { generateIcebreaker } from '../services/geminiService';
import { ChevronLeft, Send, Sparkles, ShieldAlert, BookOpen, Users, X, Plus, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// ── Modal de Criar Grupo de Estudo ───────────────────────────────
const StudyGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  course: string;
  onCreate: (group: StudyGroup) => void;
}> = ({ isOpen, onClose, course, onCreate }) => {
  const { createStudyGroup } = useApp();
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('Biblioteca IESGO');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);

  const locations = ['Biblioteca IESGO', 'Cantina', 'Sala de Aula 101', 'Laboratório de Informática', 'Área Verde'];

  const handleCreate = () => {
    if (!subject.trim() || !date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`).getTime();
    const group = createStudyGroup({
      name: `Grupo de ${subject}`,
      course,
      subject,
      location,
      scheduledAt,
      maxMembers
    });
    onCreate(group);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-display font-bold text-slate-800">Criar Grupo de Estudos</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Matéria / Assunto</label>
            <input
              type="text"
              placeholder="Ex: Cálculo 2, Direito Penal..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Local</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 bg-white"
            >
              {locations.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Horário</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Máx. de membros: {maxMembers}</label>
            <input
              type="range"
              min={2}
              max={10}
              value={maxMembers}
              onChange={e => setMaxMembers(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!subject.trim() || !date || !time}
          className="w-full mt-5 py-3 bg-iesgo-blue text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-900 transition-colors"
        >
          Criar Grupo
        </button>
      </motion.div>
    </div>
  );
};

// ── Card de Grupo de Estudo ──────────────────────────────────────
const StudyGroupCard: React.FC<{ group: StudyGroup }> = ({ group }) => {
  const { joinStudyGroup, currentUser } = useApp();
  const isMember = group.members.includes(currentUser?.id || '');
  const isFull = group.members.length >= group.maxMembers;

  const date = new Date(group.scheduledAt);
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 my-3">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-iesgo-blue" />
        <span className="font-display font-bold text-iesgo-blue text-sm">{group.name}</span>
        {isMember && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
      </div>
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          <span>{group.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{dateStr} às {timeStr}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users className="w-3 h-3" />
          <span>{group.members.length}/{group.maxMembers} membros</span>
        </div>
      </div>
      {!isMember && (
        <button
          onClick={() => joinStudyGroup(group.id)}
          disabled={isFull}
          className="w-full py-2 bg-iesgo-blue text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-blue-900 transition-colors"
        >
          {isFull ? 'Grupo Cheio' : 'Entrar no Grupo'}
        </button>
      )}
    </div>
  );
};

// ── Chat View ────────────────────────────────────────────────────
const ChatView: React.FC<{ matchId: string; onBack: () => void }> = ({ matchId, onBack }) => {
  const { messages, currentUser, sendMessage, matches, blockUser, studyGroups } = useApp();
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [newGroup, setNewGroup] = useState<StudyGroup | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const match = matches.find(m => m.id === matchId);
  const otherUserId = match?.users.find(uid => uid !== currentUser?.id);
  const otherUser = MOCK_USERS.find(u => u.id === otherUserId) || {
    id: 'unknown', name: 'Usuário Desconhecido',
    photos: ['https://picsum.photos/200'], course: 'N/A', interests: [], bio: ''
  } as unknown as User;

  const isStudyDate = match?.type === 'Study Date';
  const chatMessages = messages[matchId] || [];

  // Grupos de estudo desta conversa
  const relatedGroups = studyGroups.filter(
    g => g.createdBy === currentUser?.id || g.members.includes(currentUser?.id || '')
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(matchId, input);
    setInput('');
  };

  const handleIcebreaker = async () => {
    if (!currentUser || !otherUser) return;
    setGenerating(true);
    const suggestion = await generateIcebreaker(currentUser, otherUser);
    setInput(suggestion);
    setGenerating(false);
  };

  const handleBlock = () => {
    if (otherUserId) {
      blockUser(otherUserId);
      setShowBlockModal(false);
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-800">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
            <img src={otherUser.photos[0]} alt={otherUser.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800 text-sm leading-tight">{otherUser.name}</h3>
            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide block">{otherUser.course}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStudyDate && (
            <button
              onClick={() => setShowStudyModal(true)}
              className="p-2 text-iesgo-blue hover:bg-blue-50 rounded-full transition-colors"
              title="Criar Grupo de Estudos"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowBlockModal(true)}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Study Date Banner */}
      {isStudyDate && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-iesgo-blue shrink-0" />
          <p className="text-xs text-iesgo-blue font-medium">Study Date ☕ — Que tal criar um grupo de estudos?</p>
          <button onClick={() => setShowStudyModal(true)} className="ml-auto shrink-0 text-xs text-iesgo-blue font-bold underline">
            Criar
          </button>
        </div>
      )}

      {/* Study Groups */}
      {relatedGroups.length > 0 && (
        <div className="px-4 pt-2">
          {relatedGroups.map(g => <StudyGroupCard key={g.id} group={g} />)}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {chatMessages.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Que tal começar com algo criativo para quebrar o gelo?</p>
            <button
              onClick={handleIcebreaker}
              disabled={generating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-brand-200 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Pensando...' : 'Sugestão da IA'}
            </button>
          </div>
        )}

        {chatMessages.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isMe
                  ? 'bg-iesgo-blue text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <button
              onClick={handleIcebreaker}
              disabled={generating}
              className="p-2 text-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50 shrink-0"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50 transition-all">
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 py-1"
              placeholder={generating ? 'Gerando sugestão...' : 'Digite uma mensagem...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-coral-gradient rounded-full text-white disabled:opacity-50 disabled:grayscale transition-all hover:shadow-lg shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Block/Report Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Bloquear {otherUser.name}?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Você não verá mais o perfil desta pessoa. Esta ação não pode ser desfeita.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleBlock}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Bloquear
                </button>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="w-full py-3 text-slate-500 text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Group Modal */}
      <AnimatePresence>
        {showStudyModal && (
          <StudyGroupModal
            isOpen={showStudyModal}
            onClose={() => setShowStudyModal(false)}
            course={otherUser.course || 'Geral'}
            onCreate={(group) => {
              setNewGroup(group);
              sendMessage(matchId, `📚 Criei um grupo de estudos: "${group.name}" em ${group.location}. Vamos juntos?`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Matches List ─────────────────────────────────────────────────
const MatchesList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const { matches, currentUser, messages } = useApp();

  if (matches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-paper">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
          <Sparkles className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="font-display font-bold text-slate-700 mb-2 text-lg">Sem matches ainda</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">O campus é grande! Continue deslizando para encontrar alguém.</p>
        <Link to="/feed" className="mt-8 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:border-brand-500 hover:text-brand-600 transition-all">
          Voltar para Descoberta
        </Link>
      </div>
    );
  }

  const newMatches = matches.filter(m => !messages[m.id]?.length);
  const conversations = matches.filter(m => (messages[m.id]?.length || 0) > 0);
  const studyDates = matches.filter(m => m.type === 'Study Date');

  return (
    <div className="h-full bg-paper overflow-y-auto pb-6 font-sans">
      <div className="p-5">
        <h1 className="text-2xl font-display font-extrabold text-slate-800 mb-6 tracking-tight">Conexões</h1>

        {/* Study Dates Highlight */}
        {studyDates.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-iesgo-blue" />
              <span className="text-sm font-bold text-iesgo-blue">Study Dates ☕</span>
              <span className="ml-auto text-xs text-blue-400 font-medium">{studyDates.length} marcado{studyDates.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {studyDates.map(match => {
                const otherId = match.users.find(id => id !== currentUser?.id);
                const otherUser = MOCK_USERS.find(u => u.id === otherId);
                if (!otherUser) return null;
                return (
                  <button key={match.id} onClick={() => onSelect(match.id)} className="flex flex-col items-center space-y-1.5 min-w-[64px] group">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-iesgo-blue group-hover:scale-105 transition-transform">
                      <img src={otherUser.photos[0]} className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate w-full text-center font-display">{otherUser.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* New Matches Row */}
        {newMatches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Novos Matches</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {newMatches.map(match => {
                const otherId = match.users.find(id => id !== currentUser?.id);
                const otherUser = MOCK_USERS.find(u => u.id === otherId);
                if (!otherUser) return null;
                return (
                  <button key={match.id} onClick={() => onSelect(match.id)} className="flex flex-col items-center space-y-2 min-w-[72px] group">
                    <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-rose-600 group-hover:scale-105 transition-transform">
                      <img src={otherUser.photos[0]} className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate w-full text-center font-display">{otherUser.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversations */}
        {conversations.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Conversas</h2>
            <div className="space-y-3">
              {conversations.map(match => {
                const otherId = match.users.find(id => id !== currentUser?.id);
                const otherUser = MOCK_USERS.find(u => u.id === otherId);
                const lastMsg = match.lastMessage;
                if (!otherUser) return null;

                return (
                  <button
                    key={match.id}
                    onClick={() => onSelect(match.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 border border-slate-100 group-hover:scale-105 transition-transform">
                        <img src={otherUser.photos[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      {match.type === 'Study Date' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-iesgo-blue rounded-full flex items-center justify-center text-[8px]">
                          ☕
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-display font-bold text-slate-800 text-base">{otherUser.name}</span>
                        {match.lastMessageTime && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                            {new Date(match.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate font-medium">{lastMsg}</p>
                    </div>
                    {(match.unreadCount || 0) > 0 && (
                      <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-white font-bold">{match.unreadCount}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {newMatches.length === 0 && conversations.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400">Suas conversas aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────
const Matches: React.FC = () => {
  const [activeMatch, setActiveMatch] = useState<string | null>(null);

  if (activeMatch) {
    return <ChatView matchId={activeMatch} onBack={() => setActiveMatch(null)} />;
  }

  return <MatchesList onSelect={setActiveMatch} />;
};

export default Matches;
