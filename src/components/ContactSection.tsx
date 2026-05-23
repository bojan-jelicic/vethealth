import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { useClinicSettings, telLink, mailLink, mapsLink } from '@/hooks/useClinicSettings';

interface ContactSectionProps {
  variant?: 'section' | 'plain';
}

export const ContactSection = ({ variant = 'plain' }: ContactSectionProps) => {
  const { t } = useTranslation();
  const { data: clinic } = useClinicSettings();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (submitSuccess) { const t = setTimeout(() => setSubmitSuccess(false), 7000); return () => clearTimeout(t); }
  }, [submitSuccess]);
  useEffect(() => {
    if (submitError) { const t = setTimeout(() => setSubmitError(null), 7000); return () => clearTimeout(t); }
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
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || undefined,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
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

  const phoneVal = clinic?.phone || '+387 51 123 456';
  const emailVal = clinic?.email || 'info@vethealth.ba';
  const addressVal = clinic?.address || 'Banja Luka, Bosna i Hercegovina';
  const wh = clinic?.working_hours;
  const workingHoursText = wh ? `Pon-Pet: ${wh.pon_pet || ''}, Sub: ${wh.sub || ''}` : t('contact.workingHoursContent');

  const contactInfo = [
    { icon: MapPin, titleKey: 'contact.address', content: addressVal, link: mapsLink(addressVal) },
    { icon: Phone, titleKey: 'contact.phone', content: phoneVal, link: telLink(phoneVal) },
    { icon: Mail, titleKey: 'contact.email', content: emailVal, link: mailLink(emailVal) },
    { icon: Clock, titleKey: 'contact.workingHours', content: workingHoursText },
  ];

  const grid = (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Contact Info */}
      <div className="lg:col-span-2 space-y-6">
        {contactInfo.map((item) => {
          const Card = (
            <div className="flex items-start gap-4 p-4 bg-card rounded-card shadow-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-medium text-foreground mb-1">{t(item.titleKey)}</h4>
                <p className="text-muted-foreground break-words">{item.content}</p>
              </div>
            </div>
          );
          return item.link && item.link !== '#' ? (
            <a key={item.titleKey} href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">{Card}</a>
          ) : (
            <div key={item.titleKey}>{Card}</div>
          );
        })}
      </div>

      {/* Form */}
      <div className="lg:col-span-3">
        <div className="bg-card p-6 md:p-8 rounded-card shadow-card">
          <h3 className="text-h3 text-foreground mb-2">{t('contactPage.sendMessageTitle')}</h3>
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
                <label htmlFor="cs-name" className="text-small font-medium text-foreground">{t('contactPage.nameLabel')} *</label>
                <Input id="cs-name" name="name" placeholder={t('contactPage.namePlaceholder')} value={formData.name} onChange={handleChange} className={errors.name ? 'border-destructive' : ''} />
                {errors.name && <p className="text-small text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="cs-email" className="text-small font-medium text-foreground">{t('contactPage.emailLabel')} *</label>
                <Input id="cs-email" name="email" type="email" placeholder="vas@email.com" value={formData.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-small text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cs-phone" className="text-small font-medium text-foreground">{t('contactPage.phoneLabel')} <span className="text-muted-foreground">{t('contactPage.phoneOptional')}</span></label>
                <Input id="cs-phone" name="phone" type="tel" placeholder="+387 XX XXX XXX" value={formData.phone} onChange={handleChange} className={errors.phone ? 'border-destructive' : ''} />
                {errors.phone && <p className="text-small text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="cs-subject" className="text-small font-medium text-foreground">{t('contactPage.subjectLabel')} *</label>
                <Input id="cs-subject" name="subject" placeholder={t('contactPage.subjectPlaceholder')} value={formData.subject} onChange={handleChange} className={errors.subject ? 'border-destructive' : ''} />
                {errors.subject && <p className="text-small text-destructive">{errors.subject}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cs-message" className="text-small font-medium text-foreground">{t('contactPage.messageLabel')} * <span className="text-muted-foreground">{t('contactPage.messageMax')}</span></label>
              <Textarea id="cs-message" name="message" placeholder={t('contactPage.messagePlaceholder')} value={formData.message} onChange={handleChange} rows={6} className={`resize-none ${errors.message ? 'border-destructive' : ''}`} />
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
  );

  if (variant === 'plain') return grid;

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">{t('contact.label')}</span>
          <h2 className="text-h2 text-foreground mb-4">{t('contact.title')}</h2>
          <p className="text-muted-foreground">{t('contact.description')}</p>
        </div>
        {grid}
      </div>
    </section>
  );
};