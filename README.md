# Lovable Stack Essentials

# Struktura projekta - Lovable Default Stack

## Tehnologije

### Frontend (Lovable uređuje)
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui komponente
- React Router v6 (routing)
- TanStack React Query (server state)
- Lucide React (ikone)
- Zod (validacija)
- React Hook Form (forme)

### Backend (Lovable Cloud / Supabase)
- Supabase PostgreSQL baza podataka
- Supabase Auth (autentifikacija)
- Supabase Edge Functions (serverless funkcije)
- Supabase Storage (skladištenje fajlova)
- Row Level Security (RLS) za zaštitu podataka

## Struktura foldera

```
src/
├── components/          # React komponente
│   ├── ui/             # shadcn/ui komponente
│   └── ...             # Custom komponente
├── pages/              # Stranice aplikacije
├── hooks/              # Custom React hooks
├── lib/                # Utility funkcije
├── integrations/       # Supabase klijent i tipovi
└── types/              # TypeScript tipovi
```

## Napomene za Lovable

1. Koristi Supabase za sve backend funkcionalnosti
2. Implementiraj RLS politike za zaštitu podataka
3. Koristi Edge Functions za kompleksnu logiku
4. Autentifikaciju implementiraj preko Supabase Auth
5. Za state management koristi TanStack Query
6. Sve forme implementiraj sa React Hook Form + Zod validacijom

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vethealth.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/127a9c8d-2b8a-4894-ba04-4bc3e8cacbbb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
