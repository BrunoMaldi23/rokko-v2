-- ============================================================
-- 015_catalog_admin_hardening.sql
-- Base final para categorias, orden de cards, ficha tecnica 2D
-- y textos de producto usados por admin/cotizador.
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
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS extract text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mockup_calibrations jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.products
SET extract = left(regexp_replace(description, '\s+', ' ', 'g'), 90)
WHERE (extract IS NULL OR btrim(extract) = '')
  AND description IS NOT NULL
  AND btrim(description) <> '';

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

CREATE INDEX IF NOT EXISTS idx_products_category_sort_order
  ON public.products (category, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_products_active_category_sort_order
  ON public.products (active, category, sort_order);

CREATE INDEX IF NOT EXISTS idx_product_categories_active_sort_order
  ON public.product_categories (active, sort_order, label);

COMMENT ON COLUMN public.products.description IS
  'Descripcion tecnica/comercial completa usada en la ficha tecnica.';

COMMENT ON COLUMN public.products.extract IS
  'Resumen corto para cards del catalogo. Recomendado: 50 a 80 caracteres.';

COMMENT ON COLUMN public.products.mockup_calibrations IS
  'Matriz 2D de posicionamiento de logo por prenda y ubicacion.';
