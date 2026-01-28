-- =====================================================
-- STORAGE POLICIES: checkin-photos
-- =====================================================

-- IMPORTANTE: Crie o bucket 'checkin-photos' (Public) no painel antes de rodar.

-- 1. Permitir LEITURA pública (para feed social)
CREATE POLICY "Public Access Checkins"
ON storage.objects FOR SELECT
USING ( bucket_id = 'checkin-photos' );

-- 2. Permitir UPLOAD apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload checkin photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'checkin-photos' AND
  auth.role() = 'authenticated'
);

-- 3. (Opcional) Usuário só pode deletar suas próprias fotos
CREATE POLICY "Users can delete own checkin photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'checkin-photos' AND
  auth.uid() = owner
);
