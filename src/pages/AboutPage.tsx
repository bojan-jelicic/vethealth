import vetPhoto from '@/assets/photos/vet-buldog.jpg.asset.json';
import techPhoto from '@/assets/photos/tehnicar-pipeta.jpg.asset.json';
import bigl from '@/assets/photos/bigl-ulaz.jpg.asset.json';
import lab from '@/assets/photos/laboratorija.jpg.asset.json';
import { Award, Users, Heart, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';

const teamMembers = [
  { name: 'Vladimir Ilić, DVM', roleKey: 'aboutPage.vetRole', bioKeys: ['vetBio1', 'vetBio2', 'vetBio3', 'vetBio4'], image: vetPhoto.url, pos: 'object-[40%_center]' },
  { name: 'Nemanja Dragišić', roleKey: 'aboutPage.techRole', bioKeys: ['techBio1', 'techBio2', 'techBio3'], image: techPhoto.url, pos: 'object-[45%_25%]' },
];

const AboutPage = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Award, value: '15+', labelKey: 'aboutPage.storyTitle' },
    { icon: Users, value: '5000+', labelKey: 'about.happyClients' },
    { icon: Heart, value: '10000+', labelKey: 'about.treatedAnimals' },
  ];

  const valueKeys = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'feature6'];

  const workingHours = [
    { dayKey: 'aboutPage.monFri', hours: '09:00 - 19:00' },
    { dayKey: 'aboutPage.saturday', hours: '09:00 - 14:00' },
    { dayKey: 'aboutPage.sunday', hoursKey: 'aboutPage.closed' },
    { dayKey: 'aboutPage.emergencyCases', hours: '24/7' },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('aboutPage.seoTitle')}</title>
        <meta name="description" content={t('aboutPage.seoDescription')} />
      </Helmet>
      <PageHero title={t('aboutPage.title')} description={t('aboutPage.description')} />

      {/* Our Story */}
      <section className="pt-4 pb-16 md:pt-6 md:pb-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">{t('aboutPage.ourStory')}</span>
              <h2 className="text-h2 text-foreground mb-6">{t('aboutPage.storyTitle')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('about.description1')}</p>
                <p>{t('about.description2')}</p>
                <p>{t('aboutPage.storyP3')}</p>
                <p>{t('aboutPage.storyP4')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={bigl.url} alt="Bigl na ulazu u ambulantu" loading="lazy" className="rounded-card shadow-card w-full h-64 object-cover" />
              <img src={lab.url} alt="Laboratorijska analiza uzorka" loading="lazy" className="rounded-card shadow-card w-full h-64 object-cover mt-8" />
            </div>
          </div>

          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            {[
              { icon: Award, value: '2016', labelKey: 'about.founded' },
              { icon: Users, value: '5000+', labelKey: 'about.happyClients' },
              { icon: Heart, value: '10000+', labelKey: 'about.treatedAnimals' },
            ].map((stat) => (
              <div key={stat.labelKey} className="bg-card p-6 rounded-card shadow-card text-center">
                <stat.icon className="w-10 h-10 mx-auto text-primary mb-4" />
                <p className="text-h2 font-heading font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{t(stat.labelKey)}</p>
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
              <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">{t('aboutPage.missionVision')}</span>
              <h2 className="text-h2 text-foreground mb-6">{t('aboutPage.ourValues')}</h2>
              <p className="text-muted-foreground mb-8">{t('aboutPage.valuesDesc')}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {valueKeys.map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{t(`about.${key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-8 rounded-card shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-h3 text-foreground">{t('aboutPage.workingHours')}</h3>
              </div>
              <div className="space-y-4">
                {workingHours.map((item) => (
                  <div key={item.dayKey} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="font-medium text-foreground">{t(item.dayKey)}</span>
                    <span className={item.dayKey === 'aboutPage.emergencyCases' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                      {item.hoursKey ? t(item.hoursKey) : item.hours}
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
            <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">{t('aboutPage.ourTeamLabel')}</span>
            <h2 className="text-h2 text-foreground mb-4">{t('aboutPage.ourTeamTitle')}</h2>
            <p className="text-muted-foreground">{t('aboutPage.ourTeamDesc')}</p>
          </div>
          <div className="space-y-8 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-card rounded-card shadow-card overflow-hidden grid md:grid-cols-[280px_1fr]">
                <div className="aspect-square md:aspect-auto overflow-hidden">
                  <img src={member.image} alt={member.name} loading="lazy" className={`w-full h-full object-cover ${member.pos}`} />
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-h3 font-heading font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary text-small font-medium mb-4">{t(member.roleKey)}</p>
                  <div className="space-y-3 text-muted-foreground">
                    {member.bioKeys.map((k) => <p key={k}>{t(`aboutPage.${k}`)}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-h2 text-primary-foreground mb-4">{t('aboutPage.ctaTitle')}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t('aboutPage.ctaDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/cjenovnik-usluga">{t('aboutPage.viewServices')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
