
## Zamjena loga u Header meniju

Zamijenit cu trenutni logo (ikona sape sa tekstom) sa uploadovanim VetHealth logom.

### Koraci:

1. **Kopiranje slike** -- Kopiram uploadovanu sliku `vethealth-logo.png` u `src/assets/` folder
2. **Izmjena Header komponente** -- U `src/components/Header.tsx`:
   - Importujem sliku kao ES6 modul: `import vethealthLogo from "@/assets/vethealth-logo.png"`
   - Zamijenim trenutni logo blok (kruzni div sa PawPrint ikonom + tekst "VetHealth" / "Veterinarska Ordinacija") sa `<img>` tagom koji prikazuje novi logo
   - Uklanjam nekoristeni `PawPrint` import iz lucide-react
   - Logo ce imati odgovarajucu velicinu (npr. h-12 md:h-14) i alt text za pristupacnost
