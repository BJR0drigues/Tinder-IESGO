import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Match, Message, SwipeAction } from '../types';
import { MOCK_USERS as INITIAL_MOCK_USERS, INITIAL_USER as DEFAULT_USER } from '../constants';
import { verifyUserIdentity } from '../services/geminiService';

interface CompatibilityResult {
  score: number;
  label: string;
}

interface AppContextType {
  currentUser: User | null;
  potentialMatches: User[];
  matches: Match[];
  messages: Record<string, Message[]>;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  swipe: (targetUserId: string, action: 'like' | 'pass' | 'study') => Promise<boolean>;
  sendMessage: (matchId: string, content: string, type?: 'text' | 'icebreaker') => void;
  loading: boolean;
  // Filters
  activeFilters: string[]; // Interests
  activeCourseFilters: string[]; // Courses
  toggleFilter: (interest: string) => void;
  toggleCourseFilter: (course: string) => void;
  clearFilters: () => void;
  // Verification
  verifyProfile: (selfieFile: File) => Promise<{ success: boolean; message: string }>;
  isVerifying: boolean;
  // Gamification
  calculateCompatibility: (targetUser: User) => CompatibilityResult;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_MOCK_USERS);
  const [swipes, setSwipes] = useState<SwipeAction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeCourseFilters, setActiveCourseFilters] = useState<string[]>([]);

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  // Persistence and Initialization
  useEffect(() => {
    const initializeApp = () => {
      try {
        const savedUser = localStorage.getItem('iesgo_user');
        const savedMatches = localStorage.getItem('iesgo_matches');
        const savedMessages = localStorage.getItem('iesgo_messages');
        const savedSwipes = localStorage.getItem('iesgo_swipes');

        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        if (savedMatches) setMatches(JSON.parse(savedMatches));
        if (savedMessages) setMessages(JSON.parse(savedMessages));
        if (savedSwipes) setSwipes(JSON.parse(savedSwipes));

      } catch (error) {
        console.error("Error loading persisted data", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save state on changes
  useEffect(() => {
    if (currentUser) localStorage.setItem('iesgo_user', JSON.stringify(currentUser));
    else localStorage.removeItem('iesgo_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('iesgo_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('iesgo_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('iesgo_swipes', JSON.stringify(swipes));
  }, [swipes]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = useCallback((email: string) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser({ ...DEFAULT_USER, email });
      setLoading(false);
    }, 800);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSwipes([]);
    setMatches([]);
    setMessages({});
    setActiveFilters([]);
    setActiveCourseFilters([]);
    localStorage.clear();
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  }, [currentUser]);

  const toggleFilter = useCallback((interest: string) => {
    setActiveFilters(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }, []);

  const toggleCourseFilter = useCallback((course: string) => {
    setActiveCourseFilters(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setActiveCourseFilters([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Filter users already swiped on AND filter by interests/courses
  const potentialMatches = users.filter(u => {
    if (!currentUser) return false;

    // Basic swipe check
    const hasSwiped = swipes.some(s => s.fromUserId === currentUser.id && s.toUserId === u.id);
    if (u.id === currentUser.id || hasSwiped) return false;

    // Advanced Interest Filter (OR logic: if user has ANY of the selected interests)
    if (activeFilters.length > 0) {
      const hasCommonInterest = u.interests.some(i => activeFilters.includes(i));
      if (!hasCommonInterest) return false;
    }

    // Course Filter (OR logic: if user is in ANY of the selected courses)
    if (activeCourseFilters.length > 0) {
      if (!u.course || !activeCourseFilters.includes(u.course)) return false;
    }

    return true;
  });

  const swipe = useCallback(async (targetUserId: string, action: 'like' | 'pass' | 'study'): Promise<boolean> => {
    if (!currentUser) return false;

    const newSwipe: SwipeAction = {
      fromUserId: currentUser.id,
      toUserId: targetUserId,
      action,
      timestamp: Date.now()
    };

    setSwipes(prev => [...prev, newSwipe]);

    if (action === 'like' || action === 'study') {
      const isMatch = Math.random() > 0.4; // Demo logic

      if (isMatch) {
        const newMatch: Match = {
          id: `match_${Date.now()}`,
          users: [currentUser.id, targetUserId],
          timestamp: Date.now(),
          unreadCount: 0,
          type: action === 'study' ? 'Study Date' : undefined
        };
        setMatches(prev => [newMatch, ...prev]);
        setMessages(prev => ({ ...prev, [newMatch.id]: [] }));

        // Auto message for study date
        if (action === 'study') {
          setTimeout(() => {
            sendMessage(newMatch.id, "Oi! Vi que você topa um Study Date. Vamos marcar na biblioteca?");
          }, 500);
        }

        return true;
      }
    }
    return false;
  }, [currentUser]); // Added dependency

  const sendMessage = useCallback((matchId: string, content: string, type: 'text' | 'icebreaker' = 'text') => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      isRead: true,
      type
    };

    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMessage]
    }));

    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          lastMessage: content,
          lastMessageTime: Date.now()
        };
      }
      return m;
    }));

    // Auto-reply simulation
    if (currentUser.id === 'me') {
      setTimeout(() => {
        const replyMsg: Message = {
          id: `msg_r_${Date.now()}`,
          matchId,
          senderId: 'other',
          content: "Opa! Claro, adoraria.",
          timestamp: Date.now(),
          isRead: false,
          type: 'text'
        };

        setMessages(prev => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), replyMsg]
        }));
      }, 3000);
    }

  }, [currentUser]);

  const verifyProfile = useCallback(async (selfieFile: File): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "Usuário não logado" };

    setIsVerifying(true);

    try {
      const reader = new FileReader();
      const selfieBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selfieFile);
      });
      const selfieBase64 = await selfieBase64Promise;

      const result = await verifyUserIdentity(currentUser.photos[0], selfieBase64);

      if (result.verified) {
        updateProfile({ verified: true });
        return { success: true, message: "Verificado com sucesso!" };
      } else {
        return { success: false, message: result.reason || "Falha na verificação." };
      }
    } catch (e) {
      return { success: false, message: "Erro técnico na verificação." };
    } finally {
      setIsVerifying(false);
    }
  }, [currentUser, updateProfile]);

  // Fun little algorithm for the "IESGO Match" logic
  const calculateCompatibility = useCallback((targetUser: User): CompatibilityResult => {
    if (!currentUser || !targetUser.course || !currentUser.course) return { score: 65, label: "Match Misterioso" };

    const c1 = currentUser.course;
    const c2 = targetUser.course;

    // Same Course
    if (c1 === c2) return { score: 85, label: `Casal ${c1}` };

    // Agro logic
    const agrar = ['Agronomia', 'Medicina Veterinária'];
    if (agrar.includes(c1) && agrar.includes(c2)) return { score: 95, label: 'Casal Agro 🚜' };

    // Health
    const health = ['Biomedicina', 'Enfermagem', 'Farmácia', 'Fisioterapia', 'Medicina Veterinária'];
    if (health.includes(c1) && health.includes(c2)) return { score: 80, label: 'Plantão Juntos 🏥' };

    // Law + Psych
    if ((c1 === 'Direito' && c2 === 'Psicologia') || (c2 === 'Direito' && c1 === 'Psicologia')) {
      return { score: 92, label: 'Debate & Terapia 🧠⚖️' };
    }

    // Tech
    const tech = ['Bacharelado em Sistema de Informação'];
    if (tech.includes(c1) && tech.includes(c2)) return { score: 88, label: 'Debugando o Amor 💻' };

    return { score: Math.floor(Math.random() * (75 - 50 + 1) + 50), label: 'Opostos se Atraem' };
  }, [currentUser]);

  return (
    <AppContext.Provider value={{
      currentUser,
      potentialMatches,
      matches,
      messages,
      login,
      logout,
      updateProfile,
      swipe,
      sendMessage,
      loading,
      activeFilters,
      activeCourseFilters,
      toggleFilter,
      toggleCourseFilter,
      clearFilters,
      verifyProfile,
      isVerifying,
      calculateCompatibility,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};