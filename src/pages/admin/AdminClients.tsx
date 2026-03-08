import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { clientService } from '@/services/clientService';
import { supabase } from '@/integrations/supabase/client';
import type { ClientInsert } from '@/services/types';
import { format } from 'date-fns';

const emptyForm: ClientInsert = { name: '', phone: '', email: '', address: '', notes: '' };

const AdminClients = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ClientInsert>({ ...emptyForm });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () => clientService.list(debouncedSearch || undefined),
  });

  // Fetch pet counts per client
  const clientIds = clients.map((c) => c.id);
  const { data: petCounts = {} } = useQuery({
    queryKey: ['client-pet-counts', clientIds],
    queryFn: async () => {
      if (clientIds.length === 0) return {};
      const { data, error } = await supabase
        .from('pets' as any)
        .select('owner_id')
        .eq('is_active', true)
        .in('owner_id', clientIds);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[])?.forEach((p: any) => {
        counts[p.owner_id] = (counts[p.owner_id] || 0) + 1;
      });
      return counts;
    },
    enabled: clientIds.length > 0,
  });

  // Fetch last visit dates per client
  const { data: lastVisits = {} } = useQuery({
    queryKey: ['client-last-visits', clientIds],
    queryFn: async () => {
      if (clientIds.length === 0) return {};
      const { data, error } = await supabase
        .from('visits' as any)
        .select('owner_id, date_time')
        .in('owner_id', clientIds)
        .order('date_time', { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      (data as any[])?.forEach((v: any) => {
        if (!map[v.owner_id]) map[v.owner_id] = v.date_time;
      });
      return map;
    },
    enabled: clientIds.length > 0,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: (input: ClientInsert) => clientService.create(input),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Klijent kreiran', description: `${client.name} je dodan.` });
      setDialogOpen(false);
      setForm({ ...emptyForm });
    },
    onError: () => {
      toast({ title: 'Greška', description: 'Nije moguće kreirati klijenta.', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate(form);
  };

  const updateField = (field: keyof ClientInsert, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Klijenti</h1>
          <p className="text-sm text-muted-foreground">
            Upravljajte vlasnicima ljubimaca · {clients.length} klijenata
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novi klijent
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-lg border border-border">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu, emailu, telefonu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) {
                  setSearchParams({ q: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Ljubimci</TableHead>
              <TableHead>Zadnja posjeta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {debouncedSearch ? 'Nema rezultata pretrage.' : 'Nema klijenata. Dodajte prvog klijenta.'}
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/clients/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {client.email}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{petCounts[client.id] || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lastVisits[client.id]
                      ? format(new Date(lastVisits[client.id]), 'dd.MM.yyyy')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novi klijent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ime i prezime *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="npr. Marija Petrović"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={form.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+387 6x xxx xxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="email@primjer.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                value={form.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Ulica i broj, grad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Napomene</Label>
              <Textarea
                id="notes"
                value={form.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Dodatne bilješke..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Otkaži
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Kreiranje...' : 'Kreiraj klijenta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClients;
