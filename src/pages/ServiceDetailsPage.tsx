import { useParams, Link } from 'react-router-dom';
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
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';

const servicesData: Record<string, {
  icon: typeof Stethoscope;
  title: string;
  description: string;
  fullDescription: string;
  price: string;
  duration: string;
  benefits: string[];
  whatToExpect: string[];
  image: string;
}> = {
  'opsti-pregledi': {
    icon: Stethoscope,
    title: 'Opšti Pregledi',
    description: 'Redovni zdravstveni pregledi za sve vrste kućnih ljubimaca',
    fullDescription: 'Opšti veterinarski pregled je temelj preventivne njege vašeg ljubimca. Tokom pregleda, naš veterinar će temeljito pregledati vašeg ljubimca, procijeniti njegovo opšte zdravstveno stanje i uočiti potencijalne probleme prije nego što postanu ozbiljni.',
    price: 'od 30 KM',
    duration: '30-45 minuta',
    benefits: [
      'Rano otkrivanje bolesti',
      'Praćenje težine i općeg stanja',
      'Savjeti o ishrani i njezi',
      'Ažuriranje vakcinacija',
    ],
    whatToExpect: [
      'Pregled očiju, ušiju i zuba',
      'Auskultacija srca i pluća',
      'Palpacija abdomena',
      'Pregled kože i dlake',
      'Procjena pokretljivosti',
    ],
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&h=600&fit=crop',
  },
  'vakcinacije': {
    icon: Syringe,
    title: 'Vakcinacije',
    description: 'Kompletni vakcinalni program za zaštitu vašeg ljubimca',
    fullDescription: 'Vakcinacija je najvažnija preventivna mjera za zaštitu vašeg ljubimca od opasnih zaraznih bolesti. Naš tim koristi najkvalitetnije vakcine i prati međunarodne protokole vakcinacije.',
    price: 'od 25 KM',
    duration: '15-20 minuta',
    benefits: [
      'Zaštita od smrtonosnih bolesti',
      'Obavezan za putovanja',
      'Sprječava širenje zaraze',
      'Dugotrajna imunološka zaštita',
    ],
    whatToExpect: [
      'Kratak zdravstveni pregled prije vakcinacije',
      'Primjena vakcine',
      'Upis u zdravstveni karton',
      'Zakazivanje revakcinacije',
    ],
    image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=800&h=600&fit=crop',
  },
  'cipovanje': {
    icon: Pill,
    title: 'Čipovanje',
    description: 'Trajni identifikacija ljubimaca putem mikročipa',
    fullDescription: 'Mikročip je mali uređaj veličine zrna riže koji se bezbolno implantira pod kožu vašeg ljubimca. Sadrži jedinstveni identifikacijski broj koji omogućava pronalazak izgubljenog ljubimca.',
    price: '40 KM',
    duration: '10-15 minuta',
    benefits: [
      'Trajna identifikacija',
      'Povećava šanse za pronalazak',
      'Obavezan za međunarodno putovanje',
      'Bezbolna procedura',
    ],
    whatToExpect: [
      'Brza i bezbolna implantacija',
      'Registracija u bazu podataka',
      'Izdavanje dokumentacije',
    ],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
  },
  'sterilizacija': {
    icon: Scissors,
    title: 'Sterilizacija i Kastracija',
    description: 'Rutinske hirurške intervencije za zdravlje ljubimca',
    fullDescription: 'Sterilizacija i kastracija su sigurne hirurške procedure koje sprječavaju neželjeno razmnožavanje i mogu poboljšati zdravlje i ponašanje vašeg ljubimca.',
    price: 'od 80 KM',
    duration: '1-2 sata',
    benefits: [
      'Sprječava neželjene trudnoće',
      'Smanjuje rizik od bolesti',
      'Poboljšava ponašanje',
      'Duži životni vijek',
    ],
    whatToExpect: [
      'Preoperativni pregled',
      'Anestezija i operacija',
      'Postoperativna njega',
      'Kontrolni pregled',
    ],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop',
  },
  'operacije': {
    icon: Heart,
    title: 'Operacije',
    description: 'Složeni hirurški zahvati sa najmodernijom opremom',
    fullDescription: 'Naša ordinacija je opremljena za izvođenje širokog spektra hirurških zahvata, od jednostavnih do složenih operacija. Koristimo najmodernije anestezijske protokole i monitoring opremu.',
    price: 'Po dogovoru',
    duration: 'Zavisno od zahvata',
    benefits: [
      'Iskusan hirurški tim',
      'Moderna oprema',
      'Sigurna anestezija',
      'Postoperativna njega',
    ],
    whatToExpect: [
      'Detaljna preoperativna dijagnostika',
      'Priprema za operaciju',
      'Hirurški zahvat',
      'Intenzivan nadzor',
    ],
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop',
  },
  'laboratorija': {
    icon: Microscope,
    title: 'Laboratorijske Analize',
    description: 'Brze i precizne analize u našoj laboratoriji',
    fullDescription: 'Naša interna laboratorija omogućava brzu dijagnostiku širokog spektra stanja. Rezultati osnovnih analiza dostupni su u roku od nekoliko sati.',
    price: 'od 20 KM',
    duration: '15 minuta do 24 sata',
    benefits: [
      'Brzi rezultati',
      'Precizna dijagnostika',
      'Širok spektar testova',
      'Praćenje hroničnih stanja',
    ],
    whatToExpect: [
      'Uzimanje uzoraka',
      'Laboratorijska obrada',
      'Interpretacija rezultata',
      'Preporuke za liječenje',
    ],
    image: 'https://images.unsplash.com/photo-1579165466741-7f35e4755183?w=800&h=600&fit=crop',
  },
  'ultrazvuk': {
    icon: Eye,
    title: 'Ultrazvuk',
    description: 'Dijagnostički ultrazvučni pregled unutrašnjih organa',
    fullDescription: 'Ultrazvučna dijagnostika je neinvazivna metoda koja omogućava vizualizaciju unutrašnjih organa u realnom vremenu, bez potrebe za anestezijom.',
    price: '50 KM',
    duration: '20-30 minuta',
    benefits: [
      'Neinvazivna dijagnostika',
      'Bez anestezije',
      'Trenutni rezultati',
      'Pregled trudnoće',
    ],
    whatToExpect: [
      'Priprema (možda gladovanje)',
      'Ultrazvučni pregled',
      'Očitavanje nalaza',
      'Plan liječenja',
    ],
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&h=600&fit=crop',
  },
  'stomatologija': {
    icon: Bone,
    title: 'Stomatologija',
    description: 'Čišćenje zuba i tretmani usne šupljine',
    fullDescription: 'Dentalna higijena je ključna za opšte zdravlje ljubimca. Nudimo profesionalno čišćenje zuba, ekstrakcije i tretmane bolesti desni.',
    price: 'od 40 KM',
    duration: '30-60 minuta',
    benefits: [
      'Uklanjanje zubnog kamenca',
      'Prevencija bolesti desni',
      'Svježiji dah',
      'Duži vijek zuba',
    ],
    whatToExpect: [
      'Pregled usne šupljine',
      'Ultrazvučno čišćenje',
      'Poliranje zuba',
      'Savjeti za kućnu njegu',
    ],
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&h=600&fit=crop',
  },
  'hitna-pomoc': {
    icon: HeartPulse,
    title: 'Hitna Pomoć 24/7',
    description: 'Dostupni smo non-stop za sve hitne slučajeve',
    fullDescription: 'Naša hitna služba je dostupna 24 sata dnevno, 7 dana u sedmici. Ako vaš ljubimac ima hitno stanje, ne čekajte - nazovite nas odmah.',
    price: 'od 50 KM',
    duration: 'Zavisno od slučaja',
    benefits: [
      'Dostupnost 24/7',
      'Brza reakcija',
      'Iskusan tim',
      'Kompletna oprema',
    ],
    whatToExpect: [
      'Telefonska trijaža',
      'Brzi prijam',
      'Hitna dijagnostika',
      'Stabilizacija i liječenje',
    ],
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&h=600&fit=crop',
  },
};

const relatedServicesMap: Record<string, string[]> = {
  'opsti-pregledi': ['vakcinacije', 'laboratorija', 'cipovanje'],
  'vakcinacije': ['opsti-pregledi', 'cipovanje', 'stomatologija'],
  'cipovanje': ['vakcinacije', 'opsti-pregledi', 'sterilizacija'],
  'sterilizacija': ['operacije', 'laboratorija', 'opsti-pregledi'],
  'operacije': ['sterilizacija', 'ultrazvuk', 'laboratorija'],
  'laboratorija': ['ultrazvuk', 'opsti-pregledi', 'operacije'],
  'ultrazvuk': ['laboratorija', 'operacije', 'opsti-pregledi'],
  'stomatologija': ['opsti-pregledi', 'vakcinacije', 'laboratorija'],
  'hitna-pomoc': ['operacije', 'laboratorija', 'ultrazvuk'],
};

const ServiceDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? servicesData[slug] : null;
  const relatedSlugs = slug ? relatedServicesMap[slug] || [] : [];

  if (!service) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h2 text-foreground mb-4">Usluga nije pronađena</h1>
            <Button asChild>
              <Link to="/services">Povratak na usluge</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const Icon = service.icon;

  return (
    <Layout>
      <PageHero
        title={service.title}
        description={service.description}
        breadcrumbs={[
          { label: 'Usluge', href: '/services' },
          { label: service.title },
        ]}
      />

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image */}
              <div className="rounded-card overflow-hidden shadow-card">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-h3 text-foreground mb-4">O Usluzi</h2>
                <p className="text-muted-foreground text-lg">
                  {service.fullDescription}
                </p>
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-h3 text-foreground mb-4">Prednosti</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Expect */}
              <div>
                <h2 className="text-h3 text-foreground mb-4">Šta Očekivati</h2>
                <ol className="space-y-3">
                  {service.whatToExpect.map((step, index) => (
                    <li key={step} className="flex items-start gap-4">
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-foreground pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Info Card */}
                <div className="bg-card p-6 rounded-card shadow-card">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-small text-muted-foreground">Cijena</span>
                      <p className="text-h4 font-heading font-bold text-primary">
                        {service.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <Button variant="accent" className="w-full" asChild>
                      <Link to="/contact">Zakaži Termin</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="tel:+38751123456">Nazovi Nas</a>
                    </Button>
                  </div>
                </div>

                {/* Related Services */}
                {relatedSlugs.length > 0 && (
                  <div className="bg-card p-6 rounded-card shadow-card">
                    <h3 className="font-heading font-semibold text-foreground mb-4">
                      Slične Usluge
                    </h3>
                    <div className="space-y-3">
                      {relatedSlugs.map((relSlug) => {
                        const relService = servicesData[relSlug];
                        if (!relService) return null;
                        const RelIcon = relService.icon;
                        return (
                          <Link
                            key={relSlug}
                            to={`/services/${relSlug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <RelIcon className="w-5 h-5" />
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">
                              {relService.title}
                            </span>
                            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServiceDetailsPage;
