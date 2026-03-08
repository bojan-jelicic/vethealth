import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Stethoscope, Users, Mail, Clock, CheckCircle, Bell, Syringe, AlertTriangle, PawPrint } from 'lucide-react';
import { format, addDays, isPast, isToday, isBefore } from 'date-fns';
import { sr } from 'date-fns/locale';

const TABLE_REMINDERS = 'reminders' as any;

const typeLabels: Record<string, string> = { vaccine_due: 'Vakcinacija', follow_up: 'Kontrola', custom: 'Prilagođeno' };
const typeIcons: Record<string, React.ElementType> = { vaccine_due: Syringe, follow_up: Stethoscope, custom: Bell };

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  // Upcoming reminders (open, due in next 30 days or overdue)
  const { data: upcomingReminders = [] } = useQuery({
    queryKey: ['dashboard-reminders'],
    queryFn: async () => {
      const cutoff = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from(TABLE_REMINDERS)
        .select('*, pets(name)')
        .eq('status', 'open')
        .lte('due_date', cutoff)
        .order('due_date', { ascending: true })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; reminder_type: string; title: string; due_date: string; pets: { name: string } | null }[];
    },
  });

  const stats = [
    { title: 'Ukupno termina', value: appointmentsCount ?? 0, icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Na čekanju', value: pendingAppointments ?? 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Usluge', value: servicesCount ?? 0, icon: Stethoscope, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { title: 'Veterinari', value: veterinariansCount ?? 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Poruke', value: messagesCount ?? 0, icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Upcoming Reminders Widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Nadolazeći podsjetnici
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/podsjetnici')}>
                Prikaži sve
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((r) => {
                  const dueDate = new Date(r.due_date);
                  const overdue = isPast(dueDate) && !isToday(dueDate);
                  const today = isToday(dueDate);
                  const TypeIcon = typeIcons[r.reminder_type] || Bell;
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors ${overdue ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/50'}`}
                      onClick={() => navigate('/app/podsjetnici')}
                    >
                      <div className={`p-2 rounded-full ${overdue ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                        <TypeIcon className={`h-4 w-4 ${overdue ? 'text-destructive' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {r.pets && (
                            <span className="flex items-center gap-0.5">
                              <PawPrint className="h-3 w-3" />{r.pets.name}
                            </span>
                          )}
                          <span>· {typeLabels[r.reminder_type]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${overdue ? 'text-destructive' : today ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(dueDate, 'dd.MM.')}
                          {overdue && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                          {today && <span className="text-xs ml-1">(danas)</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nema nadolazećih podsjetnika</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
