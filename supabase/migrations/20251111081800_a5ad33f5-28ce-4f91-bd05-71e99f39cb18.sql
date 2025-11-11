-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  car_model TEXT,
  car_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their clients"
  ON public.clients FOR ALL
  USING (partner_id IN (
    SELECT id FROM service_partners WHERE owner_id = auth.uid()
  ));

-- Create services table  
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their services"
  ON public.services FOR ALL
  USING (partner_id IN (
    SELECT id FROM service_partners WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  total_price NUMERIC NOT NULL DEFAULT 0,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their orders"
  ON public.orders FOR ALL
  USING (partner_id IN (
    SELECT id FROM service_partners WHERE owner_id = auth.uid()
  ));

-- Create order_services junction table
CREATE TABLE public.order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.order_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage order services"
  ON public.order_services FOR ALL
  USING (order_id IN (
    SELECT o.id FROM orders o
    JOIN service_partners sp ON o.partner_id = sp.id
    WHERE sp.owner_id = auth.uid()
  ));

-- Create shifts table
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  opening_balance NUMERIC DEFAULT 0,
  closing_balance NUMERIC,
  cash_amount NUMERIC DEFAULT 0,
  card_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their shifts"
  ON public.shifts FOR ALL
  USING (partner_id IN (
    SELECT id FROM service_partners WHERE owner_id = auth.uid()
  ));

-- Create update triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();