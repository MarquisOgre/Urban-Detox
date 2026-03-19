
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS health_benefits text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id text;
