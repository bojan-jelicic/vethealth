import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AppointmentForm } from '@/components/appointment/AppointmentForm';
import { Phone, Clock, MapPin } from 'lucide-react';

const AppointmentPage = () => {
  const breadcrumbs = [
    { label: 'Početna', href: '/' },
    { label: 'Zakazivanje Termina' },
  ];

  return (
    <Layout>
      <Helmet>
        <title>Zakazivanje Termina | Veterinarska Ordinacija Banja Luka</title>
        <meta
          name="description"
          content="Zakažite termin online za vašeg ljubimca. Brzo i jednostavno zakazivanje veterinarskih pregleda, vakcinacija i drugih usluga."
        />
      </Helmet>

      <PageHero
        title="Zakazivanje Termina"
        description="Zakažite termin za vašeg ljubimca brzo i jednostavno. Odaberite uslugu, datum i vrijeme koje vam odgovara."
        breadcrumbs={breadcrumbs}
      />

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <AppointmentForm />
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Working Hours */}
              <div className="bg-card rounded-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    Radno Vrijeme
                  </h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Ponedjeljak - Petak</span>
                    <span className="font-medium text-foreground">09:00 - 17:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Subota</span>
                    <span className="font-medium text-foreground">Zatvoreno</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Nedjelja</span>
                    <span className="font-medium text-foreground">Zatvoreno</span>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-card rounded-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    Kontakt
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <a
                    href="tel:+38751123456"
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    +387 51 123 456
                  </a>
                  <p className="text-muted-foreground">
                    Za hitne slučajeve van radnog vremena pozovite:
                  </p>
                  <a
                    href="tel:+38765123456"
                    className="flex items-center gap-2 text-destructive font-medium hover:opacity-80 transition-opacity"
                  >
                    <Phone className="w-4 h-4" />
                    +387 65 123 456
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    Lokacija
                  </h3>
                </div>
                <address className="not-italic text-sm text-muted-foreground">
                  Ulica Veterinara 123<br />
                  78000 Banja Luka<br />
                  Republika Srpska, BiH
                </address>
              </div>

              {/* Note */}
              <div className="bg-accent/10 border border-accent/30 rounded-card p-4">
                <p className="text-sm text-foreground">
                  <strong>Napomena:</strong> Nakon uspješnog zakazivanja, primit ćete email potvrdu sa svim detaljima vašeg termina.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AppointmentPage;
