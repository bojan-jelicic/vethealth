import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, User, PawPrint, ClipboardList, FileText,
  Phone, Mail, MapPin, Edit, Save, X, Trash2, Download, Loader2,
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
import { toast } from '@/hooks/use-toast';
import { clientService } from '@/services/clientService';
import { petService } from '@/services/petService';
import { visitService } from '@/services/visitService';
import { attachmentService } from '@/services/attachmentService';
import type { ClientUpdate, PetInsert, VisitInsert } from '@/services/types';
import { format } from 'date-fns';
import { exportClientPdf } from '@/services/exportService';

const AdminClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ClientUpdate>({});
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [petForm, setPetForm] = useState<PetInsert>({ owner_id: id!, name: '', species: 'Pas' });
  const [visitForm, setVisitForm] = useState<VisitInsert>({ pet_id: '', owner_id: id! });
  const [exportingPdf, setExportingPdf] = useState(false);

  // Client
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id!),
    enabled: !!id,
  });

  // Pets
  const { data: pets = [] } = useQuery({
    queryKey: ['client-pets', id],
    queryFn: () => petService.list({ ownerId: id }),
    enabled: !!id,
  });

  // Visits
  const { data: visits = [] } = useQuery({
    queryKey: ['client-visits', id],
    queryFn: () => visitService.list({ ownerId: id }),
    enabled: !!id,
  });

  // Attachments
  const { data: attachments = [] } = useQuery({
    queryKey: ['client-attachments', id],
    queryFn: () => attachmentService.listByEntity('client', id!),
    enabled: !!id,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (input: ClientUpdate) => clientService.update(id!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', id] });
      qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Ažurirano', description: 'Podaci klijenta su sačuvani.' });
      setEditing(false);
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientService.remove(id!),
    onSuccess: () => {
      toast({ title: 'Klijent deaktiviran' });
      navigate('/app/clients');
    },
  });

  const createPetMutation = useMutation({
    mutationFn: (input: PetInsert) => petService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-pets', id] });
      toast({ title: 'Ljubimac dodan' });
      setPetDialogOpen(false);
      setPetForm({ owner_id: id!, name: '', species: 'Pas' });
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const createVisitMutation = useMutation({
    mutationFn: (input: VisitInsert) => visitService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-visits', id] });
      toast({ title: 'Posjeta kreirana' });
      setVisitDialogOpen(false);
      setVisitForm({ pet_id: '', owner_id: id! });
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const startEditing = () => {
    if (!client) return;
    setEditForm({ name: client.name, phone: client.phone, email: client.email, address: client.address, notes: client.notes });
    setEditing(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Klijent nije pronađen.</p>
        <Button variant="link" onClick={() => navigate('/app/clients')}>Nazad na listu</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'Zakazana',
    in_progress: 'U toku',
    completed: 'Završena',
    cancelled: 'Otkazana',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{client.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              {client.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{client.phone}</span>}
              {client.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="gap-1.5" onClick={() => setVisitDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nova posjeta
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deaktiviraj klijenta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Klijent {client.name} će biti deaktiviran. Ova akcija se može poništiti.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Otkaži</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>Deaktiviraj</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="osnovno" className="space-y-4">
        <TabsList>
          <TabsTrigger value="osnovno" className="gap-1.5"><User className="h-3.5 w-3.5" />Osnovno</TabsTrigger>
          <TabsTrigger value="ljubimci" className="gap-1.5"><PawPrint className="h-3.5 w-3.5" />Ljubimci ({pets.length})</TabsTrigger>
          <TabsTrigger value="posjete" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Posjete ({visits.length})</TabsTrigger>
          <TabsTrigger value="dokumenti" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Dokumenti ({attachments.length})</TabsTrigger>
        </TabsList>

        {/* OSNOVNO TAB */}
        <TabsContent value="osnovno">
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Osnovni podaci</h2>
              {!editing ? (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={startEditing}>
                  <Edit className="h-3.5 w-3.5" />Uredi
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    <X className="h-3.5 w-3.5 mr-1" />Otkaži
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending}>
                    <Save className="h-3.5 w-3.5" />Sačuvaj
                  </Button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ime i prezime</Label>
                  <Input value={editForm.name || ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={editForm.phone || ''} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editForm.email || ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Adresa</Label>
                  <Input value={editForm.address || ''} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Napomene</Label>
                  <Textarea value={editForm.notes || ''} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={User} label="Ime" value={client.name} />
                <InfoRow icon={Phone} label="Telefon" value={client.phone} />
                <InfoRow icon={Mail} label="Email" value={client.email} />
                <InfoRow icon={MapPin} label="Adresa" value={client.address} />
                {client.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Napomene</p>
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* LJUBIMCI TAB */}
        <TabsContent value="ljubimci">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Ljubimci</h2>
              <Button size="sm" className="gap-1.5" onClick={() => setPetDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Dodaj ljubimca
              </Button>
            </div>
            {pets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <PawPrint className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nema registrovanih ljubimaca.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime</TableHead>
                    <TableHead>Vrsta</TableHead>
                    <TableHead>Rasa</TableHead>
                    <TableHead>Spol</TableHead>
                    <TableHead>Mikročip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pets.map((pet) => (
                    <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/app/pets/${pet.id}`)}>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell className="text-muted-foreground">{pet.breed || '—'}</TableCell>
                      <TableCell>{pet.sex === 'M' ? 'Mužjak' : pet.sex === 'F' ? 'Ženka' : '—'}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{pet.microchip_id || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* POSJETE TAB */}
        <TabsContent value="posjete">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Posjete</h2>
              <Button size="sm" className="gap-1.5" onClick={() => setVisitDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />Nova posjeta
              </Button>
            </div>
            {visits.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nema posjeta za ovog klijenta.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Ljubimac</TableHead>
                    <TableHead>Razlog</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {format(new Date(visit.date_time), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{(visit.pet as any)?.name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{visit.reason || '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[visit.status] || ''}`}>
                          {statusLabels[visit.status] || visit.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* DOKUMENTI TAB */}
        <TabsContent value="dokumenti">
          <div className="bg-card rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Dokumenti</h2>
            </div>
            {attachments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nema dokumenata za ovog klijenta.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv fajla</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Datum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell className="font-medium">
                        <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {att.file_name}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{att.mime_type || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(att.created_at), 'dd.MM.yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Pet Dialog */}
      <Dialog open={petDialogOpen} onOpenChange={setPetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novi ljubimac</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createPetMutation.mutate(petForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Ime *</Label>
              <Input value={petForm.name} onChange={(e) => setPetForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vrsta</Label>
                <Input value={petForm.species || 'Pas'} onChange={(e) => setPetForm((p) => ({ ...p, species: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rasa</Label>
                <Input value={petForm.breed || ''} onChange={(e) => setPetForm((p) => ({ ...p, breed: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPetDialogOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={createPetMutation.isPending}>Dodaj</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Visit Dialog */}
      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova posjeta</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createVisitMutation.mutate(visitForm); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Ljubimac *</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={visitForm.pet_id}
                onChange={(e) => setVisitForm((p) => ({ ...p, pet_id: e.target.value }))}
                required
              >
                <option value="">Odaberi ljubimca</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Razlog</Label>
              <Input value={visitForm.reason || ''} onChange={(e) => setVisitForm((p) => ({ ...p, reason: e.target.value }))} placeholder="npr. Vakcinacija" />
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea value={visitForm.notes || ''} onChange={(e) => setVisitForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVisitDialogOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={createVisitMutation.isPending}>Kreiraj posjetu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-sm flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      {value || '—'}
    </p>
  </div>
);

export default AdminClientDetail;
