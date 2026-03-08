import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Shield, Clock } from 'lucide-react';

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
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
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-small font-medium animate-fade-in-up">
              <Heart className="w-4 h-4" />
              <span>Brižna njega za vaše ljubimce</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-h1 font-heading font-bold text-foreground leading-tight animate-fade-in-up delay-100">
              Vaš Partner U{' '}
              <span className="text-primary">Zdravlju</span>{' '}
              Kućnih Ljubimaca
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up delay-200">
              VetHealth.ba pruža stručnu veterinarsku njegu u Banjaluci.
              Od preventivnih pregleda do hitnih intervencija – tu smo za vas i vaše ljubimce 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/zakazivanje-termina">
                  <Calendar className="w-5 h-5" />
                  Zakaži Termin
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/services">
                  Naše Usluge
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 animate-fade-in-up delay-400">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">15+</span>
                <span className="text-xs sm:text-small text-muted-foreground">Godina Iskustva</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">5000+</span>
                <span className="text-xs sm:text-small text-muted-foreground">Sretnih Ljubimaca</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <span className="text-lg sm:text-h4 font-heading font-bold text-foreground">24/7</span>
                <span className="text-xs sm:text-small text-muted-foreground">Hitna Pomoć</span>
              </div>
            </div>
          </div>

          {/* Circular pet image with ring & floating cards */}
          <div className="relative hidden lg:flex justify-center animate-fade-in-up delay-200">
            <div className="relative w-[480px] h-[480px] xl:w-[520px] xl:h-[520px]">
              {/* Soft outer ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
              <div className="absolute inset-3 rounded-full border-[2px] border-accent/15" />

              {/* Gradient glow behind */}
              <div className="absolute inset-6 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full animate-pulse-gentle" />

              {/* Main image */}
              <div className="absolute inset-10 rounded-full overflow-hidden shadow-2xl ring-4 ring-card">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop"
                  alt="Srećan pas u veterinarskoj ordinaciji"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Floating card - top left */}
              <div className="absolute -left-6 top-1/4 bg-card p-4 rounded-card shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-foreground">Certificirani</p>
                    <p className="text-xs text-muted-foreground">Veterinari</p>
                  </div>
                </div>
              </div>

              {/* Floating card - bottom right */}
              <div className="absolute -right-6 bottom-1/4 bg-card p-4 rounded-card shadow-card animate-float delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-foreground">99%</p>
                    <p className="text-xs text-muted-foreground">Zadovoljnih Klijenata</p>
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
