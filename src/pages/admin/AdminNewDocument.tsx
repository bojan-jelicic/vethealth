import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  FileText, ChevronRight, ArrowLeft, Save, Loader2, Plus, Trash2, Building2, Phone, Mail, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  templateService, templateVersionService,
  type TemplateField, type DocumentTemplate, type TemplateVersion,
} from '@/services/templateService';
import { visitDocumentService } from '@/services/visitDetailServices';
import { toast } from '@/hooks/use-toast';

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

type Step = 'choose' | 'fill';

const AdminNewDocument = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('finding');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [freeContent, setFreeContent] = useState('');
  const [visitId, setVisitId] = useState('');

  const { data: templates = [] } = useQuery({
    queryKey: ['document-templates-active'],
    queryFn: async () => (await templateService.list()).filter((t) => t.is_active),
  });

  const { data: vets = [] } = useQuery({
    queryKey: ['veterinarians-active'],
    queryFn: async () => {
      const { data } = await supabase.from('veterinarians').select('id, name').eq('is_active', true).order('name');
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits-recent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('visits' as any)
        .select('id, date_time, reason, pet_id, owner_id')
        .order('date_time', { ascending: false })
        .limit(50);
      if (!data) return [];
      const petIds = [...new Set((data as any[]).map((v: any) => v.pet_id))];
      const ownerIds = [...new Set((data as any[]).map((v: any) => v.owner_id))];
      const [{ data: pets }, { data: owners }] = await Promise.all([
        supabase.from('pets').select('id, name').in('id', petIds),
        supabase.from('clients').select('id, name').in('id', ownerIds),
      ]);
      const petMap = new Map((pets ?? []).map((p: any) => [p.id, p.name]));
      const ownerMap = new Map((owners ?? []).map((o: any) => [o.id, o.name]));
      return (data as any[]).map((v: any) => ({
        id: v.id,
        date_time: v.date_time,
        reason: v.reason,
        pet_name: petMap.get(v.pet_id) || '?',
        owner_name: ownerMap.get(v.owner_id) || '?',
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!visitId) throw new Error('Odaberite posjetu');
      if (!title.trim()) throw new Error('Unesite naslov');
      return visitDocumentService.create({
        visit_id: visitId,
        title,
        content: freeContent,
        doc_type: docType,
        template_id: selectedTemplate?.id,
        template_version_id: selectedVersion?.id,
        field_values: fieldValues,
      });
    },
    onSuccess: (doc) => {
      toast({ title: 'Dokument kreiran', description: `"${doc.title}" je uspješno sačuvan.` });
      navigate(`/app/visits/${visitId}`);
    },
    onError: (err: any) => {
      toast({ title: 'Greška', description: err.message, variant: 'destructive' });
    },
  });

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
      setFieldValues(defaults);
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

  if (step === 'choose') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/documents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Novi nalaz</h1>
            <p className="text-sm text-muted-foreground">Odaberite šablon ili kreirajte prazan dokument</p>
          </div>
        </div>

        <div className="space-y-2">
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep('choose')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-heading font-bold text-foreground">
              {selectedTemplate ? selectedTemplate.name : 'Novi nalaz'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {selectedTemplate ? 'Na osnovu šablona' : 'Prazan dokument'}
              {selectedVersion && <Badge variant="outline" className="ml-2 text-[10px]">v{selectedVersion.version}</Badge>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/app/documents')}>Otkaži</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim() || !visitId}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Sačuvaj kao Draft
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vezana posjeta *</Label>
        <Select value={visitId} onValueChange={setVisitId}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Odaberite posjetu za koju kreirate nalaz..." />
          </SelectTrigger>
          <SelectContent>
            {visits.map((v: any) => (
              <SelectItem key={v.id} value={v.id}>
                {new Date(v.date_time).toLocaleDateString('sr-Latn-BA')} — {v.pet_name} ({v.owner_name})
                {v.reason && ` — ${v.reason}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-zinc-50 rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="p-8 md:p-12 text-zinc-900" style={{ minHeight: '60vh' }}>
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
                          id={`paper-${f.id}`}
                          className="border-zinc-400 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700"
                        />
                        <Label htmlFor={`paper-${f.id}`} className="text-sm cursor-pointer text-zinc-700">{f.label}</Label>
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
                                className="mt-1 border-0 border-b border-zinc-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-emerald-600 text-sm text-zinc-800"
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
                        className="text-center border-0 border-b border-zinc-300 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-emerald-600 text-sm"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{f.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <PaperSection title={selectedTemplate ? 'Dodatne napomene' : 'Sadržaj nalaza'}>
            <Textarea
              value={freeContent}
              onChange={(e) => setFreeContent(e.target.value)}
              placeholder={selectedTemplate ? 'Unesite dodatne napomene...' : 'Unesite tekst nalaza...'}
              rows={selectedTemplate ? 4 : 12}
              className="border-0 border-b border-dashed border-zinc-200 rounded-none bg-transparent resize-none focus-visible:ring-0 focus-visible:border-emerald-600 text-sm text-zinc-800 placeholder:text-zinc-300"
            />
          </PaperSection>

          <div className="mt-12 pt-4 border-t border-zinc-200 text-center">
            <p className="text-[9px] text-zinc-400">
              {CLINIC.name} · {CLINIC.address} · {CLINIC.phone} · {CLINIC.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline" onClick={() => navigate('/app/documents')}>Otkaži</Button>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title.trim() || !visitId}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Sačuvaj kao Draft
        </Button>
      </div>
    </div>
  );
};

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
  const wrapClass = fullWidth ? '' : '';

  const inputClass = "border-0 border-b border-zinc-200 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-emerald-600 text-sm text-zinc-800 placeholder:text-zinc-300";

  return (
    <div className={wrapClass}>
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

export default AdminNewDocument;
