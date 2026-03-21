
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_customer_id_delivery_date_key;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
