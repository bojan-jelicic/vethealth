import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Plus, ChevronRight, ArrowLeft, Loader2, Trash2, Save, X,
  Phone, Mail, Globe, Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Sheet, SheetContent,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { templateService, templateVersionService, type TemplateField, type DocumentTemplate, type TemplateVersion } from '@/services/templateService';
import { visitDocumentService, type VisitDocument } from '@/services/visitDetailServices';

interface Props {
  visitId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  editingDocument?: VisitDocument | null;
}

type Step = 'choose' | 'fill';

const CLINIC = {
  name: 'VetHealth Veterinarska ambulanta',
  address: 'Ulica veterinara 15, 71000 Sarajevo',
  phone: '+387 33 123 456',
  website: 'www.vethealth.ba',
  email: 'info@vethealth.ba',
};

const docTypeLabels: Record<string, string> = {
  finding: 'Nalaz', report: 'Izvještaj', prescription: 'Recept', referral: 'Uputnica', other: 'Ostalo',
};

export const CreateDocumentFromTemplate = ({ visitId, open, onOpenChange, onCreated }: Props) => {
  const [step, setStep] = useState<Step>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('finding');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [freeContent, setFreeContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch visit details with owner & pet for auto-fill
  const { data: visitData } = useQuery({
    queryKey: ['visit-for-doc', visitId],
    queryFn: async () => {
      const { data: visit } = await supabase
        .from('visits' as any)
        .select('id, pet_id, owner_id, vet_id, reason, date_time')
        .eq('id', visitId)
        .maybeSingle();
      if (!visit) return null;
      const [{ data: pet }, { data: owner }, { data: vet }] = await Promise.all([
        supabase.from('pets').select('*').eq('id', (visit as any).pet_id).maybeSingle(),
        supabase.from('clients').select('*').eq('id', (visit as any).owner_id).maybeSingle(),
        (visit as any).vet_id
          ? supabase.from('veterinarians').select('*').eq('id', (visit as any).vet_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { visit: visit as any, pet: pet as any, owner: owner as any, vet: vet as any };
    },
    enabled: open && !!visitId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['document-templates-active'],
    queryFn: async () => (await templateService.list()).filter((t) => t.is_active),
    enabled: open,
  });

  const { data: vets = [] } = useQuery({
    queryKey: ['veterinarians-active'],
    queryFn: async () => {
      const { data } = await supabase.from('veterinarians').select('id, name').eq('is_active', true).order('name');
      return (data ?? []) as { id: string; name: string }[];
    },
    enabled: open,
  });

  // Auto-fill field values from visit data
  const autoFillFromVisit = (defaults: Record<string, any>) => {
    if (!visitData) return defaults;
    const filled = { ...defaults };
    const { owner, pet, vet } = visitData;

    // Owner fields
    if (owner) {
      const ownerMap: Record<string, string> = {
        vlasnik_ime: owner.name,
        vlasnik_telefon: owner.phone || '',
        vlasnik_email: owner.email || '',
        vlasnik_adresa: owner.address || '',
      };
      Object.entries(ownerMap).forEach(([key, val]) => {
        if (key in filled) filled[key] = val;
      });
    }

    // Pet fields
    if (pet) {
      const petMap: Record<string, string> = {
        ime_ljubimca: pet.name,
        vrsta: pet.species || '',
        vrsta_zivotinje: pet.species || '',
        pasmina: pet.breed || '',
        spol: pet.sex || '',
        chip_br: pet.microchip_id || '',
        pasos_br: pet.passport_no || '',
        starost: pet.birth_date || '',
      };
      Object.entries(petMap).forEach(([key, val]) => {
        if (key in filled) filled[key] = val;
      });
    }

    // Vet fields
    if (vet) {
      const vetKeys = ['veterinar', 'potpis_veterinar'];
      vetKeys.forEach((key) => {
        if (key in filled) filled[key] = vet.name;
      });
    }

    return filled;
  };

  const reset = () => {
    setStep('choose');
    setSelectedTemplate(null);
    setSelectedVersion(null);
    setTitle('');
    setDocType('finding');
    setFieldValues({});
    setFreeContent('');
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleSelectTemplate = async (tmpl: DocumentTemplate) => {
    setSelectedTemplate(tmpl);
    setTitle(tmpl.name);
    const ver = await templateVersionService.getLatest(tmpl.id);
    if (ver) {
      setSelectedVersion(ver);
      const defaults: Record<string, any> = {};
      ver.fields.forEach((f) => {
        if (f.type === 'checkbox') defaults[f.name] = false;
        else if (f.type === 'repeating') defaults[f.name] = [{}];
        else if (f.type === 'date') defaults[f.name] = new Date().toISOString().split('T')[0];
        else defaults[f.name] = '';
      });
      setFieldValues(autoFillFromVisit(defaults));
    }
    setStep('fill');
  };

  const handleSelectBlank = () => {
    setSelectedTemplate(null);
    setSelectedVersion(null);
    setFieldValues({});
    setTitle('');
    setDocType('finding');
    setFreeContent('');
    setStep('fill');
  };

  const updateFieldValue = (key: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await visitDocumentService.create({
        visit_id: visitId,
        title,
        content: freeContent,
        doc_type: docType,
        template_id: selectedTemplate?.id,
        template_version_id: selectedVersion?.id,
        field_values: fieldValues,
      });
      onCreated();
      handleClose(false);
    } catch {
      // error handled by caller
    } finally {
      setSaving(false);
    }
  };

  const addRepeatingRow = (key: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: [...(prev[key] || []), {}] }));
  };
  const updateRepeatingRow = (key: string, ri: number, subName: string, value: any) => {
    setFieldValues((prev) => {
      const rows = [...(prev[key] || [])];
      rows[ri] = { ...rows[ri], [subName]: value };
      return { ...prev, [key]: rows };
    });
  };
  const removeRepeatingRow = (key: string, ri: number) => {
    setFieldValues((prev) => {
      const rows = [...(prev[key] || [])];
      rows.splice(ri, 1);
      return { ...prev, [key]: rows };
    });
  };

  const categorizedFields = useMemo(() => {
    if (!selectedVersion) return null;
    const ownerFields: TemplateField[] = [];
    const petFields: TemplateField[] = [];
    const clinicalFields: TemplateField[] = [];
    const checkboxFields: TemplateField[] = [];
    const signatureFields: TemplateField[] = [];
    const repeatingFields: TemplateField[] = [];
    const otherFields: TemplateField[] = [];

    selectedVersion.fields.forEach((f) => {
      if (f.name.startsWith('vlasnik_')) ownerFields.push(f);
      else if (['ime_ljubimca', 'vrsta', 'pasmina', 'spol', 'starost', 'pasos_br', 'chip_br', 'vrsta_zivotinje'].includes(f.name)) petFields.push(f);
      else if (f.type === 'checkbox') checkboxFields.push(f);
      else if (f.type === 'signature' || f.name.startsWith('potpis')) signatureFields.push(f);
      else if (f.type === 'repeating') repeatingFields.push(f);
      else if (['dijagnoza', 'anamneza', 'klinicka_slika', 'terapija', 'napomena', 'napomene', 'zakljucak', 'rezultat', 'materijal', 'metoda', 'opis_intervencije'].includes(f.name)) clinicalFields.push(f);
      else otherFields.push(f);
    });

    return { ownerFields, petFields, clinicalFields, checkboxFields, signatureFields, repeatingFields, otherFields };
  }, [selectedVersion]);

  const inputClass = "border-0 border-b border-zinc-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-emerald-600 text-sm text-zinc-800 placeholder:text-zinc-300";

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl lg:max-w-5xl p-0 flex flex-col overflow-hidden [&>button]:hidden">
        {step === 'choose' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <h2 className="text-lg font-semibold text-foreground">Novi dokument — odaberi šablon</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClose(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Odaberite šablon ili kreirajte prazan dokument</p>

              <button
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 text-left transition-all"
                onClick={handleSelectBlank}
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Prazan nalaz</p>
                  <p className="text-sm text-muted-foreground">Počnite od nule — slobodan unos bez šablona</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                  onClick={() => handleSelectTemplate(tmpl)}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{tmpl.name}</p>
                    <p className="text-sm text-muted-foreground">{tmpl.description || 'Bez opisa'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">v{tmpl.latest_version?.version || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{tmpl.latest_version?.fields?.length || 0} polja</Badge>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}

              {templates.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  Nema aktivnih šablona. Možete kreirati prazan nalaz.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('choose')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {selectedTemplate ? selectedTemplate.name : 'Novi nalaz'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate ? 'Na osnovu šablona' : 'Prazan dokument'}
                    {selectedVersion && <Badge variant="outline" className="ml-2 text-[10px]">v{selectedVersion.version}</Badge>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleClose(false)}>Otkaži</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()} className="gap-1.5">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? 'Čuvanje...' : 'Sačuvaj kao Draft'}
                </Button>
              </div>
            </div>

            {/* Paper-style document body */}
            <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
              <div className="bg-white dark:bg-zinc-50 rounded-xl shadow-lg border border-border overflow-hidden max-w-4xl mx-auto">
                <div className="p-8 md:p-12 text-zinc-900" style={{ minHeight: '60vh' }}>
                  {/* Clinic Header */}
                  <div className="flex items-start justify-between pb-4 border-b-2 border-emerald-700 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-700 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">V</span>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-800 text-base">{CLINIC.name}</p>
                        <p className="text-xs text-zinc-500">{CLINIC.address}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-zinc-500 space-y-0.5">
                      <div className="flex items-center justify-end gap-1"><Phone className="h-3 w-3" />{CLINIC.phone}</div>
                      <div className="flex items-center justify-end gap-1"><Mail className="h-3 w-3" />{CLINIC.email}</div>
                      <div className="flex items-center justify-end gap-1"><Globe className="h-3 w-3" />{CLINIC.website}</div>
                    </div>
                  </div>

                  {/* Document title */}
                  <div className="text-center mb-8">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="NASLOV DOKUMENTA"
                      className="text-center text-xl font-bold uppercase tracking-wider border-0 border-b-2 border-dashed border-zinc-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-emerald-600 text-zinc-800 placeholder:text-zinc-300"
                    />
                    <div className="mt-2 flex justify-center">
                      <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger className="w-auto border-0 bg-transparent text-xs text-zinc-500 h-7 gap-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(docTypeLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Template fields - categorized paper style */}
                  {selectedVersion && categorizedFields && (
                    <>
                      {categorizedFields.ownerFields.length > 0 && (
                        <PaperSection title="Podaci o vlasniku">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                            {categorizedFields.ownerFields.map((f) => (
                              <PaperField key={f.id} field={f} value={fieldValues[f.name]} onChange={(v) => updateFieldValue(f.name, v)} vets={vets} />
                            ))}
                          </div>
                        </PaperSection>
                      )}

                      {categorizedFields.petFields.length > 0 && (
                        <PaperSection title="Podaci o životinji">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                            {categorizedFields.petFields.map((f) => (
                              <PaperField key={f.id} field={f} value={fieldValues[f.name]} onChange={(v) => updateFieldValue(f.name, v)} vets={vets} />
                            ))}
                          </div>
                        </PaperSection>
                      )}

                      {categorizedFields.otherFields.length > 0 && (
                        <PaperSection title="Opšti podaci">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            {categorizedFields.otherFields.map((f) => (
                              <PaperField key={f.id} field={f} value={fieldValues[f.name]} onChange={(v) => updateFieldValue(f.name, v)} vets={vets} />
                            ))}
                          </div>
                        </PaperSection>
                      )}

                      {categorizedFields.checkboxFields.length > 0 && (
                        <PaperSection title="Preporučene analize">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categorizedFields.checkboxFields.map((f) => (
                              <div key={f.id} className="flex items-center gap-2.5">
                                <Checkbox
                                  checked={!!fieldValues[f.name]}
                                  onCheckedChange={(v) => updateFieldValue(f.name, !!v)}
                                  id={`panel-${f.id}`}
                                  className="border-zinc-400 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700"
                                />
                                <Label htmlFor={`panel-${f.id}`} className="text-sm cursor-pointer text-zinc-700">{f.label}</Label>
                              </div>
                            ))}
                          </div>
                        </PaperSection>
                      )}

                      {categorizedFields.clinicalFields.length > 0 && (
                        <PaperSection title="Klinički nalaz">
                          <div className="space-y-4">
                            {categorizedFields.clinicalFields.map((f) => (
                              <PaperField key={f.id} field={f} value={fieldValues[f.name]} onChange={(v) => updateFieldValue(f.name, v)} vets={vets} fullWidth />
                            ))}
                          </div>
                        </PaperSection>
                      )}

                      {categorizedFields.repeatingFields.map((f) => (
                        <PaperSection key={f.id} title={f.label}>
                          <div className="space-y-3">
                            {(fieldValues[f.name] || []).map((row: any, ri: number) => (
                              <div key={ri} className="border border-zinc-200 rounded-lg p-4 relative">
                                <div className="absolute top-2 right-2">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500" onClick={() => removeRepeatingRow(f.name, ri)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="text-[10px] font-semibold text-zinc-400 uppercase mb-2">#{ri + 1}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                  {(f.fields || []).map((sub) => (
                                    <div key={sub.id}>
                                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{sub.label}</label>
                                      <Input
                                        type={sub.type === 'number' ? 'number' : sub.type === 'date' ? 'date' : 'text'}
                                        value={row[sub.name] || ''}
                                        onChange={(e) => updateRepeatingRow(f.name, ri, sub.name, e.target.value)}
                                        className={`mt-1 ${inputClass}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="gap-1.5 border-dashed text-zinc-500" onClick={() => addRepeatingRow(f.name)}>
                              <Plus className="h-3 w-3" />Dodaj
                            </Button>
                          </div>
                        </PaperSection>
                      ))}

                      {categorizedFields.signatureFields.length > 0 && (
                        <div className="mt-12 flex justify-between gap-8">
                          {categorizedFields.signatureFields.map((f) => (
                            <div key={f.id} className="flex-1 text-center">
                              <Input
                                value={fieldValues[f.name] || ''}
                                onChange={(e) => updateFieldValue(f.name, e.target.value)}
                                placeholder={f.label}
                                className={`text-center ${inputClass}`}
                              />
                              <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{f.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Free content */}
                  <PaperSection title={selectedTemplate ? 'Dodatne napomene' : 'Sadržaj nalaza'}>
                    <Textarea
                      value={freeContent}
                      onChange={(e) => setFreeContent(e.target.value)}
                      placeholder={selectedTemplate ? 'Unesite dodatne napomene...' : 'Unesite tekst nalaza...'}
                      rows={selectedTemplate ? 4 : 12}
                      className={`${inputClass} border-dashed resize-none`}
                    />
                  </PaperSection>

                  {/* Footer */}
                  <div className="mt-12 pt-4 border-t border-zinc-200 text-center">
                    <p className="text-[9px] text-zinc-400">
                      {CLINIC.name} · {CLINIC.address} · {CLINIC.phone} · {CLINIC.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ─── Paper-style sub-components ────────────────────

const PaperSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">{title}</h3>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
    {children}
  </div>
);

const PaperField = ({
  field, value, onChange, vets, fullWidth,
}: {
  field: TemplateField;
  value: any;
  onChange: (v: any) => void;
  vets: { id: string; name: string }[];
  fullWidth?: boolean;
}) => {
  const isVetSelect = field.type === 'select' && (field.name === 'veterinar' || field.label.toLowerCase().includes('veterinar'));
  const inputClass = "border-0 border-b border-zinc-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-emerald-600 text-sm text-zinc-800 placeholder:text-zinc-300";

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
        {field.label}{field.required && ' *'}
      </label>

      {field.type === 'textarea' ? (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`mt-1 ${inputClass} resize-none min-h-[60px]`}
        />
      ) : field.type === 'select' ? (
        isVetSelect && vets.length > 0 ? (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={`mt-1 ${inputClass} border-b`}>
              <SelectValue placeholder="Odaberi..." />
            </SelectTrigger>
            <SelectContent>
              {vets.map((vet) => (
                <SelectItem key={vet.id} value={vet.name}>{vet.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={`mt-1 ${inputClass} border-b`}>
              <SelectValue placeholder="Odaberi..." />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).filter(Boolean).map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : field.type === 'signature' ? (
        <div className="mt-6 text-center">
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || field.label}
            className={`text-center ${inputClass}`}
          />
          <p className="text-[10px] text-zinc-400 mt-1">{field.label}</p>
        </div>
      ) : (
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`mt-1 ${inputClass}`}
        />
      )}
    </div>
  );
};
