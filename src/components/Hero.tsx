import heroPhoto from '@/assets/photos/vet-spaniel-hero.jpg.asset.json';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { List, Heart, Shield, MapPin } from 'lucide-react';
import { useClinicSettings, mapsLink } from '@/hooks/useClinicSettings';

export const Hero = () => {
  const { t } = useTranslation();
  const { data: c } = useClinicSettings();

  return (
    <section
      id="home"
      className="relative pt-[450px] sm:pt-[500px] md:pt-[608px] lg:pt-48 pb-12 md:pb-20 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-background lg:bg-transparent lg:bg-gradient-to-br lg:from-primary/5 lg:via-background lg:to-accent/5" />

      {/* Mobile/tablet photo on top, fading into a dark panel */}
      <div className="absolute inset-x-0 bottom-0 top-[124px] md:top-[148px] lg:hidden bg-background" aria-hidden="true">
        <div className="relative h-[448px] sm:h-[508px] md:h-[592px]">
          <img
            src={heroPhoto.url}
            alt=""
            className="w-full h-full object-cover object-[47%_20%]"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 7%, hsl(var(--background) / 0) 18%, hsl(var(--background) / 0) 45%, hsl(var(--background) / 0.75) 75%, hsl(var(--background)) 100%)' }}
          />
        </div>
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl hidden lg:block" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl hidden lg:block" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="hidden lg:inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-small font-medium animate-fade-in-up">
              <Heart className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="max-lg:!mt-0 text-4xl md:text-5xl lg:text-h1 font-heading font-bold text-foreground leading-tight animate-fade-in-up delay-100">
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
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-8 max-w-xs animate-fade-in-up delay-400">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">10</span>
                <span className="text-xs sm:text-small text-muted-foreground">{t('hero.yearsExp')}</span>
              </div>
              <a
                href={mapsLink(c?.address || 'VEThealth Banja Luka')}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">2016.</span>
                <span className="text-xs sm:text-small text-muted-foreground underline-offset-4 group-hover:underline">{t('hero.sameAddress')}</span>
              </a>
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

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
