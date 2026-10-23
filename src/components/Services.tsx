import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Syringe, 
  Scissors, 
  HeartPulse, 
  Microscope, 
  Bone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const serviceKeys = [
  { icon: Stethoscope, titleKey: 'generalExams', descKey: 'generalExamsDesc', color: 'primary' },
  { icon: Syringe, titleKey: 'vaccinations', descKey: 'vaccinationsDesc', color: 'accent' },
  { icon: Scissors, titleKey: 'surgery', descKey: 'surgeryDesc', color: 'success' },
  { icon: HeartPulse, titleKey: 'emergencyCare', descKey: 'emergencyCareDesc', color: 'destructive' },
  { icon: Microscope, titleKey: 'laboratory', descKey: 'laboratoryDesc', color: 'primary' },
  { icon: Bone, titleKey: 'dentistry', descKey: 'dentistryDesc', color: 'accent' },
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
    <section id="services" className="section-padding !pt-8 md:!pt-10 bg-secondary/30">
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
              <div
                key={service.titleKey}
                className="bg-card p-6 rounded-card shadow-card"
              >
                <div className={`w-14 h-14 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center mb-5`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-h4 font-heading font-semibold text-foreground mb-3">
                  {t(`services.${service.titleKey}`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`services.${service.descKey}`)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="default" size="lg" asChild>
            <Link to="/cjenovnik-usluga">{t('services.viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
