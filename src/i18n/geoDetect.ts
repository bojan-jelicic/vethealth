const SR_COUNTRIES = ['BA', 'RS', 'ME', 'HR', 'MK', 'SI'];
const DE_COUNTRIES = ['DE', 'AT', 'CH', 'LI'];

export type SupportedLang = 'sr' | 'en' | 'de';

export function mapCountryToLang(code?: string | null): SupportedLang {
  if (!code) return 'en';
  const c = code.toUpperCase();
  if (SR_COUNTRIES.includes(c)) return 'sr';
  if (DE_COUNTRIES.includes(c)) return 'de';
  return 'en';
}

function countryFromNavigator(): string | null {
  if (typeof navigator === 'undefined') return null;
  const langs = [navigator.language, ...(navigator.languages || [])];
  for (const l of langs) {
    const parts = l?.split('-');
    if (parts && parts.length > 1 && parts[1]) return parts[1];
  }
  return null;
}

export async function detectLanguageFromGeo(): Promise<SupportedLang> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code) return mapCountryToLang(data.country_code);
    }
  } catch {
    // tiho fallback
  } finally {
    clearTimeout(timeout);
  }
  return mapCountryToLang(countryFromNavigator());
}