import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { CalendarIcon, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimeSlot } from '@/hooks/useAppointmentData';

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  slots: TimeSlot[] | undefined;
  slotsMessage?: string;
  isLoadingSlots: boolean;
  dateError?: string;
  timeError?: string;
}

export const DateTimePicker = ({
  date,
  onDateChange,
  selectedTime,
  onTimeChange,
  slots,
  slotsMessage,
  isLoadingSlots,
  dateError,
  timeError,
}: DateTimePickerProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Disable weekends and past dates
  const disabledDays = (date: Date) => {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    const isPast = date < today;
    return isWeekend || isPast;
  };

  const availableSlots = slots?.filter((slot) => slot.isAvailable) || [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">
          Datum <span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground',
                dateError && 'border-destructive'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, 'PPP', { locale: bs })
              ) : (
                <span>Odaberite datum</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              disabled={disabledDays}
              initialFocus
              className="p-3 pointer-events-auto"
              locale={bs}
            />
          </PopoverContent>
        </Popover>
        {dateError && <p className="text-sm text-destructive">{dateError}</p>}
      </div>

      {/* Time Slots */}
      <div className="space-y-2">
        <Label className="text-foreground font-medium">
          Vrijeme <span className="text-destructive">*</span>
        </Label>
        <div className={cn(
          'min-h-[120px] rounded-lg border p-3',
          timeError ? 'border-destructive' : 'border-input'
        )}>
          {!date ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Prvo odaberite datum
            </p>
          ) : isLoadingSlots ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : slotsMessage ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              {slotsMessage}
            </p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nema dostupnih termina za ovaj datum
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  type="button"
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTimeChange(slot.time)}
                  className="text-sm"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
        {timeError && <p className="text-sm text-destructive">{timeError}</p>}
      </div>
    </div>
  );
};
