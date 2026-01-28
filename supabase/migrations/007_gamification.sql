-- =====================================================
-- FASE 4: GAMIFICAÇÃO (Triggers & Ranking)
-- =====================================================

-- 1. Função para atribuir pontos ao fazer check-in
CREATE OR REPLACE FUNCTION public.handle_new_checkin()
RETURNS TRIGGER AS $$
BEGIN
  -- Adiciona 10 pontos ao usuário
  UPDATE public.users
  SET
    total_points = total_points + 10,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger: Disparar sempre que um check-in for criado
DROP TRIGGER IF EXISTS on_checkin_created ON public.checkins;
CREATE TRIGGER on_checkin_created
  AFTER INSERT ON public.checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_checkin();


-- 3. View de Ranking (Leaderboard)
-- Uma forma eficiente de consultar o ranking em tempo real
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  id,
  full_name,
  avatar_url,
  total_points,
  RANK() OVER (ORDER BY total_points DESC) as rank_position
FROM public.users
WHERE total_points > 0
ORDER BY total_points DESC;

-- Permitir leitura da view
GRANT SELECT ON public.leaderboard TO anon, authenticated;
