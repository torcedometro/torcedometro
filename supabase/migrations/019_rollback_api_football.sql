-- =====================================================
-- ROLLBACK API INTEGRATION & RESTORE MOCK DATA
-- =====================================================

-- 1. Limpar Dados (caso tenha sobrado algo)
DELETE FROM public.checkins;
DELETE FROM public.games;
UPDATE public.groups SET club_id = NULL;
DELETE FROM public.clubs;
DELETE FROM public.stadiums;

-- 2. Remover Colunas da API (Clean Slate)
ALTER TABLE public.clubs DROP COLUMN IF EXISTS api_id;
ALTER TABLE public.clubs DROP COLUMN IF EXISTS country;

ALTER TABLE public.stadiums DROP COLUMN IF EXISTS api_id;
ALTER TABLE public.stadiums DROP COLUMN IF EXISTS city;
ALTER TABLE public.stadiums DROP COLUMN IF EXISTS capacity;

ALTER TABLE public.games DROP COLUMN IF EXISTS api_id;
ALTER TABLE public.games DROP COLUMN IF EXISTS league_id;
ALTER TABLE public.games DROP COLUMN IF EXISTS season;
ALTER TABLE public.games DROP COLUMN IF EXISTS round;
ALTER TABLE public.games DROP COLUMN IF EXISTS score_home;
ALTER TABLE public.games DROP COLUMN IF EXISTS score_away;

-- 3. Inserir Clubes Iniciais (Mock Data para teste)
INSERT INTO public.clubs (name, short_name, primary_color)
VALUES
  ('Clube do Remo', 'REM', '#1c1a30'), -- Azul Marinho
  ('Paysandu', 'PAY', '#0091cf'), -- Azul Celeste
  ('Flamengo', 'FLA', '#c3281e'), -- Vermelho
  ('Corinthians', 'COR', '#000000'), -- Preto
  ('Palmeiras', 'PAL', '#006437'),
  ('Vasco da Gama', 'VAS', '#000000'),
  ('Fluminense', 'FLU', '#8a1324'),
  ('Botafogo', 'BOT', '#000000')
ON CONFLICT (name) DO NOTHING;

-- 4. Mock Data de Jogos (Para demonstração)
DO $$
DECLARE
  rem_id UUID;
  pay_id UUID;
  fla_id UUID;
  cor_id UUID;
  stadium_maracana UUID;
  stadium_mangueirao UUID; -- Vamos criar se não existir
BEGIN
  -- Buscar IDs dos clubes
  SELECT id INTO rem_id FROM public.clubs WHERE short_name = 'REM' LIMIT 1;
  SELECT id INTO pay_id FROM public.clubs WHERE short_name = 'PAY' LIMIT 1;
  SELECT id INTO fla_id FROM public.clubs WHERE short_name = 'FLA' LIMIT 1;
  SELECT id INTO cor_id FROM public.clubs WHERE short_name = 'COR' LIMIT 1;

  -- Criar Estádio do Maracanã (Se não existir, pois deletamos tudo acima)
  INSERT INTO public.stadiums (name, latitude, longitude, radius_meters)
  VALUES ('Maracanã', -22.9121, -43.2302, 500)
  RETURNING id INTO stadium_maracana;

  -- Buscar ou Criar Estádio do Mangueirão (Para Remo/Paysandu)
  INSERT INTO public.stadiums (name, latitude, longitude, radius_meters)
  VALUES ('Mangueirão', -1.3813, -48.4442, 800) -- Coordenadas aprox Belém
  RETURNING id INTO stadium_mangueirao;

  -- Inserir Jogos
  -- Jogo 1: Remo vs Paysandu (REXPA) - Acontecendo AGORA (Ativo para teste de check-in)
  INSERT INTO public.games (stadium_id, home_club_id, away_club_id, home_team, away_team, start_time, end_time, status)
  VALUES (
    stadium_mangueirao,
    rem_id,
    pay_id,
    'Clube do Remo',
    'Paysandu',
    NOW() - INTERVAL '30 minutes',
    NOW() + INTERVAL '90 minutes',
    'active'
  );

  -- Jogo 2: Flamengo vs Corinthians - Amanhã (Agendado)
  INSERT INTO public.games (stadium_id, home_club_id, away_club_id, home_team, away_team, start_time, end_time, status)
  VALUES (
    stadium_maracana,
    fla_id,
    cor_id,
    'Flamengo',
    'Corinthians',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 2 hours',
    'scheduled'
  );

  -- Jogo 3: Remo vs Flamengo - Semana que vem
  INSERT INTO public.games (stadium_id, home_club_id, away_club_id, home_team, away_team, start_time, end_time, status)
  VALUES (
    stadium_mangueirao,
    rem_id,
    fla_id,
    'Clube do Remo',
    'Flamengo',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 2 hours',
    'scheduled'
  );

END $$;
