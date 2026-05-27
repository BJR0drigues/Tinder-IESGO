# 🛡️ Task de Verificação Rigorosa: TinderIESGO

Este documento estabelece o protocolo de auditoria e validação para o projeto **TinderIESGO**. A análise abrange infraestrutura, lógica de negócio, qualidade de código e oportunidades de automação.

---

## 1. 🏗️ Ambiente e Infraestrutura (Docker & Local)

### 1.1 Docker Compose (Atual)
- [ ] **Validação do DB:** O `docker-compose.yml` atual sobe apenas o MySQL.
    - **Ação:** Verificar se o container `tinder-iesgo-mysql` está persistindo dados corretamente no volume `mysql_data`.
    - **Alerta:** O `README.md` menciona SQLite, mas o `schema.prisma` e o Docker usam MySQL. **Inconsistência crítica detectada.**

### 1.2 Dockerização Total (Pendente)
- [ ] **Criar Dockerfile para a App:** Atualmente a app roda via `npm run dev` local.
- [ ] **Orquestração Completa:** Adicionar o serviço da aplicação ao `docker-compose.yml` para garantir que o ambiente de dev seja idêntico ao de produção/homologação.
- [ ] **Variáveis de Ambiente:** Validar se todas as envs do `.env.example` estão mapeadas no container.

---

## 2. 🧪 Testes de Funcionalidade (Checklist Rigoroso)

### 2.1 Fluxo de Autenticação (OTP)
- [ ] **Fallback de Dev:** Confirmar se o código OTP está sendo exibido no console/tela quando o `SMTP_USER` não está configurado.
- [ ] **Excluir OTPs Expirados:** Verificar se existe limpeza de códigos antigos no banco ou se estão acumulando infinitamente.

### 2.2 Algoritmo de Match (Lógica de Negócio)
- [ ] **Filtro de Gênero Recíproco:** 
    - **BUG IDENTIFICADO:** O código atual em `lib/match-algorithm.ts` verifica apenas a preferência de quem está vendo (`viewer`), mas não a do candidato (`candidate`).
    - **Teste:** Se Usuário A (Homem) procura Mulheres, e Usuária B (Mulher) procura apenas Mulheres, a Usuária B **não** deveria aparecer no feed do Usuário A. O sistema atual permite isso.
- [ ] **Cálculo de Score:** Validar se o bônus de curso (ex: "Casal Agro") está aplicando os 95% corretamente.

### 2.3 Cadastro em 15 Etapas
- [ ] **Persistência Parcial:** O que acontece se o usuário fechar a aba na etapa 10? O progresso é perdido ou salvo em rascunho?
- [ ] **Payload de Fotos:** O sistema salva fotos em **Base64 (LongText)** diretamente no MySQL.
    - **Risco de Performance:** Isso causará lentidão extrema no banco com mais de 100 usuários.
    - **Recomendação:** Migrar para S3 ou armazenamento local de arquivos e salvar apenas a URL/Path.

---

## 3. 🔍 Auditoria de Código e Arquitetura

### 3.1 Stack de Versões
- [ ] **Next.js 16.2.2:** Esta versão é suspeita (Next.js está na v15). Verificar se é um erro no `package.json` ou uma versão experimental.
- [ ] **Next.js 14 vs 15:** O README diz Next 14, o código parece usar Next 15/16. Padronizar documentação.

### 3.2 Tipagem e Segurança
- [ ] **Zod Validation:** Adicionar validação de esquema (Zod) em todos os endpoints da API (`app/api/*`) para evitar injeção de lixo no MySQL.
- [ ] **Prisma Middleware:** Implementar soft-delete (isActive: false) em vez de delete real para manter integridade referencial.

---

## 4. 🐛 Bugs e Inconsistências Listadas para Correção

1. **Documentação Mentindo:** README aponta SQLite, Código usa MySQL.
2. **Lógica de Gênero:** Filtro unidirecional em vez de bidirecional.
3. **Fotos no Banco:** Armazenamento ineficiente de imagens em Base64.
4. **Falta de Error Boundaries:** Verificar se a aplicação "quebra" em tela branca se o MySQL cair.

---

## 5. ⚡ Automações Recomendadas (Prioridade Máxima)

### 5.1 Quality Assurance (QA)
- [ ] **Husky + Lint-Staged:** Impedir commits que quebrem o lint ou o build.
- [ ] **GitHub Actions (CI):**
    - Rodar `npm run build` em todo Pull Request.
    - Validar tipos com `tsc --noEmit`.
- [ ] **Testes E2E (Playwright):** Automatizar o teste do fluxo de cadastro (15 etapas) para garantir que nenhuma etapa quebre após futuras atualizações.

### 5.2 DevOps
- [ ] **Script de Backup:** Automação para dump diário do MySQL do Docker.
- [ ] **Healthcheck no Docker:** Adicionar `healthcheck` ao serviço de banco para que a aplicação só suba quando o DB estiver pronto.

---

**Status da Verificação:** 🔴 AGUARDANDO EXECUÇÃO DAS TASKS
**Responsável:** Gemini CLI
**Data:** 26/05/2026
