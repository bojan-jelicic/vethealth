import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';
import type { Pet, PetInsert, PetUpdate } from './types';

const TABLE = 'pets' as any;

export const petService = {
  async list(filters?: { ownerId?: string; search?: string }): Promise<Pet[]> {
    let query = supabase.from(TABLE).select('*, owner:clients(*)').eq('is_active', true).order('name');
    if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
    if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,microchip_id.ilike.%${filters.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Pet[];
  },

  async getById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase.from(TABLE).select('*, owner:clients(*)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Pet | null;
  },

  async create(input: PetInsert): Promise<Pet> {
    const { data, error } = await supabase.from(TABLE).insert(input as any).select().single();
    if (error) throw error;
    const pet = data as Pet;
    await logAudit({ action: 'create', entity_type: 'pet', entity_id: pet.id, metadata: { name: input.name, owner_id: input.owner_id } });
    return pet;
  },

  async update(id: string, input: PetUpdate): Promise<Pet> {
    const { data, error } = await supabase.from(TABLE).update(input as any).eq('id', id).select().single();
    if (error) throw error;
    await logAudit({ action: 'update', entity_type: 'pet', entity_id: id, metadata: input });
    return data as Pet;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).update({ is_active: false } as any).eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'soft_delete', entity_type: 'pet', entity_id: id });
  },
};
