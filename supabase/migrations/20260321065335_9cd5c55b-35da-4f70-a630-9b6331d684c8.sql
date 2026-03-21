
-- Delivery customers
CREATE TABLE public.delivery_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  villa_number text NOT NULL,
  phone text,
  subscription_plan text NOT NULL DEFAULT 'daily',
  delivery_frequency text NOT NULL DEFAULT 'daily',
  preferred_juice text NOT NULL DEFAULT 'Ash Gourd',
  start_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weekly juice rotation schedule
CREATE TABLE public.delivery_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.delivery_customers(id) ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL,
  juice_type text NOT NULL,
  UNIQUE(customer_id, day_of_week)
);

-- Daily deliveries
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.delivery_customers(id) ON DELETE CASCADE NOT NULL,
  delivery_date date NOT NULL DEFAULT CURRENT_DATE,
  juice_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, delivery_date)
);

-- Payment tracking
CREATE TABLE public.delivery_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.delivery_customers(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, month)
);

-- RLS
ALTER TABLE public.delivery_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_payments ENABLE ROW LEVEL SECURITY;

-- Admin policies for all delivery tables
CREATE POLICY "Admins full access delivery_customers" ON public.delivery_customers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access delivery_schedules" ON public.delivery_schedules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access deliveries" ON public.deliveries
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins full access delivery_payments" ON public.delivery_payments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
