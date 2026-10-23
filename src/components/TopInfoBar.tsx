import { Phone, MapPin, Clock, Mail, Instagram, Facebook } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useClinicSettings, telLink, mapsLink, mailLink } from '@/hooks/useClinicSettings';

const linkCls = 'flex items-center gap-1.5 hover:text-accent transition-colors whitespace-nowrap';

export const TopInfoBar = () => {
  const { t } = useTranslation();
  const { data: c } = useClinicSettings();
  const hours = c?.working_hours?.pon_pet;

  return (
    <div className="h-10 bg-primary text-primary-foreground text-xs sm:text-sm">
      <div className="container-custom h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          {c?.phone && (
            <a href={telLink(c.phone)} className={linkCls}>
              <Phone className="w-4 h-4 text-accent" />
              <span>{c.phone}</span>
            </a>
          )}
          {c?.address && (
            <a href={mapsLink(c.address)} target="_blank" rel="noopener noreferrer" className={linkCls} aria-label={c.address}>
              <MapPin className="w-4 h-4 text-accent" />
              <span className="hidden md:inline">{c.address}</span>
            </a>
          )}
          {hours && (
            <span className="hidden lg:flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-4 h-4 text-accent" />
              {t('topBar.weekdays')} {hours}
            </span>
          )}
          {c?.email && (
            <a href={mailLink(c.email)} className={`${linkCls} hidden xl:flex`}>
              <Mail className="w-4 h-4 text-accent" />
              <span>{c.email}</span>
            </a>
          )}
          {c?.social_instagram && (
            <a href={c.social_instagram} target="_blank" rel="noopener noreferrer" className={linkCls} aria-label="Instagram">
              <Instagram className="w-4 h-4 text-accent" />
            </a>
          )}
          {c?.social_facebook && (
            <a href={c.social_facebook} target="_blank" rel="noopener noreferrer" className={linkCls} aria-label="Facebook">
              <Facebook className="w-4 h-4 text-accent" />
            </a>
          )}
        </div>
        <LanguageSwitcher dark />
      </div>
    </div>
  );
};
