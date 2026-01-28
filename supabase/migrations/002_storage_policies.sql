-- =====================================================
-- STORAGE POLICIES: user-avatars
-- =====================================================

-- IMPORTANTE: Certifique-se de que o bucket 'user-avatars' existe e é PUBLICO.

-- 1. Permitir LEITURA pública de avatares (para que todos vejam as fotos uns dos outros)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user-avatars' );

-- 2. Permitir UPLOAD apenas para usuários autenticados (cada um na sua pasta ou geral)
-- Nota: limitamos o nome do arquivo para garantir que user só mexa no dele se usarmos prefixo,
-- mas para MVP, user autenticado poder fazer upload é o básico.
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.role() = 'authenticated'
);

-- 3. Permitir UPDATE (substituir foto) apenas se for o 'dono' do arquivo
-- (Assumindo que o nome do arquivo contenha o ID do usuário ou que a lógica de app garanta isso)
-- Uma abordagem mais segura é garantir que o nome do arquivo comece com o user_id
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid() = owner -- O Supabase define 'owner' automaticamente no upload
);

-- 4. Permitir DELETE (opcional, se quiser deixar user apagar foto)
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid() = owner
);
