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
  centered?: boolean;
}

export const PageHero = ({ title, description, breadcrumbs, backgroundImage, centered }: PageHeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-4 md:pt-28 md:pb-6 overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      <div className="container-custom relative z-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={`flex items-center gap-2 text-small text-muted-foreground mb-6 ${centered ? 'justify-center' : ''}`}>
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

        <h1 className={`text-h1 text-foreground mb-4 ${centered ? 'text-center' : ''}`}>{title}</h1>
        {description && (
          <p className={`text-lg text-muted-foreground max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}>{description}</p>
        )}
      </div>
    </section>
  );
};
