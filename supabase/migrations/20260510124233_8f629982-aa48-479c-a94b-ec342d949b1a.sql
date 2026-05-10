
DROP POLICY IF EXISTS "Staff can update pets" ON public.pets;
CREATE POLICY "Staff can update pets"
ON public.pets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vet'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vet'::app_role));

DROP POLICY IF EXISTS "Staff can update visits" ON public.visits;
CREATE POLICY "Staff can update visits"
ON public.visits
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vet'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'vet'::app_role));
