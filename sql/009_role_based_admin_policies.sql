-- ============================================================
-- 009_role_based_admin_policies.sql
-- Reemplaza policies basadas en email fijo por rol del usuario
-- autenticado en Supabase Auth.
--
-- Requisito para admins:
--   app_metadata.role = 'admin'
-- o, por compatibilidad:
--   user_metadata.role = 'admin'
-- ============================================================

-- ============================================================
-- products
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (active = true);

DROP POLICY IF EXISTS "Admin read all products" ON public.products;
CREATE POLICY "Admin read all products"
ON public.products
FOR SELECT
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- ============================================================
-- product_models
-- ============================================================
ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product_models" ON public.product_models;
CREATE POLICY "Public read product_models"
ON public.product_models
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admin insert product_models" ON public.product_models;
CREATE POLICY "Admin insert product_models"
ON public.product_models
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update product_models" ON public.product_models;
CREATE POLICY "Admin update product_models"
ON public.product_models
FOR UPDATE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin delete product_models" ON public.product_models;
CREATE POLICY "Admin delete product_models"
ON public.product_models
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- ============================================================
-- brand_settings
-- ============================================================
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read brand_settings" ON public.brand_settings;
CREATE POLICY "Public read brand_settings"
ON public.brand_settings
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admin write brand_settings" ON public.brand_settings;
CREATE POLICY "Admin write brand_settings"
ON public.brand_settings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update brand_settings" ON public.brand_settings;
CREATE POLICY "Admin update brand_settings"
ON public.brand_settings
FOR UPDATE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin delete brand_settings" ON public.brand_settings;
CREATE POLICY "Admin delete brand_settings"
ON public.brand_settings
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- ============================================================
-- commercial_settings
-- ============================================================
ALTER TABLE public.commercial_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read commercial_settings" ON public.commercial_settings;
CREATE POLICY "Public read commercial_settings"
ON public.commercial_settings
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admin write commercial_settings" ON public.commercial_settings;
CREATE POLICY "Admin write commercial_settings"
ON public.commercial_settings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update commercial_settings" ON public.commercial_settings;
CREATE POLICY "Admin update commercial_settings"
ON public.commercial_settings
FOR UPDATE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin delete commercial_settings" ON public.commercial_settings;
CREATE POLICY "Admin delete commercial_settings"
ON public.commercial_settings
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- ============================================================
-- quotes
-- ============================================================
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert quotes" ON public.quotes;
CREATE POLICY "Public insert quotes"
ON public.quotes
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin select quotes" ON public.quotes;
CREATE POLICY "Admin select quotes"
ON public.quotes
FOR SELECT
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update quotes" ON public.quotes;
CREATE POLICY "Admin update quotes"
ON public.quotes
FOR UPDATE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin delete quotes" ON public.quotes;
CREATE POLICY "Admin delete quotes"
ON public.quotes
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- ============================================================
-- storage: product-images
-- ============================================================
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin insert product-images" ON storage.objects;
CREATE POLICY "Admin insert product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin update product-images" ON storage.objects;
CREATE POLICY "Admin update product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin delete product-images" ON storage.objects;
CREATE POLICY "Admin delete product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);

-- ============================================================
-- storage: product-models
-- ============================================================
DROP POLICY IF EXISTS "Public read product-models" ON storage.objects;
CREATE POLICY "Public read product-models"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-models');

DROP POLICY IF EXISTS "Admin insert product-models" ON storage.objects;
CREATE POLICY "Admin insert product-models"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-models'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin update product-models" ON storage.objects;
CREATE POLICY "Admin update product-models"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-models'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'product-models'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin delete product-models" ON storage.objects;
CREATE POLICY "Admin delete product-models"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-models'
  AND (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  )
);
