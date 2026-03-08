
-- Visit documents (findings, reports, etc.)
CREATE TABLE public.visit_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  doc_type text NOT NULL DEFAULT 'finding' CHECK (doc_type IN ('finding', 'report', 'prescription', 'referral', 'other')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view visit documents" ON public.visit_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can insert visit documents" ON public.visit_documents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can update visit documents" ON public.visit_documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Admins can delete visit documents" ON public.visit_documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_visit_documents_updated_at BEFORE UPDATE ON public.visit_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_visit_documents_visit ON public.visit_documents(visit_id);

-- Billing line items per visit
CREATE TABLE public.visit_billing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  service_id uuid REFERENCES public.services(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view billing items" ON public.visit_billing_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can insert billing items" ON public.visit_billing_items FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can update billing items" ON public.visit_billing_items FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Admins can delete billing items" ON public.visit_billing_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_visit_billing_visit ON public.visit_billing_items(visit_id);

-- Inventory consumption per visit
CREATE TABLE public.visit_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'kom',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view visit inventory" ON public.visit_inventory FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can insert visit inventory" ON public.visit_inventory FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Staff can update visit inventory" ON public.visit_inventory FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));
CREATE POLICY "Admins can delete visit inventory" ON public.visit_inventory FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_visit_inventory_visit ON public.visit_inventory(visit_id);
