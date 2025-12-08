import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Syringe, 
  Scissors, 
  HeartPulse, 
  Microscope, 
  Bone,
  Pill,
  Heart,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Button } from '@/components/ui/button';

const serviceCategories = [
  {
    name: 'Preventiva',
    services: [
      {
        slug: 'opsti-pregledi',
        icon: Stethoscope,
        title: 'Opšti Pregledi',
        description: 'Redovni zdravstveni pregledi i dijagnostika za sve vrste kućnih ljubimaca. Preporučujemo pregled najmanje jednom godišnje.',
        price: 'od 30 KM',
      },
      {
        slug: 'vakcinacije',
        icon: Syringe,
        title: 'Vakcinacije',
        description: 'Kompletni vakcinalni program za pse, mačke i druge ljubimce. Zaštitite svog ljubimca od opasnih bolesti.',
        price: 'od 25 KM',
      },
      {
        slug: 'cipovanje',
        icon: Pill,
        title: 'Čipovanje',
        description: 'Identifikacija ljubimaca putem mikročipa. Obavezno za putovanja i registraciju.',
        price: '40 KM',
      },
    ],
  },
  {
    name: 'Hirurgija',
    services: [
      {
        slug: 'sterilizacija',
        icon: Scissors,
        title: 'Sterilizacija i Kastracija',
        description: 'Rutinske hirurške intervencije za kontrolu populacije i zdravlje vašeg ljubimca.',
        price: 'od 80 KM',
      },
      {
        slug: 'operacije',
        icon: Heart,
        title: 'Operacije',
        description: 'Složene hirurške zahvate izvodimo sa najmodernijom opremom i iskusnim timom.',
        price: 'Po dogovoru',
      },
    ],
  },
  {
    name: 'Dijagnostika',
    services: [
      {
        slug: 'laboratorija',
        icon: Microscope,
        title: 'Laboratorijske Analize',
        description: 'Brze i precizne analize krvi, urina, stolice i drugih uzoraka u našoj laboratoriji.',
        price: 'od 20 KM',
      },
      {
        slug: 'ultrazvuk',
        icon: Eye,
        title: 'Ultrazvuk',
        description: 'Dijagnostički ultrazvučni pregled za procjenu unutrašnjih organa.',
        price: '50 KM',
      },
    ],
  },
  {
    name: 'Specijalizirane Usluge',
    services: [
      {
        slug: 'stomatologija',
        icon: Bone,
        title: 'Stomatologija',
        description: 'Čišćenje zuba, ekstrakcije i tretmani za zdravlje usne šupljine vašeg ljubimca.',
        price: 'od 40 KM',
      },
      {
        slug: 'hitna-pomoc',
        icon: HeartPulse,
        title: 'Hitna Pomoć 24/7',
        description: 'Dostupni smo non-stop za sve hitne slučajeve. Nazovite nas u bilo koje vrijeme.',
        price: 'od 50 KM',
      },
    ],
  },
];

const ServicesPage = () => {
  return (
    <Layout>
      <PageHero
        title="Naše Usluge"
        description="Pružamo širok spektar veterinarskih usluga kako bismo osigurali zdravlje i dobrobit vašeg ljubimca kroz sve životne faze."
        breadcrumbs={[{ label: 'Usluge' }]}
      />

      <section className="section-padding">
        <div className="container-custom">
          {/* Emergency Banner */}
          <div className="mb-12">
            <EmergencyBanner />
          </div>

          {/* Service Categories */}
          <div className="space-y-16">
            {serviceCategories.map((category) => (
              <div key={category.name}>
                <h2 className="text-h2 text-foreground mb-8 pb-4 border-b border-border">
                  {category.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.services.map((service) => (
                    <Link
                      key={service.slug}
                      to={`/services/${service.slug}`}
                      className="group bg-card p-6 rounded-card shadow-card card-hover block"
                    >
                      <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center mb-5 transition-all duration-300">
                        <service.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-h4 font-heading font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">
                          {service.price}
                        </span>
                        <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                          <span className="text-small">Detaljnije</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-secondary/50 rounded-card p-8 md:p-12">
            <h2 className="text-h3 text-foreground mb-4">
              Niste Sigurni Koja Usluga Vam Treba?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Nazovite nas ili zakažite konsultaciju. Naš tim će vam pomoći 
              da odaberete najbolju opciju za vašeg ljubimca.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <Link to="/contact">Zakaži Konsultaciju</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+38751123456">Nazovi: +387 51 123 456</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
