import { Button } from '@/components/ui/button';
import { Calendar, Heart, Shield, Clock } from 'lucide-react';

export const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-small font-medium animate-fade-in-up">
              <Heart className="w-4 h-4" />
              <span>Brižna njega za vaše ljubimce</span>
            </div>

            <h1 className="text-h1 text-foreground animate-fade-in-up delay-100">
              Vaš Partner U{' '}
              <span className="text-primary">Zdravlju</span>{' '}
              Kućnih Ljubimaca
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in-up delay-200">
              VetHealth.ba pruža stručnu veterinarsku njegu u Banjaluci. 
              Od preventivnih pregleda do hitnih intervencija – tu smo za vas i vaše ljubimce 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <Button
                variant="hero"
                size="xl"
                onClick={() => scrollToSection('#contact')}
              >
                <Calendar className="w-5 h-5" />
                Zakaži Termin
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => scrollToSection('#services')}
              >
                Naše Usluge
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-up delay-400">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-h4 font-heading font-bold text-foreground">15+</span>
                <span className="text-small text-muted-foreground">Godina Iskustva</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <span className="text-h4 font-heading font-bold text-foreground">5000+</span>
                <span className="text-small text-muted-foreground">Sretnih Ljubimaca</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <span className="text-h4 font-heading font-bold text-foreground">24/7</span>
                <span className="text-small text-muted-foreground">Hitna Pomoć</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block animate-fade-in-up delay-200">
            <div className="relative w-full aspect-square">
              {/* Decorative circles */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse-gentle" />
              <div className="absolute inset-4 bg-gradient-to-tr from-primary/30 to-transparent rounded-full" />
              
              {/* Main image container */}
              <div className="absolute inset-8 rounded-full overflow-hidden border-4 border-card shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop"
                  alt="Srećan pas u veterinarskoj ordinaciji"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 bg-card p-4 rounded-card shadow-card animate-float">
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

              <div className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-card shadow-card animate-float delay-500">
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
