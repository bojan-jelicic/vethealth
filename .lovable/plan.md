## Problem

Admin stranica `/app/pricing` (`AdminPricing.tsx`) trenutno je samo statički prototip sa hard-kodovanim primjerima — nema veze sa bazom. Zato:
- Javni cjenovnik (`/cjenovnik-usluga`) prikazuje stvarne podatke iz tabele `services` + `service_categories`, ali admin ih ne uređuje.
- Dugme **„Nova stavka"** ne radi jer nema `onClick` handlera.

Postoji već skoro identična, funkcionalna implementacija u `AdminServices.tsx` (CRUD nad `services` koristeći `Dialog`), ali ona **nije nigdje rutirana niti linkovana** — pa je u praksi mrtav kod.

## Cilj

Spojiti dvije stranice u jednu funkcionalnu „Cjenovnik" stranicu koja:
1. Čita i piše u istu `services`/`service_categories` tabelu koju koristi javni `/cjenovnik-usluga` → automatska sinhronizacija.
2. Otvara **`Sheet` (klizni panel sa desne strane)** umjesto modal dijaloga, za kreiranje i izmjenu stavki.
3. Funkcionalna pretraga, prikaz po kategorijama, edit i brisanje.

## Izmjene

### 1. `src/pages/admin/AdminPricing.tsx` — kompletan rewrite

Osnova: kopirati logiku iz `AdminServices.tsx` (queries, mutations, validacija) i prilagoditi:

- Zamijeniti `Dialog` sa `Sheet` (`@/components/ui/sheet`) — `side="right"`, `className="w-full sm:max-w-lg overflow-y-auto"`.
- Dugme **„Nova stavka"** otvara `Sheet` sa praznom formom; klik na ikonu olovke otvara isti `Sheet` u edit modu.
- Forma sadrži: naziv*, opis, cijena (KM), trajanje (min), kategorija (Select iz `service_categories`), `is_active` Switch.
- Pretraga (`Input`) filtrira lokalno po `name`, `description` i `service_categories.name` (case-insensitive).
- Prikaz: tabela kao trenutno, ali sa pravim podacima i kolonom Akcije (Uredi / Obriši sa potvrdom kroz `AlertDialog`).
- Brisanje umotati u `AlertDialog` da se izbjegne nehotično klikanje.
- Naslov: „Cjenovnik" (zadržati), opis: „Upravljanje cijenama i uslugama prikazanim na javnom cjenovniku".

### 2. Cache invalidation

Mutacije pozivaju:
```ts
queryClient.invalidateQueries({ queryKey: ['admin-services'] });
queryClient.invalidateQueries({ queryKey: ['services-with-categories'] }); // koristi useServicesWithCategories
```

Ovo osigurava da se javni cjenovnik osvježi bez full reloada (ako je hook keširan tim ključem). Provjeriti tačan ključ u `useAppointmentData.ts` i koristiti njegov `queryKey`.

### 3. Brisanje mrtvog koda

Obrisati `src/pages/admin/AdminServices.tsx` (nije nigdje rutiran) da se izbjegne duplikat i konfuzija.

### 4. Tekst i jezik

Striktno SR (ijekavica), prema Core memoriji: „Nova stavka", „Uredi stavku", „Obriši", „Pretraži cjenovnik…", „Aktivna/Neaktivna", toast poruke „Stavka kreirana / ažurirana / obrisana".

## Tehnički detalji

- Tabela: `services` (već ima sve potrebne kolone: name, description, price numeric, duration_minutes, category_id, is_active).
- RLS: već postoje admin policies (insert/update/delete za admin role) — nema potrebe za migracijom.
- `Sheet` komponenta već postoji u `@/components/ui/sheet` (shadcn standardna).
- Validacija: naziv obavezan; cijena opciona (numerička); trajanje pozitivan integer.

## Validacija

1. Otvoriti `/app/pricing` → vidjeti stvarne stavke iz `services` tabele.
2. Klik na „Nova stavka" → klizni panel sa desne strane se otvara, forma je prazna.
3. Sačuvati novu stavku → toast „Stavka kreirana", panel se zatvara, tabela se osvježava.
4. Otvoriti `/cjenovnik-usluga` u drugoj tabu → nova stavka je vidljiva u odgovarajućoj kategoriji.
5. Edit postojeće → panel se otvara sa popunjenim podacima; izmjene se reflektuju i u admin i na javnom cjenovniku.
6. Brisanje traži potvrdu (AlertDialog), pa briše.
