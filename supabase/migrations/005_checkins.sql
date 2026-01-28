-- =====================================================
-- FASE 3: CHECK-INS
-- =====================================================

-- 1. Criar tabela de Check-ins
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  game_id UUID REFERENCES public.games(id) NOT NULL,
  stadium_id UUID REFERENCES public.stadiums(id) NOT NULL,
  photo_url TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Restrição ÚNICA: Um check-in por jogo por usuário
  UNIQUE(user_id, game_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Todos podem VER check-ins (para feed social)
CREATE POLICY "Public checkins view" ON public.checkins FOR SELECT USING (true);

-- Usuários autenticados podem CRIAR check-ins (apenas os seus)
CREATE POLICY "Users can create checkins" ON public.checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Criar bucket específico para check-in photos (se quiser separar do avatar)
-- Vamos aproveitar o bucket de storage policies, mas idealmente criaríamos um 'checkin-photos'
-- Para este MVP, vamos criar uma migration de bucket também se necessário,
-- mas por hora vamos assumir que usaremos o bucket 'checkin-photos' e precisamos criá-lo no painel ou via SQL
-- (Supabase não permite criar bucket via SQL puro de migration facilmente sem extensão, melhor criar via painel ou reusar lógica existente).
-- Vamos instruir o usuário a criar o bucket 'checkin-photos'.
