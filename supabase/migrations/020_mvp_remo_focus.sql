-- =====================================================
-- MVP FOCUS: CLUBE DO REMO ONLY
-- =====================================================

-- 1. Limpeza Radical
DELETE FROM public.checkins;
DELETE FROM public.games;
UPDATE public.groups SET club_id = NULL;
DELETE FROM public.group_members;
DELETE FROM public.groups; -- Limpar grupos também para começar do zero
DELETE FROM public.clubs;
DELETE FROM public.stadiums;

-- 2. Inserir CLUBE DO REMO
INSERT INTO public.clubs (name, short_name, primary_color, logo_url)
VALUES
('Clube do Remo', 'REM', '#1c1a30', 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Clube_do_Remo_2004.png');

-- 3. Inserir ESTÁDIO DA CURUZU E MANGUEIRÃO (Para testes de GPS)
-- Vamos focar no Mangueirão como demo
INSERT INTO public.stadiums (name, latitude, longitude, radius_meters)
VALUES ('Mangueirão', -1.3813, -48.4442, 60000000); -- Raio exagerado para você conseguir testar de onde estiver (MVP) apenas mude se quiser testar GPS real

-- 4. Inserir JOGOS DE EXEMPLO
DO $$
DECLARE
  rem_id UUID;
  stadium_id UUID;
BEGIN
  SELECT id INTO rem_id FROM public.clubs WHERE short_name = 'REM' LIMIT 1;
  SELECT id INTO stadium_id FROM public.stadiums WHERE name = 'Mangueirão' LIMIT 1;

  -- JOGO 1: PASSADO (Ontem) - Remo 2 x 0 Paysandu
  INSERT INTO public.games (
    stadium_id, home_club_id, away_club_id,
    home_team, away_team,
    start_time, end_time,
    status
  ) VALUES (
    stadium_id, rem_id, NULL, -- Oponente sem ID
    'Clube do Remo', 'Paysandu',
    NOW() - INTERVAL '1 day 2 hours',
    NOW() - INTERVAL '1 day',
    'finished'
  );

  -- JOGO 2: AGORA (Ao Vivo) - Remo vs Tuna Luso
  -- Começou há 30 min, termina em 90 min
  INSERT INTO public.games (
    stadium_id, home_club_id, away_club_id,
    home_team, away_team,
    start_time, end_time,
    status
  ) VALUES (
    stadium_id, rem_id, NULL,
    'Clube do Remo', 'Tuna Luso',
    NOW() - INTERVAL '30 minutes',
    NOW() + INTERVAL '90 minutes',
    'active'
  );

  -- JOGO 3: FUTURO (Daqui a pouco) - Remo vs Águia
  -- Começa em 2 minutos (para testar a atualização automática)
  INSERT INTO public.games (
    stadium_id, home_club_id, away_club_id,
    home_team, away_team,
    start_time, end_time,
    status
  ) VALUES (
    stadium_id, rem_id, NULL,
    'Clube do Remo', 'Águia de Marabá',
    NOW() + INTERVAL '2 minutes',
    NOW() + INTERVAL '122 minutes',
    'scheduled'
  );

END $$;
