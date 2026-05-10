
-- 1) Replace overly permissive WITH CHECK (true) on public INSERT policies
--    with minimal field-shape validation so linter passes and we still allow public submissions.

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 255
  AND email LIKE '%_@_%.__%'
  AND length(subject) BETWEEN 1 AND 200
  AND length(message) BETWEEN 1 AND 5000
  AND (phone IS NULL OR length(phone) <= 50)
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(owner_first_name) BETWEEN 1 AND 100
  AND length(owner_last_name) BETWEEN 1 AND 100
  AND length(owner_email) BETWEEN 3 AND 255
  AND owner_email LIKE '%_@_%.__%'
  AND length(owner_phone) BETWEEN 3 AND 50
  AND length(pet_name) BETWEEN 1 AND 100
  AND service_id IS NOT NULL
  AND appointment_date >= CURRENT_DATE
  AND status = 'pending'
);

-- 2) Lock down SECURITY DEFINER helper functions: callable only by server-side RLS, not by API clients.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_client_id_for_user(uuid) FROM PUBLIC, anon, authenticated;

-- 3) Stop anonymous listing of files in pet-attachments storage bucket.
--    Public file access via direct URL still works because the bucket itself is public.
DROP POLICY IF EXISTS "Public can view pet attachments" ON storage.objects;
