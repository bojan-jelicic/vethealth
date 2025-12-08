import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Stethoscope, Users, Mail, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

const AdminDashboard = () => {
  const { data: appointmentsCount } = useQuery({
    queryKey: ['admin-appointments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pendingAppointments } = useQuery({
    queryKey: ['admin-pending-appointments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: servicesCount } = useQuery({
    queryKey: ['admin-services-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: veterinariansCount } = useQuery({
    queryKey: ['admin-veterinarians-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('veterinarians')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: messagesCount } = useQuery({
    queryKey: ['admin-messages-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentAppointments } = useQuery({
    queryKey: ['admin-recent-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { 
      title: 'Ukupno termina', 
      value: appointmentsCount ?? 0, 
      icon: Calendar, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      title: 'Na čekanju', 
      value: pendingAppointments ?? 0, 
      icon: Clock, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    { 
      title: 'Usluge', 
      value: servicesCount ?? 0, 
      icon: Stethoscope, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    { 
      title: 'Veterinari', 
      value: veterinariansCount ?? 0, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Poruke', 
      value: messagesCount ?? 0, 
      icon: Mail, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pregled aktivnosti veterinarske ordinacije</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nedavni termini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {appointment.owner_first_name} {appointment.owner_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.pet_name} - {(appointment.services as any)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(appointment.appointment_date), 'dd.MM.yyyy', { locale: sr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : appointment.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                      {appointment.status === 'confirmed' ? 'Potvrđen' : 
                       appointment.status === 'pending' ? 'Na čekanju' : 'Otkazan'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nema nedavnih termina</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
