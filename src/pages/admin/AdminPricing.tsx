import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, DollarSign } from 'lucide-react';

interface ServiceForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  category_id: string;
  is_active: boolean;
}

const initialForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  duration_minutes: '30',
  category_id: '',
  is_active: true,
};

const AdminPricing = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-pricing-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, service_categories(name)')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-pricing-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pricing-services'] });
    queryClient.invalidateQueries({ queryKey: ['services-with-categories'] });
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const { error } = await supabase.from('services').insert({
        name: data.name,
        description: data.description || null,
        price: data.price ? parseFloat(data.price) : null,
        duration_minutes: parseInt(data.duration_minutes) || 30,
        category_id: data.category_id || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Stavka kreirana' });
      handleClose();
    },
    onError: (e: any) => {
      toast({ title: 'Greška pri kreiranju', description: e?.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const { error } = await supabase
        .from('services')
        .update({
          name: data.name,
          description: data.description || null,
          price: data.price ? parseFloat(data.price) : null,
          duration_minutes: parseInt(data.duration_minutes) || 30,
          category_id: data.category_id || null,
          is_active: data.is_active,
        })
        .eq('id', data.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Stavka ažurirana' });
      handleClose();
    },
    onError: (e: any) => {
      toast({ title: 'Greška pri ažuriranju', description: e?.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Stavka obrisana' });
      setDeleteId(null);
    },
    onError: (e: any) => {
      toast({ title: 'Greška pri brisanju', description: e?.message, variant: 'destructive' });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleNew = () => {
    setForm(initialForm);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEdit = (service: any) => {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price?.toString() || '',
      duration_minutes: service.duration_minutes.toString(),
      category_id: service.category_id || '',
      is_active: service.is_active,
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Unesite naziv stavke', variant: 'destructive' });
      return;
    }
    if (isEditing) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

  const filtered = useMemo(() => {
    if (!services) return [];
    const q = search.trim().toLowerCase();
    return services.filter((s: any) => {
      if (categoryFilter === 'none' && s.category_id) return false;
      if (categoryFilter !== 'all' && categoryFilter !== 'none' && s.category_id !== categoryFilter) return false;
      if (statusFilter === 'active' && !s.is_active) return false;
      if (statusFilter === 'inactive' && s.is_active) return false;
      if (!q) return true;
      const cat = (s.service_categories as any)?.name || '';
      return (
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      );
    });
  }, [services, search, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Cjenovnik</h1>
          <p className="text-sm text-muted-foreground">
            Upravljanje cijenama i uslugama prikazanim na javnom cjenovniku
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova stavka
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po nazivu..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Kategorija" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sve kategorije</SelectItem>
              <SelectItem value="none">Bez kategorije</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="active">Aktivne</SelectItem>
              <SelectItem value="inactive">Neaktivne</SelectItem>
            </SelectContent>
          </Select>
          {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              Poništi filtere
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{search ? 'Nema rezultata pretrage' : 'Nema stavki u cjenovniku'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv usluge</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead>Cijena</TableHead>
                <TableHead>Trajanje</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(item.service_categories as any)?.name || '—'}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {item.price ? `${Number(item.price).toFixed(2)} KM` : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.duration_minutes} min
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'secondary' : 'outline'}>
                      {item.is_active ? 'Aktivna' : 'Neaktivna'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={(o) => (o ? setIsOpen(true) : handleClose())}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Uredi stavku' : 'Nova stavka cjenovnika'}</SheetTitle>
            <SheetDescription>
              Podaci se sinhronizuju sa javnim cjenovnikom u realnom vremenu.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Opšti pregled"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Kratak opis usluge..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cijena (KM)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Trajanje (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorija</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) => setForm({ ...form, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="active" className="cursor-pointer">Aktivna stavka</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vidljiva na javnom cjenovniku
                </p>
              </div>
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>

            <SheetFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Otkaži
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Sačuvaj izmjene' : 'Kreiraj stavku'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati stavku?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja je nepovratna. Stavka će biti uklonjena i sa javnog cjenovnika.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPricing;
