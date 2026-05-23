import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Pencil, Trash2, Search, Stethoscope, FolderOpen } from 'lucide-react';
import { IconPicker } from '@/components/admin/IconPicker';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { ServiceContentEditor, ImageField } from '@/components/admin/ServiceContentEditor';
import { slugify, isValidSlug } from '@/lib/slug';
import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

// =================== USLUGE TAB ===================

interface ServiceForm {
  id?: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  category_id: string;
  is_active: boolean;
  slug: string;
  hero_image_url: string;
  long_description: string;
  content_blocks: ServiceContentBlock[];
}

const initialServiceForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  duration_minutes: '30',
  category_id: '',
  is_active: true,
  slug: '',
  hero_image_url: '',
  long_description: '',
  content_blocks: [],
};

const ServicesTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(initialServiceForm);
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
        slug: data.slug || null,
        hero_image_url: data.hero_image_url || null,
        long_description: data.long_description || null,
        content_blocks: data.content_blocks as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Usluga kreirana' });
      handleClose();
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri kreiranju', description: e?.message, variant: 'destructive' }),
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
          slug: data.slug || null,
          hero_image_url: data.hero_image_url || null,
          long_description: data.long_description || null,
          content_blocks: data.content_blocks as any,
        })
        .eq('id', data.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Usluga ažurirana' });
      handleClose();
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri ažuriranju', description: e?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Usluga obrisana' });
      setDeleteId(null);
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri brisanju', description: e?.message, variant: 'destructive' }),
  });

  const handleClose = () => {
    setIsOpen(false);
    setForm(initialServiceForm);
    setIsEditing(false);
  };

  const handleNew = () => {
    setForm(initialServiceForm);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEdit = (s: any) => {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description || '',
      price: s.price?.toString() || '',
      duration_minutes: s.duration_minutes.toString(),
      category_id: s.category_id || '',
      is_active: s.is_active,
      slug: s.slug || '',
      hero_image_url: s.hero_image_url || '',
      long_description: s.long_description || '',
      content_blocks: Array.isArray(s.content_blocks) ? s.content_blocks : [],
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Unesite naziv usluge', variant: 'destructive' });
      return;
    }
    const hasDetails = !!form.hero_image_url || !!form.long_description.trim() || form.content_blocks.length > 0;
    if (hasDetails && !form.slug.trim()) {
      toast({ title: 'Slug je obavezan kada usluga ima detaljnu stranicu', variant: 'destructive' });
      return;
    }
    if (form.slug && !isValidSlug(form.slug)) {
      toast({ title: 'Neispravan slug', description: 'Dozvoljena su mala slova, brojevi i crtice.', variant: 'destructive' });
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
      if (categoryFilter !== 'all' && categoryFilter !== 'none' && s.category_id !== categoryFilter)
        return false;
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
    <div className="space-y-4">
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
          <div className="flex-1" />
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova usluga
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{search ? 'Nema rezultata pretrage' : 'Nema usluga'}</p>
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
            <SheetTitle>{isEditing ? 'Uredi uslugu' : 'Nova usluga'}</SheetTitle>
            <SheetDescription>
              Podaci se sinhronizuju sa javnim cjenovnikom u realnom vremenu.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="s-name">Naziv *</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: !isEditing && !f.slug ? slugify(name) : f.slug,
                  }));
                }}
                placeholder="Npr. Opšti pregled"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-desc">Opis</Label>
              <Textarea
                id="s-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Kratak opis usluge..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-price">Cijena (KM)</Label>
                <Input
                  id="s-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-dur">Trajanje (min)</Label>
                <Input
                  id="s-dur"
                  type="number"
                  min="1"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="s-cat">Kategorija</Label>
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
                <Label htmlFor="s-active" className="cursor-pointer">Aktivna usluga</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vidljiva na javnom cjenovniku
                </p>
              </div>
              <Switch
                id="s-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <div>
                <h4 className="font-semibold text-sm">Detaljna stranica (opciono)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Popunite ako želite da se na cjenovniku pojavi link "Detalji" sa zasebnom stranicom.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-slug">Slug (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="s-slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="npr. opsti-pregledi"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, slug: slugify(form.name) })}>
                    Generiši
                  </Button>
                </div>
                {form.slug && (
                  <p className="text-xs text-muted-foreground">/services/{form.slug}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Hero slika</Label>
                <ImageField
                  value={form.hero_image_url}
                  folder={form.id || 'new'}
                  onChange={(url) => setForm({ ...form, hero_image_url: url })}
                  onError={(msg) => toast({ title: 'Greška', description: msg, variant: 'destructive' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-long">Uvodni opis</Label>
                <Textarea
                  id="s-long"
                  rows={4}
                  value={form.long_description}
                  onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                  placeholder="Glavni paragraf koji opisuje uslugu..."
                />
              </div>

              <div className="space-y-2">
                <Label>Sadržaj (sekcije)</Label>
                <ServiceContentEditor
                  blocks={form.content_blocks}
                  onChange={(blocks) => setForm({ ...form, content_blocks: blocks })}
                  folder={form.id || 'new'}
                />
              </div>
            </div>

            <SheetFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Otkaži
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Sačuvaj izmjene' : 'Kreiraj uslugu'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati uslugu?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja je nepovratna. Usluga će biti uklonjena i sa javnog cjenovnika.
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

// =================== KATEGORIJE TAB ===================

interface CategoryForm {
  id?: string;
  name: string;
  description: string;
  icon: string;
  sort_order: string;
  is_active: boolean;
}

const initialCategoryForm: CategoryForm = {
  name: '',
  description: '',
  icon: '',
  sort_order: '0',
  is_active: true,
};

const CategoriesTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(initialCategoryForm);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; serviceCount: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
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

  // Map kategorija -> broj usluga (za zaštitu pri brisanju)
  const { data: serviceCounts } = useQuery({
    queryKey: ['admin-category-service-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('category_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((s: any) => {
        if (s.category_id) counts[s.category_id] = (counts[s.category_id] || 0) + 1;
      });
      return counts;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-pricing-categories'] });
    queryClient.invalidateQueries({ queryKey: ['admin-category-service-counts'] });
    queryClient.invalidateQueries({ queryKey: ['services-with-categories'] });
    queryClient.invalidateQueries({ queryKey: ['service-categories'] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const { error } = await supabase.from('service_categories').insert({
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
        sort_order: parseInt(data.sort_order) || 0,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Kategorija kreirana' });
      handleClose();
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri kreiranju', description: e?.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const { error } = await supabase
        .from('service_categories')
        .update({
          name: data.name,
          description: data.description || null,
          icon: data.icon || null,
          sort_order: parseInt(data.sort_order) || 0,
          is_active: data.is_active,
        })
        .eq('id', data.id!);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Kategorija ažurirana' });
      handleClose();
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri ažuriranju', description: e?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: 'Kategorija obrisana' });
      setDeleteTarget(null);
    },
    onError: (e: any) =>
      toast({ title: 'Greška pri brisanju', description: e?.message, variant: 'destructive' }),
  });

  const handleClose = () => {
    setIsOpen(false);
    setForm(initialCategoryForm);
    setIsEditing(false);
  };

  const handleNew = () => {
    setForm(initialCategoryForm);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEdit = (c: any) => {
    setForm({
      id: c.id,
      name: c.name,
      description: c.description || '',
      icon: c.icon || '',
      sort_order: c.sort_order?.toString() || '0',
      is_active: c.is_active,
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Unesite naziv kategorije', variant: 'destructive' });
      return;
    }
    if (isEditing) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

  const requestDelete = (id: string) => {
    setDeleteTarget({ id, serviceCount: serviceCounts?.[id] || 0 });
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border flex justify-end">
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova kategorija
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>Nema kategorija</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Redoslijed</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead>Ikona</TableHead>
                <TableHead className="text-center">Br. usluga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{c.sort_order}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {c.description || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.icon ? (
                      (() => {
                        const Icon = getCategoryIcon(c.icon);
                        return (
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-xs">{c.icon}</span>
                          </div>
                        );
                      })()
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {serviceCounts?.[c.id] || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'secondary' : 'outline'}>
                      {c.is_active ? 'Aktivna' : 'Neaktivna'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => requestDelete(c.id)}
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
            <SheetTitle>{isEditing ? 'Uredi kategoriju' : 'Nova kategorija'}</SheetTitle>
            <SheetDescription>
              Kategorije grupišu usluge na javnom cjenovniku.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="c-name">Naziv *</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Npr. Vakcinacije"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-desc">Opis</Label>
              <Textarea
                id="c-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Kratak opis kategorije..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-end">
              {(() => {
                const PreviewIcon = getCategoryIcon(form.icon);
                return (
                  <div
                    className="h-20 w-20 rounded-lg bg-primary/10 border border-border flex items-center justify-center"
                    aria-label="Pretpregled ikone"
                  >
                    <PreviewIcon className="h-10 w-10 text-primary" />
                  </div>
                );
              })()}
              <div className="space-y-2">
                <Label htmlFor="c-icon">Ikona</Label>
                <IconPicker
                  id="c-icon"
                  value={form.icon}
                  onChange={(name) => setForm({ ...form, icon: name })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-sort">Redoslijed</Label>
                <Input
                  id="c-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="c-active" className="cursor-pointer">Aktivna kategorija</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vidljiva na javnom cjenovniku
                </p>
              </div>
              <Switch
                id="c-active"
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
                {isEditing ? 'Sačuvaj izmjene' : 'Kreiraj kategoriju'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget && deleteTarget.serviceCount > 0
                ? 'Brisanje nije moguće'
                : 'Obrisati kategoriju?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.serviceCount > 0
                ? `Ova kategorija sadrži ${deleteTarget.serviceCount} ${
                    deleteTarget.serviceCount === 1 ? 'uslugu' : 'usluga'
                  }. Prvo prebacite ili obrišite te usluge, pa pokušajte ponovo.`
                : 'Ova radnja je nepovratna.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            {deleteTarget && deleteTarget.serviceCount === 0 && (
              <AlertDialogAction
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Obriši
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// =================== WRAPPER ===================

const AdminPricing = () => {
  return (
    <Tabs defaultValue="services" className="space-y-4">
      <TabsList>
        <TabsTrigger value="services">
          <Stethoscope className="w-4 h-4 mr-2" />
          Usluge
        </TabsTrigger>
        <TabsTrigger value="categories">
          <FolderOpen className="w-4 h-4 mr-2" />
          Kategorije
        </TabsTrigger>
      </TabsList>
      <TabsContent value="services">
        <ServicesTab />
      </TabsContent>
      <TabsContent value="categories">
        <CategoriesTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminPricing;
