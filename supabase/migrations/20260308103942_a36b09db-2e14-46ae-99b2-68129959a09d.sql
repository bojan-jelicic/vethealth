CREATE OR REPLACE FUNCTION public.get_client_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id FROM public.clients c
  WHERE c.email = (SELECT email FROM auth.users WHERE id = _user_id)
  LIMIT 1
$$;

CREATE POLICY "Clients can view own record"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'client'::app_role)
    AND id = get_client_id_for_user(auth.uid())
  );

CREATE POLICY "Clients can view own pets"
  ON public.pets FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'client'::app_role)
    AND owner_id = get_client_id_for_user(auth.uid())
  );

CREATE POLICY "Clients can view own visits"
  ON public.visits FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'client'::app_role)
    AND owner_id = get_client_id_for_user(auth.uid())
  );

CREATE POLICY "Clients can view own visit documents"
  ON public.visit_documents FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'client'::app_role)
    AND visit_id IN (
      SELECT id FROM public.visits
      WHERE owner_id = get_client_id_for_user(auth.uid())
    )
  );