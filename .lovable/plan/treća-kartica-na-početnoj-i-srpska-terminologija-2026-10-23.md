# Treća kartica na početnoj i srpska terminologija

## 1. Treća kartica na početnoj stranici
Ispod dugmadi na vrhu biće 3 kartice:
1. **15+** – Godina iskustva
2. **5000+** – Srećnih ljubimaca
3. **Novo: 2016.** – Na istoj adresi (iz tvog teksta: ambulanta radi od 2016. na istoj adresi)

Nova kartica izgleda isto kao postojeće. Tekst je na srpskom, engleskom i njemačkom. Na telefonu sve tri stoje u jednom redu.

## 2. Srpske riječi umjesto hrvatskih i bosanskih
Pregled svih tekstova na sajtu i u admin panelu (ijekavica ostaje). Pronađeno do sada:
- „Certificirani“ → „Sertifikovani“
- „Sretnih“ → „Srećnih“
- „Specijalizirane usluge“ → „Specijalizovane usluge“
- „Finaliziraj / finaliziran“ → „Finalizuj / finalizovan“ (admin, dokumenti)
- Sve ostale riječi sa nastavcima „-izirati / -iziran“ → „-izovati / -izovan“
- Prije izmjene još jednom ću proći kroz sve tekstove, uključujući opise usluga i blogove u bazi, da nađem i druge riječi poput „tjedan“, „tisuća“, „točno“, „tko“, „obitelj“, „liječnik“ itd.

Pravilo „samo srpske riječi“ zapisaću da važi i za sve buduće tekstove.

## Tehnički detalji
- `Hero.tsx`: treći stat (ikona MapPin), raspored u 3 kolone; i18n ključ `hero.sameAddress`.
- `sr.json` + srpski stringovi u komponentama (admin stranice, `categoryIcons.ts`); provjera `services`, `service_categories` i `blog_posts` u bazi i ispravka kroz UPDATE podataka.
- Memorija: dodati pravilo o srpskoj leksici (ekavski oblici riječi ne, ijekavica da; srpske varijante riječi).
