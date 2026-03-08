import { supabase } from '@/integrations/supabase/client';
import type { AuditLogInsert } from './types';

export async function logAudit(entry: AuditLogInsert): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs' as any).insert({
      actor_user_id: entry.actor_user_id ?? user?.id ?? null,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      metadata: entry.metadata ?? {},
    } as any);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
