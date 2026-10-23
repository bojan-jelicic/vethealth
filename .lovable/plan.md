# Ubacivanje tekstova iz dokumenta na sajt

## 1. Stranica „O nama“
- **Naša priča**: naslov „Veterinarska ambulanta VetHealth Banjaluka“ + 4 pasusa iz dokumenta (umjesto 3 sadašnja).
- **Naše vrijednosti**: novi uvodni pasus + 6 stavki (✓) iz dokumenta.
- **Radno vrijeme**: Pon–Pet 09:00–19:00, Subota 09:00–14:00, Nedjelja „Ne radimo“. Vrijednosti se čitaju iz Postavki (admin), a podrazumijevane se mijenjaju na nove. Isto se ažurira i na Kontakt stranici.
- **Tim**: umjesto 4 izmišljene osobe prikazuju se 2 prave: Vladimir Ilić, DVM (Veterinar) i Nemanja Dragišić (Veterinarski tehničar | Student Poljoprivrednog fakulteta), sa punim biografijama u većoj kartici (slika + tekst), jer su tekstovi duži.
- **Statistika**: „15+ godina iskustva“ mijenja se u „od 2016.“ (10 godina) da bude u skladu s tekstom.

## 2. Početna – sekcija „O nama“
Kratka verzija istog teksta (prva 2 pasusa) i 6 vrijednosti umjesto sadašnjih stavki, ista statistika.

## 3. Usluge / cjenovnik (podaci u bazi)
- Napomena o cijenama u KM — tekst iz dokumenta.
- Kategorije dobijaju opise iz dokumenta: Pregledi i dijagnostika, Vakcinacije, Hirurgija, Stomatologija, Laboratorija, Ostalo/Preventiva.
- Za usluge: Opšti i specijalistički pregled, Vakcinacija pasa i mačaka, Hirurgija, Stomatologija, Laboratorijske analize, Preventiva, Ultrazvučna dijagnostika — upisuje se uvodni opis (strana detalja postaje dostupna). Postojeće cijene se ne diraju; nove usluge bez cijene (ako ne postoje) dodaju se kao „na upit“.

## 4. Prevodi
Svi novi tekstovi na sajtu prevode se na engleski i njemački. Opisi usluga u bazi ostaju samo na srpskom (sistem trenutno nema prevod za njih).

## 5. Ispravljene štamparske greške
- „Nasa prica“ → „Naša priča“; „macaka“ → „mačaka“; „mikrocipovanje“ → „mikročipovanje“
- „posebno pažnju posvećuje“ → „posebnu pažnju posvećuje“
- „mikrobiološka dijagnostika,antibiogram“ → dodat razmak; „Analize-dijagnostika“ → „Laboratorijske analize i dijagnostika“
- „Radno Vrijeme“, „Naše Vrijednosti“ → jedinstveno pisanje („Radno vrijeme“, „Naše vrijednosti“)
- „tehnicar“ → „tehničar“

## 6. Tekst koji nedostaje (tražim od tebe)
- **Hitni slučajevi 24/7**: sajt na više mjesta navodi hitnu pomoć 24/7 i broj +387 51 999 888 — da li to postoji? Ako ne, uklanjam.
- **Početna (hero)**: naslov i podnaslov na vrhu nisu u dokumentu.
- **Recenzije klijenata**: trenutno izmišljene — prave ili sakriti?
- **Česta pitanja**: 5 izmišljenih pitanja — trebaju prava pitanja/odgovori.
- **Kontakt**: tačna adresa, telefon, email (unose se u admin Postavke).
- **Statistika**: broj klijenata/liječenih životinja (5000+, 10000+) je izmišljen.
- **Fotografije**: veterinara, tehničara i ambulante (sada su stock slike).
- **Detalji usluga**: Hirurgija i Preventiva imaju samo jednu rečenicu — korisno bi bilo više teksta.
- **Footer**: kratki opis ambulante.

Do tvog odgovora, privremeni tekstovi ostaju kako jesu.

## Tehnički detalji
- Izmjene: `AboutPage.tsx`, `About.tsx`, `ContactPage.tsx` (podrazumijevano radno vrijeme), `sr/en/de.json`.
- Tim kao lokalni niz sa i18n ključevima.
- Opisi kategorija/usluga upisuju se u `service_categories.description` i `services.description`/`intro` putem SQL update-a (podaci, ne šema); slug se generiše tamo gdje fali.
