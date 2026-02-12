-- ============================================================
-- ПОЛНЫЙ SQL-ДАМП СТРУКТУРЫ ПРОЕКТА MyAuto
-- Сгенерировано из 44 миграций supabase/migrations/
-- Дата: 2026-02-12
-- ============================================================

-- ============================================================
-- МИГРАЦИЯ 1: 20251028144530 — Базовые таблицы
-- ============================================================

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create car brands table
CREATE TABLE public.car_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view car brands"
  ON public.car_brands FOR SELECT
  USING (true);

-- Create user vehicles table
CREATE TABLE public.user_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.car_brands(id),
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  vin TEXT,
  license_plate TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
  ON public.user_vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.user_vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.user_vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON public.user_vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Create service types enum
CREATE TYPE public.service_type AS ENUM (
  'maintenance',
  'repair',
  'inspection',
  'tire_change',
  'oil_change',
  'other'
);

-- Create service history table
CREATE TABLE public.service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.user_vehicles(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  description TEXT,
  service_date DATE NOT NULL,
  mileage_at_service INTEGER CHECK (mileage_at_service >= 0),
  cost DECIMAL(10, 2),
  service_provider TEXT,
  next_service_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service history for their vehicles"
  ON public.service_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_vehicles
      WHERE user_vehicles.id = service_history.vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert service history for their vehicles"
  ON public.service_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_vehicles
      WHERE user_vehicles.id = service_history.vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update service history for their vehicles"
  ON public.service_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_vehicles
      WHERE user_vehicles.id = service_history.vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete service history for their vehicles"
  ON public.service_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_vehicles
      WHERE user_vehicles.id = service_history.vehicle_id
      AND user_vehicles.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_vehicles_updated_at
  BEFORE UPDATE ON public.user_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_history_updated_at
  BEFORE UPDATE ON public.service_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert popular car brands
INSERT INTO public.car_brands (brand_name) VALUES
  ('Toyota'), ('Honda'), ('Nissan'), ('Mazda'), ('Subaru'),
  ('Mitsubishi'), ('Suzuki'), ('BMW'), ('Mercedes-Benz'), ('Audi'),
  ('Volkswagen'), ('Porsche'), ('Ford'), ('Chevrolet'), ('Dodge'),
  ('Jeep'), ('Tesla'), ('Hyundai'), ('Kia'), ('Genesis'),
  ('Lexus'), ('Infiniti'), ('Acura'), ('Volvo'), ('Land Rover'),
  ('Jaguar'), ('Mini'), ('Alfa Romeo'), ('Fiat'), ('Peugeot'),
  ('Renault'), ('Citroën'), ('Skoda'), ('Seat'), ('Lada'),
  ('GAZ'), ('UAZ');

-- ============================================================
-- МИГРАЦИЯ 2: 20251105180424 — Доп. поля профиля
-- ============================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS patronymic text,
ADD COLUMN IF NOT EXISTS car_brand text,
ADD COLUMN IF NOT EXISTS car_model text,
ADD COLUMN IF NOT EXISTS license_plate text,
ADD COLUMN IF NOT EXISTS car_color text,
ADD COLUMN IF NOT EXISTS car_year integer,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ru';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  );
  RETURN NEW;
END;
$function$;

-- ============================================================
-- МИГРАЦИЯ 3: 20251105185420 — Чат (conversations + messages)
-- ============================================================

CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Новый чат',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_conversation_updated_at();

-- ============================================================
-- МИГРАЦИЯ 4: 20251105185558 — Фикс search_path чата
-- ============================================================

DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
DROP FUNCTION IF EXISTS public.update_chat_conversation_updated_at();

CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_conversation_updated_at();

-- ============================================================
-- МИГРАЦИЯ 5: 20251106205116 — Доп. поля vehicles
-- ============================================================

ALTER TABLE user_vehicles
ADD COLUMN oil_change_date DATE,
ADD COLUMN insurance_expiry_date DATE,
ADD COLUMN technical_condition INTEGER DEFAULT 0,
ADD COLUMN average_consumption NUMERIC(5,2),
ADD COLUMN next_service_date DATE;

-- ============================================================
-- МИГРАЦИЯ 6: 20251106215852 — OTP коды
-- ============================================================

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create OTP codes" 
ON public.otp_codes FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read their own OTP codes" 
ON public.otp_codes FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP codes" 
ON public.otp_codes FOR UPDATE USING (true);

CREATE INDEX idx_otp_phone_expires ON public.otp_codes(phone_number, expires_at) WHERE verified = false;

CREATE OR REPLACE FUNCTION public.delete_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - INTERVAL '1 hour');
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 7: 20251106222825 — Убираем публичный доступ к OTP
-- ============================================================

DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can read their own OTP codes" ON public.otp_codes;

-- ============================================================
-- МИГРАЦИЯ 8: 20251109093530 — Rate limits
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  request_type TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_rate_limits_identifier_type ON public.rate_limits(identifier, request_type);
CREATE INDEX idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE last_attempt_at < (now() - INTERVAL '1 hour')
    AND (blocked_until IS NULL OR blocked_until < now());
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 9: 20251109123122 — Колонка color в vehicles
-- ============================================================

ALTER TABLE public.user_vehicles 
ADD COLUMN IF NOT EXISTS color TEXT;

-- ============================================================
-- МИГРАЦИЯ 10: 20251109130234 — Фикс handle_new_user (ON CONFLICT)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  )
  ON CONFLICT (phone_number) 
  DO UPDATE SET
    id = EXCLUDED.id,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- ============================================================
-- МИГРАЦИЯ 11: 20251111061046 — Роли, партнёры, мастера, заявки
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('user', 'partner', 'master', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Service partners (автосервисы)
CREATE TABLE public.service_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  phone_number TEXT,
  email TEXT,
  working_hours JSONB,
  rating NUMERIC(3,2) DEFAULT 0,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_partners ENABLE ROW LEVEL SECURITY;

-- Masters (мастера)
CREATE TABLE public.masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.service_partners(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT,
  experience_years INTEGER,
  phone_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.service_request_status AS ENUM (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'
);

-- Service requests (заявки на обслуживание)
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.user_vehicles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.service_partners(id) ON DELETE CASCADE,
  status public.service_request_status NOT NULL DEFAULT 'pending',
  service_type public.service_type NOT NULL,
  description TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  estimated_cost NUMERIC(10,2),
  final_cost NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Service works (работы по заявке)
CREATE TABLE public.service_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  master_id UUID REFERENCES public.masters(id) ON DELETE SET NULL,
  work_name TEXT NOT NULL,
  description TEXT,
  cost NUMERIC(10,2) NOT NULL,
  parts_used JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_works ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view verified partners"
  ON public.service_partners FOR SELECT
  USING (is_verified = true OR owner_id = auth.uid());

CREATE POLICY "Partners can manage their own service"
  ON public.service_partners FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all partners"
  ON public.service_partners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can view their masters"
  ON public.masters FOR SELECT
  USING (partner_id IN (SELECT id FROM public.service_partners WHERE owner_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Partners can manage their masters"
  ON public.masters FOR ALL
  USING (partner_id IN (SELECT id FROM public.service_partners WHERE owner_id = auth.uid()));

CREATE POLICY "Users can view their own requests"
  ON public.service_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests"
  ON public.service_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Partners can view requests for their service"
  ON public.service_requests FOR SELECT
  USING (partner_id IN (SELECT id FROM public.service_partners WHERE owner_id = auth.uid()));

CREATE POLICY "Partners can update requests for their service"
  ON public.service_requests FOR UPDATE
  USING (partner_id IN (SELECT id FROM public.service_partners WHERE owner_id = auth.uid()));

CREATE POLICY "Users can view works for their requests"
  ON public.service_works FOR SELECT
  USING (request_id IN (SELECT id FROM public.service_requests WHERE user_id = auth.uid()));

CREATE POLICY "Partners can manage works for their requests"
  ON public.service_works FOR ALL
  USING (request_id IN (SELECT sr.id FROM public.service_requests sr JOIN public.service_partners sp ON sr.partner_id = sp.id WHERE sp.owner_id = auth.uid()));

CREATE POLICY "Masters can manage their own works"
  ON public.service_works FOR ALL
  USING (master_id IN (SELECT id FROM public.masters WHERE user_id = auth.uid()));

-- Triggers
CREATE TRIGGER update_service_partners_updated_at
  BEFORE UPDATE ON public.service_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_masters_updated_at
  BEFORE UPDATE ON public.masters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_works_updated_at
  BEFORE UPDATE ON public.service_works FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_role();

-- ============================================================
-- МИГРАЦИЯ 12: 20251111081800 — Клиенты, услуги, заказы, смены
-- ============================================================

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
  USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

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
  USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT USING (is_active = true);

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
  USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

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
  USING (order_id IN (SELECT o.id FROM orders o JOIN service_partners sp ON o.partner_id = sp.id WHERE sp.owner_id = auth.uid()));

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
  USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- МИГРАЦИЯ 13: 20251111081859 — Дублирование (IF NOT EXISTS)
-- (пропускается — те же таблицы что выше с IF NOT EXISTS)
-- ============================================================

-- ============================================================
-- МИГРАЦИЯ 14: 20251111084427 — Уведомления
-- ============================================================

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- МИГРАЦИЯ 15: 20251111090149 — Отзывы + Storage buckets
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.service_partners(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_partner_id ON public.reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('vehicles', 'vehicles', true),
  ('diagnostics', 'diagnostics', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for vehicles
CREATE POLICY "Vehicle images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');

CREATE POLICY "Users can upload their vehicle photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their vehicle photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their vehicle photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for diagnostics (private)
CREATE POLICY "Users can view their own diagnostic images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload diagnostic images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their diagnostic images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- МИГРАЦИЯ 16-17: 20251114054437 + 20251114054627 — avatar_url
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ============================================================
-- МИГРАЦИЯ 18: 20251114063751 — Partner role enum value
-- ============================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';
COMMENT ON COLUMN public.service_partners.is_verified IS 'Partner verification status';
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- ============================================================
-- МИГРАЦИЯ 19: 20251114070205 — Фикс handle_new_user (phone)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 20: 20251114074011 — Помощь на дороге
-- ============================================================

CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'helped', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.help_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  help_request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(help_request_id, responder_id)
);

ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active help requests"
  ON public.help_requests FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own help requests"
  ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help requests"
  ON public.help_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help requests"
  ON public.help_requests FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view help responses"
  ON public.help_responses FOR SELECT USING (true);

CREATE POLICY "Users can create their own responses"
  ON public.help_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

ALTER TABLE public.help_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;

ALTER TABLE public.help_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_responses;

CREATE OR REPLACE FUNCTION notify_help_request_owner()
RETURNS TRIGGER AS $$
DECLARE
  request_owner_id UUID;
  responder_name TEXT;
BEGIN
  SELECT user_id INTO request_owner_id FROM help_requests WHERE id = NEW.help_request_id;
  SELECT COALESCE(first_name || ' ' || last_name, phone_number) INTO responder_name FROM profiles WHERE id = NEW.responder_id;
  INSERT INTO notifications (user_id, type, category, title, message)
  VALUES (request_owner_id, 'info', 'help', 'Помощь в пути', responder_name || ' откликнулся на ваш запрос о помощи и едет к вам!');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_help_response_created
  AFTER INSERT ON help_responses FOR EACH ROW EXECUTE FUNCTION notify_help_request_owner();

CREATE OR REPLACE FUNCTION update_help_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON help_requests FOR EACH ROW EXECUTE FUNCTION update_help_requests_updated_at();

-- ============================================================
-- МИГРАЦИЯ 21: 20251114082438 — Assign user roles to existing
-- ============================================================

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'user'::app_role
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================
-- МИГРАЦИЯ 22: 20251114090812 — partner_pin
-- ============================================================

ALTER TABLE public.service_partners ADD COLUMN partner_pin TEXT;
COMMENT ON COLUMN public.service_partners.partner_pin IS 'Encrypted PIN code for partner account access (4-6 digits)';

-- ============================================================
-- МИГРАЦИЯ 23: 20251114092537 — Partner applications
-- ============================================================

CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  business_description TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner application"
ON public.partner_applications FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
ON public.partner_applications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.partner_applications FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_partner_applications_status ON public.partner_applications(status);
CREATE INDEX idx_partner_applications_phone ON public.partner_applications(phone_number);

-- ============================================================
-- МИГРАЦИЯ 24: 20251115184850 — Фикс RLS help_requests update
-- ============================================================

DROP POLICY IF EXISTS "Users can update their own help requests" ON help_requests;

CREATE POLICY "Users can update their own help requests"
ON help_requests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- МИГРАЦИЯ 25: 20251115185222 — partner_password, approved_by, create_partner_account
-- ============================================================

ALTER TABLE partner_applications 
ADD COLUMN partner_password TEXT,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION create_partner_account(
  application_id UUID,
  admin_id UUID,
  temp_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record RECORD;
  new_user_id UUID;
  new_partner_id UUID;
  result JSON;
BEGIN
  IF NOT has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can create partner accounts';
  END IF;

  SELECT * INTO app_record FROM partner_applications WHERE id = application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  UPDATE partner_applications SET 
    status = 'approved',
    approved_by = admin_id,
    approved_at = NOW(),
    partner_password = temp_password,
    notes = COALESCE(notes || E'\n', '') || 'Одобрено админом. Пароль установлен.'
  WHERE id = application_id;

  result := json_build_object('success', true, 'phone_number', app_record.phone_number, 'temp_password', temp_password);
  RETURN result;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 26: 20251116172907 — Cleanup функции + fix search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_verified_otp_codes()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE verified = true AND created_at < (now() - INTERVAL '5 minutes');
  DELETE FROM public.otp_codes WHERE verified = false AND expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE last_attempt_at < (now() - INTERVAL '24 hours') AND (blocked_until IS NULL OR blocked_until < now());
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.delete_expired_otp_codes()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_help_requests_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_help_request_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  request_owner_id UUID;
  responder_name TEXT;
BEGIN
  SELECT user_id INTO request_owner_id FROM public.help_requests WHERE id = NEW.help_request_id;
  SELECT COALESCE(first_name || ' ' || last_name, phone_number) INTO responder_name FROM public.profiles WHERE id = NEW.responder_id;
  INSERT INTO public.notifications (user_id, type, category, title, message)
  VALUES (request_owner_id, 'info', 'help', 'Помощь в пути', responder_name || ' откликнулся на ваш запрос о помощи и едет к вам!');
  RETURN NEW;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 27: 20251116172958 — (дубликат миграции 26, пропуск)
-- ============================================================

-- ============================================================
-- МИГРАЦИЯ 28: 20251121114028 — partner_login, admin_settings
-- ============================================================

ALTER TABLE service_partners ADD COLUMN IF NOT EXISTS partner_login text UNIQUE;
ALTER TABLE service_partners ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS partner_login text;
CREATE INDEX IF NOT EXISTS idx_service_partners_login ON service_partners(partner_login);

DROP POLICY IF EXISTS "Admins can delete applications" ON partner_applications;
CREATE POLICY "Admins can delete applications"
ON partner_applications FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
ON admin_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- МИГРАЦИЯ 29: 20251122110031 — handle_new_user (NULL phone)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_phone TEXT;
BEGIN
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');
  IF user_phone = '' THEN user_phone := NULL; END IF;

  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (NEW.id, user_phone, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'), false)
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 30: 20251122110719 — Skip partner profile creation
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_phone TEXT;
BEGIN
  IF NEW.email LIKE '%@partner.myauto.kz' THEN RETURN NEW; END IF;
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');
  IF user_phone = '' THEN user_phone := NULL; END IF;

  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (NEW.id, user_phone, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'), false)
  ON CONFLICT (id) DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 31: 20260129100106 — user_vehicles nullable user_id
-- ============================================================

ALTER TABLE public.user_vehicles ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.user_vehicles DROP CONSTRAINT IF EXISTS user_vehicles_user_id_fkey;
ALTER TABLE public.user_vehicles
  ADD CONSTRAINT user_vehicles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.user_vehicles;
CREATE POLICY "Users can view their own vehicles or orphaned" 
  ON public.user_vehicles FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- ============================================================
-- МИГРАЦИЯ 32: 20260131154941 — age, gender в profiles
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_gender_check CHECK (gender IS NULL OR gender IN ('male', 'female'));

-- ============================================================
-- МИГРАЦИЯ 33: 20260131183309 — diagnostic_reports
-- ============================================================

CREATE TABLE public.diagnostic_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  analysis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
ON public.diagnostic_reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.diagnostic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.diagnostic_reports FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- МИГРАЦИЯ 34: 20260131183512 — diagnostics bucket public + policies
-- ============================================================

UPDATE storage.buckets SET public = true WHERE id = 'diagnostics';

CREATE POLICY "Anyone can view diagnostic images"
ON storage.objects FOR SELECT USING (bucket_id = 'diagnostics');

CREATE POLICY "Authenticated users can upload diagnostic images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own diagnostic images"
ON storage.objects FOR DELETE USING (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- МИГРАЦИЯ 35: 20260201095644 — Доп. поля help_requests + profiles
-- ============================================================

ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS responder_id UUID;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS responder_eta_minutes INTEGER;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_selfie_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engine_volume TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fuel_type TEXT;

CREATE POLICY "Anyone can view basic profile info"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Responders can update help status"
  ON help_requests FOR UPDATE
  USING (auth.uid() = responder_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = responder_id OR auth.uid() = user_id);

-- ============================================================
-- МИГРАЦИЯ 36: 20260201103732 — help_chat_messages
-- ============================================================

CREATE TABLE public.help_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  help_request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.help_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view help chat messages"
ON public.help_chat_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())));

CREATE POLICY "Users can send help chat messages"
ON public.help_chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())));

ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages;

-- ============================================================
-- МИГРАЦИЯ 37: 20260201105857 — Realtime ensure
-- ============================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_notify_help_request_owner ON public.help_responses;
CREATE TRIGGER trg_notify_help_request_owner
AFTER INSERT ON public.help_responses FOR EACH ROW EXECUTE FUNCTION public.notify_help_request_owner();

-- ============================================================
-- МИГРАЦИЯ 38: 20260201112126 — share_phone + claim policy
-- ============================================================

ALTER TABLE public.help_requests ADD COLUMN IF NOT EXISTS share_phone boolean NOT NULL DEFAULT false;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Responders can update help status" ON public.help_requests;
CREATE POLICY "Responders can claim active request"
ON public.help_requests FOR UPDATE
USING (status = 'active'::text AND responder_id IS NULL)
WITH CHECK (responder_id = auth.uid());

DROP TRIGGER IF EXISTS trg_notify_help_request_owner ON public.help_responses;
CREATE TRIGGER trg_notify_help_request_owner
AFTER INSERT ON public.help_responses FOR EACH ROW EXECUTE FUNCTION public.notify_help_request_owner();

-- ============================================================
-- МИГРАЦИЯ 39: 20260201112456 — Fix claim policy
-- ============================================================

DROP POLICY IF EXISTS "Responders can claim active request" ON public.help_requests;
CREATE POLICY "Anyone can claim unclaimed active request"
ON public.help_requests FOR UPDATE
USING (status = 'active' AND responder_id IS NULL AND user_id != auth.uid())
WITH CHECK (responder_id = auth.uid());

-- ============================================================
-- МИГРАЦИЯ 40: 20260201215748 — АУДИТ ШЭП/ВШЭП
-- ============================================================

CREATE TYPE public.audit_level AS ENUM (
  'DEBUG', 'INFO', 'NOTIFICATION', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT'
);

CREATE TYPE public.audit_category AS ENUM (
  'AUTH', 'USER_ACTION', 'DATA_ACCESS', 'DATA_MODIFY', 'SYSTEM', 'EXTERNAL_API', 'CONFIG_CHANGE', 'SECURITY'
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source_service text NOT NULL,
  user_id uuid,
  user_account_name text,
  client_ip inet,
  operation_start_time timestamptz NOT NULL DEFAULT now(),
  operation_end_time timestamptz,
  level audit_level NOT NULL DEFAULT 'INFO',
  category audit_category NOT NULL,
  event_type text NOT NULL,
  description text NOT NULL,
  request_id text,
  metadata jsonb DEFAULT '{}',
  target_table text,
  target_record_id text,
  old_values jsonb,
  new_values jsonb,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  http_method text,
  http_path text,
  http_status_code integer,
  user_agent text
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_level ON public.audit_logs(level);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_source_service ON public.audit_logs(source_service);
CREATE INDEX idx_audit_logs_request_id ON public.audit_logs(request_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT WITH CHECK (true);

-- write_audit_log function
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_source_service text, p_category audit_category, p_event_type text, p_description text,
  p_user_id uuid DEFAULT NULL, p_user_account_name text DEFAULT NULL, p_client_ip inet DEFAULT NULL,
  p_level audit_level DEFAULT 'INFO', p_request_id text DEFAULT NULL, p_metadata jsonb DEFAULT '{}',
  p_target_table text DEFAULT NULL, p_target_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL, p_new_values jsonb DEFAULT NULL,
  p_success boolean DEFAULT true, p_error_message text DEFAULT NULL,
  p_http_method text DEFAULT NULL, p_http_path text DEFAULT NULL, p_http_status_code integer DEFAULT NULL,
  p_user_agent text DEFAULT NULL, p_operation_start_time timestamptz DEFAULT now(), p_operation_end_time timestamptz DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    source_service, category, event_type, description, user_id, user_account_name, client_ip,
    level, request_id, metadata, target_table, target_record_id, old_values, new_values,
    success, error_message, http_method, http_path, http_status_code, user_agent,
    operation_start_time, operation_end_time
  ) VALUES (
    p_source_service, p_category, p_event_type, p_description, p_user_id, p_user_account_name, p_client_ip,
    p_level, p_request_id, p_metadata, p_target_table, p_target_record_id, p_old_values, p_new_values,
    p_success, p_error_message, p_http_method, p_http_path, p_http_status_code, p_user_agent,
    p_operation_start_time, COALESCE(p_operation_end_time, now())
  ) RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$;

-- format_syslog_message (RFC 5424)
CREATE OR REPLACE FUNCTION public.format_syslog_message(p_log_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_log RECORD; v_priority integer; v_severity integer; v_facility integer := 16;
  v_timestamp text; v_hostname text := 'myauto-app';
  v_structured_data text; v_message text;
BEGIN
  SELECT * INTO v_log FROM public.audit_logs WHERE id = p_log_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  CASE v_log.level
    WHEN 'ALERT' THEN v_severity := 1; WHEN 'CRITICAL' THEN v_severity := 2;
    WHEN 'ERROR' THEN v_severity := 3; WHEN 'WARNING' THEN v_severity := 4;
    WHEN 'NOTIFICATION' THEN v_severity := 5; WHEN 'INFO' THEN v_severity := 6;
    WHEN 'DEBUG' THEN v_severity := 7; ELSE v_severity := 6;
  END CASE;
  
  v_priority := (v_facility * 8) + v_severity;
  v_timestamp := to_char(v_log.created_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD"T"HH24:MI:SS.MS+06:00');
  
  v_structured_data := format(
    '[myauto@12345 userId="%s" userAccount="%s" clientIp="%s" category="%s" eventType="%s" requestId="%s" success="%s"]',
    COALESCE(v_log.user_id::text, '-'), COALESCE(v_log.user_account_name, '-'),
    COALESCE(v_log.client_ip::text, '-'), v_log.category, v_log.event_type,
    COALESCE(v_log.request_id, '-'), v_log.success::text
  );
  
  v_message := format('<%s>1 %s %s %s %s %s %s %s',
    v_priority, v_timestamp, v_hostname, COALESCE(v_log.source_service, '-'),
    COALESCE(v_log.request_id, '-'), v_log.event_type, v_structured_data, v_log.description
  );
  RETURN v_message;
END;
$$;

-- audit_logs_formatted view
CREATE OR REPLACE VIEW public.audit_logs_formatted AS
SELECT id,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'DD:MM:YYYY') as "date",
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "time",
  source_service as "source",
  COALESCE(user_account_name, user_id::text, 'anonymous') as "user_account",
  COALESCE(client_ip::text, '-') as "client_ip",
  to_char(operation_start_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "start_time",
  to_char(COALESCE(operation_end_time, created_at) AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "end_time",
  level::text as "level", category::text as "category", event_type, description,
  request_id, success, error_message
FROM public.audit_logs ORDER BY created_at DESC;

-- SIEM config table
CREATE TABLE public.siem_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  endpoint_url text NOT NULL,
  protocol text NOT NULL DEFAULT 'https',
  port integer DEFAULT 514,
  api_key text,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.siem_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage SIEM config" ON public.siem_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Audit triggers for profiles
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log('profiles_trigger', 'DATA_MODIFY', 'PROFILE_CREATED',
      format('Создан профиль пользователя: %s', NEW.phone_number), NEW.id, NEW.phone_number,
      NULL, 'INFO', NULL, jsonb_build_object('first_name', NEW.first_name, 'city', NEW.city),
      'profiles', NEW.id::text, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.write_audit_log('profiles_trigger', 'DATA_MODIFY', 'PROFILE_UPDATED',
      format('Обновлен профиль пользователя: %s', NEW.phone_number), NEW.id, NEW.phone_number,
      NULL, 'INFO', NULL, NULL, 'profiles', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_profiles_changes();

-- Audit triggers for vehicles
CREATE OR REPLACE FUNCTION public.audit_vehicles_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_user_phone text;
BEGIN
  SELECT phone_number INTO v_user_phone FROM public.profiles WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log('vehicles_trigger', 'DATA_MODIFY', 'VEHICLE_ADDED',
      format('Добавлено транспортное средство: %s', NEW.license_plate), NEW.user_id, v_user_phone,
      NULL, 'INFO', NULL, jsonb_build_object('model', NEW.model, 'year', NEW.year, 'license_plate', NEW.license_plate),
      'user_vehicles', NEW.id::text, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.write_audit_log('vehicles_trigger', 'DATA_MODIFY', 'VEHICLE_UPDATED',
      format('Обновлено транспортное средство: %s', NEW.license_plate), NEW.user_id, v_user_phone,
      NULL, 'INFO', NULL, NULL, 'user_vehicles', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.write_audit_log('vehicles_trigger', 'DATA_MODIFY', 'VEHICLE_DELETED',
      format('Удалено транспортное средство: %s', OLD.license_plate), OLD.user_id, v_user_phone,
      NULL, 'WARNING', NULL, NULL, 'user_vehicles', OLD.id::text, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_vehicles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_vehicles FOR EACH ROW EXECUTE FUNCTION public.audit_vehicles_changes();

-- Audit triggers for roles
CREATE OR REPLACE FUNCTION public.audit_roles_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_user_phone text;
BEGIN
  SELECT phone_number INTO v_user_phone FROM public.profiles WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log('roles_trigger', 'SECURITY', 'ROLE_ASSIGNED',
      format('Назначена роль %s пользователю', NEW.role), NEW.user_id, v_user_phone,
      NULL, 'WARNING', NULL, jsonb_build_object('role', NEW.role), 'user_roles', NEW.id::text, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.write_audit_log('roles_trigger', 'SECURITY', 'ROLE_REVOKED',
      format('Отозвана роль %s у пользователя', OLD.role), OLD.user_id, v_user_phone,
      NULL, 'ALERT', NULL, jsonb_build_object('role', OLD.role), 'user_roles', OLD.id::text, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_roles_trigger
AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_roles_changes();

-- ============================================================
-- МИГРАЦИЯ 41: 20260201215938 — get_audit_statistics
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_audit_statistics(
  p_start_date timestamptz DEFAULT (now() - interval '24 hours'),
  p_end_date timestamptz DEFAULT now()
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_result jsonb; v_total bigint; v_failed bigint; v_unique_users bigint;
  v_by_level jsonb; v_by_category jsonb; v_by_source jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  SELECT COUNT(*), COUNT(*) FILTER (WHERE success = false), COUNT(DISTINCT user_id)
  INTO v_total, v_failed, v_unique_users
  FROM public.audit_logs WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  SELECT COALESCE(jsonb_object_agg(level::text, cnt), '{}'::jsonb) INTO v_by_level
  FROM (SELECT level, COUNT(*) as cnt FROM public.audit_logs WHERE created_at BETWEEN p_start_date AND p_end_date GROUP BY level) sub;
  
  SELECT COALESCE(jsonb_object_agg(category::text, cnt), '{}'::jsonb) INTO v_by_category
  FROM (SELECT category, COUNT(*) as cnt FROM public.audit_logs WHERE created_at BETWEEN p_start_date AND p_end_date GROUP BY category) sub;
  
  SELECT COALESCE(jsonb_object_agg(source_service, cnt), '{}'::jsonb) INTO v_by_source
  FROM (SELECT source_service, COUNT(*) as cnt FROM public.audit_logs WHERE created_at BETWEEN p_start_date AND p_end_date GROUP BY source_service) sub;
  
  v_result := jsonb_build_object(
    'total_events', v_total, 'failed_events', v_failed, 'unique_users', v_unique_users,
    'events_by_level', v_by_level, 'events_by_category', v_by_category, 'events_by_source', v_by_source,
    'period_start', p_start_date, 'period_end', p_end_date
  );
  RETURN v_result;
END;
$$;

-- ============================================================
-- МИГРАЦИЯ 42: 20260206200006 — Security hardening (RLS fixes)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view active help requests" ON public.help_requests;
CREATE POLICY "Authenticated users can view active help requests"
ON public.help_requests FOR SELECT TO authenticated
USING (status = 'active'::text OR auth.uid() = user_id OR auth.uid() = responder_id);

DROP POLICY IF EXISTS "Anyone can view help responses" ON public.help_responses;
CREATE POLICY "Authenticated users can view help responses"
ON public.help_responses FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.help_requests WHERE help_requests.id = help_responses.help_request_id AND (help_requests.user_id = auth.uid() OR help_requests.responder_id = auth.uid() OR help_requests.status = 'active')));

DROP POLICY IF EXISTS "Anyone can view verified partners" ON public.service_partners;
CREATE POLICY "Authenticated users can view verified partners"
ON public.service_partners FOR SELECT TO authenticated
USING ((is_verified = true) OR (owner_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can read their own OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;

ALTER TABLE public.partner_applications DROP COLUMN IF EXISTS partner_password;

DROP VIEW IF EXISTS public.audit_logs_formatted;
CREATE VIEW public.audit_logs_formatted
WITH (security_invoker = on)
AS SELECT id, success,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD') as date,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as time,
  source_service as source, user_account_name as user_account,
  client_ip::text as client_ip,
  to_char(operation_start_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as start_time,
  to_char(operation_end_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as end_time,
  level::text as level, category::text as category, event_type, description,
  request_id, error_message
FROM public.audit_logs;

-- ============================================================
-- МИГРАЦИЯ 43: 20260206200958 — Restrict audit_logs INSERT to service_role + diagnostics private
-- ============================================================

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT TO service_role WITH CHECK (true);

UPDATE storage.buckets SET public = false WHERE id = 'diagnostics';

DROP POLICY IF EXISTS "Anyone can view diagnostic images" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Users can view their own diagnostic images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own diagnostic images"
      ON storage.objects FOR SELECT USING (bucket_id = ''diagnostics'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

-- ============================================================
-- МИГРАЦИЯ 44: 20260207002110 — ПОЛНАЯ ПЕРЕСТРОЙКА RLS (PERMISSIVE)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can view basic profile info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_vehicles
DROP POLICY IF EXISTS "Users can view their own vehicles or orphaned" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.user_vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.user_vehicles;

CREATE POLICY "Users can view their own vehicles or orphaned" ON public.user_vehicles FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can insert their own vehicles" ON public.user_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON public.user_vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON public.user_vehicles FOR DELETE USING (auth.uid() = user_id);

-- car_brands
DROP POLICY IF EXISTS "Anyone can view car brands" ON public.car_brands;
CREATE POLICY "Anyone can view car brands" ON public.car_brands FOR SELECT USING (true);

-- diagnostic_reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.diagnostic_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.diagnostic_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.diagnostic_reports;

CREATE POLICY "Users can view their own reports" ON public.diagnostic_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.diagnostic_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.diagnostic_reports FOR DELETE USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- chat_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.chat_conversations FOR DELETE USING (auth.uid() = user_id);

-- chat_messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- help_requests
DROP POLICY IF EXISTS "Authenticated users can view active help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can create their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can update their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can delete their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Anyone can claim unclaimed active request" ON public.help_requests;

CREATE POLICY "Authenticated users can view active help requests" ON public.help_requests FOR SELECT USING ((status = 'active') OR (auth.uid() = user_id) OR (auth.uid() = responder_id));
CREATE POLICY "Users can create their own help requests" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own help requests" ON public.help_requests FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own help requests" ON public.help_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can claim unclaimed active request" ON public.help_requests FOR UPDATE USING ((status = 'active') AND (responder_id IS NULL) AND (user_id <> auth.uid())) WITH CHECK (responder_id = auth.uid());

-- help_responses
DROP POLICY IF EXISTS "Authenticated users can view help responses" ON public.help_responses;
DROP POLICY IF EXISTS "Users can create their own responses" ON public.help_responses;

CREATE POLICY "Authenticated users can view help responses" ON public.help_responses FOR SELECT USING (EXISTS (SELECT 1 FROM help_requests WHERE help_requests.id = help_responses.help_request_id AND (help_requests.user_id = auth.uid() OR help_requests.responder_id = auth.uid() OR help_requests.status = 'active')));
CREATE POLICY "Users can create their own responses" ON public.help_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- help_chat_messages
DROP POLICY IF EXISTS "Users can view help chat messages" ON public.help_chat_messages;
DROP POLICY IF EXISTS "Users can send help chat messages" ON public.help_chat_messages;

CREATE POLICY "Users can view help chat messages" ON public.help_chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())));
CREATE POLICY "Users can send help chat messages" ON public.help_chat_messages FOR INSERT WITH CHECK ((auth.uid() = sender_id) AND (EXISTS (SELECT 1 FROM help_requests hr WHERE hr.id = help_chat_messages.help_request_id AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid()))));

-- service_partners
DROP POLICY IF EXISTS "Authenticated users can view verified partners" ON public.service_partners;
DROP POLICY IF EXISTS "Partners can manage their own service" ON public.service_partners;
DROP POLICY IF EXISTS "Admins can manage all partners" ON public.service_partners;

CREATE POLICY "Authenticated users can view verified partners" ON public.service_partners FOR SELECT USING ((is_verified = true) OR (owner_id = auth.uid()));
CREATE POLICY "Partners can manage their own service" ON public.service_partners FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all partners" ON public.service_partners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- service_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON public.service_requests;
DROP POLICY IF EXISTS "Partners can view requests for their service" ON public.service_requests;
DROP POLICY IF EXISTS "Partners can update requests for their service" ON public.service_requests;

CREATE POLICY "Users can view their own requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending requests" ON public.service_requests FOR UPDATE USING ((auth.uid() = user_id) AND (status = 'pending'));
CREATE POLICY "Partners can view requests for their service" ON public.service_requests FOR SELECT USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));
CREATE POLICY "Partners can update requests for their service" ON public.service_requests FOR UPDATE USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- service_history
DROP POLICY IF EXISTS "Users can view service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can insert service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can update service history for their vehicles" ON public.service_history;
DROP POLICY IF EXISTS "Users can delete service history for their vehicles" ON public.service_history;

CREATE POLICY "Users can view service history for their vehicles" ON public.service_history FOR SELECT USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can insert service history for their vehicles" ON public.service_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can update service history for their vehicles" ON public.service_history FOR UPDATE USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));
CREATE POLICY "Users can delete service history for their vehicles" ON public.service_history FOR DELETE USING (EXISTS (SELECT 1 FROM user_vehicles WHERE user_vehicles.id = service_history.vehicle_id AND user_vehicles.user_id = auth.uid()));

-- reviews
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- services
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Partners can manage their services" ON public.services;

CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Partners can manage their services" ON public.services FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Partners can manage their orders" ON public.orders;
CREATE POLICY "Partners can manage their orders" ON public.orders FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- order_services
DROP POLICY IF EXISTS "Partners can manage order services" ON public.order_services;
CREATE POLICY "Partners can manage order services" ON public.order_services FOR ALL USING (order_id IN (SELECT o.id FROM orders o JOIN service_partners sp ON o.partner_id = sp.id WHERE sp.owner_id = auth.uid()));

-- clients
DROP POLICY IF EXISTS "Partners can manage their clients" ON public.clients;
CREATE POLICY "Partners can manage their clients" ON public.clients FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- shifts
DROP POLICY IF EXISTS "Partners can manage their shifts" ON public.shifts;
CREATE POLICY "Partners can manage their shifts" ON public.shifts FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));

-- masters
DROP POLICY IF EXISTS "Partners can manage their masters" ON public.masters;
DROP POLICY IF EXISTS "Partners can view their masters" ON public.masters;

CREATE POLICY "Partners can manage their masters" ON public.masters FOR ALL USING (partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid()));
CREATE POLICY "Partners can view their masters" ON public.masters FOR SELECT USING ((partner_id IN (SELECT id FROM service_partners WHERE owner_id = auth.uid())) OR (user_id = auth.uid()));

-- service_works
DROP POLICY IF EXISTS "Users can view works for their requests" ON public.service_works;
DROP POLICY IF EXISTS "Partners can manage works for their requests" ON public.service_works;
DROP POLICY IF EXISTS "Masters can manage their own works" ON public.service_works;

CREATE POLICY "Users can view works for their requests" ON public.service_works FOR SELECT USING (request_id IN (SELECT id FROM service_requests WHERE user_id = auth.uid()));
CREATE POLICY "Partners can manage works for their requests" ON public.service_works FOR ALL USING (request_id IN (SELECT sr.id FROM service_requests sr JOIN service_partners sp ON sr.partner_id = sp.id WHERE sp.owner_id = auth.uid()));
CREATE POLICY "Masters can manage their own works" ON public.service_works FOR ALL USING (master_id IN (SELECT id FROM masters WHERE user_id = auth.uid()));

-- partner_applications
DROP POLICY IF EXISTS "Anyone can submit partner application" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.partner_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.partner_applications;

CREATE POLICY "Anyone can submit partner application" ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all applications" ON public.partner_applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update applications" ON public.partner_applications FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete applications" ON public.partner_applications FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- admin_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
CREATE POLICY "Admins can manage settings" ON public.admin_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- audit_logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- otp_codes
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;
CREATE POLICY "Service role can manage OTP codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

-- rate_limits
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits FOR ALL USING (true) WITH CHECK (true);

-- siem_config
DROP POLICY IF EXISTS "Only admins can manage SIEM config" ON public.siem_config;
CREATE POLICY "Only admins can manage SIEM config" ON public.siem_config FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- КОНЕЦ ДАМПА
-- ============================================================
