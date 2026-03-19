ALTER TABLE public.order_items
ALTER COLUMN product_id TYPE text
USING product_id::text;