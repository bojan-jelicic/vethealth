import { Veterinarian } from '@/hooks/useAppointmentData';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface VeterinarianSelectorProps {
  veterinarians: Veterinarian[] | undefined;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const VeterinarianSelector = ({
  veterinarians,
  isLoading,
  value,
  onChange,
}: VeterinarianSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="veterinarian" className="text-foreground font-medium">
        Veterinar <span className="text-muted-foreground text-sm">(opcionalno)</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger id="veterinarian" className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Učitavanje...</span>
            </div>
          ) : (
            <SelectValue placeholder="Bilo koji veterinar" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Bilo koji veterinar</SelectItem>
          {veterinarians?.map((vet) => (
            <SelectItem key={vet.id} value={vet.id}>
              <div className="flex flex-col">
                <span>{vet.name}</span>
                {vet.specialization && (
                  <span className="text-xs text-muted-foreground">
                    {vet.specialization}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
