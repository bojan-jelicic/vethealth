import heroPhoto from '@/assets/photos/vet-spaniel-hero.jpg.asset.json';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { List, Heart, Shield, Clock, MapPin } from 'lucide-react';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative pt-28 md:pt-40 lg:pt-48 pb-16 md:pb-20 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Decorative blurs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Mobile/tablet photo */}
            <div className="relative lg:hidden animate-fade-in-up">
              <div className="h-64 md:h-[360px] rounded-card overflow-hidden shadow-card ring-4 ring-card">
                <img
                  src={heroPhoto.url}
                  alt="Veterinar Vladimir Ilić pregleda koker španijela"
                  className="w-full h-full object-cover object-[45%_center]"
                  loading="eager"
                />
              </div>
              <div className="absolute left-3 bottom-3 bg-card/95 px-3 py-2 rounded-card shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{t('hero.certified')}</p>
                    <p className="text-xs text-muted-foreground">{t('hero.veterinarians')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-small font-medium animate-fade-in-up">
              <Heart className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-h1 font-heading font-bold text-foreground leading-tight animate-fade-in-up delay-100">
              {t('hero.title1')}{' '}
              <span className="text-primary">{t('hero.titleHighlight')}</span>{' '}
              {t('hero.title2')}
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up delay-200">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/cjenovnik-usluga">
                  <List className="w-5 h-5" />
                  {t('hero.ctaPrimary')}
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 max-w-md animate-fade-in-up delay-400">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">15+</span>
                <span className="text-xs sm:text-small text-muted-foreground">{t('hero.yearsExp')}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">5000+</span>
                <span className="text-xs sm:text-small text-muted-foreground">{t('hero.happyPets')}</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">2016.</span>
                <span className="text-xs sm:text-small text-muted-foreground">{t('hero.sameAddress')}</span>
              </div>
            </div>
          </div>

          {/* Circular pet image */}
          <div className="relative hidden lg:flex justify-center animate-fade-in-up delay-200">
            <div className="relative w-[480px] h-[480px] xl:w-[520px] xl:h-[520px]">
              <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
              <div className="absolute inset-3 rounded-full border-[2px] border-accent/15" />
              <div className="absolute inset-6 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full animate-pulse-gentle" />
              <div className="absolute inset-10 rounded-full overflow-hidden shadow-2xl ring-4 ring-card">
                <img
                  src={heroPhoto.url}
                  alt="Veterinar Vladimir Ilić pregleda koker španijela"
                  className="w-full h-full object-cover object-[45%_center]"
                  loading="eager"
                />
              </div>

              <div className="absolute -left-6 top-1/4 bg-card p-4 rounded-card shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-foreground">{t('hero.certified')}</p>
                    <p className="text-xs text-muted-foreground">{t('hero.veterinarians')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-1/4 bg-card p-4 rounded-card shadow-card animate-float delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-foreground">99%</p>
                    <p className="text-xs text-muted-foreground">{t('hero.satisfaction')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
