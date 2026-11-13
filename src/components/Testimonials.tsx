import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Ivana Mitrović Nešić',
    rating: 5,
    text: 'Ova klinika je godinama posvećena brizi o mom psu, koji je doživeo 18 godina sa ozbiljnim zdravstvenim stanjem. Kada mu je život bio u opasnosti zbog povreda od drugih pasa, vratili su ga u život veoma zahtevnom operacijom i oporavili ga kako bi mogao da nastavi da živi veoma srećan i kvalitetan život još 6 godina. Do poslednjeg dana činili su sve što su mogli da mu ublaže bol i omoguće mu normalno kretanje. Hvala od srca celom timu i hvala vam u ime svih šapa Banje Luke što postojite!',
  },
  {
    id: 2,
    name: 'Borjana Tešnović',
    rating: 5,
    text: 'Sve preporuke za VetHealth i doktora Vladu. Izuzetno stručan, posvećen i pažljiv pristup. Osjeti se koliko voli životinje i koliko mu je stalo do svakog pacijenta. Hvala na brizi, trudu i profesionalnosti — rijetko se sreće ovakav odnos!',
  },
  {
    id: 3,
    name: 'Sanja Rodić',
    rating: 5,
    text: 'Odgovaraju na poruke, šalju glasovne poruke brzinom munje, uvek su dostupni svima i milion puta su spasili moje životinje.',
  },
  {
    id: 4,
    name: 'Slavica Kejsy Božić',
    rating: 5,
    text: 'Kada neko voli svoj posao i radi ga sa puno ljubavi, onda su vaši ljubimci u odličnim rukama. Zaista odlični, profesionalni, ljubazni i posvećeni svom poslu...',
  },
];

const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const Testimonials = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            {t('testimonials.label')}
          </span>
          <h2 className="text-h2 text-foreground">{t('testimonials.title')}</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-card shadow-card p-8 md:p-12">
            <div className="absolute top-6 right-6 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-primary" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-heading font-bold text-primary">{initials(current.name)}</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-base md:text-lg text-foreground mb-6 italic">"{current.text}"</p>
                <div>
                  <p className="font-heading font-semibold text-foreground">{current.name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end gap-2 mt-8">
              <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-6' : 'bg-border hover:bg-muted-foreground'
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
