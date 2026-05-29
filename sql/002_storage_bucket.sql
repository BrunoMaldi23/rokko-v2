-- ============================================================
-- Storage RLS policies para el bucket product-images
-- Ejecutar en Supabase SQL Editor después de 001_rls_policies.sql
-- ============================================================

-- NOTA: El bucket "product-images" ya fue creado manualmente
-- desde el dashboard de Supabase Storage.

-- 1. Lectura pública (cualquiera puede ver imágenes)
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 2. Admin insert — subir imágenes
DROP POLICY IF EXISTS "Admin insert product-images" ON storage.objects;
CREATE POLICY "Admin insert product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

-- 3. Admin update
DROP POLICY IF EXISTS "Admin update product-images" ON storage.objects;
CREATE POLICY "Admin update product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

-- 4. Admin delete
DROP POLICY IF EXISTS "Admin delete product-images" ON storage.objects;
CREATE POLICY "Admin delete product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

-- ============================================================
-- Aumentar timeout de la DB para queries normales (sin base64)
-- ============================================================
ALTER DATABASE postgres SET statement_timeout = '120000';
