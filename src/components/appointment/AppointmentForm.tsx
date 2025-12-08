import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { appointmentSchema, type AppointmentFormData } from '@/lib/appointmentValidations';
import {
  useServices,
  useVeterinarians,
  useAvailableSlots,
  Service,
  Veterinarian,
} from '@/hooks/useAppointmentData';
import { ServiceSelector } from './ServiceSelector';
import { VeterinarianSelector } from './VeterinarianSelector';
import { DateTimePicker } from './DateTimePicker';
import { OwnerDetailsForm } from './OwnerDetailsForm';
import { PetDetailsForm } from './PetDetailsForm';
import { ConfirmationModal } from './ConfirmationModal';

type FormErrors = Partial<Record<keyof AppointmentFormData, string>>;

export const AppointmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [serviceId, setServiceId] = useState('');
  const [veterinarianId, setVeterinarianId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petSpeciesBreed, setPetSpeciesBreed] = useState('');
  const [petNotes, setPetNotes] = useState('');

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Data fetching
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: veterinarians, isLoading: vetsLoading } = useVeterinarians();
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(
    selectedDate,
    veterinarianId && veterinarianId !== 'any' ? veterinarianId : undefined
  );

  // Get selected service and vet objects
  const selectedService = services?.find((s: Service) => s.id === serviceId);
  const selectedVet = veterinarians?.find((v: Veterinarian) => v.id === veterinarianId);

  const validateForm = (): boolean => {
    const formData = {
      serviceId,
      veterinarianId: veterinarianId !== 'any' ? veterinarianId : undefined,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,
      petName,
      petSpeciesBreed: petSpeciesBreed || undefined,
      petNotes: petNotes || undefined,
    };

    const result = appointmentSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof AppointmentFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleOpenConfirmation = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            serviceId,
            veterinarianId: veterinarianId !== 'any' ? veterinarianId : null,
            appointmentDate: selectedDate.toISOString().split('T')[0],
            appointmentTime: selectedTime,
            ownerFirstName,
            ownerLastName,
            ownerEmail,
            ownerPhone,
            petName,
            petSpeciesBreed: petSpeciesBreed || null,
            petNotes: petNotes || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Došlo je do greške pri zakazivanju');
      }

      setShowConfirmation(false);
      navigate('/potvrda-zakazivanja', {
        state: {
          service: selectedService?.name,
          veterinarian: selectedVet?.name || 'Bilo koji veterinar',
          date: selectedDate.toISOString(),
          time: selectedTime,
          petName,
          ownerEmail,
        },
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri zakazivanju. Pokušajte ponovo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset time when date or vet changes
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleVetChange = (value: string) => {
    setVeterinarianId(value);
    setSelectedTime('');
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Step 1: Service & Vet Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Odaberite Uslugu
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 pl-11">
              <ServiceSelector
                services={services}
                isLoading={servicesLoading}
                value={serviceId}
                onChange={setServiceId}
                error={errors.serviceId}
              />
              <VeterinarianSelector
                veterinarians={veterinarians}
                isLoading={vetsLoading}
                value={veterinarianId}
                onChange={handleVetChange}
              />
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Odaberite Termin
              </h2>
            </div>
            <div className="pl-11">
              <DateTimePicker
                date={selectedDate}
                onDateChange={handleDateChange}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                slots={slotsData?.slots}
                slotsMessage={slotsData?.message}
                isLoadingSlots={slotsLoading}
                dateError={errors.appointmentDate}
                timeError={errors.appointmentTime}
              />
            </div>
          </div>

          {/* Step 3: Owner Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Vaši Podaci
              </h2>
            </div>
            <div className="pl-11">
              <OwnerDetailsForm
                firstName={ownerFirstName}
                lastName={ownerLastName}
                email={ownerEmail}
                phone={ownerPhone}
                onFirstNameChange={setOwnerFirstName}
                onLastNameChange={setOwnerLastName}
                onEmailChange={setOwnerEmail}
                onPhoneChange={setOwnerPhone}
                errors={errors}
              />
            </div>
          </div>

          {/* Step 4: Pet Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Podaci o Ljubimcu
              </h2>
            </div>
            <div className="pl-11">
              <PetDetailsForm
                petName={petName}
                petSpeciesBreed={petSpeciesBreed}
                petNotes={petNotes}
                onPetNameChange={setPetName}
                onPetSpeciesBreedChange={setPetSpeciesBreed}
                onPetNotesChange={setPetNotes}
                errors={errors}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleOpenConfirmation}
              disabled={isSubmitting}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              Zakaži Termin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
        data={{
          service: selectedService,
          veterinarian: selectedVet,
          date: selectedDate,
          time: selectedTime,
          ownerFirstName,
          ownerLastName,
          ownerEmail,
          ownerPhone,
          petName,
          petSpeciesBreed,
          petNotes,
        }}
      />
    </>
  );
};
