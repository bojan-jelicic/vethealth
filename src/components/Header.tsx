import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Phone, Calendar, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { name: 'Početna', href: '/' },
  { name: 'Usluge', href: '/services' },
  { name: 'Pet Shop', href: '/pet-shop' },
  { name: 'Blog', href: '/blog' },
  { name: 'O Nama', href: '/about' },
  { name: 'Kontakt', href: '/contact' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl text-foreground">
                VetHealth
              </span>
              <span className="text-xs text-primary font-medium -mt-1">.ba</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium py-1 transition-colors link-underline ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+38751123456"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-small">+387 51 123 456</span>
            </a>
            <Button variant="accent" asChild>
              <Link to="/contact">
                <Calendar className="w-4 h-4" />
                Zakaži Termin
              </Link>
            </Button>
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
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-heading font-medium transition-colors text-left py-2 border-b border-border ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pb-8 space-y-4">
                  <a
                    href="tel:+38751123456"
                    className="flex items-center gap-3 text-foreground"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span>+387 51 123 456</span>
                  </a>
                  <Button variant="accent" className="w-full" asChild>
                    <Link to="/contact" onClick={() => setIsOpen(false)}>
                      <Calendar className="w-4 h-4" />
                      Zakaži Termin
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
