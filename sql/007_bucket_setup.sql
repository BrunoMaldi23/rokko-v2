-- ============================================================
-- 007_bucket_setup.sql
-- Crear bucket product-models + seed data para modelos 3D
-- Ejecutar en Supabase SQL Editor DESPUES de 001-006
-- ============================================================

-- ============================================================
-- 1. Crear el bucket product-models (si no existe)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('product-models', 'product-models', true, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Storage RLS policies para product-models
-- ============================================================
DROP POLICY IF EXISTS "Public read product-models" ON storage.objects;
CREATE POLICY "Public read product-models"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-models');

DROP POLICY IF EXISTS "Admin insert product-models" ON storage.objects;
CREATE POLICY "Admin insert product-models"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-models'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

DROP POLICY IF EXISTS "Admin update product-models" ON storage.objects;
CREATE POLICY "Admin update product-models"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-models'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

DROP POLICY IF EXISTS "Admin delete product-models" ON storage.objects;
CREATE POLICY "Admin delete product-models"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-models'
  AND auth.jwt() ->> 'email' = 'admin@rokko.cl'
);

-- ============================================================
-- 3. Asegurar columnas model_3d_* en products
-- ============================================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_scale numeric(8,3) NOT NULL DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_position_y numeric(8,3) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_3d_rotation_y numeric(8,3) NOT NULL DEFAULT 0;

-- ============================================================
-- 4. Asegurar tabla product_models
-- ============================================================
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

-- ============================================================
-- 5. Agregar columna base_model a product_models
--    (marca si es el maniquí base para visualización 2.5D)
-- ============================================================
ALTER TABLE public.product_models ADD COLUMN IF NOT EXISTS base_model boolean NOT NULL DEFAULT false;

-- ============================================================
-- 6. Seed: modelo base (mannequin.glb)
--    Nota: file_path apunta al archivo en storage.
--    Ejecutar seed-script.js para hacer el upload real.
-- ============================================================
INSERT INTO public.product_models (name, category, model_url, file_path, scale, position_y, rotation_y, base_model)
VALUES (
  'Maniquí base',
  'base',
  '/models/mannequin.glb',
  'models/mannequin.glb',
  0.85,
  -0.3,
  0,
  true
)
ON CONFLICT DO NOTHING;
