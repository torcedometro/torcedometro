-- =====================================================
-- FASE 7: MELHORIAS EM GRUPOS (Tipos e Metadados)
-- =====================================================

-- Adicionar colunas para suporte a "Eventos" e "Comunidades"
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'COMMUNITY', -- 'EVENT' ou 'COMMUNITY'
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Criar bucket para imagens de banner de grupos, se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-banners', 'group-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para upload de banners (qualquer autenticado)
CREATE POLICY "Authenticated users can upload group banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-banners' AND
  auth.role() = 'authenticated'
);

-- Policy para leitura pública de banners
CREATE POLICY "Everyone can view group banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-banners');
