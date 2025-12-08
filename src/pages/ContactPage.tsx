import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresa',
    content: 'Ulica Primjer 123, 78000 Banjaluka',
    link: 'https://maps.google.com',
  },
  {
    icon: Phone,
    title: 'Telefon',
    content: '+387 51 123 456',
    link: 'tel:+38751123456',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@vethealth.ba',
    link: 'mailto:info@vethealth.ba',
  },
  {
    icon: Clock,
    title: 'Radno Vrijeme',
    content: 'Pon-Pet: 08-20h, Sub: 09-14h',
  },
];

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      title: 'Poruka uspješno poslana!',
      description: 'Hvala vam na poruci. Javit ćemo vam se uskoro.',
    });

    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <PageHero
        title="Kontaktirajte Nas"
        description="Imate pitanja ili želite zakazati termin? Javite nam se - tu smo za vas i vaše ljubimce."
        breadcrumbs={[{ label: 'Kontakt' }]}
      />

      <section className="section-padding">
        <div className="container-custom">
          {/* Emergency Banner */}
          <div className="mb-12 bg-destructive/10 border border-destructive/20 rounded-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-lg">
                    Hitna Veterinarska Pomoć
                  </h3>
                  <p className="text-muted-foreground">
                    Za hitne slučajeve van radnog vremena
                  </p>
                </div>
              </div>
              <a
                href="tel:+38751999888"
                className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-button font-medium hover:bg-destructive/90 transition-colors md:ml-auto"
              >
                <Phone className="w-5 h-5" />
                +387 51 999 888
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-h3 text-foreground">Kontakt Informacije</h2>
              
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
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Map */}
              <div className="aspect-video bg-muted rounded-card overflow-hidden shadow-card">
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
            <div className="lg:col-span-2">
              <div className="bg-card p-6 md:p-8 rounded-card shadow-card">
                <h2 className="text-h3 text-foreground mb-2">
                  Pošaljite Nam Poruku
                </h2>
                <p className="text-muted-foreground mb-8">
                  Popunite formu ispod i odgovorit ćemo vam u najkraćem mogućem roku.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-small font-medium text-foreground">
                        Tema *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Npr. Zakazivanje termina"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
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
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto"
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
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
