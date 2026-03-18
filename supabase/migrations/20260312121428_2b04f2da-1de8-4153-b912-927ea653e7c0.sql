
-- Create admin user directly in auth.users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@gmail.com',
  crypt('qwerty@123456', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', ''
);

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@gmail.com';

-- Seed products
INSERT INTO public.products (name, description, price, category, image_url, stock) VALUES
  ('Wheatgrass Shot', 'Fresh organic wheatgrass juice packed with chlorophyll and nutrients', 49.00, 'Wheatgrass', '/placeholder.svg', 100),
  ('Wheatgrass Combo Pack', 'Pack of 7 wheatgrass shots for a week', 299.00, 'Wheatgrass', '/placeholder.svg', 50),
  ('Ash Gourd Juice', 'Cooling detox ash gourd juice for daily wellness', 39.00, 'Ash Gourd', '/placeholder.svg', 100),
  ('Ash Gourd Detox Pack', 'Pack of 7 ash gourd juices for a full week cleanse', 249.00, 'Ash Gourd', '/placeholder.svg', 50),
  ('Carrot Juice', 'Beta-carotene rich fresh carrot juice', 45.00, 'Carrot', '/placeholder.svg', 100),
  ('Carrot Ginger Blend', 'Carrot juice with a hint of ginger for extra zing', 55.00, 'Carrot', '/placeholder.svg', 80),
  ('Beetroot Juice', 'Blood purifying fresh beetroot elixir', 45.00, 'Beetroot', '/placeholder.svg', 100),
  ('Beetroot Power Pack', 'Beetroot juice with pomegranate for extra iron', 59.00, 'Beetroot', '/placeholder.svg', 60),
  ('Tomato Juice', 'Antioxidant powerhouse fresh tomato juice', 35.00, 'Tomato', '/placeholder.svg', 100),
  ('Tomato Basil Blend', 'Tomato juice with fresh basil for a savory twist', 45.00, 'Tomato', '/placeholder.svg', 70),
  ('Mix Veg Juice', 'Ultimate wellness combo of mixed vegetables', 55.00, 'Mix Veg', '/placeholder.svg', 100),
  ('Mix Veg Premium', 'Premium blend of 8 vegetables with herbs', 69.00, 'Mix Veg', '/placeholder.svg', 50),
  ('Daily Detox Pack', 'Assorted juices for a 7-day detox program', 399.00, 'Mix Veg', '/placeholder.svg', 30),
  ('Immunity Booster Set', 'Wheatgrass + Beetroot + Carrot combo pack', 149.00, 'Wheatgrass', '/placeholder.svg', 40),
  ('Weight Loss Pack', 'Ash Gourd + Mix Veg + Tomato juice combo', 129.00, 'Ash Gourd', '/placeholder.svg', 40),
  ('Family Wellness Pack', '12 assorted juices for the whole family', 499.00, 'Mix Veg', '/placeholder.svg', 25);
