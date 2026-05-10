
-- Drop overly-permissive public policy that exposed email/phone
DROP POLICY IF EXISTS "Anyone can view active veterinarians" ON public.veterinarians;

-- Staff can view full records
CREATE POLICY "Staff can view veterinarians"
ON public.veterinarians
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vet'::app_role));

-- Public-safe view exposing only non-sensitive columns
CREATE OR REPLACE VIEW public.public_veterinarians
WITH (security_invoker = false) AS
SELECT id, name, specialization, is_active
FROM public.veterinarians
WHERE is_active = true;

GRANT SELECT ON public.public_veterinarians TO anon, authenticated;
