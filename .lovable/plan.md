## Problem

Prijava radi, ali svaka stranica u admin panelu prikazuje "Pristup odbijen". Mrežni pozivi pokazuju da `GET /user_roles?...` vraća **403** sa porukom:

```
permission denied for function has_role
```

## Uzrok

U ranijoj sigurnosnoj migraciji `EXECUTE` privilegija na funkciji `public.has_role(uuid, app_role)` je oduzeta i `PUBLIC` i `authenticated` ulozi. Tabela `user_roles` ima dvije SELECT politike koje se procjenjuju zajedno (OR):

1. `Users can view their own roles` — `auth.uid() = user_id`
2. `Admins can view all roles` — `has_role(auth.uid(), 'admin')`

Postgres prije evaluacije politika provjerava da pozivajuća uloga ima `EXECUTE` na svim funkcijama koje se pojavljuju u **bilo kojoj** politici tabele. Pošto `authenticated` više nema `EXECUTE` na `has_role`, cijeli SELECT pada sa 403, pa frontend ne dobije rolu i `ProtectedRoute` zaključi da korisnik nema ovlaštenja.

Isti problem će tihi pasti i na svim drugim tabelama čije politike koriste `has_role` (skoro sve admin tabele).

## Rješenje

Vratiti `EXECUTE` privilegije na `has_role` ulozi `authenticated` (i `anon`, pošto se koristi u politikama na javnim tabelama poput `appointments` INSERT putanje preko `authenticated` policy evaluacije). Sigurnost se ne narušava — funkcija samo provjerava postojanje reda u `user_roles` za prosljeđenog korisnika; ne otkriva podatke pozivaoca.

Plan migracije:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_client_id_for_user(uuid) TO authenticated;
```

Druga linija isto vraća pristup `get_client_id_for_user` jer se koristi u politikama `clients`, `pets`, `visits`, `visit_documents` i bi izazvala isti pad za bilo kog autentifikovanog korisnika koji čita te tabele (npr. budući klijentski portal).

## Validacija

1. Pokrenuti migraciju.
2. Osvježiti `/app/dashboard` — `user_roles` upit treba da vrati 200 sa `role: 'admin'` i dashboard se učitava.
3. Otvoriti `/app/audit-logs` (admin-only) i potvrditi da se zapisi prikazuju.
