import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresa',
    content: 'Ulica Primjer 123, 78000 Banjaluka',
  },
  {
    icon: Phone,
    title: 'Telefon',
    content: '+387 51 123 456',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@vethealth.ba',
  },
  {
    icon: Clock,
    title: 'Radno Vrijeme',
    content: 'Pon-Pet: 08-20h, Sub: 09-14h',
  },
];

export const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Poruka poslana!',
      description: 'Hvala vam na poruci. Javit ćemo vam se uskoro.',
    });

    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            Kontakt
          </span>
          <h2 className="text-h2 text-foreground mb-4">
            Javite Nam Se
          </h2>
          <p className="text-muted-foreground">
            Imate pitanja ili želite zakazati termin? Kontaktirajte nas putem 
            forme ili nas direktno nazovite.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 bg-card rounded-card shadow-card"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-medium text-foreground mb-1">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground">{item.content}</p>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="aspect-video bg-muted rounded-card overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d45632.95066427!2d17.1514!3d44.7758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475e03aba2e36c73%3A0x1a9611c11fb24e25!2sBanja%20Luka!5e0!3m2!1sen!2sba!4v1700000000000!5m2!1sen!2sba"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokacija VetHealth.ba"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-card p-6 md:p-8 rounded-card shadow-card space-y-6"
            >
              <h3 className="text-h3 text-foreground mb-2">
                Pošaljite Poruku
              </h3>
              <p className="text-muted-foreground mb-6">
                Popunite formu ispod i javit ćemo vam se u najkraćem roku.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-small font-medium text-foreground">
                    Ime i Prezime *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Vaše ime"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-input"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-small font-medium text-foreground">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="vas@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-small font-medium text-foreground">
                  Telefon
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+387 XX XXX XXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-small font-medium text-foreground">
                  Poruka *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Opišite vaše pitanje ili zakažite termin..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="rounded-input resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Šaljem...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Pošalji Poruku
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
