-- =====================================================
-- FASE 10: INTEGRAÇÃO API-FOOTBALL
-- =====================================================

-- 1. CLUBS: Adicionar ID externo
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS country TEXT;

-- 2. STADIUMS: Adicionar ID externo e cidade
ALTER TABLE public.stadiums
ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER;

-- 3. GAMES: Adicionar ID externo e metadados da competição
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS api_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS league_id INTEGER,
ADD COLUMN IF NOT EXISTS season INTEGER,
ADD COLUMN IF NOT EXISTS round TEXT, -- Ex: "23ª Rodada"
ADD COLUMN IF NOT EXISTS score_home INTEGER,
ADD COLUMN IF NOT EXISTS score_away INTEGER;

-- Índices para performance nas buscas por ID da API
CREATE INDEX IF NOT EXISTS idx_clubs_api_id ON public.clubs(api_id);
CREATE INDEX IF NOT EXISTS idx_games_api_id ON public.games(api_id);
