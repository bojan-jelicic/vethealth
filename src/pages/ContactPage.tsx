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
    { dayKey: 'contactPage.emergencyCases', hours: '24/7', active: true },
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
          {/* Emergency Banner */}
          <div className="mb-12 bg-destructive/10 border border-destructive/20 rounded-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-lg">{t('contactPage.emergencyTitle')}</h3>
                  <p className="text-muted-foreground">{t('contactPage.emergencyDesc')}</p>
                </div>
              </div>
              <a href="tel:+38751999888" className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-button font-medium hover:bg-destructive/90 transition-colors md:ml-auto">
                <Phone className="w-5 h-5" />+387 51 999 888
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="mb-12 grid sm:grid-cols-4 gap-4">
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
