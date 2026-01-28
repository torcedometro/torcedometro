-- =====================================================
-- FASE 2: ESTÁDIOS E JOGOS
-- =====================================================

-- 1. Tabela de Estádios
CREATE TABLE IF NOT EXISTS public.stadiums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER DEFAULT 500, -- Raio paara check-in válido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Jogos
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stadium_id UUID REFERENCES public.stadiums(id) NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, active, finished
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS (Leitura pública)
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public stadiums view" ON public.stadiums FOR SELECT USING (true);
CREATE POLICY "Public games view" ON public.games FOR SELECT USING (true);

-- 4. Inserir Dados Mock (EXEMPLO: Maracanã e Allianz Parque)
-- Inserindo Estádios
INSERT INTO public.stadiums (name, latitude, longitude, radius_meters)
VALUES
  ('Maracanã', -22.9121, -43.2302, 800),
  ('Allianz Parque', -23.5274, -46.6784, 600);

-- Inserindo Jogo de Teste (HOJE, agora mesmo, para teste)
-- Este jogo irá aparecer como "ativo" se você rodar o SQL agora.
-- Start time: Agora - 1 hora | End time: Agora + 2 horas
DO $$
DECLARE
  maracana_id UUID;
BEGIN
  SELECT id INTO maracana_id FROM public.stadiums WHERE name = 'Maracanã' LIMIT 1;

  INSERT INTO public.games (stadium_id, home_team, away_team, start_time, end_time, status)
  VALUES (
    maracana_id,
    'Flamengo',
    'Fluminense',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '2 hours',
    'active'
  );
END $$;
