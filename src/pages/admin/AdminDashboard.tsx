import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Mail, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  const { data: pendingMessages } = useQuery({
    queryKey: ['admin-pending-messages-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentMessages } = useQuery({
    queryKey: ['admin-recent-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { title: 'Usluge', value: servicesCount ?? 0, icon: Stethoscope, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { title: 'Poruke', value: messagesCount ?? 0, icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Nove poruke', value: pendingMessages ?? 0, icon: Mail, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pregled sadržaja veterinarske ordinacije</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Nedavne poruke
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/messages')}>
                Prikaži sve
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages && recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => navigate('/app/messages')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.subject}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(m.created_at), 'dd.MM.', { locale: sr })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nema novih poruka</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/pricing')}>
              <Stethoscope className="h-4 w-4 mr-2" />
              Uredi cjenovnik usluga
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/blog')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Napiši novi blog
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
