
-- Extend services with rich detail content
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- Storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view service images" ON storage.objects;
CREATE POLICY "Public can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;
CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
