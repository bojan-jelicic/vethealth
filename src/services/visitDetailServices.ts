import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';

const DOC_TABLE = 'visit_documents' as any;
const BILLING_TABLE = 'visit_billing_items' as any;
const INV_TABLE = 'visit_inventory' as any;

export interface VisitDocument {
  id: string;
  visit_id: string;
  title: string;
  content: string;
  doc_type: 'finding' | 'report' | 'prescription' | 'referral' | 'other';
  status: 'draft' | 'finalized';
  template_id: string | null;
  template_version_id: string | null;
  field_values: Record<string, any>;
  locked_at: string | null;
  locked_by: string | null;
  unlock_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  pdf_url: string | null;
}

export interface VisitBillingItem {
  id: string;
  visit_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount: number;
  note: string | null;
  service_id: string | null;
  created_at: string;
}

export interface VisitInventoryItem {
  id: string;
  visit_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  notes: string | null;
  created_at: string;
}

export const visitDocumentService = {
  async listByVisit(visitId: string): Promise<VisitDocument[]> {
    const { data, error } = await supabase
      .from(DOC_TABLE).select('*').eq('visit_id', visitId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as VisitDocument[];
  },

  async getById(docId: string): Promise<VisitDocument | null> {
    const { data, error } = await supabase.from(DOC_TABLE).select('*').eq('id', docId).maybeSingle();
    if (error) throw error;
    return data as unknown as VisitDocument | null;
  },

  async create(input: {
    visit_id: string;
    title: string;
    content?: string;
    doc_type?: string;
    template_id?: string;
    template_version_id?: string;
    field_values?: Record<string, any>;
  }): Promise<VisitDocument> {
    const { data, error } = await supabase.from(DOC_TABLE).insert(input as any).select().single();
    if (error) throw error;
    const doc = data as unknown as VisitDocument;
    await logAudit({ action: 'create', entity_type: 'visit_document', entity_id: doc.id, metadata: { title: input.title } });
    return doc;
  },

  async update(id: string, input: Partial<{
    title: string;
    content: string;
    status: string;
    field_values: Record<string, any>;
    locked_at: string | null;
    locked_by: string | null;
    unlock_reason: string | null;
  }>): Promise<VisitDocument> {
    const { data, error } = await supabase.from(DOC_TABLE).update(input as any).eq('id', id).select().single();
    if (error) throw error;
    return data as unknown as VisitDocument;
  },

  async finalize(id: string): Promise<VisitDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from(DOC_TABLE).update({
      status: 'finalized',
      locked_at: new Date().toISOString(),
      locked_by: user?.id || null,
    } as any).eq('id', id).select().single();
    if (error) throw error;
    await logAudit({ action: 'finalize', entity_type: 'visit_document', entity_id: id });
    return data as unknown as VisitDocument;
  },

  async unlock(id: string, reason: string): Promise<VisitDocument> {
    const { data, error } = await supabase.from(DOC_TABLE).update({
      status: 'draft',
      locked_at: null,
      locked_by: null,
      unlock_reason: reason,
    } as any).eq('id', id).select().single();
    if (error) throw error;
    await logAudit({ action: 'unlock', entity_type: 'visit_document', entity_id: id, metadata: { reason } });
    return data as unknown as VisitDocument;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(DOC_TABLE).delete().eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'delete', entity_type: 'visit_document', entity_id: id });
  },
};

export const visitBillingService = {
  async listByVisit(visitId: string): Promise<VisitBillingItem[]> {
    const { data, error } = await supabase
      .from(BILLING_TABLE).select('*').eq('visit_id', visitId).order('created_at');
    if (error) throw error;
    return (data ?? []) as unknown as VisitBillingItem[];
  },
  async create(input: { visit_id: string; description: string; quantity?: number; unit_price?: number; service_id?: string }): Promise<VisitBillingItem> {
    const { data, error } = await supabase.from(BILLING_TABLE).insert(input as any).select().single();
    if (error) throw error;
    return data as unknown as VisitBillingItem;
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(BILLING_TABLE).delete().eq('id', id);
    if (error) throw error;
  },
};

export const visitInventoryService = {
  async listByVisit(visitId: string): Promise<VisitInventoryItem[]> {
    const { data, error } = await supabase
      .from(INV_TABLE).select('*').eq('visit_id', visitId).order('created_at');
    if (error) throw error;
    return (data ?? []) as unknown as VisitInventoryItem[];
  },
  async create(input: { visit_id: string; item_name: string; quantity?: number; unit?: string; notes?: string }): Promise<VisitInventoryItem> {
    const { data, error } = await supabase.from(INV_TABLE).insert(input as any).select().single();
    if (error) throw error;
    return data as unknown as VisitInventoryItem;
  },
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(INV_TABLE).delete().eq('id', id);
    if (error) throw error;
  },
};
