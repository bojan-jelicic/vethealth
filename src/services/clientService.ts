import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';
import type { Client, ClientInsert, ClientUpdate } from './types';

const TABLE = 'clients' as any;

export const clientService = {
  async list(search?: string): Promise<Client[]> {
    let query = supabase.from(TABLE).select('*').eq('is_active', true).order('name');
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Client[];
  },

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Client | null;
  },

  async create(input: ClientInsert): Promise<Client> {
    const { data, error } = await supabase.from(TABLE).insert(input as any).select().single();
    if (error) throw error;
    const client = data as Client;
    await logAudit({ action: 'create', entity_type: 'client', entity_id: client.id, metadata: { name: input.name } });
    return client;
  },

  async update(id: string, input: ClientUpdate): Promise<Client> {
    const { data, error } = await supabase.from(TABLE).update(input as any).eq('id', id).select().single();
    if (error) throw error;
    const client = data as Client;
    await logAudit({ action: 'update', entity_type: 'client', entity_id: id, metadata: input });
    return client;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ is_active: false } as any).eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'soft_delete', entity_type: 'client', entity_id: id });
  },
};
