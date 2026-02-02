-- =====================================================
-- FIX: DESAFOGAR CONSTRAINTS PARA SYNC
-- =====================================================

-- 1. Permitir jogos sem estádio definido (TBD)
ALTER TABLE public.games
ALTER COLUMN stadium_id DROP NOT NULL;

-- 2. Garantir que possamos atualizar clubes existentes
-- Apenas garantindo índices úteis
CREATE INDEX IF NOT EXISTS idx_clubs_name ON public.clubs(name);
