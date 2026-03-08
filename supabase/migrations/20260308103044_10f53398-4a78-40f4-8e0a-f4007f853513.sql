
-- Reminder types enum
CREATE TYPE public.reminder_type AS ENUM ('vaccine_due', 'follow_up', 'custom');
CREATE TYPE public.reminder_status AS ENUM ('open', 'snoozed', 'done');

CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type public.reminder_type NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  pet_id UUID DEFAULT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  visit_id UUID DEFAULT NULL REFERENCES public.visits(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  status public.reminder_status NOT NULL DEFAULT 'open',
  snoozed_until DATE DEFAULT NULL,
  channel_in_app BOOLEAN NOT NULL DEFAULT true,
  channel_email BOOLEAN NOT NULL DEFAULT false,
  created_by UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view reminders" ON public.reminders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can insert reminders" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Staff can update reminders" ON public.reminders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'vet'));

CREATE POLICY "Admins can delete reminders" ON public.reminders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
