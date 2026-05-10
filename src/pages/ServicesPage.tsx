import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, Syringe, Scissors, HeartPulse, Microscope, Bone, Pill, Heart, Eye, ArrowRight
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { Button } from '@/components/ui/button';

const ServicesPage = () => {
  const { t } = useTranslation();

  const serviceCategories = [
    {
      nameKey: 'servicesPage.preventive',
      services: [
        { slug: 'opsti-pregledi', icon: Stethoscope, titleKey: 'servicesPage.generalExams', descKey: 'servicesPage.generalExamsDesc', price: `${t('servicesPage.from')} 30 KM` },
        { slug: 'vakcinacije', icon: Syringe, titleKey: 'servicesPage.vaccinations', descKey: 'servicesPage.vaccinationsDesc', price: `${t('servicesPage.from')} 25 KM` },
        { slug: 'cipovanje', icon: Pill, titleKey: 'servicesPage.chipping', descKey: 'servicesPage.chippingDesc', price: '40 KM' },
      ],
    },
    {
      nameKey: 'servicesPage.surgeryCategory',
      services: [
        { slug: 'sterilizacija', icon: Scissors, titleKey: 'servicesPage.sterilization', descKey: 'servicesPage.sterilizationDesc', price: `${t('servicesPage.from')} 80 KM` },
        { slug: 'operacije', icon: Heart, titleKey: 'servicesPage.operations', descKey: 'servicesPage.operationsDesc', price: 'Po dogovoru' },
      ],
    },
    {
      nameKey: 'servicesPage.diagnostics',
      services: [
        { slug: 'laboratorija', icon: Microscope, titleKey: 'servicesPage.labAnalysis', descKey: 'servicesPage.labAnalysisDesc', price: `${t('servicesPage.from')} 20 KM` },
        { slug: 'ultrazvuk', icon: Eye, titleKey: 'servicesPage.ultrasound', descKey: 'servicesPage.ultrasoundDesc', price: '50 KM' },
      ],
    },
    {
      nameKey: 'servicesPage.specializedServices',
      services: [
        { slug: 'stomatologija', icon: Bone, titleKey: 'servicesPage.dentistry', descKey: 'servicesPage.dentistryDesc', price: `${t('servicesPage.from')} 40 KM` },
        { slug: 'hitna-pomoc', icon: HeartPulse, titleKey: 'servicesPage.emergency247', descKey: 'servicesPage.emergency247Desc', price: `${t('servicesPage.from')} 50 KM` },
      ],
    },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('servicesPage.seoTitle')}</title>
        <meta name="description" content={t('servicesPage.seoDescription')} />
      </Helmet>
      <PageHero
        title={t('servicesPage.title')}
        description={t('servicesPage.description')}
      />

      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12"><EmergencyBanner /></div>

          <div className="space-y-16">
            {serviceCategories.map((category) => (
              <div key={category.nameKey}>
                <h2 className="text-h2 text-foreground mb-8 pb-4 border-b border-border">
                  {t(category.nameKey)}
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
                        {t(service.titleKey)}
                      </h3>
                      <p className="text-muted-foreground mb-4">{t(service.descKey)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">{service.price}</span>
                        <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                          <span className="text-small">{t('servicesPage.details')}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-secondary/50 rounded-card p-8 md:p-12">
            <h2 className="text-h3 text-foreground mb-4">{t('servicesPage.ctaTitle')}</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t('servicesPage.ctaDescription')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild>
                <Link to="/contact">{t('servicesPage.bookConsultation')}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+38751123456">{t('servicesPage.callUs')}: +387 51 123 456</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
