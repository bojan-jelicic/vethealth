import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, User, Dog } from 'lucide-react';
import { Service, Veterinarian } from '@/hooks/useAppointmentData';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  data: {
    service?: Service;
    veterinarian?: Veterinarian;
    date?: Date;
    time: string;
    ownerFirstName: string;
    ownerLastName: string;
    ownerEmail: string;
    ownerPhone: string;
    petName: string;
    petSpeciesBreed: string;
    petNotes: string;
  };
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  data,
}: ConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            Potvrdite Zakazivanje
          </DialogTitle>
          <DialogDescription>
            Molimo provjerite detalje vašeg termina prije potvrde.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Service & Vet */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{data.service?.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.veterinarian?.name || 'Bilo koji veterinar'}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                {data.date && format(data.date, 'EEEE, d. MMMM yyyy.', { locale: bs })}
              </p>
              <p className="text-sm text-muted-foreground">u {data.time}h</p>
            </div>
          </div>

          {/* Owner */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <User className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                {data.ownerFirstName} {data.ownerLastName}
              </p>
              <p className="text-sm text-muted-foreground">{data.ownerEmail}</p>
              <p className="text-sm text-muted-foreground">{data.ownerPhone}</p>
            </div>
          </div>

          {/* Pet */}
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <Dog className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">{data.petName}</p>
              {data.petSpeciesBreed && (
                <p className="text-sm text-muted-foreground">{data.petSpeciesBreed}</p>
              )}
              {data.petNotes && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{data.petNotes}"
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Nazad
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Zakazivanje...
              </>
            ) : (
              'Potvrdi Zakazivanje'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
