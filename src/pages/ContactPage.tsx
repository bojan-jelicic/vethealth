import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Phone, Clock, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { ContactSection } from '@/components/ContactSection';
import { useClinicSettings } from '@/hooks/useClinicSettings';

const ContactPage = () => {
  const { t } = useTranslation();
  const { data: clinic } = useClinicSettings();
  const wh = clinic?.working_hours;

  const workingHoursList = [
    { dayKey: 'contactPage.monFri', hours: wh?.pon_pet || '09:00 - 19:00', active: true },
    { dayKey: 'contactPage.saturday', hours: wh?.sub || '09:00 - 14:00', active: true },
    { dayKey: 'contactPage.sunday', hours: wh?.ned || t('contactPage.closed'), active: false },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('contactPage.seoTitle')}</title>
        <meta name="description" content={t('contactPage.seoDescription')} />
      </Helmet>
      <PageHero title={t('contactPage.title')} description={t('contactPage.description')} />

      <section className="pt-8 pb-16 md:pt-10 md:pb-20">
        <div className="container-custom">
          {/* Working Hours */}
          <div className="mb-12 grid sm:grid-cols-3 gap-4">
            {workingHoursList.map((item) => (
              <div key={item.dayKey} className={`flex flex-col items-center p-5 rounded-card text-center ${item.dayKey === 'contactPage.emergencyCases' ? 'bg-primary text-primary-foreground' : 'bg-card shadow-card'}`}>
                <Clock className={`w-5 h-5 mb-2 ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : 'text-primary'}`} />
                <span className={`text-small font-medium ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : 'text-foreground'}`}>{t(item.dayKey)}</span>
                <span className={`text-lg font-heading font-bold mt-1 ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.hours}
                </span>
              </div>
            ))}
          </div>

          <ContactSection variant="plain" />
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
