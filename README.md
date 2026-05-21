# Tinder IESGO

Aplicativo de conexões sociais universitárias do IESGO — Formosa, GO. Desenvolvido com Next.js 14 (App Router), Prisma ORM e SQLite.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Banco de Dados | SQLite via Prisma ORM |
| Autenticação | JWT em cookie httpOnly (`iesgo_session`) via `jose` |
| E-mail | nodemailer (SMTP Gmail) com fallback dev |
| Estilo | Tailwind CSS com design system próprio |
| Fontes | Space Grotesk + Outfit (Google Fonts) |
| Animações | Framer Motion |

## Funcionalidades

- **Cadastro em 15 etapas** — nome, contato, OTP, nascimento, gênero, preferências, bio, fotos, interesses, intenção, preferências de busca e notificações
- **Autenticação por OTP** — código de 6 dígitos enviado por e-mail; em dev o código aparece visualmente na tela
- **Algoritmo de Match** — compatibilidade baseada em curso, turno, interesses e intenção (score 0–99%)
- **Feed estilo Tinder** — foto ocupa 100% do card; botões X / ⚡ / ❤️ sobrepostos; arrastar para curtir ou passar
- **Matches e Chat** — lista de matches com chat em tempo real por conversa
- **Eventos do Campus** — lista de eventos com chat e lista de participantes por evento; criação de novos eventos
- **Perfil completo** — carrossel de fotos, banner editável, bio e interesses editáveis, estatísticas e conquistas
- **Responsivo** — layout desktop (top nav + 2 colunas) e mobile (bottom nav) sem quebrar usabilidade

## Design System

- Tema escuro: fundo `#080510`
- Coral `#F07070` · Roxo `#A06090` · Marinho `#304080`
- Gradiente: coral → roxo → marinho

## Estrutura de Arquivos

```
app/
  (auth)/
    login/         → Tela de login com OTP
    register/      → Cadastro em 15 etapas (2 colunas no desktop)
  (app)/
    feed/          → Feed de descoberta (foto 100% do card)
    matches/       → Matches e chat
    events/        → Eventos, chat por evento, participantes, criar evento
    profile/       → Perfil, edição, estatísticas, conquistas
  api/
    auth/          → send-otp, verify-otp, register, login, logout, me
    users/feed     → Feed filtrado e ordenado por compatibilidade
    swipe/         → Swipe + detecção de match
    matches/       → Lista de matches
    messages/      → Chat por match
    profile/       → Atualizar perfil
    events/        → CRUD de eventos
    events/[id]/messages     → Chat do evento
    events/[id]/participants → Participantes do evento
components/
  AppShell.tsx     → Layout (top nav desktop + bottom nav mobile)
context/
  AppContext.tsx   → Estado global
lib/
  auth.ts          → JWT / sessão
  email.ts         → OTP por e-mail + fallback dev
  match-algorithm.ts → Algoritmo de compatibilidade
prisma/
  schema.prisma    → Modelos do banco de dados
  seed.ts          → 6 usuários + 6 eventos de exemplo
public/
  Logo.png         → Logotipo oficial
```

## Instalação

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Sincronizar banco de dados
npx prisma db push

# Popular com dados de teste
npm run prisma:seed

# Rodar em desenvolvimento
npm run dev
```

Acesse em `http://localhost:3000`.

## Variáveis de Ambiente (`.env`)

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="sua-chave-secreta"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app-gmail"
SMTP_FROM="Tinder IESGO <seu-email@gmail.com>"
```

Em desenvolvimento, o código OTP é exibido diretamente na tela — SMTP não é obrigatório para testar.

## Modelos do Banco de Dados

| Modelo | Descrição |
|--------|-----------|
| `User` | Perfil completo, fotos em base64, interesses em JSON |
| `OTPCode` | Códigos de verificação com expiração de 10 min |
| `SwipeAction` | Histórico de swipes (curtir / passar / study date) |
| `Match` | Pares de match mútuo |
| `Message` | Mensagens por match |
| `CampusEvent` | Eventos do campus |
| `EventMessage` | Chat do evento |
| `EventAttendance` | Confirmações de presença |
| `UserStats` | Estatísticas: likes, matches, mensagens, boosts |
| `UserAchievement` | Conquistas desbloqueadas |

## Localização

Fixada em **Formosa, Goiás** — todos os perfis e eventos pertencem ao campus IESGO.

---

Projeto desenvolvido para a disciplina de **Estrutura de Dados** — IESGO, 2025.
