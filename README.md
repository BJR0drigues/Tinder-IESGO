# 🔥 IESGO Match

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="IESGO Match Banner" width="100%" />
  
  <p><strong>O app de conexões para a comunidade universitária da IESGO - Formosa/GO</strong></p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-97. 1%25-blue? style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![License](https://img. shields.io/badge/License-Private-red?style=flat-square)]()
</div>

---

## 📱 Sobre o Projeto

O **IESGO Match** é um aplicativo estilo Tinder desenvolvido exclusivamente para estudantes, professores e funcionários da IESGO (Instituto de Ensino Superior de Goiás) em Formosa-GO. 

### ✨ Funcionalidades

- 🎴 **Swipe Cards** - Deslize para curtir, passar ou propor um Study Date
- 💬 **Chat em Tempo Real** - Converse com seus matches
- 🤖 **IA Icebreaker** - Sugestões de mensagens geradas com Gemini AI
- 🔍 **Filtros Avançados** - Filtre por curso e interesses
- ✅ **Verificação de Perfil** - Sistema de validação com selfie + IA
- 🎯 **Compatibilidade Acadêmica** - Algoritmo que combina cursos (Casal Agro 🚜, Debate & Terapia ⚖️🧠)
- 📚 **Study Date** - Modo especial para encontros de estudo

### 🎓 Cursos Suportados

Agronomia, Biomedicina, Direito, Enfermagem, Engenharia Civil, Medicina Veterinária, Odontologia, Psicologia, Sistemas de Informação, e mais 11 cursos! 

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave de API do Google Gemini (opcional, para recursos de IA)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/BJR0drigues/IESGO-MATCH. git

# Entre na pasta
cd IESGO-MATCH

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env. local
# Edite . env.local e adicione sua GEMINI_API_KEY

# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |

---

## 🏗️ Arquitetura

```
IESGO-MATCH/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx       # Botão customizado
│   └── Layout.tsx       # Layout com navegação
├── context/
│   └── AppContext.tsx   # Estado global da aplicação
├── pages/               # Páginas/Rotas
│   ├── Auth.tsx         # Login e verificação
│   ├── Feed.tsx         # Tela principal de swipe
│   ├── Matches.tsx      # Lista de matches e chat
│   └── Profile.tsx      # Perfil do usuário
├── services/
│   └── geminiService.ts # Integração com Gemini AI
├── App.tsx              # Componente raiz e rotas
├── constants.ts         # Dados mock e constantes
├── types.ts             # Tipos TypeScript
└── index.html           # HTML principal
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React 19** | Framework UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Build tool |
| **Tailwind CSS** | Estilização |
| **Framer Motion** | Animações |
| **React Router** | Navegação |
| **Lucide React** | Ícones |
| **Google Gemini AI** | Geração de icebreakers e verificação facial |

---

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Login</strong></td>
      <td align="center"><strong>Feed</strong></td>
      <td align="center"><strong>Matches</strong></td>
    </tr>
    <tr>
      <td><img src="docs/login.png" width="200"/></td>
      <td><img src="docs/feed. png" width="200"/></td>
      <td><img src="docs/matches.png" width="200"/></td>
    </tr>
  </table>
</div>

---

## 🔒 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API Key do Google Gemini (opcional)
GEMINI_API_KEY=sua_chave_aqui

# Outras configurações futuras
# VITE_API_URL=https://api.iesgomatch.com
```

---

## 🗺️ Roadmap

- [ ] Backend com autenticação real (Firebase/Supabase)
- [ ] Persistência de dados
- [ ] Notificações push
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Integração com sistema acadêmico IESGO
- [ ] Eventos e grupos de estudo

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3.  Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4.  Push para a branch (`git push origin feature/NovaFeature`)
5.  Abra um Pull Request

---


---

## 👨‍💻 Autor

Brayan J. Rodrigues

---

<div align="center">
  <sub>Do corredor para o coração.  💕</sub>
</div>
