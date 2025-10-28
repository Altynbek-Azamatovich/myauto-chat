-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
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

-- Everyone can read car brands
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

-- RLS policies for vehicles
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

-- RLS policies for service history
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
  ('Toyota'),
  ('Honda'),
  ('Nissan'),
  ('Mazda'),
  ('Subaru'),
  ('Mitsubishi'),
  ('Suzuki'),
  ('BMW'),
  ('Mercedes-Benz'),
  ('Audi'),
  ('Volkswagen'),
  ('Porsche'),
  ('Ford'),
  ('Chevrolet'),
  ('Dodge'),
  ('Jeep'),
  ('Tesla'),
  ('Hyundai'),
  ('Kia'),
  ('Genesis'),
  ('Lexus'),
  ('Infiniti'),
  ('Acura'),
  ('Volvo'),
  ('Land Rover'),
  ('Jaguar'),
  ('Mini'),
  ('Alfa Romeo'),
  ('Fiat'),
  ('Peugeot'),
  ('Renault'),
  ('Citroën'),
  ('Skoda'),
  ('Seat'),
  ('Lada'),
  ('GAZ'),
  ('UAZ');