import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Plus, ChevronRight, Receipt, X, ArrowLeft, Loader2,
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { templateService, templateVersionService, type TemplateField, type DocumentTemplate, type TemplateVersion } from '@/services/templateService';
import { visitDocumentService } from '@/services/visitDetailServices';
import { format } from 'date-fns';

interface Props {
  visitId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

type Step = 'choose' | 'fill';

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

  // Templates
  const { data: templates = [] } = useQuery({
    queryKey: ['document-templates-active'],
    queryFn: async () => {
      const all = await templateService.list();
      return all.filter((t) => t.is_active);
    },
    enabled: open,
  });

  // Veterinarians for select fields
  const { data: vets = [] } = useQuery({
    queryKey: ['veterinarians-active'],
    queryFn: async () => {
      const { data } = await supabase.from('veterinarians').select('id, name').eq('is_active', true).order('name');
      return (data ?? []) as { id: string; name: string }[];
    },
    enabled: open,
  });

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
      const initFields = (fields: TemplateField[], prefix = '') => {
        fields.forEach((f) => {
          const key = prefix ? `${prefix}.${f.name}` : f.name;
          if (f.type === 'checkbox') defaults[key] = false;
          else if (f.type === 'repeating') defaults[key] = [{}];
          else if (f.type === 'date') defaults[key] = new Date().toISOString().split('T')[0];
          else defaults[key] = '';
        });
      };
      initFields(ver.fields);
      setFieldValues(defaults);
    }
    setStep('fill');
  };

  const handleSelectBlank = () => {
    setSelectedTemplate(null);
    setSelectedVersion(null);
    setFieldValues({});
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
    setFieldValues((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), {}],
    }));
  };

  const updateRepeatingRow = (key: string, rowIndex: number, subName: string, value: any) => {
    setFieldValues((prev) => {
      const rows = [...(prev[key] || [])];
      rows[rowIndex] = { ...rows[rowIndex], [subName]: value };
      return { ...prev, [key]: rows };
    });
  };

  const removeRepeatingRow = (key: string, rowIndex: number) => {
    setFieldValues((prev) => {
      const rows = [...(prev[key] || [])];
      rows.splice(rowIndex, 1);
      return { ...prev, [key]: rows };
    });
  };

  const isBillingField = (field: TemplateField) =>
    field.type === 'repeating' &&
    field.fields?.some((f) => f.name === 'cijena' || f.name === 'kolicina');

  const computeBillingTotal = (rows: Record<string, any>[]) =>
    rows.reduce((sum, row) => {
      const qty = parseFloat(row.kolicina) || 0;
      const price = parseFloat(row.cijena) || 0;
      return sum + qty * price;
    }, 0);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden [&>button]:hidden">
        {step === 'choose' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <h2 className="text-lg font-semibold text-foreground">Novi dokument</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClose(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Template list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Odaberite šablon ili kreirajte prazan dokument</p>

              <button
                className="w-full flex items-center gap-4 p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 text-left transition-all"
                onClick={handleSelectBlank}
              >
                <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">Prazan dokument</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Slobodni tekst bez predefinisanih polja</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 text-left transition-all"
                  onClick={() => handleSelectTemplate(tmpl)}
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description || 'Bez opisa'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">v{tmpl.latest_version?.version || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{tmpl.latest_version?.fields?.length || 0} polja</Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              {templates.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  Nema aktivnih šablona. Možete kreirati prazan dokument ili prvo dodati šablon.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Header with document ID style */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('choose')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedTemplate ? selectedTemplate.name : 'Novi dokument'}
                    </h2>
                    <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(), 'dd.MM.yyyy')} • {docTypeLabels[docType]}
                    {selectedVersion && ` • Šablon v${selectedVersion.version}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleClose(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Document-style body */}
            <div className="flex-1 overflow-y-auto">
              {/* Document info section */}
              <div className="px-6 py-5 space-y-4 border-b border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Naslov dokumenta</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="font-medium"
                      placeholder="Unesite naslov..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Tip dokumenta</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(docTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Template fields section */}
              {selectedVersion && selectedVersion.fields.length > 0 && (
                <div className="px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Polja ({selectedVersion.fields.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedVersion.fields.map((field) => (
                      <TemplateFieldInput
                        key={field.id}
                        field={field}
                        value={fieldValues[field.name]}
                        onChange={(val) => updateFieldValue(field.name, val)}
                        vets={vets}
                        repeatingRows={field.type === 'repeating' ? fieldValues[field.name] : undefined}
                        onAddRow={() => addRepeatingRow(field.name)}
                        onUpdateRow={(ri, sn, v) => updateRepeatingRow(field.name, ri, sn, v)}
                        onRemoveRow={(ri) => removeRepeatingRow(field.name, ri)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Billing preview for repeating billing fields */}
              {selectedVersion?.fields.filter(isBillingField).map((field) => {
                const rows = (fieldValues[field.name] || []) as Record<string, any>[];
                if (rows.length === 0) return null;
                const total = computeBillingTotal(rows);
                return (
                  <div key={field.id} className="px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pregled računa
                      </h3>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium">Opis</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium text-right">Kol.</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium text-right">Cijena</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wider font-medium text-right">Ukupno</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, i) => {
                            const qty = parseFloat(row.kolicina) || 0;
                            const price = parseFloat(row.cijena) || 0;
                            return (
                              <TableRow key={i}>
                                <TableCell className="text-sm py-2">{row.opis || '—'}</TableCell>
                                <TableCell className="text-sm text-right py-2">{qty}</TableCell>
                                <TableCell className="text-sm text-right py-2 text-muted-foreground">{price.toFixed(2)}</TableCell>
                                <TableCell className="text-sm text-right py-2 font-medium">{(qty * price).toFixed(2)} KM</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/30 border-t-2 border-border">
                            <TableCell colSpan={3} className="text-right font-semibold text-sm py-2">UKUPNO</TableCell>
                            <TableCell className="text-right font-bold text-sm py-2 text-primary">{total.toFixed(2)} KM</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}

              {/* Free text / notes */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {selectedTemplate ? 'Dodatne napomene' : 'Sadržaj dokumenta'}
                  </h3>
                </div>
                <Textarea
                  value={freeContent}
                  onChange={(e) => setFreeContent(e.target.value)}
                  placeholder="Unesite tekst..."
                  rows={selectedTemplate ? 4 : 10}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep('choose')} className="gap-1.5 text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                Nazad
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleClose(false)}>Otkaži</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()} className="gap-1.5">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  {saving ? 'Čuvanje...' : 'Sačuvaj kao Draft'}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ─── Dynamic field renderer ────────────────────

interface TemplateFieldInputProps {
  field: TemplateField;
  value: any;
  onChange: (val: any) => void;
  vets?: { id: string; name: string }[];
  repeatingRows?: Record<string, any>[];
  onAddRow?: () => void;
  onUpdateRow?: (rowIndex: number, subName: string, value: any) => void;
  onRemoveRow?: (rowIndex: number) => void;
}

const TemplateFieldInput = ({
  field, value, onChange, vets,
  repeatingRows, onAddRow, onUpdateRow, onRemoveRow,
}: TemplateFieldInputProps) => {
  const isVetSelect = field.type === 'select' && (
    field.name === 'veterinar' || field.label.toLowerCase().includes('veterinar')
  );

  switch (field.type) {
    case 'text': {
      const showItalicPreview = field.name === 'dijagnoza' || field.label.toLowerCase().includes('dijagnoz');
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />
          {showItalicPreview && value && (
            <p className="text-sm italic text-muted-foreground bg-muted/30 rounded px-3 py-1.5 border border-border">
              {value}
            </p>
          )}
        </div>
      );
    }

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={4} required={field.required} />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <Input type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <Input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center gap-2 py-1">
          <Checkbox checked={!!value} onCheckedChange={(v) => onChange(!!v)} id={field.id} />
          <Label htmlFor={field.id} className="text-sm cursor-pointer">{field.label}</Label>
        </div>
      );

    case 'select':
      if (isVetSelect && vets && vets.length > 0) {
        return (
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {field.label}{field.required && ' *'}
            </Label>
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger><SelectValue placeholder="Odaberi veterinara..." /></SelectTrigger>
              <SelectContent>
                {vets.map((vet) => (
                  <SelectItem key={vet.id} value={vet.name}>{vet.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger><SelectValue placeholder="Odaberi..." /></SelectTrigger>
            <SelectContent>
              {(field.options || []).filter(Boolean).map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'signature':
      return (
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {field.label}{field.required && ' *'}
          </Label>
          <div className="border border-dashed border-border rounded-lg p-4 text-center">
            <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Ime potpisa" className="text-center" />
            <p className="text-[11px] mt-1.5 text-muted-foreground">Potpis će biti dodan pri finalizaciji</p>
          </div>
        </div>
      );

    case 'repeating':
      return (
        <div className="space-y-3">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{field.label}</Label>
          <div className="pl-4 border-l-2 border-primary/20 space-y-3">
            {(repeatingRows || []).map((row, ri) => (
              <div key={ri} className="bg-muted/20 rounded-lg p-4 space-y-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">#{ri + 1}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive hover:text-destructive" onClick={() => onRemoveRow?.(ri)}>
                    Ukloni
                  </Button>
                </div>
                {(field.fields || []).map((sub) => (
                  <div key={sub.id} className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">{sub.label}</Label>
                    {sub.type === 'checkbox' ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!!row[sub.name]}
                          onCheckedChange={(v) => onUpdateRow?.(ri, sub.name, !!v)}
                        />
                      </div>
                    ) : (
                      <Input
                        type={sub.type === 'number' ? 'number' : sub.type === 'date' ? 'date' : 'text'}
                        value={row[sub.name] || ''}
                        onChange={(e) => onUpdateRow?.(ri, sub.name, e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddRow}>
              <Plus className="h-3 w-3" />Dodaj red
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
};
