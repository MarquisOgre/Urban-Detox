
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (public storefront needs them)
CREATE POLICY "Anyone can read site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site_settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('general', '{"site_name":"Nature''s Blend","tagline":"Fresh Cold-Pressed Juices","phone":"9441561997","email":"info@naturesblend.com","address":"Tirupati, Andhra Pradesh, 517501","footer_text":"© 2026 Nature''s Blend. All rights reserved.","footer_credit":"Dexorzo Creations"}'::jsonb),
  ('banner', '{"enabled":true,"text":"🌿 Free delivery on orders above ₹500!","bg_color":"#2d6a4f","text_color":"#ffffff"}'::jsonb),
  ('hero', '{"slides":[{"title":"Wheatgrass Shot","subtitle":"Pure green energy","cta":"Order Now"},{"title":"Ash Gourd Juice","subtitle":"Cool & refreshing","cta":"Order Now"},{"title":"Carrot Juice","subtitle":"Rich in beta-carotene","cta":"Order Now"},{"title":"Beetroot Juice","subtitle":"Natural stamina booster","cta":"Order Now"},{"title":"Tomato Juice","subtitle":"Tangy & nutritious","cta":"Order Now"},{"title":"Mix Veg Juice","subtitle":"Best of all veggies","cta":"Order Now"}]}'::jsonb),
  ('categories', '{"items":["Cold-Pressed Juices","Detox Shots","Combo Packs","Seasonal Specials"]}'::jsonb),
  ('faq', '{"items":[{"question":"Are the juices freshly made?","answer":"Yes, all our juices are cold-pressed fresh daily using organic produce."},{"question":"Do you deliver daily?","answer":"Yes, we offer daily delivery in Tirupati and surrounding areas."},{"question":"What is the shelf life?","answer":"Our cold-pressed juices stay fresh for 24-48 hours when refrigerated."},{"question":"Can I customize my juice?","answer":"Absolutely! Contact us on WhatsApp to create your custom blend."}]}'::jsonb),
  ('payment', '{"cod_enabled":true,"upi_enabled":true,"upi_id":"naturesblend@upi","bank_name":"","account_number":"","ifsc_code":""}'::jsonb),
  ('whatsapp', '{"number":"9441561997","default_message":"Hi! I would like to place an order.","enabled":true}'::jsonb),
  ('portfolio', '{"company_name":"Dexorzo Creations","website":"https://dexorzo.com","description":"Digital solutions for modern businesses"}'::jsonb);
