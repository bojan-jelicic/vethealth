import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, PawPrint, AlertTriangle, Syringe, ClipboardList,
  FileText, Upload, Trash2, CreditCard, Image as ImageIcon,
  Edit, Save, X, Weight, Calendar,
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { petService } from '@/services/petService';
import { visitService } from '@/services/visitService';
import { attachmentService } from '@/services/attachmentService';
import { supabase } from '@/integrations/supabase/client';
import type { PetUpdate } from '@/services/types';
import { format } from 'date-fns';

const AdminPetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<PetUpdate>({});
  const [uploading, setUploading] = useState(false);

  // Pet
  const { data: pet, isLoading } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petService.getById(id!),
    enabled: !!id,
  });

  // Visits for this pet
  const { data: visits = [] } = useQuery({
    queryKey: ['pet-visits', id],
    queryFn: () => visitService.list({ petId: id }),
    enabled: !!id,
  });

  // Attachments
  const { data: attachments = [] } = useQuery({
    queryKey: ['pet-attachments', id],
    queryFn: () => attachmentService.listByEntity('pet', id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (input: PetUpdate) => petService.update(id!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pet', id] });
      toast({ title: 'Ažurirano', description: 'Podaci ljubimca su sačuvani.' });
      setEditing(false);
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => petService.remove(id!),
    onSuccess: () => {
      toast({ title: 'Ljubimac deaktiviran' });
      navigate('/app/pets');
    },
  });

  // Delete attachment
  const deleteAttMutation = useMutation({
    mutationFn: (attId: string) => attachmentService.remove(attId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pet-attachments', id] });
      toast({ title: 'Fajl obrisan' });
    },
  });

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !id) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-attachments')
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-attachments')
          .getPublicUrl(path);

        await attachmentService.create({
          entity_type: 'pet',
          entity_id: id,
          file_name: file.name,
          file_url: publicUrl,
          mime_type: file.type,
        });
      }
      qc.invalidateQueries({ queryKey: ['pet-attachments', id] });
      toast({ title: 'Upload završen', description: `${files.length} fajl(ova) uploadovano.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Greška pri uploadu', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startEditing = () => {
    if (!pet) return;
    setEditForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      birth_date: pet.birth_date,
      weight: pet.weight,
      microchip_id: pet.microchip_id,
      passport_no: pet.passport_no,
      allergies: pet.allergies,
      chronic_conditions: pet.chronic_conditions,
    });
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

  if (!pet) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Ljubimac nije pronađen.</p>
        <Button variant="link" onClick={() => navigate('/app/pets')}>Nazad na listu</Button>
      </div>
    );
  }

  const hasAlerts = pet.allergies || pet.chronic_conditions;
  const imageAttachments = attachments.filter((a) => a.mime_type?.startsWith('image/'));
  const otherAttachments = attachments.filter((a) => !a.mime_type?.startsWith('image/'));

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const statusLabels: Record<string, string> = {
    scheduled: 'Zakazana', in_progress: 'U toku', completed: 'Završena', cancelled: 'Otkazana',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/pets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-foreground">{pet.name}</h1>
              <Badge variant="secondary">{pet.species}</Badge>
              {pet.breed && <span className="text-sm text-muted-foreground">· {pet.breed}</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vlasnik: <button className="text-primary hover:underline" onClick={() => navigate(`/app/clients/${pet.owner_id}`)}>{(pet.owner as any)?.name || 'N/A'}</button>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deaktiviraj ljubimca?</AlertDialogTitle>
                <AlertDialogDescription>
                  {pet.name} će biti deaktiviran iz evidencije.
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

      {/* Alerts Banner */}
      {hasAlerts && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {pet.allergies && (
              <p className="text-sm"><span className="font-medium text-destructive">Alergije:</span> {pet.allergies}</p>
            )}
            {pet.chronic_conditions && (
              <p className="text-sm"><span className="font-medium text-destructive">Hronična stanja:</span> {pet.chronic_conditions}</p>
            )}
          </div>
        </div>
      )}

      {/* Profile Card + Identifiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile */}
        <div className="bg-card rounded-lg border border-border p-5 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Profil</h2>
            {!editing ? (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={startEditing}>
                <Edit className="h-3.5 w-3.5" />Uredi
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5 mr-1" />Otkaži</Button>
                <Button size="sm" className="gap-1.5" onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending}>
                  <Save className="h-3.5 w-3.5" />Sačuvaj
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ime</Label>
                <Input value={editForm.name || ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Vrsta</Label>
                <Input value={editForm.species || ''} onChange={(e) => setEditForm((p) => ({ ...p, species: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Rasa</Label>
                <Input value={editForm.breed || ''} onChange={(e) => setEditForm((p) => ({ ...p, breed: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Spol</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.sex || ''} onChange={(e) => setEditForm((p) => ({ ...p, sex: e.target.value as any }))}>
                  <option value="">—</option>
                  <option value="M">Mužjak</option>
                  <option value="F">Ženka</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Datum rođenja</Label>
                <Input type="date" value={editForm.birth_date || ''} onChange={(e) => setEditForm((p) => ({ ...p, birth_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Težina (kg)</Label>
                <Input type="number" step="0.1" value={editForm.weight ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, weight: e.target.value ? parseFloat(e.target.value) : null }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Mikročip ID</Label>
                <Input value={editForm.microchip_id || ''} onChange={(e) => setEditForm((p) => ({ ...p, microchip_id: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Pasoš br.</Label>
                <Input value={editForm.passport_no || ''} onChange={(e) => setEditForm((p) => ({ ...p, passport_no: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Alergije</Label>
                <Textarea value={editForm.allergies || ''} onChange={(e) => setEditForm((p) => ({ ...p, allergies: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Hronična stanja</Label>
                <Textarea value={editForm.chronic_conditions || ''} onChange={(e) => setEditForm((p) => ({ ...p, chronic_conditions: e.target.value }))} rows={2} />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Vrsta" value={pet.species} />
              <InfoItem label="Rasa" value={pet.breed} />
              <InfoItem label="Spol" value={pet.sex === 'M' ? 'Mužjak' : pet.sex === 'F' ? 'Ženka' : null} />
              <InfoItem label="Datum rođenja" value={pet.birth_date ? format(new Date(pet.birth_date), 'dd.MM.yyyy') : null} icon={Calendar} />
              <InfoItem label="Težina" value={pet.weight ? `${pet.weight} kg` : null} icon={Weight} />
            </div>
          )}
        </div>

        {/* Identifiers Card */}
        <div className="bg-card rounded-lg border border-border p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" />Identifikatori</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Mikročip ID</p>
              <p className="text-sm font-mono">{pet.microchip_id || <span className="text-muted-foreground italic">Nije uneseno</span>}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pasoš br.</p>
              <p className="text-sm font-mono">{pet.passport_no || <span className="text-muted-foreground italic">Nije uneseno</span>}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="font-medium text-sm flex items-center gap-1.5 mb-2"><Syringe className="h-3.5 w-3.5 text-muted-foreground" />Vakcinacije</h3>
            <p className="text-xs text-muted-foreground italic">Vakcinacijski modul u pripremi.</p>
          </div>
        </div>
      </div>

      {/* Tabs: Visits + Attachments */}
      <Tabs defaultValue="posjete" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posjete" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Posjete ({visits.length})</TabsTrigger>
          <TabsTrigger value="dokumenti" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Galerija i dokumenti ({attachments.length})</TabsTrigger>
        </TabsList>

        {/* VISITS */}
        <TabsContent value="posjete">
          <div className="bg-card rounded-lg border border-border">
            {visits.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nema posjeta za ovog ljubimca.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Razlog</TableHead>
                    <TableHead>Napomene</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium whitespace-nowrap">{format(new Date(v.date_time), 'dd.MM.yyyy HH:mm')}</TableCell>
                      <TableCell>{v.reason || '—'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[250px] truncate">{v.notes || '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status] || ''}`}>
                          {statusLabels[v.status] || v.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* ATTACHMENTS / GALLERY */}
        <TabsContent value="dokumenti">
          <div className="bg-card rounded-lg border border-border p-5 space-y-5">
            {/* Upload */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Fajlovi i slike</h2>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Upload...' : 'Upload fajla'}
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            {imageAttachments.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Slike</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imageAttachments.map((att) => (
                    <div key={att.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteAttMutation.mutate(att.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-[11px] truncate">{att.file_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other files */}
            {otherAttachments.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Dokumenti</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherAttachments.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell>
                          <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            {att.file_name}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{att.mime_type || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(att.created_at), 'dd.MM.yyyy')}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAttMutation.mutate(att.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {attachments.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nema uploadovanih fajlova. Klikni "Upload fajla" za dodavanje.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: any }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      {value || <span className="text-muted-foreground">—</span>}
    </p>
  </div>
);

export default AdminPetDetail;
