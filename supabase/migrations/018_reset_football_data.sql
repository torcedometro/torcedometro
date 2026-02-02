-- =====================================================
-- RESET FOOTBALL DATA (LIMPEZA TOTAL)
-- =====================================================

-- 1. Limpar Check-ins (dependem de games)
DELETE FROM public.checkins;

-- 2. Limpar Jogos
DELETE FROM public.games;

-- 3. Desvincular Grupos de Clubes antigos (para não deletar os grupos)
UPDATE public.groups SET club_id = NULL;

-- 4. Limpar Clubes
DELETE FROM public.clubs;

-- 5. Limpar Estádios
DELETE FROM public.stadiums;

-- Resetar sequências se necessário (opcional)
