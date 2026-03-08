import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';
import type { Attachment, AttachmentInsert } from './types';

const TABLE = 'attachments' as any;

export const attachmentService = {
  async listByEntity(entityType: string, entityId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Attachment[];
  },

  async create(input: AttachmentInsert): Promise<Attachment> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...input, uploaded_by: input.uploaded_by ?? user?.id ?? null } as any)
      .select()
      .single();
    if (error) throw error;
    const attachment = data as Attachment;
    await logAudit({ action: 'create', entity_type: 'attachment', entity_id: attachment.id, metadata: { file_name: input.file_name, for: `${input.entity_type}:${input.entity_id}` } });
    return attachment;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'delete', entity_type: 'attachment', entity_id: id });
  },
};
