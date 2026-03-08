ALTER TABLE public.visit_billing_items 
ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS note text DEFAULT NULL;