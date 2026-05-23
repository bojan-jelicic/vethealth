-- 1. Remove overly broad SELECT on inventory_items (staff ALL policy already covers staff SELECT)
DROP POLICY IF EXISTS "Authenticated users can read inventory_items" ON public.inventory_items;

-- 2. Remove overly broad SELECT on stock_movements
DROP POLICY IF EXISTS "Authenticated users can read stock_movements" ON public.stock_movements;

-- 3. Make pet-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pet-attachments';

-- 4. Add explicit UPDATE policy for pet-attachments restricted to staff
DROP POLICY IF EXISTS "Staff can update pet attachments" ON storage.objects;
CREATE POLICY "Staff can update pet attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-attachments'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'vet'::public.app_role))
)
WITH CHECK (
  bucket_id = 'pet-attachments'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role)
       OR public.has_role(auth.uid(), 'vet'::public.app_role))
);