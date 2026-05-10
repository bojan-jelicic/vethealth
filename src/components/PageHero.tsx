import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
  compact?: boolean;
}

export const PageHero = ({ title, description, breadcrumbs, backgroundImage, compact = false }: PageHeroProps) => {
  const { t } = useTranslation();

  return (
    <section
      className={
        compact
          ? 'relative pt-20 pb-6 md:pt-24 md:pb-8 overflow-hidden'
          : 'relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden'
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      <div className={`absolute top-0 right-0 ${compact ? 'w-48 h-48' : 'w-80 h-80'} bg-primary/10 rounded-full blur-3xl`} />
      <div className={`absolute bottom-0 left-0 ${compact ? 'w-40 h-40' : 'w-60 h-60'} bg-accent/10 rounded-full blur-3xl`} />

      <div className="container-custom relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={`flex items-center gap-2 text-small text-muted-foreground ${compact ? 'mb-3' : 'mb-6'}`}>
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="w-4 h-4" />
              <span>{t('pageHero.home')}</span>
            </Link>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {item.href ? (
                  <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        <h1 className={`${compact ? 'text-3xl md:text-4xl font-heading font-bold mb-2' : 'text-h1 mb-4'} text-foreground`}>{title}</h1>
        {description && (
          <p className={`${compact ? 'text-base' : 'text-lg'} text-muted-foreground max-w-2xl`}>{description}</p>
        )}
      </div>
    </section>
  );
};
