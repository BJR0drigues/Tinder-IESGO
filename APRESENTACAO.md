# Apresentação: Tinder IESGO 🎓🔥

Este documento serve como guia completo para a apresentação do projeto **Tinder IESGO**. Ele detalha o escopo, as tecnologias escolhidas (e os motivos), a lógica por trás das funcionalidades e a arquitetura geral da aplicação.

---

## 1. O Que É o Tinder IESGO?
O Tinder IESGO é um aplicativo web fullstack de **conexões sociais e networking** exclusivo para os estudantes do IESGO (Formosa - GO). 

**Diferente de um app de relacionamentos comum**, ele adapta a dinâmica de "swipes" (arrastar para curtir ou rejeitar) para o contexto universitário. O algoritmo não foca apenas em gênero ou distância, mas sim em **curso, semestre, turno e intenções** (desde encontrar um grupo para TCC até relacionamentos sérios). Além do feed de conexões, a plataforma integra **Eventos do Campus**, permitindo que os alunos descubram palestras, choppadas e hackathons.

---

## 2. Stack Tecnológico e o "Por Quê"

O projeto foi construído utilizando um ecossistema moderno focado em performance, tipagem estática e experiência do desenvolvedor (DX).

### ⚡ Frontend & Backend Integrados (Next.js 14)
- **Tecnologia:** Next.js (App Router) + React 18.
- **O Porquê:** O Next.js permite ter o front e a API no mesmo repositório (Serverless Functions/API Routes). Com o App Router, aproveitamos os Server Components, que renderizam no servidor e enviam apenas o HTML final para o cliente, reduzindo o peso do JavaScript no navegador e deixando o carregamento inicial instantâneo.

### 🛡️ Tipagem Estática (TypeScript)
- **Tecnologia:** TypeScript superset do JavaScript.
- **O Porquê:** Em uma aplicação onde lidamos com objetos complexos (perfis de usuários, arrays de fotos, algoritmos de match), o TypeScript evita erros bobos de execução (ex: tentar acessar `user.photo` ao invés de `user.photos`). Ele garante contratos estritos entre a API e a interface.

### 🗄️ Banco de Dados e ORM (MySQL + Prisma)
- **Tecnologia:** MySQL 8.0 rodando via Docker e Prisma ORM.
- **O Porquê:** O MySQL é maduro e robusto para dados relacionais (ex: "Usuário X deu Like no Usuário Y"). O Prisma atua como a ponte entre o Node.js e o banco, gerando tipagens automáticas e eliminando a necessidade de escrever queries SQL manuais, acelerando a modelagem do banco.

### 🎨 Estilização e UX (Tailwind CSS + Framer Motion)
- **Tecnologia:** Tailwind CSS (Utility-first CSS) e Framer Motion (Biblioteca de animações).
- **O Porquê:** O Tailwind permite construir interfaces responsivas e um tema escuro premium diretamente no JSX, sem alternar para arquivos `.css`. Já o Framer Motion é o motor por trás dos "swipes" orgânicos do feed. Ele mapeia os gestos de arrastar do mouse/dedo e calcula a física elástica para dar o efeito "Tinder".

---

## 3. Fluxo de Autenticação (Passwordless + OTP)

A segurança do aplicativo foi desenhada para ser fluida e blindada.

1. **Sem Senhas (Passwordless):** O aluno não cria senha. Ele insere o e-mail institucional e recebe um **OTP (One-Time Password) de 6 dígitos**.
2. **Nodemailer:** É usado para disparar o e-mail em tempo real. Se estiver em ambiente local de testes, o sistema faz um "fallback" e exibe o código no próprio terminal/tela.
3. **JWT (JSON Web Token) e Cookies HTTPOnly:** Quando o aluno acerta o código, o backend assina um token JWT. Esse token é guardado nos Cookies do navegador com a flag `httpOnly`. 
   - *Por que httpOnly?* Porque impede que extensões maliciosas ou scripts XSS roubem o token de sessão do usuário. Apenas requisições HTTP podem transportá-lo.

---

## 4. A Lógica de Match (Compatibilidade)

O sistema de Match não é aleatório. Ao carregar o feed, a API calcula o **Score de Compatibilidade** entre o usuário logado e os perfis da tela.

- **Fatores Analisados:**""
  - Estão no mesmo curso?
  - Estudam no mesmo turno/semestre?
  - Têm a mesma intenção (ex: Relacionamento, Amizades, Networking)?
  - Possuem interesses em comum (Tags)?
- **O Resultado:** Uma nota de 0 a 99% que define a ordem em que os perfis aparecem. Um selo (ex: "Mesmo curso", "Super compatível") é exibido dinamicamente.

---

## 5. Próximos Passos (VPS & Deploy)

Para colocar o sistema no ar (Produção):
1. **Docker Compose:** Será usado para provisionar o banco MySQL na VPS de forma isolada e segura.
2. **Node Process / PM2:** O build de produção (`npm run build`) será executado, e o Next.js será servido por um gerenciador de processos como o PM2, para garantir que reinicie caso ocorra uma falha.
3. **Nginx Reverso:** O servidor Nginx receberá o tráfego da internet (porta 80/443) e direcionará para a porta interna do Next.js (3001).
4. **Variáveis de Ambiente (.env):** As chaves de JWT e SMTP serão reais, sem exibir fallback no frontend.

---

*Documento gerado para servir de base para o roteiro da apresentação. Destaque a experiência do usuário (swipes), a arquitetura Serverless do Next.js e o uso de OTP para segurança.*
