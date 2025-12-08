
-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- RLS policy for public read
CREATE POLICY "Anyone can view active service categories" 
ON public.service_categories 
FOR SELECT 
USING (is_active = true);

-- Add category_id to services table
ALTER TABLE public.services 
ADD COLUMN category_id UUID REFERENCES public.service_categories(id);

-- Insert default categories
INSERT INTO public.service_categories (id, name, description, icon, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Pregledi i Dijagnostika', 'Redovni i specijalistički pregledi za sve vrste kućnih ljubimaca', 'Stethoscope', 1),
('22222222-2222-2222-2222-222222222222', 'Vakcinacije', 'Kompletni vakcinalni programi za pse, mačke i druge ljubimce', 'Syringe', 2),
('33333333-3333-3333-3333-333333333333', 'Hirurgija', 'Hirurške intervencije i operativni zahvati', 'Scissors', 3),
('44444444-4444-4444-4444-444444444444', 'Stomatologija', 'Njega zuba i tretmani usne šupljine', 'Bone', 4),
('55555555-5555-5555-5555-555555555555', 'Laboratorija', 'Laboratorijske analize i dijagnostički testovi', 'Microscope', 5);

-- Update existing services with categories
UPDATE public.services SET category_id = '11111111-1111-1111-1111-111111111111' WHERE name = 'Opšti Pregled';
UPDATE public.services SET category_id = '11111111-1111-1111-1111-111111111111' WHERE name = 'Kontrola';
UPDATE public.services SET category_id = '22222222-2222-2222-2222-222222222222' WHERE name = 'Vakcinacija';
UPDATE public.services SET category_id = '33333333-3333-3333-3333-333333333333' WHERE name = 'Hirurgija - Konsultacija';
UPDATE public.services SET category_id = '44444444-4444-4444-4444-444444444444' WHERE name = 'Stomatološki Pregled';
UPDATE public.services SET category_id = '55555555-5555-5555-5555-555555555555' WHERE name = 'Laboratorijske Analize';
