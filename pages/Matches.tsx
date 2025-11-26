import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Message, User } from '../types';
import { MOCK_USERS } from '../constants';
import { generateIcebreaker } from '../services/geminiService';
import { ChevronLeft, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatView: React.FC<{ matchId: string; onBack: () => void }> = ({ matchId, onBack }) => {
    const { messages, currentUser, sendMessage, matches } = useApp();
    const [input, setInput] = useState('');
    const [generating, setGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const match = matches.find(m => m.id === matchId);
    const otherUserId = match?.users.find(uid => uid !== currentUser?.id);
    const otherUser = MOCK_USERS.find(u => u.id === otherUserId) || {
        id: 'unknown',
        name: 'Usuário Desconhecido',
        photos: ['https://picsum.photos/200'],
        course: 'N/A',
        interests: [],
        bio: ''
    } as unknown as User;
    
    const chatMessages = messages[matchId] || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
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
                <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <ShieldAlert className="w-5 h-5" />
                </button>
            </div>

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
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50 transition-all">
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 py-1"
                        placeholder="Digite uma mensagem..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-coral-gradient rounded-full text-white disabled:opacity-50 disabled:grayscale transition-all hover:shadow-lg"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

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

    return (
        <div className="h-full bg-paper p-5 font-sans">
            <h1 className="text-2xl font-display font-extrabold text-slate-800 mb-8 tracking-tight">Conexões</h1>
            
            {/* New Matches Row */}
            <div className="mb-8">
                 <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Novos Matches</h2>
                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {matches.filter(m => !messages[m.id]?.length).map(match => {
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
                    {matches.filter(m => !messages[m.id]?.length).length === 0 && (
                        <p className="text-xs text-slate-400 italic pl-1">Nenhum novo match por enquanto.</p>
                    )}
                 </div>
            </div>

            {/* Messages List */}
            <div>
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Conversas</h2>
                <div className="space-y-3">
                    {matches.filter(m => messages[m.id]?.length > 0).map(match => {
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
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                                    <img src={otherUser.photos[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-display font-bold text-slate-800 text-base">{otherUser.name}</span>
                                        {match.lastMessageTime && (
                                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                                {new Date(match.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate font-medium">{lastMsg}</p>
                                </div>
                            </button>
                        );
                    })}
                    {matches.filter(m => messages[m.id]?.length > 0).length === 0 && (
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                             <p className="text-sm text-slate-400">Suas conversas aparecerão aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Matches: React.FC = () => {
    const [activeMatch, setActiveMatch] = useState<string | null>(null);

    if (activeMatch) {
        return <ChatView matchId={activeMatch} onBack={() => setActiveMatch(null)} />;
    }

    return <MatchesList onSelect={setActiveMatch} />;
};

export default Matches;