## Cilj

Ukloniti redundantne breadcrumbs sa svih top-level stranica (jedan nivo dubine). Zadržati ih samo gdje sajt ima stvarnu hijerarhiju.

## Promjene

Ukloniti `breadcrumbs` prop iz `PageHero` poziva u:

- `src/pages/ServicesPage.tsx`
- `src/pages/PriceListPage.tsx` (ukloniti i lokalnu `breadcrumbs` konstantu)
- `src/pages/AppointmentPage.tsx` (ukloniti i lokalnu `breadcrumbs` konstantu)
- `src/pages/AboutPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/BlogPage.tsx`
- `src/pages/PetShopPage.tsx`

## Zadržati breadcrumbs na

- `src/pages/ServiceDetailsPage.tsx` — `Usluge › [Naziv usluge]` (stvarna hijerarhija).
- (Buduće) detalji bloga kada se dodaju.

## Dodatno

`PageHero` komponenta ostaje nepromijenjena — `breadcrumbs` prop ostaje opcioni i koristi se na detaljnim stranicama.

## Validacija

Sve top-level stranice (`/usluge`, `/cjenovnik-usluga`, `/zakazivanje`, `/o-nama`, `/kontakt`, `/blog`, `/petshop`) prikazuju samo H1 + opis u herou. Detalj usluge i dalje prikazuje breadcrumb.
