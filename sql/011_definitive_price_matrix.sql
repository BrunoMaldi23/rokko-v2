ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_tiers jsonb NOT NULL DEFAULT '[]'::jsonb;

WITH price_matrix(slug, unit_price, tiers) AS (
  VALUES
    ('poleron-cuello-redondo-polo', 17900, '[{"from":5,"price":17490},{"from":10,"price":16990},{"from":15,"price":16490}]'::jsonb),
    ('poleron-polo-unisex', 17900, '[{"from":5,"price":17490},{"from":10,"price":16990},{"from":15,"price":16490}]'::jsonb),
    ('poleron-canguro', 25990, '[{"from":5,"price":24990},{"from":10,"price":23990},{"from":15,"price":22990}]'::jsonb),

    ('parka-hombre-desmontable-puno-sin-gorro', 55990, '[{"from":5,"price":54490},{"from":10,"price":52990},{"from":15,"price":51490}]'::jsonb),
    ('parka-hombre-desmontable-puno', 47990, '[{"from":5,"price":46490},{"from":10,"price":45490},{"from":15,"price":43990}]'::jsonb),
    ('chaqueta-parka-premium-softshell', 65990, '[{"from":5,"price":59990},{"from":10,"price":56990},{"from":15,"price":54990}]'::jsonb),
    ('softshell-termico-premium-hombre', 52000, '[{"from":5,"price":44990},{"from":10,"price":41990},{"from":15,"price":39990}]'::jsonb),
    ('softshell-termico-premium-mujer', 52000, '[{"from":5,"price":44990},{"from":10,"price":41990},{"from":15,"price":39990}]'::jsonb),
    ('softshell-basico-hombre', 32900, '[{"from":5,"price":31990},{"from":10,"price":30990},{"from":15,"price":29990}]'::jsonb),
    ('softshell-basico-mujer', 32900, '[{"from":5,"price":31990},{"from":10,"price":30990},{"from":15,"price":29990}]'::jsonb),

    ('micropolar-hombre', 19500, '[{"from":5,"price":18990},{"from":10,"price":18490},{"from":15,"price":17990}]'::jsonb),
    ('micropolar-mujer', 19500, '[{"from":5,"price":18990},{"from":10,"price":18490},{"from":15,"price":17990}]'::jsonb),

    ('s-n', 9155, '[{"from":5,"price":8990},{"from":10,"price":8790},{"from":15,"price":8490}]'::jsonb),
    ('heavy-cotton-mc', 9155, '[{"from":5,"price":8990},{"from":10,"price":8790},{"from":15,"price":8490}]'::jsonb),
    ('heavy-cotton-ml', 9155, '[{"from":5,"price":8990},{"from":10,"price":8790},{"from":15,"price":8490}]'::jsonb),
    ('polo-ejecutiva-dryfresh', 15990, '[{"from":5,"price":15490},{"from":10,"price":14990},{"from":15,"price":14490}]'::jsonb),
    ('cuello-camisa-ejecutiva', 15990, '[{"from":5,"price":15490},{"from":10,"price":14990},{"from":15,"price":14490}]'::jsonb),
    ('cuello-camisa-sport', 14469, '[{"from":5,"price":13990},{"from":10,"price":13490},{"from":15,"price":12990}]'::jsonb),
    ('cuello-camisa-essential', 12990, '[{"from":5,"price":12490},{"from":10,"price":11990},{"from":15,"price":11490}]'::jsonb),

    ('pantalon-cargo-metalico', 21530, '[{"from":5,"price":20990},{"from":10,"price":20490},{"from":15,"price":19990}]'::jsonb),
    ('pantalon-cargo-rodilla-reforzada', 21530, '[{"from":5,"price":20990},{"from":10,"price":20490},{"from":15,"price":19990}]'::jsonb),

    ('camisa-putdoor', 25198, '[{"from":5,"price":24490},{"from":10,"price":23990},{"from":15,"price":22990}]'::jsonb),
    ('blusa-putdoor', 25198, '[{"from":5,"price":24490},{"from":10,"price":23990},{"from":15,"price":22990}]'::jsonb)
)
UPDATE public.products AS p
SET
  price = pm.unit_price,
  wholesale_from = 15,
  wholesale_price = (pm.tiers -> 2 ->> 'price')::integer,
  price_tiers = pm.tiers
FROM price_matrix AS pm
WHERE p.slug = pm.slug;

COMMENT ON COLUMN public.products.price_tiers IS
  'Escalas de precio unitario por volumen. Formato: [{"from":5,"price":12990}].';
