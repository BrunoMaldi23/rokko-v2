-- ============================================================
-- Migration: Product price tiers
-- Permite escalas por volumen por producto:
-- [{"from":5,"price":12990},{"from":10,"price":11000}]
-- ============================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_tiers jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.products
SET price_tiers = jsonb_build_array(
  jsonb_build_object('from', wholesale_from, 'price', wholesale_price)
)
WHERE
  (price_tiers IS NULL OR price_tiers = '[]'::jsonb)
  AND wholesale_from IS NOT NULL
  AND wholesale_price IS NOT NULL;

COMMENT ON COLUMN public.products.price_tiers IS
  'Escalas de precio unitario por volumen. Formato: [{"from":5,"price":12990}].';

