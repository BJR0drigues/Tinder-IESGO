export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  STAFF = 'STAFF'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER'
}

export type Shift = 'Matutino' | 'Vespertino' | 'Noturno' | 'Integral';
export type Intention = 'Study Date' | 'Barzinho' | 'Match';

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  course?: string; // Optional for staff
  semester?: number;
  role: UserRole;
  bio: string;
  photos: string[];
  interests: string[];
  gender: Gender;
  verified: boolean;
  shift: Shift;
  intention: Intention;
}

export interface Match {
  id: string;
  users: [string, string]; // User IDs
  timestamp: number;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  type?: Intention; // To know if it started as a study date
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  type: 'text' | 'image' | 'icebreaker';
}

export interface SwipeAction {
  fromUserId: string;
  toUserId: string;
  action: 'like' | 'pass' | 'study';
  timestamp: number;
}

// ── Novos Sistemas ──────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export type EventCategory = 'social' | 'academic' | 'sports' | 'cultural';

export interface CampusEvent {
  id:          string;
  title:       string;
  description: string;
  location:    string;
  date:        number; // timestamp in ms
  category:    string; // "social" | "academic" | "sports" | "cultural"
  organizer:   string;
  attendees:   number;
  emoji?:      string;
  isActive?:   boolean;
  createdById?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  course: string;
  subject: string;
  members: string[]; // user IDs
  maxMembers: number;
  location: string;
  scheduledAt: number; // timestamp
  createdBy: string;
}

export interface UserStats {
  likesGiven: number;
  passesGiven: number;
  studyDatesGiven: number;
  matchCount: number;
  messagesSent: number;
  boostsUsed: number;
  eventsAttended: number;
}

export interface BoostState {
  active: boolean;
  usedAt: number | null;
  expiresAt: number | null;
}

// Lista oficial de cursos da IESGO (Formosa-GO)
export const COURSES = [
  'Administração',
  'Agronomia',
  'Bacharelado em Sistema de Informação',
  'Biomedicina',
  'Ciências Contábeis',
  'Direito',
  'Enfermagem',
  'Farmácia',
  'Fisioterapia',
  'Medicina Veterinária',
  'Pedagogia',
  'Psicologia'
];

export const INTERESTS = [
  // Vida Universitária IESGO
  'Barzinho pós-aula', 'Atlética', 'Jogos Universitários', 'Semana Acadêmica',
  'Estágio', 'Iniciação Científica', 'Monitoria', 'Horas Complementares',
  'Trote Solidário', 'Xerox', 'Cantina', 'Biblioteca',

  // Lifestyle
  'Academia', 'Netflix', 'Viagem', 'Pets', 'Festa', 'Games', 'Música Sertaneja',
  'Rock', 'Pagode', 'Cerveja', 'Tereré', 'Café', 'Natureza'
];