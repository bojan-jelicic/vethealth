# Nove boje sajta prema novom logu

## Boje sa novog loga
- Tamnoplava (glavna boja loga): oko #2F5FA8
- Svijetloplava (druga boja loga): oko #86B6E4
- Trenutni sajt koristi zelenu (teal #008080) i žutu (#FFC300) — zelena se mijenja u plavu.

## Nova paleta
| Uloga | Boja | Gdje se vidi |
|---|---|---|
| Glavna | Tamnoplava #2B5AA0 | dugmad, linkovi, gornja traka, naslovi, ikonice |
| Glavna tamnija (hover) | #1F4680 | dugme kad se pređe mišem, aktivni meni |
| Svijetloplava | #86B6E4 | ukrasi, krugovi iza ikonica, linije, oznake |
| Blijedoplava podloga | #EEF4FB | pozadine sekcija, kartice, oznaka „Brižna njega…“ |
| Akcent (dugme „Kontakt“, „Zdravlju“) | Topla žuta #F5B82E (malo smirenija od sadašnje) | jedan istaknut poziv na akciju po ekranu |
| Tekst | tamni plavo-sivi #1E2A3A | sav tekst (bolje se slaže sa plavom od čisto sive) |
| Sporedni tekst | #5B6B7F | podnaslovi, opisi |
| Pozadina | #F7F9FC (blago hladna bijela) | cijeli sajt |
| Linije/okviri | #DCE4EE | kartice, polja forme |
| Uspjeh / greška | ostaju zelena i crvena | poruke forme |

Žuta ostaje kao akcent jer je komplementarna plavoj i daje toplinu veterinarskom sajtu; koristi se štedljivo (samo glavno dugme i jedna istaknuta riječ).

## Usklađivanje po dijelovima sajta
1. **Gornja traka** — tamnoplava pozadina, bijeli tekst; ikonice svijetloplave.
2. **Meni (header)** — aktivna stavka i hover u tamnoplavoj; dugme „Kontakt“ žuto sa tamnim tekstom; hamburger meni na telefonu sa blijedoplavim podlogama stavki.
3. **Početna (slika na vrhu)** — riječ „Zdravlju“ tamnoplava na telefonu/tabletu (žuta na računaru ostaje samo ako je čitljiva, inače plava); krugovi iza brojki: jedan plavi, jedan žuti; prelazi slike u bijelo prate novu hladnu bijelu pozadinu.
4. **Naše usluge** — ikonice u blijedoplavim krugovima, hover kartice sa plavim okvirom i blagom plavom sjenom.
5. **O nama / tim / vrijednosti** — oznake i ikonice plave; brojke (10 godina, 2016.) u tamnoplavoj.
6. **Utisci** — krugovi sa inicijalima u blijedoplavoj sa tamnoplavim slovima; zvjezdice ostaju žute.
7. **Blog** — oznake datuma i „Pročitaj više“ u plavoj; polje za pretragu sa plavim okvirom kad je aktivno.
8. **FAQ** — otvoreno pitanje sa plavom strelicom i blijedoplavom podlogom.
9. **Kontakt** — forma: plavi okvir aktivnog polja, plavo dugme „Pošalji“; ikonice kontakta u plavim krugovima.
10. **Podnožje** — tamna plava pozadina (#16304F), bijeli tekst, linkovi svijetloplavi na hover.
11. **Admin (kad se uključi)** — isti plavi tonovi, automatski.

## Pristupačnost i provjera
- Svi parovi teksta i pozadine provjereni na kontrast (min. 4.5:1); svijetloplava se ne koristi za tekst na bijelom.
- Fokus okvir (tastatura) u plavoj.
- Pregled svake stranice na računaru, tabletu i telefonu sa snimcima ekrana.
- Ažurirati pamćenje projekta (paleta boja) da buduće izmjene koriste plavu.

## Tehnički detalji
- Izmjena samo dizajn tokena u `src/index.css` (`--primary`, `--secondary`, `--accent`, `--background`, `--foreground`, `--muted`, `--border`, `--ring`, `--sidebar-*`, sjene sa plavom nijansom) i dodati `--primary-hover`, `--primary-soft` u `tailwind.config.ts`.
- Pretraga komponenti za zakucane zelene/teal klase i ručne boje (`Hero.tsx`, `Footer.tsx`, `TopInfoBar.tsx`, `Testimonials.tsx`, `Services.tsx`) i prebacivanje na tokene.
- `PrintableDocument.tsx` (admin štampa, zelena #166534) prebaciti na plavu radi dosljednosti.
- `theme-color` meta u `index.html` na tamnoplavu.
