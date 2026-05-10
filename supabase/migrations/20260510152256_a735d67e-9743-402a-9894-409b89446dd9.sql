
DROP VIEW IF EXISTS public.public_veterinarians;

CREATE OR REPLACE FUNCTION public.get_public_veterinarians()
RETURNS TABLE(id uuid, name text, specialization text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, specialization
  FROM public.veterinarians
  WHERE is_active = true
  ORDER BY name;
$$;

REVOKE ALL ON FUNCTION public.get_public_veterinarians() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_veterinarians() TO anon, authenticated;
