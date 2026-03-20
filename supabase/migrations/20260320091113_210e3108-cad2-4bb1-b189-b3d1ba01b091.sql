INSERT INTO public.products (name, slug, category, price, description, ingredients, health_benefits, image_url, images, plan_options, is_active)
VALUES (
  'Aloevera Juice',
  'aloevera-juice',
  'Aloevera',
  79,
  'Pure cold-pressed aloevera juice packed with natural healing properties. This ancient superfood drink supports digestive health, boosts immunity, and promotes radiant skin from within.',
  'Fresh Aloe Vera Gel, Lemon, Honey, Mint, Filtered Water',
  'Supports digestive health and soothes the gut lining. Rich in antioxidants and vitamins A, C, E that boost immunity. Promotes healthy, glowing skin and reduces inflammation. Helps detoxify the liver and supports natural cleansing. Aids in weight management and improves nutrient absorption.',
  'https://czsspumqlfxuzwwkfbmb.supabase.co/storage/v1/object/public/site-assets/products%2Faloevera-juice.jpg',
  '[]'::jsonb,
  '[{"key":"reset","label":"Urban Reset","subLabel":"1 Day Detox","price":79},{"key":"cleanse","label":"Urban Cleanse","subLabel":"7 Day Detox","price":499},{"key":"transform","label":"Urban Transform","subLabel":"30 Day Detox","price":1999,"badge":"Best Value"}]'::jsonb,
  true
);