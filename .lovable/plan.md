## Cilj

1. Preimenovati admin stranicu „Cjenovnik" → „Usluge" (sidebar + naziv stranice).
2. Ukloniti veliki naslov i podnaslov koji bezvezno zauzimaju prostor.
3. Dodati dva taba:
   - **Usluge** — postojeći CRUD nad `services` (sa filterima, kliznim panelom).
   - **Kategorije** — CRUD nad `service_categories` (kreiraj, izmijeni, obriši, aktiviraj/deaktiviraj, redoslijed).

## Stanje

- `AdminPricing.tsx` — postojeći full CRUD nad `services` (već implementiran u prethodnom koraku).
- `AdminCategories.tsx` — već postoji 300-linija full CRUD nad `service_categories`, ali **nigdje nije rutiran** (mrtav kod, isto kao bivši AdminServices).
- Sidebar link `/app/pricing` → label „Cjenovnik" sa `DollarSign` ikonom.

## Izmjene

### 1. Refactor `AdminPricing.tsx` → `AdminCatalog.tsx` (ili zadržati ime, samo izmijeniti sadržaj)

Ostaviti naziv fajla `AdminPricing.tsx` da izbjegnemo lančane preimenovanja u rutama. Na vrhu komponente:

- Ukloniti veliki blok sa `<h1>Cjenovnik</h1>` + podnaslov i `Nova stavka` dugme iz desnog ugla.
- Umotati sadržaj u `Tabs` komponentu (`@/components/ui/tabs`) sa dva `TabsTrigger`-a: **Usluge** i **Kategorije**.
- Dugme za kreiranje („Nova usluga" / „Nova kategorija") preseliti u traku iznad tabele, desno od filtera, ovisno o aktivnom tabu.

### 2. Sadržaj tabova

- **TabsContent „services"** — postojeća tabela usluga + pretraga + filter kategorija + filter status + klizni `Sheet` panel sa formom (sve već postoji, samo se izvuče u podkomponentu `<ServicesTab />` ili ostane inline).
- **TabsContent „categories"** — preseliti logiku iz `AdminCategories.tsx`, ali **zamijeniti `Dialog` sa `Sheet`** (klizni desni panel, konzistentno sa uslugama). Tabela sa kolonama: Naziv, Opis, Ikona, Redoslijed, Status, Akcije (uredi / obriši sa potvrdom).

### 3. Sidebar i navigacija

`src/components/admin/AdminLayout.tsx`:
- Promijeniti label `Cjenovnik` → `Usluge`.
- Ikonu `DollarSign` zamijeniti sa `Stethoscope` (logičnije za usluge).
- Ruta `/app/pricing` ostaje ista (izbjegavamo redirektovanja).

### 4. Brisanje mrtvog koda

Obrisati `src/pages/admin/AdminCategories.tsx` (sav njen kod je preseljen u tab).

### 5. Brisanje kategorije sa zaštitom

Pri brisanju kategorije provjeriti da li postoji bar jedna usluga u njoj (`services.category_id = X`). Ako da, prikazati `AlertDialog` sa porukom „Nije moguće obrisati kategoriju koja sadrži usluge. Prvo prebacite ili obrišite usluge." Inače obrisati uz potvrdu.

## Validacija

1. `/app/usluge` u sidebar-u kao „Usluge"; otvaranje vodi na `/app/pricing`.
2. Tab „Usluge" prikazuje postojeću funkcionalnost (filteri, panel za kreiranje).
3. Tab „Kategorije" prikazuje listu kategorija; „Nova kategorija" otvara klizni panel.
4. Kreirana kategorija odmah dostupna u Select-u za usluge i u filteru.
5. Brisanje kategorije sa povezanim uslugama je blokirano sa jasnom porukom.
6. Naslov „Cjenovnik" + podnaslov potpuno uklonjeni — tabovi su na vrhu sadržaja.
