import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useClinicSettings, telLink, mailLink } from '@/hooks/useClinicSettings';

const ContactPage = () => {
  const { t } = useTranslation();
  const { data: clinic } = useClinicSettings();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (submitSuccess) { const timer = setTimeout(() => setSubmitSuccess(false), 7000); return () => clearTimeout(timer); }
  }, [submitSuccess]);

  useEffect(() => {
    if (submitError) { const timer = setTimeout(() => setSubmitError(null), 7000); return () => clearTimeout(timer); }
  }, [submitError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => { newErrors[err.path[0] as keyof ContactFormData] = err.message; });
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
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: { name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone?.trim() || undefined, subject: formData.subject.trim(), message: formData.message.trim() },
      });
      if (error) { setSubmitError(t('contactPage.genericError')); return; }
      if (data?.error) { setSubmitError(data.error); return; }
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setSubmitError(t('contactPage.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, titleKey: 'contact.address', content: 'Ulica Primjer 123, 78000 Banjaluka', link: 'https://maps.google.com' },
    { icon: Phone, titleKey: 'contact.phone', content: '+387 51 123 456', link: 'tel:+38751123456' },
    { icon: Mail, titleKey: 'contact.email', content: 'info@vethealth.ba', link: 'mailto:info@vethealth.ba' },
    { icon: Clock, titleKey: 'contact.workingHours', contentKey: 'contact.workingHoursContent' },
  ];

  const workingHoursList = [
    { dayKey: 'contactPage.monFri', hours: '08:00 - 20:00', active: true },
    { dayKey: 'contactPage.saturday', hours: '09:00 - 14:00', active: true },
    { dayKey: 'contactPage.sunday', hoursKey: 'contactPage.closed', active: false },
    { dayKey: 'contactPage.emergencyCases', hours: '24/7', active: true },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t('contactPage.seoTitle')}</title>
        <meta name="description" content={t('contactPage.seoDescription')} />
      </Helmet>
      <PageHero title={t('contactPage.title')} description={t('contactPage.description')} breadcrumbs={[{ label: t('nav.contact') }]} />

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
                  <h3 className="font-heading font-semibold text-foreground text-lg">{t('contactPage.emergencyTitle')}</h3>
                  <p className="text-muted-foreground">{t('contactPage.emergencyDesc')}</p>
                </div>
              </div>
              <a href="tel:+38751999888" className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-button font-medium hover:bg-destructive/90 transition-colors md:ml-auto">
                <Phone className="w-5 h-5" />+387 51 999 888
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="mb-12 grid sm:grid-cols-4 gap-4">
            {workingHoursList.map((item) => (
              <div key={item.dayKey} className={`flex flex-col items-center p-5 rounded-card text-center ${item.dayKey === 'contactPage.emergencyCases' ? 'bg-primary text-primary-foreground' : 'bg-card shadow-card'}`}>
                <Clock className={`w-5 h-5 mb-2 ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : 'text-primary'}`} />
                <span className={`text-small font-medium ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : 'text-foreground'}`}>{t(item.dayKey)}</span>
                <span className={`text-lg font-heading font-bold mt-1 ${item.dayKey === 'contactPage.emergencyCases' ? 'text-primary-foreground' : item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.hoursKey ? t(item.hoursKey) : item.hours}
                </span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-h3 text-foreground">{t('contactPage.contactInfo')}</h2>
              {contactInfo.map((item) => (
                <div key={item.titleKey} className="flex items-start gap-4 p-4 bg-card rounded-card shadow-card">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-medium text-foreground mb-1">{t(item.titleKey)}</h4>
                    {item.link ? (
                      <a href={item.link} className="text-muted-foreground hover:text-primary transition-colors">{item.content}</a>
                    ) : (
                      <p className="text-muted-foreground">{item.contentKey ? t(item.contentKey) : item.content}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="aspect-video bg-muted rounded-card overflow-hidden shadow-card">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d45632.95066427!2d17.1514!3d44.7758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475e03aba2e36c73%3A0x1a9611c11fb24e25!2sBanja%20Luka!5e0!3m2!1sen!2sba!4v1700000000000!5m2!1sen!2sba"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Lokacija VetHealth.ba"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card p-6 md:p-8 rounded-card shadow-card">
                <h2 className="text-h3 text-foreground mb-2">{t('contactPage.sendMessageTitle')}</h2>
                <p className="text-muted-foreground mb-8">{t('contactPage.sendMessageDesc')}</p>

                {submitSuccess && (
                  <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t('contactPage.successTitle')}</p>
                      <p className="text-small text-muted-foreground">{t('contactPage.successDesc')}</p>
                    </div>
                    <button onClick={() => setSubmitSuccess(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{t('contactPage.errorTitle')}</p>
                      <p className="text-small text-muted-foreground">{submitError}</p>
                    </div>
                    <button onClick={() => setSubmitError(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-small font-medium text-foreground">{t('contactPage.nameLabel')} *</label>
                      <Input id="name" name="name" placeholder={t('contactPage.namePlaceholder')} value={formData.name} onChange={handleChange}
                        className={errors.name ? 'border-destructive' : ''} aria-describedby={errors.name ? 'name-error' : undefined} />
                      {errors.name && <p id="name-error" className="text-small text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-small font-medium text-foreground">{t('contactPage.emailLabel')} *</label>
                      <Input id="email" name="email" type="email" placeholder="vas@email.com" value={formData.email} onChange={handleChange}
                        className={errors.email ? 'border-destructive' : ''} aria-describedby={errors.email ? 'email-error' : undefined} />
                      {errors.email && <p id="email-error" className="text-small text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-small font-medium text-foreground">{t('contactPage.phoneLabel')} <span className="text-muted-foreground">{t('contactPage.phoneOptional')}</span></label>
                      <Input id="phone" name="phone" type="tel" placeholder="+387 XX XXX XXX" value={formData.phone} onChange={handleChange}
                        className={errors.phone ? 'border-destructive' : ''} />
                      {errors.phone && <p className="text-small text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-small font-medium text-foreground">{t('contactPage.subjectLabel')} *</label>
                      <Input id="subject" name="subject" placeholder={t('contactPage.subjectPlaceholder')} value={formData.subject} onChange={handleChange}
                        className={errors.subject ? 'border-destructive' : ''} />
                      {errors.subject && <p className="text-small text-destructive">{errors.subject}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-small font-medium text-foreground">{t('contactPage.messageLabel')} * <span className="text-muted-foreground">{t('contactPage.messageMax')}</span></label>
                    <Textarea id="message" name="message" placeholder={t('contactPage.messagePlaceholder')} value={formData.message} onChange={handleChange}
                      rows={6} className={`resize-none ${errors.message ? 'border-destructive' : ''}`} />
                    <div className="flex justify-between items-center">
                      {errors.message ? <p className="text-small text-destructive">{errors.message}</p> : <span />}
                      <span className={`text-small ${formData.message.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>{formData.message.length}/500</span>
                    </div>
                  </div>

                  <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />{t('contactPage.sending')}</>) : (<><Send className="w-4 h-4" />{t('contactPage.send')}</>)}
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
