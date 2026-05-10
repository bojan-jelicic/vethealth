
CREATE TABLE public.clinic_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'VetHealth.ba',
  phone TEXT,
  email TEXT,
  address TEXT,
  working_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_facebook TEXT,
  social_instagram TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clinic settings"
ON public.clinic_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert clinic settings"
ON public.clinic_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update clinic settings"
ON public.clinic_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_clinic_settings_updated_at
BEFORE UPDATE ON public.clinic_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.clinic_settings (name, phone, email, address, working_hours)
VALUES (
  'VetHealth.ba',
  '+387 51 123 456',
  'info@vethealth.ba',
  'Banja Luka, Bosna i Hercegovina',
  '{"pon_pet":"08:00 - 20:00","sub":"09:00 - 14:00","ned":"Zatvoreno"}'::jsonb
);
