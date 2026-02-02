-- =====================================================
-- FIX: STORAGE BUCKETS E POLICIES
-- =====================================================

-- 1. Garantir que os buckets existem
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkin-photos', 'checkin-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('group-banners', 'group-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpar policies antigas para evitar duplicidade e confusão
DROP POLICY IF EXISTS "Public Access Checkins" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload group banners" ON storage.objects;
DROP POLICY IF EXISTS "Everyone can view group banners" ON storage.objects;

-- 3. Recriar Policies para CHECK-IN PHOTOS
CREATE POLICY "Give access to checkin photos to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'checkin-photos');

CREATE POLICY "Allow uploads to checkin photos for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'checkin-photos' AND
  auth.role() = 'authenticated'
);

-- 4. Recriar Policies para GROUP BANNERS
CREATE POLICY "Give access to group banners to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-banners');

CREATE POLICY "Allow uploads to group banners for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-banners' AND
  auth.role() = 'authenticated'
);
