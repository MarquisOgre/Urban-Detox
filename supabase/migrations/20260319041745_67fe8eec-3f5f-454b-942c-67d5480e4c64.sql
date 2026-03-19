ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS ingredients text,
ADD COLUMN IF NOT EXISTS plan_options jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx
ON public.products (slug)
WHERE slug IS NOT NULL;