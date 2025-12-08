import { useLocation, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, User, Dog, Mail, Home, CalendarPlus } from 'lucide-react';

interface ConfirmationState {
  service: string;
  veterinarian: string;
  date: string;
  time: string;
  petName: string;
  ownerEmail: string;
}

const AppointmentConfirmationPage = () => {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;

  // Redirect if no state
  if (!state) {
    return <Navigate to="/zakazivanje-termina" replace />;
  }

  const dateFormatted = format(new Date(state.date), 'EEEE, d. MMMM yyyy.', { locale: bs });

  // Generate Google Calendar link
  const generateGoogleCalendarUrl = () => {
    const startDate = new Date(state.date);
    const [hours, minutes] = state.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Veterinarski Pregled - ${state.petName}`,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: `Usluga: ${state.service}\nVeterinar: ${state.veterinarian}\nLjubimac: ${state.petName}`,
      location: 'Veterinarska Ordinacija, Ulica Veterinara 123, 78000 Banja Luka',
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <Layout>
      <Helmet>
        <title>Termin Zakazan | Veterinarska Ordinacija</title>
        <meta name="description" content="Vaš termin je uspješno zakazan." />
      </Helmet>

      <section className="section-padding bg-background min-h-[70vh] flex items-center">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg overflow-hidden">
              {/* Success Header */}
              <div className="bg-success p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-white mb-2">
                  Termin Uspješno Zakazan!
                </h1>
                <p className="text-white/90">
                  Poslali smo potvrdu na vašu email adresu.
                </p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Appointment Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-heading font-semibold text-foreground">
                    Detalji Termina
                  </h2>

                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Datum</p>
                        <p className="font-medium text-foreground">{dateFormatted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vrijeme</p>
                        <p className="font-medium text-foreground">{state.time}h</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Usluga & Veterinar</p>
                        <p className="font-medium text-foreground">{state.service}</p>
                        <p className="text-sm text-muted-foreground">{state.veterinarian}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Dog className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ljubimac</p>
                        <p className="font-medium text-foreground">{state.petName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Potvrda poslana na</p>
                        <p className="font-medium text-foreground">{state.ownerEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>Napomena:</strong> Molimo dođite 10 minuta prije zakazanog termina. 
                    U slučaju otkazivanja, kontaktirajte nas najmanje 24 sata unaprijed.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1">
                    <a
                      href={generateGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Dodaj u Kalendar
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Nazad na Početnu
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AppointmentConfirmationPage;
