import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Plus, Search, Trash2, CheckCircle, Clock, PawPrint,
  Syringe, Stethoscope, Edit2, CalendarIcon, AlertTriangle, Mail, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { format, addDays, isPast, isToday, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

const TABLE = 'reminders' as any;

const typeLabels: Record<string, string> = {
  vaccine_due: 'Vakcinacija',
  follow_up: 'Kontrola',
  custom: 'Prilagođeno',
};
const typeIcons: Record<string, React.ElementType> = {
  vaccine_due: Syringe,
  follow_up: Stethoscope,
  custom: Bell,
};
const statusLabels: Record<string, string> = {
  open: 'Otvoreno',
  snoozed: 'Odgođeno',
  done: 'Završeno',
};
const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  snoozed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

interface Reminder {
  id: string;
  reminder_type: 'vaccine_due' | 'follow_up' | 'custom';
  title: string;
  description: string | null;
  pet_id: string | null;
  visit_id: string | null;
  due_date: string;
  status: 'open' | 'snoozed' | 'done';
  snoozed_until: string | null;
  channel_in_app: boolean;
  channel_email: boolean;
  created_at: string;
  pets?: { name: string; owner_id: string; clients?: { name: string } | null } | null;
}

interface ReminderForm {
  reminder_type: 'vaccine_due' | 'follow_up' | 'custom';
  title: string;
  description: string;
  pet_id: string;
  due_date: Date | undefined;
  channel_in_app: boolean;
  channel_email: boolean;
}

const emptyForm: ReminderForm = {
  reminder_type: 'custom',
  title: '',
  description: '',
  pet_id: '',
  due_date: undefined,
  channel_in_app: true,
  channel_email: false,
};

const AdminReminders = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<ReminderForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Queries
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*, pets(name, owner_id, clients:owner_id(name))')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Reminder[];
    },
  });

  const { data: pets = [] } = useQuery({
    queryKey: ['pets-for-reminders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pets')
        .select('id, name, owner_id, clients:owner_id(name)')
        .eq('is_active', true)
        .order('name');
      return (data ?? []) as { id: string; name: string; owner_id: string; clients: { name: string } | null }[];
    },
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        reminder_type: form.reminder_type,
        title: form.title,
        description: form.description || null,
        pet_id: form.pet_id || null,
        due_date: form.due_date ? format(form.due_date, 'yyyy-MM-dd') : null,
        channel_in_app: form.channel_in_app,
        channel_email: form.channel_email,
      };
      if (editingReminder) {
        const { error } = await supabase.from(TABLE).update(payload).eq('id', editingReminder.id);
        if (error) throw error;
      } else {
        payload.status = 'open';
        const { error } = await supabase.from(TABLE).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: editingReminder ? 'Podsjetnik ažuriran' : 'Podsjetnik kreiran' });
      closeDialog();
    },
    onError: () => toast({ title: 'Greška', variant: 'destructive' }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, snoozed_until }: { id: string; status: string; snoozed_until?: string }) => {
      const update: any = { status };
      if (snoozed_until) update.snoozed_until = snoozed_until;
      if (status !== 'snoozed') update.snoozed_until = null;
      const { error } = await supabase.from(TABLE).update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Status ažuriran' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Podsjetnik obrisan' });
      setDeleteConfirm(null);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (reminder: Reminder) => {
      // Get owner email from pet's owner
      let recipientEmail = '';
      let recipientName = '';
      if (reminder.pet_id && reminder.pets) {
        const ownerId = (reminder.pets as any).owner_id;
        if (ownerId) {
          const { data: client } = await supabase
            .from('clients')
            .select('name, email')
            .eq('id', ownerId)
            .single();
          if (client) {
            recipientEmail = client.email || '';
            recipientName = client.name || '';
          }
        }
      }
      if (!recipientEmail) {
        throw new Error('Vlasnik nema email adresu.');
      }
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          reminder_id: reminder.id,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          pet_name: reminder.pets?.name || undefined,
          reminder_title: reminder.title,
          reminder_type: reminder.reminder_type,
          due_date: format(new Date(reminder.due_date), 'dd.MM.yyyy'),
          description: reminder.description || undefined,
          is_test: false,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Email poslan uspješno!' });
      setSendingEmailId(null);
    },
    onError: (err: any) => {
      toast({ title: err?.message || 'Greška pri slanju emaila', variant: 'destructive' });
      setSendingEmailId(null);
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingReminder(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingReminder(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingReminder(r);
    setForm({
      reminder_type: r.reminder_type,
      title: r.title,
      description: r.description || '',
      pet_id: r.pet_id || '',
      due_date: r.due_date ? new Date(r.due_date) : undefined,
      channel_in_app: r.channel_in_app,
      channel_email: r.channel_email,
    });
    setDialogOpen(true);
  };

  // Filtering
  const filtered = reminders.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.reminder_type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !(r.pets?.name || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const today = new Date();
  const overdueCount = reminders.filter((r) => r.status === 'open' && isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date))).length;
  const todayCount = reminders.filter((r) => r.status === 'open' && isToday(new Date(r.due_date))).length;
  const next7 = reminders.filter((r) => r.status === 'open' && !isPast(new Date(r.due_date)) && isBefore(new Date(r.due_date), addDays(today, 8))).length;
  const next30 = reminders.filter((r) => r.status === 'open' && !isPast(new Date(r.due_date)) && isBefore(new Date(r.due_date), addDays(today, 31))).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Podsjetnici</h1>
          <p className="text-sm text-muted-foreground">Upravljanje podsjetnicima za vakcinacije, kontrole i prilagođene obavijesti</p>
        </div>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />Novi podsjetnik
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Zakašnjeli</p>
          <p className={`text-2xl font-bold flex items-center gap-2 ${overdueCount > 0 ? 'text-destructive' : ''}`}>
            {overdueCount}
            {overdueCount > 0 && <AlertTriangle className="h-5 w-5" />}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Danas</p>
          <p className="text-2xl font-bold">{todayCount}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Narednih 7 dana</p>
          <p className="text-2xl font-bold">{next7}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Narednih 30 dana</p>
          <p className="text-2xl font-bold">{next30}</p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pretraži..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tip" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              <SelectItem value="vaccine_due">Vakcinacija</SelectItem>
              <SelectItem value="follow_up">Kontrola</SelectItem>
              <SelectItem value="custom">Prilagođeno</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="open">Otvoreno</SelectItem>
              <SelectItem value="snoozed">Odgođeno</SelectItem>
              <SelectItem value="done">Završeno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{isLoading ? 'Učitavanje...' : 'Nema podsjetnika za prikazati.'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip</TableHead>
                <TableHead>Naslov</TableHead>
                <TableHead>Ljubimac</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Kanali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const TypeIcon = typeIcons[r.reminder_type] || Bell;
                const dueDate = new Date(r.due_date);
                const overdue = r.status === 'open' && isPast(dueDate) && !isToday(dueDate);
                const dueToday = r.status === 'open' && isToday(dueDate);
                return (
                  <TableRow key={r.id} className={overdue ? 'bg-destructive/5' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{typeLabels[r.reminder_type]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.title}</div>
                      {r.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{r.description}</p>}
                    </TableCell>
                    <TableCell>
                      {r.pets ? (
                        <button
                          className="flex items-center gap-1 text-sm hover:text-primary"
                          onClick={() => navigate(`/app/pets/${r.pet_id}`)}
                        >
                          <PawPrint className="h-3.5 w-3.5" />
                          {r.pets.name}
                          {r.pets.clients && <span className="text-muted-foreground ml-1">({(r.pets.clients as any)?.name})</span>}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-sm font-medium',
                        overdue && 'text-destructive',
                        dueToday && 'text-primary font-semibold',
                      )}>
                        {format(dueDate, 'dd.MM.yyyy')}
                        {overdue && ' ⚠'}
                        {dueToday && ' (danas)'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.channel_in_app && <Badge variant="outline" className="text-xs">App</Badge>}
                        {r.channel_email && <Badge variant="outline" className="text-xs">Email</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {statusLabels[r.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === 'open' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Označi završeno"
                            onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'done' })}>
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                        )}
                        {r.status === 'open' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Odgodi 7 dana"
                            onClick={() => updateStatusMutation.mutate({
                              id: r.id,
                              status: 'snoozed',
                              snoozed_until: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                            })}>
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          </Button>
                        )}
                        {r.status === 'snoozed' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Vrati na otvoreno"
                            onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'open' })}>
                            <Bell className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                        )}
                        {r.status === 'done' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Ponovo otvori"
                            onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'open' })}>
                            <Bell className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                        )}
                        {r.channel_email && r.status !== 'done' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Pošalji email sada"
                            disabled={sendingEmailId === r.id}
                            onClick={() => {
                              setSendingEmailId(r.id);
                              sendEmailMutation.mutate(r);
                            }}>
                            {sendingEmailId === r.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Mail className="h-3.5 w-3.5 text-primary" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Uredi"
                          onClick={() => openEdit(r)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Obriši"
                          onClick={() => setDeleteConfirm(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Uredi podsjetnik' : 'Novi podsjetnik'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tip *</Label>
                <Select value={form.reminder_type} onValueChange={(v: any) => setForm((p) => ({ ...p, reminder_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccine_due">Vakcinacija</SelectItem>
                    <SelectItem value="follow_up">Kontrola</SelectItem>
                    <SelectItem value="custom">Prilagođeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.due_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.due_date ? format(form.due_date, 'dd.MM.yyyy') : 'Odaberite datum'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.due_date}
                      onSelect={(d) => setForm((p) => ({ ...p, due_date: d }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Naslov *</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="npr. Revakcinacija bjesnoća" />
            </div>
            <div className="space-y-2">
              <Label>Opis <span className="text-muted-foreground font-normal">(opcionalno)</span></Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Dodatne napomene..." />
            </div>
            <div className="space-y-2">
              <Label>Ljubimac</Label>
              <Select value={form.pet_id || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, pet_id: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Odaberite ljubimca" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Bez ljubimca —</SelectItem>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name} {pet.clients ? `(${pet.clients.name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={form.channel_in_app} onCheckedChange={(v) => setForm((p) => ({ ...p, channel_in_app: v }))} />
                In-App
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={form.channel_email} onCheckedChange={(v) => setForm((p) => ({ ...p, channel_email: v }))} />
                Email
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Otkaži</Button>
              <Button type="submit" disabled={saveMutation.isPending || !form.title.trim() || !form.due_date}>
                {saveMutation.isPending ? 'Čuvanje...' : editingReminder ? 'Sačuvaj' : 'Kreiraj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati podsjetnik?</AlertDialogTitle>
            <AlertDialogDescription>Ova akcija se ne može poništiti.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>Obriši</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReminders;
