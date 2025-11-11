-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'partner', 'master', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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

-- Masters (мастера в автосервисах)
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

-- Service request statuses
CREATE TYPE public.service_request_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected'
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

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_partners
CREATE POLICY "Anyone can view verified partners"
  ON public.service_partners FOR SELECT
  USING (is_verified = true OR owner_id = auth.uid());

CREATE POLICY "Partners can manage their own service"
  ON public.service_partners FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all partners"
  ON public.service_partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for masters
CREATE POLICY "Partners can view their masters"
  ON public.masters FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM public.service_partners WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Partners can manage their masters"
  ON public.masters FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM public.service_partners WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for service_requests
CREATE POLICY "Users can view their own requests"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending requests"
  ON public.service_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Partners can view requests for their service"
  ON public.service_requests FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM public.service_partners WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Partners can update requests for their service"
  ON public.service_requests FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM public.service_partners WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for service_works
CREATE POLICY "Users can view works for their requests"
  ON public.service_works FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.service_requests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can manage works for their requests"
  ON public.service_works FOR ALL
  USING (
    request_id IN (
      SELECT sr.id FROM public.service_requests sr
      JOIN public.service_partners sp ON sr.partner_id = sp.id
      WHERE sp.owner_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage their own works"
  ON public.service_works FOR ALL
  USING (
    master_id IN (
      SELECT id FROM public.masters WHERE user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_service_partners_updated_at
  BEFORE UPDATE ON public.service_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_masters_updated_at
  BEFORE UPDATE ON public.masters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_works_updated_at
  BEFORE UPDATE ON public.service_works
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically assign 'user' role on signup
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