import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PawPrint, Facebook, Instagram, Mail, Phone, MapPin, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const Footer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t('footer.newsletterSuccess'),
      description: t('footer.newsletterMessage'),
    });
    setEmail('');
  };

  const serviceLinks = [
    { name: t('services.generalExams'), href: '#services' },
    { name: t('services.vaccinations'), href: '#services' },
    { name: t('services.surgery'), href: '#services' },
    { name: t('services.laboratory'), href: '#services' },
    { name: t('services.dentistry'), href: '#services' },
  ];

  const companyLinks = [
    { name: t('footer.aboutUs'), href: '#about' },
    { name: t('footer.ourTeam'), href: '#about' },
    { name: t('footer.blogTips'), href: '#' },
    { name: t('footer.careers'), href: '#' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-background">VetHealth</span>
                <span className="text-xs text-primary -mt-1">.ba</span>
              </div>
            </Link>
            <p className="text-background/70 mb-6">{t('footer.brandDescription')}</p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-6">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <button onClick={() => scrollToSection(link.href)} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-6">{t('footer.companyTitle')}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <button onClick={() => scrollToSection(link.href)} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-6">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-background/70">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Ulica Primjer 123, Banjaluka</span>
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <Phone className="w-4 h-4 text-primary" />
                <span>+387 51 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@vethealth.ba</span>
              </li>
            </ul>

            <h5 className="font-medium text-background mb-3">{t('footer.newsletter')}</h5>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email" placeholder={t('footer.emailPlaceholder')} value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 rounded-input"
              />
              <Button type="submit" variant="accent" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-background/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-small text-background/50">
              © {new Date().getFullYear()} VetHealth.ba. {t('footer.copyright')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-small text-background/50 hover:text-primary transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="text-small text-background/50 hover:text-primary transition-colors">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
