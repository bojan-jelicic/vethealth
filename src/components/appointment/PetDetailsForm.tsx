import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PetDetailsFormProps {
  petName: string;
  petSpeciesBreed: string;
  petNotes: string;
  onPetNameChange: (value: string) => void;
  onPetSpeciesBreedChange: (value: string) => void;
  onPetNotesChange: (value: string) => void;
  errors: {
    petName?: string;
    petSpeciesBreed?: string;
    petNotes?: string;
  };
}

export const PetDetailsForm = ({
  petName,
  petSpeciesBreed,
  petNotes,
  onPetNameChange,
  onPetSpeciesBreedChange,
  onPetNotesChange,
  errors,
}: PetDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">
        Podaci o Ljubimcu
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="petName" className="text-foreground font-medium">
            Ime ljubimca <span className="text-destructive">*</span>
          </Label>
          <Input
            id="petName"
            value={petName}
            onChange={(e) => onPetNameChange(e.target.value)}
            placeholder="Ime vašeg ljubimca"
            className={errors.petName ? 'border-destructive' : ''}
          />
          {errors.petName && (
            <p className="text-sm text-destructive">{errors.petName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="petSpeciesBreed" className="text-foreground font-medium">
            Vrsta/Rasa <span className="text-muted-foreground text-sm">(opcionalno)</span>
          </Label>
          <Input
            id="petSpeciesBreed"
            value={petSpeciesBreed}
            onChange={(e) => onPetSpeciesBreedChange(e.target.value)}
            placeholder="npr. Njemački ovčar, Sibirska mačka"
            className={errors.petSpeciesBreed ? 'border-destructive' : ''}
          />
          {errors.petSpeciesBreed && (
            <p className="text-sm text-destructive">{errors.petSpeciesBreed}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="petNotes" className="text-foreground font-medium">
          Napomena/Razlog posjete <span className="text-muted-foreground text-sm">(opcionalno)</span>
        </Label>
        <Textarea
          id="petNotes"
          value={petNotes}
          onChange={(e) => onPetNotesChange(e.target.value)}
          placeholder="Opišite razlog posjete ili simptome..."
          rows={3}
          className={errors.petNotes ? 'border-destructive' : ''}
        />
        {errors.petNotes && (
          <p className="text-sm text-destructive">{errors.petNotes}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {petNotes.length}/500 karaktera
        </p>
      </div>
    </div>
  );
};
