
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS is_complimentary boolean NOT NULL DEFAULT false;
ALTER TABLE public.delivery_customers ADD COLUMN IF NOT EXISTS payment_threshold integer NOT NULL DEFAULT 7;
