import { supabase } from '@/integrations/supabase/client';
import { logAudit } from './auditService';

const TMPL_TABLE = 'document_templates' as any;
const VER_TABLE = 'document_template_versions' as any;

export type TemplateFieldType = 'text' | 'textarea' | 'date' | 'checkbox' | 'select' | 'number' | 'repeating' | 'signature';

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  options?: string[]; // for select
  fields?: TemplateField[]; // for repeating section
  placeholder?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latest_version?: TemplateVersion;
  version_count?: number;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  fields: TemplateField[];
  change_notes: string | null;
  created_by: string | null;
  created_at: string;
}

export const templateService = {
  async list(): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from(TMPL_TABLE)
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const templates = (data ?? []) as unknown as DocumentTemplate[];

    // Fetch version counts and latest versions
    if (templates.length > 0) {
      const ids = templates.map((t) => t.id);
      const { data: versions } = await supabase
        .from(VER_TABLE)
        .select('*')
        .in('template_id', ids)
        .order('version', { ascending: false });

      const versionsByTemplate = new Map<string, TemplateVersion[]>();
      ((versions ?? []) as unknown as TemplateVersion[]).forEach((v) => {
        if (!versionsByTemplate.has(v.template_id)) versionsByTemplate.set(v.template_id, []);
        versionsByTemplate.get(v.template_id)!.push(v);
      });

      templates.forEach((t) => {
        const vers = versionsByTemplate.get(t.id) || [];
        t.version_count = vers.length;
        t.latest_version = vers[0] || undefined;
      });
    }

    return templates;
  },

  async getById(id: string): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase.from(TMPL_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as unknown as DocumentTemplate | null;
  },

  async create(input: { name: string; description?: string }): Promise<DocumentTemplate> {
    const { data, error } = await supabase.from(TMPL_TABLE).insert(input as any).select().single();
    if (error) throw error;
    const tmpl = data as unknown as DocumentTemplate;
    await logAudit({ action: 'create', entity_type: 'document_template', entity_id: tmpl.id, metadata: { name: input.name } });
    return tmpl;
  },

  async update(id: string, input: { name?: string; description?: string; is_active?: boolean }): Promise<DocumentTemplate> {
    const { data, error } = await supabase.from(TMPL_TABLE).update(input as any).eq('id', id).select().single();
    if (error) throw error;
    return data as unknown as DocumentTemplate;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TMPL_TABLE).delete().eq('id', id);
    if (error) throw error;
    await logAudit({ action: 'delete', entity_type: 'document_template', entity_id: id });
  },
};

export const templateVersionService = {
  async listByTemplate(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from(VER_TABLE)
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as TemplateVersion[];
  },

  async getLatest(templateId: string): Promise<TemplateVersion | null> {
    const { data, error } = await supabase
      .from(VER_TABLE)
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as TemplateVersion | null;
  },

  async create(input: { template_id: string; fields: TemplateField[]; change_notes?: string }): Promise<TemplateVersion> {
    // Get next version number
    const latest = await this.getLatest(input.template_id);
    const nextVersion = (latest?.version ?? 0) + 1;

    const { data, error } = await supabase.from(VER_TABLE).insert({
      template_id: input.template_id,
      version: nextVersion,
      fields: input.fields as any,
      change_notes: input.change_notes || null,
    } as any).select().single();
    if (error) throw error;
    const ver = data as unknown as TemplateVersion;
    await logAudit({ action: 'create', entity_type: 'template_version', entity_id: ver.id, metadata: { template_id: input.template_id, version: nextVersion } });
    return ver;
  },
};
