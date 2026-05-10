## Promjene

### 1. Uskladiti hero na stranici Cjenovnik sa ostalim stranicama
U `src/pages/PriceListPage.tsx` ukloniti `compact` prop iz `<PageHero>` poziva. Cjenovnik će tada koristiti isti veliki naslov i padding kao Usluge, O Nama, Kontakt.

### 2. Ukloniti varijantu „compact" iz `PageHero`
Pošto više nigdje neće biti korišten, ukloniti `compact` prop i sve uslove vezane za njega iz `src/components/PageHero.tsx` radi čistoće koda.

### 3. Ukloniti dekorativnu pozadinu hero sekcije
U `src/components/PageHero.tsx` ukloniti:
- `bg-gradient-to-br from-primary/10 via-background to-accent/5` overlay,
- dva dekorativna blob diva (`bg-primary/10 blur-3xl` i `bg-accent/10 blur-3xl`).

Hero će zadržati samo padding i sadržaj (naslov + opis + opcioni breadcrumbs), bez vlastite pozadine — naslijediće `bg-background` od stranice. Time se ujednačava prelaz iz hero-a u sadržaj.

`backgroundImage` prop ostaje funkcionalan za stranice koje ga koriste (trenutno nijedna ne koristi).

## Validacija

- Sve top-level stranice (`/usluge`, `/cjenovnik-usluga`, `/o-nama`, `/kontakt`, `/blog`, `/petshop`, `/zakazivanje`) imaju identičan hero stil: isti veliki naslov, isti padding, ista (jednolična) pozadina.
- Nema vidljive linije ili promjene boje između hero-a i sadržaja ispod.
