import { z } from 'zod';

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, 'Molimo odaberite uslugu'),
  veterinarianId: z.string().optional(),
  appointmentDate: z.date({
    required_error: 'Molimo odaberite datum',
  }),
  appointmentTime: z.string().min(1, 'Molimo odaberite vrijeme'),
  ownerFirstName: z.string()
    .trim()
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(50, 'Ime može imati najviše 50 karaktera'),
  ownerLastName: z.string()
    .trim()
    .min(2, 'Prezime mora imati najmanje 2 karaktera')
    .max(50, 'Prezime može imati najviše 50 karaktera'),
  ownerEmail: z.string()
    .trim()
    .email('Unesite validnu email adresu')
    .max(100, 'Email može imati najviše 100 karaktera'),
  ownerPhone: z.string()
    .trim()
    .min(9, 'Broj telefona mora imati najmanje 9 cifara')
    .max(20, 'Broj telefona može imati najviše 20 karaktera')
    .regex(/^[+]?[\d\s-]+$/, 'Unesite validan broj telefona'),
  petName: z.string()
    .trim()
    .min(1, 'Ime ljubimca je obavezno')
    .max(50, 'Ime ljubimca može imati najviše 50 karaktera'),
  petSpeciesBreed: z.string()
    .trim()
    .max(100, 'Vrsta/rasa može imati najviše 100 karaktera')
    .optional(),
  petNotes: z.string()
    .trim()
    .max(500, 'Napomena može imati najviše 500 karaktera')
    .optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
