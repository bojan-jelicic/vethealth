import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { logAudit } from '@/services/auditService';
import { useEffect } from 'react';

interface VetForm {
  id?: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  is_active: boolean;
}

const initialForm: VetForm = {
  name: '',
  specialization: '',
  email: '',
  phone: '',
  is_active: true,
};

const AdminVeterinarians = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<VetForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: veterinarians, isLoading } = useQuery({
    queryKey: ['admin-veterinarians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veterinarians')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (veterinarians && veterinarians.length >= 0) {
      logAudit({ action: 'view_list', entity_type: 'veterinarian', metadata: { count: veterinarians.length } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(veterinarians)]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<VetForm, 'id'>) => {
      const { data: inserted, error } = await supabase.from('veterinarians').insert({
        name: data.name,
        specialization: data.specialization || null,
        email: data.email || null,
        phone: data.phone || null,
        is_active: data.is_active,
      }).select('id').single();
      if (error) throw error;
      await logAudit({ action: 'create', entity_type: 'veterinarian', entity_id: inserted?.id, metadata: { name: data.name } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-veterinarians'] });
      toast({ title: 'Veterinar kreiran' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri kreiranju', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VetForm) => {
      const { error } = await supabase
        .from('veterinarians')
        .update({
          name: data.name,
          specialization: data.specialization || null,
          email: data.email || null,
          phone: data.phone || null,
          is_active: data.is_active,
        })
        .eq('id', data.id);
      if (error) throw error;
      await logAudit({ action: 'update', entity_type: 'veterinarian', entity_id: data.id, metadata: { name: data.name, is_active: data.is_active } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-veterinarians'] });
      toast({ title: 'Veterinar ažuriran' });
      handleClose();
    },
    onError: () => {
      toast({ title: 'Greška pri ažuriranju', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('veterinarians').delete().eq('id', id);
      if (error) throw error;
      await logAudit({ action: 'delete', entity_type: 'veterinarian', entity_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-veterinarians'] });
      toast({ title: 'Veterinar obrisan' });
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

  const handleEdit = (vet: any) => {
    setForm({
      id: vet.id,
      name: vet.name,
      specialization: vet.specialization || '',
      email: vet.email || '',
      phone: vet.phone || '',
      is_active: vet.is_active,
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Unesite ime veterinara', variant: 'destructive' });
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
          <h1 className="text-3xl font-heading font-bold">Veterinari</h1>
          <p className="text-muted-foreground mt-1">Upravljanje veterinarskim osobljem</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(initialForm); setIsEditing(false); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novi veterinar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Uredi veterinara' : 'Novi veterinar'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ime i prezime *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Marko Marković"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specijalizacija</Label>
                <Input
                  id="specialization"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="Npr. Hirurgija"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="veterinar@ordinacija.ba"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+387 33 123 456"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Aktivan veterinar</Label>
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
          ) : veterinarians && veterinarians.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime</TableHead>
                  <TableHead>Specijalizacija</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veterinarians.map((vet) => (
                  <TableRow key={vet.id}>
                    <TableCell className="font-medium">{vet.name}</TableCell>
                    <TableCell>{vet.specialization || '-'}</TableCell>
                    <TableCell>{vet.email || '-'}</TableCell>
                    <TableCell>{vet.phone || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        vet.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {vet.is_active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(vet)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(vet.id)}
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
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema veterinara za prikaz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVeterinarians;
