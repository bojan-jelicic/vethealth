import { Service } from '@/hooks/useAppointmentData';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ServiceSelectorProps {
  services: Service[] | undefined;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ServiceSelector = ({
  services,
  isLoading,
  value,
  onChange,
  error,
}: ServiceSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="service" className="text-foreground font-medium">
        Usluga <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger 
          id="service"
          className={`w-full ${error ? 'border-destructive' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Učitavanje...</span>
            </div>
          ) : (
            <SelectValue placeholder="Odaberite uslugu" />
          )}
        </SelectTrigger>
        <SelectContent>
          {services?.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              <div className="flex flex-col">
                <span>{service.name}</span>
                {service.price && (
                  <span className="text-xs text-muted-foreground">
                    {service.duration_minutes} min • {service.price} KM
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
