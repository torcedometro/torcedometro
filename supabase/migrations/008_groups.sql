-- =====================================================
-- FASE 6: GRUPOS (Comunidades)
-- =====================================================

-- 1. Tabela de Grupos
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL, -- Código curto para convite (ex: #BONDE123)
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Membros
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Restrição: Usuário só pode estar uma vez no grupo
  UNIQUE(group_id, user_id)
);

-- 3. RLS Policies

-- Habilitar RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- GROUPS POLICIES
-- Qualquer um pode criar grupo
CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Todos podem ver grupos (mas vamos filtrar no front) ou apenas membros.
-- Para simplicidade do invite, vamos permitir leitura pública por invite_code
CREATE POLICY "Everyone can read groups"
ON public.groups FOR SELECT
USING (true);

-- GROUP MEMBERS POLICIES
-- Usuário pode ver membros dos grupos que ele faz parte
CREATE POLICY "Members can view other members"
ON public.group_members FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  )
);

-- Usuário pode entrar no grupo (Insert se for ele mesmo)
CREATE POLICY "Users can join groups"
ON public.group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário pode sair do grupo
CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
USING (auth.uid() = user_id);


-- 4. Função auxiliar para gerar invite code aleatório (Opcional, faremos no front ou db)
-- Vamos deixar o front gerar ou o usuário escolher por enquanto para simplificar.
