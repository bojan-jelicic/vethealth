import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    { icon: MapPin, titleKey: 'contact.address', content: 'Ulica Primjer 123, 78000 Banjaluka' },
    { icon: Phone, titleKey: 'contact.phone', content: '+387 51 123 456' },
    { icon: Mail, titleKey: 'contact.email', content: 'info@vethealth.ba' },
    { icon: Clock, titleKey: 'contact.workingHours', contentKey: 'contact.workingHoursContent' },
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
            {contactInfo.map((item) => (
              <div key={item.titleKey} className="flex items-start gap-4 p-4 bg-card rounded-card shadow-card">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-medium text-foreground mb-1">{t(item.titleKey)}</h4>
                  <p className="text-muted-foreground">{item.contentKey ? t(item.contentKey) : item.content}</p>
                </div>
              </div>
            ))}

            <div className="aspect-video bg-muted rounded-card overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d45632.95066427!2d17.1514!3d44.7758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475e03aba2e36c73%3A0x1a9611c11fb24e25!2sBanja%20Luka!5e0!3m2!1sen!2sba!4v1700000000000!5m2!1sen!2sba"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Lokacija VetHealth.ba"
              />
            </div>
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
