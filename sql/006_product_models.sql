-- ============================================================
-- 006_product_models.sql
-- Modelos 3D para prendas (.glb / .gltf)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_scale numeric(8,3) NOT NULL DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_position_y numeric(8,3) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_rotation_y numeric(8,3) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.product_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'poleras',
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  model_url text NOT NULL,
  file_path text NOT NULL,
  scale numeric(8,3) NOT NULL DEFAULT 1,
  position_y numeric(8,3) NOT NULL DEFAULT 0,
  rotation_y numeric(8,3) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product_models" ON public.product_models;
CREATE POLICY "Public read product_models"
ON public.product_models FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Admin insert product_models" ON public.product_models;
CREATE POLICY "Admin insert product_models"
ON public.product_models FOR INSERT TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin update product_models" ON public.product_models;
CREATE POLICY "Admin update product_models"
ON public.product_models FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@rokko.cl')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin delete product_models" ON public.product_models;
CREATE POLICY "Admin delete product_models"
ON public.product_models FOR DELETE TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@rokko.cl');

-- Crear manualmente o desde Supabase Dashboard un bucket publico llamado product-models.
-- Luego aplicar policies equivalentes a product-images para ese bucket.
DROP POLICY IF EXISTS "Public read product-models" ON storage.objects;
CREATE POLICY "Public read product-models"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-models');

DROP POLICY IF EXISTS "Admin insert product-models" ON storage.objects;
CREATE POLICY "Admin insert product-models"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-models' AND auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin update product-models" ON storage.objects;
CREATE POLICY "Admin update product-models"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-models' AND auth.jwt() ->> 'email' = 'admin@rokko.cl')
WITH CHECK (bucket_id = 'product-models' AND auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin delete product-models" ON storage.objects;
CREATE POLICY "Admin delete product-models"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-models' AND auth.jwt() ->> 'email' = 'admin@rokko.cl');
