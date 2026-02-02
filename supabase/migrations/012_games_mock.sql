-- =====================================================
-- FASE 9: VÍNCULO JOGOS <-> CLUBES
-- =====================================================

-- 1. Melhorar tabela de Jogos para usar IDs de Clubes
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS home_club_id UUID REFERENCES public.clubs(id),
ADD COLUMN IF NOT EXISTS away_club_id UUID REFERENCES public.clubs(id);

-- 2. Mock Data de Jogos (Para demonstração)
DO $$
DECLARE
  rem_id UUID;
  pay_id UUID;
  fla_id UUID;
  cor_id UUID;
  stadium_maracana UUID;
  stadium_mangueirao UUID; -- Vamos criar se não existir
BEGIN
  -- Buscar IDs dos clubes (assumindo que foram criados no 011)
  SELECT id INTO rem_id FROM public.clubs WHERE short_name = 'REM' LIMIT 1;
  SELECT id INTO pay_id FROM public.clubs WHERE short_name = 'PAY' LIMIT 1;
  SELECT id INTO fla_id FROM public.clubs WHERE short_name = 'FLA' LIMIT 1;
  SELECT id INTO cor_id FROM public.clubs WHERE short_name = 'COR' LIMIT 1;

  -- Buscar ou Criar Estádio do Mangueirão (Para Remo/Paysandu)
  SELECT id INTO stadium_mangueirao FROM public.stadiums WHERE name = 'Mangueirão';
  IF stadium_mangueirao IS NULL THEN
     INSERT INTO public.stadiums (name, latitude, longitude, radius_meters)
     VALUES ('Mangueirão', -1.3813, -48.4442, 800) -- Coordenadas aprox Belém
     RETURNING id INTO stadium_mangueirao;
  END IF;

  SELECT id INTO stadium_maracana FROM public.stadiums WHERE name = 'Maracanã';

  -- Inserir Jogos
  -- Jogo 1: Remo vs Paysandu (REXPA) - Acontecendo AGORA (Ativo para teste de check-in)
  -- Começou há 30 min, termina em 90 min
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
    stadium_mangueirao, -- Amistoso no pará? rs
    rem_id,
    fla_id,
    'Clube do Remo',
    'Flamengo',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 2 hours',
    'scheduled'
  );

END $$;
