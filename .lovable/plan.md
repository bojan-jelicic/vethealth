# Izmjene sajta prema dokumentu klijenta

## Gornja traka i podaci ordinacije
- Radno vrijeme u traci: pored radnih dana dodati i „Sub 09:00–14:00".
- Email ispraviti sa `veterinar@vethelth.ba` na `veterinar@vethealth.ba` (traka, podnožje, Kontakt, meni na telefonu — sve čita iz istog mjesta).

## Početna (gornji dio)
- Tekst ispod naslova: „VEThealth ambulanta pruža stručnu veterinarsku njegu u Banjaluci…" umjesto „VetHealth.ba pruža…" (SR/EN/DE).
- Sa fotografije ukloniti kartice „Sertifikovani veterinari" i „99% zadovoljnih klijenata" (računar, tablet, telefon).
- Brojke ispod: „10 godina iskustva" (umjesto 15+), „2016. – Na istoj adresi" sa klikom koji otvara ambulantu na Google mapama; „5000+ srećnih ljubimaca" izbaciti. Ostaju dvije kartice, lijepo raspoređene.
- Ukloniti i ostala pominjanja 5000+ i 15+ (O nama, opisi za Google).

## FAQ
- Zamijeniti/dodati dva pitanja tačno po tekstu klijenta: „Da li je potrebno zakazati termin?" i „Kojim životinjama pružate veterinarske usluge?" (ispravka: „kunićima, zečevima i pticama").
- Ukloniti pitanja o popustima i plaćanju na rate (i sve druge pomene popusta/rata na sajtu).

## Cjenovnik / Usluge
- Ukloniti napomenu „Cijene su izražene…".
- Ukloniti trajanje i cijene svuda na javnom sajtu: cjenovnik, kartice usluga, stranice pojedinačnih usluga, štampa. Podaci ostaju sačuvani u fajlu (za kasniji admin), samo se ne prikazuju.

## Kontakt
- Veliko „V": „tu smo za Vas i Vaše ljubimce", „odgovorićemo Vam u…".
- Tekst u polju za poruku: „Unesite Vaše pitanje ili zakažite termin".

## Podnožje
- „od 2009." → „od 2016." (SR/EN/DE); isto i u „Naša priča"/opisima gdje stoji 2009.
- Pojedinačne usluge u podnožju povezati na prave stranice usluga (sada sve osim jedne vode na „usluga nije pronađena").

## Utisci klijenata
- Zamijeniti probne recenzije sa 4 prave (puna imena): Ivana Mitrović Nešić, Borjana Tešnović, Sanja Rodić, Slavica Kejsy Božić — tekst ostaje kako su napisali, samo ispravljene štamparske greške (npr. „u život", „kako bi mogao"). Probne fotografije uklonjene, umjesto njih inicijali.

## Tehnički detalji
- Podaci u `src/data/content.json` (email, radno vrijeme), tekstovi u `src/i18n/{sr,en,de}.json`, komponente `Hero.tsx`, `TopInfoBar.tsx`, `Footer`, `Testimonials`, `FAQ`, `PriceListPage`, `ContactPage`.
- Footer linkovi generisati iz istih slugova koje koriste stranice usluga.
- Na kraju provjera u pregledu (telefon i računar) svih izmijenjenih stranica i pretraga za „vethelth", „2009", „5000", „99%", „popust", „rate".
