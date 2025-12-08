import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Marija Petrović',
    pet: 'Vlasnica psa Rex',
    rating: 5,
    text: 'Odličan tim profesionalaca! Moj pas Rex je imao hitnu operaciju i zahvaljujući brzoj reakciji i stručnosti veterinara, sve je prošlo savršeno. Toplo preporučujem!',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
  {
    id: 2,
    name: 'Nikola Jović',
    pet: 'Vlasnik mačke Mia',
    rating: 5,
    text: 'Već godinama vodim svoju mačku Miu u VetHealth i uvijek sam zadovoljan uslugom. Osoblje je ljubazno, a cijene fer. Pet Shop ima sve što mi treba.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  {
    id: 3,
    name: 'Ana Kovačević',
    pet: 'Vlasnica zeca Bubi',
    rating: 5,
    text: 'Teško je naći veterinara koji se razumije u male životinje, ali VetHealth ima stručnjake za sve vrste ljubimaca. Moj zec Bubi je u najboljim rukama!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            Iskustva Klijenata
          </span>
          <h2 className="text-h2 text-foreground">
            Šta Kažu Naši Klijenti
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-card shadow-card p-8 md:p-12">
            {/* Quote icon */}
            <div className="absolute top-6 right-6 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-primary" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Stars */}
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-lg text-foreground mb-6 italic">
                  "{currentTestimonial.text}"
                </p>

                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {currentTestimonial.name}
                  </p>
                  <p className="text-small text-muted-foreground">
                    {currentTestimonial.pet}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center md:justify-end gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
