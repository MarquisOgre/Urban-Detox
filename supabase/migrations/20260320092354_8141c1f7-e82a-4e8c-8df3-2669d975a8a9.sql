DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  total > 0
  AND user_name IS NOT NULL AND btrim(user_name) <> ''
  AND user_phone IS NOT NULL AND btrim(user_phone) <> ''
  AND address IS NOT NULL AND btrim(address) <> ''
  AND payment_method IN ('cod', 'upi')
  AND (
    payment_method <> 'upi'
    OR transaction_id IS NOT NULL AND btrim(transaction_id) <> ''
  )
);

DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  quantity > 0
  AND price >= 0
  AND product_id IS NOT NULL AND btrim(product_id) <> ''
  AND product_name IS NOT NULL AND btrim(product_name) <> ''
);

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT INSERT ON public.order_items TO anon, authenticated;