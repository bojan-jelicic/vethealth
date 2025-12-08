import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OwnerDetailsFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  errors: {
    ownerFirstName?: string;
    ownerLastName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
  };
}

export const OwnerDetailsForm = ({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  errors,
}: OwnerDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">
        Podaci o Vlasniku
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground font-medium">
            Ime <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Vaše ime"
            className={errors.ownerFirstName ? 'border-destructive' : ''}
          />
          {errors.ownerFirstName && (
            <p className="text-sm text-destructive">{errors.ownerFirstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground font-medium">
            Prezime <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Vaše prezime"
            className={errors.ownerLastName ? 'border-destructive' : ''}
          />
          {errors.ownerLastName && (
            <p className="text-sm text-destructive">{errors.ownerLastName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="vas@email.com"
            className={errors.ownerEmail ? 'border-destructive' : ''}
          />
          {errors.ownerEmail && (
            <p className="text-sm text-destructive">{errors.ownerEmail}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-medium">
            Telefon <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+387 65 123 456"
            className={errors.ownerPhone ? 'border-destructive' : ''}
          />
          {errors.ownerPhone && (
            <p className="text-sm text-destructive">{errors.ownerPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
};
