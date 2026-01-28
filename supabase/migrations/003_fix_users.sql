-- =====================================================
-- FIX: Criar perfis para usuários existentes (Backfill)
-- =====================================================

DO $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    SELECT
        id,
        email,
        raw_user_meta_data->>'full_name'
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users);
END $$;
