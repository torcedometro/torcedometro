# Torcedômetro - MVP

Aplicativo mobile gamificado para torcedores de futebol que recompensa presença no estádio com pontos, rankings e recursos sociais.

## 🚀 Stack Técnica

- **Mobile**: React Native (Expo SDK 54), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Navegação**: React Navigation
- **Estilo**: StyleSheet (Mobile-first design)

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis (atoms, molecules, organisms)
├── features/       # Módulos por funcionalidade (Auth, CheckIn, Feed)
├── hooks/          # Custom React hooks
├── screens/        # Telas principais
├── services/       # Supabase & API services
├── store/          # Gerenciamento de estado (Zustand)
├── theme/          # Design system tokens
├── types/          # Definições TypeScript
└── utils/          # Funções auxiliares
```

## 🛠️ Setup

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   - Copie `.env.example` para `.env`
   - Adicione suas credenciais do Supabase

3. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

## 📱 Comandos Disponíveis

- `npm start` - Inicia o Expo Dev Server
- `npm run android` - Abre no emulador/dispositivo Android
- `npm run ios` - Abre no simulador iOS
- `npm run web` - Abre no navegador
- `npm run lint` - Executa ESLint
- `npm run format` - Formata código com Prettier

## 🔐 Configuração do Supabase

Você precisará de um projeto Supabase com as seguintes tabelas (SQL será fornecido na Fase 1):
- `users` - Perfis de usuários
- `games` - Jogos e estádios
- `checkins` - Check-ins dos torcedores
- `points` - Sistema de pontuação
- `groups` - Grupos de torcedores
- `posts` - Feed social

## 📋 Fases do MVP

- [x] **Fase 0**: Preparação & Fundamentos
- [ ] **Fase 1**: Autenticação & Usuários
- [ ] **Fase 2**: Jogos & Contexto de Estádio
- [ ] **Fase 3**: Check-in (CORE)
- [ ] **Fase 4**: Sistema de Pontuação
- [ ] **Fase 5**: Rankings
- [ ] **Fase 6**: Grupos
- [ ] **Fase 7**: Feed Simples
- [ ] **Fase 8**: Antifraude Básico
- [ ] **Fase 9**: Polimento & Testes Reais
- [ ] **Fase 10**: Preparação para Escala

## 📄 Licença

Privado - Uso interno apenas.
