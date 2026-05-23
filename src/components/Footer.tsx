import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PawPrint, Facebook, Instagram, Mail, Phone, MapPin
} from 'lucide-react';
import { useClinicSettings, telLink, mailLink, mapsLink } from '@/hooks/useClinicSettings';
import { FEATURES } from '@/config/features';

export const Footer = () => {
  const { t } = useTranslation();
  const { data: clinic } = useClinicSettings();

  const serviceLinks = [
    { name: t('services.generalExams'), to: '/services/opsti-pregledi' },
    { name: t('services.vaccinations'), to: '/services/vakcinacije' },
    { name: t('services.surgery'), to: '/services/operacije' },
    { name: t('services.laboratory'), to: '/services/laboratorija' },
    { name: t('services.dentistry'), to: '/services/stomatologija' },
  ];

  const companyLinks = [
    { key: 'home', name: t('nav.home'), to: '/' },
    { key: 'services', name: t('nav.services'), to: '/cjenovnik-usluga' },
    ...(FEATURES.publicBlog ? [{ key: 'blog', name: t('nav.blog'), to: '/blog' }] : []),
    ...(FEATURES.publicPetShop ? [{ key: 'petShop', name: t('nav.petShop'), to: '/pet-shop' }] : []),
    { key: 'about', name: t('nav.about'), to: '/about' },
    { key: 'contact', name: t('nav.contact'), to: '/contact' },
  ];

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
              {clinic?.social_facebook && (
                <a href={clinic.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {clinic?.social_instagram && (
                <a href={clinic.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-6">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
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
                  <Link to={link.to} className="text-background/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-6">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3">
              <li>
                <a href={mapsLink(clinic?.address)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{clinic?.address || 'Banja Luka'}</span>
                </a>
              </li>
              <li>
                <a href={telLink(clinic?.phone)} className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{clinic?.phone || '+387 51 123 456'}</span>
                </a>
              </li>
              <li>
                <a href={mailLink(clinic?.email)} className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{clinic?.email || 'info@vethealth.ba'}</span>
                </a>
              </li>
            </ul>
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
