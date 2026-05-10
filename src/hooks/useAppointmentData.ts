import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  category_id: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
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

export interface ServiceWithCategory extends Service {
  service_categories: ServiceCategory | null;
}

export interface CategoryWithServices extends ServiceCategory {
  services: Service[];
}

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, duration_minutes, price, category_id')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, description, icon, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as ServiceCategory[];
    },
  });
};

export const useServicesWithCategories = () => {
  return useQuery({
    queryKey: ['services-with-categories'],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('id, name, description, icon, sort_order')
        .eq('is_active', true)
        .order('sort_order');
      
      if (catError) throw catError;

      // Fetch services
      const { data: services, error: svcError } = await supabase
        .from('services')
        .select('id, name, description, duration_minutes, price, category_id')
        .eq('is_active', true)
        .order('name');
      
      if (svcError) throw svcError;

      // Group services by category
      const categoriesWithServices: CategoryWithServices[] = (categories || []).map(cat => ({
        ...cat,
        services: (services || []).filter(svc => svc.category_id === cat.id)
      }));

      // Add uncategorized services
      const uncategorizedServices = (services || []).filter(svc => !svc.category_id);
      if (uncategorizedServices.length > 0) {
        categoriesWithServices.push({
          id: 'uncategorized',
          name: 'Ostale Usluge',
          description: null,
          icon: null,
          sort_order: 999,
          services: uncategorizedServices
        });
      }

      return categoriesWithServices;
    },
  });
};

export const useVeterinarians = () => {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_veterinarians');

      if (error) throw error;
      return (data ?? []) as Veterinarian[];
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
