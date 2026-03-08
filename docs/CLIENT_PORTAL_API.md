# Client Portal — API Endpoints Plan

## Overview
The Client Portal allows pet owners to log in and view their own data (pets, visits, documents). All access is scoped via the `client` role and RLS policies that match `auth.users.email` → `clients.email`.

## Database Role
- `app_role = 'client'` — assigned in `user_roles` table
- `get_client_id_for_user(uuid)` — security definer function that resolves `auth.users.email` → `clients.id`

## RLS Policies (implemented)
| Table | Policy | Scope |
|---|---|---|
| `clients` | `Clients can view own record` | `id = get_client_id_for_user(auth.uid())` |
| `pets` | `Clients can view own pets` | `owner_id = get_client_id_for_user(auth.uid())` |
| `visits` | `Clients can view own visits` | `owner_id = get_client_id_for_user(auth.uid())` |
| `visit_documents` | `Clients can view own visit documents` | `visit_id IN (SELECT id FROM visits WHERE owner_id = ...)` |

## API Endpoints Needed (Supabase JS SDK)

### 1. GET /portal/profile
```ts
// Fetch client's own profile
supabase.from('clients').select('*').single();
// RLS ensures only own record is returned
```

### 2. GET /portal/pets
```ts
// Fetch client's pets
supabase.from('pets').select('*').eq('is_active', true).order('name');
// RLS scopes to owner_id automatically
```

### 3. GET /portal/pets/:id
```ts
// Fetch single pet detail
supabase.from('pets').select('*').eq('id', petId).single();
// RLS prevents access to other clients' pets
```

### 4. GET /portal/visits
```ts
// Fetch visits with optional date range
supabase.from('visits')
  .select('*, pet:pets(name, species)')
  .order('date_time', { ascending: false })
  .limit(50);
```

### 5. GET /portal/visits/:id
```ts
// Fetch single visit with documents
supabase.from('visits')
  .select('*, pet:pets(*), visit_documents(*)')
  .eq('id', visitId)
  .single();
```

### 6. GET /portal/documents
```ts
// Fetch all documents across visits
supabase.from('visit_documents')
  .select('*, visit:visits(date_time, reason, pet:pets(name))')
  .order('created_at', { ascending: false });
```

### 7. POST /portal/appointments (future)
```ts
// Client can request an appointment (uses existing public appointments table)
supabase.from('appointments').insert({ ... });
```

## Onboarding Flow (future)
1. Admin creates a `clients` record with email
2. Admin invites user → creates `auth.users` entry + `user_roles(role='client')`
3. Client receives email, sets password, logs in at `/portal/login`
4. RLS matches `auth.users.email` → `clients.email` automatically

## Security Notes
- Clients have SELECT-only access; no INSERT/UPDATE/DELETE on clinical tables
- Email matching is done in a `SECURITY DEFINER` function to prevent RLS recursion
- Admin app routes remain restricted to `admin`/`vet` roles only
