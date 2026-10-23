# Info traka iznad zaglavlja

Tanka traka na samom vrhu javnog sajta sa osnovnim podacima ordinacije. Podaci se uzimaju iz admin Postavki, pa se izmjena telefona ili adrese odmah vidi i ovdje.

## Sadržaj trake

Lijevo:
- Telefon (klik otvara poziv)
- Adresa (klik otvara Google Maps)
- Radno vrijeme danas, npr. „Pon–Pet 09–19“ (prikazuje se samo na većim ekranima)
- Email (prikazuje se samo na velikim ekranima)
- Instagram/Facebook ikone, samo ako su unesene u Postavkama

Desno:
- Izbor jezika (SR / EN / DE). Iz glavnog zaglavlja se uklanja, da ne bude na dva mjesta.

## Izgled

- Tamna teal pozadina (primarna boja sajta), svijetao tekst, ikone u amber (akcentnoj) boji.
- Visina oko 40px, sitniji font, iste ivice kao ostatak sadržaja.
- Na skrolovanje: traka odlazi gore, a glavno zaglavlje (logo + meni) ostaje zalijepljeno na vrhu.

## Telefon / mali ekrani

- Prikazuju se samo telefon (broj), ikona adrese, ikone društvenih mreža i jezik desno, kao na tvom primjeru.
- Radno vrijeme i email se skrivaju.

## Tehnički detalji

- Nova komponenta `src/components/TopInfoBar.tsx` (koristi `useClinicSettings`, `telLink`, `mapsLink`, `mailLink`).
- `Header.tsx`: uključuje traku iznad navigacije; header se pomjera sa `top-10` na `top-0` kada `scrollY > 40`; `LanguageSwitcher` se premješta u traku (dobija `variant` za tamnu pozadinu).
- Gornji razmak stranica (hero, PageHero) se povećava za visinu trake da sadržaj ne ode ispod.
- Samo javni sajt; admin ostaje nepromijenjen. Bez promjena u bazi.
