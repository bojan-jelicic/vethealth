## Cilj

Omogućiti adminu da za svaku uslugu doda bogat opis (hero slika + tekstualne/slikovne sekcije), a u javnom cjenovniku da prikaže dugme "Detalji" samo za usluge koje imaju opis, koje vodi na dinamičku stranicu `/services/<slug>`. Stari hardkodirani `ServiceDetailsPage` se mijenja čitanjem iz baze.

## 1. Baza podataka (migracija)

Proširiti tabelu `services` umjesto pravljenja nove tabele — sve ostaje jednostavno:

- `slug text unique` — automatski generisan iz `name` (lowercase, bez dijakritika, crtice). Required za detaljnu stranicu.
- `hero_image_url text null` — glavna slika na vrhu detalja.
- `long_description text null` — uvodni paragraf ispod hero slike.
- `content_blocks jsonb not null default '[]'` — niz blokova proizvoljnog tipa za dinamički sadržaj.

Format jednog bloka u `content_blocks`:
```text
{ "id": "uuid", "type": "text" | "image" | "list",
  "title": "opciono",
  "body": "tekst (za text/list — kao items odvojeni newline)",
  "image_url": "url (samo za image)" }
```

Pravilo prikaza "Detalji" dugmeta: `long_description` postoji ILI `hero_image_url` postoji ILI `content_blocks` ima ≥1 stavku.

RLS ostaje kakva jeste (`services` već ima public SELECT za aktivne + admin write).

## 2. Storage

Novi public bucket `service-images` sa policy-jima:
- public SELECT
- admin INSERT/UPDATE/DELETE (preko `has_role(auth.uid(), 'admin')`)

Slike (hero + blokovi) se upload-uju u `service-images/<service_id>/<filename>`.

## 3. Admin (`src/pages/admin/AdminPricing.tsx`)

U postojeći Sheet "Nova/Uredi usluga" dodati sekciju **"Detaljna stranica (opciono)"**:
- Polje **Slug** — auto-generisano iz naziva, ali ručno editabilno (validacija: lowercase, a-z 0-9 -).
- **Hero slika** — file input + preview + dugme "Ukloni"; upload na `service-images/`.
- **Uvodni opis (long_description)** — `Textarea`.
- **Sadržaj (blokovi)** — lista blokova sa:
  - dropdown tipa (Tekst / Slika / Lista),
  - "Dodaj blok", "Obriši", strelice gore/dole za redosljed,
  - inputi prema tipu (naslov + body za text/list; naslov + image upload za image).

Kratki helper komponenta `ServiceContentEditor` (novi fajl `src/components/admin/ServiceContentEditor.tsx`) drži state blokova i emituje `onChange`. Slug helper u `src/lib/slug.ts`.

Validacija: ako je popunjen iko od polja detalja, `slug` postaje required. Naslov i kategorija ostaju kao i sad — iskorištavaju se na detaljnoj stranici (nema dupliranja).

## 4. Javni cjenovnik (`src/pages/PriceListPage.tsx`)

U red svake usluge dodati dugme/link "Detalji →" desno od cijene, vidljivo samo kad `hasDetails(service)` vrati true. Link: `/services/<slug>`.

`useServicesWithCategories` hook prošireni da vraća i nova polja.

## 5. Dinamička detaljna stranica (`src/pages/ServiceDetailsPage.tsx`)

Potpuni rewrite:
- Fetch `services` po `slug` (filter `is_active = true`), join na kategoriju.
- Render: PageHero (naslov = `name`, opis = `description`, breadcrumb "Cjenovnik" → `/cjenovnik-usluga`).
- Ako `hero_image_url` — prikaži ga.
- Ako `long_description` — paragraf "O Usluzi".
- Iteriraj `content_blocks`:
  - `text` — `<h2>{title}</h2><p>{body}</p>`,
  - `image` — slika + opcioni caption (title),
  - `list` — `<h2>{title}</h2><ul>` (body split po novim redovima).
- Sidebar zadržan: cijena (`price`), trajanje (`duration_minutes`), CTA "Zakaži Termin" → `/contact`, "Nazovi nas".
- Ako slug ne postoji → 404 stanje sa povratkom na `/cjenovnik-usluga`.

Uklanjamo hardkodirani `servicesData` i `relatedServicesMap`. (Slične usluge se mogu kasnije dodati kao izbor 3 usluge iz iste kategorije — van scope-a sada.)

## 6. Testiranje

- Admin: kreira novu uslugu sa naslovom + cijenom bez detalja → u cjenovniku se ne vidi "Detalji".
- Admin: doda hero sliku + opis + 2 bloka (tekst, slika) → u cjenovniku se pojavi "Detalji", klik vodi na `/services/<slug>` i prikazuje sav unesen sadržaj.
- Admin: uredi postojeću uslugu, doda blok liste → blok se prikaže kao ul.
- Slug validacija i uniqueness greška se prikaže kao toast.

## Što namjerno NE radimo sada

- Slične usluge i SEO meta polja (može se dodati kasnije).
- Drag-and-drop za blokove (koristimo strelice gore/dole — jednostavnije i pouzdano).
- Migraciju starog hardkodiranog sadržaja u bazu — admin može sam unijeti gdje treba.
