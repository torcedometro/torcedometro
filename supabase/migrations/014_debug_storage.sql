-- DEBUG: Liberar geral para INSERT no checkin-photos
-- Remover policy anterior
DROP POLICY IF EXISTS "Allow uploads to checkin photos for authenticated users" ON storage.objects;

-- Criar policy sem checar auth
CREATE POLICY "DEBUG: Allow ALL uploads to checkin photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'checkin-photos'
);
