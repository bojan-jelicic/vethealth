import { z } from 'zod';

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Ime mora imati najmanje 2 karaktera.')
    .max(100, 'Ime može imati maksimalno 100 karaktera.'),
  email: z
    .string()
    .email('Unesite validnu email adresu.')
    .max(255, 'Email može imati maksimalno 255 karaktera.'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Telefon može sadržavati samo brojeve i znakove + - ( )')
    .max(20, 'Telefon može imati maksimalno 20 karaktera.')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(5, 'Predmet mora imati najmanje 5 karaktera.')
    .max(100, 'Predmet može imati maksimalno 100 karaktera.'),
  message: z
    .string()
    .min(10, 'Poruka mora imati najmanje 10 karaktera.')
    .max(500, 'Poruka može imati maksimalno 500 karaktera.'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
