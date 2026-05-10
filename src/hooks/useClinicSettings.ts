import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkingHours {
  pon_pet?: string;
  sub?: string;
  ned?: string;
  [key: string]: string | undefined;
}

export interface ClinicSettings {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  working_hours: WorkingHours;
  social_facebook: string | null;
  social_instagram: string | null;
  updated_at: string;
}

const FALLBACK: ClinicSettings = {
  id: '',
  name: 'VetHealth.ba',
  phone: '+387 51 123 456',
  email: 'info@vethealth.ba',
  address: 'Banja Luka, Bosna i Hercegovina',
  working_hours: { pon_pet: '08:00 - 20:00', sub: '09:00 - 14:00', ned: 'Zatvoreno' },
  social_facebook: null,
  social_instagram: null,
  updated_at: new Date().toISOString(),
};

export const useClinicSettings = () => {
  return useQuery<ClinicSettings>({
    queryKey: ['clinic-settings'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('clinic_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error || !data) return FALLBACK;
      return {
        ...FALLBACK,
        ...data,
        working_hours: data.working_hours ?? FALLBACK.working_hours,
      } as ClinicSettings;
    },
  });
};

export const telLink = (phone?: string | null) =>
  phone ? `tel:${phone.replace(/\s+/g, '')}` : '#';
export const mailLink = (email?: string | null) =>
  email ? `mailto:${email}` : '#';