ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT '';

NOTIFY pgrst, 'reload schema';
