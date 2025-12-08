import { Award, Users, Heart, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Award, value: '15+', label: 'Godina Iskustva' },
  { icon: Users, value: '5000+', label: 'Zadovoljnih Klijenata' },
  { icon: Heart, value: '10000+', label: 'Tretiranih Životinja' },
];

const teamMembers = [
  {
    name: 'Dr. Marko Petrović',
    role: 'Glavni Veterinar',
    bio: 'Specijalizovan za hirurgiju malih životinja sa 15 godina iskustva.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
  },
  {
    name: 'Dr. Ana Jović',
    role: 'Veterinar - Internista',
    bio: 'Specijalista za internu medicinu i dermatologiju kućnih ljubimaca.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  },
  {
    name: 'Jelena Marić',
    role: 'Veterinarski Tehničar',
    bio: 'Stručnjak za njegu i rehabilitaciju životinja.',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
  },
  {
    name: 'Nikola Savić',
    role: 'Veterinarski Asistent',
    bio: 'Odgovoran za laboratorijske analize i dijagnostiku.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
  },
];

const values = [
  'Posvećenost dobrobiti životinja',
  'Transparentna komunikacija sa vlasnicima',
  'Kontinuirana edukacija i praćenje novih metoda',
  'Korištenje najmodernije opreme',
  'Timski pristup svakom pacijentu',
  'Empatija i razumijevanje',
];

const workingHours = [
  { day: 'Ponedjeljak - Petak', hours: '08:00 - 20:00' },
  { day: 'Subota', hours: '09:00 - 14:00' },
  { day: 'Nedjelja', hours: 'Zatvoreno' },
  { day: 'Hitni slučajevi', hours: '24/7' },
];

const AboutPage = () => {
  return (
    <Layout>
      <PageHero
        title="O Nama"
        description="Upoznajte VetHealth.ba - vašu pouzdanu veterinarsku ordinaciju u Banjaluci od 2009. godine."
        breadcrumbs={[{ label: 'O Nama' }]}
      />

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
                Naša Priča
              </span>
              <h2 className="text-h2 text-foreground mb-6">
                Posvećeni Zdravlju Vaših Ljubimaca Od 2009.
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  VetHealth.ba je osnovan 2009. godine sa jasnom vizijom - pružiti 
                  vrhunsku veterinarsku njegu svim kućnim ljubimcima u Banjaluci i 
                  široj regiji. Od skromnih početaka u maloj ordinaciji, izrasli smo 
                  u modernu veterinarsku ustanovu sa kompletnom opremom.
                </p>
                <p>
                  Naš tim čine iskusni veterinari i stručnjaci koji dijele istu 
                  strast - ljubav prema životinjama i posvećenost njihovom zdravlju. 
                  Vjerujemo da svaki ljubimac zaslužuje najbolju moguću njegu, bez 
                  obzira na to je li u pitanju rutinski pregled ili složena operacija.
                </p>
                <p>
                  Kroz godine, liječili smo preko 10.000 životinja i stekli povjerenje 
                  više od 5.000 zadovoljnih vlasnika. Ta brojka nas motiviše da svaki 
                  dan budemo još bolji.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=500&fit=crop"
                alt="Veterinarska oprema"
                className="rounded-card shadow-card w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400&h=500&fit=crop"
                alt="Veterinar sa psom"
                className="rounded-card shadow-card w-full h-64 object-cover mt-8"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card p-6 rounded-card shadow-card text-center"
              >
                <stat.icon className="w-10 h-10 mx-auto text-primary mb-4" />
                <p className="text-h2 font-heading font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
                Misija & Vizija
              </span>
              <h2 className="text-h2 text-foreground mb-6">
                Naše Vrijednosti
              </h2>
              <p className="text-muted-foreground mb-8">
                Vjerujemo da kvalitetna veterinarska njega počinje sa pravim 
                vrijednostima. Evo šta nas vodi u svakodnevnom radu:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {values.map((value) => (
                  <div key={value} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-8 rounded-card shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-h3 text-foreground">Radno Vrijeme</h3>
              </div>
              <div className="space-y-4">
                {workingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="font-medium text-foreground">{item.day}</span>
                    <span className={`${
                      item.day === 'Hitni slučajevi' 
                        ? 'text-primary font-semibold' 
                        : 'text-muted-foreground'
                    }`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
              Naš Tim
            </span>
            <h2 className="text-h2 text-foreground mb-4">
              Upoznajte Naše Stručnjake
            </h2>
            <p className="text-muted-foreground">
              Naš tim čine posvećeni profesionalci sa dugogodišnjim iskustvom 
              u veterinarskoj medicini.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-card rounded-card shadow-card overflow-hidden group card-hover"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary text-small font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-small text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-h2 text-primary-foreground mb-4">
            Spremni Smo Za Vašeg Ljubimca
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Zakažite termin danas i uvjerite se zašto nas više od 5000 
            vlasnika preporučuje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact">Zakaži Termin</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/services">Pogledaj Usluge</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
