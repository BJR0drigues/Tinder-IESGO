import { User, UserRole, Gender, CampusEvent, Achievement } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_2',
    email: 'ana.silva@iesgo.edu.br',
    name: 'Ana Silva',
    age: 21,
    course: 'Direito',
    semester: 4,
    role: UserRole.STUDENT,
    bio: 'Futura advogada. OAB é o foco, mas o barzinho na sexta é sagrado. ⚖️🍷',
    photos: ['https://picsum.photos/400/600?random=1', 'https://picsum.photos/400/600?random=2'],
    interests: ['Direito Penal', 'Atlética', 'Vinho', 'Barzinho pós-aula', 'Netflix'],
    gender: Gender.FEMALE,
    verified: true,
    shift: 'Noturno',
    intention: 'Match'
  },
  {
    id: 'user_3',
    email: 'marcos.oliveira@iesgo.edu.br',
    name: 'Marcos Oliveira',
    age: 23,
    course: 'Agronomia',
    semester: 7,
    role: UserRole.STUDENT,
    bio: 'Do campo pra cidade. Tereré, sertanejo e muita técnica. 🚜🌾',
    photos: ['https://picsum.photos/400/600?random=3', 'https://picsum.photos/400/600?random=4'],
    interests: ['Sertanejo', 'Tereré', 'Churrasco', 'Pecuária', 'Natureza'],
    gender: Gender.MALE,
    verified: true,
    shift: 'Matutino',
    intention: 'Barzinho'
  },
  {
    id: 'user_4',
    email: 'julia.santos@gmail.com',
    name: 'Júlia Santos',
    age: 20,
    course: 'Biomedicina',
    semester: 2,
    role: UserRole.STUDENT,
    bio: 'Caloura sofrendo com lista de material. Alguém pra dividir o prejuízo? 🦷✨',
    photos: ['https://picsum.photos/400/600?random=5'],
    interests: ['Festas', 'Viagem', 'Estética', 'Instagram', 'Trote Solidário'],
    gender: Gender.FEMALE,
    verified: false,
    shift: 'Integral',
    intention: 'Study Date'
  },
  {
    id: 'user_5',
    email: 'lucas.pereira@iesgo.edu.br',
    name: 'Lucas Pereira',
    age: 25,
    course: 'Medicina Veterinária',
    semester: 9,
    role: UserRole.STUDENT,
    bio: 'Quase formando. Se seu cachorro late, a gente já se entende. 🐶🩺',
    photos: ['https://picsum.photos/400/600?random=6'],
    interests: ['Pets', 'Cirurgia Vet', 'Cavalos', 'Futebol', 'Cerveja'],
    gender: Gender.MALE,
    verified: true,
    shift: 'Integral',
    intention: 'Match'
  },
  {
    id: 'user_6',
    email: 'fernanda.costa@iesgo.edu.br',
    name: 'Fernanda Costa',
    age: 22,
    course: 'Psicologia',
    semester: 5,
    role: UserRole.STUDENT,
    bio: 'Freud explica, mas eu prefiro um café. Buscando conexões reais. 🧠☕',
    photos: ['https://picsum.photos/400/600?random=7'],
    interests: ['Leitura', 'Psicanálise', 'Café', 'Indie', 'Museus'],
    gender: Gender.FEMALE,
    verified: true,
    shift: 'Noturno',
    intention: 'Study Date'
  },
  {
    id: 'user_7',
    email: 'rodrigo.mendes@iesgo.edu.br',
    name: 'Rodrigo Mendes',
    age: 24,
    course: 'Bacharelado em Sistema de Informação',
    semester: 8,
    role: UserRole.STUDENT,
    bio: 'Calculadora na mão e capacete na cabeça. Bora construir algo juntos? 🏗️',
    photos: ['https://picsum.photos/400/600?random=8'],
    interests: ['Academia', 'Obras', 'Games', 'Churrasco', 'Rock'],
    gender: Gender.MALE,
    verified: false,
    shift: 'Noturno',
    intention: 'Barzinho'
  }
];

export const INITIAL_USER: User = {
  id: 'me',
  email: 'usuario.exemplo@gmail.com',
  name: 'Você',
  age: 22,
  course: 'Administração',
  semester: 3,
  role: UserRole.STUDENT,
  bio: 'Estudante da IESGO procurando novas amizades e quem sabe algo mais.',
  photos: ['https://picsum.photos/400/600?random=99'],
  interests: ['Empreendedorismo', 'Festas', 'Networking'],
  gender: Gender.MALE,
  verified: false,
  shift: 'Noturno',
  intention: 'Match'
};

export { COURSES, INTERESTS } from './types';

// ── Eventos do Campus ────────────────────────────────────────────
const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'Barzinho dos Calouros',
    description: 'Integração pra galera nova. Veteranos guiam, calouros aproveitam! Dress code: camisa do curso.',
    location: 'Bar do Zé — Centro de Formosa',
    date: NOW + 1 * DAY,
    category: 'social',
    organizer: 'Comissão de Calouros IESGO',
    attendees: 68,
    emoji: '🍻'
  },
  {
    id: 'evt_2',
    title: 'Churrasco da Atlética',
    description: 'O churras tradicional pós-semana de provas. Aberto pra todos os cursos. Racha entre os presentes.',
    location: 'Quadra Coberta da IESGO',
    date: NOW + 2 * DAY,
    category: 'social',
    organizer: 'Atlética IESGO',
    attendees: 47,
    emoji: '🔥'
  },
  {
    id: 'evt_3',
    title: 'Workshop de TI e Startups',
    description: 'Como montar sua startup ainda na faculdade. Cases reais de ex-alunos que empreenderam.',
    location: 'Laboratório de Informática',
    date: NOW + 3 * DAY,
    category: 'academic',
    organizer: 'Curso de Sistemas de Informação',
    attendees: 42,
    emoji: '💻'
  },
  {
    id: 'evt_4',
    title: 'Semana Acadêmica de Psicologia',
    description: 'Palestras e debates sobre saúde mental universitária, ansiedade e burnout estudantil.',
    location: 'Auditório Principal',
    date: NOW + 5 * DAY,
    category: 'academic',
    organizer: 'Curso de Psicologia',
    attendees: 89,
    emoji: '🧠'
  },
  {
    id: 'evt_5',
    title: 'Campeonato Universitário de Futebol',
    description: 'Disputa entre os cursos. Tabela de grupos, fase mata-mata. Direto x Agro na grande final?',
    location: 'Campo de Futebol do Campus',
    date: NOW + 7 * DAY,
    category: 'sports',
    organizer: 'DEF — Departamento de Esportes',
    attendees: 134,
    emoji: '⚽'
  },
  {
    id: 'evt_6',
    title: 'Noite Cultural IESGO',
    description: 'Show de talentos, bandas ao vivo e muito pagode! A maior festa do semestre.',
    location: 'Área Externa da IESGO',
    date: NOW + 10 * DAY,
    category: 'cultural',
    organizer: 'DCE — Diretório Central dos Estudantes',
    attendees: 203,
    emoji: '🎵'
  },
  {
    id: 'evt_7',
    title: 'Simulado OAB — Turma Direito',
    description: 'Simulado completo das duas fases da OAB com correção e gabarito comentado ao vivo.',
    location: 'Sala 201 — Bloco B',
    date: NOW + 4 * DAY,
    category: 'academic',
    organizer: 'Curso de Direito',
    attendees: 56,
    emoji: '⚖️'
  },
  {
    id: 'evt_8',
    title: 'Dia de Campo — Agronomia',
    description: 'Visita técnica à fazenda experimental. Aberto para Agronomia e Med. Veterinária.',
    location: 'Fazenda Experimental IESGO',
    date: NOW + 6 * DAY,
    category: 'academic',
    organizer: 'Curso de Agronomia',
    attendees: 38,
    emoji: '🚜'
  },
  {
    id: 'evt_9',
    title: 'Torneio de Vôlei Misto',
    description: 'Formas times mistos entre cursos! Inscrições por duplas. Prêmio pra campeões.',
    location: 'Quadra Poliesportiva',
    date: NOW + 8 * DAY,
    category: 'sports',
    organizer: 'Atlética IESGO',
    attendees: 72,
    emoji: '🏐'
  },
  {
    id: 'evt_10',
    title: 'Sessão de Cinema ao Ar Livre',
    description: 'Exibição de Mulher Maravilha 84 com pipoca grátis. Traga seu cobertor!',
    location: 'Estacionamento do Campus',
    date: NOW + 9 * DAY,
    category: 'cultural',
    organizer: 'Comissão Cultural',
    attendees: 115,
    emoji: '🎬'
  }
];

// ── Definições de Conquistas ────────────────────────────────────
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'first_like', title: 'Primeiro Crush', description: 'Deu seu primeiro Like', icon: '💘' },
  { id: 'first_match', title: 'É um Match!', description: 'Conseguiu seu primeiro Match', icon: '🎉' },
  { id: 'first_message', title: 'Quebra-gelo', description: 'Enviou sua primeira mensagem', icon: '💬' },
  { id: 'first_study', title: 'Study Date Marcado', description: 'Enviou um Study Date', icon: '☕' },
  { id: 'five_matches', title: 'Popular no Campus', description: 'Conseguiu 5 Matches', icon: '⭐' },
  { id: 'ten_likes', title: 'Coração Generoso', description: 'Deu 10 Likes', icon: '❤️' },
  { id: 'twenty_swipes', title: 'Ativo no Campus', description: 'Fez 20 swipes', icon: '👆' },
  { id: 'verified', title: 'Verificado IESGO', description: 'Verificou seu perfil', icon: '✅' },
  { id: 'boost_used', title: 'No Holofote', description: 'Usou um Boost de Perfil', icon: '🚀' },
  { id: 'event_attended', title: 'Universitário de Verdade', description: 'Confirmou presença em um evento', icon: '🎓' },
  { id: 'agro_match', title: 'Casal Agro', description: 'Match entre alunos do Agro', icon: '🚜' },
  { id: 'health_match', title: 'Parceiros de Plantão', description: 'Match entre alunos da Saúde', icon: '🏥' },
  { id: 'law_psych', title: 'Debate & Terapia', description: 'Match entre Direito e Psicologia', icon: '⚖️' },
  { id: 'night_owl', title: 'Coruja do Noturno', description: 'Encontrou alguém do mesmo turno', icon: '🦉' },
  { id: 'study_group', title: 'Líder Acadêmico', description: 'Criou um grupo de estudos', icon: '📚' },
];