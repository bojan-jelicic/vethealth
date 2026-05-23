## Cilj

Trenutno postoje dvije različite implementacije kontakt sekcije:
- `src/components/Contact.tsx` (početna) — info kartice + forma, lažni submit (toast), bez validacije.
- `src/pages/ContactPage.tsx` — info kartice + forma sa zod validacijom i pravim slanjem preko `contact-form` edge funkcije, plus mapa (koja je trebala biti obrisana), Hitna pomoć baner, radno vrijeme grid i FAQ.

Obje treba da koriste **istu zajedničku komponentu** kako bi se sve buduće promjene radile na jednom mjestu.

## Šta se mijenja

### 1. Nova komponenta: `src/components/ContactSection.tsx`
Jedinstvena, "puna" verzija koja sadrži:
- Lijevu kolonu sa info karticama: Adresa, Telefon, Email, Radno vrijeme (klikabilne — `tel:`, `mailto:`, Google Maps).
- Desnu kolonu sa formom: Ime, Email, Telefon (opcionalno), Predmet, Poruka (max 500) — sa `contactFormSchema` (zod) validacijom, success/error banerima i pravim slanjem preko `supabase.functions.invoke('contact-form')`.
- Props: `variant?: 'section' | 'plain'` (kontroliše da li renderuje `<section>` wrapper sa naslovom i pozadinom — za početnu; ili samo grid — za Kontakt stranicu unutar postojeće sekcije).

### 2. `src/components/Contact.tsx`
Postaje tanki wrapper koji renderuje `<ContactSection variant="section" />` (zadržava `id="contact"`, naslov, opis i `bg-secondary/30`). Ne mijenja se ništa u `Index.tsx`.

### 3. `src/pages/ContactPage.tsx`
- Briše se mapa (iframe) — kao što je već traženo.
- Briše se postojeća inline info + forma duplikat.
- Koristi `<ContactSection variant="plain" />` umjesto toga.
- Zadržava: `PageHero`, Hitna pomoć baner, Radno vrijeme grid (4 kartice), FAQ accordion.

## Rezultat
- Identično ponašanje i izgled forme i info kartica na obje stranice.
- Prava validacija + edge function slanje na obje (početna više nema lažni toast).
- Mapa uklonjena sa Kontakt stranice.
- Buduće izmjene info kartica/forme → jedno mjesto (`ContactSection.tsx`).
