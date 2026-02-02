-- =====================================================
-- FIX: STORAGE SECURITY RESTORE (Pós Debug)
-- =====================================================

-- Remover policy de debug (Vale tudo)
DROP POLICY IF EXISTS "DEBUG: Allow ALL uploads to checkin photos" ON storage.objects;

-- Restaurar Policies Seguras para CHECK-IN PHOTOS
DROP POLICY IF EXISTS "Allow uploads to checkin photos for authenticated users" ON storage.objects;

CREATE POLICY "Allow uploads to checkin photos for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'checkin-photos' AND
  auth.role() = 'authenticated'
);
