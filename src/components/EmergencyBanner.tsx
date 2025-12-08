import { Phone, AlertTriangle } from 'lucide-react';

export const EmergencyBanner = () => {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-card p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Hitna Veterinarska Pomoć
          </h3>
          <p className="text-muted-foreground mb-4">
            Za hitne slučajeve van radnog vremena, nazovite naš dežurni broj. 
            Dostupni smo 24/7 za vaše ljubimce.
          </p>
          <a
            href="tel:+38751999888"
            className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-button font-medium hover:bg-destructive/90 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Hitna: +387 51 999 888
          </a>
        </div>
      </div>
    </div>
  );
};
