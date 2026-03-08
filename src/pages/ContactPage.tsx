import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Send, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';

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
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-hide success/error messages after 7 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => setSubmitError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = contactFormSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || undefined,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (error) {
        console.error('Error submitting form:', error);
        setSubmitError('Došlo je do greške pri slanju poruke. Molimo pokušajte ponovo.');
        return;
      }

      if (data?.error) {
        setSubmitError(data.error);
        return;
      }

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Network error:', error);
      setSubmitError('Trenutno nismo u mogućnosti da obradimo vaš zahtjev. Pokušajte ponovo kasnije.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Kontakt | VetHealth.ba - Veterinarska Ordinacija Banja Luka</title>
        <meta name="description" content="Kontaktirajte VetHealth.ba veterinarsku ordinaciju u Banjaluci. Adresa, telefon, radno vrijeme i kontakt forma. Hitna pomoć 24/7." />
      </Helmet>
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

          {/* Working Hours */}
          <div className="mb-12 grid sm:grid-cols-4 gap-4">
            {[
              { day: 'Ponedjeljak - Petak', hours: '08:00 - 20:00', active: true },
              { day: 'Subota', hours: '09:00 - 14:00', active: true },
              { day: 'Nedjelja', hours: 'Zatvoreno', active: false },
              { day: 'Hitni slučajevi', hours: '24/7', active: true },
            ].map((item) => (
              <div
                key={item.day}
                className={`flex flex-col items-center p-5 rounded-card text-center ${
                  item.day === 'Hitni slučajevi'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card shadow-card'
                }`}
              >
                <Clock className={`w-5 h-5 mb-2 ${
                  item.day === 'Hitni slučajevi' ? 'text-primary-foreground' : 'text-primary'
                }`} />
                <span className={`text-small font-medium ${
                  item.day === 'Hitni slučajevi' ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {item.day}
                </span>
                <span className={`text-lg font-heading font-bold mt-1 ${
                  item.day === 'Hitni slučajevi'
                    ? 'text-primary-foreground'
                    : item.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {item.hours}
                </span>
              </div>
            ))}
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

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Vaša poruka je uspješno poslata!
                      </p>
                      <p className="text-small text-muted-foreground">
                        Odgovorićemo vam u najkraćem mogućem roku.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Greška pri slanju
                      </p>
                      <p className="text-small text-muted-foreground">
                        {submitError}
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitError(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-small font-medium text-foreground">
                        Ime i Prezime *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Vaše ime i prezime"
                        value={formData.name}
                        onChange={handleChange}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-small text-destructive">
                          {errors.name}
                        </p>
                      )}
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
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-small text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-small font-medium text-foreground">
                        Telefon <span className="text-muted-foreground">(opcionalno)</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+387 XX XXX XXX"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-small text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-small font-medium text-foreground">
                        Predmet Poruke *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Npr. Zakazivanje pregleda"
                        value={formData.subject}
                        onChange={handleChange}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={errors.subject ? 'border-destructive' : ''}
                      />
                      {errors.subject && (
                        <p id="subject-error" className="text-small text-destructive">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-small font-medium text-foreground">
                      Vaša Poruka * <span className="text-muted-foreground">(max 500 karaktera)</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Opišite vaše pitanje ili zakažite termin..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`resize-none ${errors.message ? 'border-destructive' : ''}`}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    <div className="flex justify-between items-center">
                      {errors.message ? (
                        <p id="message-error" className="text-small text-destructive">
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-small ${
                        formData.message.length > 500 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                      }`}>
                        {formData.message.length}/500
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Šaljem poruku...
                      </>
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
