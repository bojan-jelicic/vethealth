# Prave fotografije ambulante na sajtu

Svih 7 fotografija zamjenjuje probne slike na javnom sajtu. Svaka slika se koristi tamo gdje joj je sadržaj najprirodniji.

## Raspored

| Fotografija | Gdje ide |
|---|---|
| Vladimir se smije, pregleda koker španijela (široka) | Početna, glavna slika na vrhu |
| Vladimir pregleda francuskog buldoga | O nama, kartica tima: Vladimir Ilić |
| Nemanja s pipetom (uspravna) | O nama, kartica tima: Nemanja Dragišić |
| Bigl ulazi na vrata ambulante | Početna, sekcija "O nama" (mozaik) + O nama "Naša priča" |
| Koker španijel izbliza, pregled uha | Početna, sekcija "O nama" (mozaik) |
| Rad s pipetom i centrifugom (laboratorija) | Početna, sekcija "O nama" (mozaik) + O nama "Naša priča" |
| Petrijeve posude (mikrobiologija) | Početna, sekcija "O nama" (mozaik) |

- Početna "O nama" mozaik: 4 slike (bigl, španijel izbliza, laboratorija, petrijeve posude); fotografija Vladimira sa španijelom ostaje samo gore da se ne ponavlja.
- O nama "Naša priča": 2 slike (bigl na ulazu, laboratorija).
- Kadriranje se podešava po slici tako da lica i životinje uvijek ostanu u kadru (npr. Nemanjino lice na kvadratnoj kartici, glava psa na vrhu).
- Svaka slika dobija tačan opis (alt) na SR/EN/DE.

## Šta ostaje probno
- Male slike u utiscima klijenata (avatari) ostaju dok ne dobijem prave ili ih ne uklonimo.

## Tehnički detalji
- Slike se postavljaju kao CDN assets (`lovable-assets create` iz `/mnt/user-uploads`), pointeri u `src/assets/photos/*.jpg.asset.json`.
- Izmjene: `Hero.tsx`, `About.tsx`, `AboutPage.tsx`; `object-position` po slici; `loading="lazy"` osim glavne slike.
- Provjera u pregledniku (desktop i mobilni) da su kadrovi dobri.
