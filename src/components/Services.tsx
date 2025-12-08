import { 
  Stethoscope, 
  Syringe, 
  Scissors, 
  HeartPulse, 
  Microscope, 
  Bone,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Stethoscope,
    title: 'Opšti Pregledi',
    description: 'Redovni zdravstveni pregledi i dijagnostika za sve vrste kućnih ljubimaca.',
    color: 'primary',
  },
  {
    icon: Syringe,
    title: 'Vakcinacije',
    description: 'Kompletni vakcinalni program za zaštitu vašeg ljubimca od bolesti.',
    color: 'accent',
  },
  {
    icon: Scissors,
    title: 'Hirurgija',
    description: 'Sterilizacija, kastracija i druge hirurške intervencije sa najmodernijom opremom.',
    color: 'success',
  },
  {
    icon: HeartPulse,
    title: 'Hitna Pomoć',
    description: 'Dostupni 24/7 za hitne slučajeve i urgentnu veterinarsku pomoć.',
    color: 'destructive',
  },
  {
    icon: Microscope,
    title: 'Laboratorija',
    description: 'Brze i precizne laboratorijske analize krvi, urina i drugih uzoraka.',
    color: 'primary',
  },
  {
    icon: Bone,
    title: 'Stomatologija',
    description: 'Čišćenje zuba, ekstrakcije i tretmani za zdravlje usne šupljine.',
    color: 'accent',
  },
];

const colorClasses = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    hover: 'group-hover:bg-primary group-hover:text-primary-foreground',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    hover: 'group-hover:bg-accent group-hover:text-accent-foreground',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    hover: 'group-hover:bg-success group-hover:text-success-foreground',
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    hover: 'group-hover:bg-destructive group-hover:text-destructive-foreground',
  },
};

export const Services = () => {
  return (
    <section id="services" className="section-padding bg-secondary/30">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            Naše Usluge
          </span>
          <h2 className="text-h2 text-foreground mb-4">
            Kompletna Veterinarska Njega
          </h2>
          <p className="text-muted-foreground">
            Pružamo širok spektar veterinarskih usluga kako bismo osigurali zdravlje 
            i dobrobit vašeg ljubimca kroz sve životne faze.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const colors = colorClasses[service.color as keyof typeof colorClasses];
            return (
              <div
                key={service.title}
                className="group bg-card p-6 rounded-card shadow-card card-hover cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-lg ${colors.bg} ${colors.text} ${colors.hover} flex items-center justify-center mb-5 transition-all duration-300`}
                >
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-h4 font-heading font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  <span>Saznaj više</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            Pogledaj Sve Usluge
          </Button>
        </div>
      </div>
    </section>
  );
};
