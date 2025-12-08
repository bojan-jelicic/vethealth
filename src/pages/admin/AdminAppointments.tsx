import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { Calendar, Search, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

const AdminAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['admin-appointments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*, services(name), veterinarians(name)')
        .order('appointment_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast({ title: 'Status ažuriran' });
    },
    onError: () => {
      toast({ title: 'Greška pri ažuriranju statusa', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast({ title: 'Termin obrisan' });
    },
    onError: () => {
      toast({ title: 'Greška pri brisanju', variant: 'destructive' });
    },
  });

  const filteredAppointments = appointments?.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.owner_first_name.toLowerCase().includes(searchLower) ||
      apt.owner_last_name.toLowerCase().includes(searchLower) ||
      apt.pet_name.toLowerCase().includes(searchLower) ||
      apt.owner_email.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      confirmed: 'Potvrđen',
      pending: 'Na čekanju',
      cancelled: 'Otkazan',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Termini</h1>
        <p className="text-muted-foreground mt-1">Upravljanje zakazanim terminima</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži termine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter po statusu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="pending">Na čekanju</SelectItem>
                <SelectItem value="confirmed">Potvrđeni</SelectItem>
                <SelectItem value="cancelled">Otkazani</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Učitavanje...</div>
          ) : filteredAppointments && filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Vrijeme</TableHead>
                    <TableHead>Vlasnik</TableHead>
                    <TableHead>Ljubimac</TableHead>
                    <TableHead>Usluga</TableHead>
                    <TableHead>Veterinar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        {format(new Date(apt.appointment_date), 'dd.MM.yyyy', { locale: sr })}
                      </TableCell>
                      <TableCell>{apt.appointment_time.slice(0, 5)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apt.owner_first_name} {apt.owner_last_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.owner_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{apt.pet_name}</TableCell>
                      <TableCell>{(apt.services as any)?.name}</TableCell>
                      <TableCell>{(apt.veterinarians as any)?.name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'confirmed' })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'cancelled' })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(apt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nema termina za prikaz</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointments;
