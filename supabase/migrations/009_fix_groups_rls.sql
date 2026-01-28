-- FIX: RECURSÃO INFINITA EM RLS
-- Removemos a policy recursiva e aplicamos uma estratégia segura

-- 1. Remover policies antigas problemáticas
DROP POLICY IF EXISTS "Members can view other members" ON public.group_members;

-- 2. Solução: Função Helper SECURITY DEFINER
-- Essa função checa se o usuário auth é membro do grupo, sem disparar a RLS novamente
CREATE OR REPLACE FUNCTION is_member_of(_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nova Policy usando a função
CREATE POLICY "Members can view group roster"
ON public.group_members FOR SELECT
USING (
  -- Posso ver se for eu mesmo
  user_id = auth.uid()
  OR
  -- OU se eu for membro do grupo consultado (usando função blindada)
  is_member_of(group_id)
);
