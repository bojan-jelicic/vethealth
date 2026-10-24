# Slika na početnoj i na telefonu i tabletu

## Prijedlog
- **Telefon:** oznaku „Brižna njega za vaše ljubimce“ zamijeniti fotografijom (Vladimir sa španijelom) u zaobljenom pravougaoniku širine cijelog ekrana, odmah ispod menija, visine oko 260px. Oznaka se na telefonu sakriva, a ostaje na računaru. Ispod slike slijede naslov, tekst, dugme i tri kartice sa brojkama.
- **Tablet:** ista fotografija, ali veća (oko 360px visine), uz zadržanu oznaku iznad naslova jer tu ima mjesta.
- **Računar:** ostaje sve kao sada (okrugla slika desno sa plutajućim karticama).
- Smanjiti razmak iznad sadržaja na telefonu da slika bude odmah ispod menija, bez praznog prostora.
- Na slici na telefonu/tabletu jedna mala kartica „Sertifikovani veterinari“ u donjem uglu, da izgled bude u skladu sa računarom.

## Tehnički detalji
- `Hero.tsx`: novi blok `lg:hidden` iznad naslova sa `<img>` (`aspect`/`h-64 md:h-[360px]`, `rounded-card`, `object-cover`, `object-[45%_center]`, `loading="eager"`), oznaka dobija `hidden md:inline-flex`.
- Gornji razmak: `pt-28 md:pt-40 lg:pt-48`.
- Provjera u pregledu na 390px, 820px i 1450px širine.
