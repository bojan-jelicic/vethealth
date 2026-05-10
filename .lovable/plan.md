## Problem

Polje „Ikona" u formi za kategoriju je obični tekstualni input — admin treba da pogodi tačno ime Lucide ikone (npr. `Syringe`). Ako pogriješi ili odabere nešto što ne postoji u `iconMap` na javnom cjenovniku, prikaže se fallback `HelpCircle`. Trenutno javni `iconMap` u `PriceListPage.tsx` poznaje samo **5** ikona (Stethoscope, Syringe, Scissors, Bone, Microscope), tako da skoro sve ostalo ne radi.

## Cilj

Zamijeniti tekstualno polje **vizualnim icon picker-om** sa pretragom, ograničenim na kurirani set ikona prikladnih za veterinarsku ordinaciju, koji su garantovano podržani na javnom cjenovniku.

## Pristup

### 1. Centralizovati listu ikona

Novi fajl `src/lib/categoryIcons.ts`:
- Eksportuje `CATEGORY_ICONS: { name: string; label: string; Icon: LucideIcon }[]` — kurirani set od ~30–40 Lucide ikona relevantnih za veterinu (medicina, životinje, dijagnostika, hirurgija, ljekarne, oprema, itd.).
- Eksportuje `getCategoryIcon(name?: string | null): LucideIcon` koji vraća odgovarajuću ikonu ili `HelpCircle` fallback.
- Eksportuje `categoryIconMap: Record<string, LucideIcon>` za jednostavno korištenje na javnoj strani.

Primjer izbora ikona:
`Stethoscope, Syringe, Scissors, Bone, Microscope, HeartPulse, Pill, Activity, Thermometer, Bandage, ClipboardList, Dog, Cat, Bird, Rabbit, Fish, PawPrint, Hospital, Cross, ShieldCheck, FlaskConical, TestTube, Ambulance, Brain, Eye, Ear, Smile, Tooth (ako postoji — Lucide ima `Tooth`? — fallback `Smile`), Bath, Bug, Leaf, Sparkles, Camera, Calendar, FileText`.

### 2. Nova komponenta `IconPicker`

Putanja: `src/components/admin/IconPicker.tsx`.

Ponašanje:
- Trigger dugme (umjesto Input polja) prikazuje izabranu ikonu + njen naziv (ili „Odaberi ikonu" ako nije izabrano).
- Klik otvara `Popover` (shadcn) sa:
  - `Input` za pretragu po `label` ili `name` (case-insensitive).
  - Grid 6 kolona × N redova prikazanih ikona; svaki dugme prikazuje samu ikonu + tooltip sa nazivom.
  - Hover/aktivni stil koristeći semantic tokens (`bg-accent`, `text-primary`).
  - Dugme „Ukloni ikonu" pri dnu (postavlja na `''`).
- Props: `value: string`, `onChange: (name: string) => void`.

### 3. Integracija u `CategoriesTab` (`src/pages/admin/AdminPricing.tsx`)

Zamijeniti postojeće polje:
```tsx
<Input id="c-icon" value={form.icon} onChange=... placeholder="Npr. Syringe" />
```
sa:
```tsx
<IconPicker value={form.icon} onChange={(name) => setForm({ ...form, icon: name })} />
```

Takođe u koloni „Ikona" u tabeli: umjesto sirovog teksta `c.icon`, prikazati pravu ikonu sa labelom, koristeći `getCategoryIcon`.

### 4. Sinhronizacija sa javnim cjenovnikom

`src/pages/PriceListPage.tsx` — zamijeniti lokalni `iconMap` sa `getCategoryIcon` iz `src/lib/categoryIcons.ts`. Tako sve što admin može da izabere garantovano radi i na javnoj strani.

## Validacija

1. Otvoriti tab „Kategorije" → uredi postojeću → polje za ikonu sada je dugme sa preview-om.
2. Klik otvara popover; pretraga „pas" filtrira na `Dog`, `PawPrint`, itd.
3. Izabrana ikona se odmah prikazuje u tabeli kategorija.
4. Otvoriti `/cjenovnik-usluga` → ista ikona se renderuje pored naslova kategorije.
5. Brisanje ikone vraća na default `HelpCircle` na javnoj strani.
