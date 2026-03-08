import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Plus, ChevronRight, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { templateService, templateVersionService, type TemplateField, type DocumentTemplate, type TemplateVersion } from '@/services/templateService';
import { visitDocumentService } from '@/services/visitDetailServices';

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

  // Check if a repeating field is a billing/invoice section
  const isBillingField = (field: TemplateField) =>
    field.type === 'repeating' &&
    field.fields?.some((f) => f.name === 'cijena' || f.name === 'kolicina');

  // Compute billing total from repeating rows
  const computeBillingTotal = (rows: Record<string, any>[]) =>
    rows.reduce((sum, row) => {
      const qty = parseFloat(row.kolicina) || 0;
      const price = parseFloat(row.cijena) || 0;
      return sum + qty * price;
    }, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {step === 'choose' ? (
          <>
            <DialogHeader>
              <DialogTitle>Novi dokument — odaberi šablon</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              <button
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                onClick={handleSelectBlank}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Prazan dokument</p>
                  <p className="text-xs text-muted-foreground">Slobodni tekst bez šablona</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                  onClick={() => handleSelectTemplate(tmpl)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tmpl.description || 'Bez opisa'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">v{tmpl.latest_version?.version || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{tmpl.latest_version?.fields?.length || 0} polja</Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              {templates.length === 0 && (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  Nema aktivnih šablona. Možete kreirati prazan dokument ili prvo dodati šablon.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? `${selectedTemplate.name}` : 'Novi dokument'}
                {selectedVersion && <Badge variant="outline" className="ml-2 text-[10px]">v{selectedVersion.version}</Badge>}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Title + type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Naslov *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tip</Label>
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

              {/* Template fields */}
              {selectedVersion && selectedVersion.fields.length > 0 && (
                <div className="space-y-3 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Polja šablona</p>
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
              )}

              {/* Billing preview for repeating billing fields */}
              {selectedVersion?.fields.filter(isBillingField).map((field) => {
                const rows = (fieldValues[field.name] || []) as Record<string, any>[];
                if (rows.length === 0) return null;
                const total = computeBillingTotal(rows);
                return (
                  <div key={field.id} className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pregled računa</p>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Opis</TableHead>
                            <TableHead className="text-xs text-right">Kol.</TableHead>
                            <TableHead className="text-xs text-right">Cijena</TableHead>
                            <TableHead className="text-xs text-right">Ukupno</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row, i) => {
                            const qty = parseFloat(row.kolicina) || 0;
                            const price = parseFloat(row.cijena) || 0;
                            return (
                              <TableRow key={i}>
                                <TableCell className="text-sm py-1.5">{row.opis || '—'}</TableCell>
                                <TableCell className="text-sm text-right py-1.5">{qty}</TableCell>
                                <TableCell className="text-sm text-right py-1.5 text-muted-foreground">{price.toFixed(2)}</TableCell>
                                <TableCell className="text-sm text-right py-1.5 font-medium">{(qty * price).toFixed(2)} KM</TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={3} className="text-right font-semibold text-sm py-1.5">UKUPNO</TableCell>
                            <TableCell className="text-right font-bold text-sm py-1.5">{total.toFixed(2)} KM</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}

              {/* Free text content */}
              <div className="space-y-1.5">
                <Label className="text-xs">{selectedTemplate ? 'Dodatne napomene' : 'Sadržaj'}</Label>
                <Textarea
                  value={freeContent}
                  onChange={(e) => setFreeContent(e.target.value)}
                  placeholder="Slobodni tekst..."
                  rows={selectedTemplate ? 3 : 8}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep('choose')}>
                ← Nazad
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>Otkaži</Button>
              <Button onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? 'Čuvanje...' : 'Sačuvaj kao Draft'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
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
  // Detect if this select field is for veterinarian
  const isVetSelect = field.type === 'select' && (
    field.name === 'veterinar' || field.label.toLowerCase().includes('veterinar')
  );

  switch (field.type) {
    case 'text': {
      // Support italic preview for dijagnoza
      const showItalicPreview = field.name === 'dijagnoza' || field.label.toLowerCase().includes('dijagnoz');
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
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
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
          <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={4} required={field.required} />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
          <Input type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
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
            <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
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
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
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
          <Label className="text-xs">{field.label}{field.required && ' *'}</Label>
          <div className="border border-dashed border-border rounded-lg p-4 text-center text-muted-foreground text-sm">
            <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Ime potpisa" className="text-center" />
            <p className="text-[11px] mt-1 text-muted-foreground">Potpis će biti dodan pri finalizaciji</p>
          </div>
        </div>
      );

    case 'repeating':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{field.label}</Label>
          <div className="pl-3 border-l-2 border-primary/20 space-y-2">
            {(repeatingRows || []).map((row, ri) => (
              <div key={ri} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">#{ri + 1}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => onRemoveRow?.(ri)}>
                    Ukloni
                  </Button>
                </div>
                {(field.fields || []).map((sub) => (
                  <div key={sub.id} className="space-y-1">
                    <Label className="text-[11px]">{sub.label}</Label>
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
            <Button variant="outline" size="sm" className="gap-1" onClick={onAddRow}>
              <Plus className="h-3 w-3" />Dodaj red
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
};
