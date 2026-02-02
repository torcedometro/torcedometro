# Sincronização API-Football

Este script atualiza os Clubes e Jogos do seu banco Supabase usando a [API-Football (RapidAPI)](https://www.api-football.com/).

## Pré-requisitos

1.  Tenha uma conta na API-Football (Plano Free aceita 100 requisições/dia).
2.  Tenha rodado a migration `supabase/migrations/016_api_football.sql`.

## Configuração

Adicione as seguintes chaves no seu arquivo `.env` na raiz do projeto:

```bash
# Chave da API-Football (RapidAPI)
API_FOOTBALL_KEY=sua_chave_rapidapi_aqui

# URL do seu Projeto Supabase
EXPO_PUBLIC_SUPABASE_URL=sua_url_supabase

# CHAVE DE SERVIÇO (não a anon key) para permitir escrita sem checar usuário logado
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

> **Atenção**: Nunca commite o `.env` com a `SUPABASE_SERVICE_ROLE_KEY` em repositórios públicos!

## Como Rodar

No terminal, na raiz do projeto:

```bash
node scripts/sync-football.js
```

O script irá:
1.  Buscar times da Série A e B (IDs 71 e 72).
2.  Salvar no banco `clubs` com `api_id`.
3.  Buscar jogos (fixtures) da temporada atual.
4.  Salvar no banco `games` vinculando aos clubes.

## Automatização (Futuro)

Para rodar automaticamente todo dia:
1.  Crie uma **Edge Function** no Supabase com este código (adaptado para Deno).
2.  Configure o Cron Job no Supabase Dashboard.
