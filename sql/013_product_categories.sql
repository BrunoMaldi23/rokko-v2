-- ============================================================
-- 013_product_categories.sql
-- Categorias administrables para catalogo y productos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  code text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

INSERT INTO public.product_categories (slug, label, description, code, sort_order, active)
VALUES
  ('poleras', 'Poleras', 'Prendas livianas para equipos comerciales y uso diario.', 'PL', 10, true),
  ('camisas', 'Camisas / Blusas', 'Camisas, blusas y prendas ejecutivas para identidad corporativa.', 'CB', 20, true),
  ('polerones', 'Polerones', 'Abrigo corporativo comodo, resistente y personalizable.', 'PR', 30, true),
  ('cortaviento', 'Cortaviento', 'Capas livianas para exterior, activaciones y equipos en terreno.', 'CV', 40, true),
  ('polar', 'Polar', 'Abrigo suave y practico para dotaciones, invierno y uso diario.', 'PO', 50, true),
  ('parkas', 'Parkas', 'Modelos termicos, impermeables y tecnicos para exterior.', 'PK', 60, true),
  ('pantalones', 'Pantalones', 'Lineas funcionales para operacion, oficina y terreno.', 'PT', 70, true)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  code = EXCLUDED.code,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active product_categories" ON public.product_categories;
CREATE POLICY "Public read active product_categories"
ON public.product_categories
FOR SELECT
TO anon, authenticated
USING (active = true);

DROP POLICY IF EXISTS "Admin read all product_categories" ON public.product_categories;
CREATE POLICY "Admin read all product_categories"
ON public.product_categories
FOR SELECT
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin write product_categories" ON public.product_categories;
CREATE POLICY "Admin write product_categories"
ON public.product_categories
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "Admin update product_categories" ON public.product_categories;
CREATE POLICY "Admin update product_categories"
ON public.product_categories
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

DROP POLICY IF EXISTS "Admin delete product_categories" ON public.product_categories;
CREATE POLICY "Admin delete product_categories"
ON public.product_categories
FOR DELETE
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
