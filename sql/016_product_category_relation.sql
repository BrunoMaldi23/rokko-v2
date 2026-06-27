-- ============================================================
-- 016_product_category_relation.sql
-- Relacion real entre productos y categorias del catalogo.
-- Mantiene products.category como slug publico para no romper rutas.
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

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'poleras',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.products
SET category = 'poleras'
WHERE category IS NULL OR btrim(category) = '';

ALTER TABLE public.products
  ALTER COLUMN category SET DEFAULT 'poleras',
  ALTER COLUMN category SET NOT NULL;

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

-- Protege productos existentes con categorias antiguas o creadas manualmente.
INSERT INTO public.product_categories (slug, label, description, code, sort_order, active)
SELECT DISTINCT
  p.category,
  initcap(replace(p.category, '-', ' ')),
  'Categoria importada desde productos existentes.',
  upper(left(regexp_replace(p.category, '[^a-zA-Z0-9]', '', 'g'), 4)),
  1000 + row_number() OVER (ORDER BY p.category) * 10,
  true
FROM public.products p
LEFT JOIN public.product_categories c ON c.slug = p.category
WHERE p.category IS NOT NULL
  AND btrim(p.category) <> ''
  AND c.slug IS NULL
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_product_categories_slug_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_product_categories_slug_fkey
      FOREIGN KEY (category)
      REFERENCES public.product_categories(slug)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_sort_order
  ON public.products (category, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_products_active_category_sort_order
  ON public.products (active, category, sort_order);

CREATE INDEX IF NOT EXISTS idx_product_categories_active_sort_order
  ON public.product_categories (active, sort_order, label);

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

COMMENT ON COLUMN public.products.category IS
  'Slug FK hacia product_categories.slug. Tambien se usa en rutas publicas /cotizar/[categoria].';
