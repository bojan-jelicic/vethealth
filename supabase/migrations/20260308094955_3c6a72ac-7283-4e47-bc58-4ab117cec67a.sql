
-- Create storage bucket for pet attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-attachments', 'pet-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Staff can upload
CREATE POLICY "Staff can upload pet attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pet-attachments'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'))
);

-- RLS: Staff can view
CREATE POLICY "Staff can view pet attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'pet-attachments'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'))
);

-- RLS: Public can view (bucket is public)
CREATE POLICY "Public can view pet attachments"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'pet-attachments');

-- RLS: Admins can delete
CREATE POLICY "Admins can delete pet attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'pet-attachments'
  AND public.has_role(auth.uid(), 'admin')
);
