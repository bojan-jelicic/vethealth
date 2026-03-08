// Core data model types for the veterinary system

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientInsert {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface ClientUpdate extends Partial<ClientInsert> {}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: 'M' | 'F' | 'unknown' | null;
  birth_date: string | null;
  weight: number | null;
  microchip_id: string | null;
  passport_no: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  owner?: Client;
}

export interface PetInsert {
  owner_id: string;
  name: string;
  species?: string;
  breed?: string | null;
  sex?: 'M' | 'F' | 'unknown' | null;
  birth_date?: string | null;
  weight?: number | null;
  microchip_id?: string | null;
  passport_no?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  is_active?: boolean;
}

export interface PetUpdate extends Partial<Omit<PetInsert, 'owner_id'>> {}

export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Visit {
  id: string;
  pet_id: string;
  owner_id: string;
  vet_id: string | null;
  date_time: string;
  reason: string | null;
  notes: string | null;
  status: VisitStatus;
  created_at: string;
  updated_at: string;
  // joined
  pet?: Pet;
  owner?: Client;
}

export interface VisitInsert {
  pet_id: string;
  owner_id: string;
  vet_id?: string | null;
  date_time?: string;
  reason?: string | null;
  notes?: string | null;
  status?: VisitStatus;
}

export interface VisitUpdate extends Partial<Omit<VisitInsert, 'pet_id' | 'owner_id'>> {}

export interface Attachment {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_url: string;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface AttachmentInsert {
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_url: string;
  mime_type?: string | null;
  uploaded_by?: string | null;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogInsert {
  actor_user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}
