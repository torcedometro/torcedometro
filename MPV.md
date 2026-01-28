# 📄 DOCUMENTO OFICIAL DO MVP

## Aplicativo de Torcedores – Check‑in, Rankings e Grupos

---

## 1. Visão Geral

**Nome provisório:** Torcedômetro

**Descrição curta:**
Aplicativo mobile que transforma a presença do torcedor no estádio em um jogo social competitivo, com check‑ins em dias de jogo, rankings, grupos e gamificação.

**Plataformas:** iOS e Android

**Desenvolvimento:** Dev solo, React Native + IA (Claude, Gemini), foco em MVP funcional.

---

## 2. Problema

Torcedores fanáticos:

- Não são reconhecidos por sua presença constante
- Não possuem um espaço digital focado em estádio/experiência real
- Usam redes genéricas (Instagram/Twitter) que não valorizam frequência, fidelidade ou comunidade

Clubes e marcas:

- Não possuem dados orgânicos de engajamento presencial
- Não conseguem ativar torcedores fora do ingresso

---

## 3. Proposta de Valor

Criar uma plataforma onde:

- Ir ao estádio vira pontuação
- Presença vira ranking
- Torcedores competem entre si e em grupos
- O futebol é vivido como experiência social gamificada

---

## 4. Público‑Alvo (MVP)

**Persona principal:**

- Torcedor fanático
- Vai ao estádio com frequência
- Usa smartphone durante o jogo
- Gosta de competir, rankear, postar fotos

⚠️ MVP focado inicialmente em **1 clube** ou **1 cidade**.

---

## 5. Objetivo do MVP

Validar:

- Se torcedores fazem check‑in voluntariamente
- Se rankings geram engajamento recorrente
- Se grupos aumentam retenção

❌ O MVP **não** busca monetização imediata.

---

## 6. Escopo do MVP (Funcionalidades)

### 6.1 Autenticação

- Login por e‑mail
- Login social (Google / Apple)
- Criação de perfil básico

---

### 6.2 Perfil do Torcedor

- Foto de perfil
- Nome
- Clube do coração
- Pontuação total
- Ranking atual
- Histórico de check‑ins

---

### 6.3 Check‑in em Dia de Jogo (CORE)

**Regras:**

- Apenas em dias de jogo
- Dentro de raio geográfico do estádio
- Foto tirada na hora (sem galeria)

**Dados registrados:**

- Localização
- Timestamp
- Foto
- Jogo relacionado

---

### 6.4 Sistema de Pontos

**Ações que geram pontos:**

- Check‑in válido
- Postagem durante o jogo
- Check‑in em jogos consecutivos (streak)

**Ações que NÃO geram pontos no MVP:**

- Curtidas
- Comentários

---

### 6.5 Rankings

- Ranking geral do clube
- Ranking semanal
- Ranking mensal

**Atualização:**

- Near real‑time (não instantâneo)

---

### 6.6 Grupos

- Criar grupo (nome + descrição)
- Entrar em grupo por convite
- Ranking interno do grupo

---

### 6.7 Feed Simples

- Postagens de check‑in
- Foto + texto curto
- Curtidas

⚠️ Sem stories, sem chat no MVP.

---

## 7. Funcionalidades Fora do MVP (BACKLOG)

- Integração com ingresso (QR Code)
- Chat em tempo real
- Stories
- Marketplace
- Monetização
- IA antifraude avançada

---

## 8. Regras Antifraude (MVP)

- 1 check‑in por jogo
- Raio máximo configurável (ex: 500m)
- Delay de pontuação
- Foto obrigatória
- Flag manual de abuso

---

## 9. Métricas de Sucesso

- % de usuários que fazem check‑in
- Check‑ins por jogo
- Retenção 7 / 30 dias
- Participação em grupos

---

## 10. Stack Técnica (Definida)

**Mobile:**

- React Native
- Expo
- TypeScript

**Backend:**

- Supabase
- PostgreSQL
- Storage para imagens

---

## 11. Roadmap do MVP

**Semana 1–2:**

- Auth + Perfil

**Semana 3:**

- Check‑in + Geolocalização

**Semana 4:**

- Pontuação + Ranking

**Semana 5:**

- Grupos + Feed

**Semana 6:**

- Testes reais

---

## 12. Critério de Sucesso do MVP

O MVP é considerado um sucesso se:

- Torcedores fazem check‑in espontaneamente
- Rankings são acessados com frequência
- Usuários retornam em mais de um jogo

---

## 13. Visão Pós‑MVP (Resumo)

- Expansão para múltiplos clubes
- Parcerias com torcidas
- Desafios oficiais
- Monetização via clubes e marcas

---

## 14. Planejamento Técnico do MVP (Fases & Tarefas)

Este planejamento segue a **ordem ideal de implementação profissional**, pensado para **dev solo** usando **IA (Claude, Gemini, Antigravity)**, reduzindo retrabalho e permitindo validação contínua.

---

### 🔹 FASE 0 — Preparação & Fundamentos

**Objetivo:** Criar base técnica sólida antes de escrever features.

**Tarefas:**

- Definir repositório Git (monorepo simples)
- Configurar Expo + React Native + TypeScript
- Configurar ESLint + Prettier
- Criar estrutura de pastas (screens, components, services, hooks)
- Criar projeto Supabase
- Configurar variáveis de ambiente
- Definir padrão de commits

**Entregável:** App abre em iOS/Android + conexão Supabase OK

---

### 🔹 FASE 1 — Autenticação & Usuários

**Objetivo:** Permitir login seguro e criação de identidade do torcedor.

**Tarefas:**

- Configurar Auth Supabase (Email + Google/Apple)
- Criar tabela `users` (profile)
- Criar tela de login
- Criar tela de onboarding inicial
- Criar tela de edição de perfil
- Upload de avatar (Supabase Storage)

**Entregável:** Usuário autenticado com perfil salvo

---

### 🔹 FASE 2 — Jogos & Contexto de Estádio

**Objetivo:** Criar a noção de "dia de jogo".

**Tarefas:**

- Criar tabela `games`
- Inserir jogos manualmente (admin)
- Definir estádio + coordenadas
- Criar service para detectar jogo ativo
- Criar regra: jogo ativo por horário

**Entregável:** App sabe se existe jogo ativo

---

### 🔹 FASE 3 — Check‑in (CORE DO PRODUTO)

**Objetivo:** Registrar presença real do torcedor.

**Tarefas:**

- Implementar geolocalização
- Validar raio do estádio
- Implementar câmera (somente foto na hora)
- Criar tabela `checkins`
- Upload da imagem
- Validação: 1 check‑in por jogo

**Entregável:** Check‑in válido salvo no backend

---

### 🔹 FASE 4 — Sistema de Pontuação

**Objetivo:** Transformar presença em recompensa.

**Tarefas:**

- Criar tabela `points`
- Definir regras de pontuação
- Criar trigger ou função RPC
- Atualizar pontuação total do usuário
- Criar sistema de streak

**Entregável:** Pontos acumulam corretamente

---

### 🔹 FASE 5 — Rankings

**Objetivo:** Criar competição visível.

**Tarefas:**

- Criar views SQL para ranking
- Ranking geral
- Ranking semanal
- Ranking mensal
- Tela de ranking
- Paginação e cache

**Entregável:** Rankings funcionando e acessíveis

---

### 🔹 FASE 6 — Grupos

**Objetivo:** Aumentar retenção social.

**Tarefas:**

- Criar tabela `groups`
- Criar tabela `group_members`
- Criar grupo
- Entrar via convite
- Ranking interno do grupo

**Entregável:** Grupos competitivos funcionando

---

### 🔹 FASE 7 — Feed Simples

**Objetivo:** Prova social e engajamento.

**Tarefas:**

- Criar tabela `posts`
- Post automático no check‑in
- Feed cronológico
- Curtidas

**Entregável:** Feed funcional

---

### 🔹 FASE 8 — Antifraude Básico

**Objetivo:** Evitar abuso no MVP.

**Tarefas:**

- Delay na pontuação
- Flags de suspeita
- Logs de localização
- Admin simples no Supabase

**Entregável:** Abusos mitigados

---

### 🔹 FASE 9 — Polimento & Testes Reais

**Objetivo:** Tornar o app utilizável em jogo real.

**Tarefas:**

- UX polish
- Mensagens de erro claras
- Testes em estádio
- Correções

**Entregável:** MVP pronto para usuários reais

---

### 🔹 FASE 10 — Preparação para Escala

**Objetivo:** Deixar o projeto pronto para crescer.

**Tarefas:**

- Monitoramento básico
- Logs
- Backup
- Documentação técnica

---

**Documento vivo — será atualizado conforme validação real.**
