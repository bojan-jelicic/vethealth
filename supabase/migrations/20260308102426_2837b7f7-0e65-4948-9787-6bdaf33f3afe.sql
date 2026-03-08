INSERT INTO public.service_categories (name, sort_order, is_active) 
VALUES 
  ('Preventiva', 6, true),
  ('Dijagnostika', 7, true),
  ('Terapija', 8, true),
  ('Ostalo', 9, true)
ON CONFLICT DO NOTHING;