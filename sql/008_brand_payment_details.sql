-- ============================================================
-- Migration: Payment details for quote documents
-- Ejecutar en Supabase SQL Editor despues de 003_tables.sql
-- ============================================================

ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS bank_name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_type text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_number text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_holder text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_rut text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_account_email text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS payment_notes text NOT NULL DEFAULT '';
