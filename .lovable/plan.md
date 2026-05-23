## Cilj

Sekcija "Kompletna Veterinarska Njega" na početnoj stranici postaje čisto prezentaciona — 6 statičkih kartica kategorija sa ikonicom, naslovom i kratkim opisom. Bez "Saznaj više" linka i bez navigacije na klik.

## Izmjene

**`src/components/Services.tsx`**
- Ukloniti `Link` import i `ArrowRight` ikonu.
- Promijeniti `<Link to={...}>` u običan `<div>` (kartica više nije klikabilna, nema `cursor-pointer`).
- Ukloniti donji blok sa "Saznaj više" + strelicom (`<div className="flex items-center text-primary ...">`).
- Zadržati postojećih 6 hardkodovanih kategorija (`serviceKeys`) sa ikonicama: Opšti Pregledi, Vakcinacije, Hirurgija, Hitna Pomoć, Laboratorija, Stomatologija — već prate kategorije iz admina.
- Zadržati hover efekat na ikonici (boja pozadine) radi vizuelnog života, ali bez `group-hover` efekata vezanih za link.
- Zadržati naslov sekcije, podnaslov i donje dugme "Pogledaj Sve Usluge" koje vodi na cjenovnik (nepromijenjeno).

## Što NIJE u opsegu

- Nema povezivanja sa `service_categories` tabelom — ostaje hardkodovano kako je traženo.
- Nema izmjena prijevoda (`sr.json` itd.) — ključ `services.learnMore` ostaje neiskorišten ali nije problem.
- Nema izmjena na drugim stranicama.