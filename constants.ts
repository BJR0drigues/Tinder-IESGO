import { User, UserRole, Gender } from './types';

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