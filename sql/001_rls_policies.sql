-- ============================================================
-- Migration: RLS Policies para products
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard/project/pbkpurgnzxvjzpfdotbk/sql/new)
-- ============================================================

-- 1. Habilitar Row Level Security en la tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Permitir lectura pública SOLO de productos activos
--    (para el cotizador público)
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (active = true);

-- 3. Permitir lectura ADMIN de TODOS los productos (activos e inactivos)
DROP POLICY IF EXISTS "Admin read all products" ON public.products;
CREATE POLICY "Admin read all products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- 4. Permitir al admin INSERT, UPDATE, DELETE
--    CAMBIA 'admin@rokko.cl' por el email real del usuario que crees en Supabase Auth
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
ON public.products
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@rokko.cl')
WITH CHECK (auth.jwt() ->> 'email' = 'admin@rokko.cl');

DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
ON public.products
FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@rokko.cl');

-- ============================================================
-- NOTA: Si en el futuro agregas más admins, puedes usar un
-- enfoque por tabla de roles o grupo. Por ahora queda acotado
-- a un solo email de administrador.
-- ============================================================
