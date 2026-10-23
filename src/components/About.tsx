import bigl from '@/assets/photos/bigl-ulaz.jpg.asset.json';
import petri from '@/assets/photos/petrijeve-posude.jpg.asset.json';
import lab from '@/assets/photos/laboratorija.jpg.asset.json';
import spaniel from '@/assets/photos/spaniel-pregled.jpg.asset.json';
import { useTranslation } from 'react-i18next';
import { Award, Users, Heart, CheckCircle } from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Award, value: '2016', labelKey: 'about.founded' },
    { icon: Users, value: '5000+', labelKey: 'about.happyClients' },
    { icon: Heart, value: '10000+', labelKey: 'about.treatedAnimals' },
  ];

  const featureKeys = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'feature6'];

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src={bigl.url} alt="Bigl na ulazu u ambulantu" loading="lazy" className="w-full h-64 object-cover object-[35%_center]" />
                </div>
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src={petri.url} alt="Mikrobiološka analiza na petrijevim posudama" loading="lazy" className="w-full h-48 object-cover object-center" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src={lab.url} alt="Laboratorijska analiza uzorka" loading="lazy" className="w-full h-48 object-cover object-center" />
                </div>
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src={spaniel.url} alt="Pregled ušiju koker španijela" loading="lazy" className="w-full h-64 object-cover object-[40%_center]" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-card p-6 rounded-card shadow-lg w-[90%] max-w-sm">
              <div className="grid grid-cols-3 divide-x divide-border">
                {stats.map((stat) => (
                  <div key={stat.labelKey} className="text-center px-2">
                    <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-h4 font-heading font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{t(stat.labelKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
              {t('about.label')}
            </span>
            <h2 className="text-h2 text-foreground mb-6">{t('about.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('about.description1')}</p>
            <p className="text-muted-foreground mb-8">{t('about.description2')}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {featureKeys.map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{t(`about.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
