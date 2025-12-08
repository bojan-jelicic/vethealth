import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

interface CategoryForm {
  id?: string;
  name: string;
  description: string;
  icon: string;
  sort_order: string;
  is_active: boolean;
}

const initialForm: CategoryForm = {
  name: '',
  description: '',
  icon: '',
  sort_order: '0',
  is_active: true,
};

const AdminCategories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CategoryForm, 'id'>) => {
      const { error } = await supabase.from('service_categories').insert({
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
        sort_order: parseInt(data.sort_order),
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategorija kreirana' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri kreiranju', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const { error } = await supabase
        .from('service_categories')
        .update({
          name: data.name,
          description: data.description || null,
          icon: data.icon || null,
          sort_order: parseInt(data.sort_order),
          is_active: data.is_active,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategorija ažurirana' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri ažuriranju', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Kategorija obrisana' });
    },
    onError: () => {
      toast({ title: 'Greška pri brisanju', variant: 'destructive' });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleEdit = (category: any) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order.toString(),
      is_active: category.is_active,
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
    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Kategorije</h1>
          <p className="text-muted-foreground mt-1">Upravljanje kategorijama usluga</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialForm); setIsEditing(false); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova kategorija
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Uredi kategoriju' : 'Nova kategorija'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Npr. Vakcinacije"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Kratak opis kategorije..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Ikona (Lucide)</Label>
                  <Input
                    id="icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Npr. Syringe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Redoslijed</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Aktivna kategorija</Label>
                <Switch
                  id="active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Otkaži
                </Button>
                <Button type="submit">
                  {isEditing ? 'Sačuvaj' : 'Kreiraj'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Učitavanje...</div>
          ) : categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Redoslijed</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Ikona</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.description || '-'}</TableCell>
                    <TableCell>{category.icon || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {category.is_active ? 'Aktivna' : 'Neaktivna'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema kategorija za prikaz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
