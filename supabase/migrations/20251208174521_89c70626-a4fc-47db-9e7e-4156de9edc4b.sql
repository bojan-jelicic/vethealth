
-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create veterinarians table
CREATE TABLE public.veterinarians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id),
  veterinarian_id UUID REFERENCES public.veterinarians(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  owner_first_name TEXT NOT NULL,
  owner_last_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  pet_species_breed TEXT,
  pet_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for services (public read)
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

-- RLS policies for veterinarians (public read)
CREATE POLICY "Anyone can view active veterinarians" 
ON public.veterinarians 
FOR SELECT 
USING (is_active = true);

-- RLS policies for appointments (public insert, no read for security)
CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veterinarians_updated_at
BEFORE UPDATE ON public.veterinarians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (name, description, duration_minutes, price) VALUES
('Opšti Pregled', 'Redovni zdravstveni pregled za sve vrste kućnih ljubimaca', 30, 50.00),
('Vakcinacija', 'Vakcinalni program za zaštitu vašeg ljubimca', 20, 35.00),
('Kontrola', 'Kontrolni pregled nakon tretmana', 15, 25.00),
('Hirurgija - Konsultacija', 'Konsultacija prije hirurške intervencije', 45, 40.00),
('Stomatološki Pregled', 'Pregled i čišćenje zuba', 30, 45.00),
('Laboratorijske Analize', 'Uzorkovanje krvi i drugih uzoraka', 20, 60.00);

-- Insert default veterinarians
INSERT INTO public.veterinarians (name, specialization, email, phone) VALUES
('Dr. Marko Petrović', 'Opšta praksa', 'marko@vetbl.com', '+38765111222'),
('Dr. Ana Jovanović', 'Hirurgija', 'ana@vetbl.com', '+38765222333'),
('Dr. Stefan Nikolić', 'Interna medicina', 'stefan@vetbl.com', '+38765333444');
