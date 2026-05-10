
# MVP plan — VetHealth.ba

Cilj: isporučiti čistu, jednostavnu verziju za prvog klijenta. Sve što nije za MVP **sakrivamo iza feature flag-a**, ne brišemo, da se kasnije lako vrati.

## Šta MVP sadrži

**Javni sajt (vidljivo posjetiocima):**
- Početna, O nama, Usluge (opis djelatnosti), Cjenovnik usluga, Blog, Kontakt, Česta pitanja (novo, na Kontakt ili posebna)
- Višejezičnost: SR / EN / DE
- Header sa kontakt info (telefon, email) — povučeno iz Postavki

**Admin panel (vidljivo klijentu):**
- Dashboard (pojednostavljen — bez termina/podsjetnika widgeta)
- Cjenovnik (CRUD usluga + kategorije)
- Blog (CRUD postova)
- Galerija (upload + brisanje slika)
- Poruke iz kontakt forme
- Postavke ordinacije (naziv, telefon, email, adresa, radno vrijeme) — koristi ih javni sajt
- Korisničke postavke (odjava, profil)

## Šta sakrivamo (ostaje u kodu, isključeno feature flag-om)

**Javno:** Pet shop, Zakazivanje termina, AI Chat widget, Theme toggle (light/dark — fiksno light)
**Admin:** Klijenti, Ljubimci, Posjete, Dokumenti + Šabloni, Lager, Podsjetnici, Veterinari (kao zaseban modul)

## Tehnički pristup

### 1. Centralni feature flags fajl (single source of truth)

```text
src/config/features.ts
```

```ts
export const FEATURES = {
  publicPetShop: false,
  publicAppointments: false,
  publicChat: false,
  themeToggle: false,
  adminCRM: false,        // klijenti, ljubimci, posjete, dokumenti
  adminInventory: false,
  adminReminders: false,
  adminTemplates: false,
} as const;
```

Sve "sakrivanje" prolazi kroz ovaj fajl — kasnije aktivacija = `true` na jednoj liniji.

### 2. Rute (`src/App.tsx`)

- Wrap-uj svaku ne-MVP rutu u helper `<FeatureRoute flag="adminCRM">…</FeatureRoute>` koji vraća `<Navigate to="/app/dashboard">` ako je flag off, inače renderuje children.
- Isto za javne rute: `/pet-shop`, `/zakazivanje-termina`, `/potvrda-zakazivanja` → redirect na `/`.
- Ne brišemo importe — TS će ih i dalje provjeravati pa kod ostaje "živ".

### 3. Navigacija

**`src/components/Header.tsx`:**
- Ukloni `petShop` iz `navLinks` ako flag off (filtriraj listu kroz `FEATURES`)
- Sakrij `<Button>` "Zakaži termin" (i mobilnu varijantu)
- Sakrij `<ThemeToggle />` (oba mjesta)

**`src/components/admin/AdminLayout.tsx`:**
- Filtriraj `navSections` po flagovima:
  - "Glavno" sekcija → sakrij Klijenti/Ljubimci/Posjete/Dokumenti (`adminCRM`)
  - "Upravljanje" → sakrij Lager (`adminInventory`), Podsjetnici (`adminReminders`); ostaje samo Cjenovnik
  - "Sadržaj" → ostaje (Blog, Galerija)
  - "Sistem" → ostaje (Postavke)
- Ukloni quick-action dugmad "Nova posjeta" i "Novi nalaz" iz top bara
- Globalna pretraga "klijente, ljubimce" → ili sakriti ili promijeniti placeholder na "Pretraži blog, usluge…"

### 4. Dashboard (`AdminDashboard.tsx`)

Pojednostaviti na MVP varijantu:
- Statistika: broj usluga, broj objavljenih blog postova, broj poruka iz kontakt forme, broj slika u galeriji
- Kartica "Nedavne poruke" iz kontakt forme
- Sakriti widget "Nedavni termini" i "Nadolazeći podsjetnici"
- Stari kod komentarisati ili wrap-ovati u `{FEATURES.adminCRM && …}` da se vrati lako

### 5. Postavke koje napajaju javni sajt

**Migracija:** kreirati tabelu `clinic_settings` (single-row) sa kolonama:
`name`, `phone`, `email`, `address`, `working_hours` (jsonb), `social_facebook`, `social_instagram`, `updated_at`.
RLS: SELECT public, UPDATE samo admin.

**Postavke stranica (`AdminSettings.tsx`):**
- Forma za uređivanje gornjih polja (zamijeni hardkodovane `defaultValue`)
- Snimanje preko `supabase.from('clinic_settings').upsert(...)`

**Hook `useClinicSettings()`** u `src/hooks/`:
- Vraća jedan red iz `clinic_settings`
- Koristi se u: `Header.tsx` (telefon), `Footer.tsx` (sve), `Contact.tsx`/`ContactPage.tsx` (telefon, email, adresa, radno vrijeme), `index.html` SEO meta

Uklanja sve hardkodovane `+387 51 123 456` i `info@vethealth.ba`.

### 6. Tema — fiksno light

- U `src/App.tsx` `<ThemeProvider … forcedTheme="light">` (ili bar `enableSystem={false}` + remove toggle)
- Maknuti `<ThemeToggle/>` iz Header i AdminLayout

### 7. Chat widget

U `src/App.tsx` umotaj `<ChatWidget />` u `{FEATURES.publicChat && …}`. Provider može ostati.

### 8. Početna stranica (`src/pages/Index.tsx`)

- Sakriti `<PetShop />` sekciju (`{FEATURES.publicPetShop && <PetShop/>}`)
- Hero CTA "Zakaži termin" → preusmjeriti na "Kontakt" (ili sakriti) dok flag off

### 9. Česta pitanja (FAQ)

Nova sekcija na `ContactPage` (najjednostavnije) — statična lista pitanja u i18n fajlovima (sr/en/de). Akordeon iz shadcn `accordion`. Bez baze, dovoljno za MVP.

## Koraci implementacije (redoslijed)

1. **Feature flags fajl + helper komponenta** — temelj, 1 PR
2. **Rute i navigacija** — gate sve ne-MVP rute i menije; provjeriti da nema mrtvih linkova
3. **Dashboard pojednostavljenje** — nove statistike + sakrivanje starih widgeta
4. **`clinic_settings` tabela + admin forma + `useClinicSettings`** — najveći zadatak; uvezivanje u Header/Footer/Contact
5. **Tema light-only + uklanjanje ThemeToggle**
6. **Chat widget i PetShop sekcija off**
7. **FAQ akordeon na Kontakt stranici (sa i18n prevodima)**
8. **i18n revizija** — provjera SR/EN/DE prevoda za sve preostale ekrane (uklanjanje natuknica koje upućuju na sakrivene funkcije)
9. **QA prolaz** — sve javne stranice + admin u sve 3 jezika; provjera da redirecti rade i da nema "broken" linkova u footeru, navigaciji, breadcrumbima

## Šta ne diramo (ostaje netaknuto u kodu)

- `src/pages/admin/AdminClients/Pets/Visits/Documents/Templates/Inventory/Reminders` — fajlovi i servisi ostaju
- DB tabele `clients`, `pets`, `visits`, `visit_documents`, `inventory_*`, `reminders`, `document_templates` — ostaju (samo nedostupne iz UI)
- `appointments` tabela ostaje (može doći nova poruka kroz contact formu, a stara funkcija je samo skrivena)

## Procjena

Sve navedeno se može uraditi u jednoj sesiji (1 dan rada), redoslijedom 1→9. Najveći komad je `clinic_settings` integracija (korak 4) jer dira više fajlova.

## Tehnički detalji za implementatora

- Feature flag tip: `as const` da bi TS narrow-ovao na boolean literal (autocompletion u JSX `{FEATURES.x && …}`).
- `FeatureRoute` komponenta: prima `flag: keyof typeof FEATURES` i `children`, vraća `<Navigate replace to="/app/dashboard">` ili `<Navigate to="/">`.
- `useClinicSettings` koristi `useQuery` sa `staleTime: 5 * 60_000` da se ne hita baza pri svakom mountu Headera.
- Migracija `clinic_settings`: seed initial row sa trenutnim hardkodovanim vrijednostima; UPDATE policy `has_role(auth.uid(),'admin')`, SELECT policy `true` (javno čitanje).
- Tema: `next-themes` `ThemeProvider forcedTheme="light"` zaključa temu; `dark:` klase u kodu mogu ostati, ne aktiviraju se.
