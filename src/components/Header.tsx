import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Phone, Calendar } from 'lucide-react';
import vethealthLogo from '@/assets/vethealth-logo.png';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FEATURES } from '@/config/features';
import { useClinicSettings, telLink } from '@/hooks/useClinicSettings';

const allNavLinks = [
  { key: 'home', href: '/', flag: null },
  { key: 'services', href: '/cjenovnik-usluga', flag: null },
  { key: 'blog', href: '/blog', flag: 'publicBlog' as const },
  { key: 'petShop', href: '/pet-shop', flag: 'publicPetShop' as const },
  { key: 'about', href: '/about', flag: null },
  { key: 'contact', href: '/contact', flag: null },
];

const navLinks = allNavLinks.filter((l) => !l.flag || FEATURES[l.flag]);

export const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: clinic } = useClinicSettings();
  const phone = clinic?.phone || '+387 51 123 456';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-card/95 backdrop-blur-md shadow-card'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 md:h-20 pt-2 md:pt-0">
          {/* Logo */}
          <Link to="/" className="group">
            <img
              src={vethealthLogo}
              alt="VetHealth.ba - Veterinarska Ordinacija"
              className="h-16 md:h-[72px] w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className={`font-medium py-1 transition-colors link-underline ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={telLink(phone)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-small">{phone}</span>
            </a>
            <LanguageSwitcher />
            {FEATURES.themeToggle && <ThemeToggle />}
            {FEATURES.publicAppointments ? (
              <Button variant="accent" asChild>
                <Link to="/zakazivanje-termina">
                  <Calendar className="w-4 h-4" />
                  {t('nav.bookAppointment')}
                </Link>
              </Button>
            ) : (
              <Button variant="accent" asChild>
                <Link to="/contact">
                  <Phone className="w-4 h-4" />
                  {t('nav.contact')}
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Otvori meni</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-card">
              <div className="flex flex-col h-full pt-8">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.key}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-heading font-medium transition-colors text-left py-2 border-b border-border ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pb-8 space-y-4">
                  <a
                    href={telLink(phone)}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{phone}</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                    {FEATURES.themeToggle && (
                      <>
                        <ThemeToggle />
                        <span className="text-sm text-muted-foreground">{t('nav.changeTheme')}</span>
                      </>
                    )}
                  </div>
                  {FEATURES.publicAppointments ? (
                    <Button variant="accent" className="w-full" asChild>
                      <Link to="/zakazivanje-termina" onClick={() => setIsOpen(false)}>
                        <Calendar className="w-4 h-4" />
                        {t('nav.bookAppointment')}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="accent" className="w-full" asChild>
                      <Link to="/contact" onClick={() => setIsOpen(false)}>
                        <Phone className="w-4 h-4" />
                        {t('nav.contact')}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
