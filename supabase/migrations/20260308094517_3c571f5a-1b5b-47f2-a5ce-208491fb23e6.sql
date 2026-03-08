
-- Clients / Owners
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view clients" ON public.clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can insert clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pets
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'Pas',
  breed text,
  sex text CHECK (sex IN ('M', 'F', 'unknown')),
  birth_date date,
  weight numeric,
  microchip_id text,
  passport_no text,
  allergies text,
  chronic_conditions text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view pets" ON public.pets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can insert pets" ON public.pets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can update pets" ON public.pets FOR UPDATE TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Admins can delete pets" ON public.pets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Visits
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  vet_id uuid REFERENCES public.veterinarians(id),
  date_time timestamptz NOT NULL DEFAULT now(),
  reason text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view visits" ON public.visits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can insert visits" ON public.visits FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can update visits" ON public.visits FOR UPDATE TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Admins can delete visits" ON public.visits FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Attachments (polymorphic)
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view attachments" ON public.attachments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can insert attachments" ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Admins can delete attachments" ON public.attachments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

-- Indexes
CREATE INDEX idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX idx_visits_pet_id ON public.visits(pet_id);
CREATE INDEX idx_visits_owner_id ON public.visits(owner_id);
CREATE INDEX idx_visits_date_time ON public.visits(date_time);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);
