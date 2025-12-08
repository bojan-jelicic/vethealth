import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
}

export interface Veterinarian {
  id: string;
  name: string;
  specialization: string | null;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, duration_minutes, price')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useVeterinarians = () => {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veterinarians')
        .select('id, name, specialization')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Veterinarian[];
    },
  });
};

export const useAvailableSlots = (date: Date | undefined, veterinarianId: string | undefined) => {
  return useQuery({
    queryKey: ['available-slots', date?.toISOString(), veterinarianId],
    queryFn: async () => {
      if (!date) return { slots: [] };
      
      const formattedDate = date.toISOString().split('T')[0];
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointments/available-slots`);
      url.searchParams.set('date', formattedDate);
      if (veterinarianId) {
        url.searchParams.set('veterinarianId', veterinarianId);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error('Greška pri učitavanju termina');
      }
      
      return response.json() as Promise<{ slots: TimeSlot[]; message?: string }>;
    },
    enabled: !!date,
  });
};
