import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed de usuários de demonstração
  const seedUsers = [
    {
      email:       'ana.silva@iesgo.edu.br',
      firstName:   'Ana',
      lastName:    'Silva',
      dateOfBirth: new Date('2001-03-12'),
      gender:      'Mulher',
      pronouns:    'she/her',
      bio:         'Futura advogada. OAB é o foco, mas o barzinho na sexta é sagrado. ⚖️🍷',
      interests:   JSON.stringify(['Leitura', 'Filmes', 'Café', 'Música', 'Arte']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=1']),
      lookingFor:  JSON.stringify(['Homens', 'Todos']),
      course:      'Direito',
      semester:    4,
      shift:       'Noturno',
      intention:   'Amizades & conexões',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 35,
      minAge:      20,
      maxAge:      32,
      verified:    true,
      showGender:  true,
    },
    {
      email:       'marcos.oliveira@iesgo.edu.br',
      firstName:   'Marcos',
      lastName:    'Oliveira',
      dateOfBirth: new Date('1999-07-22'),
      gender:      'Homem',
      pronouns:    'he/him',
      bio:         'Do campo pra cidade. Tereré, sertanejo e muita técnica. 🚜🌾',
      interests:   JSON.stringify(['Natureza', 'Esportes', 'Música', 'Pets', 'Games']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=3']),
      lookingFor:  JSON.stringify(['Mulheres']),
      course:      'Agronomia',
      semester:    7,
      shift:       'Matutino',
      intention:   'Relacionamento sério',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 50,
      minAge:      19,
      maxAge:      28,
      verified:    true,
      showGender:  true,
    },
    {
      email:       'julia.santos@gmail.com',
      firstName:   'Júlia',
      lastName:    'Santos',
      dateOfBirth: new Date('2003-01-08'),
      gender:      'Mulher',
      pronouns:    'she/her',
      bio:         'Caloura sofrendo com lista de material. Alguém pra dividir o prejuízo? 🦷✨',
      interests:   JSON.stringify(['Filmes', 'Viagens', 'Café', 'Arte', 'Yoga']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=5']),
      lookingFor:  JSON.stringify(['Todos']),
      course:      'Biomedicina',
      semester:    2,
      shift:       'Integral',
      intention:   'Amizades & conexões',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 30,
      minAge:      18,
      maxAge:      28,
      verified:    false,
      showGender:  true,
    },
    {
      email:       'lucas.pereira@iesgo.edu.br',
      firstName:   'Lucas',
      lastName:    'Pereira',
      dateOfBirth: new Date('1998-11-15'),
      gender:      'Homem',
      pronouns:    'he/him',
      bio:         'Quase formando. Se seu cachorro late, a gente já se entende. 🐶🩺',
      interests:   JSON.stringify(['Pets', 'Esportes', 'Games', 'Natureza', 'Gastronomia']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=6']),
      lookingFor:  JSON.stringify(['Mulheres', 'Todos']),
      course:      'Medicina Veterinária',
      semester:    9,
      shift:       'Integral',
      intention:   'Relacionamento sério',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 40,
      minAge:      20,
      maxAge:      30,
      verified:    true,
      showGender:  true,
    },
    {
      email:       'fernanda.costa@iesgo.edu.br',
      firstName:   'Fernanda',
      lastName:    'Costa',
      dateOfBirth: new Date('2000-09-03'),
      gender:      'Mulher',
      pronouns:    'she/her',
      bio:         'Freud explica, mas eu prefiro um café. Buscando conexões reais. 🧠☕',
      interests:   JSON.stringify(['Leitura', 'Café', 'Arte', 'Filmes', 'Yoga']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=7']),
      lookingFor:  JSON.stringify(['Homens', 'Pessoas não-binárias']),
      course:      'Psicologia',
      semester:    5,
      shift:       'Noturno',
      intention:   'Amizades & conexões',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 25,
      minAge:      22,
      maxAge:      35,
      verified:    true,
      showGender:  true,
    },
    {
      email:       'rodrigo.mendes@iesgo.edu.br',
      firstName:   'Rodrigo',
      lastName:    'Mendes',
      dateOfBirth: new Date('1999-05-20'),
      gender:      'Homem',
      pronouns:    'he/him',
      bio:         'Dev de dia, gamer de noite. Procurando uma player 2 pra vida real. 💻🎮',
      interests:   JSON.stringify(['Games', 'Tech', 'Música', 'Filmes', 'Café']),
      photos:      JSON.stringify(['https://picsum.photos/400/600?random=8']),
      lookingFor:  JSON.stringify(['Mulheres', 'Pessoas não-binárias']),
      course:      'Bacharelado em Sistema de Informação',
      semester:    8,
      shift:       'Noturno',
      intention:   'Casual / Ver o que rola',
      city:        'Formosa',
      state:       'GO',
      maxDistance: 35,
      minAge:      20,
      maxAge:      28,
      verified:    false,
      showGender:  true,
    },
  ];

  for (const u of seedUsers) {
    const existing = await prisma.user.findFirst({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          ...u,
          role:        'STUDENT',
          isActive:    true,
          notifMatch:  true,
          notifMessage: true,
          notifLike:   false,
          stats: { create: {} },
        },
      });
      console.log(`  ✅ Created user: ${u.firstName} ${u.lastName}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${u.firstName} ${u.lastName}`);
    }
  }

  // Seed de eventos do campus
  const seedEvents = [
    {
      title:       'Calourada IESGO 2026',
      description: 'A maior festa de recepção dos calouros do campus! Muita música, DJ e encontros inesquecíveis.',
      location:    'Quadra Poliesportiva IESGO — Formosa, GO',
      date:        new Date('2026-07-10T19:00:00'),
      category:    'social',
      organizer:   'Atlética IESGO',
      emoji:       '🎉',
    },
    {
      title:       'Semana Acadêmica 2026',
      description: 'Palestras, workshops e minicursos com profissionais de todas as áreas. Horas complementares garantidas!',
      location:    'Auditório Principal IESGO',
      date:        new Date('2026-07-14T08:00:00'),
      category:    'academic',
      organizer:   'Coordenação Acadêmica IESGO',
      emoji:       '📚',
    },
    {
      title:       'Copa IESGO de Futsal',
      description: 'Torneio intercursos de futsal. Formem seus times e representem seus cursos!',
      location:    'Quadra IESGO — Formosa',
      date:        new Date('2026-07-18T14:00:00'),
      category:    'sports',
      organizer:   'Atlética IESGO',
      emoji:       '⚽',
    },
    {
      title:       'Noite Cultural: Talentos IESGO',
      description: 'Mostre seu talento! Música, dança, teatro e muito mais. Inscrições abertas para todos os cursos.',
      location:    'Teatro Campus IESGO',
      date:        new Date('2026-08-01T19:30:00'),
      category:    'cultural',
      organizer:   'DCE IESGO',
      emoji:       '🎵',
    },
    {
      title:       'Hackathon de Inovação IESGO',
      description: '24h de programação, criatividade e inovação. Equipes mistas de diferentes cursos. Premiação para os melhores projetos!',
      location:    'Lab de Informática IESGO',
      date:        new Date('2026-07-25T08:00:00'),
      category:    'academic',
      organizer:   'Curso de Sistemas de Informação',
      emoji:       '💻',
    },
    {
      title:       'Barzinho Universitário',
      description: 'O point dos universitários de Formosa. Reune galera de todos os cursos num rolê descontraído!',
      location:    'Praça do Estudante — Formosa, GO',
      date:        new Date('2026-07-11T18:00:00'),
      category:    'social',
      organizer:   'Atlética IESGO',
      emoji:       '🍺',
    },
  ];

  console.log('\n📅 Criando eventos...');
  for (const ev of seedEvents) {
    const existing = await prisma.campusEvent.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.campusEvent.create({ data: { ...ev, isActive: true } });
      console.log(`  ✅ Evento criado: ${ev.title}`);
    } else {
      console.log(`  ⏭️  Evento já existe: ${ev.title}`);
    }
  }

  console.log('\n🌱 Seed completo!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
