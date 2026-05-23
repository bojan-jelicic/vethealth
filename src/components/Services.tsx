import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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

const serviceKeys = [
  { slug: 'opsti-pregledi', icon: Stethoscope, titleKey: 'generalExams', descKey: 'generalExamsDesc', color: 'primary' },
  { slug: 'vakcinacije', icon: Syringe, titleKey: 'vaccinations', descKey: 'vaccinationsDesc', color: 'accent' },
  { slug: 'operacije', icon: Scissors, titleKey: 'surgery', descKey: 'surgeryDesc', color: 'success' },
  { slug: 'hitna-pomoc', icon: HeartPulse, titleKey: 'emergencyCare', descKey: 'emergencyCareDesc', color: 'destructive' },
  { slug: 'laboratorija', icon: Microscope, titleKey: 'laboratory', descKey: 'laboratoryDesc', color: 'primary' },
  { slug: 'stomatologija', icon: Bone, titleKey: 'dentistry', descKey: 'dentistryDesc', color: 'accent' },
];

const colorClasses = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', hover: 'group-hover:bg-primary group-hover:text-primary-foreground' },
  accent: { bg: 'bg-accent/10', text: 'text-accent', hover: 'group-hover:bg-accent group-hover:text-accent-foreground' },
  success: { bg: 'bg-success/10', text: 'text-success', hover: 'group-hover:bg-success group-hover:text-success-foreground' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive', hover: 'group-hover:bg-destructive group-hover:text-destructive-foreground' },
};

export const Services = () => {
  const { t } = useTranslation();

  return (
    <section id="services" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            {t('services.label')}
          </span>
          <h2 className="text-h2 text-foreground mb-4">{t('services.title')}</h2>
          <p className="text-muted-foreground">{t('services.description')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceKeys.map((service) => {
            const colors = colorClasses[service.color as keyof typeof colorClasses];
            return (
              <Link
                key={service.titleKey}
                to={`/services/${service.slug}`}
                className="group bg-card p-6 rounded-card shadow-card card-hover cursor-pointer block"
              >
                <div className={`w-14 h-14 rounded-lg ${colors.bg} ${colors.text} ${colors.hover} flex items-center justify-center mb-5 transition-all duration-300`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-h4 font-heading font-semibold text-foreground mb-3">
                  {t(`services.${service.titleKey}`)}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t(`services.${service.descKey}`)}
                </p>
                <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  <span>{t('services.learnMore')}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="default" size="lg" asChild>
            <Link to="/services">{t('services.viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
