
CREATE INDEX IF NOT EXISTS audit_logs_created_at_desc_idx
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_entity_idx
  ON public.audit_logs (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.purge_audit_logs(_older_than_days integer DEFAULT 365)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins may purge audit logs';
  END IF;

  IF _older_than_days IS NULL OR _older_than_days < 30 THEN
    RAISE EXCEPTION 'Retention must be at least 30 days';
  END IF;

  DELETE FROM public.audit_logs
  WHERE created_at < now() - make_interval(days => _older_than_days);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, metadata)
  VALUES (auth.uid(), 'purge', 'audit_logs',
          jsonb_build_object('older_than_days', _older_than_days, 'deleted', deleted_count));

  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_audit_logs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_audit_logs(integer) TO authenticated;
