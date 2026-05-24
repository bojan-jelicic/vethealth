
# Plan: Funkcionalni blog modul

Cilj: Admin može da kreira, mijenja, briše i objavljuje blog članke kroz panel koji izlazi sa desne strane (Sheet), sa naslovom, slikom, kratkim opisom i sekcijama (tekst / slika / lista) — istom logikom kao kod usluga. Javni `/blog` i `/blog/:slug` čitaju iz baze; bez kategorija.

## 1. Baza (migracija)

Nova tabela `blog_posts`:

- `title` (text) — naslov
- `slug` (text, unique) — URL slug
- `excerpt` (text) — kratki opis za karticu
- `hero_image_url` (text, nullable) — naslovna slika
- `content_blocks` (jsonb, default `[]`) — sekcije (text / image / list), identično shemi `services.content_blocks` da bi mogli ponovo iskoristiti `ServiceContentBlock` tip i `ServiceContentEditor`
- `author_name` (text, nullable) — npr. "Dr. Marko Petrović"
- `read_time_minutes` (integer, default 5)
- `status` (text, default `draft`) — `draft` ili `published`
- `published_at` (timestamptz, nullable)
- `created_at`, `updated_at`

RLS:
- Public SELECT samo za `status = 'published'`
- Admin SELECT/INSERT/UPDATE/DELETE (`has_role(auth.uid(), 'admin')`)

Index na `slug` (unique) i `published_at desc`.

Postojeći `service-images` bucket ćemo ponovo iskoristiti (već je javan, već radi upload preko `uploadServiceImage`) — slike blog postova će ići u folder `blog/<post-id>/`.

## 2. Feature flag

`src/config/features.ts` — `publicBlog: true` je već uključeno. Bez izmjena.

## 3. Admin — `src/pages/admin/AdminBlogManager.tsx` (rewrite)

- Lista članaka iz baze (TanStack Query): naslov, status badge, datum, akcije (Izmijeni / Obriši).
- Dugme "Novi članak" i klik na red otvaraju desni Sheet (`@/components/ui/sheet`, `side="right"`, široki — `sm:max-w-2xl` ili `max-w-3xl`).
- Sheet sadrži formu (RHF + Zod):
  - Naslov (auto-generiše slug preko `src/lib/slug.ts`, sa mogućnošću ručne izmjene)
  - Slug
  - Kratak opis (excerpt, textarea)
  - Autor (opciono)
  - Read time (broj minuta)
  - Hero slika (`ImageField` iz `ServiceContentEditor`)
  - Sekcije sadržaja (`ServiceContentEditor` sa `folder="blog/<id>"`)
  - Status (Draft / Objavljeno) — kad pređe u Objavljeno, postavlja `published_at = now()` ako je prazan
- Akcije: Sačuvaj, Sačuvaj kao nacrt, Obriši (sa AlertDialog potvrdom).
- Toast notifikacije, query invalidation.

## 4. Javni `/blog` — `src/pages/BlogPage.tsx` (rewrite)

- Učitava `blog_posts` gdje je `status = 'published'`, sortirano po `published_at desc`.
- Uklanja kategorije i sidebar — ostaje samo pretraga po naslovu/excerptu (client-side).
- Grid: `grid-cols-1 md:grid-cols-2 gap-6` — kartice sa hero slikom, naslovom, excerptom, datumom, read time.
- Loading skeleton, prazno stanje.
- Skida featured/sidebar/categories blokove i statički `articles` niz.

## 5. Javni `/blog/:slug` — novi `src/pages/BlogPostPage.tsx`

- Učitava jedan post po slug-u (`status = 'published'`).
- Layout sličan `ServiceDetailsPage`: `PageHero` sa naslovom + breadcrumb (Blog → Naslov), hero slika, excerpt, render `content_blocks` kroz isti `Block` renderer (može se izdvojiti u `src/components/ContentBlocks.tsx` da se dijeli između usluga i bloga).
- `Helmet` SEO: title, meta description (excerpt), canonical.
- Dugme "Nazad na blog".

## 6. Rutiranje

`src/App.tsx`:
- `/blog/:slug` trenutno pogrešno gađa `BlogPage` → promijeniti u novi `BlogPostPage`.

## 7. Realizacija

1. Migracija `blog_posts` + RLS
2. Rewrite `AdminBlogManager` sa Sheet formom
3. Rewrite `BlogPage` (lista iz baze)
4. Kreiraj `BlogPostPage` i izdvoj `ContentBlocks` renderer
5. Ažuriraj rutu u `App.tsx`
6. Smoke test: kreiraj članak → objavi → provjeri javnu listu i detalj

## Tehničke napomene

- Reuse: `ServiceContentBlock` tip iz `src/hooks/useAppointmentData.ts`, `ServiceContentEditor`, `ImageField`, `uploadServiceImage`.
- Sve na ekavici/ijekavici (admin SR), javna strana već koristi `useTranslation` ali blog postovi su jednojezični (kao usluge) — sadržaj se unosi onako kako admin upiše.
- Bez kategorija u ovom koraku (po zahtjevu).
