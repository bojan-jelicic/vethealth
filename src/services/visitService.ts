import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';
import type { Visit, VisitInsert, VisitUpdate } from './types';

const TABLE = 'visits' as any;

export const visitService = {
  async list(filters?: { petId?: string; ownerId?: string; status?: string }): Promise<Visit[]> {
    let query = supabase.from(TABLE).select('*, pet:pets(id, name, species), owner:clients(id, name)').order('date_time', { ascending: false });
    if (filters?.petId) query = query.eq('pet_id', filters.petId);
    if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Visit[];
  },

  async getById(id: string): Promise<Visit | null> {
    const { data, error } = await supabase.from(TABLE).select('*, pet:pets(*, owner:clients(*)), owner:clients(*)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Visit | null;
  },

  async create(input: VisitInsert): Promise<Visit> {
    const { data, error } = await supabase.from(TABLE).insert(input as any).select().single();
    if (error) throw error;
    const visit = data as Visit;
    await logAudit({ action: 'create', entity_type: 'visit', entity_id: visit.id, metadata: { pet_id: input.pet_id, owner_id: input.owner_id } });
    return visit;
  },

  async update(id: string, input: VisitUpdate): Promise<Visit> {
    const { data, error } = await supabase.from(TABLE).update(input as any).eq('id', id).select().single();
    if (error) throw error;
    await logAudit({ action: 'update', entity_type: 'visit', entity_id: id, metadata: input });
    return data as Visit;
  },

  async cancel(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ status: 'cancelled' } as any).eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'cancel', entity_type: 'visit', entity_id: id });
  },
};
