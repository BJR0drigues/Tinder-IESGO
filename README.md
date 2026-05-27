<div align="center">
  <img src="Logo.png" alt="Tinder IESGO Logo" width="180">
  
  # Tinder IESGO
  
  **App fullstack de conexões sociais universitárias.**
  
  [![Status](https://img.shields.io/badge/status-em_desenvolvimento-e53935?style=for-the-badge)](#)
  [![Next.js](https://img.shields.io/badge/Next.js_14-0a0a0a?style=for-the-badge&logo=next.js&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-0a0a0a?style=for-the-badge&logo=typescript&logoColor=3178c6)](#)
  [![Prisma](https://img.shields.io/badge/Prisma-0a0a0a?style=for-the-badge&logo=prisma&logoColor=white)](#)
  [![MySQL](https://img.shields.io/badge/MySQL-0a0a0a?style=for-the-badge&logo=mysql&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0a0a0a?style=for-the-badge&logo=tailwindcss&logoColor=06b6d4)](#)
</div>

---

## 📖 Sobre o Projeto

App fullstack de conexões sociais para estudantes do **IESGO — Formosa, GO**. Inspirado na dinâmica de swipes, mas adaptado para o contexto acadêmico: você dá match por curso, turno e interesses, além de participar de eventos exclusivos do campus e conversar em tempo real.

Projeto desenvolvido com foco em **UX Premium**, arquitetura de **API REST** e um algoritmo de compatibilidade próprio.

---

## ✨ Features

### 🔑 Autenticação & Segurança
*   **Cadastro Guiado:** Fluxo de 15 etapas com stepper visual.
*   **OTP por E-mail:** Login sem senha usando código de 6 dígitos (expira em 10 min).
*   **JWT Seguro:** Sessões mantidas em cookies `httpOnly`.
*   **Fallback Dev:** O OTP é exibido no console/tela quando o SMTP não está configurado.

### 🔥 Feed e Sistema de Match
*   **UI Imersiva:** Feed de descoberta onde a foto ocupa 100% do card.
*   **Gestos & Ações:** Arraste para curtir/passar ou use os botões nativos.
*   **Algoritmo Inteligente:** Score de compatibilidade (0-99%) baseado no seu curso, intenção e interesses.
*   **Filtros de Busca:** Refine sua busca por gênero e intenção.

### 💬 Social & Interação
*   **Chat em Tempo Real:** Converse com seus matches de forma fluida.
*   **Eventos do Campus:** Descubra festas e palestras, confirme presença e veja quem vai.
*   **Perfil Dinâmico:** Carrossel de fotos, bio, banner editável e estatísticas.
*   **Gamificação:** Conquistas desbloqueadas conforme o uso do app.

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Detalhe |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 | App Router, Server Components e rotas API |
| **Banco de Dados** | MySQL (Prisma) | Modelagem relacional rodando via Docker |
| **Autenticação** | JWT + Jose | Cookies blindados e geração de OTP via e-mail |
| **E-mail** | Nodemailer | Disparo SMTP ou fallback local |
| **Estilização** | Tailwind CSS | Tema escuro absoluto, design system moderno |
| **Animações** | Framer Motion | Swipes orgânicos e micro-interações fluidas |

---

## 🚀 Como Rodar Localmente

Siga o passo a passo abaixo para rodar o projeto na sua máquina:

```bash
# 1. Clone o repositório
git clone https://github.com/BJR0drigues/Tinder-IESGO.git
cd Tinder-IESGO

# 2. Instale as dependências
npm install --legacy-peer-deps

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do banco e chaves secretas

# 4. Sincronize o banco de dados MySQL
npx prisma db push

# 5. Popule o banco com dados fictícios para teste
npm run prisma:seed

# 6. Inicie o servidor
npm run dev
```

Acesse a aplicação em `http://localhost:3001`.

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do projeto com o seguinte formato:

```env
# Conexão com o Banco (MySQL)
DATABASE_URL="mysql://usuario:senha@localhost:3306/tinder_iesgo"

# Chave do JWT
JWT_SECRET="sua-chave-secreta-aqui"

# Configuração de E-mail (Opcional em Dev)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app-gmail"
SMTP_FROM="Tinder IESGO <seu-email@gmail.com>"
```

---

<div align="center">
  <i>Projeto local. Campus real. Lógica própria.</i><br>
  <strong>Desenvolvido para o LADS — IESGO, 2025.</strong>
</div>
