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
                  <img src="https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400&h=500&fit=crop" alt="Veterinar sa psom" className="w-full h-64 object-cover" />
                </div>
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop" alt="Mačka na pregledu" className="w-full h-48 object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=300&fit=crop" alt="Veterinarska oprema" className="w-full h-48 object-cover" />
                </div>
                <div className="rounded-card overflow-hidden shadow-card">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop" alt="Tim veterinara" className="w-full h-64 object-cover" />
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
