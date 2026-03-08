
-- Add template reference and structured data to visit_documents
ALTER TABLE public.visit_documents
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.document_templates(id),
  ADD COLUMN IF NOT EXISTS template_version_id uuid REFERENCES public.document_template_versions(id),
  ADD COLUMN IF NOT EXISTS field_values jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS unlock_reason text;
