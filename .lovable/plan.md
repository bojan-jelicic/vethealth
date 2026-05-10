## Problemi

1. **Duplikat „Početna" u breadcrumbs.** `PageHero` već automatski renderuje „Početna" link kao prvi element (sa Home ikonom). Stranice `PriceListPage.tsx` i `AppointmentPage.tsx` ručno prosljeđuju još jedan `{ label: 'Početna', href: '/' }`, pa se prikazuje dva puta.
2. **Hero zauzima previše prostora.** `PageHero` koristi `pt-24 pb-16 md:pt-32 md:pb-20` + veliki `text-h1` naslov + `text-lg` opis + dekorativni gradient blobovi (320px / 240px). Na 1407×900 to gura sadržaj cjenovnika ispod fold-a.

## Rješenje

### 1. Popraviti breadcrumbs

- U `src/pages/PriceListPage.tsx` ukloniti prvi element `{ label: 'Početna', href: '/' }`. Ostaje samo `{ label: 'Cjenovnik Usluga' }`.
- Isto uraditi u `src/pages/AppointmentPage.tsx` radi konzistentnosti (već pati od istog problema).

### 2. Kompaktniji hero (samo za cjenovnik)

Dodati opcioni `compact?: boolean` prop u `src/components/PageHero.tsx`:
- Kada je `compact`, koristiti `pt-20 pb-6 md:pt-24 md:pb-8` (umjesto `pt-24 pb-16 md:pt-32 md:pb-20`).
- Smanjiti naslov: `text-3xl md:text-4xl` umjesto `text-h1`.
- Smanjiti dekorativne blobove (`w-48 h-48` umjesto `w-80 h-80` / `w-60 h-60`) i smanjiti opacity gradijenta.
- Margin breadcrumbs `mb-3` umjesto `mb-6`.
- Opis: `text-base` umjesto `text-lg`, opcionalno sakriti na cjenovniku jer je informacija dupla sa `Napomena` karticom ispod (vidi tačku 3).

Aktivirati `compact` u `PriceListPage`.

Takođe smanjiti `section-padding` na samoj sekciji cjenovnika (`py-6 md:py-10` umjesto default `section-padding`) i ukloniti gornji margin „Štampaj" dugmeta (`mb-4` umjesto `mb-6`).

### 3. Eliminisati redundantan opis

Opis u herou („Pregled svih naših veterinarskih usluga sa transparentnim cijenama. Cijene su izražene u konvertibilnim markama (KM).") ponavlja sadržaj koji je odmah ispod u plavoj „Napomena" kartici. Ukloniti ga iz `PriceListPage` (ne prosljeđivati `description` u `PageHero`) i premjestiti rečenicu o KM u napomenu.

## Fajlovi

- `src/components/PageHero.tsx` — dodati `compact` prop.
- `src/pages/PriceListPage.tsx` — ukloniti dupli breadcrumb, ukloniti description, koristiti `compact`, smanjiti padding sekcije.
- `src/pages/AppointmentPage.tsx` — ukloniti dupli breadcrumb (samo bug-fix, bez ostalih promjena).

## Validacija

- `/cjenovnik-usluga` na 1407×900: prva kategorija usluga vidljiva bez scrollovanja.
- Breadcrumb prikazuje: 🏠 Početna › Cjenovnik Usluga (jednom).
- `/zakazivanje` breadcrumb takođe samo jedanput „Početna".
- Ostale stranice (`/usluge`, `/o-nama`, `/kontakt`, `/blog`, `/petshop`) izgledaju nepromijenjeno.
