-- =====================================================
-- FASE 8: CLUBES E TIMES
-- =====================================================

-- 1. Tabela de Clubes
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'Flamengo', 'Remo'
  short_name TEXT, -- 'FLA', 'REM'
  logo_url TEXT,
  primary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Leitura Pública
CREATE POLICY "Public clubs view" ON public.clubs FOR SELECT USING (true);


-- 2. Inserir Clubes Iniciais (Mock Data para teste)
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


-- 3. Atualizar tabela de Grupos para vincular ao clube
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubs(id);
-- Vamos manter a integridade via ID agora que temos a tabela.
