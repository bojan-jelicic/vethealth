import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useClinicSettings, telLink, mailLink, mapsLink } from '@/hooks/useClinicSettings';

export const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: clinic } = useClinicSettings();
  const wh = clinic?.working_hours;
  const workingHoursText = wh
    ? `Pon-Pet: ${wh.pon_pet || ''}, Sub: ${wh.sub || ''}`
    : t('contact.workingHoursContent');

  const contactInfo = [
    { icon: MapPin, titleKey: 'contact.address', content: clinic?.address || 'Banja Luka', link: mapsLink(clinic?.address) },
    { icon: Phone, titleKey: 'contact.phone', content: clinic?.phone || '+387 51 123 456', link: telLink(clinic?.phone) },
    { icon: Mail, titleKey: 'contact.email', content: clinic?.email || 'info@vethealth.ba', link: mailLink(clinic?.email) },
    { icon: Clock, titleKey: 'contact.workingHours', content: workingHoursText },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: t('contact.successTitle'),
      description: t('contact.successMessage'),
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-medium text-small uppercase tracking-wider mb-4">
            {t('contact.label')}
          </span>
          <h2 className="text-h2 text-foreground mb-4">{t('contact.title')}</h2>
          <p className="text-muted-foreground">{t('contact.description')}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            {contactInfo.map((item) => {
              const CardContent = (
                <div className="flex items-start gap-4 p-4 bg-card rounded-card shadow-card group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-1">
                    <h4 className="font-heading font-medium text-foreground mb-1">{t(item.titleKey)}</h4>
                    <p className="text-muted-foreground">{item.content}</p>
                  </div>
                  {item.link && item.link !== '#' && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                  )}
                </div>
              );
              return item.link && item.link !== '#' ? (
                <a key={item.titleKey} href={item.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                  {CardContent}
                </a>
              ) : (
                <div key={item.titleKey}>{CardContent}</div>
              );
            })}
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-card shadow-card space-y-6">
              <h3 className="text-h3 text-foreground mb-2">{t('contact.sendMessage')}</h3>
              <p className="text-muted-foreground mb-6">{t('contact.formDescription')}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-small font-medium text-foreground">{t('contact.nameLabel')} *</label>
                  <Input id="name" name="name" placeholder={t('contact.namePlaceholder')} value={formData.name} onChange={handleChange} required className="rounded-input" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-small font-medium text-foreground">{t('contact.emailLabel')} *</label>
                  <Input id="email" name="email" type="email" placeholder={t('contact.emailPlaceholder')} value={formData.email} onChange={handleChange} required className="rounded-input" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-small font-medium text-foreground">{t('contact.phoneLabel')}</label>
                <Input id="phone" name="phone" type="tel" placeholder={t('contact.phonePlaceholder')} value={formData.phone} onChange={handleChange} className="rounded-input" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-small font-medium text-foreground">{t('contact.messageLabel')} *</label>
                <Textarea id="message" name="message" placeholder={t('contact.messagePlaceholder')} value={formData.message} onChange={handleChange} required rows={5} className="rounded-input resize-none" />
              </div>

              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('contact.sending') : (
                  <><Send className="w-4 h-4" />{t('contact.send')}</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
