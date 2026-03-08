import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, History,
  Type, AlignLeft, Calendar, CheckSquare, ListOrdered, Hash,
  Repeat, PenTool, ChevronDown, ChevronRight, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import {
  templateService, templateVersionService,
  type TemplateField, type TemplateFieldType, type TemplateVersion,
} from '@/services/templateService';
import { format } from 'date-fns';

const FIELD_TYPE_META: Record<TemplateFieldType, { label: string; icon: any }> = {
  text: { label: 'Tekst', icon: Type },
  textarea: { label: 'Dugi tekst', icon: AlignLeft },
  date: { label: 'Datum', icon: Calendar },
  checkbox: { label: 'Checkbox', icon: CheckSquare },
  select: { label: 'Izbor', icon: ListOrdered },
  number: { label: 'Broj', icon: Hash },
  repeating: { label: 'Ponavljajuća sekcija', icon: Repeat },
  signature: { label: 'Potpis', icon: PenTool },
};

const generateId = () => crypto.randomUUID();

const createEmptyField = (type: TemplateFieldType): TemplateField => ({
  id: generateId(),
  name: '',
  label: '',
  type,
  required: false,
  ...(type === 'select' ? { options: [''] } : {}),
  ...(type === 'repeating' ? { fields: [] } : {}),
});

const AdminTemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [changeNotes, setChangeNotes] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Template
  const { data: template, isLoading: tmplLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getById(id!),
    enabled: !!id,
  });

  // Versions
  const { data: versions = [] } = useQuery({
    queryKey: ['template-versions', id],
    queryFn: () => templateVersionService.listByTemplate(id!),
    enabled: !!id,
  });

  // Latest version — init fields once
  const { data: latestVersion } = useQuery({
    queryKey: ['template-latest', id],
    queryFn: () => templateVersionService.getLatest(id!),
    enabled: !!id,
  });

  if (latestVersion && !initialized) {
    setFields(latestVersion.fields || []);
    setInitialized(true);
  }

  // Save as new version
  const saveMutation = useMutation({
    mutationFn: () => templateVersionService.create({
      template_id: id!,
      fields,
      change_notes: changeNotes || undefined,
    }),
    onSuccess: (ver) => {
      qc.invalidateQueries({ queryKey: ['template-versions', id] });
      qc.invalidateQueries({ queryKey: ['template-latest', id] });
      qc.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Verzija sačuvana', description: `Verzija ${ver.version} kreirana.` });
      setSaveDialogOpen(false);
      setChangeNotes('');
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  // Load specific version
  const loadVersion = (ver: TemplateVersion) => {
    setFields(ver.fields || []);
    setHistoryOpen(false);
    toast({ title: `Verzija ${ver.version} učitana`, description: 'Sačuvajte kao novu verziju da primijenite promjene.' });
  };

  // Field operations
  const addField = (type: TemplateFieldType) => {
    setFields((prev) => [...prev, createEmptyField(type)]);
  };

  const updateField = useCallback((fieldId: string, updates: Partial<TemplateField>) => {
    setFields((prev) => prev.map((f) => f.id === fieldId ? { ...f, ...updates } : f));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }, []);

  const moveField = useCallback((index: number, direction: 'up' | 'down') => {
    setFields((prev) => {
      const arr = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  }, []);

  const duplicateField = useCallback((field: TemplateField) => {
    const clone: TemplateField = {
      ...JSON.parse(JSON.stringify(field)),
      id: generateId(),
      name: field.name + '_copy',
      label: field.label + ' (kopija)',
    };
    setFields((prev) => [...prev, clone]);
  }, []);

  // Sub-field operations (for repeating)
  const addSubField = useCallback((parentId: string, type: TemplateFieldType) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== parentId) return f;
      return { ...f, fields: [...(f.fields || []), createEmptyField(type)] };
    }));
  }, []);

  const updateSubField = useCallback((parentId: string, subId: string, updates: Partial<TemplateField>) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== parentId) return f;
      return { ...f, fields: (f.fields || []).map((sf) => sf.id === subId ? { ...sf, ...updates } : sf) };
    }));
  }, []);

  const removeSubField = useCallback((parentId: string, subId: string) => {
    setFields((prev) => prev.map((f) => {
      if (f.id !== parentId) return f;
      return { ...f, fields: (f.fields || []).filter((sf) => sf.id !== subId) };
    }));
  }, []);

  if (tmplLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!template) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Šablon nije pronađen.</p>
        <Button variant="link" onClick={() => navigate('/app/documents/templates')}>Nazad</Button>
      </div>
    );
  }

  const currentVersion = latestVersion?.version ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/documents/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{template.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">v{currentVersion}</Badge>
              <span className="text-sm text-muted-foreground">{fields.length} polja</span>
              {template.description && <span className="text-sm text-muted-foreground">· {template.description}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setHistoryOpen(true)}>
            <History className="h-3.5 w-3.5" />Verzije ({versions.length})
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-3.5 w-3.5" />Sačuvaj novu verziju
          </Button>
        </div>
      </div>

      {/* Field List */}
      <div className="space-y-3">
        {fields.length === 0 && (
          <div className="bg-card rounded-lg border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">Nema polja</p>
            <p className="text-sm mt-1">Dodajte polja koristeći dugmad ispod.</p>
          </div>
        )}

        {fields.map((field, index) => (
          <FieldEditor
            key={field.id}
            field={field}
            index={index}
            total={fields.length}
            onUpdate={updateField}
            onRemove={removeField}
            onMove={moveField}
            onDuplicate={duplicateField}
            onAddSubField={addSubField}
            onUpdateSubField={updateSubField}
            onRemoveSubField={removeSubField}
          />
        ))}
      </div>

      {/* Add Field Buttons */}
      <div className="bg-card rounded-lg border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dodaj polje</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(FIELD_TYPE_META) as [TemplateFieldType, { label: string; icon: any }][]).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <Button key={type} variant="outline" size="sm" className="gap-1.5" onClick={() => addField(type)}>
                <Icon className="h-3.5 w-3.5" />{meta.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Save Version Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Sačuvaj kao verziju {currentVersion + 1}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Prethodna verzija (v{currentVersion}) ostaje sačuvana. Nova verzija će biti kreirana sa {fields.length} polja.
            </p>
            <div className="space-y-2">
              <Label>Bilješke o promjenama</Label>
              <Textarea
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="Šta je promijenjeno u ovoj verziji..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Čuvanje...' : 'Sačuvaj verziju'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Historija verzija</DialogTitle></DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {versions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nema sačuvanih verzija.</p>
            ) : (
              versions.map((ver) => (
                <div key={ver.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ver.version === currentVersion ? 'default' : 'outline'}>v{ver.version}</Badge>
                      <span className="text-sm text-muted-foreground">{format(new Date(ver.created_at), 'dd.MM.yyyy HH:mm')}</span>
                    </div>
                    {ver.change_notes && <p className="text-sm mt-1">{ver.change_notes}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{ver.fields.length} polja</p>
                  </div>
                  {ver.version !== currentVersion && (
                    <Button variant="outline" size="sm" onClick={() => loadVersion(ver)}>Učitaj</Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── FIELD EDITOR COMPONENT ────────────────────────────────────

interface FieldEditorProps {
  field: TemplateField;
  index: number;
  total: number;
  onUpdate: (id: string, updates: Partial<TemplateField>) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (field: TemplateField) => void;
  onAddSubField: (parentId: string, type: TemplateFieldType) => void;
  onUpdateSubField: (parentId: string, subId: string, updates: Partial<TemplateField>) => void;
  onRemoveSubField: (parentId: string, subId: string) => void;
}

const FieldEditor = ({
  field, index, total,
  onUpdate, onRemove, onMove, onDuplicate,
  onAddSubField, onUpdateSubField, onRemoveSubField,
}: FieldEditorProps) => {
  const [expanded, setExpanded] = useState(true);
  const meta = FIELD_TYPE_META[field.type];
  const Icon = meta.icon;

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium flex-1 truncate">
          {field.label || <span className="text-muted-foreground italic">Bez naziva</span>}
        </span>
        <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
        {field.required && <Badge variant="secondary" className="text-[10px]">Obavezno</Badge>}
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Labela</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Vidljivi naziv polja"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ime (ID)</Label>
              <Input
                value={field.name}
                onChange={(e) => onUpdate(field.id, { name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                placeholder="ime_polja"
                className="font-mono text-xs"
              />
            </div>
          </div>

          {field.type !== 'checkbox' && field.type !== 'signature' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                placeholder="Tekst koji se prikazuje kad je polje prazno"
              />
            </div>
          )}

          {/* Select options */}
          {field.type === 'select' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Opcije</Label>
              <div className="space-y-1.5">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(field.options || [])];
                        newOpts[i] = e.target.value;
                        onUpdate(field.id, { options: newOpts });
                      }}
                      placeholder={`Opcija ${i + 1}`}
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive flex-shrink-0"
                      onClick={() => {
                        const newOpts = (field.options || []).filter((_, j) => j !== i);
                        onUpdate(field.id, { options: newOpts });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdate(field.id, { options: [...(field.options || []), ''] })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />Dodaj opciju
                </Button>
              </div>
            </div>
          )}

          {/* Repeating section sub-fields */}
          {field.type === 'repeating' && (
            <div className="space-y-2">
              <Label className="text-xs">Polja u sekciji</Label>
              <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                {(field.fields || []).map((sub) => {
                  const subMeta = FIELD_TYPE_META[sub.type];
                  const SubIcon = subMeta.icon;
                  return (
                    <div key={sub.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <SubIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge variant="outline" className="text-[10px]">{subMeta.label}</Badge>
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemoveSubField(field.id, sub.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={sub.label}
                          onChange={(e) => onUpdateSubField(field.id, sub.id, { label: e.target.value })}
                          placeholder="Labela"
                          className="text-sm"
                        />
                        <Input
                          value={sub.name}
                          onChange={(e) => onUpdateSubField(field.id, sub.id, { name: e.target.value.replace(/\s/g, '_').toLowerCase() })}
                          placeholder="ime_polja"
                          className="text-sm font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sub.required}
                          onCheckedChange={(v) => onUpdateSubField(field.id, sub.id, { required: v })}
                        />
                        <Label className="text-xs">Obavezno</Label>
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-1.5">
                  {(['text', 'number', 'date', 'select', 'checkbox'] as TemplateFieldType[]).map((t) => {
                    const m = FIELD_TYPE_META[t];
                    const I = m.icon;
                    return (
                      <Button key={t} variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => onAddSubField(field.id, t)}>
                        <I className="h-3 w-3" />{m.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom row: required + actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Switch checked={field.required} onCheckedChange={(v) => onUpdate(field.id, { required: v })} />
              <Label className="text-xs">Obavezno</Label>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => onMove(index, 'up')} title="Pomjeri gore">
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === total - 1} onClick={() => onMove(index, 'down')} title="Pomjeri dolje">
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(field)} title="Dupliciraj">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemove(field.id)} title="Obriši">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplateEditor;
