import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, CalendarDays, FileText, LogOut, Construction } from 'lucide-react';

const PortalDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/portal/login');
        return;
      }
      setUserEmail(data.user.email || '');
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/portal/login');
  };

  const comingSoonCards = [
    {
      icon: PawPrint,
      title: 'Moji ljubimci',
      description: 'Pregledajte kartone, vakcinacije i historiju vaših ljubimaca.',
    },
    {
      icon: CalendarDays,
      title: 'Posjete',
      description: 'Pregledajte historiju posjeta i zakazane termine.',
    },
    {
      icon: FileText,
      title: 'Dokumenti',
      description: 'Pristupite nalazima, receptima i ostalim dokumentima.',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg">VetHealth Portal</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Under construction banner */}
        <Card className="mb-8 border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-6">
            <Construction className="h-10 w-10 text-primary flex-shrink-0" />
            <div>
              <h2 className="font-heading font-bold text-lg">Portal u pripremi</h2>
              <p className="text-sm text-muted-foreground">
                Klijentski portal je trenutno u fazi razvoja. Uskoro ćete moći pregledati
                podatke o vašim ljubimcima, posjete i dokumente direktno ovdje.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {comingSoonCards.map((card) => (
            <Card key={card.title} className="opacity-60">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" disabled className="w-full">
                  Uskoro dostupno
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PortalDashboard;
