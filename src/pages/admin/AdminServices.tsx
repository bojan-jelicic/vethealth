import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';

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

const AdminServices = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
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
    mutationFn: async (data: Omit<ServiceForm, 'id'>) => {
      const { error } = await supabase.from('services').insert({
        name: data.name,
        description: data.description || null,
        price: data.price ? parseFloat(data.price) : null,
        duration_minutes: parseInt(data.duration_minutes),
        category_id: data.category_id || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Usluga kreirana' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri kreiranju', variant: 'destructive' });
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
          duration_minutes: parseInt(data.duration_minutes),
          category_id: data.category_id || null,
          is_active: data.is_active,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Usluga ažurirana' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri ažuriranju', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: 'Usluga obrisana' });
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
      toast({ title: 'Unesite naziv usluge', variant: 'destructive' });
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
          <h1 className="text-3xl font-heading font-bold">Usluge</h1>
          <p className="text-muted-foreground mt-1">Upravljanje veterinarskim uslugama</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialForm); setIsEditing(false); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova usluga
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Uredi uslugu' : 'Nova usluga'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Cijena (KM)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Aktivna usluga</Label>
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
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Kategorija</TableHead>
                  <TableHead>Cijena</TableHead>
                  <TableHead>Trajanje</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{(service.service_categories as any)?.name || '-'}</TableCell>
                    <TableCell>{service.price ? `${service.price} KM` : '-'}</TableCell>
                    <TableCell>{service.duration_minutes} min</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {service.is_active ? 'Aktivna' : 'Neaktivna'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(service.id)}
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
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema usluga za prikaz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminServices;
