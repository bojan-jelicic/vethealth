import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ClipboardList, FileText, Receipt, Package, ImageIcon,
  Plus, Trash2, PawPrint, User, CheckCircle, Lock, Unlock,
  Eye, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { visitService } from '@/services/visitService';
import { attachmentService } from '@/services/attachmentService';
import {
  visitDocumentService, visitBillingService, visitInventoryService,
  type VisitDocument,
} from '@/services/visitDetailServices';
import { CreateDocumentFromTemplate } from '@/components/admin/CreateDocumentFromTemplate';
import { PrintableDocument } from '@/components/admin/PrintableDocument';
import { AttachmentGallery } from '@/components/admin/AttachmentGallery';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabels: Record<string, string> = {
  scheduled: 'Zakazana', in_progress: 'U toku', completed: 'Završena', cancelled: 'Otkazana',
};
const docTypeLabels: Record<string, string> = {
  finding: 'Nalaz', report: 'Izvještaj', prescription: 'Recept', referral: 'Uputnica', other: 'Ostalo',
};

const AdminVisitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({ description: '', quantity: '1', unit_price: '0', discount: '0', note: '' });
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [viewDocOpen, setViewDocOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<VisitDocument | null>(null);
  const [editingFieldValues, setEditingFieldValues] = useState<Record<string, any>>({});
  const [editingContent, setEditingContent] = useState('');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockDocId, setUnlockDocId] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [euthanasiaConfirmOpen, setEuthanasiaConfirmOpen] = useState(false);
  const [euthanasiaConfirmDocId, setEuthanasiaConfirmDocId] = useState<string | null>(null);
  const [euthanasiaConfirmText, setEuthanasiaConfirmText] = useState('');
  // Inventory consumption
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [consumeForm, setConsumeForm] = useState({ item_id: '', quantity: '1', notes: '' });
  const [consumeSearch, setConsumeSearch] = useState('');
  const [showConsumeDropdown, setShowConsumeDropdown] = useState(false);

  // Visit
  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: () => visitService.getById(id!),
    enabled: !!id,
  });

  // Documents
  const { data: documents = [] } = useQuery({
    queryKey: ['visit-documents', id],
    queryFn: () => visitDocumentService.listByVisit(id!),
    enabled: !!id,
  });

  // Billing
  const { data: billingItems = [] } = useQuery({
    queryKey: ['visit-billing', id],
    queryFn: () => visitBillingService.listByVisit(id!),
    enabled: !!id,
  });

  // Inventory
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['visit-inventory', id],
    queryFn: () => visitInventoryService.listByVisit(id!),
    enabled: !!id,
  });

  // Attachments
  const { data: attachments = [] } = useQuery({
    queryKey: ['visit-attachments', id],
    queryFn: () => attachmentService.listByEntity('visit', id!),
    enabled: !!id,
  });

  // Document attachments (for currently viewed doc)
  const { data: docAttachments = [] } = useQuery({
    queryKey: ['doc-attachments', viewingDoc?.id],
    queryFn: () => attachmentService.listByEntity('document', viewingDoc!.id),
    enabled: !!viewingDoc?.id,
  });

  // Services for autocomplete in billing
  const { data: allServices = [] } = useQuery({
    queryKey: ['services-for-billing'],
    queryFn: async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, price, service_categories(name)')
        .eq('is_active', true)
        .order('name');
      return (data ?? []) as { id: string; name: string; price: number | null; service_categories: { name: string } | null }[];
    },
  });

  // All inventory items for consumption picker
  const { data: stockItems = [] } = useQuery({
    queryKey: ['inventory-items-for-visit'],
    queryFn: async () => {
      const { data } = await supabase
        .from('inventory_items' as any)
        .select('*')
        .eq('is_active', true)
        .order('name');
      return (data ?? []) as unknown as { id: string; name: string; unit: string; current_quantity: number; low_stock_threshold: number }[];
    },
  });

  // Billing mutations
  const createBillingMutation = useMutation({
    mutationFn: () => visitBillingService.create({
      visit_id: id!,
      description: billingForm.description,
      quantity: parseFloat(billingForm.quantity) || 1,
      unit_price: parseFloat(billingForm.unit_price) || 0,
      discount: parseFloat(billingForm.discount) || 0,
      note: billingForm.note || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-billing', id] });
      toast({ title: 'Stavka dodana' });
      setBillingDialogOpen(false);
      setBillingForm({ description: '', quantity: '1', unit_price: '0', discount: '0', note: '' });
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  // Consume inventory mutation
  const consumeInventoryMutation = useMutation({
    mutationFn: async () => {
      const selectedItem = stockItems.find((i) => i.id === consumeForm.item_id);
      if (!selectedItem) throw new Error('Item not found');
      const qty = parseFloat(consumeForm.quantity) || 0;
      if (qty <= 0) throw new Error('Invalid qty');

      // Insert visit_inventory record
      const { error: viErr } = await supabase.from('visit_inventory').insert({
        visit_id: id!,
        item_name: selectedItem.name,
        quantity: qty,
        unit: selectedItem.unit,
        notes: consumeForm.notes || null,
      });
      if (viErr) throw viErr;

      // Create OUT stock movement
      const { error: smErr } = await supabase.from('stock_movements' as any).insert({
        item_id: selectedItem.id,
        type: 'OUT',
        quantity: qty,
        note: `Posjeta ${id}`,
        linked_visit_id: id!,
      });
      if (smErr) throw smErr;

      // Decrease current_quantity
      const newQty = Math.max(0, Number(selectedItem.current_quantity) - qty);
      const { error: updErr } = await supabase.from('inventory_items' as any)
        .update({ current_quantity: newQty }).eq('id', selectedItem.id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-inventory', id] });
      qc.invalidateQueries({ queryKey: ['inventory-items-for-visit'] });
      qc.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({ title: 'Materijal evidentiran' });
      setConsumeDialogOpen(false);
      setConsumeForm({ item_id: '', quantity: '1', notes: '' });
      setConsumeSearch('');
    },
    onError: () => toast({ title: 'Greška pri evidenciji materijala', variant: 'destructive' }),
  });

  const deleteBillingMutation = useMutation({
    mutationFn: (itemId: string) => visitBillingService.remove(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visit-billing', id] }),
  });

  // Document mutations
  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => visitDocumentService.remove(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-documents', id] });
      toast({ title: 'Dokument obrisan' });
    },
  });

  const finalizeDocMutation = useMutation({
    mutationFn: (docId: string) => visitDocumentService.finalize(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-documents', id] });
      toast({ title: 'Dokument finaliziran i zaključan' });
      setViewDocOpen(false);
    },
  });

  const unlockDocMutation = useMutation({
    mutationFn: ({ docId, reason }: { docId: string; reason: string }) =>
      visitDocumentService.unlock(docId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-documents', id] });
      toast({ title: 'Dokument otključan' });
      setUnlockDialogOpen(false);
      setUnlockReason('');
    },
  });

  const saveDocMutation = useMutation({
    mutationFn: ({ docId, fieldValues, content }: { docId: string; fieldValues: Record<string, any>; content: string }) =>
      visitDocumentService.update(docId, { field_values: fieldValues, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit-documents', id] });
      toast({ title: 'Draft sačuvan' });
      setIsEditingDoc(false);
    },
  });

  // Visit status
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => visitService.update(id!, { status: status as any }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visit', id] });
      qc.invalidateQueries({ queryKey: ['visits'] });
      toast({ title: 'Status ažuriran' });
    },
  });

  const openViewDoc = (doc: VisitDocument) => {
    setViewingDoc(doc);
    setEditingFieldValues(doc.field_values || {});
    setEditingContent(doc.content || '');
    setIsEditingDoc(false);
    setViewDocOpen(true);
  };

  const isEuthanasiaDoc = (doc: VisitDocument) =>
    doc.title?.toLowerCase().includes('eutanazij');

  const handleFinalize = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc && isEuthanasiaDoc(doc)) {
      setEuthanasiaConfirmDocId(docId);
      setEuthanasiaConfirmText('');
      setEuthanasiaConfirmOpen(true);
    } else {
      finalizeDocMutation.mutate(docId);
    }
  };

  const billingSubtotal = billingItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
  const billingDiscountTotal = billingItems.reduce((sum, item) => {
    const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
    const disc = item.discount || 0;
    return sum + (lineTotal * disc / 100);
  }, 0);
  const billingTotal = billingSubtotal - billingDiscountTotal;

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!visit) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Posjeta nije pronađena.</p>
        <Button variant="link" onClick={() => navigate('/app/visits')}>Nazad na listu</Button>
      </div>
    );
  }

  const isDocLocked = (doc: VisitDocument) => doc.status === 'finalized' && !!doc.locked_at;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/visits')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Posjeta — {format(new Date(visit.date_time), 'dd.MM.yyyy HH:mm')}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <button className="flex items-center gap-1 hover:text-primary" onClick={() => navigate(`/app/pets/${visit.pet_id}`)}>
                <PawPrint className="w-3.5 h-3.5" />{(visit.pet as any)?.name || 'N/A'}
              </button>
              <button className="flex items-center gap-1 hover:text-primary" onClick={() => navigate(`/app/clients/${visit.owner_id}`)}>
                <User className="w-3.5 h-3.5" />{(visit.owner as any)?.name || 'N/A'}
              </button>
            </div>
          </div>
        </div>
        <Select value={visit.status} onValueChange={(v) => updateStatusMutation.mutate(v)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Zakazana</SelectItem>
            <SelectItem value="in_progress">U toku</SelectItem>
            <SelectItem value="completed">Završena</SelectItem>
            <SelectItem value="cancelled">Otkazana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Status">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[visit.status]}`}>
            {statusLabels[visit.status]}
          </span>
        </SummaryCard>
        <SummaryCard label="Razlog"><p className="text-sm font-medium truncate">{visit.reason || '—'}</p></SummaryCard>
        <SummaryCard label="Dokumenti"><p className="text-sm font-medium">{documents.length}</p></SummaryCard>
        <SummaryCard label="Obračun"><p className="text-sm font-medium">{billingTotal.toFixed(2)} KM</p></SummaryCard>
      </div>

      {visit.notes && (
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Napomene</p>
          <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dokumenti" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dokumenti" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Dokumenti ({documents.length})</TabsTrigger>
          <TabsTrigger value="racun" className="gap-1.5"><Receipt className="h-3.5 w-3.5" />Obračun ({billingItems.length})</TabsTrigger>
          <TabsTrigger value="materijal" className="gap-1.5"><Package className="h-3.5 w-3.5" />Materijal ({inventoryItems.length})</TabsTrigger>
          <TabsTrigger value="prilozi" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Prilozi ({attachments.length})</TabsTrigger>
        </TabsList>

        {/* DOCUMENTS TAB */}
        <TabsContent value="dokumenti">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Dokumenti posjete</h2>
              <Button size="sm" className="gap-1.5" onClick={() => setCreateDocOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Novi dokument
              </Button>
            </div>
            {documents.length === 0 ? (
              <EmptyState icon={FileText} text="Nema dokumenata. Kreirajte nalaz ili izvještaj." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naslov</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const locked = isDocLocked(doc);
                    return (
                      <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openViewDoc(doc)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1.5">
                            {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                            {doc.title}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{docTypeLabels[doc.doc_type] || doc.doc_type}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={doc.status === 'finalized' ? 'default' : 'secondary'}>
                            {doc.status === 'finalized' ? 'Finaliziran' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(doc.created_at), 'dd.MM.yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openViewDoc(doc)} title="Otvori">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {doc.status === 'draft' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Finaliziraj">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Finaliziraj dokument?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      "{doc.title}" će biti finaliziran i zaključan. Samo administrator može otključati dokument nakon finalizacije.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Otkaži</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleFinalize(doc.id)}>Finaliziraj</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {locked && isAdmin && (
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-amber-600"
                                onClick={() => { setUnlockDocId(doc.id); setUnlockDialogOpen(true); }}
                                title="Otključaj"
                              >
                                <Unlock className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {!locked && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDocMutation.mutate(doc.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* BILLING TAB — Obračun posjete */}
        <TabsContent value="racun">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold">Obračun posjete</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Interni obračun — nije fiskalni dokument</p>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => setBillingDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Dodaj stavku
              </Button>
            </div>
            {billingItems.length === 0 ? (
              <EmptyState icon={Receipt} text="Nema stavki u obračunu." />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usluga / Opis</TableHead>
                      <TableHead className="text-right w-16">Kol.</TableHead>
                      <TableHead className="text-right w-24">Jed. cijena</TableHead>
                      <TableHead className="text-right w-20">Popust</TableHead>
                      <TableHead className="text-right w-24">Iznos</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingItems.map((item) => {
                      const lineGross = (item.quantity || 0) * (item.unit_price || 0);
                      const disc = item.discount || 0;
                      const lineNet = lineGross - (lineGross * disc / 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.description}</div>
                            {item.note && <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{Number(item.unit_price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {disc > 0 ? <span className="text-primary font-medium">-{disc}%</span> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right font-medium">{lineNet.toFixed(2)} KM</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBillingMutation.mutate(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {/* Summary */}
                <div className="border-t border-border p-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (prije popusta)</span>
                    <span>{billingSubtotal.toFixed(2)} KM</span>
                  </div>
                  {billingDiscountTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ukupan popust</span>
                      <span className="text-primary">-{billingDiscountTotal.toFixed(2)} KM</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1.5 border-t border-border">
                    <span>UKUPNO</span>
                    <span>{billingTotal.toFixed(2)} KM</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* INVENTORY TAB */}
        <TabsContent value="materijal">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Utrošeni materijal</h2>
            </div>
            {inventoryItems.length === 0 ? (
              <EmptyState icon={Package} text="Nema evidentiranog utroška materijala." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikal</TableHead>
                    <TableHead className="text-right">Količina</TableHead>
                    <TableHead>Jedinica</TableHead>
                    <TableHead>Napomena</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell className="text-muted-foreground">{item.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ATTACHMENTS TAB */}
        <TabsContent value="prilozi">
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="font-semibold mb-4">Slike i prilozi posjete</h2>
            <AttachmentGallery
              entityType="visit"
              entityId={id!}
              attachments={attachments}
              maxSizeMb={10}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Document from Template */}
      <CreateDocumentFromTemplate
        visitId={id!}
        open={createDocOpen}
        onOpenChange={setCreateDocOpen}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['visit-documents', id] });
          toast({ title: 'Dokument kreiran kao Draft' });
        }}
      />

      {/* View/Edit Document Dialog */}
      <Dialog open={viewDocOpen} onOpenChange={setViewDocOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewingDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isDocLocked(viewingDoc) && <Lock className="h-4 w-4 text-muted-foreground" />}
                  {viewingDoc.title}
                  <Badge variant={viewingDoc.status === 'finalized' ? 'default' : 'secondary'} className="ml-1">
                    {viewingDoc.status === 'finalized' ? 'Finaliziran' : 'Draft'}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              {isDocLocked(viewingDoc) && (
                <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Dokument je zaključan {viewingDoc.locked_at && format(new Date(viewingDoc.locked_at), 'dd.MM.yyyy HH:mm')}.
                    {viewingDoc.unlock_reason && <span className="block text-xs mt-0.5">Prethodno otključanje: {viewingDoc.unlock_reason}</span>}
                  </span>
                </div>
              )}

              {/* Field values display/edit */}
              {viewingDoc.field_values && Object.keys(viewingDoc.field_values).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Polja</p>
                  {Object.entries(isEditingDoc ? editingFieldValues : viewingDoc.field_values).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground mb-0.5">{key}</p>
                      {isEditingDoc ? (
                        typeof value === 'boolean' ? (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!editingFieldValues[key]}
                              onChange={(e) => setEditingFieldValues((p) => ({ ...p, [key]: e.target.checked }))}
                            />
                            {key}
                          </label>
                        ) : Array.isArray(value) ? (
                          <pre className="text-sm bg-muted/30 rounded p-2 text-xs">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                          <Input
                            value={editingFieldValues[key] || ''}
                            onChange={(e) => setEditingFieldValues((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        )
                      ) : (
                        <p className="text-sm">
                          {typeof value === 'boolean' ? (value ? '✓ Da' : '✗ Ne') :
                           Array.isArray(value) ? `${value.length} stavki` :
                           (value || '—')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              {(viewingDoc.content || isEditingDoc) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sadržaj</p>
                  {isEditingDoc ? (
                    <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={6} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{viewingDoc.content || '—'}</p>
                  )}
                </div>
              )}

              {/* Document attachments */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />Slike dokumenta
                </p>
                <AttachmentGallery
                  entityType="document"
                  entityId={viewingDoc.id}
                  attachments={docAttachments}
                  maxSizeMb={10}
                  readOnly={isDocLocked(viewingDoc)}
                />
              </div>

              <DialogFooter className="mt-4">
                <PrintableDocument
                  doc={viewingDoc}
                  petName={(visit?.pet as any)?.name}
                  ownerName={(visit?.owner as any)?.name}
                  onPdfGenerated={() => qc.invalidateQueries({ queryKey: ['visit-documents', id] })}
                />
                <div className="flex-1" />
                {/* Draft document actions */}
                {viewingDoc.status === 'draft' && !isEditingDoc && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingDoc(true)}>Uredi</Button>
                    <Button size="sm" className="gap-1.5" onClick={() => handleFinalize(viewingDoc.id)}>
                      <CheckCircle className="h-3.5 w-3.5" />Finaliziraj
                    </Button>
                  </>
                )}
                {viewingDoc.status === 'draft' && isEditingDoc && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDoc(false)}>Otkaži</Button>
                    <Button size="sm" onClick={() => saveDocMutation.mutate({
                      docId: viewingDoc.id,
                      fieldValues: editingFieldValues,
                      content: editingContent,
                    })} disabled={saveDocMutation.isPending}>
                      Sačuvaj Draft
                    </Button>
                  </>
                )}
                {/* Locked doc — admin unlock */}
                {isDocLocked(viewingDoc) && isAdmin && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-amber-600" onClick={() => {
                    setUnlockDocId(viewingDoc.id);
                    setUnlockDialogOpen(true);
                  }}>
                    <Unlock className="h-3.5 w-3.5" />Otključaj
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Unlock Reason Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Otključaj dokument</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ovaj dokument je finaliziran i zaključan. Unesite razlog otključavanja koji će biti zabilježen u audit logu.
            </p>
            <div className="space-y-2">
              <Label>Razlog otključavanja *</Label>
              <Textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="npr. Ispravka greške u nalazu..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUnlockDialogOpen(false); setUnlockReason(''); }}>Otkaži</Button>
            <Button
              disabled={!unlockReason.trim() || unlockDocMutation.isPending}
              onClick={() => unlockDocId && unlockDocMutation.mutate({ docId: unlockDocId, reason: unlockReason })}
            >
              {unlockDocMutation.isPending ? 'Otključavanje...' : 'Otključaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Billing Item Dialog */}
      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nova stavka obračuna</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createBillingMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2 relative">
              <Label>Naziv usluge / Opis *</Label>
              <Input
                value={billingForm.description}
                onChange={(e) => {
                  setBillingForm((p) => ({ ...p, description: e.target.value }));
                  setShowServiceSuggestions(e.target.value.length >= 2);
                }}
                onFocus={() => { if (billingForm.description.length >= 2) setShowServiceSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                placeholder="Počnite kucati naziv usluge..."
                required
                autoComplete="off"
              />
              {/* Autocomplete dropdown */}
              {showServiceSuggestions && (() => {
                const q = billingForm.description.toLowerCase();
                const matches = allServices.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
                if (matches.length === 0) return null;
                return (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {matches.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setBillingForm((p) => ({
                            ...p,
                            description: svc.name,
                            unit_price: svc.price != null ? String(svc.price) : p.unit_price,
                          }));
                          setShowServiceSuggestions(false);
                        }}
                      >
                        <div className="min-w-0">
                          <span className="font-medium">{svc.name}</span>
                          {svc.service_categories?.name && (
                            <span className="text-xs text-muted-foreground ml-1.5">· {svc.service_categories.name}</span>
                          )}
                        </div>
                        {svc.price != null && (
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{Number(svc.price).toFixed(2)} KM</span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Količina</Label>
                <Input type="number" step="0.01" min="0" value={billingForm.quantity} onChange={(e) => setBillingForm((p) => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Jed. cijena (KM)</Label>
                <Input type="number" step="0.01" min="0" value={billingForm.unit_price} onChange={(e) => setBillingForm((p) => ({ ...p, unit_price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Popust (%)</Label>
                <Input type="number" step="1" min="0" max="100" value={billingForm.discount} onChange={(e) => setBillingForm((p) => ({ ...p, discount: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Napomena <span className="text-muted-foreground font-normal">(opcionalno)</span></Label>
              <Input value={billingForm.note} onChange={(e) => setBillingForm((p) => ({ ...p, note: e.target.value }))} placeholder="npr. Hitna intervencija" />
            </div>
            {/* Live total preview */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              {(() => {
                const qty = parseFloat(billingForm.quantity) || 0;
                const price = parseFloat(billingForm.unit_price) || 0;
                const disc = parseFloat(billingForm.discount) || 0;
                const gross = qty * price;
                const discAmt = gross * disc / 100;
                const net = gross - discAmt;
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bruto</span>
                      <span>{gross.toFixed(2)} KM</span>
                    </div>
                    {disc > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Popust ({disc}%)</span>
                        <span className="text-primary">-{discAmt.toFixed(2)} KM</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
                      <span>Iznos</span>
                      <span>{net.toFixed(2)} KM</span>
                    </div>
                  </>
                );
              })()}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBillingDialogOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={createBillingMutation.isPending || !billingForm.description.trim()}>
                {createBillingMutation.isPending ? 'Dodavanje...' : 'Dodaj stavku'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Euthanasia Finalize Confirmation */}
      <Dialog open={euthanasiaConfirmOpen} onOpenChange={setEuthanasiaConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Finalizacija saglasnosti za eutanaziju
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-destructive">⚠ Upozorenje</p>
              <p className="text-foreground">
                Ovaj dokument je saglasnost za eutanaziju. Finalizacijom potvrđujete da je vlasnik
                dao pisanu saglasnost i da su svi podaci tačni. Dokument će biti zaključan i
                zabilježen u audit logu.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Upišite <span className="font-bold">POTVRĐUJEM</span> za nastavak</Label>
              <Input
                value={euthanasiaConfirmText}
                onChange={(e) => setEuthanasiaConfirmText(e.target.value)}
                placeholder="POTVRĐUJEM"
                className="border-destructive/50 focus-visible:ring-destructive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEuthanasiaConfirmOpen(false); setEuthanasiaConfirmText(''); }}>
              Otkaži
            </Button>
            <Button
              variant="destructive"
              disabled={euthanasiaConfirmText !== 'POTVRĐUJEM' || finalizeDocMutation.isPending}
              onClick={() => {
                if (euthanasiaConfirmDocId) {
                  finalizeDocMutation.mutate(euthanasiaConfirmDocId);
                  setEuthanasiaConfirmOpen(false);
                  setEuthanasiaConfirmText('');
                }
              }}
            >
              {finalizeDocMutation.isPending ? 'Finalizacija...' : 'Finaliziraj dokument'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SummaryCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-lg border border-border p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);

const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="py-12 text-center text-muted-foreground">
    <Icon className="w-8 h-8 mx-auto mb-2 opacity-40" />
    {text}
  </div>
);

export default AdminVisitDetail;
