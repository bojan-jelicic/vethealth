import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Plus, Trash2, Edit, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { templateService } from '@/services/templateService';
import { format } from 'date-fns';

const AdminTemplates = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['document-templates'],
    queryFn: () => templateService.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => templateService.create(form),
    onSuccess: (tmpl) => {
      qc.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Template kreiran' });
      setCreateOpen(false);
      setForm({ name: '', description: '' });
      navigate(`/app/documents/templates/${tmpl.id}`);
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      templateService.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['document-templates'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-templates'] });
      toast({ title: 'Template obrisan' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Šabloni dokumenata</h1>
          <p className="text-sm text-muted-foreground">
            Kreirajte i upravljajte šablonima za nalaze, izvještaje i recepte
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />Novi šablon
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead className="text-center">Verzija</TableHead>
              <TableHead className="text-center">Polja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Izmijenjeno</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Nema šablona. Kreirajte prvi šablon.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/documents/templates/${t.id}`)}
                >
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">v{t.latest_version?.version || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {t.latest_version?.fields?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.is_active ? 'default' : 'secondary'}>
                      {t.is_active ? 'Aktivan' : 'Neaktivan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(t.updated_at), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleMutation.mutate({ id: t.id, is_active: !t.is_active })}
                        title={t.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                      >
                        {t.is_active ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Obriši šablon?</AlertDialogTitle>
                            <AlertDialogDescription>Ovo će trajno obrisati šablon "{t.name}" i sve njegove verzije.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Otkaži</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(t.id)}>Obriši</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novi šablon</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Naziv *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="npr. Nalaz pregleda" required />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Kratki opis šablona" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={createMutation.isPending}>Kreiraj</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemplates;
