## Cilj

Pri prvoj posjeti javnom sajtu, jezik treba da se izabere automatski na osnovu **geografske lokacije** korisnika:

- **Balkan** (BA, RS, ME, HR, MK, SI) → `sr`
- **Njemačko govorno područje** (DE, AT, CH, LI) → `de`
- **Sve ostale zemlje** → `en`

Kasniji ručni izbor jezika kroz `LanguageSwitcher` (već čuva u `localStorage`) ima prioritet — geo-detekcija se izvršava samo ako korisnik nikad ranije nije birao jezik.

## Pristup

Geo-lociranje radimo na **klijentskoj strani** kroz besplatan, no-key API (`https://ipapi.co/json/`). Fallback redoslijed:

1. `localStorage.i18nextLng` postoji → koristi se (postojeće ponašanje).
2. Inače → `fetch` ka geo API-ju, mapiraj `country_code` → jezik, sačuvaj u `localStorage` da se sljedeći put ne ponavlja poziv.
3. Ako API padne (timeout 1.5s ili greška) → fallback na `navigator.language` mapiran istom logikom, pa na kraju `en`.

Geo-detekcija se primjenjuje **samo na javnom dijelu sajta** — admin panel je striktno SR (jezgro pravilo iz memorije) i ne mijenja se.

## Izmjene

### 1. Novi util `src/i18n/geoDetect.ts`

```text
src/i18n/geoDetect.ts
  - SR_COUNTRIES = ['BA','RS','ME','HR','MK','SI']
  - DE_COUNTRIES = ['DE','AT','CH','LI']
  - mapCountryToLang(code) → 'sr' | 'de' | 'en'
  - detectLanguageFromGeo(): Promise<'sr'|'de'|'en'>
      - AbortController sa 1500ms timeoutom
      - fetch('https://ipapi.co/json/')
      - na grešku: izvuci country iz navigator.language regiona (npr. 'de-AT' → 'AT')
      - na potpunu grešku: 'en'
```

### 2. `src/i18n/index.ts` — proširi `detection.order`

Dodaj custom detector koji koristi `localStorage` flag `i18n_geo_resolved` da se geo poziv izvrši **tačno jednom**. Plan:

- Detector vraća sinhrono `undefined` ako još nije razriješeno → i18next pada na `fallbackLng: 'sr'` privremeno.
- Pokreni `detectLanguageFromGeo()` async u `init` fazi, pa kada riješi pozovi `i18n.changeLanguage(lang)` i postavi `localStorage.i18nextLng = lang` plus `localStorage.i18n_geo_resolved = '1'`.
- Ako je već postavljen `i18nextLng` (korisnik ručno izabrao ili je geo već ranije završio) — preskoči geo poziv potpuno.

### 3. Bez izmjena na `LanguageSwitcher`

Postojeći switcher koristi `i18n.changeLanguage` koji već piše u `localStorage`, što automatski isključuje buduće geo pokušaje.

### 4. Privatnost / mreža

- ipapi.co je besplatan za do 30k poziva/mjesec, bez ključa.
- Poziv se izvršava **jednom po pretraživaču** (zbog `i18nextLng` cache-a).
- Nema slanja ličnih podataka — koristi se samo IP koji ionako ide ka serveru.
- Ako želimo strožu privatnost kasnije — može se preseliti u edge funkciju i čitati `cf-ipcountry` / `x-vercel-ip-country` header bez vanjskog API poziva.

## Validacija

1. Obriši `localStorage.i18nextLng` i `localStorage.i18n_geo_resolved`, otvori sajt.
2. Provjeri Network tab: jedan poziv ka `ipapi.co`, jezik se mijenja prema vraćenom `country_code`.
3. Promijeni jezik ručno → reload → ostaje na izabranom jeziku (geo se ne poziva).
4. Simuliraj fail (offline za ipapi.co) → fallback na `navigator.language` ili `en`.

## Tehnički detalji

- Tip povratka detektora: `'sr' | 'en' | 'de'`.
- Timeout: `AbortController` + `setTimeout(1500)`.
- Greška u `fetch` se **ne loguje** kao toast — tiho fallback.
- Admin/portal rute (`/app/*`, `/portal/*`) ne pokreću promjenu jer admin layout ne koristi `i18n.t` za UI tekst koji se prevodi (sve admin kopije su hard-coded SR).
